"use client";

import { cn } from "@/shared/utils/styling";

type TProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  type?: "button" | "reset" | "submit";
  size?: "sm" | "md" | "base" | "lg";
  variant?: "primary" | "secondary" | "danger";
  children?: React.ReactNode;
};

const Button = ({
  onClick,
  size = "md",
  type = "button",
  variant = "primary",
  disabled = false,
  className,
  children,
}: TProps) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs rounded-sm",
    md: "px-4 py-1 text-sm rounded-md",
    base: "px-5 py-2 text-base rounded-lg",
    lg: "px-6 py-2 text-lg rounded-lg",
  };

  const variantClasses = {
    primary: "bg-blue-700 border border-blue-700 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400",
    secondary:
      "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:bg-gray-100",
    danger: "bg-red-600 border border-red-700 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-400",
  };

  return (
    <button
      disabled={disabled}
      type={type}
      className={cn(
        "flex cursor-pointer items-center justify-center px-4 py-2 transition-all gap-4 duration-300 rounded-lg disabled:cursor-default",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
