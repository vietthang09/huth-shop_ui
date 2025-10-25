import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "error" | "success";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const inputVariants = {
  base: "flex w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  variants: {
    default: "border-gray-200 focus:ring-blue-500",
    error: "border-red-300 focus:ring-red-500 focus:border-red-500",
    success: "border-green-300 focus:ring-green-500 focus:border-green-500",
  },
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", icon, iconPosition = "left", ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          {iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>
          )}
          <input
            className={twMerge(
              clsx(
                inputVariants.base,
                inputVariants.variants[variant],
                iconPosition === "left" && "pl-10",
                iconPosition === "right" && "pr-10"
              ),
              className
            )}
            ref={ref}
            {...props}
          />
          {iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>
          )}
        </div>
      );
    }

    return (
      <input
        className={twMerge(clsx(inputVariants.base, inputVariants.variants[variant]), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
