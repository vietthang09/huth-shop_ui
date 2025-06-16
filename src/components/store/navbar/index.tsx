"use client";

import Link from "next/link";
import { Search, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const StoreNavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock suggestion data
  const mockSuggestions = [
    "Tài khoản game online",
    "Tài khoản Liên Minh Huyền Thoại",
    "Tài khoản PUBG Mobile",
    "Tài khoản Free Fire",
    "Tài khoản Valorant",
    "Tài khoản Steam",
    "Tài khoản Epic Games",
    "Tài khoản Riot Games",
  ];

  const filteredSuggestions = mockSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (search: string) => {
    if (!search.trim()) return;

    const updatedRecent = [search, ...recentSearches.filter((item) => item !== search)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
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
    saveRecentSearch(suggestion);
    setIsFocused(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      saveRecentSearch(searchValue);
      setIsFocused(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full px-4 2xl:px-0 py-4 transition-colors duration-300 ${
        isScrolled ? "bg-white shadow" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto w-full relative flex justify-between items-center">
        <Link
          href="/"
          className={`mr-0 xl:mr-20 lg:mr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded font-bold text-2xl transition-colors duration-300 ${
            isScrolled ? "text-gray-900" : "text-white"
          }`}
          aria-label="Go to homepage"
        >
          Bitex
        </Link>
        <div className="relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="h-full flex bg-white pl-6 px-1 py-1 border border-gray-200 rounded-full">
              <input
                placeholder="Tìm trong VT Plus"
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

          {/* Floating suggestions dropdown */}
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
                  {mockSuggestions.slice(0, 5).map((suggestion, index) => (
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
        <div className="space-x-2">
          <Link
            href="/login"
            className={`border px-4 py-2 rounded-full transition-colors duration-300 text-sm ${
              isScrolled
                ? "border-orange-600 text-orange-600 hover:bg-orange-50"
                : "border-white text-white hover:bg-white hover:text-gray-900"
            }`}
          >
            Trở thành đối tác
          </Link>
          <Link
            href="/login"
            className={`px-4 py-2 rounded-full transition-colors duration-300 text-sm ${
              isScrolled ? "bg-orange-600 text-white hover:bg-orange-500" : "bg-white text-orange-600"
            }`}
          >
            Đăng nhập/Đăng ký
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default StoreNavBar;
