import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Icons as components
const SortAscIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const SortDescIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const SortIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
    />
  </svg>
);

const CheckboxIcon = ({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) => (
  <div
    className={clsx(
      "w-4 h-4 border rounded flex items-center justify-center transition-colors",
      checked || indeterminate ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 hover:border-gray-400"
    )}
  >
    {indeterminate ? (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 13H5v-2h14v2z" />
      </svg>
    ) : checked ? (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    ) : null}
  </div>
);

// Types
export type SortDirection = "asc" | "desc" | null;

export interface TableColumn<T = any> {
  key: string;
  header: string;
  width?: string | number;
  minWidth?: string | number;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
  sticky?: "left" | "right";
}

export interface TableSort {
  key: string;
  direction: SortDirection;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "bordered" | "striped";

  // Selection
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectionChange?: (selectedRows: (string | number)[]) => void;
  getRowId?: (row: T, index: number) => string | number;

  // Sorting
  sortable?: boolean;
  sort?: TableSort;
  onSortChange?: (sort: TableSort) => void;

  // Row interactions
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  rowClassName?: string | ((row: T, index: number) => string);

  // Loading & Empty states
  loading?: boolean;
  emptyMessage?: string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;

  // Layout
  stickyHeader?: boolean;
  maxHeight?: string | number;
  minHeight?: string | number;

  // Virtualization (for large datasets)
  virtualizeRows?: boolean;
  rowHeight?: number;
}

// Table context for managing state
const TableContext = React.createContext<{
  size: "sm" | "md" | "lg";
  variant: "default" | "bordered" | "striped";
  selectable: boolean;
}>({
  size: "md",
  variant: "default",
  selectable: false,
});

// Loading skeleton component
const TableSkeleton: React.FC<{ columns: number; rows?: number }> = ({ columns, rows = 5 }) => (
  <div className="animate-pulse">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex border-b border-gray-200">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="flex-1 p-4">
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

// Empty state component
const TableEmpty: React.FC<{ message?: string; component?: React.ReactNode }> = ({
  message = "Không có dữ liệu",
  component,
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {component || (
      <>
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Không có dữ liệu</h3>
        <p className="text-sm text-gray-500">{message}</p>
      </>
    )}
  </div>
);

// Main Table component
const Table = <T extends Record<string, any>>({
  data,
  columns,
  className,
  size = "md",
  variant = "default",
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (_, index) => index,
  sortable = true,
  sort,
  onSortChange,
  onRowClick,
  onRowDoubleClick,
  rowClassName,
  loading = false,
  emptyMessage,
  loadingComponent,
  emptyComponent,
  stickyHeader = false,
  maxHeight,
  minHeight,
}: TableProps<T>) => {
  const [internalSort, setInternalSort] = React.useState<TableSort>({ key: "", direction: null });
  const [internalSelection, setInternalSelection] = React.useState<(string | number)[]>([]);

  // Use controlled or internal state for sorting
  const currentSort = sort || internalSort;
  const handleSortChange = onSortChange || setInternalSort;

  // Use controlled or internal state for selection
  const currentSelection = onSelectionChange ? selectedRows : internalSelection;
  const handleSelectionChange = onSelectionChange || setInternalSelection;

  // Handle column sort
  const handleColumnSort = (columnKey: string) => {
    if (!sortable) return;

    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    let newDirection: SortDirection = "asc";
    if (currentSort.key === columnKey) {
      if (currentSort.direction === "asc") newDirection = "desc";
      else if (currentSort.direction === "desc") newDirection = null;
    }

    handleSortChange({ key: columnKey, direction: newDirection });
  };

  // Handle row selection
  const handleRowSelect = (rowId: string | number) => {
    if (!selectable) return;

    const newSelection = currentSelection.includes(rowId)
      ? currentSelection.filter((id) => id !== rowId)
      : [...currentSelection, rowId];

    handleSelectionChange(newSelection);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!selectable) return;

    const allIds = data.map((row, index) => getRowId(row, index));
    const isAllSelected = allIds.every((id) => currentSelection.includes(id));

    handleSelectionChange(isAllSelected ? [] : allIds);
  };

  // Calculate selection state
  const allIds = data.map((row, index) => getRowId(row, index));
  const isAllSelected = allIds.length > 0 && allIds.every((id) => currentSelection.includes(id));
  const isPartiallySelected = currentSelection.length > 0 && !isAllSelected;

  // Table size classes
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Table variant classes
  const variantClasses = {
    default: "border border-gray-200",
    bordered: "border border-gray-300",
    striped: "border border-gray-200",
  };

  // Cell padding classes
  const cellPaddingClasses = {
    sm: "px-2 py-1.5",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  const contextValue = React.useMemo(
    () => ({
      size,
      variant,
      selectable,
    }),
    [size, variant, selectable]
  );

  if (loading) {
    return (
      <div className={twMerge("bg-white rounded-lg border border-gray-200 overflow-hidden", className)}>
        {loadingComponent || <TableSkeleton columns={columns.length + (selectable ? 1 : 0)} />}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={twMerge("bg-white rounded-lg border border-gray-200 overflow-hidden", className)}>
        <TableEmpty message={emptyMessage} component={emptyComponent} />
      </div>
    );
  }

  return (
    <TableContext.Provider value={contextValue}>
      <div
        className={twMerge("bg-white rounded-lg overflow-hidden", variantClasses[variant], className)}
        style={{
          maxHeight,
          minHeight,
          ...(maxHeight && { overflowY: "auto" }),
        }}
      >
        <div className="overflow-x-auto">
          <table className={twMerge("w-full", sizeClasses[size])}>
            {/* Header */}
            <thead className={clsx("bg-gray-50 border-b border-gray-200", stickyHeader && "sticky top-0 z-10")}>
              <tr>
                {/* Selection column */}
                {selectable && (
                  <th className={twMerge("text-left font-medium text-gray-900", cellPaddingClasses[size])}>
                    <button
                      onClick={handleSelectAll}
                      className="flex items-center hover:bg-gray-100 rounded p-1 -m-1 transition-colors cursor-pointer"
                    >
                      <CheckboxIcon checked={isAllSelected} indeterminate={isPartiallySelected} />
                    </button>
                  </th>
                )}

                {/* Data columns */}
                {columns.map((column) => {
                  const isSorted = currentSort.key === column.key;
                  const sortDirection = isSorted ? currentSort.direction : null;

                  return (
                    <th
                      key={column.key}
                      className={twMerge(
                        "text-left font-medium text-gray-900",
                        cellPaddingClasses[size],
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right",
                        column.headerClassName
                      )}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        ...(column.sticky && {
                          position: "sticky",
                          [column.sticky]: 0,
                          zIndex: 20,
                          backgroundColor: "#f9fafb",
                        }),
                      }}
                    >
                      {column.headerRender ? (
                        column.headerRender()
                      ) : (
                        <div className="flex items-center gap-1">
                          <span>{column.header}</span>
                          {sortable && column.sortable && (
                            <button
                              onClick={() => handleColumnSort(column.key)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                            >
                              {sortDirection === "asc" ? (
                                <SortAscIcon />
                              ) : sortDirection === "desc" ? (
                                <SortDescIcon />
                              ) : (
                                <SortIcon />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-200">
              {data.map((row, rowIndex) => {
                const rowId = getRowId(row, rowIndex);
                const isSelected = currentSelection.includes(rowId);
                const rowClasses = typeof rowClassName === "function" ? rowClassName(row, rowIndex) : rowClassName;

                return (
                  <tr
                    key={rowId}
                    className={twMerge(
                      "hover:bg-gray-50 transition-colors",
                      variant === "striped" && rowIndex % 2 === 1 && "bg-gray-25",
                      isSelected && "bg-blue-50",
                      (onRowClick || onRowDoubleClick) && "cursor-pointer",
                      rowClasses
                    )}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    onDoubleClick={() => onRowDoubleClick?.(row, rowIndex)}
                  >
                    {/* Selection column */}
                    {selectable && (
                      <td className={cellPaddingClasses[size]}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowSelect(rowId);
                          }}
                          className="flex items-center hover:bg-gray-100 rounded p-1 -m-1 transition-colors cursor-pointer"
                        >
                          <CheckboxIcon checked={isSelected} />
                        </button>
                      </td>
                    )}

                    {/* Data columns */}
                    {columns.map((column) => {
                      const value = row[column.key];
                      const cellContent = column.render
                        ? column.render(value, row, rowIndex)
                        : value?.toString?.() || "";

                      return (
                        <td
                          key={column.key}
                          className={twMerge(
                            "text-gray-900",
                            cellPaddingClasses[size],
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right",
                            column.className
                          )}
                          style={{
                            width: column.width,
                            minWidth: column.minWidth,
                            ...(column.sticky && {
                              position: "sticky",
                              [column.sticky]: 0,
                              zIndex: 10,
                              backgroundColor: isSelected ? "#dbeafe" : "#ffffff",
                            }),
                          }}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TableContext.Provider>
  );
};

// Subcomponents for more flexible usage
const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <thead className={twMerge("bg-gray-50 border-b border-gray-200", className)}>{children}</thead>
);

const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <tbody className={twMerge("divide-y divide-gray-200", className)}>{children}</tbody>
);

const TableRow: React.FC<{
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
}> = ({ children, className, selected, onClick }) => (
  <tr
    className={twMerge(
      "hover:bg-gray-50 transition-colors",
      selected && "bg-blue-50",
      onClick && "cursor-pointer",
      className
    )}
    onClick={onClick}
  >
    {children}
  </tr>
);

const TableCell: React.FC<{
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  header?: boolean;
}> = ({ children, className, align = "left", header = false }) => {
  const { size } = React.useContext(TableContext);
  const cellPaddingClasses: Record<"sm" | "md" | "lg", string> = {
    sm: "px-2 py-1.5",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  const Tag = header ? "th" : "td";

  return (
    <Tag
      className={twMerge(
        header ? "font-medium text-gray-900" : "text-gray-900",
        cellPaddingClasses[size],
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </Tag>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableSkeleton,
  TableEmpty,
  SortAscIcon,
  SortDescIcon,
  SortIcon,
  CheckboxIcon,
};

/*
Usage Examples:

// Basic table
<Table
  data={users}
  columns={[
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' }
  ]}
/>

// Advanced table with all features
<Table
  data={products}
  columns={[
    { 
      key: 'name', 
      header: 'Product Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <img src={row.image} className="w-8 h-8 rounded" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { 
      key: 'price', 
      header: 'Price',
      sortable: true,
      align: 'right',
      render: (value) => `$${value.toFixed(2)}`
    },
    { 
      key: 'actions', 
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm">Edit</Button>
          <Button size="sm" variant="destructive">Delete</Button>
        </div>
      )
    }
  ]}
  selectable
  sortable
  size="md"
  variant="striped"
  onRowClick={(row) => console.log('Clicked:', row)}
  selectedRows={selectedProducts}
  onSelectionChange={setSelectedProducts}
  loading={isLoading}
  emptyMessage="No products found"
  stickyHeader
  maxHeight="400px"
/>

// Using subcomponents for custom layouts
<div className="bg-white rounded-lg border">
  <table className="w-full text-sm">
    <TableHeader>
      <TableRow>
        <TableCell header>Name</TableCell>
        <TableCell header align="right">Price</TableCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell align="right">${item.price}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </table>
</div>
*/
