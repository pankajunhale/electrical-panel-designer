import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { nanoid } from "nanoid";

interface RawEquipmentRow {
  slno: string;
  panelname: string;
  item: string;
  subqty: number;
  typecode: string;
  height: number;
  width: number;
}

interface ProcessedEquipment {
  serialNumber: number;
  panelName: string;
  description: string;
  quantity: number;
  typeCode: string;
  height: number;
  width: number;
  // Extracted specifications
  ratingKw?: number;
  ratingHp?: number;
  starterType?: string;
  breakerType?: string;
  feederType?: string;
  // Additional specifications for control equipment
  ampereRating?: number;
  voltageRating?: number;
  powerRating?: number;
  poleCount?: number;
  breakingCapacity?: number;
}

interface ImportResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  summary: {
    equipmentCreated: number;
    panelsCreated: number;
    typesCreated: {
      equipment: number;
      starter: number;
      breaker: number;
      feeder: number;
    };
    equipmentTypeBreakdown: {
      [equipmentType: string]: number;
    };
  };
}

export class PanelDataImportService {
  private static readonly TYPE_CODE_MAPPING = {
    ACB: "Air Circuit Breaker",
    SWITCH: "Control Equipment",
    STARTE: "Motor Starter",
    MCCB: "Molded Case Circuit Breaker",
    MPCB: "Motor Protection Circuit Breaker",
    TRANSFORMER: "Control Transformer",
    METERING: "Metering Equipment",
    POWER_SUPPLY: "Power Supply",
    CONTROL_SWITCH: "Control Switch",
  };

  private static readonly STARTER_PATTERNS = {
    DOL: "Direct Online Starter",
    RDOL: "Reversing Direct Online Starter",
    HDOL: "Heavy Duty Direct Online Starter",
    HRDOL: "Heavy Duty Reversing Direct Online Starter",
    "S/Delta": "Star Delta Starter",
    "S/D": "Star Delta Starter",
    "H S/D": "Heavy Duty Star Delta Starter",
    VFD: "Variable Frequency Drive",
  };

  private static readonly BREAKER_PATTERNS = {
    ACB: "Air Circuit Breaker",
    MCCB: "Molded Case Circuit Breaker",
    MPCB: "Motor Protection Circuit Breaker",
    MCB: "Miniature Circuit Breaker",
  };

