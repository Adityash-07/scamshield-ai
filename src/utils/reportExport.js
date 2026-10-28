/**
 * reportExport.js
 * Helpers to build and export scan reports.
 * No external dependencies. All data stays in the browser.
 */

// ── Formatters ────────────────────────────────────────────────────────────────

function formatDate(isoString) {
  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return isoString || 'Unknown';
  }
}

function severityLabel(s) {
  if (s === 'high')   return 'HIGH';
  if (s === 'medium') return 'MEDIUM';
  return 'LOW';
}

// ── TXT Report ────────────────────────────────────────────────────────────────

export function buildTxtReport(result, messageText) {
  const lines = [];
  lines.push('═'.repeat(60));
  lines.push('  ScamShield AI — Scan Report');
  lines.push('═'.repeat(60));
  lines.push(`Generated : ${formatDate(result.analysedAt || result.timestamp)}`);
  lines.push(`Risk Level: ${result.risk}`);
  lines.push(`Score     : ${result.score} / 100`);
  lines.push(`Category  : ${result.category || 'General'}`);
  lines.push('');

  lines.push('── Scanned Message ──────────────────────────────────────');
  lines.push((messageText || result.text || '(not available)').trim());
  lines.push('');

  lines.push('── Detected Warning Signs ───────────────────────────────');
  const warnings = result.warnings || [];
  if (warnings.length === 0) {
    lines.push('  No warning signs detected.');
  } else {
    for (const w of warnings) {
      lines.push(`  [${severityLabel(w.severity)}] ${w.label}`);
      lines.push(`        ${w.explanation || w.tip || ''}`);
    }
  }
  lines.push('');

  lines.push('── Safety Recommendations ───────────────────────────────');
  const recs = result.recommendations || [];
  recs.forEach((r, i) => lines.push(`  ${i + 1}. ${r}`));
  lines.push('');

  lines.push('── Disclaimer ───────────────────────────────────────────');
  lines.push('  This analysis uses heuristic rules, not a trained AI model.');
  lines.push('  It may miss novel scams or flag legitimate messages.');
  lines.push('  Always apply your own judgement and consult official sources.');
  lines.push('');
  lines.push('  All analysis is performed locally. No data was transmitted.');
  lines.push('═'.repeat(60));

  return lines.join('\n');
}

// ── JSON Report ───────────────────────────────────────────────────────────────

export function buildJsonReport(result, messageText) {
  return JSON.stringify(
    {
      _note: 'ScamShield AI heuristic scan report. Analysis performed locally.',
      generatedAt: result.analysedAt || result.timestamp || new Date().toISOString(),
      risk: result.risk,
      score: result.score,
      category: result.category || 'General',
      message: messageText || result.text || null,
      detectedWarnings: (result.warnings || []).map((w) => ({
        id: w.id,
        label: w.label,
        category: w.category,
        severity: w.severity,
        explanation: w.explanation || w.tip || '',
      })),
      recommendations: result.recommendations || [],
      disclaimer: 'Heuristic analysis only. May produce false positives or false negatives.',
    },
    null,
    2
  );
}

// ── Clipboard copy ────────────────────────────────────────────────────────────

/**
 * Copy text to clipboard. Returns true on success, false otherwise.
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

// ── File download ─────────────────────────────────────────────────────────────

/**
 * Trigger a browser download of text content.
 * @param {string} content  File content string
 * @param {string} filename  e.g. 'report.txt'
 * @param {string} mimeType  e.g. 'text/plain'
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('ScamShield: download failed', err);
  }
}
