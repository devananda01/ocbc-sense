import { useId, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Banknote, ChevronDown, CircleCheck, FileText, Wallet } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Button from '../components/Button'
import { useJourney } from '../context/JourneyContext'
import { getPage } from '../data/content'
import { DOC_TYPES } from '../data/documents'

function Accordion({ icon: Icon, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()
  return (
    <section className="acc">
      <h2 className="acc__h">
        <button className="acc__btn" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
          <span className="acc__icon" aria-hidden="true"><Icon size={20} /></span>
          <span className="acc__title">{title}</span>
          <ChevronDown className={`acc__chev ${open ? 'acc__chev--open' : ''}`.trim()} size={20} aria-hidden="true" />
        </button>
      </h2>
      {open && <div id={panelId} className="acc__panel">{children}</div>}
    </section>
  )
}

export default function WhatNext() {
  const navigate = useNavigate()
  const { reference, reset } = useJourney()
  const page = getPage('account.submitted')

  if (!reference) return <Navigate to="/welcome" replace />

  function done() {
    reset()
    navigate('/welcome')
  }

  return (
    <Screen
      header={<Header onBack={() => navigate('/submitted')} />}
      footer={<Button onClick={done}>Done</Button>}
    >
      <h1 className="step__title">{page.title}</h1>
      <p className="step__intro">{page.verified_info}</p>

      <Accordion icon={FileText} title="Your supporting document" defaultOpen>
        <p>
          Reply to our email within 7 days with one document dated within the last 3 months. Put your passport
          number in the email subject.
        </p>
        <p className="acc__label">Accepted documents</p>
        <ul className="acc__list">
          {DOC_TYPES.map((d) => (
            <li key={d.id}>
              <CircleCheck size={18} aria-hidden="true" />
              <span>{d.label}</span>
            </li>
          ))}
        </ul>
      </Accordion>

      <Accordion icon={Wallet} title="Your accounts">
        <p>
          If your application is successful, OCBC opens a Statement Savings Account (SGD) and a Global Savings
          Account (USD).
        </p>
      </Accordion>

      <Accordion icon={Banknote} title="Your first deposit">
        <p>
          Deposit at least S$3,000 in a single transaction, from a bank account in your own name, within 90 days of
          account opening.
        </p>
        <p>
          You can use a FAST transfer from an existing SGD account, or an overseas telegraphic transfer using SWIFT
          code OCBCSGSG. Digital wallets are not accepted for this first deposit.
        </p>
        <p>If the deposit isn’t made, the account will be closed.</p>
      </Accordion>

      <p className="step__caption">Based on OCBC’s published information. Screens in this prototype are simulated.</p>
    </Screen>
  )
}