  /**
   * Main import function - processes tabular data and imports into database
   */
  static async importPanelData(
    rawData: string,
    projectId: string
  ): Promise<ImportResult> {
    try {
      const user = await getCurrentUser();
      if (!user?.id) {
        throw new Error("Authentication required");
      }

      // Check existing equipment types
      console.log("=== Checking existing equipment types ===");
      const existingTypes = await prisma.equipmentType.findMany({
        select: { id: true, name: true, description: true },
      });
      console.log(
        "Existing equipment types:",
        existingTypes.map((t) => `${t.name} (${t.description})`)
      );

      // Parse the raw tabular data
      const rawRows = this.parseTabularData(rawData);
      console.log(`Parsed ${rawRows.length} raw rows from input data`);

      const processedData = this.processEquipmentData(rawRows);
      console.log(`Processed ${processedData.length} equipment items`);

      if (processedData.length === 0) {
        throw new Error("No valid data found to import");
      }

      // Group by panel for processing
      const panelGroups = this.groupByPanel(processedData);
      console.log(`Grouped into ${panelGroups.size} panels`);

      let equipmentCreated = 0;
      let panelsCreated = 0;
      let typesCreated = { equipment: 0, starter: 0, breaker: 0, feeder: 0 };
      const equipmentTypeBreakdown: { [equipmentType: string]: number } = {};
      const errors: string[] = [];

      // Process each panel group
      for (const [panelName, equipmentItems] of panelGroups) {
        try {
          // Step 1: Ensure project exists
          const project = await this.ensureProject(projectId, user.id);

          // Step 2: Create/find panel location (using default if not specified)
          const panelLocation = await this.ensurePanelLocation(
            "Default Location",
            user.id
          );

          // Step 3: Create/find panel
          const panel = await this.ensurePanel(
            panelName,
            project.record.id,
            panelLocation.record.id,
            user.id
          );
          if (panel.created) panelsCreated++;

          // Step 4: Process equipment items for this panel
          console.log(
            `Processing ${equipmentItems.length} equipment items for panel "${panelName}"`
          );

          // Ensure unique serial numbers for each equipment item
          let serialNumberCounter = 1;

          for (const equipment of equipmentItems) {
            // Assign unique serial number
            equipment.serialNumber = serialNumberCounter++;
            try {
              console.log(
                `Processing equipment: ${equipment.description} (Serial: ${equipment.serialNumber})`
              );

              // Create equipment type
              const equipmentType = await this.ensureEquipmentType(
                equipment.typeCode,
                equipment.description,
                user.id
              );
              if (equipmentType.created) typesCreated.equipment++;

              // Create starter type if found
              let starterType = null;
              if (equipment.starterType) {
                starterType = await this.ensureStarterType(
                  equipment.starterType,
                  user.id
                );
                if (starterType.created) typesCreated.starter++;
              }

              // Create breaker type if found
              let breakerType = null;
              if (equipment.breakerType) {
                breakerType = await this.ensureBreakerType(
                  equipment.breakerType,
                  user.id
                );
                if (breakerType.created) typesCreated.breaker++;
              }

              // Create feeder type if found
              let feederType = null;
              if (equipment.feederType) {
                feederType = await this.ensureFeederType(
                  equipment.feederType,
                  user.id
                );
                if (feederType.created) typesCreated.feeder++;
              }

              // Step 5: Create equipment data record
              console.log(
                `Creating equipment data for: ${equipment.description} (Type: ${equipmentType.record.name})`
              );
              const equipmentData = await this.createEquipmentData(
                panel.record.id,
                equipment,
                equipmentType.record.id,
                starterType?.record.id,
                user.id
              );
              console.log(
                `Created equipment data with ID: ${equipmentData.id}`
              );

              // Track equipment type breakdown
              const equipmentTypeName = equipmentType.record.name;
              equipmentTypeBreakdown[equipmentTypeName] =
                (equipmentTypeBreakdown[equipmentTypeName] || 0) + 1;

              // Step 6: Create feeder if it's motor equipment
              if (
                equipment.starterType &&
                (equipment.ratingKw || equipment.ratingHp)
              ) {
                console.log(`Creating feeder for: ${equipment.description}`);
                await this.createFeeder(
                  panel.record.id,
                  equipment,
                  starterType?.record.id,
                  feederType?.record.id,
                  breakerType?.record.id,
                  user.id
                );
              }

              equipmentCreated++;
              console.log(
                `Successfully processed equipment: ${equipment.description}`
              );
            } catch (itemError) {
              console.error(
                `Error processing "${equipment.description}":`,
                itemError
              );
              errors.push(
                `Error processing "${equipment.description}": ${itemError}`
              );
            }
          }
        } catch (panelError) {
          errors.push(`Error processing panel "${panelName}": ${panelError}`);
        }
      }

      // Log equipment type breakdown
      console.log("=== Equipment Type Breakdown ===");
      Object.entries(equipmentTypeBreakdown).forEach(([type, count]) => {
        console.log(`${type}: ${count} items`);
      });
      console.log("================================");

      return {
        success: equipmentCreated > 0,
        processed: equipmentCreated,
        failed: errors.length,
        errors: errors.slice(0, 10), // Limit error messages
        summary: {
          equipmentCreated,
          panelsCreated,
          typesCreated,
          equipmentTypeBreakdown,
        },
      };
    } catch (error) {
      console.error("Import error:", error);
      return {
        success: false,
        processed: 0,
        failed: 1,
        errors: [`Import failed: ${error}`],
        summary: {
          equipmentCreated: 0,
          panelsCreated: 0,
          typesCreated: { equipment: 0, starter: 0, breaker: 0, feeder: 0 },
          equipmentTypeBreakdown: {},
        },
      };
    }
  }

