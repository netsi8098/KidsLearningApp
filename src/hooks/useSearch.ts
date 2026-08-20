import { useState, useCallback, useRef } from 'react';
import { contentRegistry, searchContent } from '../registry/contentRegistry';
import type { ContentItem } from '../registry/types';
import { config } from '../config';
import { semanticSearch } from '../services/semanticService';

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
  const requestIdRef = useRef(0);

  const applyFilters = useCallback((items: ContentItem[], filters?: SearchFilters) => {
    let filtered = items;
    if (filters?.type) {
      filtered = filtered.filter((item) => item.type === filters.type);
    }
    if (filters?.ageGroup) {
      filtered = filtered.filter(
        (item) => !item.ageGroup || item.ageGroup === filters.ageGroup
      );
    }
    return filtered;
  }, []);

  const toSearchResult = useCallback((item: ContentItem): SearchResult => ({
    type: item.type,
    id: item.sourceId,
    title: item.title,
    emoji: item.emoji,
    route: item.route,
    category: item.category ?? item.type,
  }), []);

  const search = useCallback((query: string, filters?: SearchFilters) => {
    const requestId = ++requestIdRef.current;
    setIsSearching(true);

    const q = query.toLowerCase().trim();
    if (!q) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const keywordItems = applyFilters(searchContent(q), filters);
    const matched = keywordItems.map(toSearchResult);

    setResults(matched);

    if (!config.semanticSearchEnabled || q.length < 3) {
      setIsSearching(false);
      return;
    }

    const candidates = applyFilters(contentRegistry, filters);
    void semanticSearch(
      q,
      candidates.map((item) => ({
        id: item.id,
        text: [item.title, item.type, item.category, item.ageGroup]
          .filter(Boolean)
          .join(' '),
      })),
      24,
    ).then((semanticMatches) => {
      if (requestId !== requestIdRef.current) return;
      if (semanticMatches) {
        const byId = new Map(candidates.map((item) => [item.id, item]));
        const seen = new Set(keywordItems.map((item) => item.id));
        const semanticItems = semanticMatches
          .filter((match) => match.score >= 0.2 && !seen.has(match.id))
          .map((match) => byId.get(match.id))
          .filter((item): item is ContentItem => Boolean(item));
        setResults([...matched, ...semanticItems.map(toSearchResult)]);
      }
      setIsSearching(false);
    });
  }, [applyFilters, toSearchResult]);

  return { results, search, isSearching };
}
