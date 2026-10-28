/**
 * urlInspector.js
 * Extracts URLs from a message and analyses each one locally.
 *
 * Safety rules:
 *  - URLs are NEVER fetched, opened, or sent to external services.
 *  - Analysis is purely structural (hostname, path, TLD, length, etc.).
 *  - We never claim a URL is "malicious" — only flag suspicious patterns.
 */

// ── Known URL shortener hostnames ─────────────────────────────────────────────
const SHORTENER_HOSTS = new Set([
  'bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','cutt.ly',
  'rb.gy','short.io','tiny.one','clck.ru','shorturl.at','buff.ly',
  'dlvr.it','su.pr','cli.gs','tr.im','snipurl.com','bl.ink',
]);

// ── Commonly abused TLDs ──────────────────────────────────────────────────────
const ABUSED_TLDS = new Set([
  'xyz','tk','ml','cf','ga','click','win','loan','top','gq','pw',
  'icu','buzz','rest','finance','support','help','live','gift','online',
  'party','racing','trade','accountant','cricket','download','review',
]);

// ── Brand names commonly spoofed in domains ───────────────────────────────────
const SPOOFED_BRANDS = [
  'paypal','amazon','google','microsoft','apple','facebook','netflix',
  'instagram','whatsapp','hdfc','sbi','icici','axis','paytm','phonepe',
  'aadhaar','uidai','irctc','amazon','flipkart','snapdeal','uber','ola',
];

