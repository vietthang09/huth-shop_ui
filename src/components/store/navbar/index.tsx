"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/shared/utils/styling";

import NavBarCategory from "./navCategory";
import NavBarProfile from "./navProfile";
import NavBarShopping from "./navShopping";

interface NavbarItem {
  name: string;
  link: string;
  ariaLabel?: string;
}

const NAVBAR_ITEMS: NavbarItem[] = [
  { name: "Netflix", link: "/danh-muc/netflix", ariaLabel: "Browse Netflix accounts" },
  { name: "Adobe", link: "/danh-muc/adobe", ariaLabel: "Browse Adobe accounts" },
  { name: "Google", link: "/danh-muc/google", ariaLabel: "Browse Google accounts" },
  { name: "Microsoft", link: "/danh-muc/microsoft", ariaLabel: "Browse Microsoft accounts" },
  { name: "Spotify", link: "/danh-muc/spotify", ariaLabel: "Browse Spotify accounts" },
  { name: "Canva", link: "/danh-muc/canva", ariaLabel: "Browse Canva accounts" },
  { name: "AI", link: "/danh-muc/ai", ariaLabel: "Browse AI tool accounts" },
  { name: "Blog", link: "/blog", ariaLabel: "Read our blog" },
];

// Custom hook for scroll behavior
const useScrollHide = (threshold: number = 100) => {
  const [isHidden, setIsHidden] = useState(false);
  const prevScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const shouldHide = prevScrollY.current < currentScrollY && currentScrollY > threshold;

    setIsHidden(shouldHide);
    prevScrollY.current = currentScrollY;
  }, [threshold]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return isHidden;
};

const StoreNavBar = () => {
  const hideNavbar = useScrollHide(100);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        // Navigate to the list page with search parameter
        const encodedQuery = encodeURIComponent(searchQuery.trim());
        router.push(`/danh-muc?tim-kiem=${encodedQuery}`);
        // Clear the search input after submission
        setSearchQuery("");
      }
    },
    [searchQuery, router]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("navbar-search");
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <nav
      className={cn(
        "flex flex-col bg-white shadow-sm transition-transform duration-300 ease-in-out",
        "pt-5 fixed w-full z-50 top-0",
        hideNavbar && "-translate-y-full"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Top section with logo, search, and actions */}
      <section className="w-full">
        <div className="storeContainer w-full relative flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="mr-0 xl:mr-20 lg:mr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Go to homepage"
          >
            <Image alt="Bitex Logo" src="/images/logo.png" width={125} height={40} quality={100} priority />
          </Link>{" "}
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="h-11 relative flex-1 mx-6 sm:mx-10" role="search">
            <label htmlFor="navbar-search" className="sr-only">
              Tìm sản phẩm
            </label>
            <input
              id="navbar-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "text-gray-800 hidden sm:block pl-4 pr-4 sm:pl-12 sm:pr-16",
                "size-full border-gray-300 focus:border-blue-500 border rounded-lg",
                "outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
              )}
              placeholder="Search for products..."
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute top-3.5 left-5 hidden sm:block p-0.5 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="Submit search"
            >
              <Image src="/icons/searchIcon.svg" width={16} height={16} alt="" role="presentation" />
            </button>

            {/* Keyboard shortcut hint */}
            <div className="absolute top-3 right-3 hidden sm:block text-xs text-gray-400 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded">
                ⌘K
              </kbd>
            </div>

            {/* Mobile search button */}
            <button
              type="button"
              onClick={() => {
                // For mobile, show search input or navigate directly if search has text
                if (searchQuery.trim()) {
                  handleSearchSubmit(new Event("submit") as any);
                } else {
                  // You could implement a mobile search modal here
                  router.push("/list");
                }
              }}
              className="sm:hidden p-2 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="Search products"
            >
              <Image src="/icons/searchIcon.svg" width={20} height={20} alt="" role="presentation" />
            </button>
          </form>
          {/* Action buttons */}
          <div className="text-gray-500 flex items-center gap-2 pr-2 md:pr-0">
            <NavBarProfile />
            <NavBarShopping />
          </div>
        </div>
      </section>

      {/* Bottom section with categories and navigation */}
      <section className="w-full border-b border-t border-gray-300 mt-5">
        <div className="storeContainer h-[50px] flex justify-between items-center">
          <div className="flex items-center h-full">
            <NavBarCategory isNavbarVisible={!hideNavbar} />

            <div className="h-4 border-l border-gray-300 mx-4 hidden sm:block" aria-hidden="true" />

            <nav role="navigation" aria-label="Product categories">
              <ul className="hidden lg:flex items-center space-x-1">
                {NAVBAR_ITEMS.map(({ name, link, ariaLabel }) => (
                  <li key={name}>
                    <Link
                      href={link}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm text-gray-700",
                        "transition-colors duration-200",
                        "hover:bg-gray-100 hover:text-gray-900",
                        "focus:outline-none focus:ring-2 focus:ring-blue-200",
                        "active:bg-gray-200"
                      )}
                      aria-label={ariaLabel || `Browse ${name} accounts`}
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>
    </nav>
  );
};

export default StoreNavBar;
