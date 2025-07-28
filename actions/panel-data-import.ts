"use server";

import { PanelDataImportService } from "@/lib/panel-data-import-service";
import { revalidatePath } from "next/cache";

export interface ImportActionResult {
  success: boolean;
  message: string;
  processed: number;
  failed: number;
  errors: string[];
  summary?: {
    equipmentCreated: number;
    panelsCreated: number;
    typesCreated: {
      equipment: number;
      starter: number;
      breaker: number;
      feeder: number;
    };
  };
}

/**
 * Server action to import panel equipment data from tabular format
 */
export async function importPanelEquipmentData(
  formData: FormData
): Promise<ImportActionResult> {
  try {
    const rawData = formData.get("tabularData") as string;
    const projectId = formData.get("projectId") as string;

    if (!rawData || !projectId) {
      return {
        success: false,
        message:
          "Missing required data: tabular data and project ID are required",
        processed: 0,
        failed: 1,
        errors: ["Missing required fields"],
      };
    }

    // Validate that we have actual data
    const lines = rawData.trim().split("\n");
    if (lines.length < 2) {
      return {
        success: false,
        message:
          "Invalid data format: Expected header row and at least one data row",
        processed: 0,
        failed: 1,
        errors: ["Invalid data format"],
      };
    }

    // Use the import service
    const result = await PanelDataImportService.importPanelData(
      rawData,
      projectId
    );

    // Revalidate relevant pages
    revalidatePath("/cp/equipment-data");
    revalidatePath("/cp/panels");
    revalidatePath("/cp/feeders");
    revalidatePath("/cp/projects");

    return {
      success: result.success,
      message: result.success
        ? `Successfully imported ${result.processed} equipment items`
        : `Import failed with ${result.errors.length} errors`,
      processed: result.processed,
      failed: result.failed,
      errors: result.errors,
      summary: result.summary,
    };
  } catch (error) {
    console.error("Import action error:", error);
    return {
      success: false,
      message: `Import failed: ${error}`,
      processed: 0,
      failed: 1,
      errors: [String(error)],
    };
  }
}

/**
 * Server action to validate tabular data format before import
 */
export async function validateTabularData(rawData: string): Promise<{
  valid: boolean;
  message: string;
  rowCount: number;
  errors: string[];
}> {
  try {
    if (!rawData || !rawData.trim()) {
      return {
        valid: false,
        message: "No data provided",
        rowCount: 0,
        errors: ["Empty data"],
      };
    }

    const lines = rawData.trim().split("\n");

    if (lines.length < 2) {
      return {
        valid: false,
        message: "At least header and one data row required",
        rowCount: 0,
        errors: ["Insufficient rows"],
      };
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

    const missingHeaders = expectedHeaders.filter(
      (header) => !headers.includes(header)
    );
    if (missingHeaders.length > 0) {
      return {
        valid: false,
        message: `Missing required headers: ${missingHeaders.join(", ")}`,
        rowCount: lines.length - 1,
        errors: [`Missing headers: ${missingHeaders.join(", ")}`],
      };
    }

    // Validate data rows
    const errors: string[] = [];
    const dataRows = lines.slice(1);

    dataRows.forEach((line, index) => {
      const columns = line.split("\t").map((col) => col.trim());
      const rowNum = index + 2; // +2 because we start from line 1 and skip header

      if (columns.length < expectedHeaders.length) {
        errors.push(
          `Row ${rowNum}: Missing columns (expected ${expectedHeaders.length}, got ${columns.length})`
        );
      }

      if (!columns[0]) {
        // slno
        errors.push(`Row ${rowNum}: Missing serial number`);
      }

      if (!columns[1]) {
        // panelname
        errors.push(`Row ${rowNum}: Missing panel name`);
      }

      if (!columns[2]) {
        // item
        errors.push(`Row ${rowNum}: Missing item description`);
      }

      if (!columns[3] || isNaN(parseInt(columns[3]))) {
        // subqty
        errors.push(`Row ${rowNum}: Invalid quantity`);
      }
    });

    return {
      valid: errors.length === 0,
      message:
        errors.length === 0
          ? `Valid data format with ${dataRows.length} equipment items`
          : `Found ${errors.length} validation errors`,
      rowCount: dataRows.length,
      errors: errors.slice(0, 10), // Limit to first 10 errors
    };
  } catch (error) {
    return {
      valid: false,
      message: `Validation failed: ${error}`,
      rowCount: 0,
      errors: [String(error)],
    };
  }
}
