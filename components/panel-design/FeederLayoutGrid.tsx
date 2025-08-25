"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getFeedersWithLayoutsByPanelId,
  updateFeederLayoutPositions,
} from "@/actions/feeder-layout-data-import";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import {
  Plus,
  Minus,
  GripVertical,
  Cable,
  Zap,
  Ruler,
  Info,
  ArrowUpDown,
  ArrowLeftRight,
  Power,
  ToggleLeft,
} from "lucide-react";

// Grid unit in mm (1 grid unit = 300mm for calculations)
const GRID_UNIT_MM = 100;

// Visual cell size in mm (how cells appear in UI)
const VISUAL_CELL_SIZE_MM = 100;

// Convert mm to grid units (1 grid unit = 300mm)
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
  feederTypeName?: string | null;
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
  feeders = [],
}: {
  component: GridWidget;
  isResize?: boolean;
  showDimensions?: boolean;
  feeders?: FeederWithLayout[];
}) => {
  let color = "bg-gray-200 text-gray-800 border-gray-400";
  const title = component.label;
  //const title = `${component.x}×${component.y}`;
  let subtitle = "";
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
      subtitle = "VBB";
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
      className={`${color} p-3 rounded border text-center h-full w-full flex flex-col justify-center items-center relative`}
    >
      {/* Icon for specific component types */}
      {component.type === "HBB" && (
        <div className="flex items-center justify-center gap-4">
          <ArrowLeftRight className="w-4 h-4" />
          <span className="font-bold text-xs">{title}</span>
        </div>
      )}
      {component.type === "VBB" && (
        <div className="flex justify-center items-center w-full">
          <ArrowUpDown className="w-10 h-10" />
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
          <h3 className="font-bold text-[10px] mb-1 w-full">{title}</h3>
          <p className="text-[10px] opacity-75 w-full">
            {actualWidth}×{actualHeight}
          </p>
          {/* Show switch icon if feeder type is switch */}
          {component.equipmentKey &&
            (() => {
              const feeder = feeders.find(
                (f) => f.id === component.equipmentKey
              );
              const feederTypeName =
                feeder?.feederTypeName?.toLowerCase() || "";
              const description = feeder?.description?.toLowerCase() || "";
              const isSwitch =
                feederTypeName.includes("switch") ||
                feederTypeName.includes("control") ||
                description.includes("switch") ||
                description.includes("control");
              return isSwitch ? (
                <div className="flex justify-center mt-1">
                  <ToggleLeft className="w-3 h-3" />
                </div>
              ) : null;
            })()}
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const [isAddBottomBusBar, setIsAddBottomBusBar] = useState(false);
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

  // Calculate required columns based on the new layout logic
  const calculateRequiredColumns = (feeders: FeederWithLayout[]) => {
    // Group feeders by width first
    const groupedFeeders = groupFeedersByHeight(feeders);
    let totalColumnsNew = 6;
    groupedFeeders.map((group, outerIndex) => {
      if (outerIndex === 0) {
        totalColumnsNew += mmToGrid(300);
      }
      group.forEach((feeder, index) => {
        if (index === 0) {
          totalColumnsNew += mmToGrid(feeder.layout?.width || 300);
          // add vbb after this width group
          totalColumnsNew += mmToGrid(300);
        }
      });
      if (outerIndex === groupedFeeders.length - 1) {
        totalColumnsNew += mmToGrid(300);
      }
    });

    // Sort width groups by width (largest first)
    const sortedWidthGroups = Array.from(groupedFeeders.entries()).sort(
      ([widthA], [widthB]) => widthB - widthA
    );

    // VBB dimensions
    const VBB_WIDTH_MM = 300;
    const VBB_WIDTH_GRID = mmToGrid(VBB_WIDTH_MM); // Convert to grid units (3 columns)
    const MAX_HEIGHT_MM = 1800;

    let totalColumns = 3; // Start with left cable alley (3 columns)
    sortedWidthGroups.forEach(([width, widthGroupFeeders], widthGroupIndex) => {
      console.log(
        `Processing width group ${widthGroupIndex}: ${width}mm width, ${widthGroupFeeders.length} feeders`
      );
    });
    // Calculate columns for each width group
    sortedWidthGroups.forEach(([width, widthGroupFeeders], widthGroupIndex) => {
      const feederWidthGrid = mmToGrid(width);
      // Calculate how many columns we need for this width group
      // Each column can hold feeders up to 1800mm height
      let currentColumnHeight = 0;
      let columnsNeededForWidth = 0;

      widthGroupFeeders.forEach((feeder) => {
        const feederHeight = feeder.layout?.height || 300;

        if (currentColumnHeight + feederHeight > MAX_HEIGHT_MM) {
          // Need a new column
          columnsNeededForWidth += 1;
          currentColumnHeight = feederHeight;
        } else {
          // Can fit in current column
          currentColumnHeight += feederHeight;
        }
      });

      // Add at least one column if we have feeders
      if (widthGroupFeeders.length > 0 && columnsNeededForWidth === 0) {
        columnsNeededForWidth = 1;
      }

      // Add columns for this width group (each column is feederWidthGrid wide)
      totalColumns += columnsNeededForWidth * feederWidthGrid;

      // Add VBB after this width group (except for last width group)
      if (widthGroupIndex < sortedWidthGroups.length - 1) {
        totalColumns += VBB_WIDTH_GRID;
      }
    });

    // Add right cable alley (3 columns)
    totalColumns += 3;

    console.log(
      `Calculated columns for new layout logic: ${totalColumns} total columns needed`
    );
    console.log(`- Width groups: ${sortedWidthGroups.length}`);
    console.log(`- Left cable alley: 3 columns`);
    console.log(`- Right cable alley: 3 columns`);
    console.log(`- Total: ${totalColumns} columns`);

    return Math.max(12, totalColumnsNew); // Minimum 12 columns
  };

  // Load feeders with layouts
  const loadFeeders = async (isAddBottomBusBar: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const VBB_HEIGHT_MM = 1800;
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
            id: "cable-alley-left",
            x: 0,
            y: 1,
            w: 3,
            h: 18,
            label: "",
            type: "CABLE_ALLEY",
          },
          // Vertical Bus Bar (Right)
          {
            id: "cable-alley-right",
            x: requiredColumns - 3,
            y: 1,
            w: 3,
            h: 18,
            label: "",
            type: "CABLE_ALLEY",
          },
        ];

        if (isAddBottomBusBar) {
          // Horizontal Bus Bar (Bottom) - spans full width
          const bottomBusBar = [
            {
              id: "hbb-bottom",
              x: 0,
              y: mmToGrid(VBB_HEIGHT_MM) + 1,
              w: requiredColumns,
              h: 1,
              label: "HBB",
              type: "HBB",
            },
          ];
          setLayoutItems([...defaultItems, ...bottomBusBar, ...feederWidgets]);
        } else {
          setLayoutItems([...defaultItems, ...feederWidgets]);
        }

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

  // Create feeder layout based on width groups - orders by larger width groups first
  const createFeederLayout = (feeders: FeederWithLayout[]) => {
    const feederWidgets: GridWidget[] = [];
    let currentX = 3; // Start after left VBB (which is 3 columns wide)
    const VBB_WIDTH_MM = 300; // VBB width
    const VBB_HEIGHT_MM = 1800; // VBB height
    const MAX_HEIGHT_MM = 1800; // Maximum height per column

    // Group feeders by width
    const groupedFeeders = groupFeedersByWidth(feeders);

    // Sort width groups by width (largest first)
    const sortedWidthGroups = Array.from(groupedFeeders.entries()).sort(
      ([widthA], [widthB]) => widthB - widthA
    );

    console.log(
      "Creating feeder layout by width groups:",
      sortedWidthGroups.map(([width, feeders]) => ({
        width: `${width}mm`,
        count: feeders.length,
        feeders: feeders.map((f) => f.description),
      }))
    );

    // Track columns and their available space for each width group
    const columnSpaceMap = new Map<number, Map<number, number>>(); // width -> Map<x, availableHeight>
    const skippedFeeders = new Map<number, FeederWithLayout[]>(); // width -> skipped feeders

    sortedWidthGroups.forEach(([width, widthGroupFeeders], widthGroupIndex) => {
      console.log(
        `Processing width group ${widthGroupIndex}: ${width}mm width, ${widthGroupFeeders.length} feeders`
      );

      // Group feeders within this width by height (1800mm limit per column)
      const heightGroups = groupFeedersByHeight(widthGroupFeeders);
      const feederWidthGrid = mmToGrid(width);

      // Initialize column space tracking for this width
      if (!columnSpaceMap.has(width)) {
        columnSpaceMap.set(width, new Map());
      }
      const widthColumnSpace = columnSpaceMap.get(width)!;
      const skippedFeedersForWidth: FeederWithLayout[] = [];

      heightGroups.forEach((heightGroup, heightGroupIndex) => {
        console.log(
          `Processing height group ${heightGroupIndex} within width ${width}mm: ${heightGroup.length} feeders`
        );

        // Position feeders in this height group
        let currentColumnHeight = 0;
        const currentColumnX = currentX;

        heightGroup.forEach((feeder) => {
          const feederHeight = feeder.layout?.height || 300;
          const feederHeightGrid = mmToGrid(feederHeight);

          // Check if adding this feeder would exceed 1800mm in current column
          if (
            currentColumnHeight + feederHeightGrid >
            mmToGrid(MAX_HEIGHT_MM)
          ) {
            console.log(
              `Column at x=${currentColumnX} would exceed 1800mm. Skipping feeder ${feeder.description} for now.`
            );

            // Skip this feeder for now, add to skipped list
            skippedFeedersForWidth.push(feeder);
          } else {
            const feederWidget: GridWidget = {
              id: feeder.id,
              x: currentColumnX,
              y: 1 + currentColumnHeight,
              w: feederWidthGrid,
              h: feederHeightGrid,
              label: feeder.description,
              type: "feeder",
              equipmentKey: feeder.id,
              originalWidth: feeder.layout?.width || 300,
              originalHeight: feederHeight,
            };

            feederWidgets.push(feederWidget);

            console.log(
              `Feeder ${feeder.description} at x=${feederWidget.x}, y=${feederWidget.y}, w=${feederWidget.w}, h=${feederWidget.h}`
            );

            // Update position for next feeder in this column
            currentColumnHeight += feederHeightGrid;
          }
        });

        // Store available space in this column for later use
        const availableSpace = mmToGrid(MAX_HEIGHT_MM) - currentColumnHeight;
        if (availableSpace > 0) {
          widthColumnSpace.set(currentColumnX, availableSpace);
        }

        // Add VBB after this height group (except for last height group of last width group)
        if (
          !(
            widthGroupIndex === sortedWidthGroups.length - 1 &&
            heightGroupIndex === heightGroups.length - 1
          )
        ) {
          const vbbWidget: GridWidget = {
            id: `vbb-width-${width}-height-${heightGroupIndex}`,
            x: currentColumnX + feederWidthGrid,
            y: 1,
            w: mmToGrid(VBB_WIDTH_MM),
            h: mmToGrid(VBB_HEIGHT_MM),
            label: "",
            type: "VBB",
          };

          feederWidgets.push(vbbWidget);
          console.log(
            `Added VBB at x=${vbbWidget.x}, y=1, w=${vbbWidget.w}, h=${vbbWidget.h}`
          );

          // Move to next position after VBB
          currentX = currentColumnX + feederWidthGrid + mmToGrid(VBB_WIDTH_MM);
        } else {
          // Move to next position without VBB (last group)
          currentX = currentColumnX + feederWidthGrid;
        }
      });

      // Store skipped feeders for this width
      if (skippedFeedersForWidth.length > 0) {
        skippedFeeders.set(width, skippedFeedersForWidth);
      }
    });

    // Now process skipped feeders - try to add them to existing columns first
    skippedFeeders.forEach((skippedFeedersForWidth, width) => {
      console.log(
        `Processing ${skippedFeedersForWidth.length} skipped feeders for width ${width}mm`
      );

      const feederWidthGrid = mmToGrid(width);
      const widthColumnSpace = columnSpaceMap.get(width) || new Map();
      const remainingSkippedFeeders: FeederWithLayout[] = [];

      skippedFeedersForWidth.forEach((feeder) => {
        const feederHeight = feeder.layout?.height || 300;
        const feederHeightGrid = mmToGrid(feederHeight);
        let placed = false;

        // Try to find an existing column with enough space
        for (const [columnX, availableSpace] of widthColumnSpace.entries()) {
          if (availableSpace >= feederHeightGrid) {
            // Find the current height in this column
            const existingFeedersInColumn = feederWidgets.filter(
              (widget) => widget.x === columnX && widget.type === "feeder"
            );
            const currentColumnHeight = existingFeedersInColumn.reduce(
              (sum, widget) => sum + widget.h,
              0
            );

            const feederWidget: GridWidget = {
              id: feeder.id,
              x: columnX,
              y: 1 + currentColumnHeight,
              w: feederWidthGrid,
              h: feederHeightGrid,
              label: feeder.description,
              type: "feeder",
              equipmentKey: feeder.id,
              originalWidth: feeder.layout?.width || 300,
              originalHeight: feederHeight,
            };

            feederWidgets.push(feederWidget);
            console.log(
              `Placed skipped feeder ${feeder.description} in existing column at x=${columnX}`
            );

            // Update available space
            widthColumnSpace.set(columnX, availableSpace - feederHeightGrid);
            placed = true;
            break;
          }
        }

        if (!placed) {
          remainingSkippedFeeders.push(feeder);
        }
      });

      // Create new columns for remaining skipped feeders
      if (remainingSkippedFeeders.length > 0) {
        console.log(
          `Creating new columns for ${remainingSkippedFeeders.length} remaining feeders of width ${width}mm`
        );

        let newColumnX = currentX;
        let currentColumnHeight = 0;

        remainingSkippedFeeders.forEach((feeder) => {
          const feederHeight = feeder.layout?.height || 300;
          const feederHeightGrid = mmToGrid(feederHeight);

          // Check if we need a new column
          if (
            currentColumnHeight + feederHeightGrid >
            mmToGrid(MAX_HEIGHT_MM)
          ) {
            newColumnX += feederWidthGrid;
            currentColumnHeight = 0;
          }

          const feederWidget: GridWidget = {
            id: feeder.id,
            x: newColumnX,
            y: 1 + currentColumnHeight,
            w: feederWidthGrid,
            h: feederHeightGrid,
            label: feeder.description,
            type: "feeder",
            equipmentKey: feeder.id,
            originalWidth: feeder.layout?.width || 300,
            originalHeight: feederHeight,
          };

          feederWidgets.push(feederWidget);
          console.log(
            `Placed remaining feeder ${feeder.description} in new column at x=${newColumnX}`
          );

          currentColumnHeight += feederHeightGrid;
        });

        // Update currentX for next width group
        currentX = newColumnX + feederWidthGrid;
      }
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      gridInstanceRef.current.addWidget({
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
      y: mmToGrid(VISUAL_CELL_SIZE_MM), // Start after top HBB
      w: 1,
      h: mmToGrid(1800), // 1800mm height
      label: "VBB",
      type: "VBB",
    };

    setLayoutItems((prev) => [...prev, newItem]);

    // Add to GridStack instance if it exists
    if (gridInstanceRef.current) {
      gridInstanceRef.current.addWidget({
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
  const manageBottomBusBarHandler = async (isAddBottomBusBar: boolean) => {
    setIsAddBottomBusBar(isAddBottomBusBar);
    await loadFeeders(isAddBottomBusBar);
  };

  // Remove layout item (commented out as it's not currently used)
  // const removeLayoutItem = (itemId: string) => {
  //   setLayoutItems((prev) => prev.filter((item) => item.id !== itemId));

  //   // Remove from GridStack instance if it exists
  //   if (gridInstanceRef.current) {
  //     const widget = gridInstanceRef.current
  //       .getGridItems()
  //       .find(
  //         (item: any) =>
  //           item.id === itemId ||
  //           (item as any).el?.getAttribute("gs-id") === itemId
  //       );
  //     if (widget) {
  //       gridInstanceRef.current.removeWidget((widget as any).el);
  //     }
  //   }
  // };

  // Calculate grid dimensions
  const getGridDimensions = () => {
    const cellWidthPercent = 100 / gridColumns; // Each column should be equal width to total 100%
    const totalWidth = 100; // Always 100% for the grid container
    const totalHeight = 24 * 60; // 24 rows * 60px = 1440px
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
    const requiredRows = 24; // Fixed to 24 rows for consistency
    const cellWidthPercent = 100 / requiredColumns; // Each column should be equal width

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
      width: `${100}%`, // Always 100% for the grid container
      height: `${requiredRows * 60}px`, // 24 rows * 60px = 1440px
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    grid.on("change", (event: any, items: any[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          <Button onClick={() => loadFeeders()} variant="outline">
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

        /* Ensure grid cells maintain proper width */
        .grid-stack {
          --gs-column-width: ${100 / panelDimensions.columns}%;
        }

        /* Custom scrollbar styling */
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
      <div className="space-y-4 p-6">
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
            <Button
              onClick={() => loadFeeders()}
              variant="outline"
              size="sm"
              disabled={true}
            >
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
                  <span className="font-medium">Rows:</span>{" "}
                  {gridDimensions.rows}
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
                    disabled={true}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={removeColumn}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={true}
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
                    disabled={true}
                  >
                    <Cable className="h-3 w-3" />
                    Left
                  </Button>
                  <Button
                    onClick={() => addCableAlley("right")}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={true}
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
                    onClick={() =>
                      addVerticalBusBar(Math.floor(gridColumns / 3))
                    }
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={true}
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
                    disabled={true}
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
                  {!isAddBottomBusBar ? (
                    <Button
                      onClick={() => manageBottomBusBarHandler(true)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Zap className="h-3 w-3" />
                      Add
                    </Button>
                  ) : (
                    <Button
                      onClick={() => manageBottomBusBarHandler(false)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Zap className="h-3 w-3" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground">
          Panel ID: {panelId} | Feeders: {feeders.length} | Columns:{" "}
          {gridColumns} | Grid: {panelDimensions.columns}×{panelDimensions.rows}{" "}
          | Size: {panelDimensions.width} × {panelDimensions.height} | Grid
          Width: {Math.max(1200, panelDimensions.columns * 80)}px
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(panelDimensions as any).maxFeederWidth && (
            <span>
              {" "}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              | Max Feeder: {(panelDimensions as any).maxFeederWidth}×
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
            <div className="overflow-x-auto">
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
                  width: `${Math.max(1200, panelDimensions.columns * 21)}px`, // Minimum 1200px width, or 80px per column
                  minWidth: "100%",
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
                    <div
                      className={`${
                        item.type !== "HBB" ? "grid-stack-item-content" : ""
                      } w-full`}
                    >
                      <EquipmentWidget
                        component={item}
                        isResize={true}
                        showDimensions={showDimensions}
                        feeders={feeders}
                      />
                    </div>
                  </div>
                ))}

                {/* Feeders are now handled through layoutItems */}
              </div>
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
    </div>
  );
}
