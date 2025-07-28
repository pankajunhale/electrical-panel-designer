"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { nanoid } from "nanoid";

interface PanelEquipmentInput {
  slno: string;
  panelname: string;
  item: string;
  subqty: number;
  typecode: string;
  height: number;
  width: number;
  depth?: number;
}

interface ProcessingResult {
  success: boolean;
  message: string;
  data?: {
    equipmentTypes: number;
    projects: number;
    panelLocations: number;
    starterTypes: number;
    breakerTypes: number;
    panels: number;
    feeders: number;
    feederTypes: number;
    feederLayouts: number;
    equipmentData: number;
  };
  errors?: string[];
}

/**
 * Panel Data Seeding Service
 * Handles the complete workflow of processing tabular equipment data
 * and inserting into all required database tables
 */
export class PanelDataSeedingService {
  /**
   * Main method to process and seed all panel design data
   */
  static async seedPanelDesignData(
    rawTabularData: string,
    defaultTeamId?: string
  ): Promise<ProcessingResult> {
    try {
      const user = await getCurrentUser();
      if (!user?.id) {
        throw new Error("Authentication required");
      }

      // Parse the input data
      const parsedData = this.parseTabularData(rawTabularData);
      if (parsedData.length === 0) {
        return {
          success: false,
          message: "No valid data found in input",
          errors: ["Input data is empty or invalid format"],
        };
      }

      const results = {
        equipmentTypes: 0,
        projects: 0,
        panelLocations: 0,
        starterTypes: 0,
        breakerTypes: 0,
        panels: 0,
        feeders: 0,
        feederTypes: 0,
        feederLayouts: 0,
        equipmentData: 0,
      };

      // Step 1: Create Equipment Types
      const equipmentTypesCreated = await this.createEquipmentTypes(
        parsedData,
        user.id
      );
      results.equipmentTypes = equipmentTypesCreated.length;

      // Step 2: Create Projects
      const projectsCreated = await this.createProjects(
        parsedData,
        user.id,
        defaultTeamId
      );
      results.projects = projectsCreated.length;

      // Step 3: Create Panel Locations
      const panelLocationsCreated = await this.createPanelLocations(
        parsedData,
        user.id,
        defaultTeamId
      );
      results.panelLocations = panelLocationsCreated.length;

      // Step 4: Create Starter Types
      const starterTypesCreated = await this.createStarterTypes(
        parsedData,
        user.id
      );
      results.starterTypes = starterTypesCreated.length;

      // Step 5: Create Breaker Types
      const breakerTypesCreated = await this.createBreakerTypes(
        parsedData,
        user.id
      );
      results.breakerTypes = breakerTypesCreated.length;

      // Step 6: Create Panels
      const panelsCreated = await this.createPanels(
        parsedData,
        projectsCreated,
        panelLocationsCreated,
        user.id
      );
      results.panels = panelsCreated.length;

      // Step 7: Create Feeder Types
      const feederTypesCreated = await this.createFeederTypes(
        parsedData,
        user.id
      );
      results.feederTypes = feederTypesCreated.length;

      // Step 8: Create Feeders
      const feedersCreated = await this.createFeeders(
        parsedData,
        panelsCreated,
        starterTypesCreated,
        feederTypesCreated,
        breakerTypesCreated,
        user.id
      );
      results.feeders = feedersCreated.length;

      // Step 9: Create Feeder Layouts
      const feederLayoutsCreated = await this.createFeederLayouts(
        feedersCreated,
        parsedData,
        user.id
      );
      results.feederLayouts = feederLayoutsCreated.length;

      // Step 10: Create Equipment Data (final step)
      const equipmentDataCreated = await this.createEquipmentData(
        parsedData,
        panelsCreated,
        equipmentTypesCreated,
        starterTypesCreated,
        user.id
      );
      results.equipmentData = equipmentDataCreated.length;

      return {
        success: true,
        message: `Successfully processed ${parsedData.length} equipment items and created all required records`,
        data: results,
      };
    } catch (error) {
      console.error("Error seeding panel design data:", error);
      return {
        success: false,
        message: "Failed to process panel design data",
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Parse tabular data from string input
   */
  private static parseTabularData(rawData: string): PanelEquipmentInput[] {
    const lines = rawData.trim().split("\n");
    if (lines.length < 2) return [];

    // Skip header line, process data lines
    return lines
      .slice(1)
      .map((line) => {
        const values = line.split("\t").map((v) => v.trim());
        return {
          slno: values[0] || "",
          panelname: values[1] || "",
          item: values[2] || "",
          subqty: parseInt(values[3]) || 1,
          typecode: values[4] || "",
          height: parseInt(values[5]) || 0,
          width: parseInt(values[6]) || 0,
          depth: values[7] ? parseInt(values[7]) : undefined,
        };
      })
      .filter((row) => row.slno && row.panelname && row.item);
  }

  /**
   * Create Equipment Types from the data
   */
  private static async createEquipmentTypes(
    data: PanelEquipmentInput[],
    userId: string
  ) {
    const typeCodeMapping = {
      ACB: "Air Circuit Breaker",
      SWITCH: "Switch/Control Equipment",
      STARTE: "Motor Starter",
      MCCB: "Molded Case Circuit Breaker",
      MPCB: "Motor Protection Circuit Breaker",
    };

    const uniqueTypeCodes = [...new Set(data.map((item) => item.typecode))];
    const created = [];

    for (const typeCode of uniqueTypeCodes) {
      const name =
        typeCodeMapping[typeCode as keyof typeof typeCodeMapping] || typeCode;

      const existing = await prisma.equipmentType.findFirst({
        where: { name },
      });

      if (!existing) {
        const equipmentType = await prisma.equipmentType.create({
          data: {
            id: nanoid(),
            name,
            description: `Equipment type for ${typeCode} category`,
            createdBy: userId,
            version: 1,
          },
        });
        created.push(equipmentType);
      }
    }

    return created;
  }

  /**
   * Create Projects from unique panel names
   */
  private static async createProjects(
    data: PanelEquipmentInput[],
    userId: string,
    teamId?: string
  ) {
    const uniquePanelNames = [...new Set(data.map((item) => item.panelname))];
    const created = [];

    for (const panelName of uniquePanelNames) {
      const projectName = `${panelName} Project`;

      const existing = await prisma.project.findFirst({
        where: { name: projectName },
      });

      if (!existing) {
        const project = await prisma.project.create({
          data: {
            id: nanoid(),
            name: projectName,
            description: `Auto-generated project for panel ${panelName}`,
            userId,
            teamId,
            createdBy: userId,
            version: 1,
          },
        });
        created.push(project);
      }
    }

    return created;
  }

  /**
   * Create Panel Locations
   */
  private static async createPanelLocations(
    data: PanelEquipmentInput[],
    userId: string,
    teamId?: string
  ) {
    const uniquePanelNames = [...new Set(data.map((item) => item.panelname))];
    const created = [];

    for (const panelName of uniquePanelNames) {
      const locationName = `${panelName} Location`;

      const existing = await prisma.panelLocation.findFirst({
        where: { name: locationName },
      });

      if (!existing) {
        const location = await prisma.panelLocation.create({
          data: {
            id: nanoid(),
            name: locationName,
            description: `Location for ${panelName}`,
            teamId,
            createdBy: userId,
            version: 1,
          },
        });
        created.push(location);
      }
    }

    return created;
  }

  /**
   * Create Starter Types from equipment descriptions
   */
  private static async createStarterTypes(
    data: PanelEquipmentInput[],
    userId: string
  ) {
    const starterPatterns = {
      DOL: "Direct Online Starter",
      RDOL: "Reversing Direct Online Starter",
      HDOL: "Heavy Duty Direct Online Starter",
      HRDOL: "Heavy Duty Reversing Direct Online Starter",
      "S/Delta": "Star Delta Starter",
      "H S/D": "Heavy Duty Star Delta Starter",
    };

    const foundStarters = new Set<string>();

    // Extract starter types from descriptions
    data.forEach((item) => {
      Object.keys(starterPatterns).forEach((pattern) => {
        if (item.item.toUpperCase().includes(pattern)) {
          foundStarters.add(
            starterPatterns[pattern as keyof typeof starterPatterns]
          );
        }
      });

      // Generic starter detection
      if (
        item.item.toLowerCase().includes("starter") &&
        !Array.from(foundStarters).some((s) => item.item.includes(s))
      ) {
        foundStarters.add("Motor Starter");
      }
    });

    const created = [];
    for (const starterName of foundStarters) {
      const existing = await prisma.starterType.findFirst({
        where: { name: starterName },
      });

      if (!existing) {
        const starterType = await prisma.starterType.create({
          data: {
            id: nanoid(),
            name: starterName,
            createdBy: userId,
            version: 1,
          },
        });
        created.push(starterType);
      }
    }

    return created;
  }

  /**
   * Create Breaker Types from equipment descriptions
   */
  private static async createBreakerTypes(
    data: PanelEquipmentInput[],
    userId: string
  ) {
    const breakerPatterns = {
      ACB: "Air Circuit Breaker",
      MCCB: "Molded Case Circuit Breaker",
      MPCB: "Motor Protection Circuit Breaker",
    };

    const foundBreakers = new Set<string>();

    data.forEach((item) => {
      Object.keys(breakerPatterns).forEach((pattern) => {
        if (
          item.typecode === pattern ||
          item.item.toUpperCase().includes(pattern)
        ) {
          foundBreakers.add(
            breakerPatterns[pattern as keyof typeof breakerPatterns]
          );
        }
      });
    });

    const created = [];
    for (const breakerName of foundBreakers) {
      const existing = await prisma.breakerType.findFirst({
        where: { name: breakerName },
      });

      if (!existing) {
        const breakerType = await prisma.breakerType.create({
          data: {
            id: nanoid(),
            name: breakerName,
            createdBy: userId,
            version: 1,
          },
        });
        created.push(breakerType);
      }
    }

    return created;
  }

  /**
   * Create Panels
   */
  private static async createPanels(
    data: PanelEquipmentInput[],
    projects: any[],
    locations: any[],
    userId: string
  ) {
    const uniquePanelNames = [...new Set(data.map((item) => item.panelname))];
    const created = [];

    for (const panelName of uniquePanelNames) {
      const project = projects.find((p) => p.name.includes(panelName));
      const location = locations.find((l) => l.name?.includes(panelName));

      if (!project) continue;

      const existing = await prisma.panel.findFirst({
        where: {
          name: panelName,
          projectId: project.id,
        },
      });

      if (!existing) {
        const panel = await prisma.panel.create({
          data: {
            id: nanoid(),
            projectId: project.id,
            name: panelName,
            description: `Panel for ${panelName}`,
            locationId: location?.id,
            status: "draft",
            createdBy: userId,
            version: 1,
          },
        });
        created.push(panel);
      }
    }

    return created;
  }

  /**
   * Create Feeder Types
   */
  private static async createFeederTypes(
    data: PanelEquipmentInput[],
    userId: string
  ) {
    const feederTypeNames = [
      "Motor Feeder",
      "Control Feeder",
      "Power Feeder",
      "Transformer Feeder",
      "Switch Feeder",
    ];

    const created = [];
    for (const typeName of feederTypeNames) {
      const existing = await prisma.feederType.findFirst({
        where: { name: typeName },
      });

      if (!existing) {
        const feederType = await prisma.feederType.create({
          data: {
            id: nanoid(),
            name: typeName,
            createdBy: userId,
            version: 1,
          },
        });
        created.push(feederType);
      }
    }

    return created;
  }

  /**
   * Create Feeders
   */
  private static async createFeeders(
    data: PanelEquipmentInput[],
    panels: any[],
    starterTypes: any[],
    feederTypes: any[],
    breakerTypes: any[],
    userId: string
  ) {
    const created = [];

    for (const item of data) {
      const panel = panels.find((p) => p.name === item.panelname);
      if (!panel) continue;

      // Extract power ratings
      const kwMatch = item.item.match(/(\d+(?:\.\d+)?)KW/i);
      const hpMatch = item.item.match(/(\d+(?:\.\d+)?)HP/i);

      const ratingKw = kwMatch ? parseFloat(kwMatch[1]) : null;
      const ratingHp = hpMatch ? parseFloat(hpMatch[1]) : null;

      // Find appropriate starter type
      let starterType = null;
      if (item.item.toLowerCase().includes("starter")) {
        starterType = starterTypes.find(
          (st) =>
            item.item.toUpperCase().includes(st.name.split(" ")[0]) ||
            st.name === "Motor Starter"
        );
      }

      // Find appropriate feeder type
      let feederType = feederTypes.find((ft) => ft.name === "Motor Feeder");
      if (item.item.toLowerCase().includes("control")) {
        feederType = feederTypes.find((ft) => ft.name === "Control Feeder");
      } else if (item.item.toLowerCase().includes("transformer")) {
        feederType = feederTypes.find((ft) => ft.name === "Transformer Feeder");
      }

      // Find appropriate breaker type
      let breakerType = null;
      if (item.typecode === "ACB" || item.item.includes("ACB")) {
        breakerType = breakerTypes.find(
          (bt) => bt.name === "Air Circuit Breaker"
        );
      } else if (item.typecode === "MCCB" || item.item.includes("MCCB")) {
        breakerType = breakerTypes.find(
          (bt) => bt.name === "Molded Case Circuit Breaker"
        );
      }

      const feeder = await prisma.feeder.create({
        data: {
          id: nanoid(),
          panelId: panel.id,
          description: item.item,
          ratingKw,
          ratingHp,
          starterTypeId: starterType?.id,
          feederTypeId: feederType?.id,
          breakerTypeId: breakerType?.id,
          quantity: item.subqty,
          createdBy: userId,
          version: 1,
        },
      });
      created.push(feeder);
    }

    return created;
  }

  /**
   * Create Feeder Layouts
   */
  private static async createFeederLayouts(
    feeders: any[],
    data: PanelEquipmentInput[],
    userId: string
  ) {
    const created = [];

    for (let i = 0; i < feeders.length; i++) {
      const feeder = feeders[i];
      const equipmentItem = data[i];

      if (
        equipmentItem &&
        (equipmentItem.height > 0 || equipmentItem.width > 0)
      ) {
        const layout = await prisma.feederLayout.create({
          data: {
            id: nanoid(),
            feederId: feeder.id,
            x: 0, // Default position
            y: i * (equipmentItem.height || 100), // Stack vertically
            width: equipmentItem.width || 500,
            height: equipmentItem.height || 300,
            viewType: "front",
            createdBy: userId,
            version: 1,
          },
        });
        created.push(layout);
      }
    }

    return created;
  }

  /**
   * Create Equipment Data (final step)
   */
  private static async createEquipmentData(
    data: PanelEquipmentInput[],
    panels: any[],
    equipmentTypes: any[],
    starterTypes: any[],
    userId: string
  ) {
    const created = [];

    for (const item of data) {
      const panel = panels.find((p) => p.name === item.panelname);
      if (!panel) continue;

      // Find equipment type
      const typeCodeMapping = {
        ACB: "Air Circuit Breaker",
        SWITCH: "Switch/Control Equipment",
        STARTE: "Motor Starter",
      };

      const equipmentTypeName =
        typeCodeMapping[item.typecode as keyof typeof typeCodeMapping] ||
        item.typecode;
      const equipmentType = equipmentTypes.find(
        (et) => et.name === equipmentTypeName
      );

      // Extract power ratings
      const kwMatch = item.item.match(/(\d+(?:\.\d+)?)KW/i);
      const hpMatch = item.item.match(/(\d+(?:\.\d+)?)HP/i);

      // Find starter type
      let starterType = null;
      if (item.item.toLowerCase().includes("starter")) {
        starterType = starterTypes.find(
          (st) =>
            item.item.toUpperCase().includes(st.name.split(" ")[0]) ||
            st.name === "Motor Starter"
        );
      }

      const equipmentData = await prisma.equipmentData.create({
        data: {
          id: nanoid(),
          panelId: panel.id,
          serialNumber: parseInt(item.slno) || 1,
          description: item.item,
          quantity: item.subqty,
          ratingKw: kwMatch ? parseFloat(kwMatch[1]) : null,
          ratingHp: hpMatch ? parseFloat(hpMatch[1]) : null,
          equipmentTypeId: equipmentType?.id,
          starterTypeId: starterType?.id,
          // Physical dimensions
          height: item.height > 0 ? item.height : null,
          width: item.width > 0 ? item.width : null,
          depth: item.depth && item.depth > 0 ? item.depth : null,
          createdBy: userId,
          version: 1,
        },
      });
      created.push(equipmentData);
    }

    return created;
  }
}
