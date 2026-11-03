import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Dialog from '../components/Dialog'
import { useJourney } from './JourneyContext'
import { usePreferences } from './PreferencesContext'
import { usePresenter } from './PresenterContext'
import { logEvent, patchSession, subscribeEvents, toApiPrefs } from '../api/client'
import { startStaffSimulation } from '../api/simulate'
import { getPage } from '../data/content'
import { answerFor, pageVerifiedInfo } from '../data/answers'
import { speak } from '../utils/speech'
import MenuSheet from '../assistance/MenuSheet'
import ChatSheet from '../assistance/ChatSheet'
import ConsentSheet from '../assistance/ConsentSheet'
import StaffSheet from '../assistance/StaffSheet'
import OfferCard from '../assistance/OfferCard'
import StaffStatusBar from '../assistance/StaffStatusBar'
import '../assistance/assistance.css'

// Real timers follow the data design (45 s). Demo timers are used when the
// page was opened with ?presenter=1.
const REAL = { offer: 45_000, tip: 180_000, glow: 360_000 }
const DEMO = { offer: 10_000, tip: 20_000, glow: 40_000 }

const HelpContext = createContext({
  openHelp: () => {},
  openChat: () => {},
  openStaff: () => {},
  level: 0,
  pageId: null,
})

function pageIdFor(pathname) {
  const m = pathname.match(/^\/step\/(\d)$/)
  if (m) return `account.step${m[1]}`
  if (['/submitted', '/next', '/home'].includes(pathname)) return 'account.submitted'
  return null
}
const stepOf = (id) => (id?.startsWith('account.step') ? Number(id.slice(-1)) : null)
const clock = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

let uid = 0
const nextId = (p) => `${p}${(uid += 1)}`

