"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  computeWizardData,
  WizardFormData,
  type GALayoutItem,
} from "@/actions/wizard-computation";

interface GridstackFormProps {
  onNext: (data: { gridLayout: any }) => void;
  onBack: () => void;
  initialData?: { gridLayout: any };
  isLoading?: boolean;
}
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";
import { type EquipmentData } from "@/actions/equipment-data";
// Extended GALayoutItem with id for tracking
interface GridWidget extends GALayoutItem {
  id: string;
}

// Component for rendering equipment widgets
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EquipmentWidget = ({
  component,
}: {
  component: GridWidget;
  isResize?: boolean;
}) => {
  let color = "bg-gray-200 text-gray-800 border-gray-400";
  const title = component.label;
  let subtitle = "";
  const height = component.h * 60;
  const width = component.w * 8.33;
  switch (component.type) {
    case "HBB":
      color = "bg-blue-200 text-blue-900 border-blue-400";
      subtitle = "Horizontal Bus Bar";
      break;
    case "VBB":
      color = "bg-purple-200 text-purple-900 border-purple-400";
      subtitle = "Vertical Bus Bar";
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
      className={`${color} p-3 rounded border text-center h-full flex flex-col justify-center`}
    >
      <h3 className="font-bold text-sm mb-1">{title}</h3>
      {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
      <div className="text-xs opacity-75">
        {height}x{width}
      </div>
    </div>
  );
};

// React Grid Item Component
const GridItem = ({
  widget,
  onRemove,
}: {
  widget: GridWidget;
  onRemove: (id: string) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`absolute border-2 border-dashed border-gray-300 bg-white rounded-lg transition-all ${
        isDragging ? "z-50 shadow-lg" : "z-10"
      }`}
      style={{
        left: `${widget.x * 8.33}%`,
        top: `${widget.y * 60}px`,
        width: `${widget.w * 8.33}%`,
        height: `${widget.h * 60}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        e.dataTransfer.setData("text/plain", widget.id);
      }}
      onDragEnd={() => setIsDragging(false)}
    >
      <div className="relative h-full">
        <EquipmentWidget component={widget} />

        {/* Remove button */}
        <button
          onClick={() => onRemove(widget.id)}
          className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Remove component"
        >
          ×
        </button>

        {/* Resize handles */}
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-blue-500 rounded-tl-lg opacity-50 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export function GridstackForm({
  onNext,
  onBack,
  isLoading = false,
  initialData,
}: GridstackFormProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isGridReady, setIsGridReady] = useState(false);
  const [equipmentComponents, setEquipmentComponents] = useState<
    GALayoutItem[]
  >([]);
  const [groupedComponents, setGroupedComponents] = useState<
    Record<string, GALayoutItem[]>
  >({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [gridWidgets, setGridWidgets] = useState<GridWidget[]>([]);
  const gridRefNew = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<GridStack | null>(null);
  useEffect(() => {
    if (!gridRefNew.current || isLoadingData) {
      console.log("🎨 Grid not ready", isLoadingData);
      return;
    }
    const grid = GridStack.init({
      column: 12,
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
        //handle: ".grid-stack-item-content",
        handle: ".drag-target",
      },
    });

    // Store the grid instance
    gridInstanceRef.current = grid;

    return () => {
      grid.destroy();
      gridInstanceRef.current = null;
    };
  }, [gridRefNew, isLoadingData]);

  // Initialize grid
  useEffect(() => {
    if (!gridRef.current) {
      return;
    }

    console.log("🎨 Initializing React Grid...");
    setIsGridReady(true);
    console.log("🎨 Grid is ready");
  }, [gridRef, isLoadingData]);

  // Load equipment data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true);
        console.log("🔄 Loading equipment data...");

        // const equipment = await fetchEquipmentData(); // Removed unused variable
        // console.log("📊 Equipment data loaded:", equipment);

        const computedData = await computeWizardData(
          equipmentComponents as unknown as EquipmentData[],
          initialData?.gridLayout as unknown as Partial<WizardFormData>
        ); // Changed to use equipmentComponents from state
        console.log("✅ Computed data:", computedData);
        console.log(
          "🎨 Equipment components found:",
          computedData.gaLayout.length
        );

        // Log all components for user reference
        computedData.gaLayout.forEach((item, index) => {
          console.log(`🎨 Component ${index + 1}:`, {
            type: item.type,
            label: item.label,
            position: `x:${item.x}, y:${item.y}`,
            size: `w:${item.w}, h:${item.h}`,
            equipmentKey: item.equipmentKey || `item-${index}`,
          });
        });

        setEquipmentComponents(computedData.gaLayout);

        // Group components by type
        const grouped = computedData.gaLayout.reduce((acc, component) => {
          const type = component.type;
          if (!acc[type]) {
            acc[type] = [];
          }
          acc[type].push(component);
          return acc;
        }, {} as Record<string, GALayoutItem[]>);

        setGroupedComponents(grouped);
        console.log("🎨 Grouped components:", grouped);
      } catch (error) {
        console.error("❌ Error loading data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, []); // Only run once on mount

  // Add component to grid
  const addComponentToGrid = (component: GALayoutItem) => {
    if (!isGridReady) {
      console.log("❌ Grid not ready");
      return;
    }

    try {
      const widgetId = `${
        component.equipmentKey || component.label
      }-${Date.now()}`;

      // Add to our state for tracking
      const newWidget: GridWidget = { ...component, id: widgetId };
      setGridWidgets((prev) => [...prev, newWidget]);

      console.log(`🎨 Added ${component.type} widget: ${component.label}`);
    } catch (error) {
      console.error(`❌ Error adding ${component.type} widget:`, error);
    }
  };

  // Add resizable HBB component to grid
  const addResizableHBB = (component: GALayoutItem) => {
    if (!isGridReady) {
      console.log("❌ Grid not ready");
      return;
    }

    try {
      const widgetId = `${
        component.equipmentKey || component.label
      }-resizable-${Date.now()}`;

      // Add to our state for tracking
      const newWidget: GridWidget = { ...component, id: widgetId };
      setGridWidgets((prev) => [...prev, newWidget]);

      console.log(`🎨 Added resizable HBB widget: ${component.label}`);
    } catch (error) {
      console.error(`❌ Error adding resizable HBB widget:`, error);
    }
  };

  // Remove component from grid
  const removeComponent = (id: string) => {
    setGridWidgets((prev) => prev.filter((widget) => widget.id !== id));
    console.log(`🗑️ Removed widget: ${id}`);
  };

  const handleSubmit = () => {
    const layout = gridWidgets.map((widget) => ({
      id: widget.id,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
      type: widget.type,
      label: widget.label,
    }));

    onNext({
      gridLayout: layout,
    });
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoadingData && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Loading equipment components...
            </p>
          </div>
        </div>
      )}

      {/* Manual Panel Design Interface */}
      {!isLoadingData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Manual Panel Design</h2>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  isGridReady
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                Grid: {isGridReady ? "Ready" : "Initializing"}
              </span>
            </div>
          </div>

          {/* Equipment Components Panel */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium mb-3">Available Components</h3>
            <div className="space-y-4">
              {Object.entries(groupedComponents).map(([type, components]) => (
                <div key={type} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 capitalize">
                    {type} ({components.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {components.map((component, index) => (
                      <div
                        key={index}
                        className="p-2 text-xs bg-white border rounded hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium truncate mb-1">
                          {component.label}
                        </div>
                        <div className="text-gray-500 text-xs mb-2">
                          {component.type}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => addComponentToGrid(component)}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            title="Add to grid"
                          >
                            Add
                          </button>
                          {type === "HBB" && (
                            <button
                              onClick={() => addResizableHBB(component)}
                              className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                              title="Add resizable HBB"
                            >
                              Resize
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">Panel Layout</h3>
              <div className="text-sm text-muted-foreground">
                Grid Status: {isGridReady ? "Ready" : "Initializing..."} |
                Components: {gridWidgets.length}
              </div>
            </div>

            <div
              ref={gridRef}
              className="hidden bg-background border rounded-lg p-4 min-h-[600px] relative"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "8.33% 60px",
              }}
            >
              {/* Render React components for each widget */}
              {gridWidgets.map((widget) => (
                <GridItem
                  key={widget.id}
                  widget={widget}
                  onRemove={removeComponent}
                />
              ))}
            </div>
            <div ref={gridRefNew} className="grid-stack border-2 border-dashed">
              {/* Grid items will be added here */}
              {equipmentComponents.map((widget, index) => (
                <div
                  key={index}
                  className="grid-stack-item"
                  gs-w={widget.w}
                  gs-h={widget.h}
                  gs-x={widget.x}
                  gs-y={widget.y}
                >
                  <div className="grid-stack-item-content">
                    <EquipmentWidget
                      component={widget as GridWidget}
                      isResize={true}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              💡 Drag components from above to the grid, then resize and
              position them as needed. Click the × to remove components.
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
