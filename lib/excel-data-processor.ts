export interface ExcelEquipment {
  id: number;
  description: string;
  rating: number; // kW
  hp: number;
  starterType: string;
  qty: number;
  height: number; // mm
  width: number; // mm
}

export interface ComputedFormData {
  basicInfo: BasicInfoData;
  incomerDetails: IncomerDetailsData;
  ratingDetails: RatingDetailsData;
  incomerTypes: IncomerTypesData;
  panelDetails: PanelDetailsData;
  equipmentSummary: EquipmentSummary;
}

export interface BasicInfoData {
  supplyLineVoltage: string;
  supplySystem: string;
  controlVoltage: string;
  panelType: string;
  numberOfIncomers: string;
  numberOfOutgoingFeeders: string;
  title: string;
  drawingNo: string;
  author: string;
  company: string;
  customer: string;
  colorFormat: "Colored" | "Monochrome";
  ferrulPrefix: string;
  sfu: string;
  mccb: string;
  acb: string;
  mpcb: string;
  contactor: string;
  meter: string;
  pilotDevice: string;
  capacitor: string;
}

export interface IncomerDetailsData {
  incomers: Array<{
    name: string;
    ampereRating: string;
  }>;
  feeders: Array<{
    name: string;
    starterType: string;
    feederAmps: string;
    connectToIncomer: string;
  }>;
}

export interface RatingDetailsData {
  incomers: Array<{
    currentRating: string;
    wiringMaterial: "Copper" | "Aluminum";
    cablesOrBusBars: "Cables" | "BusBars";
  }>;
  feeders: Array<{
    currentRating: string;
    wiringMaterial: "Copper" | "Aluminum";
    cablesOrBusBars: "Cables" | "BusBars";
  }>;
}

export interface IncomerTypesData {
  incomers: Array<{
    incomerType: string;
    phase: string;
    kARating: string;
    metersRequired: string;
    busCouplerType: string;
    cableSpecs: string;
  }>;
  feeders: Array<{
    incomerType: string;
    phase: string;
    kARating: string;
    metersRequired: string;
    busCouplerType: string;
    cableSpecs: string;
  }>;
}

export interface PanelDetailsData {
  maxHeight: string;
  panelThickness: string;
  partitionRequirements: string;
  cableEntry: string;
  ventilation: string;
  mountingType: string;
  protectionLevel: string;
}

export interface EquipmentSummary {
  totalEquipment: number;
  totalPowerKW: number;
  totalPowerHP: number;
  equipmentByType: Record<string, number>;
  equipmentByStarterType: Record<string, number>;
  maxDimensions: { width: number; height: number; depth: number };
  powerDistribution: {
    highPower: number; // >50kW
    mediumPower: number; // 10-50kW
    lowPower: number; // <10kW
  };
}

export class ExcelDataProcessor {
  private equipment: ExcelEquipment[];

  constructor(equipment: ExcelEquipment[]) {
    this.equipment = equipment;
  }

  public computeAllFormData(): ComputedFormData {
    const summary = this.computeEquipmentSummary();

    return {
      basicInfo: this.computeBasicInfo(summary),
      incomerDetails: this.computeIncomerDetails(summary),
      ratingDetails: this.computeRatingDetails(summary),
      incomerTypes: this.computeIncomerTypes(summary),
      panelDetails: this.computePanelDetails(summary),
      equipmentSummary: summary,
    };
  }

