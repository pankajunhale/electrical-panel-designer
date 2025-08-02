/**
 * Example: How to use Feeder Layout functionality with Panel Data Import
 *
 * This example shows how the feeder layout system works with the panel data import service.
 */

import { PanelDataImportService } from "@/lib/panel-data-import-service";
import { FeederLayoutService } from "@/lib/feeder-layout-service";
import {
  getFeedersWithLayoutsByPanelId,
  updateFeederLayoutPositions,
} from "@/actions/feeder-layout-data-import";

// Example 1: Import panel data and automatically create feeder layouts
export async function exampleImportPanelDataWithFeederLayouts() {
  const rawData = `
SLNO	PANELNAME	ITEM	SUBQTY	TYPECODE	HEIGHT	WIDTH
1	Panel-001	UF Feed Pump	1	STARTE	100	50
2	Panel-001	RO High Pressure Pump	1	STARTE	120	60
3	Panel-001	UF Backwash Pumps	2	STARTE	100	50
4	Panel-001	UF CIP Pump	1	STARTE	100	50
5	Panel-001	RO Feed Pump	1	STARTE	100	50
  `;

  const projectId = "your-project-id";

  try {
    // Step 1: Import panel data (this will automatically create feeder layouts)
    const importResult = await PanelDataImportService.importPanelData(
      rawData,
      projectId
    );

    console.log("Import Result:", importResult);

    // Step 2: Get the panel ID from the import result
    // You would need to extract this from your actual import process
    const panelId = "extracted-panel-id";

    // Step 3: Load feeders with their layouts for gridstack rendering
    const feedersWithLayouts = await getFeedersWithLayoutsByPanelId(panelId);

    if (feedersWithLayouts.success && feedersWithLayouts.data) {
      console.log("Feeders with layouts:", feedersWithLayouts.data);

      // Step 4: Use the data for gridstack rendering
      const gridstackData = feedersWithLayouts.data.map((feeder) => ({
        id: feeder.id,
        x: feeder.layout?.x || 0,
        y: feeder.layout?.y || 0,
        w: feeder.layout?.width || 2,
        h: feeder.layout?.height || 1,
        content: `
          <div class="feeder-widget bg-yellow-200 text-yellow-900 border border-yellow-400 p-3 rounded text-center">
            <h3 class="font-bold text-sm mb-1">${feeder.description}</h3>
            <p class="text-xs opacity-75">Feeder</p>
            ${
              feeder.ratingKw
                ? `<p class="text-xs opacity-75">${feeder.ratingKw} kW</p>`
                : ""
            }
            ${
              feeder.ratingHp
                ? `<p class="text-xs opacity-75">${feeder.ratingHp} HP</p>`
                : ""
            }
          </div>
        `,
      }));

      console.log("GridStack data:", gridstackData);
    }
  } catch (error) {
    console.error("Error in import process:", error);
  }
}

// Example 2: Update feeder layout positions after user drags/resizes in gridstack
export async function exampleUpdateFeederLayoutPositions() {
  const panelId = "your-panel-id";

  // This would come from gridstack after user interaction
  const updatedLayouts = [
    {
      feederId: "feeder-1",
      x: 0,
      y: 0,
      width: 2,
      height: 1,
    },
    {
      feederId: "feeder-2",
      x: 2,
      y: 0,
      width: 3,
      height: 2,
    },
    {
      feederId: "feeder-3",
      x: 0,
      y: 1,
      width: 2,
      height: 1,
    },
  ];

  try {
    const result = await updateFeederLayoutPositions(panelId, updatedLayouts);

    if (result.success) {
      console.log("Layout positions updated successfully!");
    } else {
      console.error("Failed to update layout positions:", result.message);
    }
  } catch (error) {
    console.error("Error updating layout positions:", error);
  }
}

// Example 3: Create default layouts for existing feeders
export async function exampleCreateDefaultLayoutsForExistingFeeders() {
  try {
    const result =
      await FeederLayoutService.createDefaultLayoutsForAllFeeders();

    console.log("Default layouts created:", result);

    // Get statistics
    const stats = await FeederLayoutService.getStatistics();
    console.log("Feeder layout statistics:", stats);
  } catch (error) {
    console.error("Error creating default layouts:", error);
  }
}

