import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  modal?: boolean;
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  position?: "center" | "top" | "bottom";
  showClose?: boolean;
  onClose?: () => void;
}

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface DialogTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

const dialogVariants = {
  overlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  content: {
    center: {
      hidden: { opacity: 0, scale: 0.95, y: -20 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: "spring",
          duration: 0.3,
          bounce: 0.1,
        },
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        y: -20,
        transition: { duration: 0.2 },
      },
    },
    top: {
      hidden: { opacity: 0, y: -100 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          duration: 0.4,
          bounce: 0.1,
        },
      },
      exit: { opacity: 0, y: -100 },
    },
    bottom: {
      hidden: { opacity: 0, y: 100 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          duration: 0.4,
          bounce: 0.1,
        },
      },
      exit: { opacity: 0, y: 100 },
    },
  },
};

const dialogSizes = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-[95vw] max-h-[95vh]",
};

const dialogPositions = {
  center: "items-center justify-center",
  top: "items-start justify-center pt-16",
  bottom: "items-end justify-center pb-16",
};

// Context for managing dialog state
const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

const useDialogContext = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog provider");
  }
  return context;
};

// Main Dialog component (Provider)
const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children, modal = true }) => {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      if (modal) {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (modal) {
        document.body.style.overflow = "unset";
      }
    };
  }, [open, onOpenChange, modal]);

  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
};

// Dialog Trigger
const DialogTrigger = React.forwardRef<HTMLDivElement, DialogTriggerProps>(
  ({ className, children, asChild = false, onClick, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      onOpenChange(true);
      onClick?.(event);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onClick: handleClick,
        ...props,
      });
    }

    return (
      <div ref={ref} className={twMerge("cursor-pointer", className)} onClick={handleClick} {...props}>
        {children}
      </div>
    );
  }
);

DialogTrigger.displayName = "DialogTrigger";

// Dialog Overlay
const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(({ className, onClick, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={twMerge("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm", className)}
      variants={dialogVariants.overlay}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClick}
      style={props.style}
      role={props.role}
      aria-label={props["aria-label"]}
      tabIndex={props.tabIndex}
    />
  );
});

DialogOverlay.displayName = "DialogOverlay";

// Dialog Content
const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, size = "md", position = "center", showClose = true, onClose, ...props }, ref) => {
    const { open, onOpenChange } = useDialogContext();
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Handle click outside to close
    const handleOverlayClick = (event: React.MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        onClose?.() || onOpenChange(false);
      }
    };

    const handleCloseClick = () => {
      onClose?.() || onOpenChange(false);
    };

    return (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50">
            <DialogOverlay onClick={handleOverlayClick} />
            <div className={twMerge("fixed inset-0 z-50 flex", dialogPositions[position])}>
              <motion.div
                ref={contentRef}
                className={twMerge(
                  "relative bg-white rounded-lg shadow-xl border border-gray-200",
                  "w-full mx-4 my-4 p-6",
                  dialogSizes[size],
                  position === "bottom" && "mb-4",
                  position === "top" && "mt-4",
                  className
                )}
                variants={dialogVariants.content[position]}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
                style={props.style}
                role={props.role}
                aria-label={props["aria-label"]}
                tabIndex={props.tabIndex}
              >
                {showClose && (
                  <button
                    onClick={handleCloseClick}
                    className="absolute top-4 right-4 p-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none cursor-pointer"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </button>
                )}
                {children}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  }
);

DialogContent.displayName = "DialogContent";

// Dialog Header
const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}
      {...props}
    />
  );
});

DialogHeader.displayName = "DialogHeader";

// Dialog Title
const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(({ className, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={twMerge("text-lg font-semibold leading-none tracking-tight text-gray-900", className)}
      {...props}
    />
  );
});

DialogTitle.displayName = "DialogTitle";

// Dialog Description
const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={twMerge("text-sm text-gray-500", className)} {...props} />;
  }
);

DialogDescription.displayName = "DialogDescription";

// Dialog Footer
const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6 pt-4 border-t border-gray-100",
        className
      )}
      {...props}
    />
  );
});

DialogFooter.displayName = "DialogFooter";

// Hook for imperative dialog control
export const useDialog = () => {
  const [open, setOpen] = React.useState(false);

  const openDialog = React.useCallback(() => setOpen(true), []);
  const closeDialog = React.useCallback(() => setOpen(false), []);
  const toggleDialog = React.useCallback(() => setOpen((prev) => !prev), []);

  return {
    open,
    openDialog,
    closeDialog,
    toggleDialog,
    setOpen,
  };
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogOverlay,
};

/*
Usage Examples:

// Basic Dialog
const BasicDialog = () => {
  const { open, openDialog, closeDialog } = useDialog();

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogTrigger asChild>
        <Button onClick={openDialog}>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a description of what the dialog does.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Dialog content goes here...</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button variant="primary">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Confirmation Dialog
const ConfirmDialog = ({ open, onOpenChange, onConfirm, title, description }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Different Sizes and Positions
<DialogContent size="xs">Extra Small Dialog</DialogContent>
<DialogContent size="lg" position="top">Large Dialog at Top</DialogContent>
<DialogContent size="2xl" position="center">Extra Large Centered</DialogContent>
<DialogContent size="full">Full Size Dialog</DialogContent>

// Custom styling
<DialogContent className="max-w-4xl" showClose={false}>
  Custom styled dialog without close button
</DialogContent>

// Form Dialog
const FormDialog = () => {
  const { open, openDialog, closeDialog } = useDialog();
  
  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogTrigger asChild>
        <Button>Add Item</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new item.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4">
          <Input placeholder="Item name" />
          <Input placeholder="Description" />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
*/