// ── Free URL extraction regex ─────────────────────────────────────────────────
const URL_PATTERN = /https?:\/\/[^\s<>"'`[\]{}|\\^]+/gi;

/**
 * Extract all URLs from a raw message string.
 * @param {string} text
 * @returns {string[]}  Deduplicated raw URL strings.
 */
export function extractUrls(text) {
  if (!text) return [];
  const matches = text.match(URL_PATTERN) || [];
  // Deduplicate
  return [...new Set(matches)];
}

/**
 * Analyse a single URL string structurally.
 * @param {string} rawUrl
 * @returns {object}  Inspection result.
 */
export function inspectUrl(rawUrl) {
  const findings = [];

  // ── Parse URL safely ──────────────────────────────────────────────────────
  let parsed, hostname, tld, isHttps;
  try {
    const urlStr = /^https?:\/\//i.test(rawUrl) ? rawUrl : 'https://' + rawUrl;
    parsed = new URL(urlStr);
    hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const parts = hostname.split('.');
    tld = parts[parts.length - 1] || '';
    isHttps = parsed.protocol === 'https:';
  } catch {
    return {
      url: rawUrl,
      parseError: true,
      findings: [{ id: 'parse_error', label: 'Cannot Parse URL', severity: 'low',
        explanation: 'The URL could not be parsed. It may be malformed or an unusual format.' }],
      overallRisk: 'unknown',
      safe: false,
    };
  }

  // ── Check: HTTP (not HTTPS) ───────────────────────────────────────────────
  if (!isHttps) {
    findings.push({
      id: 'no_https',
      label: 'No HTTPS Encryption',
      severity: 'low',
      explanation: 'This link uses plain HTTP, so any data you submit will not be encrypted. Legitimate services almost always use HTTPS.',
    });
  }

  // ── Check: IP address host ────────────────────────────────────────────────
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    findings.push({
      id: 'ip_host',
      label: 'IP Address Host',
      severity: 'high',
      explanation: 'The URL uses a raw IP address instead of a domain name. Legitimate services use named domains. This is a strong indicator of phishing infrastructure.',
    });
  }

  // ── Check: URL shortener ──────────────────────────────────────────────────
  if (SHORTENER_HOSTS.has(hostname)) {
    findings.push({
      id: 'shortener',
      label: 'URL Shortener',
      severity: 'medium',
      explanation: `"${hostname}" is a URL shortening service. The real destination is hidden. Scammers use shorteners to prevent inspection. Expand the link with a service like checkshorturl.com before clicking.`,
    });
  }

  // ── Check: Abused TLD ────────────────────────────────────────────────────
  if (ABUSED_TLDS.has(tld)) {
    findings.push({
      id: 'abused_tld',
      label: `Abused Top-Level Domain (.${tld})`,
      severity: 'high',
      explanation: `The ".${tld}" TLD is disproportionately used in phishing and malware campaigns due to its low cost or free registration.`,
    });
  }

  // ── Check: Spoofed brand in domain ───────────────────────────────────────
  // Only flag if the brand appears in the domain but it's NOT the legitimate domain
  const legitimateDomainsForBrand = {
    paypal: 'paypal.com', amazon: 'amazon.com', google: 'google.com',
    microsoft: 'microsoft.com', apple: 'apple.com', facebook: 'facebook.com',
    netflix: 'netflix.com', hdfc: 'hdfcbank.com', sbi: 'onlinesbi.sbi',
    icici: 'icicibank.com', paytm: 'paytm.com',
  };

  for (const brand of SPOOFED_BRANDS) {
    if (hostname.includes(brand)) {
      const legitDomain = legitimateDomainsForBrand[brand];
      const isLegit = legitDomain && (hostname === legitDomain || hostname.endsWith('.' + legitDomain));
      if (!isLegit) {
        findings.push({
          id: `brand_spoof_${brand}`,
          label: `Brand Name "${brand}" in Suspicious Domain`,
          severity: 'high',
          explanation: `The domain contains "${brand}" but does not appear to be the genuine website. Lookalike domains are a core phishing technique designed to deceive at a glance.`,
        });
        break; // One brand-spoof finding per URL is enough
      }
    }
  }

  // ── Check: Excessive subdomain depth ────────────────────────────────────
  const subdomainDepth = hostname.split('.').length - 2;
  if (subdomainDepth >= 3) {
    findings.push({
      id: 'deep_subdomain',
      label: 'Unusually Deep Subdomain',
      severity: 'medium',
      explanation: `This URL has ${subdomainDepth} subdomain levels (e.g. "verify.secure.bank.phishdomain.com"). Deep subdomains are used to make the left-hand part look like a trusted brand.`,
    });
  }

  // ── Check: Suspicious keywords in path/query ─────────────────────────────
  const fullPath = (parsed.pathname + parsed.search).toLowerCase();
  const suspiciousKeywords = [
    'verify','login','signin','account','update','secure','bank','confirm',
    'kyc','otp','aadhaar','pan','password','credential','auth','validate',
  ];
  const foundKeywords = suspiciousKeywords.filter((kw) => fullPath.includes(kw));
  if (foundKeywords.length >= 2) {
    findings.push({
      id: 'suspicious_path',
      label: 'Credential-Harvesting Path',
      severity: 'medium',
      explanation: `The URL path contains sensitive keywords (${foundKeywords.slice(0,3).join(', ')}…) commonly seen in phishing pages designed to steal credentials.`,
    });
  }

  // ── Check: Very long URL ──────────────────────────────────────────────────
  if (rawUrl.length > 200) {
    findings.push({
      id: 'long_url',
      label: 'Unusually Long URL',
      severity: 'low',
      explanation: 'Very long URLs sometimes contain encoded tracking or obfuscation parameters used by phishing kits.',
    });
  }

  // ── Overall risk ──────────────────────────────────────────────────────────
  const hasHigh   = findings.some((f) => f.severity === 'high');
  const hasMedium = findings.some((f) => f.severity === 'medium');
  const overallRisk = hasHigh ? 'high' : hasMedium ? 'medium' : findings.length > 0 ? 'low' : 'clean';

  return {
    url: rawUrl,
    hostname,
    tld,
    isHttps,
    parseError: false,
    findings,
    overallRisk,
  };
}

/**
 * Analyse all URLs extracted from a message.
 * @param {string} text
 * @returns {{ urls: string[], results: object[] }}
 */
export function analyzeUrls(text) {
  const urls = extractUrls(text);
  const results = urls.map(inspectUrl);
  return { urls, results };
}

export const URL_DISCLAIMER =
  'URL analysis is purely structural. ScamShield AI never visits, opens, or transmits any URL to external services. A "clean" result does not guarantee a URL is safe — always exercise caution.';
