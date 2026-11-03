import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Banknote, Check, Clock, Copy, Hourglass, LogOut, Wallet } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Card from '../components/Card'
import Button from '../components/Button'
import AskSenseButton from '../components/AskSenseButton'
import { useJourney } from '../context/JourneyContext'
import { useHelp } from '../context/HelpContext'
import './Home.css'
import '../components/StepScreen.css'

export default function Home() {
  const navigate = useNavigate()
  const { reference, reset } = useJourney()
  const { openHelp } = useHelp()
  const [copied, setCopied] = useState('') // '' | 'ok' | 'failed'

  // No finished application (for example after a refresh before submitting).
  if (!reference) return <Navigate to="/welcome" replace />

  async function copy() {
    try {
      await navigator.clipboard.writeText(reference)
      setCopied('ok')
    } catch {
      setCopied('failed')
    }
  }

  function logOut() {
    reset()
    navigate('/welcome')
  }

  return (
    <Screen
      header={<Header onSettings={() => navigate('/settings')} />}
      footer={
        <>
          <Button onClick={() => navigate('/next')}>See what happens next</Button>
          <Button variant="tertiary" onClick={logOut}>
            <LogOut size={18} aria-hidden="true" /> Log out
          </Button>
          <AskSenseButton onClick={openHelp} />
        </>
      }
    >
      <h1 className="home__hello">Your application</h1>

      <Card className="status-card">
        <span className="pill"><Hourglass size={16} aria-hidden="true" /> Under review</span>
        <div>
          <p className="ref-card__label">Reference number</p>
          <p className="status-card__ref">{reference}</p>
        </div>
        <p className="status-card__text">
          OCBC may take up to 21 working days after receiving your supporting documents to tell you whether your
          account has been opened.
        </p>
        <Button variant="secondary" onClick={copy}>
          <Copy size={18} aria-hidden="true" /> Copy reference
        </Button>
        <p className="step__caption" role="status">
          {copied === 'ok' && 'Copied.'}
          {copied === 'failed' && 'Couldn’t copy. Please write the number down.'}
        </p>
      </Card>

      <h2 className="step__subtitle">Where you are</h2>
      <Card>
        <ol className="tasks">
          <li>
            <span className="task__dot task__dot--done" aria-hidden="true"><Check size={16} /></span>
            <div>
              <p className="task__title">Application submitted</p>
              <p className="task__text">Your details are with OCBC.</p>
            </div>
          </li>
          <li>
            <span className="task__dot task__dot--now" aria-hidden="true"><Clock size={16} /></span>
            <div>
              <p className="task__title">OCBC reviews your application</p>
              <p className="task__text">Nothing to do now. We’ll tell you the result.</p>
            </div>
          </li>
          <li>
            <span className="task__dot" aria-hidden="true"><Banknote size={16} /></span>
            <div>
              <p className="task__title">First deposit</p>
              <p className="task__text">
                If you’re approved, deposit at least S$3,000 in one transaction within 90 days of account opening.
              </p>
            </div>
          </li>
        </ol>
      </Card>

      <h2 className="step__subtitle">Your accounts</h2>
      <div>
        <Card className="acct">
          <span className="acct__icon" aria-hidden="true"><Wallet size={20} /></span>
          <span className="acct__text">
            <span className="acct__name">Statement Savings Account</span>
            <span className="acct__sub">SGD</span>
          </span>
          <span className="acct__tag">Pending</span>
        </Card>
        <Card className="acct">
          <span className="acct__icon" aria-hidden="true"><Wallet size={20} /></span>
          <span className="acct__text">
            <span className="acct__name">Global Savings Account</span>
            <span className="acct__sub">USD</span>
          </span>
          <span className="acct__tag">Pending</span>
        </Card>
      </div>
      <p className="step__caption">Accounts open only if your application is successful. This prototype is simulated.</p>
    </Screen>
  )
}
