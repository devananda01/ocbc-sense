import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Check, RotateCcw } from 'lucide-react'
import StepScreen from '../components/StepScreen'
import StatusBanner from '../components/StatusBanner'
import Card from '../components/Card'
import Button from '../components/Button'
import CameraView from '../components/CameraView'
import { usePreferences } from '../context/PreferencesContext'
import { useJourney } from '../context/JourneyContext'
import { usePresenter } from '../context/PresenterContext'
import { useHelp } from '../context/HelpContext'
import usePageView from '../hooks/usePageView'
import { getPage } from '../data/content'
import { simulateFaceCheck, simulateIdPhoto } from '../api/simulate'
import { logEvent } from '../api/client'

const COPY = {
  id: {
    part: 'Part 1 of 2 · National ID card',
    standard: 'Take a photo of your national ID card.',
    simple: 'Take a photo of your ID card.',
    hint: 'Place your ID card inside the frame',
    caption: 'Use good light and avoid glare.',
  },
  face: {
    part: 'Part 2 of 2 · Face check',
    standard: 'Look at the camera and keep your face inside the oval.',
    simple: 'Look at the camera. Keep your face in the oval.',
    hint: 'Position your face here',
    caption: 'This is simulated. No real face data is collected.',
  },
}

const FAILURE = {
  id: {
    label: 'Photo not clear',
    text: 'We couldn’t read your ID. Try again in better light.',
    tip: 'Move to a brighter spot, avoid glare and keep the whole card in the frame.',
  },
  face: {
    label: 'Face check not matched',
    text: 'We couldn’t confirm it’s you. Try again, or talk to a staff member.',
    tip: 'Face the light, take off glasses or a hat, and look straight at the camera.',
  },
}

export default function Step4() {
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const { sessionId, done, attempts, markDone, recordAttempt } = useJourney()
  const { scenarios } = usePresenter()
  const { openHelp } = useHelp()
  const page = getPage('account.step4', prefs.language)
  usePageView('account.step4')

  // id | idError | selfie | selfieError | checking | success
  const [stage, setStage] = useState(done.face ? 'success' : done.id ? 'selfie' : 'id')
  const [busy, setBusy] = useState(false)
  const runId = useRef(0)

  useEffect(() => () => { runId.current += 1 }, [])

  const wording = prefs.wording === 'simple' ? 'simple' : 'standard'

  async function takeIdPhoto() {
    const id = ++runId.current
    setStage('id')
    setBusy(true)
    const attempt = attempts.id
    recordAttempt('id')
    const result = await simulateIdPhoto(scenarios.id, attempt)
    if (id !== runId.current) return
    setBusy(false)
    if (result.ok) {
      markDone('id')
      setStage('selfie')
    } else {
      logEvent(sessionId, 'account.step4', 'error', { code: result.code })
      setStage('idError')
    }
  }

  async function takeSelfie() {
    const id = ++runId.current
    setStage('checking')
    const attempt = attempts.face
    recordAttempt('face')
    const result = await simulateFaceCheck(scenarios.face, attempt)
    if (id !== runId.current) return
    if (result.ok) {
      markDone('face')
      setStage('success')
    } else {
      logEvent(sessionId, 'account.step4', 'error', { code: result.code })
      setStage('selfieError')
    }
  }

  function cancelCheck() {
    runId.current += 1
    setStage('selfie')
  }

  const frame = (footer, body) => (
    <StepScreen step={4} onBack={() => navigate('/step/3')} footer={footer}>
      {body}
    </StepScreen>
  )

  if (stage === 'checking') {
    return frame(
      <>
        <Button disabled loading>Checking…</Button>
        <Button variant="tertiary" onClick={cancelCheck}>Cancel verification</Button>
      </>,
      <>
        <h1 className="step__title">Checking your photos…</h1>
        <StatusBanner variant="loading" label="This takes a few seconds.">
          Please keep the app open.
        </StatusBanner>
      </>
    )
  }

  if (stage === 'success') {
    const rows = [
      { label: 'Passport chip', status: 'Read' },
      { label: 'ID card', status: 'Received' },
      { label: 'Selfie', status: 'Received' },
    ]
    return frame(
      <Button onClick={() => navigate('/step/5')}>Continue →</Button>,
      <>
        <h1 className="step__title">{page.title}</h1>
        <StatusBanner variant="success" label="Identity check complete">
          This is simulated. No real biometric data is collected.
        </StatusBanner>
        <Card className="details">
          <h2 className="details__title">What we checked</h2>
          {rows.map((r) => (
            <div className="detail" key={r.label}>
              <span className="detail__icon detail__icon--ok" aria-hidden="true"><Check size={18} /></span>
              <span className="detail__text"><span className="detail__value">{r.label}</span></span>
              <span className="detail__status">{r.status}</span>
            </div>
          ))}
        </Card>
      </>
    )
  }

  const isId = stage === 'id' || stage === 'idError'
  const failed = stage === 'idError' || stage === 'selfieError'
  const copy = isId ? COPY.id : COPY.face
  const failure = isId ? FAILURE.id : FAILURE.face
  const retake = isId ? takeIdPhoto : takeSelfie

  const footer = failed ? (
    <>
      <Button onClick={retake}>
        <RotateCcw size={18} aria-hidden="true" /> {isId ? 'Retake photo' : 'Retake selfie'}
      </Button>
      <Button variant="secondary" onClick={openHelp}>Talk to a staff member</Button>
    </>
  ) : (
    <Button onClick={retake} loading={busy}>
      {!busy && <Camera size={20} aria-hidden="true" />}
      {isId ? (busy ? 'Checking photo…' : 'Take photo') : 'Take selfie'}
    </Button>
  )

  return frame(
    footer,
    <>
      <p className="part-label">{copy.part}</p>
      <h1 className="step__title">{page.title}</h1>
      <p className="step__intro">{copy[wording]}</p>
      {failed ? (
        <>
          <StatusBanner variant="error" label={failure.label}>
            {failure.text} Your information is saved.
          </StatusBanner>
          <StatusBanner variant="tip" label="Try this">{failure.tip}</StatusBanner>
        </>
      ) : (
        <>
          <CameraView shape={isId ? 'card' : 'face'}>{copy.hint}</CameraView>
          <p className="step__caption">{copy.caption}</p>
        </>
      )}
    </>
  )
}