export function HelpProvider({ children }) {
  const { pathname } = useLocation()
  const { sessionId } = useJourney()
  const { prefs } = usePreferences()
  const { enabled: demo, scenarios } = usePresenter()
  const T = demo ? DEMO : REAL

  const pageId = pageIdFor(pathname)
  const step = stepOf(pageId)
  const page = pageId ? getPage(pageId) : null

  const [sheet, setSheet] = useState(null) // null | menu | chat | consent | staff
  const [offer, setOffer] = useState(null) // null | { id, trigger }
  const [level, setLevel] = useState(0) // 0 none, 1 tip banner, 2 glow + arrow
  const [messages, setMessages] = useState([])
  const [asking, setAsking] = useState(false)
  const [staff, setStaff] = useState({ status: 'idle', position: 0, messages: [], unread: false })

  // Latest values for timers and event listeners.
  const live = useRef({})
  live.current = { pageId, step, sessionId, sheet, offer, staffStatus: staff.status, prefs, scenarios }

  const handled = useRef(new Set()) // pages where the offer was answered
  const suppressAll = useRef(false)
  const usedTip = useRef(false)
  const usedChat = useRef(false)
  const errors = useRef({ count: 0, last: 0, code: null })
  const lastErrorByPage = useRef({})
  const backs = useRef({})
  const prevStep = useRef(null)
  const pausedOn = useRef(null)
  const stopStaff = useRef(null)
  const handoffId = useRef(null)
  const requestedAt = useRef(0)
  const acceptedAt = useRef(0)

  const log = useCallback((type, detail = {}, id) => {
    const { sessionId: s, pageId: p } = live.current
    if (s) logEvent(s, id ?? p, type, detail)
  }, [])

  const staffActive = staff.status === 'waiting' || staff.status === 'joined'

  // ---- Offer of help
  const maybeOffer = useCallback(
    (trigger) => {
      const c = live.current
      if (!c.sessionId || !c.step) return
      if (suppressAll.current || handled.current.has(c.pageId)) return
      if (c.offer || c.sheet || c.staffStatus === 'waiting' || c.staffStatus === 'joined') return
      const id = nextId('o')
      setOffer({ id, trigger })
      logEvent(c.sessionId, c.pageId, 'offer_shown', { offer_id: id, trigger })
    },
    []
  )

  // ---- New page: reset per-page counters, count returns to a step
  useEffect(() => {
    setOffer(null)
    setLevel(0)
    setMessages([])
    errors.current = { count: 0, last: 0, code: null }
    pausedOn.current = null
    const c = live.current
    const from = prevStep.current
    if (c.sessionId && step && from && from > step) {
      logEvent(c.sessionId, `account.step${from}`, 'back')
      backs.current[step] = (backs.current[step] ?? 0) + 1
      if (backs.current[step] === 2) {
        logEvent(c.sessionId, c.pageId, 'friction', { trigger: 'back_and_forth' })
        maybeOffer('back_and_forth')
      }
    }
    prevStep.current = step
  }, [pageId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist preference changes made during an active journey. The backend
  // accepts only current_preferences; DOB, passport and contact details stay local.
  const previousPrefs = useRef(null)
  useEffect(() => {
    if (!sessionId) { previousPrefs.current = prefs; return }
    if (previousPrefs.current === null) { previousPrefs.current = prefs; return }
    if (JSON.stringify(previousPrefs.current) === JSON.stringify(prefs)) return
    previousPrefs.current = prefs
    patchSession(sessionId, { current_preferences: toApiPrefs(prefs) }).catch((error) => {
      console.error('Could not save preferences:', error)
    })
  }, [sessionId, prefs])

  // A new journey starts with a clean slate.
  useEffect(() => {
    handled.current = new Set()
    suppressAll.current = false
    backs.current = {}
    lastErrorByPage.current = {}
    usedTip.current = false
    usedChat.current = false
    prevStep.current = null
  }, [sessionId])

  // ---- Repeated errors: the same step fails twice
  useEffect(
    () =>
      subscribeEvents((e) => {
        if (e.type !== 'error') return
        lastErrorByPage.current[e.pageId] = e.detail?.code ?? null
        if (e.pageId !== live.current.pageId) return
        const now = Date.now()
        // Several field errors from one tap count once.
        if (now - errors.current.last < 600) return
        errors.current.last = now
        errors.current.count += 1
        if (errors.current.count === 2) {
          logEvent(e.sessionId, e.pageId, 'friction', { trigger: 'repeated_errors' })
          maybeOffer('repeated_errors')
        }
      }),
    [maybeOffer]
  )

  // ---- Idle timers: no tap or key press for a while
  useEffect(() => {
    if (!sessionId || !step || sheet) return undefined
    let t1, t2, t3
    const arm = () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      t1 = setTimeout(() => {
        if (pausedOn.current !== live.current.pageId) {
          pausedOn.current = live.current.pageId
          log('friction', { trigger: 'long_pause' })
        }
        maybeOffer('long_pause')
      }, T.offer)
      t2 = setTimeout(() => setLevel((l) => Math.max(l, 1)), T.tip)
      t3 = setTimeout(() => setLevel(2), T.glow)
    }
    const poke = () => {
      setLevel((l) => (l > 1 ? 1 : l))
      arm()
    }
    const names = ['pointerdown', 'keydown', 'input', 'touchstart']
    names.forEach((n) => window.addEventListener(n, poke, true))
    arm()
    return () => {
      names.forEach((n) => window.removeEventListener(n, poke, true))
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [sessionId, step, pageId, sheet, T.offer, T.tip, T.glow, log, maybeOffer])

  // Log the first time a tip banner is shown.
  useEffect(() => {
    if (level >= 1) usedTip.current = true
  }, [level])

  // ---- Sheets
  const closeSheet = useCallback(() => {
    setSheet(null)
    setStaff((s) => (s.unread ? { ...s, unread: false } : s))
  }, [])
  const openHelp = useCallback(() => {
    setOffer(null)
    setSheet(live.current.staffStatus === 'idle' ? 'menu' : 'staff')
  }, [])
  const openChat = useCallback(() => {
    setOffer(null)
    setSheet('chat')
  }, [])
  const openStaff = useCallback(() => {
    setOffer(null)
    setSheet(live.current.staffStatus === 'idle' || live.current.staffStatus === 'resolved' ? 'consent' : 'staff')
  }, [])

  // ---- Offer buttons
  const offerChat = () => {
    log('offer_accepted', { offer_id: offer.id, choice: 'ai' })
    handled.current.add(pageId)
    openChat()
  }
  const offerStaff = () => {
    log('offer_accepted', { offer_id: offer.id, choice: 'person' })
    handled.current.add(pageId)
    openStaff()
  }
  const offerNo = (never = false) => {
    log('offer_declined', { offer_id: offer.id })
    handled.current.add(pageId)
    if (never) suppressAll.current = true
    setOffer(null)
  }

  // ---- Assistant chat
  const ask = useCallback(
    async (text) => {
      const question = text.trim().slice(0, 300)
      const c = live.current
      if (!question || asking || !c.pageId) return
      usedChat.current = true
      setMessages((m) => [...m, { id: nextId('m'), from: 'user', text: question, time: clock() }])
      setAsking(true)
      // AI is intentionally simulated in this prototype; no backend request is made.
      await new Promise((resolve) => setTimeout(resolve, 650))
      const res = answerFor(c.pageId, question, c.prefs.wording)
      setAsking(false)
      if (c.pageId !== live.current.pageId) return // customer moved on
      const fallback = res.fallback || !res.answer
      const answer = fallback
        ? `I can’t answer that one reliably. Here is what we know about this step: ${pageVerifiedInfo(c.pageId)}`
        : res.answer
      if (fallback && c.sessionId) logEvent(c.sessionId, c.pageId, 'ai_question', { outcome: 'fallback' })
      if (c.prefs.readAloud) speak(answer, c.prefs.language)
      setMessages((m) => [
        ...m,
        { id: nextId('m'), from: 'bot', text: answer, time: clock(), fallback, refused: !!res.refused, feedback: null },
      ])
    },
    [asking]
  )

  const rate = (id, outcome) => {
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, feedback: outcome } : x)))
    log('ai_question', { outcome })
    if (outcome === 'not_helped' && live.current.sessionId && live.current.step) openStaff()
  }

  // ---- Staff help (text only)
  const share = useMemo(() => {
    const code = lastErrorByPage.current[pageId] ?? null
    return {
      step_no: step,
      step_title: page?.title ?? '',
      preferences: {
        wording: prefs.wording,
        text_size: prefs.textSize,
        voice: prefs.readAloud ? 'read_aloud' : 'off',
        language: prefs.language,
      },
      offers: usedChat.current ? ['ai'] : [],
      tried: { tip: usedTip.current, chat: usedChat.current },
      last_error: code,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet, pageId, step, page, prefs])

  const sendRequest = () => {
    const c = live.current
    stopStaff.current?.()
    handoffId.current = nextId('h')
    requestedAt.current = Date.now()
    logEvent(c.sessionId, c.pageId, 'handoff_request', { handoff_id: handoffId.current })
    setStaff({ status: 'waiting', position: 2, messages: [], unread: false })
    setSheet('staff')
    stopStaff.current = startStaffSimulation(c.scenarios.staff, c.pageId, {
      onPosition: (position) => setStaff((s) => ({ ...s, position })),
      onAccepted: () => {
        acceptedAt.current = Date.now()
        logEvent(c.sessionId, c.pageId, 'handoff_accepted', {
          handoff_id: handoffId.current,
          wait_s: Math.round((Date.now() - requestedAt.current) / 1000),
        })
        setStaff((s) => ({ ...s, status: 'joined', unread: live.current.sheet !== 'staff' }))
      },
      onMessage: (text) => {
        if (live.current.prefs.readAloud) speak(text, live.current.prefs.language)
        setStaff((s) => ({
          ...s,
          messages: [...s.messages, { id: nextId('s'), text, time: clock() }],
          unread: live.current.sheet !== 'staff',
        }))
      },
      onResolved: () => {
        logEvent(c.sessionId, c.pageId, 'handoff_resolved', {
          handoff_id: handoffId.current,
          resolve_s: Math.round((Date.now() - acceptedAt.current) / 1000),
        })
        setStaff((s) => ({ ...s, status: 'resolved', unread: live.current.sheet !== 'staff' }))
      },
    })
  }

  const endStaff = () => {
    stopStaff.current?.()
    stopStaff.current = null
    setStaff({ status: 'idle', position: 0, messages: [], unread: false })
    setSheet(null)
  }

  useEffect(() => () => stopStaff.current?.(), [])

  // Leaving the journey ends any open request.
  useEffect(() => {
    if (!sessionId && stopStaff.current) endStaff()
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({ openHelp, openChat, openStaff, level, pageId }),
    [openHelp, openChat, openStaff, level, pageId]
  )

  const titles = {
    menu: 'How can we help?',
    chat: 'Assistant',
    consent: 'Share a summary with our team?',
    staff: 'Staff help',
  }

  return (
    <HelpContext.Provider value={value}>
      {children}

      {offer && !sheet && (
        <OfferCard
          trigger={offer.trigger}
          onChat={offerChat}
          onStaff={offerStaff}
          onNo={() => offerNo(false)}
          onNever={() => offerNo(true)}
        />
      )}

      {staffActive || staff.status === 'resolved' ? (
        sheet !== 'staff' && <StaffStatusBar staff={staff} onOpen={() => { setSheet('staff'); setStaff((s) => ({ ...s, unread: false })) }} />
      ) : null}

      <Dialog
        open={sheet !== null}
        onClose={closeSheet}
        title={titles[sheet] ?? ''}
        className={sheet === 'chat' || sheet === 'staff' ? 'dialog--tall' : ''}
      >
        {sheet === 'menu' && (
          <MenuSheet
            canStaff={!!sessionId && !!step}
            onChat={openChat}
            onStaff={openStaff}
            onClose={closeSheet}
          />
        )}
        {sheet === 'chat' && (
          <ChatSheet
            title={page?.title}
            pageId={pageId}
            messages={messages}
            asking={asking}
            canStaff={!!sessionId && !!step}
            onAsk={ask}
            onRate={rate}
            onStaff={openStaff}
          />
        )}
        {sheet === 'consent' && <ConsentSheet share={share} onShare={sendRequest} onBack={() => setSheet('menu')} />}
        {sheet === 'staff' && <StaffSheet staff={staff} onCancel={endStaff} onClose={closeSheet} />}
      </Dialog>
    </HelpContext.Provider>
  )
}

export function useHelp() {
  return useContext(HelpContext)
}
