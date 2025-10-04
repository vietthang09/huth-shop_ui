import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "error" | "success";
  placeholder?: string;
}

const selectVariants = {
  base: "flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 appearance-none bg-no-repeat bg-right bg-[length:16px_16px] pr-8 cursor-pointer",
  variants: {
    default: "border-gray-200 focus:ring-blue-500",
    error: "border-red-300 focus:ring-red-500 focus:border-red-500",
    success: "border-green-300 focus:ring-green-500 focus:border-green-500",
  },
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = "default", placeholder, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={twMerge(clsx(selectVariants.base, selectVariants.variants[variant]), className)}
          ref={ref}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: "right 0.5rem center",
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
