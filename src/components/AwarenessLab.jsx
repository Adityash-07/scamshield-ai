import { useState } from 'react';
import './AwarenessLab.css';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    scenario: 'You receive this SMS: "URGENT: Your SBI account has been SUSPENDED due to incomplete KYC. Verify immediately at http://sbi-kyc-now.xyz or your account will be permanently blocked. Share your OTP and net banking password."',
    label: 'Simulated scenario — KYC Phishing SMS',
    options: ['This is a legitimate SBI alert — I should verify now.', 'This is a scam — multiple red flags are present.'],
    correct: 1,
    explanation: 'This message is a scam. Red flags: (1) Urgency + threat of "permanent" block. (2) A fake domain (sbi-kyc-now.xyz). (3) Asking for an OTP and net banking password — no legitimate bank ever does this. Always access your bank through its official app or website.',
  },
  {
    id: 2,
    scenario: '"Congratulations! You have won ₹25 Lakh in the Reliance Jio Lucky Draw! To claim your prize, pay a ₹1,500 processing fee to our agent at jio_prize@gmail.com within 24 hours."',
    label: 'Simulated scenario — Lottery Prize Scam',
    options: ['I should pay the fee quickly so the prize doesn\'t expire.', 'This is a scam — legitimate prizes never require upfront fees.'],
    correct: 1,
    explanation: 'This is a classic advance-fee scam. You cannot win a prize you did not enter. Real prize-giving organisations never ask for an upfront fee — they deduct taxes after the fact. The free email address for a ₹25 Lakh payment is another clear giveaway.',
  },
  {
    id: 3,
    scenario: '"Hi, this is a reminder from Dr. Kapoor\'s clinic. Your appointment is confirmed for Tuesday 14th at 11:00 AM. Reply YES to confirm or call 98XXXXXX to reschedule."',
    label: 'Simulated scenario — Appointment Reminder',
    options: ['This could be a scam — I should ignore it.', 'This looks like a legitimate appointment reminder.'],
    correct: 1,
    explanation: 'This is a legitimate appointment reminder. There is no urgency, no request for money or credentials, no suspicious link, and no threat. The call-to-action is simply to confirm or reschedule — exactly what a real clinic SMS looks like.',
  },
  {
    id: 4,
    scenario: '"HIRING! Work from home and earn ₹40,000/day. No experience needed. Just pay ₹499 registration fee to activate your account. 100% guaranteed daily income. Limited spots — apply now!"',
    label: 'Simulated scenario — Fake Job Offer',
    options: ['Earning ₹40,000/day sounds realistic — I should try it.', 'This is a job scam — legitimate employers never charge registration fees.'],
    correct: 1,
    explanation: 'Legitimate employers never charge you to work for them. The guarantee of ₹40,000/day with no experience is unrealistic. The ₹499 fee is the scam\'s profit mechanism — once paid, either nothing happens or you\'re asked for more money.',
  },
  {
    id: 5,
    scenario: '"Main CBI officer bol raha hoon. Aapke naam pe drug parcel pakda gaya hai. Abhi ₹50,000 send karein nahin toh girftari warrant issue ho jayega. Yeh case turant settle karna hoga."',
    label: 'Simulated scenario — Government Impersonation (Hindi)',
    options: ['I should pay immediately to avoid arrest.', 'This is a scam — government agencies do not demand money via phone.'],
    correct: 1,
    explanation: 'Government agencies (CBI, police, customs) never call to demand immediate payment to avoid arrest. This is a fear-based social engineering scam targeting Hindi speakers. Hang up immediately and do not engage. If genuinely concerned, call the official helpline.',
  },
  {
    id: 6,
    scenario: '"Your parcel (Tracking: DHL-IN9482) is held at customs. Pay ₹1,199 customs duty at http://dhlindia-parcel.xyz/pay within 2 hours to avoid package return and a ₹10,000 penalty."',
    label: 'Simulated scenario — Courier/Customs Scam',
    options: ['I should pay the customs fee — it sounds official.', 'This is suspicious — I should verify directly with DHL\'s official website.'],
    correct: 1,
    explanation: 'Real courier companies send customs notices through official channels and never use unofficial .xyz domains. Always verify by visiting the courier\'s official website (dhl.com) and entering the tracking number yourself, rather than clicking links in SMS messages.',
  },
  {
    id: 7,
    scenario: '"Hi! I came across your profile. I am a successful crypto trader based in Dubai. I can help you earn ₹50,000 weekly through our proven trading signals. It\'s completely risk-free. Let\'s chat privately."',
    label: 'Simulated scenario — Investment/Romance Scam',
    options: ['A Dubai trader helping me invest sounds like a good opportunity.', 'This is an investment/romance scam approach — I should not engage.'],
    correct: 1,
    explanation: 'Unsolicited contact from a "successful trader" promising risk-free returns is a well-documented scam pattern. "Risk-free" guaranteed returns do not exist in any legitimate investment. Engaging leads to requests for money, typically escalating to large amounts before the scammer disappears.',
  },
  {
    id: 8,
    scenario: '"Your Amazon order #402-8473891 has been delayed. To reschedule delivery, visit the Amazon app or amazon.com and check your orders. No action needed if you prefer automatic rescheduling."',
    label: 'Simulated scenario — Legitimate Delivery Notice',
    options: ['This looks like a phishing attempt.', 'This appears to be a legitimate delivery notice — no action is urgently required.'],
    correct: 1,
    explanation: 'This is a legitimate-style delivery notice. It directs you to the official Amazon app or amazon.com (not a suspicious link), uses a realistic order number format, and does not demand money, credentials, or urgent action. It even offers a no-action option.',
  },
];

