import './SafetyTips.css';

const CATEGORIES = [
  {
    id: 'phishing',
    title: 'Phishing Attacks',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    color: 'danger',
    tips: [
      'Always check the sender\'s full email address — not just the display name.',
      'Hover over links before clicking to preview the actual URL destination.',
      'Legitimate banks and services will NEVER ask for your password via email.',
      'Look for misspelled domain names (e.g. "paypa1.com" instead of "paypal.com").',
      'When in doubt, go directly to the website by typing the URL yourself.',
    ],
  },
  {
    id: 'prize',
    title: 'Prize & Lottery Scams',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    color: 'warning',
    tips: [
      'You cannot win a lottery you never entered — these are always scams.',
      'Any prize that requires upfront payment to claim is fraudulent.',
      'Scammers use urgency ("claim within 24 hours") to bypass your judgement.',
      'Never provide personal information to claim a prize from an unknown source.',
      'Legitimate prizes do not require you to keep them secret from family.',
    ],
  },
  {
    id: 'social',
    title: 'Social Engineering',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: 'teal',
    tips: [
      'Scammers impersonate authority figures (IRS, police, Microsoft) to create fear.',
      'If you receive a threatening call or message, hang up and call the organisation directly.',
      'Never allow remote access to your computer from an unsolicited caller.',
      'Verify requests for money or information through a separate, known channel.',
      'Take time to think — scammers rely on panic to prevent rational decision-making.',
    ],
  },
  {
    id: 'passwords',
    title: 'Password & Account Security',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    color: 'success',
    tips: [
      'Use a unique, strong password for every account — a password manager helps.',
      'Enable two-factor authentication (2FA) on all important accounts.',
      'Never reuse passwords, especially across banking and email accounts.',
      'Check haveibeenpwned.com to see if your email has been in a data breach.',
      'Change passwords immediately if you suspect you have been phished.',
    ],
  },
  {
    id: 'mobile',
    title: 'SMS & Mobile Scams',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    color: 'warning',
    tips: [
      'Never call back numbers from suspicious SMS messages — look up the official number.',
      'Ignore texts claiming your package is stuck and demanding a fee to release it.',
      'Smishing (SMS phishing) links can install malware — don\'t tap unknown links.',
      'Your carrier will never ask you to confirm account details via text message.',
      'Forward suspicious texts to 7726 (SPAM) to report them to your carrier.',
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting Scams',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.36h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z" />
      </svg>
    ),
    color: 'teal',
    tips: [
      'Report scam emails to the FTC at reportfraud.ftc.gov (US) or Action Fraud (UK).',
      'Forward phishing emails to phishing@apwg.org and reportphishing@apwg.org.',
      'If you\'ve been defrauded, file a report with your local police immediately.',
      'Report online scam accounts directly to the platform where you encountered them.',
      'Share your experience — warn friends and family to prevent them from being targeted.',
    ],
  },
];

const COLOR_MAP = {
  danger: { bg: 'var(--danger-bg)', border: 'rgba(239,68,68,0.25)', icon: 'var(--danger)' },
  warning: { bg: 'var(--warning-bg)', border: 'rgba(245,158,11,0.25)', icon: 'var(--warning)' },
  success: { bg: 'var(--success-bg)', border: 'rgba(34,197,94,0.25)', icon: 'var(--success)' },
  teal: { bg: 'var(--teal-dim)', border: 'rgba(14,165,233,0.25)', icon: 'var(--teal)' },
};

export default function SafetyTips() {
  return (
    <div className="tips-page page-content">
      <div className="page-header">
        <h1 className="page-title">Safety Tips</h1>
        <p className="page-subtitle">
          Essential knowledge to protect yourself and your loved ones from online scams and fraud.
        </p>
      </div>

      <div className="tips-grid">
        {CATEGORIES.map((cat) => {
          const colors = COLOR_MAP[cat.color];
          return (
            <div
              key={cat.id}
              className="tips-card"
              style={{ '--cat-bg': colors.bg, '--cat-border': colors.border, '--cat-icon': colors.icon }}
            >
              <div className="tips-card-header">
                <div className="tips-icon">{cat.icon}</div>
                <h2 className="tips-cat-title">{cat.title}</h2>
              </div>
              <ul className="tips-list">
                {cat.tips.map((tip, i) => (
                  <li key={i} className="tip-item">
                    <span className="tip-check">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <p>{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Bottom callout */}
      <div className="tips-callout">
        <div className="callout-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <p className="callout-title">Remember: When in doubt, don't.</p>
          <p className="callout-body">
            The most powerful protection against scams is healthy scepticism. Pause, verify, and never let urgency override your judgement. Scammers rely on emotion — stay calm and check every claim independently.
          </p>
        </div>
      </div>
    </div>
  );
}
