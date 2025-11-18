"use client";

import { clsx } from "clsx";
import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "warning";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  loading?: boolean;
}

const buttonVariants = {
  base: "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden cursor-pointer",
  variants: {
    variant: {
      default: "bg-[#353968] text-white hover:bg-[#282b53] active:bg-slate-950 shadow-md hover:shadow-lg",
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg transform hover:scale-105",
      destructive: "bg-[#f73030] text-white hover:bg-red-600 active:bg-red-700 shadow-md hover:shadow-lg",
      outline:
        "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
      ghost: "text-gray-900 hover:bg-gray-100 active:bg-gray-200",
      link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 active:text-blue-800",
      success: "bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-md hover:shadow-lg",
      warning: "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-md hover:shadow-lg",
    },
    size: {
      xs: "h-7 px-2 text-xs rounded-md",
      sm: "h-9 px-3 text-sm rounded-md",
      default: "h-10 px-4 py-2",
      lg: "h-12 px-6 text-lg rounded-lg",
      icon: "h-10 w-10",
    },
  },
};

function getButtonClasses(variant: string = "default", size: string = "default") {
  return twMerge(
    clsx(
      buttonVariants.base,
      buttonVariants.variants.variant[variant as keyof typeof buttonVariants.variants.variant],
      buttonVariants.variants.size[size as keyof typeof buttonVariants.variants.size],
    ),
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        className={twMerge(getButtonClasses(variant, size), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

// Utility function to get button classes for external use
export const getVariantClasses = (variant: ButtonProps["variant"] = "default") => {
  return (
    buttonVariants.variants.variant[variant as keyof typeof buttonVariants.variants.variant] ||
    buttonVariants.variants.variant.default
  );
};

export const getSizeClasses = (size: ButtonProps["size"] = "default") => {
  return (
    buttonVariants.variants.size[size as keyof typeof buttonVariants.variants.size] ||
    buttonVariants.variants.size.default
  );
};

export { Button, buttonVariants, getButtonClasses };

/*
Usage Examples:

// Basic usage
<Button>Click me</Button>

// Primary button with loading
<Button variant="primary" loading={isLoading}>
  Save Changes
</Button>

// Different sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// Different variants
<Button variant="primary">Primary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Icon />
</Button>

// Custom className
<Button className="w-full" variant="primary">
  Full Width Button
</Button>
*/
