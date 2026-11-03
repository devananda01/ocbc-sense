const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const SUPPORTED = ['HK', 'MY', 'ID', 'CN']
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.status === 204 ? null : res.json()
}

// The backend allows three text sizes today. Our four sizes map onto them
// until your friend adds a fourth, and "layout" is left out until he adds it.
const TEXT_SIZE_TO_API = { default: 'default', large: 'large', xlarge: 'xlarge', larger: 'xlarge', largest: 'xlarge' }

export function toApiPrefs(p) {
  return {
    wording: p.wording,
    text_size: TEXT_SIZE_TO_API[p.textSize] ?? 'default',
    language: p.language,
  }
}

export async function createSession({ preferences }) {
  return request('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ preferences }),
  })
}

export async function patchSession(id, changes) {
  return request(`/api/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })
}

// Only true or false about age is sent. Never the date of birth.
export async function checkEligibility({ passport_country, is_18_or_older }) {
  if (!SUPPORTED.includes(passport_country)) throw new Error('Unsupported passport country')
  return request('/api/eligibility', {
    method: 'POST',
    body: JSON.stringify({ passport_country, is_18_or_older }),
  })
}

// Journey analytics are sent to the backend through Socket.IO. Local listeners
// remain for the adaptive-assistance logic; only the documented event fields
// are sent to the server (detail stays local and is never persisted).
const listeners = new Set()
let socketPromise
async function getSocket() {
  if (!socketPromise) {
    socketPromise = import('socket.io-client').then(({ io }) => io(BASE, { transports: ['websocket', 'polling'] }))
  }
  return socketPromise
}
export function subscribeEvents(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export function logEvent(sessionId, pageId, type, detail = {}) {
  if (!sessionId || !pageId || !type) return
  if (import.meta.env.DEV) console.debug('[event]', { sessionId, pageId, type, detail })
  listeners.forEach((fn) => fn({ sessionId, pageId, type, detail }))
  getSocket().then((socket) => {
    const eventType = type === 'error' ? `error:${detail.code ?? 'UNKNOWN'}` : type === 'friction' ? `friction:${detail.trigger ?? 'long_pause'}` : type
    const allowed = /^(page_view|friction:(long_pause|back_and_forth|repeated_errors)|offer_accepted|offer_declined|language_change:[a-z]{2}|wording_change:(simple|standard)|text_size_change:(default|large|xlarge)|error:[A-Z0-9_]+|journey_complete|journey_abandon)$/.test(eventType)
    if (!allowed) return
    const payload = { session_id: sessionId, page_id: pageId, type: eventType }
    const send = () => socket.emit('event', payload, (ack) => {
        if (!ack?.ok) console.error('Journey event was not saved:', ack?.error ?? 'unknown error')
      })
    if (socket.connected) send()
    else socket.once('connect', send)
  }).catch((error) => console.error('Could not connect journey event socket:', error))
}

export async function submitApplication(sessionId) {
  return request('/api/applications', { method: 'POST', body: JSON.stringify({ session_id: sessionId }) })
}

