import { cn } from "@/shared/utils/styling";
import { forwardRef } from "react";

type TProps = React.InputHTMLAttributes<HTMLInputElement> & {
  inputSize?: "sm" | "md" | "base" | "lg";
};

export const Input = forwardRef<HTMLInputElement, TProps>((props, ref) => {
  const { inputSize = "md", className, ...rest } = props;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs rounded-sm",
    md: "px-3 py-1 text-sm rounded-md",
    base: "px-4 py-2 text-base rounded-lg",
    lg: "px-5 py-2 text-lg rounded-lg",
  };

  return (
    <input
      ref={ref}
      {...rest}
      className={cn(
        "w-full bg-white border text-gray-900 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 hover:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500",
        sizeClasses[inputSize],
        className
      )}
    />
  );
});

Input.displayName = "Input";

export default Input;
