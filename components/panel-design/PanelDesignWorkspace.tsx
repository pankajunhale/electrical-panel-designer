import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Zap, Gauge, Settings } from "lucide-react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";

const mockComponents = [
  { type: "Breaker", icon: <Zap className="w-5 h-5 mr-2" /> },
  { type: "MCCB", icon: <Settings className="w-5 h-5 mr-2" /> },
  { type: "Meter", icon: <Gauge className="w-5 h-5 mr-2" /> },
  { type: "Busbar", icon: <FileText className="w-5 h-5 mr-2" /> },
];

let widgetId = 0;

interface Widget {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

function ComponentPalette() {
  return (
    <div className="bg-gray-100 p-4 w-56 h-full overflow-y-auto rounded-l-xl border-r">
      <h3 className="font-semibold mb-4">Components</h3>
      <ul className="space-y-2">
        {mockComponents.map((comp) => (
          <li key={comp.type}>
            <button
              className="flex items-center w-full px-2 py-1 rounded hover:bg-blue-100"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("component-type", comp.type);
              }}
              type="button"
            >
              {comp.icon}
              <span>{comp.type}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PanelGridCanvas({
  widgets,
  setWidgets,
}: {
  widgets: Widget[];
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<GridStack | null>(null);

  // Add widgets to grid when widgets state changes
  useEffect(() => {
    if (!gridRef.current) return;
    if (!gridInstanceRef.current) {
      const grid = GridStack.init(
        {
          column: 12,
          minRow: 1,
          cellHeight: 60,
          float: false,
          removable: ".trash",
          acceptWidgets: true,
          resizable: { handles: "all", autoHide: false },
          draggable: { handle: ".grid-stack-item-content" },
        },
        gridRef.current
      );
      gridInstanceRef.current = grid;
    }
    const grid = gridInstanceRef.current;
    if (!grid) return;
    // Remove all widgets
    grid.removeAll(false);
    // Add widgets from state
    widgets.forEach((widget) => {
      grid.addWidget({
        id: widget.id,
        x: widget.x,
        y: widget.y,
        w: widget.w,
        h: widget.h,
        content: `<div class="grid-stack-item-content bg-blue-200 flex items-center justify-center h-full rounded">${widget.type}</div>`,
      });
    });
  }, [widgets]);

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("component-type");
    if (type) {
      setWidgets((prev) => [
        ...prev,
        {
          id: `widget-${widgetId++}`,
          type,
          x: 0,
          y: 0,
          w: 2,
          h: 2,
        },
      ]);
    }
  };

  return (
    <div className="flex-1 bg-white border mx-2 p-4 min-h-[400px] rounded-xl">
      <div
        ref={gridRef}
        className="grid-stack h-full w-full"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Widgets are rendered by GridStack */}
      </div>
    </div>
  );
}

function ComponentInspector({ selected }: { selected: string | null }) {
  return (
    <div className="bg-gray-50 p-4 w-64 h-full rounded-r-xl border-l">
      <h3 className="font-semibold mb-4">Inspector</h3>
      {selected ? (
        <div className="space-y-2">
          <div className="font-medium">Selected: {selected}</div>
          <div className="text-sm text-gray-500">
            (Properties will show here)
          </div>
        </div>
      ) : (
        <div className="text-gray-400 text-sm">
          Select a component to edit its properties.
        </div>
      )}
    </div>
  );
}

function PanelToolbar() {
  return (
    <div className="flex gap-2 p-2 border-b bg-gray-50 rounded-t-xl">
      <Button>Save</Button>
      <Button variant="secondary">Export</Button>
      <Button variant="outline">Preview</Button>
      <Button variant="ghost">Undo</Button>
      <Button variant="ghost">Redo</Button>
    </div>
  );
}

export function PanelDesignWorkspace() {
  const [tab, setTab] = useState<"front" | "rear">("front");
  const [selected] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  return (
    <div className="flex flex-col h-[70vh] w-full">
      <PanelToolbar />
      <div className="flex-1 flex flex-row">
        <ComponentPalette />
        <div className="flex-1 flex flex-col">
          <div className="flex gap-2 border-b bg-gray-50 px-2 py-1">
            <Button
              variant={tab === "front" ? "default" : "outline"}
              onClick={() => setTab("front")}
            >
              Front View
            </Button>
            <Button
              variant={tab === "rear" ? "default" : "outline"}
              onClick={() => setTab("rear")}
            >
              Rear View
            </Button>
          </div>
          <PanelGridCanvas widgets={widgets} setWidgets={setWidgets} />
        </div>
        <ComponentInspector selected={selected} />
      </div>
    </div>
  );
}
