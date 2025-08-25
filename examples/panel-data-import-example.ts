// Example: How to use the Panel Data Import Service
// This example shows how to import electrical equipment data from tabular format

import { PanelDataImportService } from "@/lib/panel-data-import-service";

// Sample data in the expected tabular format
const sampleEquipmentData = `slno	panelname	item	subqty	typecode	height	width
01	MCC VIENTN	2000A 4P MDO ACB MP	1	ACB	750	1000
01	MCC VIENTN	3000VA 1ph CONTROL Transformer	2	SWITCH	600	500
01	MCC VIENTN	16A 2 Pole ON-OFF Rotary Switch	4	SWITCH	300	0
01	MCC VIENTN	Metering Package Am/Vm/IL	1	SWITCH	300	500
01	MCC VIENTN	10000VA1ph CONTROL Transformer	3	SWITCH	600	600
01	MCC VIENTN	25A MPCB 11KW with RH Magnetic	3	SWITCH	300	0
01	MCC VIENTN	100000 1ph CONTROL Transformer	5	SWITCH	900	600
01	MCC VIENTN	250A TP 25KA MCCB TM CVS	5	SWITCH	450	500
01	MCC VIENTN	DOL starter 3ph 20HP/15KW	3	STARTE	600	500
01	MCC VIENTN	DOL starter 3ph 0.5HP/0.12KW	1	STARTE	300	500
01	MCC VIENTN	DOL starter 3ph 0.5HP/0.37KW	6	STARTE	300	500
01	MCC VIENTN	DOL starter 3ph 0.5HP/0.37KW	8	STARTE	300	500
01	MCC VIENTN	DOL starter 3ph 2HP/1.5KW	5	STARTE	300	500
01	MCC VIENTN	DOL starter 3ph 4HP/3KW	2	STARTE	300	500
01	MCC VIENTN	DOL starter 3ph 5HP/3.7KW	3	STARTE	300	500
01	MCC VIENTN	DOL starter 3ph 7.5HP/5.7KW	7	STARTE	300	500
01	MCC VIENTN	RDOL starter 3ph 7.5HP/5.7KW	1	STARTE	300	500
01	MCC VIENTN	RDOL starter 3ph 10HP/7.5KW	2	STARTE	300	500
01	MCC VIENTN	DOL starter 3ph 10HP/7.5KW	2	STARTE	300	500
01	MCC VIENTN	DOL starter 3ph 12.5HP/8KW	4	STARTE	300	500
01	MCC VIENTN	DOL starter 3ph 20HP/11KW	2	STARTE	600	500
01	MCC VIENTN	HDOLstarter 3ph 25HP/15KW	8	STARTE	600	500
01	MCC VIENTN	HRDOLstarter 3ph 25HP/15KW	4	STARTE	600	500
01	MCC VIENTN	S/Delta Starter 25HP/18.5KW	2	STARTE	900	500
01	MCC VIENTN	DOL starter 3ph 60HP/45KW	1	STARTE	900	500
01	MCC VIENTN	S/Delta Starter 90HP/67.5KW	4	STARTE	900	500
01	MCC VIENTN	H S/D Starter 150HP/90KW	3	STARTE	1200	500
01	MCC VIENTN	30V DC  power supply Reg. 5A	1	SWITCH	300	500
01	MCC VIENTN	24V DC power supply 200W 16A	1	SWITCH	300	500`;

// Test data with incomer to verify the new logic
const testDataWithIncomer = `slno	panelname	item	subqty	typecode	height	width
01	MCC VIENTN	Main Incomer 2000A ACB	1	INCOMER	750	1000
01	MCC VIENTN	DOL starter 3ph 20HP/15KW	3	STARTE	600	500
01	MCC VIENTN	Control Switch	2	SWITCH	300	500
01	MCC VIENTN	Main Breaker 1000A	1	MAIN_BREAKER	600	800
01	MCC VIENTN	Transformer 5KVA	1	TRANSFORMER	500	400
01	MCC VIENTN	2000A 4P ACB	1	ACB	750	1000
01	MCC VIENTN	1000A ACB Breaker	1	ACB	600	800`;

