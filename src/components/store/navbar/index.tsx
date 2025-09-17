"use client";

import Link from "next/link";
import { Search, Clock, Menu, X, ShoppingBag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { mockProducts } from "@/components/store/home/data";
import { useCartStore } from "@/store/cartStore";

const StoreNavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isHomePage, setIsHomePage] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems);

  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Generate suggestions from product data
  const generateSuggestions = () => {
    const suggestions = new Set<string>();

    // Add product titles
    mockProducts.forEach((product) => {
      suggestions.add(product.title);
    });

    // Add specific keywords and common search terms
    const commonSearchTerms = [
      "Netflix",
      "Spotify",
      "ChatGPT",
      "YouTube Premium",
      "Apple Music",
      "streaming",
      "music",
      "AI",
      "productivity",
      "premium",
      "account",
      "entertainment",
      "design",
      "productivity tools",
    ];

    commonSearchTerms.forEach((term) => suggestions.add(term));

    // Add keywords from products
    mockProducts.forEach((product) => {
      if (product.keywords) {
        product.keywords.split(",").forEach((keyword) => {
          const cleanKeyword = keyword.trim();
          if (cleanKeyword && cleanKeyword.length > 2) {
            suggestions.add(cleanKeyword);
          }
        });
      }
    });

    // Add category names
    mockProducts.forEach((product) => {
      if (product.category?.name) {
        suggestions.add(product.category.name);
      }
    });

    return Array.from(suggestions)
      .filter((suggestion) => suggestion.length > 2) // Filter out very short suggestions
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 25); // Limit to 25 suggestions
  };

  const allSuggestions = generateSuggestions();

  const filteredSuggestions = allSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Track if we are on the home page
  useEffect(() => {
    setIsHomePage(pathname === "/");
  }, [pathname]);

  // Save recent searches to localStorage
  const saveRecentSearch = (search: string) => {
    if (!search.trim()) return;

    const updatedRecent = [search, ...recentSearches.filter((item) => item !== search)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));
  };

  // Convert search term to URL-friendly slug
  const createSearchSlug = (searchTerm: string) => {
    return searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .replace(/^-|-$/g, "");
  };

  // Handle search navigation
  const performSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    saveRecentSearch(searchTerm);
    setIsFocused(false);
    setIsSearchExpanded(false);
    setSearchValue("");

    const slug = createSearchSlug(searchTerm);
    router.push(`/danh-muc/${slug}?q=${encodeURIComponent(searchTerm)}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setIsSearchExpanded(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchValue(suggestion);
    performSearch(suggestion);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      performSearch(searchValue);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
    setIsFocused(true);
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full px-4 2xl:px-0 py-4 transition-colors duration-300 ${
        isScrolled || !isHomePage ? "bg-white shadow" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto w-full relative flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className={`mr-0 xl:mr-20 lg:mr-10 rounded font-semibold text-xl transition-colors duration-300 ${
            isScrolled || !isHomePage ? "text-gray-900" : "text-white"
          }`}
          aria-label="Go to homepage"
        >
          HuthShop
        </Link>

        {/* Desktop Search Bar */}
        <div className={`relative hidden md:block ${isSearchExpanded ? "flex-1" : ""}`} ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="h-full flex bg-white pl-6 px-1 py-1 border border-gray-200 rounded-full">
              <input
                placeholder="Tìm trong HuthShop..."
                autoComplete="off"
                className="min-w-96 text-sm outline-none"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
              />
              <button type="submit" className="bg-red-500 p-2 rounded-full" aria-label="Submit search">
                <Search className="text-white w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Desktop Suggestions Dropdown */}
          {isFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
              {searchValue.trim() === "" ? (
                // Show recent searches when input is empty
                <>
                  {recentSearches.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                        Tìm kiếm gần đây
                      </div>
                      {recentSearches.map((search, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSuggestionClick(search)}
                        >
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-3" />
                            <span>{search}</span>
                          </div>
                        </div>
                      ))}
                      {/* Divider between sections */}
                      <div className="border-t-2 border-gray-200 my-2"></div>
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                        Gợi ý tìm kiếm
                      </div>
                    </>
                  )}
                  {allSuggestions.slice(0, 5).map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center">
                        <Search className="w-4 h-4 text-gray-400 mr-3" />
                        <span>{suggestion}</span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                // Show filtered suggestions when typing
                <>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center">
                          <Search className="w-4 h-4 text-gray-400 mr-3" />
                          <span>{suggestion}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">Không tìm thấy kết quả phù hợp</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Search Icon */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={handleSearchClick}
            className={`p-2 rounded-full transition-colors duration-300 ${
              isScrolled || !isHomePage
                ? "text-gray-900 hover:bg-gray-100"
                : "text-white hover:bg-white hover:bg-opacity-20"
            }`}
            aria-label="Open search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={toggleMobileMenu}
            className={`p-2 rounded-full transition-colors duration-300 ${
              isScrolled || !isHomePage
                ? "text-gray-900 hover:bg-gray-100"
                : "text-white hover:bg-white hover:bg-opacity-20"
            }`}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/gio-hang" className="relative">
            <ShoppingBag className={`size-5 ${isScrolled || !isHomePage ? "text-orange-600" : "text-white"}`} />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full px-1 text-xs">
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <Link href="/gio-hang" className="relative">
            <ShoppingBag className={`size-5 ${isScrolled || !isHomePage ? "text-orange-600" : "text-white"}`} />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full px-1 text-xs">
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar (Full Width Overlay) */}
      {isSearchExpanded && (
        <div className="md:hidden fixed inset-0 bg-white z-50 pt-4">
          <div className="px-4">
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => {
                  setIsSearchExpanded(false);
                  setIsFocused(false);
                }}
                className="p-2 text-gray-900 hover:bg-gray-100 rounded-full"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex-1" ref={searchRef}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="h-full flex bg-white pl-4 px-1 py-2 border border-gray-300 rounded-full">
                    <input
                      placeholder="Tìm trong HuthShop..."
                      autoComplete="off"
                      className="w-full text-sm outline-none"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      autoFocus
                    />
                    <button type="submit" className="bg-red-500 p-2 rounded-full" aria-label="Submit search">
                      <Search className="text-white w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Mobile Suggestions */}
            {isFocused && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {searchValue.trim() === "" ? (
                  <>
                    {recentSearches.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                          Tìm kiếm gần đây
                        </div>
                        {recentSearches.map((search, index) => (
                          <div
                            key={index}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => handleSuggestionClick(search)}
                          >
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-3" />
                              <span>{search}</span>
                            </div>
                          </div>
                        ))}
                        <div className="border-t-2 border-gray-200 my-2"></div>
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                          Gợi ý tìm kiếm
                        </div>
                      </>
                    )}
                    {allSuggestions.slice(0, 8).map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-center">
                          <Search className="w-4 h-4 text-gray-400 mr-3" />
                          <span>{suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex items-center">
                            <Search className="w-4 h-4 text-gray-400 mr-3" />
                            <span>{suggestion}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">Không tìm thấy kết quả phù hợp</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-3">(Cập nhật sau)</div>
        </div>
      )}
    </nav>
  );
};

export default StoreNavBar;
