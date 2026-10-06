import { describe, expect, it } from 'vitest';
import { advise, type TabSnapshot } from './tab-advisor';

const NOW = Date.UTC(2026, 9, 6, 12, 0, 0);
const DAY = 24 * 60 * 60_000;
const STALE_AFTER = 7 * DAY;

function tab(overrides: Partial<TabSnapshot> & { id: number }): TabSnapshot {
  return {
    url: `https://example.com/${overrides.id}`,
    title: `Tab ${overrides.id}`,
    lastAccessed: NOW,
    pinned: false,
    audible: false,
    ...overrides,
  };
}

const run = (tabs: TabSnapshot[]) => advise({ tabs, now: NOW, staleAfterMs: STALE_AFTER });

describe('advise: stale tabs', () => {
  it('suggests closing a tab not accessed within the threshold, with a reason', () => {
    const suggestions = run([tab({ id: 1, lastAccessed: NOW - 10 * DAY })]);
    expect(suggestions).toEqual([
      { kind: 'close', tabId: 1, reason: 'Last opened 10 days ago' },
    ]);
  });
});

describe('advise: tabs that are safe', () => {
  it('does not suggest a recently used tab', () => {
    expect(run([tab({ id: 1, lastAccessed: NOW - 2 * DAY })])).toEqual([]);
  });

  it('does not suggest a tab with no lastAccessed time', () => {
    expect(run([tab({ id: 1, lastAccessed: undefined })])).toEqual([]);
  });

  it('never suggests a stale pinned tab', () => {
    expect(run([tab({ id: 1, lastAccessed: NOW - 30 * DAY, pinned: true })])).toEqual([]);
  });

  it('never suggests a stale tab that is playing audio', () => {
    expect(run([tab({ id: 1, lastAccessed: NOW - 30 * DAY, audible: true })])).toEqual([]);
  });
});

describe('advise: duplicate tabs', () => {
  const url = 'https://example.com/same';

  it('keeps the most recently used copy and suggests closing the others', () => {
    const suggestions = run([
      tab({ id: 1, url, lastAccessed: NOW - 3 * DAY }),
      tab({ id: 2, url, lastAccessed: NOW - 1 * DAY }),
      tab({ id: 3, url, lastAccessed: NOW - 2 * DAY }),
    ]);
    expect(suggestions.map((s) => s.tabId).sort()).toEqual([1, 3]);
    expect(suggestions.every((s) => s.reason === 'Duplicate of "Tab 2"')).toBe(true);
  });

  it('keeps a pinned copy even when an unpinned copy is newer', () => {
    const suggestions = run([
      tab({ id: 1, url, lastAccessed: NOW - 5 * DAY, pinned: true }),
      tab({ id: 2, url, lastAccessed: NOW - 1 * DAY }),
    ]);
    expect(suggestions).toEqual([
      { kind: 'close', tabId: 2, reason: 'Duplicate of "Tab 1"' },
    ]);
  });

  it('never suggests closing a pinned duplicate', () => {
    const suggestions = run([
      tab({ id: 1, url, pinned: true }),
      tab({ id: 2, url, pinned: true }),
    ]);
    expect(suggestions).toEqual([]);
  });

  it('suggests a tab once when it is both stale and a duplicate', () => {
    const suggestions = run([
      tab({ id: 1, url, lastAccessed: NOW }),
      tab({ id: 2, url, lastAccessed: NOW - 30 * DAY }),
    ]);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]).toMatchObject({ tabId: 2, reason: 'Duplicate of "Tab 1"' });
  });
});
