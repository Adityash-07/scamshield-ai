/**
 * storage.js
 * Safe localStorage helpers for ScamShield AI scan history.
 *
 * All functions handle missing, malformed, or unavailable localStorage
 * gracefully and never throw to the caller.
 */

const STORAGE_KEY = 'scamshield_history';
const MAX_RECORDS = 200; // cap to prevent unbounded growth

// ── Read ─────────────────────────────────────────────────────────────────────

/**
 * Load all scan history records from localStorage.
 * @returns {Array}  Array of scan record objects (may be empty).
 */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out any records that are missing required fields
    return parsed.filter(
      (r) => r && typeof r.id === 'string' && typeof r.timestamp === 'string'
    );
  } catch {
    return [];
  }
}

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * Save a new scan result to the front of history.
 * @param {object} scanResult  The full result from analyzeMessage + metadata.
 * @returns {Array}  Updated history array.
 */
export function saveResult(scanResult) {
  try {
    const history = loadHistory();
    const record = {
      id: `scan_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      timestamp: new Date().toISOString(),
      ...scanResult,
    };
    const updated = [record, ...history].slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    // localStorage may be unavailable (private browsing quota exceeded, etc.)
    return loadHistory();
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * Delete a single record by id.
 * @param {string} id
 * @returns {Array}  Updated history array.
 */
export function deleteRecord(id) {
  try {
    const history = loadHistory();
    const updated = history.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return loadHistory();
  }
}

/**
 * Delete all history records.
 * @returns {Array}  Empty array.
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return [];
}

// ── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Compute dashboard statistics from saved history.
 * @returns {object}
 */
export function computeStats(history) {
  const total  = history.length;
  const high   = history.filter((r) => r.riskColor === 'danger').length;
  const medium = history.filter((r) => r.riskColor === 'warning').length;
  const low    = history.filter((r) => r.riskColor === 'success').length;

  // Count warning sign occurrences across all scans
  const warnCounts = {};
  for (const record of history) {
    if (Array.isArray(record.warnings)) {
      for (const w of record.warnings) {
        warnCounts[w.label] = (warnCounts[w.label] || 0) + 1;
      }
    }
  }
  const topWarnings = Object.entries(warnCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  // Recent 5 scans for activity feed
  const recent = history.slice(0, 5);

  return { total, high, medium, low, topWarnings, recent };
}
