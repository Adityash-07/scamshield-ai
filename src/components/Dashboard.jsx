import { computeStats } from '../utils/storage';
import { SAMPLE_MESSAGES } from '../data/sampleMessages';
import './Dashboard.css';

function StatCard({ icon, value, label, sub, color, pct }) {
  return (
    <div className={`stat-card ${color || ''}`}>
      <div className="stat-icon" aria-hidden="true">{icon}</div>
      <div className="stat-body">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
        <div className="stat-bar-track" aria-hidden="true">
          <div className="stat-bar-fill" style={{ width: `${pct ?? 0}%` }} />
        </div>
        {sub && <p className={`stat-sub ${color || ''}`}>{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate, history }) {
  const stats = computeStats(history || []);
  const hasHistory = stats.total > 0;

  // Percentages for the mini bars (relative to total)
  const highPct   = stats.total > 0 ? Math.round((stats.high   / stats.total) * 100) : 0;
  const medPct    = stats.total > 0 ? Math.round((stats.medium / stats.total) * 100) : 0;
  const lowPct    = stats.total > 0 ? Math.round((stats.low    / stats.total) * 100) : 0;

  return (
    <div className="dashboard-page page-content">

      {/* ── Hero ── */}
      <div className="dash-hero">
        <div className="dash-hero-inner">
          <div className="dash-hero-text">
            <div className="dash-engine-badge">
              <span className="badge-dot" aria-hidden="true" />
              Heuristic Engine · Local · No Data Transmitted
            </div>

            <h1 className="dash-headline">
              Detect the deception.<br />
              <span className="dash-headline-accent">Understand the risk.</span><br />
              Stay protected.
            </h1>

            <p className="dash-tagline">
              Paste any suspicious message for an instant risk assessment. ScamShield analyses
              English, Hindi, and Hinglish scam patterns entirely in your browser — your text
              never leaves your device.
            </p>

            <div className="dash-cta-row">
              <button className="btn-primary" onClick={() => onNavigate('scanner')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Scan a Message
              </button>
              <button className="btn-secondary" onClick={() => onNavigate('url')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Inspect a URL
              </button>
              <button className="btn-secondary" onClick={() => onNavigate('lab')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Awareness Lab
              </button>
            </div>
          </div>

          <div className="dash-hero-visual" aria-hidden="true">
            <div className="shield-wrap">
              <div className="shield-orbit" />
              <svg viewBox="0 0 100 110" fill="none" className="shield-svg">
                <path d="M50 5L10 20V55C10 78 28 97 50 105C72 97 90 78 90 55V20L50 5Z"
                  fill="rgba(14,165,233,0.07)" stroke="rgba(14,165,233,0.45)" strokeWidth="1.5"/>
                <path d="M50 17L22 29V55C22 72 34 84 50 91C66 84 78 72 78 55V29L50 17Z"
                  fill="rgba(14,165,233,0.04)" stroke="rgba(14,165,233,0.22)" strokeWidth="1"/>
                <path d="M34 52L44 62L66 40" stroke="#38bdf8" strokeWidth="3.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Privacy notice ── */}
      <div className="privacy-notice" role="note">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <p>
          <strong>Privacy:</strong> All analysis runs locally in your browser.
          ScamShield does not transmit your messages, URLs, or history to any server.
          History is saved to your device&apos;s localStorage only.
        </p>
      </div>

      {/* ── Stats derived from real history ── */}
      <div className="stats-grid">
        <StatCard
          pct={stats.total > 0 ? 100 : 0}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
          value={stats.total}
          label="Total Scanned"
          sub={stats.total === 0 ? 'Run your first scan' : `${stats.total} message${stats.total !== 1 ? 's' : ''} analysed`}
        />
        <StatCard
          color="danger"
          pct={highPct}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          value={stats.high}
          label="High Risk"
          sub={stats.total > 0 ? `${highPct}% of scans` : '—'}
        />
        <StatCard
          color="warning"
          pct={medPct}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          value={stats.medium}
          label="Medium Risk"
          sub={stats.total > 0 ? `${medPct}% of scans` : '—'}
        />
        <StatCard
          color="success"
          pct={lowPct}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>}
          value={stats.low}
          label="Low Risk / Safe"
          sub={stats.total > 0 ? `${lowPct}% of scans` : '—'}
        />
      </div>

      {/* ── Lower panels ── */}
      <div className="dash-lower">
        {/* Quick scan samples */}
        <div className="dash-panel">
          <p className="section-title">Quick Scan Samples</p>
          <p className="section-sub">Click any to load into the scanner</p>
          <div className="quick-samples">
            {SAMPLE_MESSAGES.slice(0, 4).map((msg) => (
              <button
                key={msg.label}
                className="quick-sample-item"
                onClick={() => onNavigate('scanner', msg.text)}
              >
                <span className="quick-sample-tag">{msg.label}</span>
                <p className="quick-sample-preview">{msg.text.slice(0, 78)}…</p>
                <span className="quick-sample-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="dash-right-col">
          {/* Recent scan activity */}
          <div className="dash-panel">
            <p className="section-title">Recent Activity</p>
            <p className="section-sub">{hasHistory ? 'Your most recent scans' : 'No scans yet this session'}</p>

            {!hasHistory ? (
              <div className="empty-activity">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <p>Run your first scan to see activity here.</p>
                <button
                  className="btn-primary"
                  style={{ fontSize: '12px', padding: '7px 16px', marginTop: '4px' }}
                  onClick={() => onNavigate('scanner')}
                >
                  Scan Now
                </button>
              </div>
            ) : (
              <ul className="activity-list">
                {stats.recent.map((r, i) => (
                  <li key={r.id || i} className="activity-item">
                    <div className={`activity-dot ${r.riskColor}`} aria-hidden="true" />
                    <div className="activity-info">
                      <p className="activity-cat">{r.category || 'General'}</p>
                      <p className="activity-time">
                        {(() => {
                          try {
                            return new Date(r.analysedAt || r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          } catch { return ''; }
                        })()}
                      </p>
                    </div>
                    <span className={`risk-badge-sm ${r.riskColor}`}>{r.risk}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Top warning signs */}
          {stats.topWarnings.length > 0 && (
            <div className="dash-panel">
              <p className="section-title">Top Warning Signs</p>
              <p className="section-sub">Most frequent across your scans</p>
              <ul className="top-warnings-list">
                {stats.topWarnings.map((w, i) => (
                  <li key={i} className="top-warning-item">
                    <span className="tw-rank">{i + 1}</span>
                    <span className="tw-label">{w.label}</span>
                    <span className="tw-count">{w.count}×</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="dash-disclaimer" role="note">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>
          <strong>Disclaimer:</strong> ScamShield uses rule-based heuristics, not a trained AI model.
          It may occasionally miss novel scams or flag legitimate messages. Always apply your own judgement.
        </p>
      </div>
    </div>
  );
}
