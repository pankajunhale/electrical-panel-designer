# Panel Data Seeding Service Guide

This guide explains how to use the Panel Data Seeding Service to process electrical equipment data and automatically populate your database tables.

## Overview

The Panel Data Seeding Service takes tabular equipment data (like your MCC VIENTN example) and systematically processes it to create records in the following database tables, in this specific order:

1. **equipment_type** - Equipment type classifications
2. **project** - Projects for organizing panels
3. **panel_location** - Physical locations for panels
4. **starter_type** - Motor starter classifications
5. **breaker_types** - Circuit breaker classifications
6. **panel** - Panel records
7. **feeder** - Individual feeder records
8. **feeder_type** - Feeder classifications
9. **feeder_layout** - Physical layout data for feeders
10. **equipment_data** - Detailed equipment specifications

## Input Data Format

Your input data should be tab-separated with these columns:

```
slno	panelname	item	subqty	typecode	height	width	depth
01	MCC VIENTN	2000A 4P MDO ACB MP	1	ACB	750	1000	400
01	MCC VIENTN	DOL starter 3ph 20HP/15KW	3	STARTE	600	500	300
```

### Column Descriptions:

- **slno**: Serial number for the equipment item
- **panelname**: Name/identifier of the panel (e.g., "MCC VIENTN")
- **item**: Description of the equipment item
- **subqty**: Quantity of this equipment item
- **typecode**: Equipment type code (ACB, SWITCH, STARTE, etc.)
- **height**: Physical height dimension in mm
- **width**: Physical width dimension in mm
- **depth**: Physical depth dimension in mm (optional)

## Usage

### Method 1: Using the Action Directly

```typescript
import { seedPanelDataFromTabular } from "@/actions/panel-data-seeding";

const tabularData = `slno	panelname	item	subqty	typecode	height	width	depth
01	MCC VIENTN	2000A 4P MDO ACB MP	1	ACB	750	1000	400
01	MCC VIENTN	DOL starter 3ph 20HP/15KW	3	STARTE	600	500	300`;

const result = await seedPanelDataFromTabular(tabularData, "your-team-id");

if (result.success) {
  console.log("Data processed successfully!");
  console.log("Created records:", result.data);
} else {
  console.error("Processing failed:", result.errors);
}
```

### Method 2: Using the Example Helper

```typescript
import { processEquipmentData } from "@/examples/panel-data-seeding-example";

// Process the sample data
const result = await processEquipmentData("your-team-id");
```

### Method 3: Using the Service Directly

```typescript
import { PanelDataSeedingService } from "@/lib/panel-data-seeding-service";

const result = await PanelDataSeedingService.seedPanelDesignData(
  tabularData,
  "your-team-id"
);
```

## Data Processing Logic

### Equipment Type Mapping

- **ACB** → Air Circuit Breaker
- **SWITCH** → Switch/Control Equipment
- **STARTE** → Motor Starter
- **MCCB** → Molded Case Circuit Breaker

### Starter Type Detection

The service automatically detects starter types from equipment descriptions:

- **DOL** → Direct Online Starter
- **RDOL** → Reversing Direct Online Starter
- **HDOL** → Heavy Duty Direct Online Starter
- **S/Delta** → Star Delta Starter
- **H S/D** → Heavy Duty Star Delta Starter

### Power Rating Extraction

The service automatically extracts power ratings from descriptions:

- Looks for patterns like "20HP", "15KW", "0.5HP", "3.7KW"
- Stores both HP and KW ratings when available

### Physical Dimensions

- Height, width, and depth values are stored for layout planning
- Zero values are stored as null in the database
- Depth is optional and can be omitted from input data

## Response Format

```typescript
interface SeedingActionResult {
  success: boolean;
  message: string;
  data?: {
    equipmentTypes: number; // Number of equipment types created
    projects: number; // Number of projects created
    panelLocations: number; // Number of panel locations created
    starterTypes: number; // Number of starter types created
    breakerTypes: number; // Number of breaker types created
    panels: number; // Number of panels created
    feeders: number; // Number of feeders created
    feederTypes: number; // Number of feeder types created
    feederLayouts: number; // Number of feeder layouts created
    equipmentData: number; // Number of equipment data records created
  };
  errors?: string[];
}
```

## Data Validation

Before processing, you can validate your data format:

```typescript
import { validateTabularDataFormat } from "@/actions/panel-data-seeding";

const validation = validateTabularDataFormat(tabularData);

if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
  return;
}

console.log(`Found ${validation.rowCount} valid rows`);
```

## Example Output

For your MCC VIENTN data, the service will create:

- **Equipment Types**: Air Circuit Breaker, Switch/Control Equipment, Motor Starter
- **Projects**: "MCC VIENTN Project"
- **Panel Locations**: "MCC VIENTN Location"
- **Starter Types**: Direct Online Starter, Reversing Direct Online Starter, Star Delta Starter, etc.
- **Breaker Types**: Air Circuit Breaker, Molded Case Circuit Breaker
- **Panels**: "MCC VIENTN" panel record
- **Feeders**: Individual feeder records for each equipment item
- **Feeder Types**: Motor Feeder, Control Feeder, Power Feeder, etc.
- **Feeder Layouts**: Physical layout coordinates based on height/width data
- **Equipment Data**: Detailed specifications for each equipment item

## Error Handling

The service provides comprehensive error handling:

- **Validation Errors**: Missing columns, invalid data types
- **Database Errors**: Constraint violations, connection issues
- **Processing Errors**: Data inconsistencies, missing references

All errors are collected and returned in the response for debugging.

## Authentication

The service requires user authentication. Make sure you're logged in before calling the seeding functions.

## Database Relationships

The service automatically handles all database relationships:

- Equipment data is linked to panels
- Panels are linked to projects and locations
- Feeders are linked to panels, starter types, and feeder types
- All records include proper audit trails (created_by, timestamps)

## Idempotency

The service is designed to be idempotent:

- Existing records won't be duplicated
- Re-running with the same data is safe
- Only missing records will be created

## Notes

- The service uses the current authenticated user for audit trails
- All created records use auto-generated UUIDs as primary keys
- The service processes data sequentially to maintain referential integrity
- Physical dimensions (height/width/depth) are used for feeder layout positioning
