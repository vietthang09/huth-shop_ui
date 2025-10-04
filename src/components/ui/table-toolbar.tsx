import * as React from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Select } from "./select";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Icons as components
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
    />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export interface FilterOption {
  label: string;
  value: string;
}

export interface TableToolbarAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "warning";
  icon?: React.ReactNode;
  loading?: boolean;
}

export interface TableToolbarFilter {
  type: "search" | "select" | "date";
  placeholder?: string;
  options?: FilterOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

export interface TableToolbarProps {
  title?: string;
  description?: string;
  actions?: TableToolbarAction[];
  filters?: TableToolbarFilter[];
  className?: string;
  showFilterToggle?: boolean;
  filtersVisible?: boolean;
  onFilterToggle?: () => void;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  title,
  description,
  actions = [],
  filters = [],
  className,
  showFilterToggle = true,
  filtersVisible = false,
  onFilterToggle,
}) => {
  const [localFiltersVisible, setLocalFiltersVisible] = React.useState(filtersVisible);

  const handleFilterToggle = () => {
    if (onFilterToggle) {
      onFilterToggle();
    } else {
      setLocalFiltersVisible(!localFiltersVisible);
    }
  };

  const isFiltersVisible = onFilterToggle ? filtersVisible : localFiltersVisible;

  const renderFilter = (filter: TableToolbarFilter, index: number) => {
    const baseProps = {
      key: index,
      value: filter.value || "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => filter.onChange(e.target.value),
    };

    switch (filter.type) {
      case "search":
        return (
          <div className="flex-1 min-w-[200px] max-w-sm">
            {filter.label && <label className="block text-xs font-medium text-gray-700 mb-1">{filter.label}</label>}
            <Input
              {...baseProps}
              type="text"
              placeholder={filter.placeholder || "Tìm kiếm..."}
              icon={<SearchIcon />}
              iconPosition="left"
            />
          </div>
        );

      case "select":
        return (
          <div className="min-w-[150px]">
            {filter.label && <label className="block text-xs font-medium text-gray-700 mb-1">{filter.label}</label>}
            <Select {...baseProps} placeholder={filter.placeholder || "Chọn..."}>
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        );

      case "date":
        return (
          <div className="min-w-[150px]">
            {filter.label && <label className="block text-xs font-medium text-gray-700 mb-1">{filter.label}</label>}
            <Input {...baseProps} type="date" placeholder={filter.placeholder} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={twMerge("bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title and Description */}
        <div className="flex-1">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Toggle */}
          {showFilterToggle && filters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFilterToggle}
              className={clsx("transition-colors", isFiltersVisible && "bg-blue-50 border-blue-200 text-blue-700")}
            >
              <FilterIcon />
              Bộ lọc
            </Button>
          )}

          {/* Custom Actions */}
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "default"}
              size="sm"
              onClick={action.onClick}
              loading={action.loading}
              className="flex items-center gap-1.5"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {isFiltersVisible && filters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-end gap-4">
            {filters.map((filter, index) => renderFilter(filter, index))}

            {/* Clear Filters Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                filters.forEach((filter) => filter.onChange(""));
              }}
              className="whitespace-nowrap"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Export common action creators for convenience
export const createCommonActions = {
  add: (onClick: () => void, loading?: boolean): TableToolbarAction => ({
    label: "Thêm mới",
    onClick,
    variant: "primary",
    icon: <PlusIcon />,
    loading,
  }),

  export: (onClick: () => void, loading?: boolean): TableToolbarAction => ({
    label: "Xuất file",
    onClick,
    variant: "outline",
    icon: <DownloadIcon />,
    loading,
  }),
};

export { TableToolbar, SearchIcon, FilterIcon, PlusIcon, RefreshIcon, DownloadIcon };
