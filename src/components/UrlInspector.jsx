import { useState } from 'react';
import { analyzeUrls, URL_DISCLAIMER } from '../utils/urlInspector';
import './UrlInspector.css';

const SAMPLE_URLS = [
  'http://bankofamerica-secure-login.net/verify?acct=123',
  'https://bit.ly/3xR9fake',
  'https://hdfc-kyc-update.xyz/account/confirm',
  'http://192.168.1.1/login',
  'https://paypa1.com/reset-password',
  'https://www.google.com',
];

function SeverityDot({ severity }) {
  return <span className={`sev-dot sev-${severity}`} title={severity} />;
}

export default function UrlInspector() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);

  function handleInspect() {
    if (!input.trim()) return;
    setIsInspecting(true);
    setResults(null);
    setTimeout(() => {
      const analysis = analyzeUrls(input);
      setResults(analysis);
      setIsInspecting(false);
    }, 400);
  }

  function loadSample(url) {
    setInput(url);
    setResults(null);
  }

  function handleClear() {
    setInput('');
    setResults(null);
  }

  const highCount = results ? results.results.filter((r) => r.overallRisk === 'high').length : 0;
  const medCount  = results ? results.results.filter((r) => r.overallRisk === 'medium').length : 0;

  return (
    <div className="url-inspector-page page-content">
      <div className="page-header">
        <h1 className="page-title">URL Inspector</h1>
        <p className="page-subtitle">
          Paste a message or individual URLs to inspect their structure for phishing indicators.
          URLs are <strong>never opened or sent to any external service</strong> — all analysis is local.
        </p>
      </div>

      {/* Safety notice */}
      <div className="url-safety-notice">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p>ScamShield never visits, opens, or transmits URLs. Analysis is structural only — we inspect shape, not content.</p>
      </div>

      {/* Sample URLs */}
      <section className="url-samples-section">
        <p className="samples-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Try a sample URL:
        </p>
        <div className="url-samples-grid">
          {SAMPLE_URLS.map((url) => (
            <button key={url} className="url-sample-btn" onClick={() => loadSample(url)} title={url}>
              {url.length > 50 ? url.slice(0, 50) + '…' : url}
            </button>
          ))}
        </div>
      </section>

      {/* Input */}
      <section className="url-input-section">
        <div className="input-header">
          <label className="input-label" htmlFor="url-input">
            Paste a URL or message containing URLs
          </label>
          {input && <button className="clear-btn" onClick={handleClear}>Clear</button>}
        </div>
        <textarea
          id="url-input"
          className="message-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') handleInspect(); }}
          placeholder="e.g. https://bit.ly/3xR9fake or paste a full message containing links…"
          rows={4}
          spellCheck={false}
        />
        <div className="input-footer">
          <span className="char-count">{input.length} characters · Ctrl+Enter to inspect</span>
          <button
            className={`analyse-btn ${isInspecting ? 'loading' : ''}`}
            onClick={handleInspect}
            disabled={!input.trim() || isInspecting}
            aria-busy={isInspecting}
          >
            {isInspecting ? (
              <><span className="spinner" aria-hidden="true" /> Inspecting…</>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Inspect URLs
              </>
            )}
          </button>
        </div>
      </section>

      {/* Results */}
      {results && (
        <section className="url-results-section">
          <div className="url-results-header">
            <h2 className="results-title">
              Inspection Results
              <span className="url-found-count">{results.urls.length} URL{results.urls.length !== 1 ? 's' : ''} found</span>
            </h2>
            {results.urls.length > 0 && (
              <div className="url-summary-chips">
                {highCount > 0 && <span className="risk-chip danger">{highCount} high risk</span>}
                {medCount  > 0 && <span className="risk-chip warning">{medCount} medium risk</span>}
                {results.results.filter((r) => r.overallRisk === 'clean').length > 0 && (
                  <span className="risk-chip success">
                    {results.results.filter((r) => r.overallRisk === 'clean').length} clean
                  </span>
                )}
              </div>
            )}
          </div>

          {results.urls.length === 0 ? (
            <div className="url-empty-state">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p>No URLs detected in the input.</p>
              <span>Make sure URLs start with http:// or https://</span>
            </div>
          ) : (
            <ul className="url-results-list">
              {results.results.map((r, i) => (
                <li key={i} className={`url-result-card url-risk-${r.overallRisk}`}>
                  {/* Card header */}
                  <div className="url-card-header">
                    <div className="url-card-meta">
                      <code className="url-full-display">{r.url.length > 100 ? r.url.slice(0,100) + '…' : r.url}</code>
                      <div className="url-card-sub">
                        {!r.parseError && (
                          <>
                            <span className={`proto-badge ${r.isHttps ? 'https' : 'http'}`}>
                              {r.isHttps ? '🔒 HTTPS' : '⚠️ HTTP'}
                            </span>
                            <span className="url-hostname">{r.hostname}</span>
                            {r.tld && <span className="url-tld">.{r.tld}</span>}
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`risk-chip ${r.overallRisk === 'high' ? 'danger' : r.overallRisk === 'medium' ? 'warning' : r.overallRisk === 'clean' ? 'success' : 'muted'}`}>
                      {r.overallRisk === 'clean' ? '✓ Clean' : r.overallRisk}
                    </span>
                  </div>

                  {/* Findings */}
                  {r.parseError ? (
                    <p className="url-parse-error">This URL could not be parsed and may be malformed.</p>
                  ) : r.findings.length === 0 ? (
                    <p className="url-no-issues">
                      No structural issues detected. This does not guarantee the URL is safe — always verify context before clicking.
                    </p>
                  ) : (
                    <ul className="url-card-findings">
                      {r.findings.map((f) => (
                        <li key={f.id} className="url-card-finding">
                          <SeverityDot severity={f.severity} />
                          <div>
                            <div className="url-finding-header">
                              <p className="url-finding-label">{f.label}</p>
                              <span className={`sev-chip sev-${f.severity}`}>{f.severity}</span>
                            </div>
                            <p className="url-finding-exp">{f.explanation}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Disclaimer */}
          <div className="disclaimer-box">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{URL_DISCLAIMER}</p>
          </div>
        </section>
      )}
    </div>
  );
}
