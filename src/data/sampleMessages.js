/**
 * sampleMessages.js
 * Curated sample messages for the ScamShield AI demo.
 * Re-exports analyzeMessage from detectionEngine so existing callers
 * keep working with a single import path.
 */

export { analyzeMessage, ANALYSIS_DISCLAIMER } from './detectionEngine.js';

export const SAMPLE_MESSAGES = [
  {
    label: 'Prize Scam',
    text: "CONGRATULATIONS! You've been selected as today's WINNER of ₹50,00,000 cash prize! Click here immediately to claim your reward before it expires: http://prize-claim-now.xyz/win?ref=4829. Verify your Aadhaar and bank details to receive funds within 24 hours. LIMITED TIME OFFER — act NOW!",
  },
  {
    label: 'Bank KYC Phishing',
    text: "Dear Customer, your HDFC Bank account has been SUSPENDED due to incomplete KYC. Update your KYC immediately at http://hdfc-kyc-update.net or your account will be permanently blocked. Share your account number, OTP, and net banking password to restore access.",
  },
  {
    label: 'Tech Support Scam',
    text: "WARNING: Your computer has been infected with 3 viruses! Call our Microsoft Certified technicians IMMEDIATELY at 1-800-555-0199. Do NOT turn off your computer. We have detected unauthorized access to your personal files. Call NOW to prevent data loss and identity theft!",
  },
  {
    label: 'Advance-Fee Fraud',
    text: "Dear Friend, I am Barrister James Okafor, personal attorney to late Mr. Heinrich Müller who died without a next of kin. I write to seek your partnership in transferring $7.5 million USD. This transaction is 100% risk free and you will receive 40% of the total sum. Reply with full details to proceed.",
  },
  {
    label: 'Fake Job Offer',
    text: "HIRING NOW — Work from home! Earn ₹15,000–₹50,000/day with no experience needed! Just send a ₹999 registration fee to unlock your account and we will deposit ₹5,000 daily. 100% guaranteed income. Limited spots available. Pay to: johnjobs_payments@gmail.com",
  },
  {
    label: 'OTP Theft',
    text: "Namaskar! Main SBI bank se bol raha hoon. Aapke account mein suspicious activity detect hui hai. Aapka account band ho sakta hai. Abhi apna OTP share karein: 7284XX. Yeh process 10 minute mein complete karna hai. Turant jawab dein.",
  },
  {
    label: 'Investment Scam',
    text: "Hi! I am a successful crypto trader. I can help you double your money in 7 days with our guaranteed high-return forex trading signals. Minimum investment ₹10,000. 100% risk-free returns. Only 5 spots left — apply immediately! Send payment to: invest_profit@gmail.com",
  },
  {
    label: 'Courier Scam',
    text: "CUSTOMS NOTICE: Your international parcel (tracking: IN8472XX) has been detained at customs. Pay ₹1,499 customs release fee within 24 hours to avoid seizure. Click: http://customsclearance-in.xyz/release. FIR will be filed if payment is not made.",
  },
  {
    label: 'Legitimate Message',
    text: "Hi Priya, this is a reminder that your dental appointment with Dr. Mehta is scheduled for Thursday, 15th at 3:00 PM. Please call 98XXXXXX12 to confirm or reschedule. See you soon!",
  },
];
