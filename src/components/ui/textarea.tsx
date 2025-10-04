import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className = "", ...props }, ref) => {
  const baseClasses = `
      flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm
      placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 
      focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50
      resize-none
    `
    .trim()
    .replace(/\s+/g, " ");

  return <textarea className={`${baseClasses} ${className}`} ref={ref} {...props} />;
});

Textarea.displayName = "Textarea";
