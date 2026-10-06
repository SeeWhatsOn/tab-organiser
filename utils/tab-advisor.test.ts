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
      { kind: 'close', tabId: 1, title: 'Tab 1', reason: expect.stringContaining('10 days') },
    ]);
  });
});

describe('advise: tabs that are safe', () => {
  it('suggests a tab at exactly the threshold', () => {
    expect(run([tab({ id: 1, lastAccessed: NOW - STALE_AFTER })])).toHaveLength(1);
  });

  it('does not suggest a tab one millisecond inside the threshold', () => {
    expect(run([tab({ id: 1, lastAccessed: NOW - STALE_AFTER + 1 })])).toEqual([]);
  });

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
    expect(suggestions).toEqual([
      expect.objectContaining({ tabId: 1, reason: expect.stringContaining('Duplicate of "Tab 2"') }),
      expect.objectContaining({ tabId: 3, reason: expect.stringContaining('Duplicate of "Tab 2"') }),
    ]);
  });

  it('keeps a pinned copy even when an unpinned copy is newer', () => {
    const suggestions = run([
      tab({ id: 1, url, lastAccessed: NOW - 5 * DAY, pinned: true }),
      tab({ id: 2, url, lastAccessed: NOW - 1 * DAY }),
    ]);
    expect(suggestions).toEqual([
      expect.objectContaining({ tabId: 2, reason: expect.stringContaining('Duplicate of "Tab 1"') }),
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
    expect(suggestions[0]).toMatchObject({ tabId: 2, reason: expect.stringContaining('Duplicate of "Tab 1"') });
  });

  it('keeps an audible copy even when a silent copy is newer', () => {
    const suggestions = run([
      tab({ id: 1, url, lastAccessed: NOW - 5 * DAY, audible: true }),
      tab({ id: 2, url, lastAccessed: NOW - 1 * DAY }),
    ]);
    expect(suggestions.map((s) => s.tabId)).toEqual([2]);
  });

  it('keeps the lowest id when copies were last used at the same time', () => {
    const suggestions = run([
      tab({ id: 7, url, lastAccessed: NOW - DAY }),
      tab({ id: 4, url, lastAccessed: NOW - DAY }),
    ]);
    expect(suggestions.map((s) => s.tabId)).toEqual([7]);
  });

  it('keeps the lowest id when no copy has a lastAccessed time', () => {
    const suggestions = run([
      tab({ id: 9, url, lastAccessed: undefined }),
      tab({ id: 3, url, lastAccessed: undefined }),
    ]);
    expect(suggestions.map((s) => s.tabId)).toEqual([9]);
  });

  it('keeps one copy even when every copy is stale', () => {
    const suggestions = run([
      tab({ id: 1, url, lastAccessed: NOW - 30 * DAY }),
      tab({ id: 2, url, lastAccessed: NOW - 20 * DAY }),
      tab({ id: 3, url, lastAccessed: NOW - 40 * DAY }),
    ]);
    expect(suggestions.map((s) => s.tabId)).toEqual([1, 3]);
  });
});
