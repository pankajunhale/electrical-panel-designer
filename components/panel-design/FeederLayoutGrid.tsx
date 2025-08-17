"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getFeedersWithLayoutsByPanelId,
  updateFeederLayoutPositions,
} from "@/actions/feeder-layout-data-import";
import { GridStack, GridStackWidget } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import {
  Plus,
  Minus,
  RotateCcw,
  RotateCw,
  GripVertical,
  Cable,
  Zap,
  Ruler,
  Info,
  ArrowUpDown,
  ArrowLeftRight,
  Power,
} from "lucide-react";

// Grid unit in mm (1 grid unit = 100mm for calculations)
const GRID_UNIT_MM = 100;

// Visual cell size in mm (how cells appear in UI)
const VISUAL_CELL_SIZE_MM = 100;

// Convert mm to grid units (1 grid unit = 100mm)
const mmToGrid = (mm: number | null | undefined) => {
  if (!mm) return 1;
  return Math.max(1, Math.ceil(mm / GRID_UNIT_MM));
};

interface FeederWithLayout {
  id: string;
  description: string;
  ratingKw?: number | null;
  ratingHp?: number | null;
  incomerRating?: number | null;
  contactorRating?: number | null;
  controlOperation?: string | null;
  wiringMaterial?: string | null;
  cablesBusBars?: string | null;
  quantity: number;
  starterTypeId?: string | null;
  feederTypeId?: string | null;
  breakerTypeId?: string | null;
  layout: {
    id: string;
    x?: number | null;
    y?: number | null;
    width?: number | null;
    height?: number | null;
    viewType?: string | null;
  } | null;
}

// Component for rendering equipment widgets
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface GALayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  type: string;
  equipmentKey?: string;
}

interface GridWidget extends GALayoutItem {
  id: string;
  originalWidth?: number;
  originalHeight?: number;
}

const EquipmentWidget = ({
  component,
  showDimensions = false,
}: {
  component: GridWidget;
  isResize?: boolean;
  showDimensions?: boolean;
}) => {
  let color = "bg-gray-200 text-gray-800 border-gray-400";
  //const title = component.label;
  const title = `${component.x}×${component.y}`;
  let subtitle = "";
  const height = component.h * 60;
  const width = component.w * 8.33;
  const actualWidth =
    component.originalWidth || component.w * VISUAL_CELL_SIZE_MM;
  const actualHeight =
    component.originalHeight || component.h * VISUAL_CELL_SIZE_MM;

  switch (component.type) {
    case "HBB":
      color = "bg-blue-200 text-blue-900 border-blue-400";
      subtitle = "Horizontal Bus Bar";
      break;
    case "VBB":
      color = "bg-purple-200 text-purple-900 border-purple-400";
      subtitle = "Vertical Bus Bar";
      break;
    case "CABLE_ALLEY":
      color = "bg-green-200 text-green-900 border-green-400";
      subtitle = "Cable Alley";
      break;
    case "incomer":
      color = "bg-red-200 text-red-900 border-red-400";
      subtitle = "Incomer";
      break;
    case "feeder":
      color = "bg-yellow-200 text-yellow-900 border-yellow-400";
      subtitle = "Feeder";
      break;
    case "CTF":
      color = "bg-orange-200 text-orange-900 border-orange-400";
      subtitle = "CTF";
      break;
    case "CBC":
      color = "bg-green-200 text-green-900 border-green-400";
      subtitle = "CBC";
      break;
    case "SPARE":
      color = "bg-gray-200 text-gray-800 border-gray-400";
      subtitle = "SPARE";
      break;
  }

  return (
    <div
      className={`${color} p-3 rounded border text-center h-full w-full flex flex-col justify-center relative`}
    >
      {/* Icon for specific component types */}
      {component.type === "HBB" && (
        <div className="flex items-center justify-center gap-2">
          <ArrowLeftRight className="w-4 h-4" />
          <span className="font-bold text-xs">{title}</span>
        </div>
      )}
      {component.type === "VBB" && (
        <div className="flex justify-center w-full">
          <ArrowUpDown className="w-4 h-4" />
        </div>
      )}
      {component.type === "incomer" && (
        <div className="flex justify-center">
          <Power className="w-4 h-4" />
        </div>
      )}

      {component.type !== "HBB" &&
        component.type !== "incomer" &&
        component.type !== "feeder" && (
          <div className="overflow-hidden w-full">
            <h3 className="font-bold text-[10px] mb-1 truncate w-full">
              {title}
            </h3>
          </div>
        )}
      {subtitle && component.type !== "feeder" && (
        <p className="text-xs opacity-75">{subtitle}</p>
      )}
      {component.type === "feeder" && (
        <div className="overflow-hidden w-full">
          <h3 className="font-bold text-[10px] mb-1 truncate w-full">
            {title}
          </h3>
          <p className="text-[10px] opacity-75 truncate w-full">
            {actualWidth}×{actualHeight}
          </p>
        </div>
      )}
      {showDimensions && (
        <div className="absolute top-1 right-1 text-xs font-mono bg-black/20 text-white px-1 rounded">
          {component.w}×{component.h}
        </div>
      )}
      <div className="hidden text-xs opacity-75">
        {actualWidth}×{actualHeight} mm
      </div>
    </div>
  );
};