// Example 4: React component usage with gridstack
export const exampleReactComponent = `
"use client";

import { useEffect, useRef, useState } from "react";
import { getFeedersWithLayoutsByPanelId, updateFeederLayoutPositions } from "@/actions/feeder-layout-data-import";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";

export function FeederLayoutGrid({ panelId }: { panelId: string }) {
  const [feeders, setFeeders] = useState([]);
  const gridRef = useRef(null);
  const gridInstanceRef = useRef(null);

  // Load feeders with layouts
  useEffect(() => {
    const loadFeeders = async () => {
      const result = await getFeedersWithLayoutsByPanelId(panelId);
      if (result.success && result.data) {
        setFeeders(result.data);
      }
    };
    
    loadFeeders();
  }, [panelId]);

  // Initialize gridstack
  useEffect(() => {
    if (!gridRef.current || feeders.length === 0) return;

    const grid = GridStack.init({
      column: 12,
      cellHeight: 60,
      animate: true,
    });

    gridInstanceRef.current = grid;

    // Add feeders to grid
    feeders.forEach((feeder) => {
      if (feeder.layout) {
        const widget = {
          x: feeder.layout.x || 0,
          y: feeder.layout.y || 0,
          w: feeder.layout.width || 2,
          h: feeder.layout.height || 1,
          id: feeder.id,
          content: \`
            <div class="feeder-widget bg-yellow-200 text-yellow-900 border border-yellow-400 p-3 rounded text-center">
              <h3 class="font-bold text-sm mb-1">\${feeder.description}</h3>
              <p class="text-xs opacity-75">Feeder</p>
              \${feeder.ratingKw ? \`<p class="text-xs opacity-75">\${feeder.ratingKw} kW</p>\` : ''}
            </div>
          \`
        };
        
        grid.addWidget(widget);
      }
    });

    // Listen for layout changes
    grid.on("change", async (event, items) => {
      const layouts = items.map((item) => ({
        feederId: item.id,
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
      }));
      
      // Save layout changes
      await updateFeederLayoutPositions(panelId, layouts);
    });

    return () => {
      if (gridInstanceRef.current) {
        gridInstanceRef.current.destroy();
      }
    };
  }, [feeders, panelId]);

  return (
    <div
      ref={gridRef}
      className="grid-stack border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[400px]"
    >
      {/* Grid items will be added here by GridStack */}
    </div>
  );
}
`;

// Example 5: Integration with existing panel design workflow
export const examplePanelDesignIntegration = `
// In your panel design component:

import { FeederLayoutGrid } from "@/components/panel-design/FeederLayoutGrid";

export function PanelDesignPage({ panelId }: { panelId: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Panel Design</h1>
      
      {/* Other panel design components */}
      
      {/* Feeder Layout Grid */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Feeder Layout</h2>
        <FeederLayoutGrid panelId={panelId} />
      </div>
      
      {/* Other components */}
    </div>
  );
}
`;

// Summary of what was implemented:
export const implementationSummary = {
  panelDataImportService: {
    updated:
      "Added createFeederLayout function that automatically creates feeder layouts when feeders are created",
    location: "lib/panel-data-import-service.ts",
    changes: [
      "Modified createFeeder function to call createFeederLayout for each newly created feeder",
      "Added createFeederLayout function that creates default layout positions",
      "Handles errors gracefully without breaking the main import process",
    ],
  },
  feederLayoutService: {
    updated: "Added new methods for gridstack integration",
    location: "lib/feeder-layout-service.ts",
    newMethods: [
      "getFeedersWithLayoutsByPanelId() - Loads feeders with their layouts for a specific panel",
      "updateFeederLayoutPositions() - Updates layout positions after user interaction",
    ],
  },
  actions: {
    updated: "Added new server actions for feeder layout operations",
    location: "actions/feeder-layout-data-import.ts",
    newActions: [
      "getFeedersWithLayoutsByPanelId() - Server action to load feeders with layouts",
      "updateFeederLayoutPositions() - Server action to save layout changes",
    ],
  },
  component: {
    created: "FeederLayoutGrid component for gridstack integration",
    location: "components/panel-design/FeederLayoutGrid.tsx",
    features: [
      "Loads feeders with their layouts from the database",
      "Renders feeders in a gridstack grid",
      "Saves layout changes when users drag/resize feeders",
      "Handles loading states and errors",
    ],
  },
  usage: {
    workflow: [
      "1. Import panel data using PanelDataImportService.importPanelData()",
      "2. Feeders are automatically created with default layouts",
      "3. Use getFeedersWithLayoutsByPanelId() to load feeders for gridstack",
      "4. Render feeders in gridstack grid for user interaction",
      "5. Save layout changes using updateFeederLayoutPositions()",
    ],
  },
};
