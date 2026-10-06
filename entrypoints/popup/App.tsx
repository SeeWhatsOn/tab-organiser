import { useEffect, useState } from 'react';
import { formatTabAge } from '@/utils/tab-age';
import './App.css';

function App() {
  const [tabs, setTabs] = useState<Browser.tabs.Tab[]>([]);
  const [error, setError] = useState<string>();
  const [now] = useState(() => Date.now());

  useEffect(() => {
    browser.tabs
      .query({})
      .then(setTabs)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <>
      <h1>Tabs ({tabs.length})</h1>
      {error && <p role="alert">Could not read tabs: {error}</p>}
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
