import { useState, useCallback } from 'react';
import { searchContent } from '../registry/contentRegistry';

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  emoji: string;
  route: string;
  category: string;
}

interface SearchFilters {
  type?: string;
  ageGroup?: string;
}

/**
 * Unified search across ALL content via the content registry.
 * Case-insensitive keyword match on title, type, and category.
 */
export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback((query: string, filters?: SearchFilters) => {
    setIsSearching(true);

    const q = query.toLowerCase().trim();
    if (!q) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let items = searchContent(q);

    // Apply filters
    if (filters?.type) {
      items = items.filter((item) => item.type === filters.type);
    }
    if (filters?.ageGroup) {
      items = items.filter(
        (item) => !item.ageGroup || item.ageGroup === filters.ageGroup
      );
    }

    const matched: SearchResult[] = items.map((item) => ({
      type: item.type,
      id: item.sourceId,
      title: item.title,
      emoji: item.emoji,
      route: item.route,
      category: item.category ?? item.type,
    }));

    setResults(matched);
    setIsSearching(false);
  }, []);

  return { results, search, isSearching };
}
