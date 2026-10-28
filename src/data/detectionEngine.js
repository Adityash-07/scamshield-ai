/**
 * detectionEngine.js
 * Rule-based scam detection engine for ScamShield AI.
 *
 * Design principles:
 *  - Each rule fires at most once (deduplication by id).
 *  - Rules carry a category, severity (low/medium/high), weight, and explanation.
 *  - The engine returns a normalised heuristic score 0–100. It is NOT a trained ML model.
 *  - Supports English, common Hindi, and Hinglish phrases.
 *  - Never claims perfect accuracy; callers should surface the disclaimer to users.
 */

// ── Rule definitions ──────────────────────────────────────────────────────────

export const DETECTION_RULES = [
  // ── Urgency & Pressure ──
  {
    id: 'urgency_en',
    category: 'Urgency & Pressure',
    label: 'Artificial Urgency',
    severity: 'medium',
    weight: 12,
    pattern: /\b(urgent|urgently|act now|act immediately|limited time|expires?\s*(in|soon|today)?|hurry|don'?t wait|right now|asap|last chance|final (notice|warning)|respond (now|immediately))\b/i,
    explanation: 'Scammers manufacture false deadlines to prevent you from pausing to verify the message.',
  },
  {
    id: 'urgency_hi',
    category: 'Urgency & Pressure',
    label: 'Hindi/Hinglish Urgency',
    severity: 'medium',
    weight: 12,
    pattern: /\b(turant|jaldi|abhi|abhi tak|kal tak|aaj hi|jald|der mat karo|der mat karna|samay simit|sirf aaj)\b/i,
    explanation: 'Hindi/Hinglish urgency phrases mirror classic pressure tactics used in India-targeted scams.',
  },

  // ── Threats & Scare Tactics ──
  {
    id: 'threats_account',
    category: 'Threats & Scare Tactics',
    label: 'Account Suspension Threat',
    severity: 'high',
    weight: 18,
    pattern: /\b(account (has been |will be )?(suspended|blocked|locked|deactivated|disabled)|lose (access|your account)|permanently (suspend|block|lock))\b/i,
    explanation: 'Threatening account loss creates panic and pressures victims to act before verifying.',
  },
  {
    id: 'threats_legal',
    category: 'Threats & Scare Tactics',
    label: 'Legal / Arrest Threat',
    severity: 'high',
    weight: 20,
    pattern: /\b(arrest warrant|legal action|FIR (filed|register)|court notice|police (will|is|are) (come|coming|on their way)|cyber crime|you will be arrested|gir(aftaar|ftari))\b/i,
    explanation: 'Fake legal threats are a hallmark of government-impersonation and courier scams.',
  },
  {
    id: 'threats_tech',
    category: 'Threats & Scare Tactics',
    label: 'Malware / Virus Threat',
    severity: 'high',
    weight: 18,
    pattern: /\b(virus(es)?|malware|infected|hacked|unauthorized access|data (breach|loss|theft)|your (computer|device|phone) (has been |is )?(infected|compromised|hacked))\b/i,
    explanation: 'Fake virus alerts are used by tech-support scammers to gain remote access to devices.',
  },

  // ── OTP / Password / Credentials ──
  {
    id: 'otp_request',
    category: 'Credential Harvesting',
    label: 'OTP / Verification Code Request',
    severity: 'high',
    weight: 22,
    pattern: /\b(otp|one[- ]time (password|code|pin)|verification code|share (the |your )?(otp|code|pin)|enter (the |your )?(otp|code)|6[- ]?digit code|security code|auth(entication)? code)\b/i,
    explanation: 'Legitimate organisations never ask you to share an OTP. Sharing one gives attackers full account access.',
  },
  {
    id: 'password_request',
    category: 'Credential Harvesting',
    label: 'Password / PIN Request',
    severity: 'high',
    weight: 22,
    pattern: /\b(your (password|pin|passcode)|share your (password|pin)|enter (password|pin)|reset.*password.*link|password.*verify|confirm (your )?(password|pin|account))\b/i,
    explanation: 'No legitimate service will ask for your password via SMS, email, or chat.',
  },
  {
    id: 'kyc_request',
    category: 'Credential Harvesting',
    label: 'KYC / Aadhaar / PAN Request',
    severity: 'high',
    weight: 20,
    pattern: /\b(kyc (update|verify|complete|pending|expired)|aadhaar (number|card|verify|link)|pan (card|number|verify)|update (your )?(kyc|aadhaar|pan)|kyc incomplete)\b/i,
    explanation: 'KYC scams impersonate banks or government to harvest identity documents.',
  },
  {
    id: 'ssn_request',
    category: 'Credential Harvesting',
    label: 'SSN / National ID Request',
    severity: 'high',
    weight: 20,
    pattern: /\b(ssn|social security (number|card)?|national id|provide your (id|identification)|verify (your )?(identity|details|account|information))\b/i,
    explanation: 'Requests for national ID numbers are used to enable identity theft.',
  },
  {
    id: 'bank_details',
    category: 'Credential Harvesting',
    label: 'Bank / Card Details Request',
    severity: 'high',
    weight: 22,
    pattern: /\b(bank (account|details)|account number|ifsc|routing number|card (number|details|cvv)|credit card|debit card|net ?banking (id|password|login))\b/i,
    explanation: 'Legitimate banks never request account numbers, CVVs, or net-banking credentials via message.',
  },

  // ── Financial Fraud ──
  {
    id: 'advance_fee',
    category: 'Advance-Fee Fraud',
    label: 'Advance-Fee / 419 Fraud',
    severity: 'high',
    weight: 22,
    pattern: /\b(barrister|attorney|next of kin|deceased (estate|relative)|inheritance|transfer (of )?funds?|risk[- ]free (deal|offer|investment)|partnership (offer|request)|confidential (deal|business))\b/i,
    explanation: 'Classic "Nigerian Prince" scripts promise large sums contingent on an upfront fee you never recover.',
  },
  {
    id: 'upfront_fee',
    category: 'Financial Fraud',
    label: 'Upfront Payment Demanded',
    severity: 'high',
    weight: 24,
    pattern: /\b(send|wire|pay|transfer|deposit).{0,40}(\$[\d,]+|₹[\d,]+|fee|charges?|registration|processing|starter kit|advance)/i,
    explanation: 'You should never pay money to receive money. Any such requirement is a defining scam indicator.',
  },
  {
    id: 'money_promise',
    category: 'Financial Fraud',
    label: 'Unsolicited Money Promise',
    severity: 'medium',
    weight: 15,
    pattern: /\b(\$[\d,]+|₹[\d,]+|\d+\s*(usd|inr|dollars?|lakhs?|crore))\b.*\b(prize|winner|reward|gift|cashback|refund|claim)\b|\b(cash prize|won|lottery winner|selected winner)\b/i,
    explanation: 'Promises of unexpected cash prizes are almost always lures to extract personal details or fees.',
  },
  {
    id: 'investment_scam',
    category: 'Investment Fraud',
    label: 'Fake Investment Opportunity',
    severity: 'high',
    weight: 20,
    pattern: /\b(guaranteed (return|profit|income|interest)|double (your|the) (money|investment)|crypto (investment|profit|earning)|forex (signal|trading|profit)|high return(s)?|risk[- ]free investment|mlm|multi.?level marketing|earn (daily|passive) income)\b/i,
    explanation: 'No legitimate investment guarantees returns. These promises are used by Ponzi/pyramid and crypto scams.',
  },
  {
    id: 'job_scam',
    category: 'Job / Work-From-Home Scam',
    label: 'Fake Job Offer',
    severity: 'medium',
    weight: 16,
    pattern: /\b(work from home|earn (₹|\$)?[\d,]+.{0,20}(day|week|month|hour)|no experience (needed|required)|data entry (job|work)|part[- ]time (job|work|earn)|hiring (now|immediately)|apply (now|immediately) (to earn|for job))\b/i,
    explanation: 'Fake work-from-home ads collect registration fees and personal data from job seekers.',
  },

  // ── Impersonation ──
  {
    id: 'bank_impersonation',
    category: 'Bank Impersonation',
    label: 'Bank / NBFC Impersonation',
    severity: 'high',
    weight: 18,
    pattern: /\b(sbi|hdfc|icici|axis bank|bank of (america|india)|citibank|paytm (bank|payments)|phonepe|google pay|upi).{0,60}(suspend|block|verify|update|click|login|account)\b/i,
    explanation: 'Scammers impersonate well-known banks and payment apps to harvest credentials.',
  },
  {
    id: 'govt_impersonation',
    category: 'Government Impersonation',
    label: 'Government / Authority Impersonation',
    severity: 'high',
    weight: 20,
    pattern: /\b(income tax (department|notice|refund)|it department|trai|irdai|sebi|rbi|uidai|passport office|customs (department|officer)|irs|fbi|microsoft (support|certified)|amazon (customer )?(care|support)|insurance (claim|department))\b/i,
    explanation: 'Government agencies and large companies never initiate contact via unsolicited SMS or WhatsApp.',
  },
  {
    id: 'courier_scam',
    category: 'Courier / Parcel Scam',
    label: 'Fake Courier / Parcel Notification',
    severity: 'medium',
    weight: 15,
    pattern: /\b(parcel|courier|package|shipment).{0,60}(held|detained|seized|pending|customs|pay|fee|release|deliver)\b|\b(customs (fee|charges?|duty)|parcel (seized|held))\b/i,
    explanation: 'Fake delivery notices demand fees to release packages. Real courier firms deduct customs fees automatically.',
  },

  // ── Suspicious Links ──
  {
    id: 'suspicious_tld',
    category: 'Suspicious Link',
    label: 'Suspicious Domain / TLD',
    severity: 'high',
    weight: 20,
    pattern: /https?:\/\/[^\s]*\.(xyz|tk|ml|cf|ga|click|win|loan|top|gq|pw|icu|buzz|rest|finance|support|help|live|gift|online)\b/i,
    explanation: 'Abused top-level domains (.xyz, .tk, etc.) are disproportionately used in phishing and malware campaigns.',
  },
  {
    id: 'url_shortener',
    category: 'Suspicious Link',
    label: 'URL Shortener',
    severity: 'medium',
    weight: 12,
    pattern: /https?:\/\/(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|cutt\.ly|rb\.gy|short\.io|tiny\.one|clck\.ru|shorturl\.at)\//i,
    explanation: 'Shortened URLs hide the real destination. Scammers use them so victims cannot inspect the link.',
  },
  {
    id: 'ip_url',
    category: 'Suspicious Link',
    label: 'IP Address in URL',
    severity: 'high',
    weight: 18,
    pattern: /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
    explanation: 'Legitimate services use domain names. IP-address URLs almost always indicate phishing infrastructure.',
  },
  {
    id: 'brand_misspelling',
    category: 'Suspicious Link',
    label: 'Brand Name in Suspicious Domain',
    severity: 'high',
    weight: 18,
    pattern: /https?:\/\/[^\s]*(paypa[l1]|arnazon|g[o0]{2}gle|micros[o0]ft|app[l1]e|faceb[o0]{2}k|netf[l1]ix|amaz[o0]n)[^\s]*/i,
    explanation: 'Lookalike domains (e.g. "paypa1.com") are designed to deceive at a glance.',
  },
  {
    id: 'http_only',
    category: 'Suspicious Link',
    label: 'Non-HTTPS (Unencrypted) Link',
    severity: 'low',
    weight: 6,
    pattern: /\bhttp:\/\/(?!localhost)[^\s]+/i,
    explanation: 'HTTP links transmit data without encryption. This is a weak signal on its own but worth noting.',
  },

  // ── Prize / Lottery ──
  {
    id: 'prize_lottery',
    category: 'Prize / Lottery Scam',
    label: 'Fake Prize or Lottery',
    severity: 'high',
    weight: 20,
    pattern: /\b(congratulations?|you (have|have been|are) (won|selected|chosen|picked)|lucky (winner|draw)|scratch card|claim (your )?(prize|reward|gift)|lottery (winner|result)|bumper prize|mega prize)\b/i,
    explanation: 'You cannot win a lottery you did not enter. These messages are always designed to extract money or data.',
  },

  // ── Misc High-Signal Indicators ──
  {
    id: 'free_email_payment',
    category: 'Suspicious Contact',
    label: 'Free Email Used for Financial Instructions',
    severity: 'medium',
    weight: 14,
    pattern: /[a-zA-Z0-9._%+\-]+@(gmail|yahoo|hotmail|outlook|rediffmail|ymail)\.(?:com|net|in)\b[\s\S]{0,80}(pay|send|wire|transfer|deposit|money|amount)/i, // eslint-disable-line no-useless-escape
    explanation: 'Legitimate businesses use official domains. Using Gmail or Yahoo for payment instructions is a scam signal.',
  },
  {
    id: 'excessive_caps',
    category: 'Social Engineering',
    label: 'Excessive Capitalisation',
    severity: 'low',
    weight: 7,
    pattern: /([A-Z]{4,}\s+){3,}/,
    explanation: 'Excessive ALL CAPS is used to create panic or excitement and override rational judgement.',
  },
  {
    id: 'secrecy_request',
    category: 'Social Engineering',
    label: 'Request for Secrecy',
    severity: 'medium',
    weight: 14,
    pattern: /\b(don'?t tell|keep (this |it )?(secret|confidential|between us)|do not (share|disclose|tell)|only you|just between us|nobody (should|must) know)\b/i,
    explanation: 'Asking you to keep an offer secret prevents friends and family from warning you.',
  },
  {
    id: 'romance_grooming',
    category: 'Romance / Social Engineering',
    label: 'Romance / Grooming Language',
    severity: 'medium',
    weight: 12,
    pattern: /\b(i (saw|found) your (profile|photo|pic)|let'?s (chat|talk|connect) privately|i am a (successful|wealthy|rich) (person|business|investor|trader)|send me (your number|photo|pic))\b/i,
    explanation: 'Unsolicited romantic outreach from strangers often precedes requests for money or personal information.',
  },
];

// ── Category descriptions ─────────────────────────────────────────────────────

export const CATEGORY_INFO = {
  'Urgency & Pressure':       'Creates false deadlines to prevent careful thought.',
  'Threats & Scare Tactics':  'Uses fear of arrest, account loss, or malware to pressure compliance.',
  'Credential Harvesting':    'Attempts to collect passwords, OTPs, or identity documents.',
  'Financial Fraud':          'Promises money or demands upfront payment fraudulently.',
  'Advance-Fee Fraud':        'Classic 419 scheme — promise a large sum contingent on an upfront fee.',
  'Investment Fraud':         'Promises guaranteed returns to lure investment into scams.',
  'Job / Work-From-Home Scam':'Fake opportunities that collect fees or personal data from job seekers.',
  'Bank Impersonation':       'Pretends to be a bank or payment app to harvest credentials.',
  'Government Impersonation': 'Impersonates authorities to create legal fear and extract money.',
  'Courier / Parcel Scam':    'Fake delivery fees used to extract money or card details.',
  'Suspicious Link':          'Link patterns associated with phishing or malware delivery.',
  'Prize / Lottery Scam':     'Fake winnings designed to extract fees or personal data.',
  'Suspicious Contact':       'Contact details inconsistent with a legitimate organisation.',
  'Social Engineering':       'Psychological manipulation tactics to bypass critical thinking.',
  'Romance / Social Engineering': 'Unsolicited romantic contact that precedes financial requests.',
};

// ── Main analysis function ────────────────────────────────────────────────────

/**
 * Analyse a message string for scam indicators.
 * @param {string} text  Raw message text from the user.
 * @returns {object|null}  Analysis result, or null if text is empty.
 */
export function analyzeMessage(text) {
  if (!text || !text.trim()) return null;

  // Fire each rule at most once (deduplicated by id).
  const matched = [];
  const seenIds = new Set();
  for (const rule of DETECTION_RULES) {
    if (!seenIds.has(rule.id) && rule.pattern.test(text)) {
      matched.push(rule);
      seenIds.add(rule.id);
    }
  }

  // Weighted sum, capped at 100. Any text >= 10 chars gets a floor of 5 to show activity.
  const rawScore = matched.reduce((sum, r) => sum + r.weight, 0);
  const score = Math.min(100, Math.max(text.trim().length >= 10 ? 5 : 0, rawScore));

  // Dominant category = the category with the highest combined weight among matches.
  const categoryWeights = {};
  for (const r of matched) {
    categoryWeights[r.category] = (categoryWeights[r.category] || 0) + r.weight;
  }
  const dominantCategory = Object.keys(categoryWeights).length
    ? Object.entries(categoryWeights).sort((a, b) => b[1] - a[1])[0][0]
    : 'General';

  // Risk level thresholds
  let risk, riskColor;
  if (score >= 60) {
    risk = 'HIGH RISK';
    riskColor = 'danger';
  } else if (score >= 30) {
    risk = 'MEDIUM RISK';
    riskColor = 'warning';
  } else {
    risk = 'LOW RISK';
    riskColor = 'success';
  }

  const recommendations = buildRecommendations(matched, score, dominantCategory);

  return {
    score,
    risk,
    riskColor,
    category: dominantCategory,
    warnings: matched,
    recommendations,
    analysedAt: new Date().toISOString(),
  };
}

// ── Recommendation builder ────────────────────────────────────────────────────

function buildRecommendations(matched, score) {
  const recs = new Set();

  if (score >= 60) {
    recs.add('Do NOT click any links or call any phone numbers in this message.');
    recs.add('Block the sender and report the message as spam immediately.');
    recs.add('Never share personal details, money, or credentials in response to unsolicited messages.');
  } else if (score >= 30) {
    recs.add('Exercise caution — verify the sender through official channels before acting.');
    recs.add('Navigate to any website directly by typing the URL rather than clicking links.');
  } else {
    recs.add('No strong indicators found, but remain alert. Scams can be subtle.');
  }

  // Category-specific recommendations
  const ids = new Set(matched.map((m) => m.id));

  if (ids.has('otp_request') || ids.has('password_request')) {
    recs.add('Never share an OTP, password, or PIN with anyone — including people claiming to be from your bank or telecom provider.');
  }
  if (ids.has('kyc_request') || ids.has('bank_details') || ids.has('ssn_request')) {
    recs.add('Contact your bank directly using the number on the back of your card if you have concerns about your account.');
  }
  if (ids.has('suspicious_tld') || ids.has('url_shortener') || ids.has('ip_url') || ids.has('brand_misspelling')) {
    recs.add('Inspect any URL carefully before clicking. Use a link-checker service such as VirusTotal (virustotal.com) on your own device.');
  }
  if (ids.has('upfront_fee') || ids.has('advance_fee')) {
    recs.add('Paying money to receive money is the single most reliable sign of a scam. Do not send any funds.');
  }
  if (ids.has('investment_scam')) {
    recs.add('Verify any investment opportunity with your country\'s financial regulator before committing funds.');
  }
  if (ids.has('threats_legal') || ids.has('govt_impersonation')) {
    recs.add('Government agencies do not issue arrest warrants or legal notices via SMS or WhatsApp. Hang up or delete the message.');
  }
  if (ids.has('job_scam')) {
    recs.add('Legitimate employers never charge candidates a registration or starter-kit fee.');
  }
  if (ids.has('prize_lottery')) {
    recs.add('Real lotteries do not notify winners by unsolicited SMS. Delete this message.');
  }
  if (ids.has('courier_scam')) {
    recs.add('Contact the courier company directly through their official website to verify any customs fee.');
  }

  return [...recs];
}

// ── Disclaimer (always surface to users) ─────────────────────────────────────

export const ANALYSIS_DISCLAIMER =
  'This analysis uses heuristic rules, not a trained AI model. It may miss novel scams or occasionally flag legitimate messages. Always apply your own judgement and consult official sources when in doubt.';
