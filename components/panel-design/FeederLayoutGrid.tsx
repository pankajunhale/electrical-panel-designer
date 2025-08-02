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

// Grid unit in mm (1 grid unit = 300mm)
const GRID_UNIT_MM = 300;

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
  const title = component.label;
  let subtitle = "";
  const height = component.h * 60;
  const width = component.w * 8.33;
  const actualWidth = component.originalWidth || component.w * GRID_UNIT_MM;
  const actualHeight = component.originalHeight || component.h * GRID_UNIT_MM;

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
        <div className="flex justify-center">
          <ArrowUpDown className="w-4 h-4" />
        </div>
      )}
      {component.type === "incomer" && (
        <div className="flex justify-center">
          <Power className="w-4 h-4" />
        </div>
      )}

      {component.type !== "HBB" && component.type !== "incomer" && (
        <h3 className="font-bold text-[10px] mb-1">{title}</h3>
      )}
      {subtitle && component.type !== "feeder" && (
        <p className="text-xs opacity-75">{subtitle}</p>
      )}
      {component.type === "feeder" && (
        <p className="text-[10px] opacity-75">
          {actualWidth}×{actualHeight}
        </p>
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
  const [gridColumns, setGridColumns] = useState(12);
  const [layoutItems, setLayoutItems] = useState<GridWidget[]>([]);
  const [showDimensions, setShowDimensions] = useState(false);
  const [showGridInfo, setShowGridInfo] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<GridStack | null>(null);

  // Load feeders with layouts
  const loadFeeders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getFeedersWithLayoutsByPanelId(panelId);

      if (result.success && result.data) {
        setFeeders(result.data);
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
      // Horizontal Bus Bar (Top)
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
        h: 10,
        label: "VBB",
        type: "VBB",
      },
      // Vertical Bus Bar (Right)
      {
        id: "vbb-right",
        x: gridColumns - 1,
        y: 1,
        w: 1,
        h: 10,
        label: "VBB",
        type: "VBB",
      },
      // Incomers
      {
        id: "incomers",
        x: 1,
        y: 1,
        w: gridColumns - 2,
        h: 2,
        label: "Incomers",
        type: "incomer",
      },
    ];

    setLayoutItems(defaultItems);
  };

  // Add column functionality
  const addColumn = () => {
    const newColumns = gridColumns + 1;
    setGridColumns(newColumns);

    // Update grid instance
    if (gridInstanceRef.current) {
      gridInstanceRef.current.column(newColumns);
    }

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
  };

  // Remove column functionality
  const removeColumn = () => {
    if (gridColumns <= 3) return; // Minimum 3 columns

    const newColumns = gridColumns - 1;
    setGridColumns(newColumns);

    // Update grid instance
    if (gridInstanceRef.current) {
      gridInstanceRef.current.column(newColumns);
    }

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
  };

  // Add cable alley functionality
  const addCableAlley = (position: "left" | "right") => {
    const newItem: GridWidget = {
      id: `cable-alley-${position}-${Date.now()}`,
      x: position === "left" ? 1 : gridColumns - 2,
      y: 3,
      w: 1,
      h: 6,
      label: "Cable Alley",
      type: "CABLE_ALLEY",
    };

    setLayoutItems((prev) => [...prev, newItem]);
  };

  // Add vertical bus bar functionality
  const addVerticalBusBar = (x: number) => {
    const newItem: GridWidget = {
      id: `vbb-${Date.now()}`,
      x: x,
      y: 1,
      w: 1,
      h: 10,
      label: "VBB",
      type: "VBB",
    };

    setLayoutItems((prev) => [...prev, newItem]);
  };

  // Add top bus bar functionality
  const addTopBusBar = (y: number) => {
    const newItem: GridWidget = {
      id: `hbb-${Date.now()}`,
      x: 0,
      y: y,
      w: gridColumns,
      h: 1,
      label: "HBB",
      type: "HBB",
    };

    setLayoutItems((prev) => [...prev, newItem]);
  };

  // Remove layout item
  const removeLayoutItem = (itemId: string) => {
    setLayoutItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Calculate grid dimensions
  const getGridDimensions = () => {
    const totalWidth = gridColumns * 8.33; // 8.33% per column
    const totalHeight = 10 * 60; // 10 rows * 60px
    return {
      width: `${totalWidth}%`,
      height: `${totalHeight}px`,
      columns: gridColumns,
      rows: 10,
      cellWidth: `${8.33}%`,
      cellHeight: "60px",
    };
  };

  // Calculate actual panel dimensions based on feeders
  const getPanelDimensions = () => {
    if (feeders.length === 0) {
      return getGridDimensions();
    }

    // Find the maximum extent of all feeders
    let maxX = 0;
    let maxY = 0;
    let maxWidth = 0;
    let maxHeight = 0;

    feeders.forEach((feeder) => {
      if (feeder.layout) {
        const x = mmToGrid(feeder.layout.x);
        const y = mmToGrid(feeder.layout.y);
        const w = mmToGrid(feeder.layout.width);
        const h = mmToGrid(feeder.layout.height);

        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
        maxWidth = Math.max(maxWidth, w);
        maxHeight = Math.max(maxHeight, h);
      }
    });

    // Calculate required rows and columns
    const requiredColumns = Math.max(gridColumns, maxX);
    const requiredRows = Math.max(10, maxY);

    return {
      width: `${requiredColumns * 8.33}%`,
      height: `${requiredRows * 60}px`,
      columns: requiredColumns,
      rows: requiredRows,
      cellWidth: `${8.33}%`,
      cellHeight: "60px",
      maxFeederWidth: maxWidth * GRID_UNIT_MM,
      maxFeederHeight: maxHeight * GRID_UNIT_MM,
    };
  };

  // Initialize gridstack
  useEffect(() => {
    if (!gridRef.current) return;

    // Destroy existing grid if it exists
    if (gridInstanceRef.current) {
      gridInstanceRef.current.destroy();
    }

    // Only initialize if we have feeders
    if (feeders.length === 0) {
      return;
    }

    console.log("Initializing GridStack with", feeders.length, "feeders");

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
        x: item.x * GRID_UNIT_MM, // Convert grid units back to mm
        y: item.y * GRID_UNIT_MM,
        width: item.w * GRID_UNIT_MM,
        height: item.h * GRID_UNIT_MM,
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
  }, [gridRef, gridColumns, feeders.length, onLayoutChange]);

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
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  onClick={removeColumn}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={gridColumns <= 3}
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </div>
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
            className="grid-stack border-2 border-dashed relative"
            style={{
              backgroundImage: `
                   linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                 `,
              backgroundSize: `${100 / panelDimensions.columns}% 60px`,
              height: panelDimensions.height,
            }}
          >
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
                      {GRID_UNIT_MM}×{GRID_UNIT_MM}
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
                gs-no-resize={
                  item.id.startsWith("hbb-") || item.type === "HBB"
                    ? "true"
                    : "false"
                }
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

            {/* Feeders - Dynamic Grid Items */}
            {feeders.map((feeder, index) => {
              if (!feeder.layout) return null;

              // Debug the layout values
              console.log(`Feeder ${feeder.description} layout:`, {
                x: feeder.layout.x,
                y: feeder.layout.y,
                width: feeder.layout.width,
                height: feeder.layout.height,
              });

              const widget = {
                id: feeder.id,
                x: mmToGrid(feeder.layout.x),
                y: mmToGrid(feeder.layout.y),
                w: mmToGrid(feeder.layout.width),
                h: mmToGrid(feeder.layout.height),
                label: feeder.description,
                type: "feeder",
                originalWidth: feeder.layout.width || 0,
                originalHeight: feeder.layout.height || 0,
              };

              // Debug: Log feeder dimensions
              console.log(`Feeder ${feeder.description}:`, {
                original: {
                  x: feeder.layout.x,
                  y: feeder.layout.y,
                  width: feeder.layout.width,
                  height: feeder.layout.height,
                },
                grid: { x: widget.x, y: widget.y, w: widget.w, h: widget.h },
                calculated: {
                  width: widget.w * GRID_UNIT_MM,
                  height: widget.h * GRID_UNIT_MM,
                },
              });
              return (
                <div
                  key={feeder.id}
                  className="grid-stack-item"
                  gs-w={widget.w}
                  gs-h={widget.h}
                  gs-x={widget.x}
                  gs-y={widget.y}
                >
                  <div className="grid-stack-item-content h-full w-full">
                    <EquipmentWidget
                      component={widget}
                      isResize={true}
                      showDimensions={showDimensions}
                    />
                  </div>
                </div>
              );
            })}
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
