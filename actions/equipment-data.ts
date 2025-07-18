"use server";

import { revalidatePath } from "next/cache";

export interface EquipmentData {
  id: number;
  description: string;
  rating: number;
  hp: number;
  starterType: string;
  qty: number;
  height: number;
  width: number;
}

// Mock equipment data - in real app, this would come from database
const mockEquipmentData: EquipmentData[] = [
  {
    id: 1,
    description: "UF Feed Pump",
    rating: 22,
    hp: 29.3,
    starterType: "S/D",
    qty: 5,
    height: 600,
    width: 500,
  },
  {
    id: 2,
    description: "UF Backwash Pumps",
    rating: 30,
    hp: 40.0,
    starterType: "S/D",
    qty: 3,
    height: 600,
    width: 500,
  },
  {
    id: 3,
    description: "UF CIP Pump",
    rating: 30,
    hp: 40.0,
    starterType: "S/D",
    qty: 1,
    height: 600,
    width: 500,
  },
  {
    id: 4,
    description: "RO Feed Pump",
    rating: 18.5,
    hp: 24.7,
    starterType: "S/D",
    qty: 5,
    height: 600,
    width: 500,
  },
  {
    id: 5,
    description: "RO High Pressure Pump with VFD",
    rating: 160,
    hp: 213.3,
    starterType: "VFD",
    qty: 5,
    height: 1400,
    width: 500,
  },
  {
    id: 6,
    description: "CIP Pump",
    rating: 37,
    hp: 49.3,
    starterType: "S/D",
    qty: 1,
    height: 900,
    width: 500,
  },
  {
    id: 7,
    description: "MB Feed Pump",
    rating: 7.5,
    hp: 10.0,
    starterType: "DOL",
    qty: 2,
    height: 300,
    width: 500,
  },
  {
    id: 8,
    description: "CEB-1 Dosing Pump",
    rating: 0.37,
    hp: 0.5,
    starterType: "1 PHASE DOL",
    qty: 2,
    height: 900,
    width: 500,
  },
  {
    id: 9,
    description: "CEB-2 Dosing Pump",
    rating: 0.37,
    hp: 0.5,
    starterType: "1 PHASE DOL",
    qty: 2,
    height: 0,
    width: 0,
  },
  {
    id: 10,
    description: "CEB-3 Dosing Tank",
    rating: 0.37,
    hp: 0.5,
    starterType: "1 PHASE DOL",
    qty: 2,
    height: 0,
    width: 0,
  },
  {
    id: 11,
    description: "SMBS Dosing Pump",
    rating: 0.37,
    hp: 0.5,
    starterType: "1 PHASE DOL",
    qty: 2,
    height: 0,
    width: 0,
  },
  {
    id: 12,
    description: "Antiscalant Dosing Pump",
    rating: 0.37,
    hp: 0.5,
    starterType: "1 PHASE DOL",
    qty: 2,
    height: 0,
    width: 0,
  },
  {
    id: 13,
    description: "pH Correction Dosing Pump",
    rating: 0.37,
    hp: 0.5,
    starterType: "1 PHASE DOL",
    qty: 2,
    height: 0,
    width: 0,
  },
  {
    id: 14,
    description: "pH Correction (Morpholine) Dosing Pump",
    rating: 0.37,
    hp: 0.5,
    starterType: "1 PHASE DOL",
    qty: 2,
    height: 0,
    width: 0,
  },
  {
    id: 15,
    description: "Air Blowers for UF",
    rating: 30,
    hp: 40.0,
    starterType: "S/D",
    qty: 3,
    height: 600,
    width: 500,
  },
  {
    id: 16,
    description: "Air Blower with Motor & Accessories for MB",
    rating: 5.5,
    hp: 7.3,
    starterType: "DOL",
    qty: 2,
    height: 300,
    width: 500,
  },
  {
    id: 17,
    description: "Spares",
    rating: 7.5,
    hp: 10.0,
    starterType: "DOL",
    qty: 1,
    height: 300,
    width: 500,
  },
  {
    id: 18,
    description: "Spares",
    rating: 0.37,
    hp: 0.5,
    starterType: "DOL",
    qty: 1,
    height: 0,
    width: 0,
  },
  {
    id: 19,
    description: "Spares",
    rating: 37,
    hp: 49.3,
    starterType: "S/D",
    qty: 1,
    height: 900,
    width: 500,
  },
];

export async function fetchEquipmentData(): Promise<EquipmentData[]> {
  try {
    // In a real application, this would fetch from a database
    // For now, we'll use mock data
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay

    revalidatePath("/cp/panel-design");
    return mockEquipmentData;
  } catch (error) {
    console.error("Error fetching equipment data:", error);
    throw new Error("Failed to fetch equipment data");
  }
}

export async function updateEquipmentData(
  equipmentData: EquipmentData[]
): Promise<void> {
  try {
    // In a real application, this would save to a database
    console.log("Updating equipment data:", equipmentData);

    revalidatePath("/cp/panel-design");
  } catch (error) {
    console.error("Error updating equipment data:", error);
    throw new Error("Failed to update equipment data");
  }
}
