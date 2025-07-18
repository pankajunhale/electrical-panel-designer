"use server";

import { revalidatePath } from "next/cache";
import { EquipmentData } from "./equipment-data";

export interface WizardFormData {
  basicInfo: {
    supplyLineVoltage: number;
    supplySystem: string;
    controlVoltage: number;
    panelType: string;
    numberOfIncomers: number;
    numberOfOutgoingFeeders: number;
  };
  incomerDetails: {
    incomers: Array<{
      name: string;
      ampereRating: number;
    }>;
    feeders: Array<{
      name: string;
      starterType: string;
      feederAmps: number;
      connectToIncomer: string;
    }>;
  };
  ratingDetails: {
    incomers: Array<{
      currentRating: string;
      wiringMaterial: string;
      cablesOrBusBars: string;
    }>;
    feeders: Array<{
      currentRating: string;
      wiringMaterial: string;
      cablesOrBusBars: string;
    }>;
  };
  incomerTypes: {
    incomers: Array<{
      type: string;
      rating: number;
      protection: string;
    }>;
  };
  feederIncomerTypes: {
    feeders: Array<{
      name: string;
      starterType: string;
      protection: string;
      cableSize: string;
    }>;
  };
  makeDetails: {
    panelMake: string;
    incomerMake: string;
    feederMake: string;
    controlMake: string;
    maxHeightFeedersSection: number;
    panelDoorsThickness: number;
    mountingPlatesThickness1: number;
    mountingPlatesThickness2: number;
    verticalHorizPartitionsThickness: number;
    horizontalPartitionsDepth: number;
    verticalPartitionsDepth: number;
    horizontalPartitionRequired: boolean;
    verticalPartitionRequired: boolean;
  };
  systemDetails: {
    systemType: string;
    voltageLevel: string;
    frequency: string;
    earthingSystem: string;
  };
}

export interface GALayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  type: string;
  equipmentKey?: string;
}

export interface ComputedWizardData {
  formData: WizardFormData;
  gaLayout: GALayoutItem[];
  equipmentData: EquipmentData[];
}

