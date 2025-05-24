"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";
import {
  ListIcon,
  ShoppingIconFill,
  ProfileIcon,
  ClockIcon,
  SearchIcon,
  HeartIcon,
  StarIcon,
  DeleteIcon,
  PlusIcon,
} from "../../icons/svgIcons";

// Create a context for sidebar collapsed state
const SidebarContext = createContext(false);

type NavItemProps = {
  href: string;
  label: string;
  isActive: boolean;
  icon: React.ReactNode;
  badge?: number | string;
  onClick?: () => void;
  children?: React.ReactNode;
  hasDropdown?: boolean;
};

const NavItem = ({ href, label, isActive, icon, badge, onClick, children, hasDropdown }: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // Get the collapsed state from parent component
  const isCollapsed = useContext(SidebarContext);

  const toggleDropdown = (e: React.MouseEvent) => {
    if (hasDropdown) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <Link
        className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3"} ${
          isCollapsed ? "px-2" : "px-4"
        } py-3 mb-1 rounded-lg transition-all duration-200 relative
          ${
            isActive
              ? "bg-blue-100 text-blue-600 font-medium shadow-sm"
              : "text-gray-600 hover:bg-gray-50 hover:text-blue-500 active:bg-gray-100"
          }
          group overflow-hidden
        `}
        href={hasDropdown ? "#" : href}
        onClick={hasDropdown ? toggleDropdown : onClick}
        title={isCollapsed ? label : undefined}
      >
        <div
          className={`flex-shrink-0 relative z-10 transition-transform duration-200 group-hover:scale-110 
          ${isActive ? "text-blue-500" : "text-gray-500 group-hover:text-blue-500"}`}
        >
          {icon}
        </div>
        {!isCollapsed && <span className="flex-grow relative z-10">{label}</span>}
        {!isCollapsed && badge !== undefined && (
          <span
            className={`flex items-center justify-center text-xs px-2 py-0.5 rounded-full transition-all duration-200
            ${
              isActive
                ? "bg-blue-200 text-blue-800"
                : "bg-gray-200 text-gray-700 group-hover:bg-blue-100 group-hover:text-blue-600"
            }
          `}
          >
            {badge}
          </span>
        )}
        {!isCollapsed && hasDropdown && (
          <div className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
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
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        )}
        {!isActive && (
          <div className="absolute inset-0 bg-blue-50 opacity-0 transform origin-left scale-x-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-x-100"></div>
        )}
      </Link>
      {hasDropdown && isOpen && !isCollapsed && (
        <div className="ml-4 pl-4 border-l border-gray-200 mt-1 mb-3 space-y-1">{children}</div>
      )}
    </div>
  );
};

const AdminSidebar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  // Fetch order count - in a real app this would come from an API
  useEffect(() => {
    // Simulating an API call to get pending orders count
    setTimeout(() => {
      setOrderCount(5); // This would be the result of your API call
    }, 500);
  }, []);

  const mainNavItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: (
        <StarIcon
          width={18}
          strokeWidth={1.5}
          stroke={pathname === "/admin" ? "#3B82F6" : "#6B7280"}
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
          width={18}
          fill={pathname.includes("/admin/products") ? "#3B82F6" : "#6B7280"}
          className="transition-colors duration-300"
        />
      ),
    },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: (
        <ListIcon
          width={18}
          fill={pathname.includes("/admin/categories") ? "#3B82F6" : "#6B7280"}
          className="transition-colors duration-300"
        />
      ),
    },
    {
      href: "/admin/inventory",
      label: "Inventory",
      icon: (
        <SearchIcon
          width={18}
          strokeWidth={1.5}
          stroke={pathname.includes("/admin/inventory") ? "#3B82F6" : "#6B7280"}
          fill="none"
          className="transition-colors duration-300"
        />
      ),
    },
  ];

  // Orders section with dropdown for sub-pages
  const ordersSection = {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <ClockIcon
        width={18}
        fill={pathname.includes("/admin/orders") ? "#3B82F6" : "#6B7280"}
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
  };

  const secondaryNavItems = [
    {
      href: "/admin/post",
      label: "Blog Posts",
      icon: (
        <PlusIcon
          width={18}
          strokeWidth={1.5}
          stroke={pathname.includes("/admin/blogs") ? "#3B82F6" : "#6B7280"}
          className="transition-colors duration-300"
        />
      ),
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: (
        <ProfileIcon
          width={18}
          strokeWidth={1.5}
          stroke={pathname.includes("/admin/users") ? "#3B82F6" : "#6B7280"}
          fill="none"
          className="transition-colors duration-300"
        />
      ),
    },
  ];

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") {
      return true;
    }
    return path !== "/admin" && pathname.includes(path);
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    // Update the CSS variable for the sidebar width
    document.documentElement.style.setProperty("--sidebar-width", newState ? "70px" : "280px");
  };

  // Set initial CSS variable on mount
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", isCollapsed ? "70px" : "280px");
  }, []);
  return (
    <SidebarContext.Provider value={isCollapsed}>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed z-30 bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
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
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={toggleMobileMenu}></div>
      )}{" "}
      <aside
        className={`
        fixed top-0 left-0 z-40
        ${isCollapsed ? "w-[70px]" : "w-[280px]"} h-full overflow-y-auto overflow-x-hidden
        bg-white ${isCollapsed ? "p-3" : "p-6"} border-r border-gray-200 shadow-md 
        flex flex-col
        transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Collapse button */}
        <button
          className="absolute right-0 top-0 w-12 h-12 bg-white border border-gray-200 rounded-r-md shadow-md items-center justify-center flex z-50 hover:bg-gray-50"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-gray-500 transform transition-transform duration-300 ${
              isCollapsed ? "rotate-0" : "rotate-180"
            }`}
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} pb-6 mb-6 border-b border-gray-200`}
        >
          <div className="bg-gradient-to-tr from-blue-600 to-blue-400 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">
            A
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-gray-800 text-lg font-medium">Admin Panel</h2>
              <p className="text-gray-500 text-sm">Manage your store</p>
            </div>
          )}
        </div>
        {/* User profile info */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} p-3 bg-gray-50 rounded-lg mb-6`}>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          {!isCollapsed && (
            <div>
              <div className="font-medium text-gray-700">Admin User</div>
              <div className="text-xs text-gray-500">admin@example.com</div>
            </div>
          )}
        </div>
        <div className="space-y-1 mb-8">
          {mainNavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive(item.href)}
            />
          ))}

          {/* Orders with dropdown */}
          <NavItem
            href={ordersSection.href}
            label={ordersSection.label}
            icon={ordersSection.icon}
            isActive={isActive(ordersSection.href)}
            badge={ordersSection.badge}
            hasDropdown={ordersSection.hasDropdown}
          >
            {ordersSection.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`block py-2 px-3 rounded-md text-sm ${
                  child.isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
                }`}
              >
                {child.label}
              </Link>
            ))}
          </NavItem>
        </div>{" "}
        <div className="mb-4">
          {!isCollapsed && (
            <h3 className="text-xs uppercase font-medium text-gray-400 tracking-wider px-4 mb-2">Content</h3>
          )}
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive(item.href)}
              />
            ))}
          </div>
        </div>
        <div className="mt-auto pt-6 border-t border-gray-200">
          <Link
            href="/admin/settings"
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} ${
              isCollapsed ? "px-2" : "px-4"
            } py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-500 active:bg-gray-100 rounded-lg transition-all duration-300`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <span className="flex-shrink-0 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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
            {!isCollapsed && <span>Settings</span>}
          </Link>
          <Link
            href="/logout"
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} ${
              isCollapsed ? "px-2" : "px-4"
            } py-3 text-red-500 hover:bg-red-50 hover:text-red-700 active:bg-red-100 rounded-lg transition-all duration-300 mt-2`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <span className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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
            {!isCollapsed && <span>Logout</span>}
          </Link>
        </div>
      </aside>
    </SidebarContext.Provider>
  );
};

export default AdminSidebar;
