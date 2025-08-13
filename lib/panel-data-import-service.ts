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
  // Feeder/Contactor Rating Information
  incomerRating?: number;
  contactorRating?: number;
  controlOperation?: string;
  wiringMaterial?: string;
  cablesBusBars?: string;
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

      // Calculate total expected feeders across all panels
      let totalExpectedFeeders = 0;
      for (const [, equipmentItems] of panelGroups) {
        for (const equipment of equipmentItems) {
          if (
            equipment.starterType &&
            (equipment.ratingKw || equipment.ratingHp)
          ) {
            totalExpectedFeeders += equipment.quantity || 1;
          }
        }
      }
      console.log(
        `Total expected feeders across all panels: ${totalExpectedFeeders}`
      );

      // Track total created feeders
      let totalCreatedFeeders = 0;

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
          // TBD: main for loop
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

              // Step 6: Create feeders if it's motor equipment
              if (
                equipment.starterType &&
                (equipment.ratingKw || equipment.ratingHp)
              ) {
                console.log(
                  `Creating ${equipment.quantity || 1} feeder(s) for: ${
                    equipment.description
                  }`
                );
                const feeders = await this.createFeeder(
                  panel.record.id,
                  equipment,
                  starterType?.record.id,
                  feederType?.record.id,
                  breakerType?.record.id,
                  user.id,
                  totalCreatedFeeders,
                  totalExpectedFeeders
                );
                totalCreatedFeeders += feeders.length;
                console.log(`Created ${feeders.length} feeder(s)`);
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

    // Extract feeder/contactor rating information based on power rating
    this.extractFeederContactorRatings(equipment);
  }

  /**
   * Extracts feeder/contactor rating information based on power rating
   * This method calculates typical incomer and contactor ratings based on motor power
   */
  private static extractFeederContactorRatings(
    equipment: ProcessedEquipment
  ): void {
    // Default values for control operation and wiring
    equipment.controlOperation = "Run Local+Rem";
    equipment.wiringMaterial = "Copper";
    equipment.cablesBusBars = "Cable";

    // Calculate incomer and contactor ratings based on power rating
    if (equipment.ratingKw) {
      // Calculate incomer rating based on power (typical motor current calculation)
      // For 3-phase motors: I = P / (√3 × V × PF × η)
      // Assuming 415V, 0.85 PF, 0.9 efficiency
      const voltage = 415; // 3-phase voltage
      const powerFactor = 0.85;
      const efficiency = 0.9;
      const incomerCurrent =
        (equipment.ratingKw * 1000) /
        (Math.sqrt(3) * voltage * powerFactor * efficiency);

      // Round to nearest standard rating
      equipment.incomerRating = this.roundToStandardRating(incomerCurrent);

      // Contactor rating is typically 1.25 times the motor full load current
      const contactorCurrent = incomerCurrent * 1.25;
      equipment.contactorRating = this.roundToStandardRating(contactorCurrent);
    } else if (equipment.ratingHp) {
      // Convert HP to KW for calculation
      const kwRating = equipment.ratingHp * 0.746;
      equipment.ratingKw = kwRating;

      // Calculate ratings using the same method
      const voltage = 415;
      const powerFactor = 0.85;
      const efficiency = 0.9;
      const incomerCurrent =
        (kwRating * 1000) / (Math.sqrt(3) * voltage * powerFactor * efficiency);

      equipment.incomerRating = this.roundToStandardRating(incomerCurrent);

      const contactorCurrent = incomerCurrent * 1.25;
      equipment.contactorRating = this.roundToStandardRating(contactorCurrent);
    }
  }

  /**
   * Rounds current rating to nearest standard rating
   */
  private static roundToStandardRating(current: number): number {
    const standardRatings = [
      9, 12, 16, 18, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400,
      500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000,
    ];

    // Find the closest standard rating
    let closest = standardRatings[0];
    let minDifference = Math.abs(current - closest);

    for (const rating of standardRatings) {
      const difference = Math.abs(current - rating);
      if (difference < minDifference) {
        minDifference = difference;
        closest = rating;
      }
    }

    return closest;
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
        ampereRating: equipment.ampereRating || null,
        voltageRating: equipment.voltageRating || null,
        powerRating: equipment.powerRating || null,
        poleCount: equipment.poleCount || null,
        breakingCapacity: equipment.breakingCapacity || null,
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
        ampereRating: equipment.ampereRating || null,
        voltageRating: equipment.voltageRating || null,
        powerRating: equipment.powerRating || null,
        poleCount: equipment.poleCount || null,
        breakingCapacity: equipment.breakingCapacity || null,
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
    userId: string,
    totalCreatedFeeders: number,
    totalExpectedFeeders: number
  ) {
    // Step 1: Remove all existing feeders and their layouts for this panel to prevent duplicates
    if (totalCreatedFeeders === 0) {
      console.log(
        `Removing all existing feeders and layouts for panel ${panelId}`
      );

      // Delete feeder layouts first (due to foreign key constraint)
      await prisma.feederLayout.deleteMany({
        where: {
          feeder: {
            panelId: panelId,
          },
        },
      });
      console.log(`Removed all existing feeder layouts for panel ${panelId}`);

      // Delete feeders
      await prisma.feeder.deleteMany({
        where: {
          panelId: panelId,
        },
      });
      console.log(`Removed all existing feeders for panel ${panelId}`);
    }

    // Step 2: Create new feeders based on the quantity, but respect total limit
    const quantity = equipment.quantity || 1;
    const feeders: any[] = [];

    // Calculate how many feeders we can still create
    const remainingSlots = totalExpectedFeeders - totalCreatedFeeders;
    const actualQuantity = Math.min(quantity, remainingSlots);

    if (actualQuantity === 0) {
      console.log(
        `Skipping feeder creation for ${equipment.description} - limit reached`
      );
      return feeders;
    }

    console.log(
      `Creating ${actualQuantity}/${quantity} feeders for equipment: ${equipment.description} (${remainingSlots} slots remaining)`
    );

    for (let i = 0; i < actualQuantity; i++) {
      try {
        const feeder = await prisma.feeder.create({
          data: {
            id: nanoid(),
            panelId,
            description: equipment.description,
            ratingKw: equipment.ratingKw || null,
            ratingHp: equipment.ratingHp || null,
            incomerRating: equipment.incomerRating || null,
            contactorRating: equipment.contactorRating || null,
            controlOperation: equipment.controlOperation || null,
            wiringMaterial: equipment.wiringMaterial || null,
            cablesBusBars: equipment.cablesBusBars || null,
            height: equipment.height || null, // Height in mm
            width: equipment.width || null, // Width in mm
            quantity: 1,
            starterTypeId: starterTypeId || null,
            feederTypeId: feederTypeId || null,
            breakerTypeId: breakerTypeId || null,
            createdBy: userId,
            version: 1,
          },
        });
        feeders.push(feeder);
        console.log(
          `Created feeder ${i + 1}/${actualQuantity}: Feeder No ${
            totalCreatedFeeders + i + 1
          }`
        );
      } catch (error) {
        console.error(`Error creating feeder ${i + 1}:`, error);
        throw error;
      }
    }

    console.log(`Successfully created ${feeders.length} feeders`);

    // Create feeder layouts for each newly created feeder
    for (const feeder of feeders) {
      await this.createFeederLayout(feeder, userId);
    }

    return feeders;
  }

  /**
   * Create a feeder layout for the given feeder
   * This will be used for gridstack.js rendering
   */
  private static async createFeederLayout(
    feeder: any,
    userId: string
  ): Promise<void> {
    try {
      // Check if feeder layout already exists
      const existingLayout = await prisma.feederLayout.findFirst({
        where: {
          feederId: feeder.id,
          deletedAt: null,
        },
      });

      if (existingLayout) {
        console.log(`Feeder layout already exists for feeder ${feeder.id}`);
        return;
      }

      // Get all existing feeders for this panel to calculate positioning
      const panelFeeders = await prisma.feeder.findMany({
        where: {
          panelId: feeder.panelId,
          deletedAt: null,
        },
        include: {
          feederLayouts: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1, // Get the latest layout
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Calculate intelligent positioning based on electrical panel layout patterns
      const position = this.calculateFeederPosition(panelFeeders, feeder);

      // Create feeder layout with calculated position and actual dimensions
      await prisma.feederLayout.create({
        data: {
          feederId: feeder.id,
          x: position.x,
          y: position.y,
          width: feeder.width || 300, // Use feeder width or default 300mm
          height: feeder.height || 200, // Use feeder height or default 200mm
          viewType: "front", // Default view type
          createdBy: userId,
          version: 1,
        },
      });

      console.log(
        `Created feeder layout for feeder: ${feeder.description} at position (${position.x}, ${position.y})`
      );
    } catch (error) {
      console.error(
        `Error creating feeder layout for feeder ${feeder.id}:`,
        error
      );
      // Don't throw error here to avoid breaking the main import process
      // The layout can be created later if needed
    }
  }

  /**
   * Group feeders by width for layout calculation
   * Returns a map where key is width and value is array of feeders with that width
   */
  private static groupFeedersByWidth(feeders: any[]): Map<number, any[]> {
    const groupedFeeders = new Map<number, any[]>();

    feeders.forEach((feeder) => {
      const width = feeder.width || 300; // Default to 300mm if width not specified
      if (!groupedFeeders.has(width)) {
        groupedFeeders.set(width, []);
      }
      groupedFeeders.get(width)!.push(feeder);
    });

    return groupedFeeders;
  }

  /**
   * Group feeders by height (1800mm limit per group)
   * Returns an array of groups, where each group contains feeders that fit within 1800mm height
   */
  private static groupFeedersByHeight(feeders: any[]): any[][] {
    const MAX_HEIGHT_MM = 1800;
    const groupedFeeders: any[][] = [];
    let currentGroup: any[] = [];
    let currentGroupHeight = 0;

    feeders.forEach((feeder) => {
      const feederHeight = feeder.height || 300;

      // Check if this feeder would exceed the 1800mm height limit
      if (currentGroupHeight + feederHeight > MAX_HEIGHT_MM) {
        // Start a new group
        if (currentGroup.length > 0) {
          groupedFeeders.push(currentGroup);
        }
        currentGroup = [feeder];
        currentGroupHeight = feederHeight;
      } else {
        // Add to current group
        currentGroup.push(feeder);
        currentGroupHeight += feederHeight;
      }
    });

    // Add the last group if it has feeders
    if (currentGroup.length > 0) {
      groupedFeeders.push(currentGroup);
    }

    return groupedFeeders;
  }

  /**
   * Find which height group a feeder belongs to
   */
  private static findFeederGroup(
    groupedFeeders: any[][],
    feederId: string
  ): any[] | null {
    for (const group of groupedFeeders) {
      if (group.some((feeder) => feeder.id === feederId)) {
        return group;
      }
    }
    return null;
  }

  /**
   * Calculate required columns for GridStack based on grouped feeders
   */
  public static calculateRequiredColumns(feeders: any[]): number {
    if (feeders.length === 0) return 6; // Default minimum

    const groupedFeeders = this.groupFeedersByHeight(feeders);
    let totalColumns = 2; // Start with left and right VBB

    // Calculate columns needed for each height group
    groupedFeeders.forEach((groupFeeders, groupIndex) => {
      // Add VBB column before this group (except for first group)
      if (groupIndex > 0) {
        totalColumns += 1; // One VBB column (300mm width)
      }

      // Each group takes exactly one column (since they're grouped by 1800mm height limit)
      totalColumns += 1;
    });

    // Ensure minimum of 6 columns and maximum of 50 (for 2% cell width)
    return Math.max(6, Math.min(50, totalColumns));
  }

  /**
   * Calculate total cells required for panel layout
   * Based on grouped feeders and layout rules
   */
  private static calculateTotalCells(feeders: any[]): {
    totalCols: number;
    totalRows: number;
  } {
    // Constants based on requirements - Must match GridStack GRID_UNIT_MM
    const CELL_SIZE = 100; // Must match GRID_UNIT_MM in FeederLayoutGrid.tsx
    const VBB_HEIGHT = 1800 + 250; // 2050 mm
    const VBB_WIDTH = 300; // 300 mm for VBB/CBC between feeders
    const AVAILABLE_HEIGHT = 1800; // Available height for feeders (excluding HBB)

    // Group feeders by width
    const groupedFeeders = this.groupFeedersByWidth(feeders);

    let totalCols = 0;
    let maxRows = 0;

    // Calculate columns and rows for each width group
    groupedFeeders.forEach((groupFeeders, width) => {
      // Calculate how many feeders can fit in the available height
      const feederHeight = groupFeeders[0]?.height || 300; // Use first feeder's height as reference
      const feedersPerColumn = Math.floor(AVAILABLE_HEIGHT / feederHeight);

      // Calculate columns needed for this width group
      // Each feeder takes its actual width in cells, plus VBB spacing
      const feederWidthInCells = Math.ceil(width / CELL_SIZE);
      const vbbWidthInCells = Math.ceil(VBB_WIDTH / CELL_SIZE);

      const groupCols =
        vbbWidthInCells + // Left VBB
        groupFeeders.reduce((total, feeder) => {
          const feederCellWidth = Math.ceil((feeder.width || 300) / CELL_SIZE);
          return total + feederCellWidth;
        }, 0) +
        (groupFeeders.length - 1) * vbbWidthInCells + // VBBs between feeders
        vbbWidthInCells; // Right VBB

      totalCols += groupCols;

      // Calculate rows needed for this group (feeders arranged in columns)
      const columnsNeeded = Math.ceil(groupFeeders.length / feedersPerColumn);
      const rowsNeeded = feedersPerColumn; // Each column has feedersPerColumn rows

      maxRows = Math.max(maxRows, rowsNeeded);
    });

    // Add rows for HBB and spacing
    const totalRows =
      1 + // HBB row
      maxRows + // Feeder rows
      1; // Bottom spacing row

    return { totalCols, totalRows };
  }

  /**
   * Calculate intelligent positioning for feeders in electrical panel layout
   * Based on standard electrical panel design patterns with the following rules:
   * - Cell size: 100 x 100 mm (matches GridStack GRID_UNIT_MM)
   * - VBB height: 1800 mm
   * - Group feeders by height (1800mm limit per group)
   * - x:0, y:0 must be horizontal bus bar (HBB)
   * - HBB width: total width of grouped feeders
   * - First and last column will always be VBB of 300mm
   * - VBBs only between different height groups (not between individual feeders)
   * - 1800mm height limit per column
   */
  private static calculateFeederPosition(
    feeders: any[],
    currentFeeder: any
  ): { x: number; y: number } {
    // Constants based on requirements - Must match GridStack GRID_UNIT_MM
    const CELL_SIZE = 100; // Must match GRID_UNIT_MM in FeederLayoutGrid.tsx
    const VBB_HEIGHT = 1800; // 1800 mm
    const VBB_WIDTH = 300; // 300 mm for VBB
    const TOP_HBB_HEIGHT = 100; // 100 mm for top horizontal bus bar
    const BOTTOM_HBB_HEIGHT = 100; // 100 mm for bottom horizontal bus bar
    const MAX_HEIGHT_MM = 1800; // Maximum height per column
    const MAX_ROWS = 24; // Maximum 24 rows

    // Group feeders by height (1800mm limit per group)
    const groupedFeeders = this.groupFeedersByHeight(feeders);

    // Log grouping information
    console.log("=== FEEDER POSITION CALCULATION ===");
    console.log("Total feeders:", feeders.length);
    console.log(
      "Current feeder:",
      currentFeeder.description,
      "ID:",
      currentFeeder.id
    );
    console.log(
      "Grouped feeders by height (1800mm limit):",
      groupedFeeders.map((group, index) => ({
        group: index + 1,
        count: group.length,
        totalHeight: group.reduce((sum, f) => sum + (f.height || 300), 0),
        feeders: group.map((f) => ({
          id: f.id,
          description: f.description,
          height: f.height,
        })),
      }))
    );

    // Find the height group of the current feeder
    const currentGroup = this.findFeederGroup(groupedFeeders, currentFeeder.id);

    if (!currentGroup) {
      console.log(
        "❌ Current feeder not found in any group, using fallback position"
      );
      return { x: 0, y: TOP_HBB_HEIGHT }; // Fallback position
    }

    // Find position of current feeder within its group
    const feederIndexInGroup = currentGroup.findIndex(
      (f) => f.id === currentFeeder.id
    );
    if (feederIndexInGroup === -1) {
      console.log(
        "❌ Current feeder not found in its group, using fallback position"
      );
      return { x: 0, y: TOP_HBB_HEIGHT }; // Fallback position
    }

    console.log(
      `✅ Feeder found in height group at index ${feederIndexInGroup}`
    );

    // Calculate x position based on width groups and column distribution
    let xInCells = 1; // Start after left VBB (column 0 is left VBB)

    // Sort groups by total height (largest first for better layout)
    const sortedGroups = groupedFeeders
      .map((group, index) => ({
        index,
        group,
        totalHeight: group.reduce((sum, f) => sum + (f.height || 300), 0),
      }))
      .sort((a, b) => b.totalHeight - a.totalHeight);

    console.log(
      "Sorted groups (largest height first):",
      sortedGroups.map(
        (groupInfo) =>
          `Group ${groupInfo.index + 1}: ${groupInfo.totalHeight}mm (${
            groupInfo.group.length
          } feeders)`
      )
    );

    // Find current group index
    let currentGroupIndex = -1;
    for (let i = 0; i < sortedGroups.length; i++) {
      if (sortedGroups[i].group === currentGroup) {
        currentGroupIndex = i;
        break;
      }
    }

    console.log(`Current group index: ${currentGroupIndex} (0-based)`);

    // Calculate columns needed for previous groups
    for (let i = 0; i < currentGroupIndex; i++) {
      // Add VBB column between groups (except for first group)
      if (i > 0) {
        xInCells += 1; // VBB column
        console.log(
          `Added VBB column after group ${i - 1}, xInCells: ${xInCells}`
        );
      }

      // Calculate columns needed for this group based on 1800mm height limit
      const groupFeeders = sortedGroups[i].group;
      let currentColumnHeight = 0;
      let columnsForThisGroup = 0;

      console.log(
        `Calculating columns for group ${i} (${sortedGroups[i].totalHeight}mm):`
      );

      groupFeeders.forEach((feeder: any, feederIdx: number) => {
        const feederHeight = feeder.height || 300;
        const feederHeightGrid = Math.ceil(feederHeight / CELL_SIZE);

        console.log(
          `  Feeder ${feederIdx}: ${feederHeight}mm (${feederHeightGrid} grid units)`
        );

        if (
          currentColumnHeight + feederHeightGrid >
          Math.ceil(MAX_HEIGHT_MM / CELL_SIZE)
        ) {
          columnsForThisGroup += 1;
          currentColumnHeight = feederHeightGrid;
          console.log(
            `    → New column needed, currentColumnHeight: ${currentColumnHeight}`
          );
        } else {
          currentColumnHeight += feederHeightGrid;
          console.log(
            `    → Fits in current column, currentColumnHeight: ${currentColumnHeight}`
          );
        }
      });

      // Add the last column for this group
      if (columnsForThisGroup === 0) {
        columnsForThisGroup = 1;
      } else {
        columnsForThisGroup += 1;
      }

      console.log(`  Total columns for group ${i}: ${columnsForThisGroup}`);
      xInCells += columnsForThisGroup;
      console.log(`  xInCells after group ${i}: ${xInCells}`);
    }

    // Add VBB column before current group (except for first group)
    if (currentGroupIndex > 0) {
      xInCells += 1; // VBB column
      console.log(
        `Added VBB column before current group, xInCells: ${xInCells}`
      );
    }

    // Calculate which column this feeder belongs to within its group
    const feederHeight = currentFeeder.height || 300;
    let currentColumnHeight = 0;
    let columnIndexInGroup = 0;

    console.log(`Calculating column within current height group:`);

    for (let i = 0; i < feederIndexInGroup; i++) {
      const prevFeederHeight = currentGroup[i].height || 300;
      const prevFeederHeightGrid = Math.ceil(prevFeederHeight / CELL_SIZE);

      console.log(
        `  Previous feeder ${i}: ${prevFeederHeight}mm (${prevFeederHeightGrid} grid units)`
      );

      if (
        currentColumnHeight + prevFeederHeightGrid >
        Math.ceil(MAX_HEIGHT_MM / CELL_SIZE)
      ) {
        columnIndexInGroup += 1;
        currentColumnHeight = prevFeederHeightGrid;
        console.log(
          `    → New column in group, columnIndexInGroup: ${columnIndexInGroup}`
        );
      } else {
        currentColumnHeight += prevFeederHeightGrid;
        console.log(
          `    → Same column, currentColumnHeight: ${currentColumnHeight}`
        );
      }
    }

    // Add column offset for this feeder
    xInCells += columnIndexInGroup;
    console.log(
      `Final xInCells: ${xInCells} (base: ${
        xInCells - columnIndexInGroup
      } + columnInGroup: ${columnIndexInGroup})`
    );

    // Calculate y position within the column
    let rowIndexInColumn = 0;
    currentColumnHeight = 0;

    console.log(`Calculating row within column:`);

    for (let i = 0; i < feederIndexInGroup; i++) {
      const prevFeederHeight = currentGroup[i].height || 300;
      const prevFeederHeightGrid = Math.ceil(prevFeederHeight / CELL_SIZE);

      if (
        currentColumnHeight + prevFeederHeightGrid >
        Math.ceil(MAX_HEIGHT_MM / CELL_SIZE)
      ) {
        // This feeder is in a new column, reset row index
        rowIndexInColumn = 0;
        currentColumnHeight = prevFeederHeightGrid;
        console.log(
          `    Feeder ${i} starts new column, rowIndexInColumn: ${rowIndexInColumn}`
        );
      } else {
        rowIndexInColumn += 1;
        currentColumnHeight += prevFeederHeightGrid;
        console.log(
          `    Feeder ${i} in same column, rowIndexInColumn: ${rowIndexInColumn}`
        );
      }
    }

    // Convert to mm
    const x = xInCells * CELL_SIZE;
    const y = TOP_HBB_HEIGHT + rowIndexInColumn * feederHeight + 50; // 50mm spacing after HBB

    console.log(`Final position for ${currentFeeder.description}:`);
    console.log(`  x: ${x}mm (${xInCells} cells)`);
    console.log(
      `  y: ${y}mm (HBB: ${TOP_HBB_HEIGHT} + row: ${rowIndexInColumn} * height: ${feederHeight} + spacing: 50)`
    );
    console.log("=== END FEEDER POSITION CALCULATION ===");

    return { x, y };
  }
}
