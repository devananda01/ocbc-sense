const VOICE_LANG = { en: 'en-GB', zh: 'zh-CN', ms: 'ms-MY' }

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speak(text, language = 'en') {
  if (!canSpeak()) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = VOICE_LANG[language] ?? 'en-GB'
  window.speechSynthesis.speak(utterance)
  return true
}
export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel()
}
