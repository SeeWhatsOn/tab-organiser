import { useEffect, useMemo, useState } from 'react';
import { advise, DEFAULT_STALE_AFTER_MS, type TabSnapshot } from '@/utils/tab-advisor';
import { formatTabAge } from '@/utils/tab-age';
import './App.css';

function toSnapshot(tab: Browser.tabs.Tab): TabSnapshot | undefined {
  if (tab.id === undefined || !tab.url) return undefined;
  return {
    id: tab.id,
    url: tab.url,
    title: tab.title || '(untitled)',
    lastAccessed: tab.lastAccessed,
    pinned: tab.pinned,
    audible: tab.audible ?? false,
  };
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function App() {
  const [tabs, setTabs] = useState<Browser.tabs.Tab[]>([]);
  const [error, setError] = useState<string>();
  const [now] = useState(() => Date.now());

  useEffect(() => {
    browser.tabs
      .query({})
      .then(setTabs)
      .catch((e: unknown) => setError(`Could not read tabs: ${errorMessage(e)}`));
  }, []);

  const titles = useMemo(
    () => new Map(tabs.map((tab) => [tab.id, tab.title || '(untitled)'])),
    [tabs],
  );

  const suggestions = useMemo(
    () =>
      advise({
        tabs: tabs.flatMap((tab) => toSnapshot(tab) ?? []),
        now,
        staleAfterMs: DEFAULT_STALE_AFTER_MS,
      }),
    [tabs, now],
  );

  function closeTab(tabId: number) {
    browser.tabs
      .remove(tabId)
      .then(() => setTabs((current) => current.filter((tab) => tab.id !== tabId)))
      .catch((e: unknown) => setError(`Could not close tab: ${errorMessage(e)}`));
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}

      <h2>Suggested to close ({suggestions.length})</h2>
      {suggestions.length === 0 && <p>Nothing to suggest.</p>}
      <ul className="tab-list">
        {suggestions.map((suggestion) => (
          <li key={suggestion.tabId} className="tab-row suggestion-row">
            <div className="suggestion-text">
              <div className="tab-title">{titles.get(suggestion.tabId)}</div>
              <div className="tab-age">{suggestion.reason}</div>
            </div>
            <button onClick={() => closeTab(suggestion.tabId)}>Close</button>
          </li>
        ))}
      </ul>

      <h2>All tabs ({tabs.length})</h2>
      <ul className="tab-list">
        {tabs.map((tab, index) => (
          <li key={tab.id ?? `no-id-${index}`} className="tab-row">
            <div className="tab-title">{tab.title || '(untitled)'}</div>
            <div className="tab-url">{tab.url || '(no URL)'}</div>
            <div className="tab-age">{formatTabAge(tab.lastAccessed, now)}</div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
