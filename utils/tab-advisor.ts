import { formatTabAge } from './tab-age';

export interface TabSnapshot {
  id: number;
  url: string;
  title: string;
  lastAccessed?: number;
  pinned: boolean;
  audible: boolean;
}

export interface CloseSuggestion {
  kind: 'close';
  tabId: number;
  reason: string;
}

export type Suggestion = CloseSuggestion;

export interface AdviseInput {
  tabs: TabSnapshot[];
  now: number;
  staleAfterMs: number;
}

function isProtected(tab: TabSnapshot): boolean {
  return tab.pinned || tab.audible;
}

function lastUsed(tab: TabSnapshot): number {
  return tab.lastAccessed ?? -Infinity;
}

/** Protected tabs win, then the most recently used, then the lowest id. `copies` must be non-empty. */
function pickKeeper(copies: TabSnapshot[]): TabSnapshot {
  return [...copies].sort(
    (a, b) =>
      Number(isProtected(b)) - Number(isProtected(a)) ||
      lastUsed(b) - lastUsed(a) ||
      a.id - b.id,
  )[0]!;
}

function findDuplicateReasons(tabs: TabSnapshot[]): Map<number, string> {
  const byUrl = new Map<string, TabSnapshot[]>();
  for (const tab of tabs) {
    byUrl.set(tab.url, [...(byUrl.get(tab.url) ?? []), tab]);
  }

  const reasons = new Map<number, string>();
  for (const copies of byUrl.values()) {
    if (copies.length < 2) continue;
    const keeper = pickKeeper(copies);
    for (const copy of copies) {
      if (copy !== keeper) reasons.set(copy.id, `Duplicate of "${keeper.title}"`);
    }
  }
  return reasons;
}

export function advise({ tabs, now, staleAfterMs }: AdviseInput): Suggestion[] {
  const duplicateReasons = findDuplicateReasons(tabs);
  const suggestions: Suggestion[] = [];

  for (const tab of tabs) {
    if (isProtected(tab)) continue;

    const duplicateReason = duplicateReasons.get(tab.id);
    if (duplicateReason) {
      suggestions.push({ kind: 'close', tabId: tab.id, reason: duplicateReason });
    } else if (tab.lastAccessed !== undefined && now - tab.lastAccessed >= staleAfterMs) {
      suggestions.push({
        kind: 'close',
        tabId: tab.id,
        reason: `Last opened ${formatTabAge(tab.lastAccessed, now)}`,
      });
    }
  }
  return suggestions;
}

export const DEFAULT_STALE_AFTER_MS = 7 * 24 * 60 * 60_000;
