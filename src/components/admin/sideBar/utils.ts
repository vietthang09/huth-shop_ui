// Utility functions for sidebar functionality
import { useEffect, useCallback, useState, useRef } from "react";

/**
 * Hook for managing sidebar state with localStorage persistence
 */
export const useSidebarState = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      const collapsed = savedState === "true";
      setIsCollapsed(collapsed);
      updateCSSVariable(collapsed);
    }
  }, []);

  const updateCSSVariable = useCallback((collapsed: boolean) => {
    document.documentElement.style.setProperty("--sidebar-width", collapsed ? "80px" : "300px");
  }, []);

  const toggleCollapse = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    updateCSSVariable(newState);
    localStorage.setItem("sidebar-collapsed", newState.toString());
  }, [isCollapsed, updateCSSVariable]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isCollapsed,
    isMobileMenuOpen,
    toggleCollapse,
    toggleMobileMenu,
  };
};

/**
 * Hook for fetching sidebar navigation data
 */
export const useSidebarData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigationData, setNavigationData] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [pendingImportsCount, setPendingImportsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call - replace with actual data fetching
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock order count - replace with actual API call
        setOrderCount(12);

        // Mock pending imports count - replace with actual API call
        setPendingImportsCount(3);

        const mockData = [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: "Dashboard",
            href: "/admin",
            badge: null,
          },
          {
            id: "analytics",
            label: "Analytics",
            icon: "BarChart",
            href: "/admin/analytics",
            badge: { text: "New", variant: "success" },
          },
          {
            id: "products",
            label: "Products",
            icon: "Package",
            href: "/admin/products",
            badge: null,
          },
          {
            id: "orders",
            label: "Orders",
            icon: "ShoppingCart",
            href: "/admin/orders",
            badge: { text: "12", variant: "primary" },
          },
          {
            id: "inventory",
            label: "Inventory",
            icon: "Warehouse",
            href: "/admin/inventory",
            badge: { text: "3", variant: "warning" },
            children: [
              { id: "inventory-overview", label: "Overview", href: "/admin/inventory" },
              { id: "inventory-imports", label: "Imports", href: "/admin/inventory/imports" },
              { id: "inventory-reports", label: "Reports", href: "/admin/inventory/reports" },
            ],
          },
          {
            id: "customers",
            label: "Customers",
            icon: "Users",
            href: "/admin/customers",
            badge: null,
          },
          {
            id: "settings",
            label: "Settings",
            icon: "Settings",
            children: [
              { id: "general", label: "General", href: "/admin/settings/general" },
              { id: "security", label: "Security", href: "/admin/settings/security" },
              { id: "integrations", label: "Integrations", href: "/admin/settings/integrations" },
            ],
          },
        ];

        setNavigationData(mockData);
        setError(null);
      } catch (err) {
        setError("Failed to load navigation data");
        console.error("Error fetching sidebar data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    loading,
    error,
    navigationData,
    orderCount,
    pendingImportsCount,
    // For backward compatibility
    isLoading: loading,
  };
};

/**
 * Hook for keyboard navigation within the sidebar
 */
export const useKeyboardNavigation = () => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent, itemCount: number) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % itemCount);
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + itemCount) % itemCount);
          break;
        case "Home":
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          event.preventDefault();
          setFocusedIndex(itemCount - 1);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
            itemRefs.current[focusedIndex]?.click();
          }
          break;
      }
    },
    [focusedIndex]
  );

  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  return {
    focusedIndex,
    setFocusedIndex,
    itemRefs,
    handleKeyDown,
  };
};

/**
 * Utility class for localStorage operations with error handling
 */
export class LocalStorageUtils {
  static safeRead(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Error reading localStorage key "' + key + '":', error);
      return null;
    }
  }

  static safeWrite(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Error setting localStorage key "' + key + '":', error);
      return false;
    }
  }

  static safeRemove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Error removing localStorage key "' + key + '":', error);
      return false;
    }
  }
}

/**
 * Format a timestamp into a human-readable relative time string
 */
export const formatTimeAgo = (timestamp: Date | string | number): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMs = now.getTime() - time.getTime();

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return diffInMinutes + "m ago";
  if (diffInHours < 24) return diffInHours + "h ago";
  if (diffInDays < 7) return diffInDays + "d ago";

  return time.toLocaleDateString();
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate a unique ID for components
 */
export const generateId = (prefix: string = "id"): string => {
  return prefix + "-" + Math.random().toString(36).substr(2, 9);
};

/**
 * Check if an element is visible in the viewport
 */
export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Create CSS rules dynamically
 */
