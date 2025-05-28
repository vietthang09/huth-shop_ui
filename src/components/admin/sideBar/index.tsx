"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect, createContext, useContext, useMemo, useCallback, memo } from "react";
import {
  ListIcon,
  ShoppingIconFill,
  ProfileIcon,
  ClockIcon,
  SearchIcon,
  HeartIcon,
  StarIcon,
  PlusIcon,
  ReportIcon,
} from "../../icons/svgIcons";
import {
  useSidebarState,
  useKeyboardNavigation,
  useSidebarData,
  getActiveState,
  trackNavigation,
  a11yProps,
} from "./utils";
import styles from "./sidebar.module.css";

// Create a context for sidebar collapsed state
interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleCollapse: () => {},
});

// Enhanced interfaces for better type safety
interface DropdownChild {
  href: string;
  label: string;
  isActive: boolean;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface NavItemProps {
  href: string;
  label: string;
  isActive: boolean;
  icon: React.ReactNode;
  badge?: number | string;
  onClick?: () => void;
  children?: React.ReactNode;
  hasDropdown?: boolean;
  isLoading?: boolean;
}

interface NavSection {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  hasDropdown?: boolean;
  children?: DropdownChild[];
}

// Enhanced error boundary component for sidebar
class SidebarErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Sidebar Error:", error, errorInfo);
    // Track error in analytics if available
    if (typeof window !== "undefined" && "gtag" in window) {
      (window as any).gtag("event", "exception", {
        description: error.message,
        fatal: false,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 text-center text-red-600">
            <p className="text-sm">Something went wrong with the sidebar.</p>
            <button className="mt-2 text-xs underline hover:no-underline" onClick={() => window.location.reload()}>
              Refresh page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Enhanced NavItem component with better animations and accessibility
const NavItem = memo(
  ({ href, label, isActive, icon, badge, onClick, children, hasDropdown, isLoading }: NavItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isCollapsed } = useContext(SidebarContext);

    // Auto-close dropdown when sidebar is collapsed
    useEffect(() => {
      if (isCollapsed) {
        setIsOpen(false);
      }
    }, [isCollapsed]);

    // Auto-open dropdown if any child is active
    useEffect(() => {
      if (hasDropdown && children && !isCollapsed) {
        const hasActiveChild = React.Children.toArray(children).some((child: any) => {
          return child?.props?.isActive === true;
        });
        if (hasActiveChild && !isOpen) {
          setIsOpen(true);
        }
      }
    }, [hasDropdown, children, isCollapsed, isOpen]);

    const toggleDropdown = useCallback(
      (e: React.MouseEvent) => {
        if (hasDropdown) {
          e.preventDefault();
          e.stopPropagation();
          console.log(`Toggling dropdown for ${label}: ${!isOpen}`);
          setIsOpen((prev) => !prev);
          trackNavigation(`${label} dropdown ${!isOpen ? "opened" : "closed"}`, href);
        }
      },
      [hasDropdown, isOpen, label, href]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (hasDropdown && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }
      },
      [hasDropdown]
    );

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        if (hasDropdown) {
          toggleDropdown(e);
        } else {
          trackNavigation(label, href);
          onClick?.();
        }
      },
      [hasDropdown, toggleDropdown, label, href, onClick]
    );
    return (
      <div className={`relative group ${styles.navItem}`}>
        {hasDropdown ? (
          <button
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} ${
              isCollapsed ? "px-3" : "px-4"
            } py-3 mb-1 rounded-xl transition-all duration-300 relative ${styles.navItemContent} text-left
            ${
              isActive
                ? `${styles.navItemActive} bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold shadow-sm border border-blue-200`
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600 active:bg-gray-100 hover:shadow-sm"
            }
            group/item overflow-hidden ${styles.focusRing}
          `}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            title={isCollapsed ? label : undefined}
            {...a11yProps({ isActive, hasChildren: hasDropdown, isExpanded: isOpen })}
            aria-expanded={isOpen}
            tabIndex={0}
          >
            <div
              className={`flex-shrink-0 relative z-10 transition-all duration-300 group-hover/item:scale-110 
            ${isActive ? "text-blue-600" : "text-gray-500 group-hover/item:text-blue-600"}
            ${isLoading ? "animate-pulse" : ""}`}
            >
              {icon}
            </div>

            {!isCollapsed && (
              <>
                <span className="flex-grow relative z-10 transition-all duration-200">{label}</span>

                {/* Enhanced Badge */}
                {badge !== undefined && (
                  <span
                    className={`flex items-center justify-center text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-300 min-w-[20px] ${
                      styles.badge
                    }
                  ${
                    isActive
                      ? "bg-blue-200 text-blue-800 shadow-sm"
                      : "bg-gray-200 text-gray-700 group-hover:item:bg-blue-100 group-hover:item:text-blue-700"
                  }
                  ${isLoading ? `${styles.shimmer}` : ""}`}
                  >
                    {isLoading ? "..." : badge}
                  </span>
                )}

                {/* Enhanced Dropdown Arrow */}
                <div className={`transform transition-all duration-300 ${isOpen ? "rotate-180" : "rotate-0"} ml-1`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </>
            )}
          </button>
        ) : (
          <Link
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} ${
              isCollapsed ? "px-3" : "px-4"
            } py-3 mb-1 rounded-xl transition-all duration-300 relative ${styles.navItemContent}
            ${
              isActive
                ? `${styles.navItemActive} bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold shadow-sm border border-blue-200`
                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600 active:bg-gray-100 hover:shadow-sm"
            }
            group/item overflow-hidden ${styles.focusRing}
          `}
            href={href}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            title={isCollapsed ? label : undefined}
            {...a11yProps({ isActive })}
            tabIndex={0}
          >
            <div
              className={`flex-shrink-0 relative z-10 transition-all duration-300 group-hover/item:scale-110 
            ${isActive ? "text-blue-600" : "text-gray-500 group-hover/item:text-blue-600"}
            ${isLoading ? "animate-pulse" : ""}`}
            >
              {icon}
            </div>

            {!isCollapsed && (
              <>
                <span className="flex-grow relative z-10 transition-all duration-200">{label}</span>

                {/* Enhanced Badge */}
                {badge !== undefined && (
                  <span
                    className={`flex items-center justify-center text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-300 min-w-[20px] ${
                      styles.badge
                    }
                  ${
                    isActive
                      ? "bg-blue-200 text-blue-800 shadow-sm"
                      : "bg-gray-200 text-gray-700 group-hover:item:bg-blue-100 group-hover:item:text-blue-700"
                  }
                  ${isLoading ? `${styles.shimmer}` : ""}`}
                  >
                    {isLoading ? "..." : badge}
                  </span>
                )}
              </>
            )}
          </Link>
        )}{" "}
        {/* Enhanced Dropdown */}
        {hasDropdown && !isCollapsed && (
          <div
            className={`relative overflow-hidden transition-all duration-300 ease-in-out z-10 ${
              isOpen ? "max-h-96 opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none"
            }`}
            style={{
              maxHeight: isOpen ? "24rem" : "0",
            }}
          >
            <div className="ml-6 pl-4 border-l-2 border-gray-200 mt-2 mb-3 space-y-1 relative z-20">{children}</div>
          </div>
        )}
        {/* Enhanced Tooltip */}
        {isCollapsed && (
          <div
            className={`absolute left-full ml-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg ${styles.tooltip} group-hover:${styles.tooltipVisible} whitespace-nowrap z-50 pointer-events-none`}
          >
            <div className="font-medium">{label}</div>
            {badge && <div className="text-xs text-blue-300 mt-1">({badge} items)</div>}
            {/* Tooltip arrow */}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
          </div>
        )}
      </div>
    );
  }
);

