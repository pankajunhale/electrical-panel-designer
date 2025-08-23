# Query String Column Management

This document explains how the column management system works using query string parameters and page reloads to ensure proper grid initialization.

## Overview

When users click "Add Column" or "Remove Column", the system:

1. Updates the URL with new column count as a query parameter
2. Reloads the page completely
3. Reads the column count from URL parameters on page load
4. Initializes the grid with the correct column count

## Implementation

### 1. URL Parameter Reading

```typescript
// Read column count from URL parameters
useEffect(() => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const columnsParam = urlParams.get("columns");
    if (columnsParam) {
      const columns = parseInt(columnsParam, 10);
      if (!isNaN(columns) && columns > 0) {
        setGridColumns(columns);
      }
    }
  }
}, []);
```

### 2. Add Column Function

```typescript
const addColumn = () => {
  const newColumns = gridColumns + 1;

  // Create URL with query parameters for the new column count
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("columns", newColumns.toString());

  // Add a timestamp to force reload
  currentUrl.searchParams.set("reload", Date.now().toString());

  // Reload the page with the new column count
  window.location.href = currentUrl.toString();
};
```

### 3. Remove Column Function

```typescript
const removeColumn = () => {
  if (gridColumns <= 3) return; // Minimum 3 columns

  const newColumns = gridColumns - 1;

  // Create URL with query parameters for the new column count
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set("columns", newColumns.toString());

  // Add a timestamp to force reload
  currentUrl.searchParams.set("reload", Date.now().toString());

  // Reload the page with the new column count
  window.location.href = currentUrl.toString();
};
```

## URL Examples

### Default State

```
https://your-app.com/panel-design
```

### With 13 Columns

```
https://your-app.com/panel-design?columns=13&reload=1703123456789
```

### With 15 Columns

```
https://your-app.com/panel-design?columns=15&reload=1703123456790
```

## Benefits

1. **Complete Grid Reinitialization**: Page reload ensures the grid is properly initialized with the new column count
2. **No Stale State**: Eliminates any initialization issues or stale state problems
3. **Shareable URLs**: Users can share URLs with specific column configurations
4. **Browser Navigation**: Back/forward buttons work correctly with column changes
5. **Clean State**: Each reload starts with a fresh, clean state

## Demo Page

Visit `/test-colors` to see a live demonstration of the query string column management system.

## Components Updated

1. **FeederLayoutGrid** (`components/panel-design/FeederLayoutGrid.tsx`)

   - Updated `addColumn()` and `removeColumn()` functions
   - Added URL parameter reading on component mount

2. **GridstackForm** (`components/forms/GridstackForm.tsx`)

   - Added column controls to the UI
   - Updated GridStack initialization to use dynamic column count
   - Added URL parameter reading functionality

3. **Demo Page** (`app/test-colors/page.tsx`)
   - Created interactive demo showing the functionality
   - Includes visual grid preview and detailed explanations

## Usage

1. Navigate to any panel design page
2. Use the column controls (+/-) to add or remove columns
3. The page will reload with the new column configuration
4. The grid will be properly initialized with the correct number of columns

## Technical Details

- **Minimum Columns**: 3 (prevents grid from becoming too narrow)
- **Default Columns**: 12 (standard grid layout)
- **URL Parameter**: `columns` (stores the column count)
- **Reload Parameter**: `reload` (timestamp to force reload)
- **Grid Background**: Dynamically adjusts based on column count