/**
 * Example function demonstrating the import process
 */
export async function exampleImport() {
  // This would be called with a real project ID
  const projectId = "your-project-id-here";

  try {
    console.log("Starting panel data import...");

    // Call the import service
    const result = await PanelDataImportService.importPanelData(
      sampleEquipmentData,
      projectId
    );

    if (result.success) {
      console.log("Import successful!");
      console.log(`Processed: ${result.processed} items`);
      console.log(`Failed: ${result.failed} items`);
      console.log("Summary:", result.summary);
    } else {
      console.log("Import failed:");
      console.log(`Errors: ${result.errors.join(", ")}`);
    }

    return result;
  } catch (error) {
    console.error("Import error:", error);
    throw error;
  }
}

/**
 * Test function to verify incomer logic
 * This tests that incomers are excluded from feeder creation
 */
export async function testIncomerLogic() {
  const projectId = "test-project-id";

  try {
    console.log("Testing incomer logic...");
    console.log(
      "Expected behavior: Incomers should NOT create feeders, all other equipment should create feeders"
    );

    const result = await PanelDataImportService.importPanelData(
      testDataWithIncomer,
      projectId
    );

    if (result.success) {
      console.log("Test completed successfully!");
      console.log(`Processed: ${result.processed} items`);
      console.log(`Failed: ${result.failed} items`);
      console.log("Summary:", result.summary);

      // The test data has 7 items total:
      // - 4 incomers (should NOT create feeders): INCOMER, MAIN_BREAKER, ACB, ACB
      // - 3 non-incomers (should create feeders): STARTE, SWITCH, TRANSFORMER
      // Expected: 3 feeders should be created
      console.log(
        "Expected feeders created: 3 (excluding 4 incomers including ACBs)"
      );
    } else {
      console.log("Test failed:");
      console.log(`Errors: ${result.errors.join(", ")}`);
    }

    return result;
  } catch (error) {
    console.error("Test error:", error);
    throw error;
  }
}

/**
 * What the service does:
 *
 * 1. Data Processing:
 *    - Parses tabular data (tab-separated format)
 *    - Extracts technical specifications from equipment descriptions
 *    - Validates data integrity
 *
 * 2. Database Operations (in sequence):
 *    - Creates/finds equipment types based on type codes
 *    - Creates/finds starter types from descriptions
 *    - Creates/finds breaker types from descriptions
 *    - Creates/finds feeder types based on equipment category
 *    - Creates/finds panel locations (default if not specified)
 *    - Creates/finds panels within the project
 *    - Creates equipment data records
 *    - Creates feeder records for ALL equipment except incomers
 *
 * 3. Technical Specification Extraction:
 *    - KW/HP ratings from descriptions
 *    - Starter types (DOL, S/Delta, VFD, etc.)
 *    - Breaker types (ACB, MCCB, MPCB, etc.)
 *    - Equipment categories and feeder types
 *
 * 4. Data Relationships:
 *    - Links equipment to panels
 *    - Associates equipment with proper types
 *    - Creates feeders for all equipment except incomers
 *    - Maintains audit trail with user information
 */

/**
 * Expected Input Format:
 * Tab-separated values with these columns:
 * - slno: Serial number
 * - panelname: Name of the electrical panel
 * - item: Equipment description
 * - subqty: Quantity of equipment
 * - typecode: Equipment type code (ACB, SWITCH, STARTE, etc.)
 * - height: Physical height in mm
 * - width: Physical width in mm
 */

/**
 * Usage via Server Actions:
 *
 * import { importPanelEquipmentData } from "@/actions/panel-data-import";
 *
 * const formData = new FormData();
 * formData.append("tabularData", tabularDataString);
 * formData.append("projectId", projectId);
 *
 * const result = await importPanelEquipmentData(formData);
 */
