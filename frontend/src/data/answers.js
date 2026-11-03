// Pre-written answers for the simulated assistant. They only use the checked
// text in pages.json ("verified_info") and OCBC's published information.
// When the real /api/explain exists, this file is only used as the fallback.
import { getPage } from './content'
import { DOC_TYPES } from './documents'

export const REFUSAL =
  'I can’t skip or change identity checks. I can help you try again, or connect you with a staff member.'

const REFUSE = /\b(skip|bypass|fake|cheat|override|hack|get around)\b/i

// One short hint per step. Shown by the idle timer (Level 1).
export const TIPS = {
  'account.step1': 'Choose your passport country and enter your date of birth. We only use them to check if you can sign up.',
  'account.step2': 'Tick each item once you have it ready: your passport, your national ID and your phone.',
  'account.step3': 'Place your phone flat on the passport cover, keep both still, and remove a thick phone case.',
  'account.step4': 'Use good light and keep all four corners of your ID in view.',
  'account.step5': 'Choose one document from the list, then choose the sample file.',
  'account.step6': 'Follow the red button at the bottom of the screen. Your answers are kept while you work.',
}

const docList = DOC_TYPES.map((d) => d.label).join('; ')

const ANSWERS = {
  'account.step1': [
    {
      q: 'How do I know if my passport is biometric?',
      keys: ['biometric', 'e-passport', 'epassport'],
      standard: 'A biometric passport has a small chip symbol on its cover. This app works with biometric passports from Hong Kong, Malaysia, Indonesia or Mainland China.',
      simple: 'Look for a small chip symbol on the cover of your passport. That means it is biometric.',
    },
    {
      q: 'What can I do if my passport isn’t on the list?',
      keys: ['list', 'supported', 'other passport', 'my country'],
      standard: 'Remote sign-up with an e-passport isn’t available for that passport yet. Tap Talk to a person and a staff member can tell you what your options are.',
      simple: 'You can’t sign up in this app with that passport yet. Ask a staff member what to do next.',
    },
  ],
  'account.step2': [
    {
      q: 'What is NFC?',
      keys: ['what is nfc', 'nfc'],
      standard: 'NFC lets your phone read the chip inside your passport. You need a phone that can read NFC chips.',
      simple: 'NFC lets your phone read the chip in your passport.',
    },
    {
      q: 'How do I check if my phone has NFC?',
      keys: ['phone has', 'check', 'does my phone'],
      standard: 'Look for an NFC option in your phone’s settings. If you can’t find one, your phone may not read NFC chips, and you can try another phone.',
      simple: 'Open your phone’s settings and look for NFC. If it is not there, try another phone.',
    },
  ],
  'account.step3': [
    {
      q: 'Why won’t my passport scan?',
      keys: ['scan', 'won’t', "won't", 'fail', 'not working', 'stopped'],
      standard: 'The app reads the chip inside your passport using NFC. Hold your phone flat against the passport and keep both still until the scan finishes. Removing a thick phone case can help.',
      simple: 'Put your phone flat on your passport. Keep still. Take off a thick phone case.',
    },
    {
      q: 'Where is the chip on my passport?',
      keys: ['where is', 'where’s', 'where on', 'located'],
      standard: 'A biometric passport has a small chip symbol on its cover. Place your phone flat against the passport and move it slowly if the app can’t find the chip.',
      simple: 'Look for the small chip symbol on the cover. Put your phone flat on it.',
    },
    {
      q: 'How do I know if my phone has NFC?',
      keys: ['nfc', 'phone has'],
      standard: 'Look for an NFC option in your phone’s settings. If you can’t find one, your phone may not read NFC chips, and you can try another phone.',
      simple: 'Open your phone’s settings and look for NFC. If it is not there, try another phone.',
    },
  ],
  'account.step4': [
    {
      q: 'Why couldn’t it read my ID?',
      keys: ['read', 'unreadable', 'blurry', 'photo'],
      standard: 'Try again in better light, and keep all four corners of your ID in view.',
      simple: 'Use more light. Keep all 4 corners of your ID in the picture.',
    },
    {
      q: 'What happens with my face photo?',
      keys: ['face', 'selfie', 'photo of me', 'stored', 'saved'],
      standard: 'In this prototype the check is simulated, and no real face or ID images are collected.',
      simple: 'This is a demo. Your face photo is not collected.',
    },
  ],
  'account.step5': [
    {
      q: 'Which documents are accepted?',
      keys: ['which', 'accepted', 'what document', 'qualify'],
      standard: `Accepted documents: ${docList}.`,
      simple: 'Pick one from the list on the screen, like a job offer letter or a bill.',
    },
    {
      q: 'How long do I have to upload them?',
      keys: ['how long', 'deadline', 'when', 'timeframe'],
      standard: 'Use a document dated within the last 3 months. In the real process OCBC asks for it by email after you submit, and you reply within 7 days.',
      simple: 'Use a document from the last 3 months. In real life you have 7 days to send it.',
    },
    {
      q: 'Why was my file rejected?',
      keys: ['rejected', 'reject', 'not accepted', 'unclear', 'failed'],
      standard: 'A file can be turned away if it is hard to read, or if the document isn’t on the accepted list. Upload a clearer copy, or choose a different accepted document.',
      simple: 'The file was blurry, or it is not on the list. Try a clearer file or pick another document.',
    },
  ],
  'account.step6': [
    {
      q: 'What happens after I submit?',
      keys: ['after', 'submit', 'next'],
      standard: 'You get a reference number. After OCBC receives your supporting documents, it may take up to 21 working days to tell you whether your account has been opened.',
      simple: 'You get a reference number. Then OCBC may take up to 21 working days to tell you.',
    },
    {
      q: 'How long until my account is ready?',
      keys: ['how long', 'ready', 'when'],
      standard: 'OCBC may take up to 21 working days after it receives your supporting documents to tell you whether your account has been opened.',
      simple: 'It may take up to 21 working days after OCBC gets your documents.',
    },
  ],
  'account.submitted': [
    {
      q: 'What do I need to do next?',
      keys: ['what do i', 'next', 'need to do'],
      standard: 'Wait for OCBC’s reply. You may need to complete an initial deposit or other follow-up steps. Deposit at least S$3,000 in a single transaction, from a bank account in your own name, within 90 days of account opening.',
      simple: 'Wait for OCBC to reply. You may need to make a first deposit of at least S$3,000.',
    },
    {
      q: 'When will I hear back?',
      keys: ['hear', 'when', 'how long', 'result'],
      standard: 'OCBC may take up to 21 working days after receiving your supporting documents to confirm your account.',
      simple: 'It may take up to 21 working days after OCBC gets your documents.',
    },
  ],
}

export function suggestedQuestions(pageId) {
  return getPage(pageId)?.suggested_questions ?? []
}

export function pageVerifiedInfo(pageId) {
  return getPage(pageId)?.verified_info ?? ''
}

const norm = (t) => t.toLowerCase().replace(/[’‘]/g, "'").trim()

// Mock of POST /api/explain. Returns { answer, fallback } like the real one,
// plus refused: true for requests we must never help with.
export function answerFor(pageId, question, wording = 'standard') {
  const q = norm(question)
  if (REFUSE.test(q)) return { answer: REFUSAL, fallback: false, refused: true }
  const list = ANSWERS[pageId] ?? []
  const hit = list.find((a) => norm(a.q) === q) ?? list.find((a) => a.keys.some((k) => q.includes(norm(k))))
  if (hit) return { answer: hit[wording] ?? hit.standard, fallback: false }
  return { answer: null, fallback: true }
}