interface FeederLayoutGridProps {
  panelId: string;
  onLayoutChange?: (layouts: any[]) => void;
}

export function FeederLayoutGrid({
  panelId,
  onLayoutChange,
}: FeederLayoutGridProps) {
  const [feeders, setFeeders] = useState<FeederWithLayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridColumns, setGridColumns] = useState(12); // Will be updated based on feeder data
  const [layoutItems, setLayoutItems] = useState<GridWidget[]>([]);
  const [showDimensions, setShowDimensions] = useState(false);
  const [showGridInfo, setShowGridInfo] = useState(false);
  const [isUpdatingGrid, setIsUpdatingGrid] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<GridStack | null>(null);

  // Group feeders by width for layout calculation
  const groupFeedersByWidth = (feeders: FeederWithLayout[]) => {
    const groupedFeeders = new Map<number, FeederWithLayout[]>();

    feeders.forEach((feeder) => {
      const width = feeder.layout?.width || 300; // Default to 300mm if width not specified
      if (!groupedFeeders.has(width)) {
        groupedFeeders.set(width, []);
      }
      groupedFeeders.get(width)!.push(feeder);
    });

    return groupedFeeders;
  };

  // Group feeders by height (1800mm limit per group)
  const groupFeedersByHeight = (feeders: FeederWithLayout[]) => {
    const MAX_HEIGHT_MM = 1800;
    const groupedFeeders: FeederWithLayout[][] = [];
    let currentGroup: FeederWithLayout[] = [];
    let currentGroupHeight = 0;

    feeders.forEach((feeder) => {
      const feederHeight = feeder.layout?.height || 300;

      // Check if this feeder would exceed the 1800mm height limit
      if (currentGroupHeight + feederHeight > MAX_HEIGHT_MM) {
        // Start a new group
        if (currentGroup.length > 0) {
          groupedFeeders.push(currentGroup);
        }
        currentGroup = [feeder];
        currentGroupHeight = feederHeight;
      } else {
        // Add to current group
        currentGroup.push(feeder);
        currentGroupHeight += feederHeight;
      }
    });

    // Add the last group if it has feeders
    if (currentGroup.length > 0) {
      groupedFeeders.push(currentGroup);
    }
    console.table(groupedFeeders);
    return groupedFeeders;
  };

  // Calculate required columns based on service calculation
  const calculateRequiredColumns = (feeders: FeederWithLayout[]) => {
    // Group feeders by height (1800mm limit per group)
    debugger;
    const groupedFeeders = groupFeedersByHeight(feeders);
    const totalGroups = Array.from(groupedFeeders.keys()).length;

    // VBB dimensions
    const VBB_WIDTH_MM = 300;
    const VBB_WIDTH_GRID = mmToGrid(VBB_WIDTH_MM); // Convert to grid units (3 columns)

    // Calculate total columns needed:
    // - Feeders total: 1 column per feeder (46 feeders = 46 columns)
    let feederColumns = 0; // feeders.length;
    groupedFeeders.forEach((group) => {
      group.forEach((feeder, index) => {
        if (index === 0 && feeder.layout?.width) {
          feederColumns += mmToGrid(feeder.layout?.width);
        }
      });
    });
    // - Internal VBBs: between groups → (totalGroups - 1) internal VBBs × 3 cols
    const internalVBBColumns = (totalGroups - 1) * VBB_WIDTH_GRID;

    // - Left & Right VBBs = 6 cols (3 cols each) - these are already in default layout
    const sideVBBColumns = 6;

    const totalColumns =
      feederColumns + internalVBBColumns + sideVBBColumns + 0;

    console.log(
      `Calculated columns: ${totalGroups} groups, ${totalColumns} total columns needed`
    );
    console.log(`- Feeder columns: ${feederColumns}`);
    console.log(
      `- Internal VBB columns: ${internalVBBColumns} (${
        totalGroups - 1
      } VBBs × ${VBB_WIDTH_GRID} cols)`
    );
    console.log(`- Side VBB columns: ${sideVBBColumns} (left + right VBBs)`);
    console.log(
      `- Total: ${feederColumns} + ${internalVBBColumns} + ${sideVBBColumns} = ${totalColumns}`
    );

    return Math.max(12, totalColumns); // Minimum 12 columns
  };

  // Load feeders with layouts
  const loadFeeders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getFeedersWithLayoutsByPanelId(panelId);

      if (result.success && result.data) {
        setFeeders(result.data);

        // Calculate and update grid columns based on feeder data
        const requiredColumns = calculateRequiredColumns(result.data);
        setGridColumns(requiredColumns);

        // Create proper feeder layout based on width groups
        const feederWidgets = createFeederLayout(result.data);

        // Update layout items with feeders
        const defaultItems = [
          // Horizontal Bus Bar (Top) - spans full width
          {
            id: "hbb-top",
            x: 0,
            y: 0,
            w: requiredColumns,
            h: 1,
            label: "HBB",
            type: "HBB",
          },
          // Vertical Bus Bar (Left)
          {
            id: "vbb-left",
            x: 0,
            y: 1,
            w: 3,
            h: 18,
            label: "VBB",
            type: "VBB",
          },
          // Vertical Bus Bar (Right)
          {
            id: "vbb-right",
            x: requiredColumns - 1,
            y: 1,
            w: 3,
            h: 18,
            label: "VBB",
            type: "VBB",
          },
        ];

        setLayoutItems([...defaultItems, ...feederWidgets]);

        // Debug: Log grouping information
        const groupedFeeders = groupFeedersByWidth(result.data);
        console.log("Feeder grouping:", {
          totalFeeders: result.data.length,
          groups: Array.from(groupedFeeders.entries()).map(
            ([width, feeders]) => ({
              width: `${width}mm`,
              count: feeders.length,
              feeders: feeders.map((f) => f.description),
            })
          ),
          calculatedColumns: requiredColumns,
          feederWidgets: feederWidgets.length,
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load feeders");
      console.error("Error loading feeders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize default layout items
  const initializeDefaultLayout = () => {
    const defaultItems: GridWidget[] = [
      // Horizontal Bus Bar (Top) - spans full width
      {
        id: "hbb-top",
        x: 0,
        y: 0,
        w: gridColumns,
        h: 1,
        label: "HBB",
        type: "HBB",
      },
      // Vertical Bus Bar (Left)
      {
        id: "vbb-left",
        x: 0,
        y: 1,
        w: 1,
        h: 18,
        label: "VBB",
        type: "VBB",
      },
      // Vertical Bus Bar (Right)
      {
        id: "vbb-right",
        x: gridColumns - 1,
        y: 1,
        w: 1,
        h: 18,
        label: "VBB",
        type: "VBB",
      },
    ];

    setLayoutItems(defaultItems);
  };

  // Create feeder layout based on height groups with proper 1800mm height rules
  const createFeederLayout = (feeders: FeederWithLayout[]) => {
    const groupedFeeders = groupFeedersByHeight(feeders);
    const feederWidgets: GridWidget[] = [];

    let currentX = 3; // Start after left VBB (which is 3 columns wide)
    console.log(`Initial currentX set to: ${currentX} (after left VBB)`);
    const MAX_HEIGHT_MM = 1800; // Maximum height per column
    const VBB_HEIGHT_MM = 1800; // VBB height
    const VBB_WIDTH_MM = 300; // VBB width
    const TOTAL_COLUMNS = calculateRequiredColumns(feeders); // Dynamically calculate columns

    // Sort groups by total height (largest first for better layout)
    const sortedGroups = groupedFeeders
      .map((group, index) => ({
        index,
        group,
        totalHeight: group.reduce(
          (sum, f) => sum + (f.layout?.height || 300),
          0
        ),
      }))
      .sort((a, b) => b.totalHeight - a.totalHeight);

    console.log(
      "Creating feeder layout for groups:",
      sortedGroups.map((groupInfo) => ({
        group: groupInfo.index + 1,
        count: groupInfo.group.length,
        totalHeight: groupInfo.totalHeight,
      }))
    );

    // Calculate columns per group to utilize all dynamically calculated columns
    const totalGroups = sortedGroups.length;
    const columnsPerGroup = Math.max(
      1,
      Math.floor(TOTAL_COLUMNS / totalGroups)
    );
    console.log(
      `Distributing ${totalGroups} groups across ${TOTAL_COLUMNS} columns: ${columnsPerGroup} columns per group`
    );

    sortedGroups.forEach((groupInfo, groupIndex) => {
      console.log(
        `Processing group ${groupIndex}: ${groupInfo.totalHeight}mm total height, ${groupInfo.group.length} feeders`
      );

      // THUMB RULE: Check if group total height exceeds 1800mm
      if (groupInfo.totalHeight > MAX_HEIGHT_MM) {
        console.warn(
          `⚠️ Group ${groupIndex} EXCEEDS 1800mm limit: ${groupInfo.totalHeight}mm. Skipping all feeders in this group.`
        );
        console.warn(
          `Skipped feeders: ${groupInfo.group
            .map((f) => f.description)
            .join(", ")}`
        );
        return; // Skip this entire group
      }

      // Each group now takes multiple columns to utilize all 120 columns
      const columnsForThisGroup = columnsPerGroup;
      const groupStartX = currentX; // Track the start position for this group
      console.log(
        `Group ${groupIndex} needs ${columnsForThisGroup} columns, starting at x=${currentX}`
      );

      // Position feeders in this group with proper height constraints
      let currentColumnHeight = 0;
      let currentColumnInGroup = 0;
      let feederWidth = 0;
      let vbbObj: GridWidget = {
        id: "",
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        label: "",
        type: "",
      };
      groupInfo.group.forEach(
        (feeder: FeederWithLayout, feederIndex: number) => {
          const feederHeight = feeder.layout?.height || 300;
          const feederHeightGrid = mmToGrid(feederHeight);
          const feederWidth = mmToGrid(feeder.layout?.width || 300);
          // Distribute feeders across multiple columns within the group
          const feederX =
            groupStartX + (currentColumnInGroup % columnsForThisGroup);
          // vbb widget
          if (feederIndex === 0) {
            vbbObj = {
              id: `vbb-group-${groupIndex}`,
              x: feederX + feederWidth,
              y: 1,
              w: mmToGrid(VBB_WIDTH_MM), // 300mm width = 3 grid units
              h: mmToGrid(VBB_HEIGHT_MM), // Convert 1800mm to grid units
              label: "VBB",
              type: "VBB",
            };
          }
          const feederWidget: GridWidget = {
            id: feeder.id,
            x: feederX, // Distribute feeders across multiple columns
            y: 1 + currentColumnHeight, // Position at current height in column
            w: feederWidth,
            h: feederHeightGrid,
            label: feeder.description,
            type: "feeder",
            originalWidth: feeder.layout?.width || 300,
            originalHeight: feederHeight,
          };

          feederWidgets.push(feederWidget);

          console.log(
            `Feeder ${feeder.description} at x=${feederWidget.x}, y=${feederWidget.y}, w=${feederWidget.w}, h=${feederWidget.h}`
          );

          // Update position for next feeder
          currentColumnHeight += feederHeightGrid;
          if (currentColumnHeight >= mmToGrid(MAX_HEIGHT_MM)) {
            // Move to next column in this group
            currentColumnInGroup++;
            currentColumnHeight = 0;
          }
        }
      );

      // Add VBB after this group's feeders (except for last group)
      if (groupIndex < sortedGroups.length - 1) {
        // VBB goes after the feeder columns for this group
        const vbbX = groupStartX + feederWidth; // VBB goes after the feeder columns
        feederWidgets.push(vbbObj);
        console.log(
          `Added VBB at x=${vbbX}, y=1, w=3, h=${mmToGrid(VBB_HEIGHT_MM)}`
        );
      }

      // Move to next group position (after all columns used for this group + VBB)
      const previousX = currentX;
      currentX +=
        columnsForThisGroup +
        (groupIndex < sortedGroups.length - 1 ? 3 : 0) -
        3; // Add VBB width if not last group
      console.log(
        `Group ${groupIndex} completed, x incremented from ${previousX} to ${currentX}`
      );
    });

    console.log(`Total feeder widgets created: ${feederWidgets.length}`);
    return feederWidgets;
  };

  // Add column functionality
  const addColumn = () => {
    setIsUpdatingGrid(true);
    const newColumns = gridColumns + 1;
    setGridColumns(newColumns);

    // Update layout items that span full width
    setLayoutItems((prev) =>
      prev.map((item) => {
        if (item.id === "hbb-top") {
          return { ...item, w: newColumns };
        }
        if (item.id === "incomers") {
          return { ...item, w: newColumns - 2 };
        }
        if (item.id === "vbb-right") {
          return { ...item, x: newColumns - 1 };
        }
        return item;
      })
    );

    // Update GridStack instance
    if (gridInstanceRef.current) {
      gridInstanceRef.current.column(newColumns);

      // Update existing widgets in the grid
      const widgets = gridInstanceRef.current.getGridItems();
      widgets.forEach((widget: any) => {
        const el = widget.el;
        const itemId =
          el.getAttribute("gs-id") || el.getAttribute("data-gs-id");

        // Update specific items that need to span full width
        if (itemId === "hbb-top") {
          widget.w = newColumns;
          el.setAttribute("gs-w", newColumns.toString());
        } else if (itemId === "incomers") {
          widget.w = newColumns - 2;
          el.setAttribute("gs-w", (newColumns - 2).toString());
        } else if (itemId === "vbb-right") {
          widget.x = newColumns - 1;
          el.setAttribute("gs-x", (newColumns - 1).toString());
        }
      });

      // Force grid to update
      gridInstanceRef.current.compact();
    }

    // Reset updating state after a short delay
    setTimeout(() => setIsUpdatingGrid(false), 500);
  };

  // Remove column functionality
  const removeColumn = () => {
    if (gridColumns <= 3) return; // Minimum 3 columns

    setIsUpdatingGrid(true);
    const newColumns = gridColumns - 1;
    setGridColumns(newColumns);

    // Update layout items
    setLayoutItems((prev) =>
      prev.map((item) => {
        if (item.id === "hbb-top") {
          return { ...item, w: newColumns };
        }
        if (item.id === "incomers") {
          return { ...item, w: newColumns - 2 };
        }
        if (item.id === "vbb-right") {
          return { ...item, x: newColumns - 1 };
        }
        return item;
      })
    );

    // Update GridStack instance
    if (gridInstanceRef.current) {
      gridInstanceRef.current.column(newColumns);

      // Update existing widgets in the grid
      const widgets = gridInstanceRef.current.getGridItems();
      widgets.forEach((widget: any) => {
        const el = widget.el;
        const itemId =
          el.getAttribute("gs-id") || el.getAttribute("data-gs-id");

        // Update specific items that need to span full width
        if (itemId === "hbb-top") {
          widget.w = newColumns;
          el.setAttribute("gs-w", newColumns.toString());
        } else if (itemId === "incomers") {
          widget.w = newColumns - 2;
          el.setAttribute("gs-w", (newColumns - 2).toString());
        } else if (itemId === "vbb-right") {
          widget.x = newColumns - 1;
          el.setAttribute("gs-x", (newColumns - 1).toString());
        }
      });

      // Force grid to update
      gridInstanceRef.current.compact();
    }

    // Reset updating state after a short delay
    setTimeout(() => setIsUpdatingGrid(false), 500);
  };

  // Add cable alley functionality
  const addCableAlley = (position: "left" | "right") => {
    const newItem: GridWidget = {
      id: `cable-alley-${position}-${Date.now()}`,
      x: position === "left" ? 1 : gridColumns - 2,
      y: 3,
      w: 1,
      h: 18,
      label: "Cable Alley",
      type: "CABLE_ALLEY",
    };

    setLayoutItems((prev) => [...prev, newItem]);

    // Add to GridStack instance if it exists
    if (gridInstanceRef.current) {
      const widget = gridInstanceRef.current.addWidget({
        id: newItem.id,
        x: newItem.x,
        y: newItem.y,
        w: newItem.w,
        h: newItem.h,
        content: `<div class="grid-stack-item-content h-full w-full">
          <div class="bg-green-200 text-green-900  border-green-400 p-3 rounded border text-center h-full w-full flex flex-col justify-center relative">
            <div class="flex justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div class="overflow-hidden w-full">
              <h3 class="font-bold text-[10px] mb-1 truncate w-full">${newItem.label}</h3>
            </div>
            <p class="text-xs opacity-75">Cable Alley</p>
          </div>
        </div>`,
      });
    }
  };

  // Add vertical bus bar functionality
  const addVerticalBusBar = (x: number) => {
    const newItem: GridWidget = {
      id: `vbb-${Date.now()}`,
      x: x,
      y: mmToGrid(100), // Start after top HBB
      w: 1,
      h: mmToGrid(1800), // 1800mm height
      label: "VBB",
      type: "VBB",
    };

    setLayoutItems((prev) => [...prev, newItem]);

    // Add to GridStack instance if it exists
    if (gridInstanceRef.current) {
      const widget = gridInstanceRef.current.addWidget({
        id: newItem.id,
        x: newItem.x,
        y: newItem.y,
        w: newItem.w,
        h: newItem.h,
        content: `<div class="grid-stack-item-content h-full w-full">
          <div class="bg-purple-200 text-purple-900  border-purple-400 p-3 rounded border text-center h-full w-full flex flex-col justify-center relative">
            <div class="flex justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
            </div>
            <div class="overflow-hidden w-full">
              <h3 class="font-bold text-[10px] mb-1 truncate w-full">${newItem.label}</h3>
            </div>
            <p class="text-xs opacity-75">Vertical Bus Bar</p>
          </div>
        </div>`,
      });
    }
  };

  // Add top bus bar functionality
  const addTopBusBar = (y: number) => {
    const newItem: GridWidget = {
      id: `hbb-${Date.now()}`,
      x: 0,
      y: y,
      w: gridColumns,
      h: mmToGrid(200), // 200mm height for other components
      label: "HBB",
      type: "HBB",
    };

    setLayoutItems((prev) => [...prev, newItem]);

    // Add to GridStack instance if it exists
    if (gridInstanceRef.current) {
      const widget = gridInstanceRef.current.addWidget({
        id: newItem.id,
        x: newItem.x,
        y: newItem.y,
        w: newItem.w,
        h: newItem.h,
        content: `<div class="grid-stack-item-content h-full w-full">
          <div class="bg-blue-200 text-blue-900  border-blue-400 p-0 rounded border text-center h-full w-full flex flex-col justify-center relative">
            <div class="flex items-center justify-center gap-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
              <span class="font-bold text-xs">${newItem.label}</span>
            </div>
            <p class="text-xs opacity-75">Horizontal Bus Bar</p>
          </div>
        </div>`,
      });
    }
  };

  // Remove layout item
  const removeLayoutItem = (itemId: string) => {
    setLayoutItems((prev) => prev.filter((item) => item.id !== itemId));

    // Remove from GridStack instance if it exists
    if (gridInstanceRef.current) {
      const widget = gridInstanceRef.current
        .getGridItems()
        .find(
          (item: any) =>
            item.id === itemId ||
            (item as any).el?.getAttribute("gs-id") === itemId
        );
      if (widget) {
        gridInstanceRef.current.removeWidget((widget as any).el);
      }
    }
  };

  // Calculate grid dimensions
  const getGridDimensions = () => {
    const cellWidthPercent = 100 / gridColumns; // Dynamic cell width based on columns
    const totalWidth = gridColumns * cellWidthPercent; // Should equal 100%
    const totalHeight = 10 * 60; // 10 rows * 60px
    return {
      width: `${totalWidth}%`,
      height: `${totalHeight}px`,
      columns: gridColumns,
      rows: 24,
      cellWidth: `${cellWidthPercent}%`,
      cellHeight: "60px",
    };
  };

  // Calculate actual panel dimensions based on feeders
  const getPanelDimensions = () => {
    if (feeders.length === 0) {
      return getGridDimensions();
    }

    // Use the calculated grid columns from feeder data
    const requiredColumns = gridColumns; // This is already calculated based on feeder data
    const requiredRows = Math.max(10, Math.ceil(feeders.length / 6)); // 6 feeders per column max
    const cellWidthPercent = 100 / requiredColumns; // Dynamic cell width

    // Find the maximum feeder dimensions for reference
    let maxWidth = 0;
    let maxHeight = 0;

    feeders.forEach((feeder) => {
      if (feeder.layout) {
        const w = mmToGrid(feeder.layout.width);
        const h = mmToGrid(feeder.layout.height);
        maxWidth = Math.max(maxWidth, w);
        maxHeight = Math.max(maxHeight, h);
      }
    });

    return {
      width: `${requiredColumns * cellWidthPercent}%`,
      height: `${requiredRows * 60}px`,
      columns: requiredColumns,
      rows: requiredRows,
      cellWidth: `${cellWidthPercent}%`,
      cellHeight: "60px",
      maxFeederWidth: maxWidth * VISUAL_CELL_SIZE_MM,
      maxFeederHeight: maxHeight * VISUAL_CELL_SIZE_MM,
    };
  };

  // Initialize gridstack
  useEffect(() => {
    if (!gridRef.current) return;

    // Destroy existing grid if it exists
    if (gridInstanceRef.current) {
      gridInstanceRef.current.destroy();
    }

    // Only initialize if we have feeders or layout items
    if (feeders.length === 0 && layoutItems.length === 0) {
      return;
    }

    console.log(
      "Initializing GridStack with",
      feeders.length,
      "feeders and",
      layoutItems.length,
      "layout items"
    );

    // Initialize GridStack
    const grid = GridStack.init({
      column: gridColumns,
      minRow: 1,
      cellHeight: 60,
      float: false,
      removable: ".trash",
      acceptWidgets: true,
      resizable: {
        handles: "all",
        autoHide: false,
      },
      draggable: {
        handle: ".drag-target",
      },
    });

    gridInstanceRef.current = grid;

    // Listen for layout changes
    grid.on("change", (event: any, items: any[]) => {
      const layouts = items.map((item: any) => ({
        feederId: item.id,
        x: item.x * VISUAL_CELL_SIZE_MM, // Convert grid units back to mm using visual size
        y: item.y * VISUAL_CELL_SIZE_MM,
        width: item.w * VISUAL_CELL_SIZE_MM,
        height: item.h * VISUAL_CELL_SIZE_MM,
      }));

      if (onLayoutChange) {
        onLayoutChange(layouts);
      }
    });

    return () => {
      if (gridInstanceRef.current) {
        gridInstanceRef.current.destroy();
      }
    };
  }, [
    gridRef,
    gridColumns,
    feeders.length,
    layoutItems.length,
    onLayoutChange,
  ]);

  // Initialize default layout on mount
  useEffect(() => {
    initializeDefaultLayout();
  }, []);

  // Load feeders on mount
  useEffect(() => {
    loadFeeders();
  }, [panelId]);

  // Debug: Log when feeders change
  useEffect(() => {
    console.log("Feeders changed:", feeders.length, "feeders available");
  }, [feeders.length]);

  // Save layout positions
  const getAllWidgetPositions = () => {
    const grid = gridInstanceRef.current;
    if (!grid) return [];
    return grid.save();
  };

  const handleSaveLayout = async () => {
    if (!gridInstanceRef.current) return;

    const layouts = getAllWidgetPositions();

    try {
      if (Array.isArray(layouts)) {
        const result = await updateFeederLayoutPositions(
          panelId,
          layouts as any[]
        );
        if (result.success) {
          console.log("Layout saved successfully!");
        } else {
          console.error("Failed to save layout:", result.message);
        }
      }
    } catch (error) {
      console.error("Error saving layout:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading feeders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Feeders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadFeeders} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const gridDimensions = getGridDimensions();
  const panelDimensions = getPanelDimensions();

  return (
    <div className="space-y-6">
      <style jsx>{`
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Panel Feeder Layout</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowDimensions(!showDimensions)}
            variant="outline"
            size="sm"
          >
            <Ruler className="h-3 w-3 mr-1" />
            {showDimensions ? "Hide" : "Show"} Dimensions
          </Button>
          <Button
            onClick={() => setShowGridInfo(!showGridInfo)}
            variant="outline"
            size="sm"
          >
            <Info className="h-3 w-3 mr-1" />
            Grid Info
          </Button>
          <Button onClick={loadFeeders} variant="outline" size="sm">
            Refresh
          </Button>
          <Button onClick={handleSaveLayout} size="sm">
            Save Layout
          </Button>
        </div>
      </div>

      {/* Grid Information Display */}
      {showGridInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Grid Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Width:</span>{" "}
                {gridDimensions.width}
              </div>
              <div>
                <span className="font-medium">Total Height:</span>{" "}
                {gridDimensions.height}
              </div>
              <div>
                <span className="font-medium">Columns:</span>{" "}
                {gridDimensions.columns}
              </div>
              <div>
                <span className="font-medium">Rows:</span> {gridDimensions.rows}
              </div>
              <div>
                <span className="font-medium">Cell Width:</span>{" "}
                {gridDimensions.cellWidth}
              </div>
              <div>
                <span className="font-medium">Cell Height:</span>{" "}
                {gridDimensions.cellHeight}
              </div>
              <div>
                <span className="font-medium">Components:</span>{" "}
                {layoutItems.length + feeders.length}
              </div>
              <div>
                <span className="font-medium">Feeders:</span> {feeders.length}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Layout Control Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Layout Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Column Controls */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium">Columns ({gridColumns})</h4>
              <div className="flex gap-1">
                <Button
                  onClick={addColumn}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={isUpdatingGrid}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  onClick={removeColumn}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={gridColumns <= 3 || isUpdatingGrid}
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </div>
              {isUpdatingGrid && (
                <div className="text-xs text-blue-600 animate-pulse">
                  Updating grid...
                </div>
              )}
            </div>

            {/* Cable Alley Controls */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium">Cable Alley</h4>
              <div className="flex gap-1">
                <Button
                  onClick={() => addCableAlley("left")}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Cable className="h-3 w-3" />
                  Left
                </Button>
                <Button
                  onClick={() => addCableAlley("right")}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Cable className="h-3 w-3" />
                  Right
                </Button>
              </div>
            </div>

            {/* Vertical Bus Bar Controls */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium">Vertical Bus Bar</h4>
              <div className="flex gap-1">
                <Button
                  onClick={() => addVerticalBusBar(Math.floor(gridColumns / 3))}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <GripVertical className="h-3 w-3" />
                  Left
                </Button>
                <Button
                  onClick={() =>
                    addVerticalBusBar(Math.floor((2 * gridColumns) / 3))
                  }
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <GripVertical className="h-3 w-3" />
                  Right
                </Button>
              </div>
            </div>

            {/* Top Bus Bar Controls */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium">Top Bus Bar</h4>
              <div className="flex gap-1">
                <Button
                  onClick={() => addTopBusBar(4)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Zap className="h-3 w-3" />
                  Add
                </Button>
                <Button
                  onClick={() => addTopBusBar(6)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Zap className="h-3 w-3" />
                  Bottom
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Panel ID: {panelId} | Feeders: {feeders.length} | Columns: {gridColumns}{" "}
        | Grid: {panelDimensions.columns}×{panelDimensions.rows} | Size:{" "}
        {panelDimensions.width} × {panelDimensions.height}
        {(panelDimensions as any).maxFeederWidth && (
          <span>
            {" "}
            | Max Feeder: {(panelDimensions as any).maxFeederWidth}×
            {(panelDimensions as any).maxFeederHeight} mm
          </span>
        )}
      </div>

      {/* Layout Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Panel Layout Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
              <span className="text-xs">HBB - Horizontal Bus Bar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-200 border border-purple-400 rounded"></div>
              <span className="text-xs">VBB - Vertical Bus Bar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
              <span className="text-xs">Cable Alley</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
              <span className="text-xs">Incomers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
              <span className="text-xs">Feeders</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {feeders.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Panel Data Available
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Import panel data first to create feeders and display the
                  layout grid.
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Go to Data Import section</p>
                  <p>• Upload your panel data file</p>
                  <p>• Return here to see the layout grid</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Grid Container */}
          <div
            ref={gridRef}
            className={`grid-stack border-2 border-dashed relative ${
              isUpdatingGrid ? "opacity-75" : ""
            }`}
            style={{
              backgroundImage: `
                   linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                 `,
              backgroundSize: `${100 / panelDimensions.columns}% 60px`,
              height: panelDimensions.height,
            }}
          >
            {isUpdatingGrid && (
              <div className="absolute inset-0 bg-blue-50/50 flex items-center justify-center z-10">
                <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium text-blue-600">
                      Updating Grid Layout...
                    </span>
                  </div>
                </div>
              </div>
            )}
            {/* Grid Dimension Labels */}
            {showDimensions && (
              <>
                {/* Column labels */}
                {Array.from({ length: gridColumns }, (_, i) => (
                  <div
                    key={`col-${i}`}
                    className="absolute top-0 text-xs font-mono text-gray-600 bg-white/80 px-1 rounded"
                    style={{
                      left: `${(i * 100) / gridColumns}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
                {/* Row labels */}
                {Array.from({ length: panelDimensions.rows }, (_, i) => (
                  <div
                    key={`row-${i}`}
                    className="absolute left-0 text-xs font-mono text-gray-600 bg-white/80 px-1 rounded"
                    style={{
                      top: `${i * 60}px`,
                      transform: "translateY(-50%)",
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
                {/* Grid cell unit labels */}
                {Array.from({ length: panelDimensions.columns }, (_, col) =>
                  Array.from({ length: panelDimensions.rows }, (_, row) => (
                    <div
                      key={`cell-${col}-${row}`}
                      className="absolute text-xs font-mono text-gray-400 bg-white/60 px-1 rounded border border-gray-200"
                      style={{
                        left: `${(col * 100) / panelDimensions.columns}%`,
                        top: `${row * 60}px`,
                        width: `${100 / panelDimensions.columns}%`,
                        height: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {VISUAL_CELL_SIZE_MM}×{VISUAL_CELL_SIZE_MM}
                    </div>
                  ))
                )}
              </>
            )}

            {/* Layout Items */}
            {layoutItems.map((item) => (
              <div
                key={item.id}
                className="grid-stack-item"
                gs-w={item.w}
                gs-h={item.h}
                gs-x={item.x}
                gs-y={item.y}
                gs-no-resize="true"
                gs-no-move={
                  item.id.startsWith("hbb-top") ||
                  item.id.startsWith("incomers")
                    ? "true"
                    : "false"
                }
              >
                <div className="grid-stack-item-content h-full w-full">
                  <EquipmentWidget
                    component={item}
                    isResize={true}
                    showDimensions={showDimensions}
                  />
                </div>
              </div>
            ))}

            {/* Feeders are now handled through layoutItems */}
          </div>

          {/* Feeders List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Feeders in Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeders.map((feeder) => (
                  <div
                    key={feeder.id}
                    className="p-3 border rounded-lg bg-yellow-50"
                  >
                    <h4 className="font-medium text-sm mb-1">
                      {feeder.description}
                    </h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {feeder.ratingKw && <p>Power: {feeder.ratingKw} kW</p>}
                      {feeder.ratingHp && <p>HP: {feeder.ratingHp}</p>}
                      {feeder.incomerRating && (
                        <p>Incomer: {feeder.incomerRating}A</p>
                      )}
                      {feeder.layout ? (
                        <p className="text-green-600">
                          Position: ({feeder.layout.x}, {feeder.layout.y}) |
                          Size: {feeder.layout.width}×{feeder.layout.height}
                        </p>
                      ) : (
                        <p className="text-orange-600">No layout assigned</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