NavItem.displayName = "NavItem";

// Enhanced dropdown child component
const DropdownChild = memo(({ href, label, isActive, icon }: DropdownChild) => (
  <Link
    href={href}
    className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-all duration-200 hover:shadow-sm ${
      styles.focusRing
    }
      ${
        isActive
          ? "text-blue-700 bg-blue-50 font-medium border border-blue-200"
          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
      }`}
    onClick={() => trackNavigation(label, href)}
    {...a11yProps({ isActive })}
  >
    {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
    <span>{label}</span>
  </Link>
));

DropdownChild.displayName = "DropdownChild";

// Enhanced loading skeleton component
const LoadingSkeleton = memo(({ isCollapsed }: { isCollapsed: boolean }) => (
  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-4 py-3 mb-1`}>
    <div className={`w-5 h-5 bg-gray-200 rounded ${styles.shimmer}`}></div>
    {!isCollapsed && (
      <>
        <div className={`flex-grow h-4 bg-gray-200 rounded ${styles.shimmer}`}></div>
        <div className={`w-6 h-4 bg-gray-200 rounded-full ${styles.shimmer}`}></div>
      </>
    )}
  </div>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

const AdminSidebar = () => {
  const pathname = usePathname();

  // Use custom hooks for better state management
  const { isCollapsed, isMobileMenuOpen, toggleCollapse, toggleMobileMenu } = useSidebarState();
  const { loading: isLoading, error, navigationData, orderCount, pendingImportsCount } = useSidebarData();

  // Add keyboard navigation
  const keyboardNav = useKeyboardNavigation();

  // Enhanced active state checker with memoization
  const isActive = useCallback((path: string) => getActiveState(pathname, path), [pathname]);

  // Memoized navigation items for better performance
  const mainNavItems = useMemo(
    () => [
      {
        href: "/admin",
        label: "Dashboard",
        icon: (
          <StarIcon
            width={20}
            strokeWidth={1.5}
            stroke={isActive("/admin") ? "#3B82F6" : "#6B7280"}
            fill="none"
            className="transition-colors duration-300"
          />
        ),
      },
      {
        href: "/admin/products",
        label: "Products",
        icon: (
          <ShoppingIconFill
            width={20}
            fill={isActive("/admin/products") ? "#3B82F6" : "#6B7280"}
            className="transition-colors duration-300"
          />
        ),
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: (
          <ListIcon
            width={20}
            fill={isActive("/admin/categories") ? "#3B82F6" : "#6B7280"}
            className="transition-colors duration-300"
          />
        ),
      },
      {
        href: "/admin/attributes",
        label: "Attributes",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke={isActive("/admin/attributes") ? "#3B82F6" : "#6B7280"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z"></path>
            <path d="M2 7l10 5M12 22V12M22 7l-10 5"></path>
          </svg>
        ),
      },
      {
        href: "/admin/suppliers",
        label: "Suppliers",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke={isActive("/admin/suppliers") ? "#3B82F6" : "#6B7280"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          >
            <path d="M3 7v6h6V7M3 17v2h6v-2M13 7v6h6V7M13 17v2h6v-2" />
            <path d="M7 3v4M17 3v4" />
          </svg>
        ),
      },
    ],
    [isActive]
  );

  const inventorySection: NavSection = useMemo(
    () => ({
      href: "/admin/inventory",
      label: "Inventory",
      icon: (
        <ListIcon
          width={20}
          strokeWidth={1.5}
          stroke={isActive("/admin/inventory") ? "#3B82F6" : "#6B7280"}
          fill="none"
          className="transition-colors duration-300"
        />
      ),
      badge: pendingImportsCount && pendingImportsCount > 0 ? pendingImportsCount.toString() : undefined,
      hasDropdown: true,
      children: [
        {
          href: "/admin/inventory",
          label: "Overview",
          isActive: pathname === "/admin/inventory",
          icon: (
            <SearchIcon
              width={16}
              strokeWidth={1.5}
              stroke={pathname === "/admin/inventory" ? "#3B82F6" : "#6B7280"}
              fill="none"
              className="transition-colors duration-300"
            />
          ),
        },
        {
          href: "/admin/inventory/imports",
          label: "Imports",
          isActive:
            pathname === "/admin/inventory/imports" ||
            (pathname.startsWith("/admin/inventory/imports/") && !pathname.includes("/new")),
          icon: (
            <ListIcon
              width={16}
              strokeWidth={1.5}
              stroke={
                pathname.includes("/admin/inventory/imports") && !pathname.includes("/reports") ? "#3B82F6" : "#6B7280"
              }
              fill="none"
              className="transition-colors duration-300"
            />
          ),
          badge: pendingImportsCount && pendingImportsCount > 0 ? pendingImportsCount.toString() : undefined,
        },
        {
          href: "/admin/inventory/imports/new",
          label: "New Import",
          isActive: pathname === "/admin/inventory/imports/new",
          icon: (
            <PlusIcon
              width={16}
              strokeWidth={1.5}
              stroke={pathname === "/admin/inventory/imports/new" ? "#3B82F6" : "#6B7280"}
              className="transition-colors duration-300"
            />
          ),
        },
        {
          href: "/admin/inventory/reports",
          label: "Reports",
          isActive: pathname === "/admin/inventory/reports",
          icon: (
            <ReportIcon
              width={16}
              strokeWidth={1.5}
              stroke={pathname === "/admin/inventory/reports" ? "#3B82F6" : "#6B7280"}
              fill="none"
              className="transition-colors duration-300"
            />
          ),
        },
      ],
    }),
    [isActive, pathname, pendingImportsCount]
  );

  const ordersSection: NavSection = useMemo(
    () => ({
      href: "/admin/orders",
      label: "Orders",
      icon: (
        <ClockIcon
          width={20}
          fill={isActive("/admin/orders") ? "#3B82F6" : "#6B7280"}
          className="transition-colors duration-300"
        />
      ),
      badge: orderCount !== null ? orderCount.toString() : undefined,
      hasDropdown: true,
      children: [
        {
          href: "/admin/orders",
          label: "All Orders",
          isActive: pathname === "/admin/orders",
        },
        {
          href: "/admin/orders/new",
          label: "Create Order",
          isActive: pathname === "/admin/orders/new",
        },
        {
          href: "/admin/orders/export",
          label: "Export Data",
          isActive: pathname === "/admin/orders/export",
        },
      ],
    }),
    [isActive, pathname, orderCount]
  );

  const secondaryNavItems = useMemo(
    () => [
      {
        href: "/admin/post",
        label: "Blog Posts",
        icon: (
          <PlusIcon
            width={20}
            strokeWidth={1.5}
            stroke={isActive("/admin/post") ? "#3B82F6" : "#6B7280"}
            className="transition-colors duration-300"
          />
        ),
      },
      {
        href: "/admin/users",
        label: "Users",
        icon: (
          <ProfileIcon
            width={20}
            strokeWidth={1.5}
            stroke={isActive("/admin/users") ? "#3B82F6" : "#6B7280"}
            fill="none"
            className="transition-colors duration-300"
          />
        ),
      },
    ],
    [isActive]
  );

  const sidebarContextValue = useMemo(
    () => ({
      isCollapsed,
      toggleCollapse,
    }),
    [isCollapsed, toggleCollapse]
  );

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      {/* Enhanced Mobile Menu Button */}
      <button
        className="lg:hidden fixed z-50 bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
        aria-expanded={isMobileMenuOpen}
      >
        <div className="w-6 h-6 relative">
          <div
            className={`absolute inset-0 transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 opacity-100" : "rotate-0 opacity-100"
            }`}
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </div>
        </div>
      </button>

      {/* Enhanced Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-30 transition-all duration-300"
          onClick={toggleMobileMenu}
          aria-label="Close mobile menu"
        ></div>
      )}

      {/* Enhanced Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-40
        ${isCollapsed ? "w-[80px]" : "w-[300px]"} h-full overflow-y-auto overflow-x-hidden
        bg-white ${isCollapsed ? "p-4" : "p-6"} border-r border-gray-200 shadow-xl
        flex flex-col backdrop-blur-md
        transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
      `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Enhanced Collapse Button */}
        <button
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-300 rounded-full shadow-lg items-center justify-center z-50 hover:bg-gray-50 hover:border-gray-400 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-gray-600 transform transition-transform duration-300 ${
              isCollapsed ? "rotate-0" : "rotate-180"
            }`}
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Enhanced Header */}
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-4"} pb-6 mb-6 border-b border-gray-200`}
        >
          <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <span className="drop-shadow-sm">A</span>
          </div>
          {!isCollapsed && (
            <div className="transition-all duration-300">
              <h1 className="text-gray-900 text-xl font-bold tracking-tight">Admin Panel</h1>
              <p className="text-gray-500 text-sm font-medium">Manage your store</p>
            </div>
          )}
        </div>

        {/* Enhanced User Profile Section */}
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          } p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl mb-6 border border-gray-200 hover:shadow-sm transition-all duration-300`}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          {!isCollapsed && (
            <div className="transition-all duration-300">
              <div className="font-semibold text-gray-800 text-sm">Admin User</div>
              <div className="text-xs text-gray-500 font-medium">admin@example.com</div>
            </div>
          )}
        </div>

        {/* Main Navigation Section */}
        <nav className="space-y-2 mb-8" aria-label="Primary navigation">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => <LoadingSkeleton key={index} isCollapsed={isCollapsed} />)
          ) : (
            <>
              {mainNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive(item.href)}
                  isLoading={isLoading}
                />
              ))}

              {/* Enhanced Inventory Section */}
              <NavItem
                href={inventorySection.href}
                label={inventorySection.label}
                icon={inventorySection.icon}
                isActive={isActive(inventorySection.href)}
                badge={inventorySection.badge}
                hasDropdown={inventorySection.hasDropdown}
                isLoading={isLoading}
              >
                {inventorySection.children?.map((child) => (
                  <DropdownChild key={child.href} {...child} />
                ))}
              </NavItem>

              {/* Enhanced Orders Section */}
              <NavItem
                href={ordersSection.href}
                label={ordersSection.label}
                icon={ordersSection.icon}
                isActive={isActive(ordersSection.href)}
                badge={ordersSection.badge}
                hasDropdown={ordersSection.hasDropdown}
                isLoading={isLoading}
              >
                {ordersSection.children?.map((child) => (
                  <DropdownChild key={child.href} {...child} />
                ))}
              </NavItem>
            </>
          )}
        </nav>

        {/* Secondary Navigation Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider px-4 mb-3 transition-all duration-300">
              Content Management
            </h3>
          )}
          <nav className="space-y-2" aria-label="Secondary navigation">
            {secondaryNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive(item.href)}
                isLoading={isLoading}
              />
            ))}
          </nav>
        </div>

        {/* Enhanced Footer Section */}
        <div className="mt-auto pt-6 border-t border-gray-200 space-y-2">
          <Link
            href="/admin/settings"
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} ${
              isCollapsed ? "px-3" : "px-4"
            } py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 active:bg-gray-100 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 group`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <span className="flex-shrink-0 text-gray-500 group-hover:text-blue-600 transition-colors duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </span>
            {!isCollapsed && <span className="font-medium">Settings</span>}
          </Link>

          <Link
            href="/logout"
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} ${
              isCollapsed ? "px-3" : "px-4"
            } py-3 text-red-500 hover:bg-red-50 hover:text-red-700 active:bg-red-100 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 group`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <span className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </span>
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </Link>
        </div>
      </aside>
    </SidebarContext.Provider>
  );
};

export default function AdminSidebarWithErrorBoundary() {
  return (
    <SidebarErrorBoundary
      fallback={<div className="p-4 text-center text-red-600">Something went wrong. Please try again later.</div>}
    >
      <AdminSidebar />
    </SidebarErrorBoundary>
  );
}
