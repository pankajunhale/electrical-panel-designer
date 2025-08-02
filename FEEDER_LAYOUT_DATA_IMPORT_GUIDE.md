# Feeder Layout Data Import Guide

## Overview

The Feeder Layout Data Import system allows you to automatically create default feeder layouts for all existing feeders in the database. This system loops through all feeders and creates a default layout for each one that doesn't already have a layout.

## Key Features

- **Automatic Import**: Creates default layouts for all feeders without existing layouts
- **Duplicate Prevention**: Skips feeders that already have layouts to avoid duplicates
- **Statistics Tracking**: Provides detailed statistics about the import process
- **User Tracking**: Records which user created the layouts for audit purposes
- **Real-time Updates**: Automatically refreshes cache after import operations

## How It Works

### 1. Database Schema

The system uses the `FeederLayout` model with the following structure:

```prisma
model FeederLayout {
  id        String   @id @default(uuid())
  feederId  String   @map("feeder_id")  // Reference to Feeder
  x         Int?     // X position
  y         Int?     // Y position
  width     Int?     // Width
  height    Int?     // Height
  viewType  String?  @map("view_type") @db.NVarChar(10) // "front" or "rear"
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime? @map("updated_at")
  deletedAt DateTime? @map("deleted_at")
  createdBy String? @map("created_by")
  updatedBy String? @map("updated_by")
  version   Int @default(1)

  // Relations
  feeder Feeder @relation(fields: [feederId], references: [id], onDelete: Cascade)
  createdByUser User? @relation("FeederLayoutCreatedBy", fields: [createdBy], references: [id])
  updatedByUser User? @relation("FeederLayoutUpdatedBy", fields: [updatedBy], references: [id])

  @@map("feeder_layouts")
}
```

### 2. Import Process

The import process follows these steps:

1. **Fetch All Feeders**: Retrieves all active feeders from the database
2. **Check Existing Layouts**: Identifies which feeders already have layouts
3. **Create Default Layouts**: For each feeder without a layout, creates a default layout with:
   - `x: 0` (default X position)
   - `y: 0` (default Y position)
   - `width: 100` (default width)
   - `height: 50` (default height)
   - `viewType: "front"` (default view type)
4. **Track Results**: Returns detailed statistics about the import process

### 3. Default Values

When creating default layouts, the system uses these default values:

```typescript
{
  x: 0,           // Default X position
  y: 0,           // Default Y position
  width: 100,     // Default width in pixels
  height: 50,     // Default height in pixels
  viewType: "front" // Default view type
}
```

## Usage

### Web Interface

1. Navigate to `/cp/feeder-layout-data-import`
2. View current statistics about feeders and layouts
3. Click "Import Default Feeder Layouts" to start the import
4. View the results and updated statistics

### Programmatic Usage

#### Import Default Layouts

```typescript
import { importDefaultFeederLayouts } from "@/actions/feeder-layout-data-import";

const result = await importDefaultFeederLayouts();

if (result.success) {
  console.log(
    `Created ${result.createdCount} layouts out of ${result.totalFeeders} feeders`
  );
  console.log("Message:", result.message);

  if (result.statistics) {
    console.log("Updated Statistics:", result.statistics);
  }
} else {
  console.error("Import failed:", result.message);
}
```

#### Get Statistics

```typescript
import { getFeederLayoutStatistics } from "@/actions/feeder-layout-data-import";

const statistics = await getFeederLayoutStatistics();

console.log("Total Layouts:", statistics.totalLayouts);
console.log("Total Feeders:", statistics.totalFeeders);
console.log("Feeders with Layouts:", statistics.feedersWithLayouts);
console.log("Feeders without Layouts:", statistics.feedersWithoutLayouts);
```

#### Create Single Layout

```typescript
import { createFeederLayout } from "@/actions/feeder-layout-data-import";

const result = await createFeederLayout({
  feederId: "feeder-uuid",
  x: 100,
  y: 200,
  width: 150,
  height: 75,
  viewType: "front",
});

if (result.success) {
  console.log("Layout created:", result.data);
} else {
  console.error("Failed to create layout:", result.message);
}
```

## API Reference

### Actions

#### `importDefaultFeederLayouts()`

Imports default feeder layouts for all existing feeders.

**Returns:**

```typescript
{
  success: boolean;
  message: string;
  createdCount: number;
  totalFeeders: number;
  statistics?: {
    totalLayouts: number;
    totalFeeders: number;
    feedersWithLayouts: number;
    feedersWithoutLayouts: number;
  };
}
```

