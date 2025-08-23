/**
 * Feeder Layout Data Import Examples
 *
 * This file demonstrates how to use the feeder layout data import functionality
 * to create default feeder layouts for all existing feeders.
 */

import {
  importDefaultFeederLayouts,
  getFeederLayoutStatistics,
  createFeederLayout,
  updateFeederLayout,
  deleteFeederLayout,
  getAllFeederLayouts,
  getFeederLayoutsByFeederId,
} from "@/actions/feeder-layout-data-import";

// Example 1: Import default feeder layouts for all feeders
export async function exampleImportDefaultLayouts() {
  console.log("Starting feeder layout import...");

  const result = await importDefaultFeederLayouts();

  if (result.success) {
    console.log("✅ Import successful!");
    console.log(
      `Created ${result.createdCount} layouts out of ${result.totalFeeders} feeders`
    );
    console.log("Message:", result.message);

    if (result.statistics) {
      console.log("Updated Statistics:");
      console.log("- Total Layouts:", result.statistics.totalLayouts);
      console.log("- Total Feeders:", result.statistics.totalFeeders);
      console.log(
        "- Feeders with Layouts:",
        result.statistics.feedersWithLayouts
      );
      console.log(
        "- Feeders without Layouts:",
        result.statistics.feedersWithoutLayouts
      );
    }
  } else {
    console.error("❌ Import failed:", result.message);
  }

  return result;
}

// Example 2: Get feeder layout statistics
export async function exampleGetStatistics() {
  console.log("Getting feeder layout statistics...");

  const statistics = await getFeederLayoutStatistics();

  console.log("📊 Feeder Layout Statistics:");
  console.log("- Total Layouts:", statistics.totalLayouts);
  console.log("- Total Feeders:", statistics.totalFeeders);
  console.log("- Feeders with Layouts:", statistics.feedersWithLayouts);
  console.log("- Feeders without Layouts:", statistics.feedersWithoutLayouts);

  return statistics;
}

// Example 3: Create a single feeder layout
export async function exampleCreateSingleLayout() {
  console.log("Creating a single feeder layout...");

  const result = await createFeederLayout({
    feederId: "example-feeder-id",
    x: 100,
    y: 200,
    width: 150,
    height: 75,
    viewType: "front",
  });

  if (result.success) {
    console.log("✅ Feeder layout created successfully!");
    console.log("Created layout:", result.data);
  } else {
    console.error("❌ Failed to create feeder layout:", result.message);
  }

  return result;
}

// Example 4: Update a feeder layout
export async function exampleUpdateLayout() {
  console.log("Updating a feeder layout...");

  const result = await updateFeederLayout({
    id: "example-layout-id",
    x: 150,
    y: 250,
    width: 200,
    height: 100,
    viewType: "rear",
  });

  if (result.success) {
    console.log("✅ Feeder layout updated successfully!");
    console.log("Updated layout:", result.data);
  } else {
    console.error("❌ Failed to update feeder layout:", result.message);
  }

  return result;
}

// Example 5: Delete a feeder layout
export async function exampleDeleteLayout() {
  console.log("Deleting a feeder layout...");

  const result = await deleteFeederLayout("example-layout-id");

  if (result.success) {
    console.log("✅ Feeder layout deleted successfully!");
  } else {
    console.error("❌ Failed to delete feeder layout:", result.message);
  }

  return result;
}

// Example 6: Get all feeder layouts
export async function exampleGetAllLayouts() {
  console.log("Getting all feeder layouts...");

  const result = await getAllFeederLayouts();

  if (result.success) {
    console.log("✅ Retrieved all feeder layouts!");
    console.log(`Found ${result.data?.length || 0} layouts`);
    console.log("Layouts:", result.data);
  } else {
    console.error("❌ Failed to get feeder layouts:", result.message);
  }

  return result;
}

// Example 7: Get feeder layouts by feeder ID
export async function exampleGetLayoutsByFeederId() {
  console.log("Getting feeder layouts by feeder ID...");

  const result = await getFeederLayoutsByFeederId("example-feeder-id");

  if (result.success) {
    console.log("✅ Retrieved feeder layouts for feeder!");
    console.log(`Found ${result.data?.length || 0} layouts for this feeder`);
    console.log("Layouts:", result.data);
  } else {
    console.error("❌ Failed to get feeder layouts:", result.message);
  }

  return result;
}

