import { getSemanticUrls } from '../config';

export interface SemanticItem {
  id: string;
  text: string;
}

export interface SemanticMatch {
  id: string;
  score: number;
}

const SEMANTIC_URLS = getSemanticUrls();
let semanticBase = SEMANTIC_URLS[0] || 'http://localhost:5555';
let available: boolean | null = null;
let lastCheck = 0;

async function checkSemanticService(): Promise<boolean> {
  if (available !== null && Date.now() - lastCheck < 60_000) return available;

  for (const url of SEMANTIC_URLS) {
    try {
      const response = await fetch(`${url}/health`, {
        signal: AbortSignal.timeout(1_200),
      });
      if (response.ok) {
        semanticBase = url;
        available = true;
        lastCheck = Date.now();
        return true;
      }
    } catch {
      // Try the next configured local service URL.
    }
  }

  available = false;
  lastCheck = Date.now();
  return false;
}

export async function semanticSearch(
  query: string,
  items: SemanticItem[],
  limit = 20,
): Promise<SemanticMatch[] | null> {
  if (!query.trim() || items.length === 0 || !(await checkSemanticService())) return null;

  try {
    const response = await fetch(`${semanticBase}/semantic/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, items, limit }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return null;
    const payload = await response.json() as { matches?: SemanticMatch[] };
    return Array.isArray(payload.matches) ? payload.matches : null;
  } catch {
    available = false;
    lastCheck = Date.now();
    return null;
  }
}

export function resetSemanticServiceStatus(): void {
  available = null;
  lastCheck = 0;
}
