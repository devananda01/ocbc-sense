import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import { usePreferences } from '../context/PreferencesContext'
import { useJourney } from '../context/JourneyContext'
import { getPage, pageText } from '../data/content'

export default function Submitted() {
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const { reference, reset } = useJourney()
  const [copied, setCopied] = useState('') // '' | 'ok' | 'failed'
  const page = getPage('account.submitted')

  if (!reference) return <Navigate to="/welcome" replace />

  async function copy() {
    try {
      await navigator.clipboard.writeText(reference)
      setCopied('ok')
    } catch {
      setCopied('failed')
    }
  }

  function home() {
    reset()
    navigate('/welcome')
  }

  return (
    <Screen
      header={<Header desktopOnly />}
      footer={
        <>
          <Button onClick={() => navigate('/next')}>See details</Button>
          <Button variant="tertiary" onClick={home}>Go to home</Button>
        </>
      }
    >
      <div className="saved">
        <span className="saved__icon saved__icon--ok" aria-hidden="true"><Check size={32} /></span>
        <h1 className="saved__title">Application submitted</h1>
        <p className="saved__intro">{pageText(page, prefs.wording)}</p>
      </div>

      <Card className="ref-card">
        <p className="ref-card__label">Reference number</p>
        <p className="ref-card__number">{reference}</p>
        <Button variant="secondary" onClick={copy}>
          <Copy size={18} aria-hidden="true" /> Copy reference
        </Button>
        <p className="step__caption" role="status">
          {copied === 'ok' && 'Copied.'}
          {copied === 'failed' && 'Couldn’t copy. Please write the number down.'}
        </p>
      </Card>

      <h2 className="step__subtitle">What happens next</h2>
      <Card>
        <ol className="next-steps">
          <li>
            <span className="next-steps__num" aria-hidden="true">1</span>
            <div>
              <p className="next-steps__title">Check your email</p>
              <p className="next-steps__text">We’ll ask for one supporting document.</p>
            </div>
          </li>
          <li>
            <span className="next-steps__num" aria-hidden="true">2</span>
            <div>
              <p className="next-steps__title">Reply within 7 days</p>
              <p className="next-steps__text">Send the document we ask for.</p>
            </div>
          </li>
          <li>
            <span className="next-steps__num" aria-hidden="true">3</span>
            <div>
              <p className="next-steps__title">Wait for the result</p>
              <p className="next-steps__text">We may take up to 21 working days after we receive it to tell you.</p>
            </div>
          </li>
        </ol>
      </Card>
    </Screen>
  )
}