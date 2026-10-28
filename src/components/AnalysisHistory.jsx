import { useState } from 'react';
import { deleteRecord, clearHistory } from '../utils/storage';
import './AnalysisHistory.css';

export default function AnalysisHistory({ history, onHistoryChange }) {
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Derived filtered list
  const filtered = history.filter((r) => {
    const matchRisk = filterRisk === 'all' || r.riskColor === filterRisk;
    const matchSearch = !search.trim() ||
      (r.text || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.risk || '').toLowerCase().includes(search.toLowerCase());
    return matchRisk && matchSearch;
  });

  function handleDelete(id) {
    setDeletingId(id);
    const updated = deleteRecord(id);
    onHistoryChange(updated);
    setDeletingId(null);
    if (expandedId === id) setExpandedId(null);
  }

  function handleClearAll() {
    const updated = clearHistory();
    onHistoryChange(updated);
    setConfirmClear(false);
    setExpandedId(null);
  }

  // Summary from raw history
  const total  = history.length;
  const high   = history.filter((r) => r.riskColor === 'danger').length;
  const medium = history.filter((r) => r.riskColor === 'warning').length;
  const low    = history.filter((r) => r.riskColor === 'success').length;

  return (
    <div className="history-page page-content">
      <div className="page-header">
        <div className="history-page-title-row">
          <div>
            <h1 className="page-title">Scan History</h1>
            <p className="page-subtitle">
              All scans are saved locally in your browser's localStorage. No data leaves your device.
            </p>
          </div>
          {history.length > 0 && !confirmClear && (
            <button className="clear-all-btn" onClick={() => setConfirmClear(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
              Clear All
            </button>
          )}
          {confirmClear && (
            <div className="confirm-clear">
              <p>Delete all {history.length} records?</p>
              <button className="btn-danger-sm" onClick={handleClearAll}>Yes, delete all</button>
              <button className="btn-ghost-sm" onClick={() => setConfirmClear(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="history-summary">
        {[
          { label: 'Total', value: total, color: '' },
          { label: 'High Risk', value: high, color: 'danger' },
          { label: 'Medium Risk', value: medium, color: 'warning' },
          { label: 'Low Risk', value: low, color: 'success' },
        ].map((s) => (
          <button
            key={s.label}
            className={`summary-card ${s.color} ${filterRisk === (s.color || 'all') ? 'active' : ''}`}
            onClick={() => setFilterRisk(filterRisk === (s.color || 'all') ? 'all' : (s.color || 'all'))}
            aria-pressed={filterRisk === (s.color || 'all')}
          >
            <p className="summary-num">{s.value}</p>
            <p className="summary-lbl">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search & filter bar */}
      {history.length > 0 && (
        <div className="history-controls">
          <div className="history-search-wrap">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              className="history-search"
              placeholder="Search by message text, category, or risk…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search history"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">×</button>
            )}
          </div>
          <div className="filter-pills">
            {['all','danger','warning','success'].map((f) => (
              <button
                key={f}
                className={`filter-pill ${filterRisk === f ? 'active' : ''} ${f}`}
                onClick={() => setFilterRisk(f)}
                aria-pressed={filterRisk === f}
              >
                {f === 'all' ? 'All' : f === 'danger' ? 'High' : f === 'warning' ? 'Medium' : 'Low'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 ? (
        <div className="history-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <p>No scan history yet.</p>
          <span>Scan a message to start building your history.</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="history-empty">
          <p>No records match your search or filter.</p>
          <button className="btn-ghost-sm" onClick={() => { setSearch(''); setFilterRisk('all'); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((r) => {
            const isExpanded = expandedId === r.id;
            const preview = (r.text || '').slice(0, 120);
            const ts = r.analysedAt || r.timestamp;
            return (
              <div key={r.id} className={`history-item ${r.riskColor} ${isExpanded ? 'expanded' : ''}`}>
                {/* Summary row */}
                <div className="history-item-header">
                  <div className="history-item-meta">
                    <span className={`risk-chip ${r.riskColor}`}>{r.risk}</span>
                    <span className="history-cat">{r.category || 'General'}</span>
                    <span className="history-score">Score: {r.score}/100</span>
                  </div>
                  <div className="history-item-actions">
                    <span className="history-time">
                      {ts ? new Date(ts).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : ''}
                    </span>
                    <button
                      className="expand-btn"
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse' : 'Expand details'}
                    >
                      {isExpanded ? '▲' : '▼'}
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      aria-label="Delete this record"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="history-preview">{preview}{(r.text || '').length > 120 ? '…' : ''}</p>
                {r.warnings?.length > 0 && (
                  <div className="history-warn-count">
                    <span className={`warn-dot ${r.riskColor}`} />
                    {r.warnings.length} warning sign{r.warnings.length !== 1 ? 's' : ''}
                  </div>
                )}

                {/* Expanded details */}
                {isExpanded && (
                  <div className="history-detail">
                    <div className="detail-section">
                      <p className="detail-label">Full Message</p>
                      <p className="detail-text">{r.text || '(not available)'}</p>
                    </div>
                    {r.warnings?.length > 0 && (
                      <div className="detail-section">
                        <p className="detail-label">Detected Warning Signs</p>
                        <ul className="detail-warnings">
                          {r.warnings.map((w) => (
                            <li key={w.id} className="detail-warning">
                              <span className={`sev-chip sev-${w.severity}`}>{w.severity}</span>
                              <span>{w.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.recommendations?.length > 0 && (
                      <div className="detail-section">
                        <p className="detail-label">Recommendations</p>
                        <ol className="detail-recs">
                          {r.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="history-count-note">
          Showing {filtered.length} of {history.length} record{history.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
