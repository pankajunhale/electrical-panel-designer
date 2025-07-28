"use server";

import { PanelDataSeedingService } from "@/lib/panel-data-seeding-service";
import { revalidatePath } from "next/cache";

export interface SeedingActionResult {
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
 * Action to seed panel design data from tabular input
 */
export async function seedPanelDataFromTabular(
  tabularData: string,
  teamId?: string
): Promise<SeedingActionResult> {
  try {
    const result = await PanelDataSeedingService.seedPanelDesignData(
      tabularData,
      teamId
    );

    if (result.success) {
      // Revalidate all relevant paths
      revalidatePath("/cp/equipment-data");
      revalidatePath("/cp/equipment-types");
      revalidatePath("/cp/projects");
      revalidatePath("/cp/panel-locations");
      revalidatePath("/cp/starter-types");
      revalidatePath("/cp/breaker-types");
      revalidatePath("/cp/panels");
      revalidatePath("/cp/feeders");
      revalidatePath("/cp/feeder-types");
      revalidatePath("/cp/feeder-layouts");
    }

    return result;
  } catch (error) {
    console.error("Error in seedPanelDataFromTabular action:", error);
    return {
      success: false,
      message: "Failed to process panel data",
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * Utility function to validate tabular data format
 */
export function validateTabularDataFormat(data: string): {
  isValid: boolean;
  errors: string[];
  rowCount: number;
} {
  const lines = data.trim().split("\n");
  const errors: string[] = [];

  if (lines.length < 2) {
    errors.push("Data must contain at least a header row and one data row");
    return { isValid: false, errors, rowCount: 0 };
  }

  // Check header format
  const headers = lines[0].split("\t").map((h) => h.trim().toLowerCase());
  const expectedHeaders = [
    "slno",
    "panelname",
    "item",
    "subqty",
    "typecode",
    "height",
    "width",
  ];
  const optionalHeaders = ["depth"];

  for (const expectedHeader of expectedHeaders) {
    if (!headers.includes(expectedHeader)) {
      errors.push(`Missing required header: ${expectedHeader}`);
    }
  }

  // Check data rows
  const dataRows = lines.slice(1);
  let validRows = 0;

  dataRows.forEach((line, index) => {
    const values = line.split("\t").map((v) => v.trim());

    if (values.length < 7) {
      errors.push(
        `Row ${index + 2}: Insufficient columns (expected 7-8, got ${
          values.length
        })`
      );
      return;
    }

    // Validate required fields
    if (!values[0]) errors.push(`Row ${index + 2}: Missing serial number`);
    if (!values[1]) errors.push(`Row ${index + 2}: Missing panel name`);
    if (!values[2]) errors.push(`Row ${index + 2}: Missing item description`);
    if (!values[3] || isNaN(parseInt(values[3])))
      errors.push(`Row ${index + 2}: Invalid quantity`);
    if (!values[4]) errors.push(`Row ${index + 2}: Missing type code`);

    if (errors.length === 0) validRows++;
  });

  return {
    isValid: errors.length === 0,
    errors,
    rowCount: validRows,
  };
}