#### `getFeederLayoutStatistics()`

Gets current statistics about feeder layouts.

**Returns:**

```typescript
{
  totalLayouts: number;
  totalFeeders: number;
  feedersWithLayouts: number;
  feedersWithoutLayouts: number;
}
```

#### `createFeederLayout(data)`

Creates a single feeder layout.

**Parameters:**

```typescript
{
  feederId: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  viewType?: string | null;
}
```

#### `updateFeederLayout(data)`

Updates an existing feeder layout.

**Parameters:**

```typescript
{
  id: string;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  viewType?: string | null;
}
```

#### `deleteFeederLayout(id)`

Deletes a feeder layout (soft delete).

**Parameters:**

```typescript
id: string;
```

#### `getAllFeederLayouts()`

Gets all feeder layouts.

#### `getFeederLayoutsByFeederId(feederId)`

Gets all layouts for a specific feeder.

**Parameters:**

```typescript
feederId: string;
```

### Service Methods

#### `FeederLayoutService.createDefaultLayoutsForAllFeeders(createdBy?)`

Core method that creates default layouts for all feeders.

**Parameters:**

- `createdBy?: string` - User ID who is creating the layouts

**Returns:**

```typescript
{
  success: boolean;
  message: string;
  createdCount: number;
  totalFeeders: number;
}
```

#### `FeederLayoutService.getStatistics()`

Gets detailed statistics about feeder layouts.

#### `FeederLayoutService.create(data)`

Creates a single feeder layout.

#### `FeederLayoutService.update(data)`

Updates an existing feeder layout.

#### `FeederLayoutService.delete(id, deletedBy?)`

Deletes a feeder layout (soft delete).

#### `FeederLayoutService.findAll()`

Gets all feeder layouts.

#### `FeederLayoutService.findByFeederId(feederId)`

Gets layouts for a specific feeder.

## Error Handling

The system includes comprehensive error handling:

1. **Database Errors**: Catches and logs database operation errors
2. **Validation Errors**: Validates input data before processing
3. **User Session Errors**: Handles cases where user session is invalid
4. **Duplicate Prevention**: Prevents creating duplicate layouts for the same feeder

## Performance Considerations

1. **Batch Processing**: The import processes feeders in batches to avoid memory issues
2. **Efficient Queries**: Uses optimized database queries to check existing layouts
3. **Caching**: Automatically invalidates cache after import operations
4. **Transaction Safety**: Uses database transactions for data consistency

## Security Features

1. **User Tracking**: Records which user performed each operation
2. **Soft Deletes**: Uses soft deletes to maintain data integrity
3. **Input Validation**: Validates all input data before processing
4. **Session Validation**: Ensures user is authenticated before operations

## Monitoring and Logging

The system includes comprehensive logging:

1. **Operation Logs**: Logs all import operations with details
2. **Error Logs**: Logs errors with stack traces for debugging
3. **Performance Logs**: Logs timing information for optimization
4. **Audit Logs**: Tracks who performed what operations when

## Best Practices

1. **Run During Off-Peak Hours**: Import large datasets during low-traffic periods
2. **Monitor Database Performance**: Watch for any performance impacts during import
3. **Backup Before Import**: Always backup your database before running large imports
4. **Test in Development**: Test the import process in development environment first
5. **Review Statistics**: Always review the import statistics to ensure expected results

## Troubleshooting

### Common Issues

1. **Import Fails**: Check database connectivity and user permissions
2. **No Layouts Created**: Verify that feeders exist and don't already have layouts
3. **Performance Issues**: Consider running imports in smaller batches
4. **Memory Issues**: Monitor memory usage during large imports

### Debug Information

The system provides detailed debug information:

```typescript
// Enable debug logging
console.log("Import result:", result);
console.log("Statistics:", statistics);
console.log("Error details:", error);
```

## Examples

See `examples/feeder-layout-data-import-example.ts` for comprehensive usage examples including:

- Basic import operations
- Statistics retrieval
- Single layout creation
- Batch operations
- Data validation
- Complete workflows

## Related Files

- `lib/feeder-layout-service.ts` - Core service implementation
- `actions/feeder-layout-data-import.ts` - Server actions
- `components/forms/FeederLayoutDataImportForm.tsx` - UI component
- `app/cp/feeder-layout-data-import/page.tsx` - Web page
- `dto/feeder-layout.dto.ts` - Data transfer objects
- `schema/ga/feeder-layouts.ts` - Validation schemas
- `examples/feeder-layout-data-import-example.ts` - Usage examples