export async function computeWizardData(
  equipmentData: EquipmentData[],
  userFormData?: Partial<WizardFormData>
): Promise<ComputedWizardData> {
  try {
    // Calculate total equipment with dimensions
    const validEquipment = equipmentData.filter(
      (eq) => eq.height > 0 && eq.width > 0
    );

    // Group equipment by starter type
    const sDEquipment = validEquipment.filter((eq) => eq.starterType === "S/D");
    const vfdEquipment = validEquipment.filter(
      (eq) => eq.starterType === "VFD"
    );

    // Create incomers based on starter types
    const incomers = [
      {
        name: "Main Incomer (S/D)",
        ampereRating:
          sDEquipment.length > 0
            ? Math.max(...sDEquipment.map((eq) => eq.rating * 1.5))
            : 100,
      },
      {
        name: "VFD Incomer",
        ampereRating:
          vfdEquipment.length > 0
            ? Math.max(...vfdEquipment.map((eq) => eq.rating * 1.5))
            : 200,
      },
    ];

    // Create feeders from equipment data
    const feeders = validEquipment.map((equipment) => ({
      name: equipment.description,
      starterType:
        equipment.starterType === "S/D"
          ? "Star-Delta"
          : equipment.starterType === "VFD"
          ? "VFD"
          : "DOL",
      feederAmps: equipment.rating,
      connectToIncomer:
        equipment.starterType === "VFD" ? "VFD Incomer" : "Main Incomer (S/D)",
    }));

    // Create rating details
    const incomerRatings = incomers.map((incomer) => ({
      currentRating: `${Math.ceil(
        parseFloat(incomer.ampereRating.toString()) * 1.25
      )}A`,
      wiringMaterial: "Copper",
      cablesOrBusBars: "BusBars",
    }));

    const feederRatings = feeders.map((feeder) => ({
      currentRating: `${Math.ceil(feeder.feederAmps * 1.25)}A`,
      wiringMaterial: "Copper",
      cablesOrBusBars: "Cables",
    }));

    // Create incomer types
    const incomerTypes = incomers.map((incomer) => ({
      type: incomer.name.includes("VFD") ? "VFD Incomer" : "Main Incomer",
      rating: incomer.ampereRating,
      protection: "Circuit Breaker",
    }));

    // Create feeder incomer types
    const feederIncomerTypes = feeders.map((feeder) => ({
      name: feeder.name,
      starterType: feeder.starterType,
      protection: "MCCB",
      cableSize: `${Math.ceil(feeder.feederAmps / 3)} sq.mm`,
    }));

    // Merge with user form data if provided
    const formData: WizardFormData = {
      basicInfo: {
        supplyLineVoltage: userFormData?.basicInfo?.supplyLineVoltage || 415,
        supplySystem:
          userFormData?.basicInfo?.supplySystem || "3 Phase 4 Wire, 50Hz",
        controlVoltage: userFormData?.basicInfo?.controlVoltage || 240,
        panelType: userFormData?.basicInfo?.panelType || "MCC Panel",
        numberOfIncomers:
          userFormData?.basicInfo?.numberOfIncomers || incomers.length,
        numberOfOutgoingFeeders:
          userFormData?.basicInfo?.numberOfOutgoingFeeders || feeders.length,
      },
      incomerDetails: {
        incomers: userFormData?.incomerDetails?.incomers || incomers,
        feeders: userFormData?.incomerDetails?.feeders || feeders,
      },
      ratingDetails: {
        incomers: userFormData?.ratingDetails?.incomers || incomerRatings,
        feeders: userFormData?.ratingDetails?.feeders || feederRatings,
      },
      incomerTypes: {
        incomers: userFormData?.incomerTypes?.incomers || incomerTypes,
      },
      feederIncomerTypes: {
        feeders:
          userFormData?.feederIncomerTypes?.feeders || feederIncomerTypes,
      },
      makeDetails: {
        panelMake: userFormData?.makeDetails?.panelMake || "Schneider Electric",
        incomerMake:
          userFormData?.makeDetails?.incomerMake || "Schneider Electric",
        feederMake:
          userFormData?.makeDetails?.feederMake || "Schneider Electric",
        controlMake:
          userFormData?.makeDetails?.controlMake || "Schneider Electric",
        maxHeightFeedersSection:
          userFormData?.makeDetails?.maxHeightFeedersSection || 1700,
        panelDoorsThickness:
          userFormData?.makeDetails?.panelDoorsThickness || 2,
        mountingPlatesThickness1:
          userFormData?.makeDetails?.mountingPlatesThickness1 || 2,
        mountingPlatesThickness2:
          userFormData?.makeDetails?.mountingPlatesThickness2 || 2,
        verticalHorizPartitionsThickness:
          userFormData?.makeDetails?.verticalHorizPartitionsThickness || 2,
        horizontalPartitionsDepth:
          userFormData?.makeDetails?.horizontalPartitionsDepth || 2,
        verticalPartitionsDepth:
          userFormData?.makeDetails?.verticalPartitionsDepth || 400,
        horizontalPartitionRequired:
          userFormData?.makeDetails?.horizontalPartitionRequired || false,
        verticalPartitionRequired:
          userFormData?.makeDetails?.verticalPartitionRequired || false,
      },
      systemDetails: {
        systemType: userFormData?.systemDetails?.systemType || "MCC Panel",
        voltageLevel: userFormData?.systemDetails?.voltageLevel || "415V",
        frequency: userFormData?.systemDetails?.frequency || "50Hz",
        earthingSystem: userFormData?.systemDetails?.earthingSystem || "TN-S",
      },
    };

    // Generate GA layout
    const gaLayout = generateGALayoutFromData(formData);
    console.log("🎨 GA layout generated:", gaLayout);
    revalidatePath("/cp/panel-design");

    return {
      formData,
      gaLayout,
      equipmentData,
    };
  } catch (error) {
    console.error("Error computing wizard data:", error);
    throw new Error("Failed to compute wizard data");
  }
}