  /**
   * Parses raw tabular data into structured format
   */
  private static parseTabularData(rawData: string): RawEquipmentRow[] {
    const lines = rawData.trim().split("\n");
    console.log(`Raw data has ${lines.length} lines`);

    if (lines.length < 2) return [];

    const parsedRows = lines
      .slice(1)
      .map((line, index) => {
        const columns = line.split("\t").map((col) => col.trim());
        console.log(`Line ${index + 2}: ${columns.join(" | ")}`);

        const row = {
          slno: columns[0] || "",
          panelname: columns[1] || "",
          item: columns[2] || "",
          subqty: parseInt(columns[3]) || 1,
          typecode: columns[4] || "",
          height: parseInt(columns[5]) || 0,
          width: parseInt(columns[6]) || 0,
        };

        console.log(`Parsed row:`, row);
        return row;
      })
      .filter((row) => {
        const isValid = row.slno && row.panelname && row.item;
        if (!isValid) {
          console.log(`Filtered out invalid row:`, row);
        }
        return isValid;
      });

    console.log(`Parsed ${parsedRows.length} valid rows`);
    return parsedRows;
  }

  /**
   * Processes raw equipment data and extracts technical specifications
   */
  private static processEquipmentData(
    rawRows: RawEquipmentRow[]
  ): ProcessedEquipment[] {
    return rawRows.map((row) => {
      const processed: ProcessedEquipment = {
        serialNumber: parseInt(row.slno) || 1,
        panelName: row.panelname,
        description: row.item,
        quantity: row.subqty,
        typeCode: row.typecode,
        height: row.height,
        width: row.width,
      };

      // Extract technical specifications from description
      this.extractTechnicalSpecs(row.item, processed);

      return processed;
    });
  }

  /**
   * Extracts technical specifications from equipment description
   */
  private static extractTechnicalSpecs(
    description: string,
    equipment: ProcessedEquipment
  ): void {
    const upperDesc = description.toUpperCase();

    // Extract KW rating
    const kwMatch = description.match(/(\d+(?:\.\d+)?)KW/i);
    if (kwMatch) {
      equipment.ratingKw = parseFloat(kwMatch[1]);
    }

    // Extract HP rating
    const hpMatch = description.match(/(\d+(?:\.\d+)?)HP/i);
    if (hpMatch) {
      equipment.ratingHp = parseFloat(hpMatch[1]);
    }

    // Extract ampere rating
    const ampMatch = description.match(/(\d+(?:\.\d+)?)A/i);
    if (ampMatch) {
      equipment.ampereRating = parseFloat(ampMatch[1]);
    }

    // Extract voltage rating
    const voltMatch = description.match(/(\d+(?:\.\d+)?)V/i);
    if (voltMatch) {
      equipment.voltageRating = parseFloat(voltMatch[1]);
    }

    // Extract power rating (VA, W)
    const powerMatch = description.match(/(\d+(?:\.\d+)?)(?:VA|W)/i);
    if (powerMatch) {
      equipment.powerRating = parseFloat(powerMatch[1]);
    }

    // Extract pole count
    const poleMatch = description.match(/(\d+)P/i);
    if (poleMatch) {
      equipment.poleCount = parseInt(poleMatch[1]);
    }

    // Extract breaking capacity (KA)
    const kaMatch = description.match(/(\d+(?:\.\d+)?)KA/i);
    if (kaMatch) {
      equipment.breakingCapacity = parseFloat(kaMatch[1]);
    }

    // Extract starter type
    for (const [pattern, type] of Object.entries(this.STARTER_PATTERNS)) {
      if (upperDesc.includes(pattern)) {
        equipment.starterType = type;
        break;
      }
    }

    // Extract breaker type
    for (const [pattern, type] of Object.entries(this.BREAKER_PATTERNS)) {
      if (upperDesc.includes(pattern)) {
        equipment.breakerType = type;
        break;
      }
    }

    // Determine feeder type based on equipment
    if (upperDesc.includes("STARTER") || equipment.starterType) {
      equipment.feederType = "Motor Feeder";
    } else if (upperDesc.includes("LIGHTING") || upperDesc.includes("LIGHT")) {
      equipment.feederType = "Lighting Feeder";
    } else if (
      upperDesc.includes("CONTROL") ||
      upperDesc.includes("TRANSFORMER")
    ) {
      equipment.feederType = "Control Feeder";
    } else {
      equipment.feederType = "Power Feeder";
    }
  }

