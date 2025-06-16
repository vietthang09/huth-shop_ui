import { useState, useEffect, useCallback } from "react";
import { getSearchSuggestions } from "@/actions/product/product";

interface SearchSuggestion {
  text: string;
  type: "product" | "category";
  category?: string;
  slug?: string;
}

interface UseSuggestionsReturn {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  error: string | null;
}

export const useSearchSuggestions = (query: string, debounceMs: number = 300): UseSuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Fetch suggestions using server action
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getSearchSuggestions(searchQuery);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch suggestions");
      }

      setSuggestions(result.data?.suggestions || []);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  return { suggestions, isLoading, error };
};
