import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MessageScanner from './components/MessageScanner';
import UrlInspector from './components/UrlInspector';
import AnalysisHistory from './components/AnalysisHistory';
import AwarenessLab from './components/AwarenessLab';
import SafetyTips from './components/SafetyTips';
import { loadHistory, saveResult } from './utils/storage';
import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preloadText, setPreloadText] = useState('');

  // History is the single source of truth — loaded from localStorage on mount.
  const [history, setHistory] = useState(() => {
    try {
      return loadHistory();
    } catch {
      return [];
    }
  });

  const handleNavigate = useCallback((view, text) => {
    setActiveView(view);
    if (text) setPreloadText(text);
    setSidebarOpen(false);
  }, []);

  const handleResult = useCallback((result) => {
    // saveResult persists to localStorage and returns updated array
    const updated = saveResult(result);
    setHistory(updated);
  }, []);

  // Called by AnalysisHistory when a record is deleted or history is cleared
  const handleHistoryChange = useCallback((updated) => {
    setHistory(updated);
  }, []);

  return (
    <div className="app">
      {/* Mobile sidebar overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content" id="main-content" role="main">
        {/* Mobile top bar */}
        <header className="mobile-header">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="mobile-header-logo">
            <div className="logo-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="logo-text">ScamShield<em>AI</em></span>
          </div>
        </header>

        {activeView === 'dashboard' && (
          <Dashboard onNavigate={handleNavigate} history={history} />
        )}
        {activeView === 'scanner' && (
          <MessageScanner
            key={preloadText || 'scanner'}
            onResult={handleResult}
            initialText={preloadText}
          />
        )}
        {activeView === 'url' && (
          <UrlInspector />
        )}
        {activeView === 'history' && (
          <AnalysisHistory history={history} onHistoryChange={handleHistoryChange} />
        )}
        {activeView === 'lab' && (
          <AwarenessLab />
        )}
        {activeView === 'tips' && (
          <SafetyTips />
        )}
      </div>
    </div>
  );
}