  private computeEquipmentSummary(): EquipmentSummary {
    const validEquipment = this.equipment.filter(
      (eq) => eq.height > 0 && eq.width > 0
    );

    // Group by equipment type
    const equipmentByType: Record<string, number> = {};
    validEquipment.forEach((eq) => {
      const type = this.getEquipmentType(eq.description);
      equipmentByType[type] = (equipmentByType[type] || 0) + eq.qty;
    });

    // Group by starter type
    const equipmentByStarterType: Record<string, number> = {};
    validEquipment.forEach((eq) => {
      equipmentByStarterType[eq.starterType] =
        (equipmentByStarterType[eq.starterType] || 0) + eq.qty;
    });

    // Power distribution
    const powerDistribution = {
      highPower: validEquipment.filter((eq) => eq.rating > 50).length,
      mediumPower: validEquipment.filter(
        (eq) => eq.rating >= 10 && eq.rating <= 50
      ).length,
      lowPower: validEquipment.filter((eq) => eq.rating < 10).length,
    };

    return {
      totalEquipment: validEquipment.length,
      totalPowerKW: validEquipment.reduce(
        (sum, eq) => sum + eq.rating * eq.qty,
        0
      ),
      totalPowerHP: validEquipment.reduce((sum, eq) => sum + eq.hp * eq.qty, 0),
      equipmentByType,
      equipmentByStarterType,
      maxDimensions: {
        width: Math.max(...validEquipment.map((eq) => eq.width)),
        height: Math.max(...validEquipment.map((eq) => eq.height)),
        depth: 600, // Standard MCC depth
      },
      powerDistribution,
    };
  }

