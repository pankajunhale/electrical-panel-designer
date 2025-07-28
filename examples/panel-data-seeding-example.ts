import {
  seedPanelDataFromTabular,
  validateTabularDataFormat,
} from "@/actions/panel-data-seeding";

/**
 * Example usage of the Panel Data Seeding Service
 * This demonstrates how to process the provided electrical equipment data
 */

// Your provided tabular data
const sampleTabularData = `slno	panelname	item	subqty	typecode	height	width
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

/**
 * Example function to validate and process the data
 */
export async function processEquipmentData(teamId?: string) {
  console.log("🔍 Validating tabular data format...");

  // Step 1: Validate the data format
  const validation = validateTabularDataFormat(sampleTabularData);

  if (!validation.isValid) {
    console.error("❌ Data validation failed:");
    validation.errors.forEach((error) => console.error(`  - ${error}`));
    return;
  }

  console.log(
    `✅ Data validation passed! Found ${validation.rowCount} valid rows`
  );

  // Step 2: Process the data
  console.log("🚀 Starting data processing...");

  try {
    const result = await seedPanelDataFromTabular(sampleTabularData, teamId);

    if (result.success) {
      console.log("✅ Data processing completed successfully!");
      console.log("📊 Summary:");
      console.log(`  - Equipment Types: ${result.data?.equipmentTypes}`);
      console.log(`  - Projects: ${result.data?.projects}`);
      console.log(`  - Panel Locations: ${result.data?.panelLocations}`);
      console.log(`  - Starter Types: ${result.data?.starterTypes}`);
      console.log(`  - Breaker Types: ${result.data?.breakerTypes}`);
      console.log(`  - Panels: ${result.data?.panels}`);
      console.log(`  - Feeders: ${result.data?.feeders}`);
      console.log(`  - Feeder Types: ${result.data?.feederTypes}`);
      console.log(`  - Feeder Layouts: ${result.data?.feederLayouts}`);
      console.log(`  - Equipment Data: ${result.data?.equipmentData}`);
    } else {
      console.error("❌ Data processing failed:");
      console.error(`Message: ${result.message}`);
      if (result.errors) {
        result.errors.forEach((error) => console.error(`  - ${error}`));
      }
    }

    return result;
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    throw error;
  }
}

/**
 * Example of processing custom tabular data
 */
export async function processCustomData(
  customTabularData: string,
  teamId?: string
) {
  // Validate first
  const validation = validateTabularDataFormat(customTabularData);

  if (!validation.isValid) {
    throw new Error(`Invalid data format: ${validation.errors.join(", ")}`);
  }

  // Process the data
  const result = await seedPanelDataFromTabular(customTabularData, teamId);
  return result;
}

/**
 * Usage instructions:
 *
 * 1. To process the sample data:
 *    ```
 *    import { processEquipmentData } from "@/examples/panel-data-seeding-example";
 *    const result = await processEquipmentData("your-team-id");
 *    ```
 *
 * 2. To process custom data:
 *    ```
 *    import { processCustomData } from "@/examples/panel-data-seeding-example";
 *    const customData = `slno\tpanelname\titem\tsubqty\ttypecode\theight\twidth
 *    01\tMY_PANEL\tMy Equipment\t1\tSWITCH\t300\t500`;
 *    const result = await processCustomData(customData, "your-team-id");
 *    ```
 *
 * 3. Direct usage of the action:
 *    ```
 *    import { seedPanelDataFromTabular } from "@/actions/panel-data-seeding";
 *    const result = await seedPanelDataFromTabular(tabularData, teamId);
 *    ```
 */