function ResultIcon({ correct }) {
  return correct ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function AwarenessLab() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});  // { questionId: selectedIndex }
  const [submitted, setSubmitted] = useState({});  // { questionId: true }
  const [finished, setFinished] = useState(false);

  const q = QUIZ_QUESTIONS[current];
  const selectedAnswer = answers[q.id];
  const isSubmitted = submitted[q.id];
  const isLast = current === QUIZ_QUESTIONS.length - 1;

  function handleSelect(idx) {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
  }

  function handleSubmit() {
    if (selectedAnswer === undefined) return;
    setSubmitted((prev) => ({ ...prev, [q.id]: true }));
  }

  function handleNext() {
    if (isLast) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  function handleRetry() {
    setCurrent(0);
    setAnswers({});
    setSubmitted({});
    setFinished(false);
  }

  const score = Object.entries(submitted).filter(([id]) => {
    const qItem = QUIZ_QUESTIONS.find((q) => q.id === parseInt(id));
    return qItem && answers[qItem.id] === qItem.correct;
  }).length;

  if (finished) {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="lab-page page-content">
        <div className="page-header">
          <h1 className="page-title">Scam Awareness Lab</h1>
        </div>
        <div className="lab-results-card">
          <div className={`lab-score-circle ${pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'danger'}`}>
            <span className="lab-score-num">{pct}%</span>
            <span className="lab-score-sub">{score}/{QUIZ_QUESTIONS.length}</span>
          </div>
          <h2 className="lab-result-title">
            {pct === 100 && 'Perfect Score! Excellent awareness.'}
            {pct >= 75 && pct < 100 && 'Great job! Strong scam awareness.'}
            {pct >= 50 && pct < 75 && 'Good effort. Review the explanations to strengthen your skills.'}
            {pct < 50 && 'Keep learning. Scams can be sophisticated — review the explanations below.'}
          </h2>
          <p className="lab-result-sub">
            You correctly identified {score} out of {QUIZ_QUESTIONS.length} scenarios.
          </p>
          <button className="btn-primary" onClick={handleRetry}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/>
            </svg>
            Try Again
          </button>

          {/* Review all */}
          <div className="lab-review">
            <h3 className="lab-review-title">Review All Answers</h3>
            {QUIZ_QUESTIONS.map((qItem) => {
              const selected = answers[qItem.id];
              const correct = selected === qItem.correct;
              return (
                <div key={qItem.id} className={`review-item ${correct ? 'correct' : 'incorrect'}`}>
                  <div className="review-header">
                    <ResultIcon correct={correct} />
                    <p className="review-label">{qItem.label}</p>
                  </div>
                  <p className="review-scenario">{qItem.scenario.slice(0,100)}…</p>
                  <p className="review-explanation">{qItem.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lab-page page-content">
      <div className="page-header">
        <h1 className="page-title">Scam Awareness Lab</h1>
        <p className="page-subtitle">
          Test your ability to identify scams and legitimate messages.
          All scenarios are <strong>simulated training examples</strong> — not real messages.
        </p>
      </div>

      {/* Progress */}
      <div className="lab-progress-wrap" aria-label={`Question ${current + 1} of ${QUIZ_QUESTIONS.length}`}>
        <div className="lab-progress-track">
          <div className="lab-progress-fill" style={{ width: `${((current + 1) / QUIZ_QUESTIONS.length) * 100}%` }} />
        </div>
        <span className="lab-progress-label">{current + 1} / {QUIZ_QUESTIONS.length}</span>
      </div>

      {/* Question card */}
      <div className="lab-question-card">
        <div className="lab-q-header">
          <span className="lab-q-num">Q{current + 1}</span>
          <span className="lab-q-training-badge">Simulated Training Scenario</span>
        </div>

        <div className="lab-scenario-box">
          <p className="lab-scenario-text">"{q.scenario}"</p>
          <p className="lab-scenario-label">{q.label}</p>
        </div>

        <p className="lab-prompt">How would you classify this message?</p>

        <div className="lab-options" role="radiogroup" aria-label="Answer options">
          {q.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = q.correct === idx;
            let optClass = 'lab-option';
            if (isSubmitted) {
              if (isCorrect) optClass += ' correct';
              else if (isSelected) optClass += ' wrong';
            } else if (isSelected) {
              optClass += ' selected';
            }
            return (
              <button
                key={idx}
                className={optClass}
                onClick={() => handleSelect(idx)}
                disabled={isSubmitted}
                role="radio"
                aria-checked={isSelected}
              >
                <span className="lab-option-letter">{String.fromCharCode(65 + idx)}</span>
                <span>{opt}</span>
                {isSubmitted && isCorrect && (
                  <svg className="lab-option-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
                {isSubmitted && isSelected && !isCorrect && (
                  <svg className="lab-option-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {isSubmitted && (
          <div className={`lab-feedback ${answers[q.id] === q.correct ? 'correct' : 'incorrect'}`} role="alert">
            <ResultIcon correct={answers[q.id] === q.correct} />
            <div>
              <p className="lab-feedback-verdict">
                {answers[q.id] === q.correct ? 'Correct!' : 'Not quite.'}
              </p>
              <p className="lab-feedback-exp">{q.explanation}</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="lab-actions">
          {!isSubmitted ? (
            <button
              className="analyse-btn"
              onClick={handleSubmit}
              disabled={selectedAnswer === undefined}
            >
              Submit Answer
            </button>
          ) : (
            <button className="analyse-btn" onClick={handleNext}>
              {isLast ? 'See Results' : 'Next Question →'}
            </button>
          )}
          <span className="lab-skip-hint">
            Score so far: {Object.values(submitted).length > 0 ? score : 0} / {Object.values(submitted).length} answered
          </span>
        </div>
      </div>
    </div>
  );
}