// Example 8: Complete workflow - Import and then get statistics
export async function exampleCompleteWorkflow() {
  console.log("🚀 Starting complete feeder layout workflow...");

  // Step 1: Get initial statistics
  console.log("\n📊 Step 1: Getting initial statistics...");
  const initialStats = await getFeederLayoutStatistics();
  console.log("Initial stats:", initialStats);

  // Step 2: Import default layouts
  console.log("\n📥 Step 2: Importing default layouts...");
  const importResult = await importDefaultFeederLayouts();
  console.log("Import result:", importResult);

  // Step 3: Get updated statistics
  console.log("\n📊 Step 3: Getting updated statistics...");
  const finalStats = await getFeederLayoutStatistics();
  console.log("Final stats:", finalStats);

  // Step 4: Show summary
  console.log("\n📋 Summary:");
  console.log(
    `- Initial feeders without layouts: ${initialStats.feedersWithoutLayouts}`
  );
  console.log(`- Layouts created: ${importResult.createdCount}`);
  console.log(
    `- Final feeders without layouts: ${finalStats.feedersWithoutLayouts}`
  );

  return {
    initialStats,
    importResult,
    finalStats,
  };
}

// Example 9: Batch create layouts for specific feeders
export async function exampleBatchCreateLayouts(feederIds: string[]) {
  console.log(`Creating layouts for ${feederIds.length} specific feeders...`);

  const results = [];

  for (const feederId of feederIds) {
    console.log(`Creating layout for feeder: ${feederId}`);

    const result = await createFeederLayout({
      feederId,
      x: Math.floor(Math.random() * 500), // Random position
      y: Math.floor(Math.random() * 300),
      width: 100 + Math.floor(Math.random() * 100), // Random size
      height: 50 + Math.floor(Math.random() * 50),
      viewType: Math.random() > 0.5 ? "front" : "rear", // Random view type
    });

    results.push({ feederId, result });

    if (result.success) {
      console.log(`✅ Created layout for feeder ${feederId}`);
    } else {
      console.error(
        `❌ Failed to create layout for feeder ${feederId}:`,
        result.message
      );
    }
  }

  console.log(`\n📋 Batch creation summary:`);
  console.log(`- Total feeders processed: ${feederIds.length}`);
  console.log(
    `- Successful creations: ${results.filter((r) => r.result.success).length}`
  );
  console.log(
    `- Failed creations: ${results.filter((r) => !r.result.success).length}`
  );

  return results;
}

// Example 10: Validate feeder layout data
export function validateFeederLayoutData(data: any) {
  console.log("Validating feeder layout data...");

  const requiredFields = ["feederId"];
  const optionalFields = ["x", "y", "width", "height", "viewType"];

  const errors = [];

  // Check required fields
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check optional fields
  for (const field of optionalFields) {
    if (data[field] !== undefined && data[field] !== null) {
      if (field === "viewType" && !["front", "rear"].includes(data[field])) {
        errors.push(
          `Invalid viewType: ${data[field]}. Must be 'front' or 'rear'`
        );
      }

      if (
        ["x", "y", "width", "height"].includes(field) &&
        typeof data[field] !== "number"
      ) {
        errors.push(`Invalid ${field}: ${data[field]}. Must be a number`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("❌ Validation errors:", errors);
    return { isValid: false, errors };
  } else {
    console.log("✅ Data validation passed");
    return { isValid: true, errors: [] };
  }
}

// Export all examples for easy access
export const feederLayoutExamples = {
  importDefaultLayouts: exampleImportDefaultLayouts,
  getStatistics: exampleGetStatistics,
  createSingleLayout: exampleCreateSingleLayout,
  updateLayout: exampleUpdateLayout,
  deleteLayout: exampleDeleteLayout,
  getAllLayouts: exampleGetAllLayouts,
  getLayoutsByFeederId: exampleGetLayoutsByFeederId,
  completeWorkflow: exampleCompleteWorkflow,
  batchCreateLayouts: exampleBatchCreateLayouts,
  validateData: validateFeederLayoutData,
};