  /**
   * Groups equipment by panel name
   */
  private static groupByPanel(
    data: ProcessedEquipment[]
  ): Map<string, ProcessedEquipment[]> {
    const groups = new Map<string, ProcessedEquipment[]>();

    data.forEach((item) => {
      if (!groups.has(item.panelName)) {
        groups.set(item.panelName, []);
      }
      groups.get(item.panelName)!.push(item);
    });

    return groups;
  }

  /**
   * Database helper methods
   */
  private static async ensureProject(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    return { record: project, created: false };
  }

  private static async ensurePanelLocation(name: string, userId: string) {
    let location = await prisma.panelLocation.findFirst({
      where: { name },
    });

    let created = false;
    if (!location) {
      location = await prisma.panelLocation.create({
        data: {
          id: nanoid(),
          name,
          description: `Auto-created location: ${name}`,
          createdBy: userId,
          version: 1,
        },
      });
      created = true;
    }

    return { record: location, created };
  }

  private static async ensurePanel(
    name: string,
    projectId: string,
    locationId: string,
    userId: string
  ) {
    let panel = await prisma.panel.findFirst({
      where: { name, projectId },
    });

    let created = false;
    if (!panel) {
      panel = await prisma.panel.create({
        data: {
          id: nanoid(),
          projectId,
          name,
          description: `Auto-created panel: ${name}`,
          locationId,
          status: "draft",
          createdBy: userId,
          version: 1,
        },
      });
      created = true;
    }

    return { record: panel, created };
  }

  private static async ensureEquipmentType(
    typeCode: string,
    description: string,
    userId: string
  ) {
    // Determine equipment type based on description and type code
    const typeName = this.getEquipmentTypeName(description, typeCode);

    console.log(
      `Looking for equipment type: "${typeName}" (from code: "${typeCode}", description: "${description}")`
    );

    let equipmentType = await prisma.equipmentType.findFirst({
      where: { name: typeName },
    });

    let created = false;
    if (!equipmentType) {
      console.log(`Creating new equipment type: "${typeName}"`);
      equipmentType = await prisma.equipmentType.create({
        data: {
          id: nanoid(),
          name: typeName,
          description: `Equipment type for ${typeCode}`,
          createdBy: userId,
          version: 1,
        },
      });
      created = true;
    } else {
      console.log(
        `Found existing equipment type: "${typeName}" with ID: ${equipmentType.id}`
      );
    }

    return { record: equipmentType, created };
  }

  /**
   * Determines equipment type name based on description and type code
   */
  private static getEquipmentTypeName(
    description: string,
    typeCode: string
  ): string {
    const upperDesc = description.toUpperCase();

    console.log(
      `Analyzing equipment: "${description}" with type code: "${typeCode}"`
    );

    // Specific equipment type detection based on description
    if (upperDesc.includes("TRANSFORMER")) {
      console.log(`  → Detected as Control Transformer`);
      return "Control Transformer";
    }
    if (upperDesc.includes("METERING") || upperDesc.includes("AM/VM/IL")) {
      console.log(`  → Detected as Metering Equipment`);
      return "Metering Equipment";
    }
    if (upperDesc.includes("POWER SUPPLY") || upperDesc.includes("DC")) {
      console.log(`  → Detected as Power Supply`);
      return "Power Supply";
    }
    if (upperDesc.includes("SWITCH") && !upperDesc.includes("STARTER")) {
      console.log(`  → Detected as Control Switch`);
      return "Control Switch";
    }
    if (upperDesc.includes("ACB")) {
      console.log(`  → Detected as Air Circuit Breaker`);
      return "Air Circuit Breaker";
    }
    if (upperDesc.includes("MCCB")) {
      console.log(`  → Detected as Molded Case Circuit Breaker`);
      return "Molded Case Circuit Breaker";
    }
    if (upperDesc.includes("MPCB")) {
      console.log(`  → Detected as Motor Protection Circuit Breaker`);
      return "Motor Protection Circuit Breaker";
    }

    // Fallback to type code mapping
    const fallbackType =
      this.TYPE_CODE_MAPPING[typeCode as keyof typeof this.TYPE_CODE_MAPPING] ||
      typeCode;
    console.log(`  → Fallback to: ${fallbackType}`);
    return fallbackType;
  }