  private getEquipmentType(description: string): string {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes("pump")) return "Pumps";
    if (lowerDesc.includes("blower")) return "Air Blowers";
    if (lowerDesc.includes("dosing")) return "Dosing Pumps";
    if (lowerDesc.includes("spare")) return "Spares";
    return "Other";
  }

  private computeBasicInfo(summary: EquipmentSummary): BasicInfoData {
    // Determine panel type based on equipment mix
    let panelType = "MCC Panel";
    if (summary.equipmentByType["Pumps"] > 0) panelType = "MCC Panel";
    if (
      summary.equipmentByType["Dosing Pumps"] > summary.equipmentByType["Pumps"]
    )
      panelType = "Dosing Panel";

    // Determine number of incomers based on starter types
    const incomerCount = Object.keys(summary.equipmentByStarterType).length;

    return {
      supplyLineVoltage: "415",
      supplySystem: "3 Phase 4 Wire, 50Hz",
      controlVoltage: "240",
      panelType,
      numberOfIncomers: incomerCount.toString(),
      numberOfOutgoingFeeders: summary.totalEquipment.toString(),
      title: "Electrical Panel Design",
      drawingNo: `EP-${new Date().getFullYear()}-${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}`,
      author: "Electrical Engineer",
      company: "Your Company",
      customer: "Client Name",
      colorFormat: "Colored",
      ferrulPrefix: "A",
      sfu: "Siemens_3KL",
      mccb: "Siemens_3WL",
      acb: "Siemens_3WL",
      mpcb: "Siemens_3RV",
      contactor: "Siemens_3RT",
      meter: "Conzerv",
      pilotDevice: "Teknik",
      capacitor: "EPCOS",
    };
  }

  private computeIncomerDetails(summary: EquipmentSummary): IncomerDetailsData {
    const validEquipment = this.equipment.filter(
      (eq) => eq.height > 0 && eq.width > 0
    );

    // Create incomers based on starter types
    const incomers = [];
    let incomerIndex = 1;

    if (summary.equipmentByStarterType["S/D"]) {
      incomers.push({
        name: `Main Incomer ${incomerIndex++} (S/D)`,
        ampereRating: this.calculateIncomerRating("S/D").toString(),
      });
    }

    if (summary.equipmentByStarterType["VFD"]) {
      incomers.push({
        name: `VFD Incomer ${incomerIndex++}`,
        ampereRating: this.calculateIncomerRating("VFD").toString(),
      });
    }

    if (summary.equipmentByStarterType["DOL"]) {
      incomers.push({
        name: `DOL Incomer ${incomerIndex++}`,
        ampereRating: this.calculateIncomerRating("DOL").toString(),
      });
    }

    if (summary.equipmentByStarterType["1 PHASE DOL"]) {
      incomers.push({
        name: `Single Phase Incomer ${incomerIndex++}`,
        ampereRating: this.calculateIncomerRating("1 PHASE DOL").toString(),
      });
    }

    // Create feeders from equipment data
    const feeders = validEquipment.map((equipment, index) => ({
      name: equipment.description,
      starterType: this.mapStarterType(equipment.starterType),
      feederAmps: equipment.rating.toString(),
      connectToIncomer: this.getIncomerForEquipment(
        equipment.starterType,
        incomers
      ),
    }));

    return { incomers, feeders };
  }

  private calculateIncomerRating(starterType: string): number {
    const equipmentOfType = this.equipment.filter(
      (eq) => eq.starterType === starterType && eq.height > 0
    );
    if (equipmentOfType.length === 0) return 100;

    const maxRating = Math.max(...equipmentOfType.map((eq) => eq.rating));
    return Math.ceil(maxRating * 1.5); // Safety factor of 1.5
  }

  private mapStarterType(starterType: string): string {
    switch (starterType) {
      case "S/D":
        return "Star-Delta";
      case "VFD":
        return "VFD";
      case "DOL":
        return "DOL";
      case "1 PHASE DOL":
        return "DOL";
      default:
        return "DOL";
    }
  }

  private getIncomerForEquipment(starterType: string, incomers: any[]): string {
    switch (starterType) {
      case "S/D":
        return (
          incomers.find((inc) => inc.name.includes("S/D"))?.name ||
          "Main Incomer"
        );
      case "VFD":
        return (
          incomers.find((inc) => inc.name.includes("VFD"))?.name ||
          "VFD Incomer"
        );
      case "DOL":
        return (
          incomers.find((inc) => inc.name.includes("DOL"))?.name ||
          "DOL Incomer"
        );
      case "1 PHASE DOL":
        return (
          incomers.find((inc) => inc.name.includes("Single Phase"))?.name ||
          "Single Phase Incomer"
        );
      default:
        return incomers[0]?.name || "Main Incomer";
    }
  }

  private computeRatingDetails(summary: EquipmentSummary): RatingDetailsData {
    const incomerDetails = this.computeIncomerDetails(summary);

    const incomerRatings = incomerDetails.incomers.map((incomer) => ({
      currentRating: `${Math.ceil(parseFloat(incomer.ampereRating) * 1.25)}A`,
      wiringMaterial: "Copper" as const,
      cablesOrBusBars: "BusBars" as const,
    }));

    const feederRatings = incomerDetails.feeders.map((feeder) => ({
      currentRating: `${Math.ceil(parseFloat(feeder.feederAmps) * 1.25)}A`,
      wiringMaterial: "Copper" as const,
      cablesOrBusBars: "Cables" as const,
    }));

    return { incomers: incomerRatings, feeders: feederRatings };
  }

  private computeIncomerTypes(summary: EquipmentSummary): IncomerTypesData {
    const incomerDetails = this.computeIncomerDetails(summary);

    const incomerTypes = incomerDetails.incomers.map((incomer) => ({
      incomerType: incomer.name,
      phase: "3 Phase",
      kARating: "50",
      metersRequired: "Yes",
      busCouplerType: incomer.name.includes("VFD") ? "No" : "Yes",
      cableSpecs: "3C×300mm²",
    }));

    const feederTypes = incomerDetails.feeders.map((feeder) => ({
      incomerType: feeder.name,
      phase: feeder.starterType === "VFD" ? "3 Phase" : "3 Phase",
      kARating: this.calculateKARating(feeder.feederAmps),
      metersRequired: "Yes",
      busCouplerType: "No",
      cableSpecs: this.calculateCableSpecs(feeder.feederAmps),
    }));

    return { incomers: incomerTypes, feeders: feederTypes };
  }

  private calculateKARating(feederAmps: string): string {
    const amps = parseFloat(feederAmps);
    if (amps > 100) return "50";
    if (amps > 50) return "25";
    if (amps > 20) return "10";
    return "6";
  }

  private calculateCableSpecs(feederAmps: string): string {
    const amps = parseFloat(feederAmps);
    if (amps > 100) return "3C×150mm²";
    if (amps > 50) return "3C×95mm²";
    if (amps > 20) return "3C×35mm²";
    if (amps > 10) return "3C×16mm²";
    return "3C×6mm²";
  }

  private computePanelDetails(summary: EquipmentSummary): PanelDetailsData {
    return {
      maxHeight: summary.maxDimensions.height.toString(),
      panelThickness: "2.5",
      partitionRequirements: summary.equipmentByStarterType["VFD"]
        ? "Yes"
        : "No",
      cableEntry: "Bottom",
      ventilation: summary.equipmentByStarterType["VFD"]
        ? "Required"
        : "Standard",
      mountingType: "Floor Mounted",
      protectionLevel: "IP54",
    };
  }

  public generateDataTables(): Record<string, any[]> {
    const summary = this.computeEquipmentSummary();
    const formData = this.computeAllFormData();

    return {
      equipmentSummary: [
        { Category: "Total Equipment", Count: summary.totalEquipment },
        {
          Category: "Total Power (kW)",
          Value: summary.totalPowerKW.toFixed(1),
        },
        {
          Category: "Total Power (HP)",
          Value: summary.totalPowerHP.toFixed(1),
        },
        {
          Category: "High Power Equipment (>50kW)",
          Count: summary.powerDistribution.highPower,
        },
        {
          Category: "Medium Power Equipment (10-50kW)",
          Count: summary.powerDistribution.mediumPower,
        },
        {
          Category: "Low Power Equipment (<10kW)",
          Count: summary.powerDistribution.lowPower,
        },
      ],
      equipmentByType: Object.entries(summary.equipmentByType).map(
        ([type, count]) => ({
          EquipmentType: type,
          Quantity: count,
        })
      ),
      equipmentByStarterType: Object.entries(
        summary.equipmentByStarterType
      ).map(([type, count]) => ({
        StarterType: type,
        Quantity: count,
      })),
      incomers: formData.incomerDetails.incomers.map((inc, index) => ({
        Incomer: inc.name,
        AmpereRating: `${inc.ampereRating}A`,
        CurrentRating:
          formData.ratingDetails.incomers[index]?.currentRating || "N/A",
        WiringMaterial:
          formData.ratingDetails.incomers[index]?.wiringMaterial || "Copper",
        CableType:
          formData.ratingDetails.incomers[index]?.cablesOrBusBars || "BusBars",
      })),
      feeders: formData.incomerDetails.feeders.map((feed, index) => ({
        Equipment: feed.name,
        StarterType: feed.starterType,
        AmpereRating: `${feed.feederAmps}A`,
        ConnectTo: feed.connectToIncomer,
        CurrentRating:
          formData.ratingDetails.feeders[index]?.currentRating || "N/A",
        WiringMaterial:
          formData.ratingDetails.feeders[index]?.wiringMaterial || "Copper",
        CableType:
          formData.ratingDetails.feeders[index]?.cablesOrBusBars || "Cables",
      })),
      panelSpecifications: [
        { Parameter: "Panel Type", Value: formData.basicInfo.panelType },
        {
          Parameter: "Supply Voltage",
          Value: `${formData.basicInfo.supplyLineVoltage}V`,
        },
        {
          Parameter: "Control Voltage",
          Value: `${formData.basicInfo.controlVoltage}V`,
        },
        {
          Parameter: "Number of Incomers",
          Value: formData.basicInfo.numberOfIncomers,
        },
        {
          Parameter: "Number of Feeders",
          Value: formData.basicInfo.numberOfOutgoingFeeders,
        },
        {
          Parameter: "Max Height",
          Value: `${formData.panelDetails.maxHeight}mm`,
        },
        {
          Parameter: "Panel Thickness",
          Value: `${formData.panelDetails.panelThickness}mm`,
        },
        {
          Parameter: "Protection Level",
          Value: formData.panelDetails.protectionLevel,
        },
      ],
    };
  }
}
