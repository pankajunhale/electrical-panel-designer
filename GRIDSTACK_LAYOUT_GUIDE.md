# GridStack Layout System Guide

## Overview

The GridStack layout system in the electrical panel designer allows users to create and manage panel layouts with dynamic grid capabilities. This guide explains how the grid system works, particularly for adding/removing columns and managing layout items.

## Grid System Basics

### Grid Units

- **Grid Unit**: 300mm (1 grid unit = 300mm)
- **Cell Height**: 60px per row
- **Cell Width**: 8.33% per column (responsive)
- **Minimum Columns**: 3 columns
- **Maximum Columns**: No limit (practical limit based on screen width)

### Grid Structure

```
┌─────────────────────────────────────────────────────────┐
│ HBB (Horizontal Bus Bar) - Spans full width           │
├─────────────────────────────────────────────────────────┤
│ VBB │ Incomers (spans width-2) │ VBB                 │
│     ├─────────────────────────────────────────────────┤
│     │ Feeders and other components                   │
│     │                                               │
│     │                                               │
└─────┴─────────────────────────────────────────────────┘
```

## Adding/Removing Columns

### How It Works

1. **Column Addition**:

   - Increases total grid columns by 1
   - Updates GridStack instance with new column count
   - Automatically adjusts layout items that span full width:
     - HBB (Horizontal Bus Bar): Spans all columns
     - Incomers: Spans (total columns - 2)
     - Right VBB: Moves to new rightmost position

2. **Column Removal**:
   - Decreases total grid columns by 1
   - Prevents removal below minimum (3 columns)
   - Updates layout items accordingly
   - Forces grid compaction to remove gaps

### Implementation Details

```typescript
// Add column functionality
const addColumn = () => {
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
      const itemId = el.getAttribute("gs-id") || el.getAttribute("data-gs-id");

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
};
```

## Layout Item Types

### 1. Horizontal Bus Bar (HBB)

- **Purpose**: Main power distribution bus
- **Behavior**: Always spans full width
- **Color**: Blue background
- **Icon**: Horizontal arrows

### 2. Vertical Bus Bar (VBB)

- **Purpose**: Vertical power distribution
- **Behavior**: Fixed width (1 column), variable height
- **Color**: Purple background
- **Icon**: Vertical arrows

### 3. Incomers

- **Purpose**: Power input connections
- **Behavior**: Spans (total columns - 2)
- **Color**: Red background
- **Icon**: Power symbol

### 4. Cable Alley

- **Purpose**: Cable routing space
- **Behavior**: 1 column width, variable height
- **Color**: Green background
- **Icon**: Cable symbol

### 5. Feeders

- **Purpose**: Individual circuit connections
- **Behavior**: Variable size based on actual dimensions
- **Color**: Yellow background
- **Icon**: Circuit symbol

## Grid Layout Management

### Adding New Components

When users add new components (Cable Alley, VBB, HBB), the system:

1. **Creates Layout Item**: Adds to `layoutItems` state
2. **Adds to GridStack**: Uses `addWidget()` method
3. **Positions Automatically**: Calculates optimal position
4. **Updates Grid**: Forces grid refresh

### Component Positioning Logic

```typescript
// Cable Alley positioning
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
  // ... add to grid
};

// Vertical Bus Bar positioning
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
  // ... add to grid
};
```

### Grid Dimensions Calculation

The system calculates grid dimensions based on:

1. **Base Grid**: 12 columns × 10 rows
2. **Feeder Requirements**: Expands based on feeder positions
3. **Component Requirements**: Expands based on layout items

```typescript
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
```

## Best Practices

### 1. Column Management

- Start with minimum 3 columns
- Add columns incrementally as needed
- Consider screen width limitations
- Test layout on different screen sizes

### 2. Component Placement

- Place HBB at top for main power distribution
- Position VBB strategically for power routing
- Use Cable Alley for cable management
- Position feeders based on actual panel layout

### 3. Grid Optimization

- Use `compact()` after major layout changes
- Monitor grid performance with many components
- Consider component density vs. readability

### 4. Responsive Design

- Grid adapts to screen width
- Components scale proportionally
- Maintain minimum usable sizes

## Troubleshooting

### Common Issues

1. **Columns not updating**:

   - Check GridStack instance exists
   - Verify column count updates
   - Force grid refresh with `compact()`

2. **Components not positioning correctly**:

   - Check coordinate calculations
   - Verify grid boundaries
   - Ensure proper widget attributes

3. **Layout items not appearing**:
   - Check GridStack initialization
   - Verify widget addition logic
   - Check for JavaScript errors

### Debug Tools

- Enable "Show Dimensions" to see grid coordinates
- Use "Grid Info" to view current grid state
- Check browser console for GridStack events
- Monitor layout change events

## Future Enhancements

1. **Auto-layout algorithms** for optimal component placement
2. **Grid templates** for common panel configurations
3. **Drag-and-drop** component library
4. **Real-time collaboration** features
5. **Export/import** layout configurations
