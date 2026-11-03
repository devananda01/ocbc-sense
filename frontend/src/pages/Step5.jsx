import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Info, RotateCcw, Upload } from 'lucide-react'
import StepScreen from '../components/StepScreen'
import StatusBanner from '../components/StatusBanner'
import Card from '../components/Card'
import Button from '../components/Button'
import OptionCard from '../components/OptionCard'
import { usePreferences } from '../context/PreferencesContext'
import { useJourney } from '../context/JourneyContext'
import { usePresenter } from '../context/PresenterContext'
import { useHelp } from '../context/HelpContext'
import usePageView from '../hooks/usePageView'
import { getPage, pageText } from '../data/content'
import { DOC_TYPES } from '../data/documents'
import { simulateDocumentUpload } from '../api/simulate'
import { logEvent } from '../api/client'

const FAILURES = {
  DOC_UNREADABLE: {
    label: 'File not clear',
    text: 'This file is hard to read. Please upload a clearer copy.',
    tip: 'Use good light, keep all four corners in view, and upload a clear copy.',
  },
  DOC_WRONG_TYPE: {
    label: 'Document not accepted',
    text: 'This document isn’t on the accepted list.',
    tip: 'Check the accepted documents and choose a different one.',
  },
}

export default function Step5() {
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const { sessionId, done, attempts, markDone, recordAttempt, documentType, setDocumentType } = useJourney()
  const { scenarios } = usePresenter()
  const { openHelp } = useHelp()
  const page = getPage('account.step5', prefs.language)
  usePageView('account.step5')

  const [phase, setPhase] = useState(done.doc ? 'uploaded' : 'choose') // choose | uploading | failed | uploaded
  const [errorCode, setErrorCode] = useState(null)
  const runId = useRef(0)

  useEffect(() => () => { runId.current += 1 }, [])

  const typeLabel = DOC_TYPES.find((d) => d.id === documentType)?.label

  function choose(id) {
    setDocumentType(id)
    if (done.doc) {
      markDone('doc', false)
      setPhase('choose')
    }
  }

  async function upload() {
    const id = ++runId.current
    setPhase('uploading')
    const attempt = attempts.doc
    recordAttempt('doc')
    const result = await simulateDocumentUpload(scenarios.doc, attempt)
    if (id !== runId.current) return
    if (result.ok) {
      markDone('doc')
      setPhase('uploaded')
    } else {
      logEvent(sessionId, 'account.step5', 'error', { code: result.code })
      setErrorCode(result.code)
      setPhase('failed')
    }
  }

  function replace() {
    markDone('doc', false)
    setPhase('choose')
  }

  const frame = (footer, body) => (
    <StepScreen step={5} onBack={() => navigate('/step/4')} footer={footer}>
      {body}
    </StepScreen>
  )
  const intro = <p className="step__intro">{pageText(page, prefs.wording)}</p>
  const fileCard = (extra) => (
    <Card className="details">
      <div className="detail">
        <span className="detail__icon" aria-hidden="true"><FileText size={20} /></span>
        <span className="detail__text">
          <span className="detail__label">{typeLabel}</span>
          <span className="detail__value">sample-document.pdf</span>
        </span>
        {extra}
      </div>
    </Card>
  )

  if (phase === 'uploading') {
    return frame(
      <Button disabled loading>Uploading…</Button>,
      <>
        <h1 className="step__title">{page.title}</h1>
        {fileCard()}
        <StatusBanner variant="loading" label="Uploading your document…">Please keep the app open.</StatusBanner>
      </>
    )
  }

  if (phase === 'uploaded') {
    return frame(
      <Button onClick={() => navigate('/step/6')}>Continue →</Button>,
      <>
        <h1 className="step__title">{page.title}</h1>
        <StatusBanner variant="success" label="Document added">
          This is simulated. No real document is collected.
        </StatusBanner>
        {fileCard(<Button variant="tertiary" onClick={replace}>Replace</Button>)}
      </>
    )
  }

  if (phase === 'failed') {
    const failure = FAILURES[errorCode] ?? FAILURES.DOC_UNREADABLE
    return frame(
      <>
        <Button onClick={upload}>
          <RotateCcw size={18} aria-hidden="true" /> Upload again
        </Button>
        <Button variant="secondary" onClick={openHelp}>Talk to a staff member</Button>
        <Button variant="tertiary" onClick={() => setPhase('choose')}>Change document type</Button>
      </>,
      <>
        <h1 className="step__title">{page.title}</h1>
        {intro}
        <StatusBanner variant="error" label={failure.label}>
          {failure.text} Your information is saved.
        </StatusBanner>
        <StatusBanner variant="tip" label="Try this">{failure.tip}</StatusBanner>
        {fileCard()}
      </>
    )
  }

  return frame(
    <Button disabled={!documentType} onClick={upload}>
      <Upload size={20} aria-hidden="true" /> Choose sample file
    </Button>,
    <>
      <h1 className="step__title">{page.title}</h1>
      {intro}
      <h2 className="step__subtitle">Choose one document</h2>
      <div className="doc-list" role="group" aria-label="Accepted documents">
        {DOC_TYPES.map((d) => (
          <OptionCard key={d.id} selected={documentType === d.id} onSelect={() => choose(d.id)}>
            <span className="option__title">{d.label}</span>
          </OptionCard>
        ))}
      </div>
      <p className="step__note">
        <Info size={16} aria-hidden="true" />
        Use a document dated within the last 3 months. In the real process OCBC asks for this by email after you
        submit, and you reply within 7 days. This prototype lets you add it here.
      </p>
    </>
  )
}