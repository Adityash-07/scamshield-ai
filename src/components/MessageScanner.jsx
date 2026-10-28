import { useState, useCallback } from 'react';
import { SAMPLE_MESSAGES, analyzeMessage, ANALYSIS_DISCLAIMER } from '../data/sampleMessages';
import { analyzeUrls } from '../utils/urlInspector';
import { buildTxtReport, buildJsonReport, copyToClipboard, downloadFile } from '../utils/reportExport';
import './MessageScanner.css';

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

function SeverityDot({ severity }) {
  return <span className={`sev-dot sev-${severity}`} title={severity} />;
}

// Accepts initialText so the component can be re-keyed from App.jsx when
// a quick-scan preload happens — this avoids useEffect-based setState patterns.
export default function MessageScanner({ onResult, initialText }) {
  const [text, setText] = useState(initialText || '');
  const [result, setResult] = useState(null);
  const [urlAnalysis, setUrlAnalysis] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [copyState, setCopyState] = useState('idle'); // idle | copied | failed
  const [activeTab, setActiveTab] = useState('warnings'); // warnings | urls | recs

  const handleAnalyse = useCallback(() => {
    if (!text.trim()) return;
    setIsAnalysing(true);
    setResult(null);
    setUrlAnalysis(null);
    setActiveTab('warnings');

    setTimeout(() => {
      const analysis = analyzeMessage(text);
      const urls = analyzeUrls(text);
      setResult(analysis);
      setUrlAnalysis(urls);
      onResult && onResult({ text, ...analysis });
      setIsAnalysing(false);
    }, 700);
  }, [text, onResult]);

  function handleSample(msg) {
    setText(msg.text);
    setResult(null);
    setUrlAnalysis(null);
  }

  function handleClear() {
    setText('');
    setResult(null);
    setUrlAnalysis(null);
  }

  async function handleCopy() {
    if (!result) return;
    const report = buildTxtReport(result, text);
    const ok = await copyToClipboard(report);
    setCopyState(ok ? 'copied' : 'failed');
    setTimeout(() => setCopyState('idle'), 2500);
  }

  function handleDownloadTxt() {
    if (!result) return;
    const ts = new Date().toISOString().slice(0, 10);
    downloadFile(buildTxtReport(result, text), `scamshield-report-${ts}.txt`, 'text/plain');
  }

  function handleDownloadJson() {
    if (!result) return;
    const ts = new Date().toISOString().slice(0, 10);
    downloadFile(buildJsonReport(result, text), `scamshield-report-${ts}.json`, 'application/json');
  }

  // Sort warnings: high → medium → low
  const sortedWarnings = result
    ? [...result.warnings].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3))
    : [];

  const urlHighCount = urlAnalysis
    ? urlAnalysis.results.filter((r) => r.overallRisk === 'high').length
    : 0;

  return (
    <div className="scanner-page page-content">
      <div className="page-header">
        <h1 className="page-title">Message Scanner</h1>
        <p className="page-subtitle">
          Paste any suspicious email, SMS, or chat message to get an instant heuristic risk assessment.
          Supports English, Hindi, and Hinglish. All analysis runs locally in your browser.
        </p>
      </div>

      {/* Sample buttons */}
      <section className="samples-section" aria-label="Sample messages">
        <p className="samples-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Try a sample:
        </p>
        <div className="samples-grid">
          {SAMPLE_MESSAGES.map((msg) => (
            <button
              key={msg.label}
              className="sample-btn"
              onClick={() => handleSample(msg)}
              aria-label={`Load sample: ${msg.label}`}
            >
              {msg.label}
            </button>
          ))}
        </div>
      </section>

      {/* Input */}
      <section className={`input-section${isAnalysing ? ' is-scanning' : ''}`}>
        <div className="input-header">
          <label className="input-label" htmlFor="message-input">Message Text</label>
          {text && (
            <button className="clear-btn" onClick={handleClear} aria-label="Clear input">
              Clear
            </button>
          )}
        </div>
        <textarea
          id="message-input"
          className="message-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') handleAnalyse(); }}
          placeholder="Paste or type a suspicious message here… (Ctrl+Enter to analyse)"
          rows={8}
          aria-describedby="char-count-hint"
          spellCheck={false}
        />
        <div className="input-footer">
          <span className="char-count" id="char-count-hint" aria-live="polite">
            {text.length} characters
          </span>
          <button
            className={`analyse-btn ${isAnalysing ? 'loading' : ''}`}
            onClick={handleAnalyse}
            disabled={!text.trim() || isAnalysing}
            aria-busy={isAnalysing}
          >
            {isAnalysing ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Scanning…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Analyze Message
              </>
            )}
          </button>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section className="results-section" aria-label="Analysis results">
          {/* Header row */}
          <div className="results-header">
            <h2 className="results-title">Analysis Results</h2>
            <div className="export-controls" role="group" aria-label="Export options">
              <button
                className={`export-btn ${copyState === 'copied' ? 'success' : copyState === 'failed' ? 'fail' : ''}`}
                onClick={handleCopy}
                title="Copy text report to clipboard"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                {copyState === 'copied' ? 'Copied!' : copyState === 'failed' ? 'Failed' : 'Copy Report'}
              </button>
              <button className="export-btn" onClick={handleDownloadTxt} title="Download as .txt">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                TXT
              </button>
              <button className="export-btn" onClick={handleDownloadJson} title="Download as .json">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                JSON
              </button>
            </div>
          </div>

          {/* Risk banner */}
          <div className={`risk-banner ${result.riskColor}`} role="status">
            <div className="risk-left">
              <div className="risk-top-row">
                <span className={`risk-badge ${result.riskColor}`}>{result.risk}</span>
                <span className="risk-category">{result.category}</span>
              </div>
              <p className="risk-desc">
                {result.riskColor === 'danger' && 'This message contains multiple strong indicators of a scam. Exercise extreme caution.'}
                {result.riskColor === 'warning' && 'This message has suspicious characteristics. Verify independently before acting.'}
                {result.riskColor === 'success' && 'No strong scam indicators found. Remain vigilant — context always matters.'}
              </p>
            </div>
            <div className="risk-score-wrap" aria-label={`Risk score: ${result.score} out of 100`}>
              {/* SVG gauge ring */}
              <svg className="score-gauge" width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
                <circle className="gauge-track" cx="38" cy="38" r="30" />
                <circle
                  className={`gauge-fill ${result.riskColor}`}
                  cx="38" cy="38" r="30"
                  strokeDasharray={`${2 * Math.PI * 30}`}
                  strokeDashoffset={`${2 * Math.PI * 30 * (1 - result.score / 100)}`}
                />
                {/* rotate back so text is upright */}
                <g transform="rotate(90, 38, 38)">
                  <text x="38" y="34" textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--text-primary)">{result.score}</text>
                  <text x="38" y="47" textAnchor="middle" fontSize="9" fill="var(--text-muted)">/ 100</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Score bar */}
          <div className="score-bar-wrap" aria-hidden="true">
            <div className="score-bar-track">
              <div className={`score-bar-fill ${result.riskColor}`} style={{ width: `${result.score}%` }} />
            </div>
            <div className="score-bar-labels">
              <span>Low</span><span>Medium</span><span>High</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="result-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'warnings'}
              className={`result-tab ${activeTab === 'warnings' ? 'active' : ''}`}
              onClick={() => setActiveTab('warnings')}
            >
              Warning Signs
              <span className="tab-count">{sortedWarnings.length}</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'urls'}
              className={`result-tab ${activeTab === 'urls' ? 'active' : ''}`}
              onClick={() => setActiveTab('urls')}
            >
              URLs
              {urlHighCount > 0 && <span className="tab-count danger">{urlHighCount}</span>}
              {urlAnalysis && urlHighCount === 0 && (
                <span className="tab-count">{urlAnalysis.urls.length}</span>
              )}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'recs'}
              className={`result-tab ${activeTab === 'recs' ? 'active' : ''}`}
              onClick={() => setActiveTab('recs')}
            >
              Recommendations
              <span className="tab-count">{result.recommendations.length}</span>
            </button>
          </div>

          {/* Tab panels */}
          <div className="tab-panel" role="tabpanel">
            {activeTab === 'warnings' && (
              <div className="results-card">
                {sortedWarnings.length === 0 ? (
                  <p className="empty-state-text">No warning signs detected in this message.</p>
                ) : (
                  <ul className="warnings-list">
                    {sortedWarnings.map((w) => (
                      <li key={w.id} className="warning-item">
                        <SeverityDot severity={w.severity} />
                        <div className="warning-body">
                          <div className="warning-top">
                            <p className="warning-label">{w.label}</p>
                            <span className={`sev-chip sev-${w.severity}`}>{w.severity}</span>
                          </div>
                          <p className="warning-category">{w.category}</p>
                          <p className="warning-tip">{w.explanation || w.tip}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'urls' && (
              <div className="results-card">
                {!urlAnalysis || urlAnalysis.urls.length === 0 ? (
                  <p className="empty-state-text">No URLs were detected in this message.</p>
                ) : (
                  <ul className="url-list">
                    {urlAnalysis.results.map((r, i) => (
                      <li key={i} className={`url-item url-risk-${r.overallRisk}`}>
                        <div className="url-item-header">
                          <code className="url-display">{r.url.length > 80 ? r.url.slice(0,80) + '…' : r.url}</code>
                          <span className={`risk-chip url-risk-chip ${r.overallRisk === 'high' ? 'danger' : r.overallRisk === 'medium' ? 'warning' : r.overallRisk === 'clean' ? 'success' : 'muted'}`}>
                            {r.overallRisk}
                          </span>
                        </div>
                        {r.parseError ? (
                          <p className="url-error">Could not parse this URL.</p>
                        ) : (
                          <>
                            <p className="url-meta">{r.isHttps ? '🔒 HTTPS' : '⚠️ HTTP'} · {r.hostname}</p>
                            {r.findings.length === 0 ? (
                              <p className="url-clean">No structural issues found. Still exercise caution before clicking.</p>
                            ) : (
                              <ul className="url-findings">
                                {r.findings.map((f) => (
                                  <li key={f.id} className="url-finding">
                                    <SeverityDot severity={f.severity} />
                                    <div>
                                      <p className="url-finding-label">{f.label}</p>
                                      <p className="url-finding-exp">{f.explanation}</p>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'recs' && (
              <div className="results-card">
                <ul className="recs-list">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="rec-item">
                      <span className="rec-num" aria-hidden="true">{i + 1}</span>
                      <p>{rec}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="disclaimer-box" role="note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{ANALYSIS_DISCLAIMER}</p>
          </div>
        </section>
      )}
    </div>
  );
}
