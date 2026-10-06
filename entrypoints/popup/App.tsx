import { useEffect, useState } from 'react';
import { formatTabAge } from '@/utils/tab-age';
import './App.css';

function App() {
  const [tabs, setTabs] = useState<Browser.tabs.Tab[]>([]);
  const now = Date.now();

  useEffect(() => {
    browser.tabs.query({}).then(setTabs);
  }, []);

  return (
    <>
      <h1>Tabs ({tabs.length})</h1>
      <ul className="tab-list">
        {tabs.map((tab) => (
          <li key={tab.id} className="tab-row">
            <div className="tab-title">{tab.title}</div>
            <div className="tab-url">{tab.url}</div>
            <div className="tab-age">{formatTabAge(tab.lastAccessed, now)}</div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;
