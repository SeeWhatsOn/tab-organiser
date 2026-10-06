import { formatTabAge } from './tab-age';

const DAY_MS = 24 * 60 * 60_000;

export const DEFAULT_STALE_AFTER_MS = 7 * DAY_MS;

export interface TabSnapshot {
  id: number;
  url: string;
  title: string;
  lastAccessed?: number;
  pinned: boolean;
  audible: boolean;
}

export interface Suggestion {
  kind: 'close';
  tabId: number;
  title: string;
  reason: string;
}

export interface AdviseInput {
  tabs: TabSnapshot[];
  now: number;
  staleAfterMs: number;
}

function isProtected(tab: TabSnapshot): boolean {
  return tab.pinned || tab.audible;
}

/** Protected tabs win, then the most recently used, then the lowest id. `copies` must be non-empty. */
function pickKeeper(copies: TabSnapshot[]): TabSnapshot {
  return [...copies].sort(
    (a, b) =>
      Number(isProtected(b)) - Number(isProtected(a)) ||
      (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0) ||
      a.id - b.id,
  )[0]!;
}

function findDuplicates(tabs: TabSnapshot[]) {
  const byUrl = new Map<string, TabSnapshot[]>();
  for (const tab of tabs) {
    byUrl.set(tab.url, [...(byUrl.get(tab.url) ?? []), tab]);
  }

  const extraReasons = new Map<number, string>();
  const keeperIds = new Set<number>();
  for (const copies of byUrl.values()) {
    if (copies.length < 2) continue;
    const keeper = pickKeeper(copies);
    keeperIds.add(keeper.id);
    for (const copy of copies) {
      if (copy !== keeper) extraReasons.set(copy.id, `Duplicate of "${keeper.title}"`);
    }
  }
  return { extraReasons, keeperIds };
}

export function advise({ tabs, now, staleAfterMs }: AdviseInput): Suggestion[] {
  const { extraReasons, keeperIds } = findDuplicates(tabs);
  const suggestions: Suggestion[] = [];

  for (const tab of tabs) {
    if (isProtected(tab)) continue;

    const duplicateReason = extraReasons.get(tab.id);
    const isStale = tab.lastAccessed !== undefined && now - tab.lastAccessed >= staleAfterMs;

    if (duplicateReason) {
      suggestions.push({ kind: 'close', tabId: tab.id, title: tab.title, reason: duplicateReason });
    } else if (isStale && !keeperIds.has(tab.id)) {
      suggestions.push({
        kind: 'close',
        tabId: tab.id,
        title: tab.title,
        reason: `Last opened ${formatTabAge(tab.lastAccessed, now)}`,
      });
    }
  }
  return suggestions;
}