export async function generateGALayout(userFormData: WizardFormData) {
  console.log("🎯 generateGALayout called with userFormData:", userFormData);

  try {
    // Extract key data for GA layout
    const numberOfIncomers = userFormData.basicInfo.numberOfIncomers;
    const numberOfFeeders = userFormData.basicInfo.numberOfOutgoingFeeders;

    console.log("📊 GA Layout parameters:", {
      numberOfIncomers,
      numberOfFeeders,
      incomerDetails: userFormData.incomerDetails,
      ratingDetails: userFormData.ratingDetails,
    });

    // Generate GA layout based on the form data
    const layout = generateGALayoutFromData(userFormData);

    console.log("🎨 Generated GA layout:", layout);
    return layout;
  } catch (error) {
    console.error("❌ Error generating GA layout:", error);
    throw error;
  }
}

function generateGALayoutFromData(
  userFormData: WizardFormData
): GALayoutItem[] {
  console.log("🎨 generateGALayoutFromData called with:", userFormData);

  const numberOfIncomers = userFormData.basicInfo.numberOfIncomers;
  const numberOfFeeders = userFormData.basicInfo.numberOfOutgoingFeeders;

  // Create a proper GA layout with all essential components
  const layout: GALayoutItem[] = [];

  // Calculate grid dimensions
  const gridWidth = 12;
  const gridHeight = Math.max(10, numberOfIncomers + numberOfFeeders + 4);

  console.log("📐 Grid dimensions:", {
    gridWidth,
    gridHeight,
    numberOfIncomers,
    numberOfFeeders,
  });

  // 1. HBB (Horizontal Bus Bar) - Top row
  layout.push({
    x: 0,
    y: 0,
    w: gridWidth,
    h: 1,
    label: "HBB",
    type: "HBB",
  });

  // 2. VBB (Vertical Bus Bars) - One for every 6 equipment
  const vbbCount = Math.ceil(Math.max(numberOfIncomers, numberOfFeeders) / 6);
  for (let i = 0; i < vbbCount; i++) {
    const x = 3 + i * 3;
    if (x < gridWidth) {
      layout.push({
        x,
        y: 1,
        w: 1,
        h: gridHeight - 2,
        label: "VBB",
        type: "VBB",
      });
    }
  }

  // 3. Incomers - Second row
  for (let i = 0; i < numberOfIncomers; i++) {
    const incomerData = userFormData.incomerDetails?.incomers?.[i];
    const ratingData = userFormData.ratingDetails?.incomers?.[i];

    layout.push({
      x: i * 3, // 3 columns per incomer
      y: 1,
      w: 3,
      h: 2,
      label: `Incomer ${i + 1} - ${incomerData?.ampereRating || "100"}A`,
      type: "incomer",
      equipmentKey: `incomer-${i + 1}`,
    });
  }

  // 4. Feeders - Below incomers
  for (let i = 0; i < numberOfFeeders; i++) {
    const feederData = userFormData.incomerDetails?.feeders?.[i];
    const ratingData = userFormData.ratingDetails?.feeders?.[i];

    layout.push({
      x: (i % 4) * 3, // 4 feeders per row
      y: 3 + Math.floor(i / 4), // Start below incomers
      w: 3,
      h: 2,
      label: `Feeder ${i + 1} - ${feederData?.feederAmps || "0.01"}A - ${
        feederData?.starterType || "DOL"
      }`,
      type: "feeder",
      equipmentKey: `feeder-${i + 1}`,
    });
  }

  // 5. CTF (Current Transformer) - Bottom left
  layout.push({
    x: 0,
    y: gridHeight - 1,
    w: 1,
    h: 1,
    label: "CTF",
    type: "CTF",
  });

  // 6. CBC (Current Balance Circuit) - Bottom left + 1
  layout.push({
    x: 1,
    y: gridHeight - 1,
    w: 1,
    h: 1,
    label: "CBC",
    type: "CBC",
  });

  // 7. Spare spaces - Fill remaining bottom row
  for (let i = 2; i < gridWidth; i++) {
    layout.push({
      x: i,
      y: gridHeight - 1,
      w: 1,
      h: 1,
      label: "SPARE",
      type: "SPARE",
    });
  }

  console.log("🎨 Final GA layout generated with components:", layout);
  return layout;
}