export const createCSSRule = (selector: string, styles: Record<string, string>): void => {
  const sheet = document.styleSheets[0];
  if (!sheet) return;

  const styleEntries = Object.entries(styles)
    .map(([property, value]) => property + ": " + value)
    .join("; ");

  const rule = selector + " { " + styleEntries + " }";

  try {
    sheet.insertRule(rule, sheet.cssRules.length);
  } catch (error) {
    console.warn("Failed to insert CSS rule:", error);
  }
};

/**
 * Get user preference for reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Focus trap utility for accessibility
 */
export const createFocusTrap = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Tab") {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  container.addEventListener("keydown", handleKeyDown);

  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
};

/**
 * Notification system for user feedback
 */
export class NotificationSystem {
  private static instance: NotificationSystem;
  private notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    duration?: number;
  }> = [];

  static getInstance(): NotificationSystem {
    if (!NotificationSystem.instance) {
      NotificationSystem.instance = new NotificationSystem();
    }
    return NotificationSystem.instance;
  }

  show(type: "success" | "error" | "warning" | "info", message: string, duration = 5000) {
    const id = generateId("notification");
    const notification = { id, type, message, duration };

    this.notifications.push(notification);
    this.displayNotification(notification);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  remove(id: string) {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.removeNotificationElement(id);
    }
  }

  private displayNotification(notification: (typeof this.notifications)[0]) {
    // Create notification element
    const element = document.createElement("div");
    element.id = notification.id;
    element.className = "notification notification-" + notification.type;
    element.textContent = notification.message;

    // Add to DOM
    let container = document.getElementById("notification-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "notification-container";
      container.className = "notification-container";
      document.body.appendChild(container);
    }

    container.appendChild(element);

    // Trigger animation
    requestAnimationFrame(() => {
      element.classList.add("notification-enter");
    });
  }

  private removeNotificationElement(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add("notification-exit");
      setTimeout(() => {
        element.remove();
      }, 300);
    }
  }
}

/**
 * Animation utilities
 */
export const AnimationUtils = {
  fadeIn: (element: HTMLElement, duration = 300) => {
    element.style.opacity = "0";
    element.style.transition = "opacity " + duration + "ms ease-in-out";

    requestAnimationFrame(() => {
      element.style.opacity = "1";
    });
  },

  fadeOut: (element: HTMLElement, duration = 300) => {
    element.style.transition = "opacity " + duration + "ms ease-in-out";
    element.style.opacity = "0";

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        element.style.display = "none";
        resolve();
      }, duration);
    });
  },

  slideDown: (element: HTMLElement, duration = 300) => {
    element.style.height = "0";
    element.style.overflow = "hidden";
    element.style.transition = "height " + duration + "ms ease-in-out";

    requestAnimationFrame(() => {
      element.style.height = element.scrollHeight + "px";
    });
  },

  slideUp: (element: HTMLElement, duration = 300) => {
    element.style.height = element.scrollHeight + "px";
    element.style.overflow = "hidden";
    element.style.transition = "height " + duration + "ms ease-in-out";

    requestAnimationFrame(() => {
      element.style.height = "0";
    });

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        element.style.display = "none";
        resolve();
      }, duration);
    });
  },
};

/**
 * Validation utilities
 */
export const ValidationUtils = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidURL: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isValidPassword: (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },
};

/**
 * Check if a navigation item should be active based on current path
 */
export const getActiveState = (href: string, currentPath: string): boolean => {
  if (href === "/admin" && currentPath === "/admin") {
    return true;
  }
  if (href !== "/admin" && currentPath.startsWith(href)) {
    return true;
  }
  return false;
};

/**
 * Track navigation events for analytics
 */
export const trackNavigation = (href: string, label: string): void => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "navigation_click", {
      page_location: href,
      page_title: label,
      custom_parameter: "sidebar_navigation",
    });
  }

  // Console log for development
  console.log("Navigation tracked:", { href, label, timestamp: new Date().toISOString() });
};

/**
 * Generate accessibility properties for navigation items
 */
export const a11yProps = (props: {
  isActive?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  index?: number;
  totalItems?: number;
}) => {
  const { isActive, hasChildren, isExpanded, index, totalItems } = props;

  const ariaProps: Record<string, any> = {
    role: hasChildren ? "button" : "menuitem",
    tabIndex: 0,
  };

  if (isActive) {
    ariaProps["aria-current"] = "page";
  }

  if (hasChildren) {
    ariaProps["aria-expanded"] = isExpanded ? "true" : "false";
    ariaProps["aria-haspopup"] = "true";
  }

  if (typeof index === "number" && typeof totalItems === "number") {
    ariaProps["aria-setsize"] = totalItems;
    ariaProps["aria-posinset"] = index + 1;
  }

  return ariaProps;
};
