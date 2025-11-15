"use client";

import { Search, Clock, Menu, X, ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { AuthButton } from "@/components/auth/AuthButton";
import { mockProducts } from "@/components/store/home/data";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";

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
    suggestion.toLowerCase().includes(searchValue.toLowerCase()),
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
    <nav className={`sticky bg-[#00021e] top-0 z-50 ${isScrolled && "shadow-sm"}`}>
      <div className="bg-[#b9252e] text-center text-white text-sm py-1">
        <Link href="/">📺 Tài khoản Netflix Premium đang giảm 10% 💰</Link>
      </div>
      <div className="max-w-screen-2xl mx-auto w-full relative flex justify-between items-center gap-8 lg:px-4 py-4">
        <Link
          href="/"
          className="rounded font-semibold text-xl transition-colors duration-300"
          aria-label="Go to homepage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="119" height="40" viewBox="0 0 119 40">
            <g fill="none" fill-rule="evenodd">
              <path
                fill="#E30016"
                d="M40.14.106h21.684L40.122 21.808 40.14.106ZM62.93 11.334v7.607h8.72V.106h7.328v21.44h-26.26l10.212-10.212Zm16.048 10.33v17.28H63.687l15.292-17.28Zm-38.84 17.28h22.792v-8.678H40.14v8.679Z"
              ></path>
              <path
                fill="#FFF"
                d="M100.397 15.355a.404.404 0 0 1-.126.308.428.428 0 0 1-.313.127.4.4 0 0 1-.304-.127.414.414 0 0 1-.123-.308c0-.123.042-.224.123-.309.08-.08.18-.122.304-.122.122 0 .228.042.313.122a.418.418 0 0 1 .126.309Zm2.623.384c-.321 0-.62-.063-.895-.181a2.36 2.36 0 0 1-.71-.494 2.204 2.204 0 0 1-.469-.748 2.493 2.493 0 0 1-.168-.933c0-.339.054-.651.168-.929a2.023 2.023 0 0 1 1.179-1.17c.274-.11.574-.165.895-.165h2.5v.806h-2.5c-.208 0-.401.038-.574.115-.179.071-.33.177-.457.308-.127.13-.223.288-.3.47a1.64 1.64 0 0 0-.105.603c0 .215.034.418.105.604.077.186.173.346.3.477.127.135.278.24.457.316.173.076.366.115.574.115h2.5v.806h-2.5Zm5.261 0c-.32 0-.616-.063-.89-.181a2.24 2.24 0 0 1-.71-.494 2.268 2.268 0 0 1-.473-.748 2.582 2.582 0 0 1-.169-.933c0-.339.059-.651.169-.929a2.08 2.08 0 0 1 .473-.715 2 2 0 0 1 .71-.455c.274-.11.57-.165.89-.165h1.128c.334 0 .638.055.917.169.274.11.514.262.713.46.198.199.355.44.464.714.11.279.165.587.165.92 0 .335-.055.647-.168.934-.115.287-.27.536-.47.748-.203.206-.438.37-.713.494a2.3 2.3 0 0 1-.908.181h-1.128Zm1.128-.806c.21 0 .405-.039.583-.115a1.397 1.397 0 0 0 .76-.793c.072-.186.11-.39.11-.604 0-.216-.038-.419-.11-.6a1.395 1.395 0 0 0-.3-.473 1.452 1.452 0 0 0-1.043-.423h-1.128a1.425 1.425 0 0 0-1.026.423c-.126.13-.228.288-.3.47-.072.18-.11.383-.11.603 0 .215.038.418.11.604a1.423 1.423 0 0 0 .752.793c.178.076.368.115.574.115h1.128Zm8.403.806-.882-3.247-1.305 3.006a.687.687 0 0 1-.169.224.398.398 0 0 1-.245.08c-.19 0-.33-.1-.414-.304l-1.3-3.006-.883 3.247h-.794l1.187-4.345c.055-.22.19-.33.4-.33a.428.428 0 0 1 .406.274l1.424 3.265 1.423-3.265c.075-.186.202-.274.388-.274.194 0 .32.11.385.33l1.182 4.345h-.803Z"
              ></path>
              <path
                fill="#FFF"
                d="M110.013 26.178v4.307H92.86c-.997 0-1.811-.815-1.811-1.81v-18.19c0-1 .814-1.815 1.81-1.815h25.757V.106H91.791c-5.118 0-9.308 4.193-9.308 9.311v20.326c0 5.118 4.19 9.307 9.308 9.307h26.824V17.576H99.531l5.968 8.602h4.514ZM.503 0h9.24v16.398L24.287 0h12.351l-2.25 2.538-15.026 16.934 17.276 19.473H24.287L13.188 26.43l-3.445 3.886v8.628H.503z"
              ></path>
            </g>
          </svg>
        </Link>
        <div className="flex w-full justify-between items-center">
          <ul className="flex items-center text-nowrap gap-4">
            <li>
              <Link href="#">
                <div className="bg-[#171a3c] hover:bg-[#353968] text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Image
                    width={16}
                    height={16}
                    alt="help"
                    src="https://k4g.com/images/heroes/k4g-paw.svg"
                    className="size-4"
                  />
                  <span>Hỗ trợ 24/7</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="#">
                <div className="bg-[#171a3c] hover:bg-[#353968] text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Image
                    width={16}
                    height={16}
                    alt="help"
                    src="https://k4g.com/images/icons/dollars-bag.svg"
                    className="size-4"
                  />
                  <span>Hợp tác</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="#">
                <div className="bg-[#171a3c] hover:bg-[#353968] text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Image
                    width={16}
                    height={16}
                    alt="help"
                    src="https://k4g.com/images/icons/gift_icon.svg"
                    className="size-4"
                  />
                  <span>Nhận tài khoản miễn phí</span>
                </div>
              </Link>
            </li>
          </ul>
          <div className={`relative hidden md:block ${isSearchExpanded ? "flex-1" : ""}`} ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="h-full flex items-center gap-4 text-white  bg-[#171a3c] pl-6 px-1 py-4 border border-[#383b60] rounded-lg">
                <Search className="text-white w-4 h-4" />
                <input
                  placeholder="Tìm trong HuthShop..."
                  autoComplete="off"
                  className="min-w-96 text-sm outline-none"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                />
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
          <Link href="/gio-hang" className="p-4 rounded-full  text-white hover:bg-[#171a3c]">
            <ShoppingCart className="size-5" />
            {cartItems.length > 0 && (
              <div className="flex items-center justify-center size-4 border rounded-full text-center align-middle text-xs">
                {cartItems.length}
              </div>
            )}
          </Link>
          <AuthButton />
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
                      <button
                        type="submit"
                        className="bg-red-500 p-2 rounded-full cursor-pointer"
                        aria-label="Submit search"
                      >
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
      </div>
    </nav>
  );
};

export default StoreNavBar;
