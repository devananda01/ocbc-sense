import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, Smartphone, X } from 'lucide-react'
import StepScreen from '../components/StepScreen'
import StatusBanner from '../components/StatusBanner'
import Card from '../components/Card'
import Button from '../components/Button'
import NfcArt from '../components/NfcArt'
import { usePreferences } from '../context/PreferencesContext'
import { useJourney } from '../context/JourneyContext'
import { usePresenter } from '../context/PresenterContext'
import { useHelp } from '../context/HelpContext'
import usePageView from '../hooks/usePageView'
import { getPage, pageText } from '../data/content'
import { simulateNfcScan } from '../api/simulate'
import { logEvent } from '../api/client'

const FAILURES = {
  NFC_NOT_SUPPORTED: {
    label: 'Scan failed',
    text: 'This phone can’t read passport chips. Try another phone with NFC.',
    tip: 'Use a phone with NFC and a camera, or talk to a staff member.',
  },
  NFC_CHIP_NOT_FOUND: {
    label: 'Scan failed',
    text: 'We couldn’t find the chip. Move your phone slowly over the passport.',
    tip: 'Place your phone flat on the passport cover, keep both still, and remove a thick phone case.',
  },
  NFC_READ_FAILED: {
    label: 'Scan stopped',
    text: 'The scan stopped before it finished. Keep your phone still and try again.',
    tip: 'Hold your phone flat against the passport and keep both still until the scan finishes.',
  },
}

export default function Step3() {
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const { sessionId, done, attempts, markDone, recordAttempt } = useJourney()
  const { scenarios } = usePresenter()
  const { openHelp } = useHelp()
  const page = getPage('account.step3', prefs.language)
  usePageView('account.step3')

  const [phase, setPhase] = useState(done.nfc ? 'success' : 'ready') // ready | scanning | failed | success
  const [errorCode, setErrorCode] = useState(null)
  const runId = useRef(0)

  // If the customer leaves while a scan is running, ignore its result.
  useEffect(() => () => { runId.current += 1 }, [])

  async function startScan() {
    const id = ++runId.current
    setPhase('scanning')
    const attempt = attempts.nfc
    recordAttempt('nfc')
    const result = await simulateNfcScan(scenarios.nfc, attempt)
    if (id !== runId.current) return
    if (result.ok) {
      markDone('nfc')
      setPhase('success')
    } else {
      logEvent(sessionId, 'account.step3', 'error', { code: result.code })
      setErrorCode(result.code)
      setPhase('failed')
    }
  }

  function cancelScan() {
    runId.current += 1
    setPhase('ready')
  }

  function scanAgain() {
    markDone('nfc', false)
    setPhase('ready')
  }

  const frame = (footer, body) => (
    <StepScreen step={3} onBack={() => navigate('/step/2')} footer={footer}>
      {body}
    </StepScreen>
  )
  const intro = <p className="step__intro">{pageText(page, prefs.wording)}</p>

  if (phase === 'scanning') {
    return frame(
      <Button variant="secondary" onClick={cancelScan}>
        <X size={18} aria-hidden="true" /> Cancel scan
      </Button>,
      <>
        <h1 className="step__title">Reading your passport…</h1>
        {intro}
        <Card className="art-card"><NfcArt scanning /></Card>
        <StatusBanner variant="loading" label="Keep your phone still. This takes a few seconds." />
      </>
    )
  }

  if (phase === 'success') {
    return frame(
      <>
        <Button onClick={() => navigate('/step/4')}>Continue →</Button>
        <Button variant="tertiary" onClick={scanAgain}>Scan again</Button>
      </>,
      <>
        <h1 className="step__title">{page.title}</h1>
        <StatusBanner variant="success" label="Passport read">
          We read your passport chip. This is simulated. No real passport data is collected.
        </StatusBanner>
      </>
    )
  }

  if (phase === 'failed') {
    const failure = FAILURES[errorCode] ?? FAILURES.NFC_READ_FAILED
    return frame(
      <>
        <Button onClick={startScan}>
          <RotateCcw size={18} aria-hidden="true" /> Try again
        </Button>
        <Button variant="secondary" onClick={openHelp}>Talk to a staff member</Button>
      </>,
      <>
        <h1 className="step__title">{page.title}</h1>
        {intro}
        <StatusBanner variant="error" label={failure.label}>
          {failure.text} Your information is saved.
        </StatusBanner>
        <StatusBanner variant="tip" label="Try this">{failure.tip}</StatusBanner>
      </>
    )
  }

  return frame(
    <Button onClick={startScan}>
      <Smartphone size={20} aria-hidden="true" /> Start scan
    </Button>,
    <>
      <h1 className="step__title">{page.title}</h1>
      {intro}
      <Card className="art-card">
        <NfcArt />
        <p className="step__caption">
          Keep both still until the scan finishes. Removing a thick phone case can help.
        </p>
      </Card>
    </>
  )
}