  private static async ensureStarterType(starterType: string, userId: string) {
    let starter = await prisma.starterType.findFirst({
      where: { name: starterType },
    });

    let created = false;
    if (!starter) {
      starter = await prisma.starterType.create({
        data: {
          id: nanoid(),
          name: starterType,
          createdBy: userId,
          version: 1,
        },
      });
      created = true;
    }

    return { record: starter, created };
  }

  private static async ensureBreakerType(breakerType: string, userId: string) {
    let breaker = await prisma.breakerType.findFirst({
      where: { name: breakerType },
    });

    let created = false;
    if (!breaker) {
      breaker = await prisma.breakerType.create({
        data: {
          id: nanoid(),
          name: breakerType,
          createdBy: userId,
          version: 1,
        },
      });
      created = true;
    }

    return { record: breaker, created };
  }

  private static async ensureFeederType(feederType: string, userId: string) {
    let feeder = await prisma.feederType.findFirst({
      where: { name: feederType },
    });

    let created = false;
    if (!feeder) {
      feeder = await prisma.feederType.create({
        data: {
          id: nanoid(),
          name: feederType,
          createdBy: userId,
          version: 1,
        },
      });
      created = true;
    }

    return { record: feeder, created };
  }

  private static async createEquipmentData(
    panelId: string,
    equipment: ProcessedEquipment,
    equipmentTypeId: string,
    starterTypeId: string | undefined,
    userId: string
  ) {
    // Calculate total load KW
    const totalLoadKw = equipment.ratingKw
      ? equipment.ratingKw * equipment.quantity
      : null;

    // Calculate total power rating for control equipment
    const totalPowerRating = equipment.powerRating
      ? equipment.powerRating * equipment.quantity
      : null;

    return await prisma.equipmentData.upsert({
      where: {
        panelId_serialNumber: {
          panelId,
          serialNumber: equipment.serialNumber,
        },
      },
      update: {
        description: equipment.description,
        quantity: equipment.quantity,
        ratingKw: equipment.ratingKw || null,
        ratingHp: equipment.ratingHp || null,
        totalLoadKw,
        height: equipment.height || null,
        width: equipment.width || null,
        equipmentTypeId,
        starterTypeId: starterTypeId || null,
        updatedBy: userId,
        version: { increment: 1 },
      },
      create: {
        id: nanoid(),
        panelId,
        serialNumber: equipment.serialNumber,
        description: equipment.description,
        quantity: equipment.quantity,
        ratingKw: equipment.ratingKw || null,
        ratingHp: equipment.ratingHp || null,
        totalLoadKw,
        height: equipment.height || null,
        width: equipment.width || null,
        equipmentTypeId,
        starterTypeId: starterTypeId || null,
        createdBy: userId,
        version: 1,
      },
    });
  }

  private static async createFeeder(
    panelId: string,
    equipment: ProcessedEquipment,
    starterTypeId: string | undefined,
    feederTypeId: string | undefined,
    breakerTypeId: string | undefined,
    userId: string
  ) {
    // Check if feeder already exists for this panel and description
    const existingFeeder = await prisma.feeder.findFirst({
      where: {
        panelId,
        description: equipment.description,
      },
    });

    if (existingFeeder) {
      // Update existing feeder
      return await prisma.feeder.update({
        where: { id: existingFeeder.id },
        data: {
          ratingKw: equipment.ratingKw || null,
          ratingHp: equipment.ratingHp || null,
          quantity: equipment.quantity,
          starterTypeId: starterTypeId || null,
          feederTypeId: feederTypeId || null,
          breakerTypeId: breakerTypeId || null,
          updatedBy: userId,
          version: { increment: 1 },
        },
      });
    } else {
      // Create new feeder
      return await prisma.feeder.create({
        data: {
          id: nanoid(),
          panelId,
          description: equipment.description,
          ratingKw: equipment.ratingKw || null,
          ratingHp: equipment.ratingHp || null,
          quantity: equipment.quantity,
          starterTypeId: starterTypeId || null,
          feederTypeId: feederTypeId || null,
          breakerTypeId: breakerTypeId || null,
          createdBy: userId,
          version: 1,
        },
      });
    }
  }
}
