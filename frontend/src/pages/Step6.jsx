import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronDown, FileText, Info, Mail, Smartphone } from 'lucide-react'
import StepScreen from '../components/StepScreen'
import StatusBanner from '../components/StatusBanner'
import Card from '../components/Card'
import Button from '../components/Button'
import Field from '../components/Field'

import Declaration from '../components/Declaration'
import DetailRow from '../components/DetailRow'
import { usePreferences } from '../context/PreferencesContext'
import { useJourney } from '../context/JourneyContext'
import usePageView from '../hooks/usePageView'

import { getPage, pageText } from '../data/content'
import { countryName } from '../data/countries'
import { DOC_TYPES } from '../data/documents'

import { logEvent, submitApplication } from '../api/client'

const DIAL_CODES = ['+852', '+60', '+62', '+86']
const LENGTHS = { '+852': [8, 8], '+60': [9, 10], '+62': [9, 12], '+86': [11, 11] }
const DECLARATIONS = [
  'The details above are correct.',
  'I agree to the account terms (demo text).',
  'I agree to receive SMS and email messages in English.',
]

function validate(contact) {
  const errors = {}
  const digits = contact.mobile.replace(/\D/g, '')
  const [min, max] = LENGTHS[contact.dial] ?? [7, 15]
  if (digits.length < min || digits.length > max) errors.mobile = 'Enter a valid mobile number.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email.trim())) {
    errors.email = 'Enter an email like name@example.com.'
  }
  return errors
}

function maskMobile(contact) {
  const digits = contact.mobile.replace(/\D/g, '')
  return `${contact.dial} •••• ${digits.slice(-4)}`
}

export default function Step6() {
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const {
    sessionId,
    applicant,
    contact,
    saveContact,
    documentType,
    completeJourney,
    clearEligibility,
    durationSeconds,
  } = useJourney()
  const page = getPage('account.step6', prefs.language)
  usePageView('account.step6')

  const [stage, setStage] = useState('contact') // contact | code | review | submitting
  const [errors, setErrors] = useState({})
 const [agreed, setAgreed] = useState([false, false, false])
  const [declError, setDeclError] = useState(false)
  const [submitFailed, setSubmitFailed] = useState(false)
 
  const filled = contact.mobile.trim() !== '' && contact.email.trim() !== ''
  const errorCount = Object.keys(errors).length
  const locked = stage === 'submitting'

  function change(field, value) {
    saveContact({ ...contact, [field]: value })
    if (errors[field]) {
      setErrors((e) => {
        const next = { ...e }
        delete next[field]
        return next
      })
    }
  }

function continueToReview(e) {
  e.preventDefault()

  const found = validate(contact)
  setErrors(found)

  if (found.mobile) {
    logEvent(sessionId, 'account.step6', 'error', {
      code: 'CONTACT_MOBILE_INVALID',
    })
  }

  if (found.email) {
    logEvent(sessionId, 'account.step6', 'error', {
      code: 'CONTACT_EMAIL_INVALID',
    })
  }

  if (Object.keys(found).length) return

  setStage('review')
}



  function toggleDeclaration(i) {
    const next = agreed.map((v, idx) => (idx === i ? !v : v))
    setAgreed(next)
    if (next.every(Boolean)) setDeclError(false)
  }

  async function submit() {
    if (!agreed.every(Boolean)) {
      setDeclError(true)
      logEvent(sessionId, 'account.step6', 'error', { code: 'DECLARATION_REQUIRED' })
      return
    }
    setSubmitFailed(false)
    setStage('submitting')
    try {
      const { reference } = await submitApplication(sessionId)
      logEvent(sessionId, 'account.submitted', 'page_view')
      logEvent(sessionId, 'account.submitted', 'journey_complete', { duration_s: durationSeconds() })
      completeJourney(reference)
      navigate('/submitted', { replace: true })
    } catch {
      setSubmitFailed(true)
      setStage('review')
    }
  }

  function editCountry() {
    clearEligibility()
    navigate('/step/1')
  }

  // ---- Contact details
  if (stage === 'contact') {
    return (
      <StepScreen
        step={6}
        onBack={() => navigate('/step/5')}
        footer={
          <Button type="submit" form="contact-form" disabled={!filled}>
  Continue
</Button>
        }
      >
        <h1 className="step__title">Your contact details</h1>
        <p className="step__intro">We use these to send you codes and updates.</p>
        {errorCount > 0 && (
          <StatusBanner variant="error" label={`Please check ${errorCount} field${errorCount > 1 ? 's' : ''}`}>
            What you typed is saved.
          </StatusBanner>
        )}
        <form id="contact-form" className="form-card" onSubmit={continueToReview} noValidate>
          <Field id="mobile" label="Mobile number" hint="We’ll send a code by SMS." error={errors.mobile}>
            <div className="phone-row">
              <div className="control-wrap control-wrap--dial">
                <select
                  className="control control--dial"
                  aria-label="Country code"
                  value={contact.dial}
                  onChange={(e) => change('dial', e.target.value)}
                >
                  {DIAL_CODES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="control-icon" size={18} aria-hidden="true" />
              </div>
              <input
                id="mobile"
                className={`control ${errors.mobile ? 'control--error' : ''}`.trim()}
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="9123 4567"
                value={contact.mobile}
                onChange={(e) => change('mobile', e.target.value)}
                aria-invalid={errors.mobile ? true : undefined}
                aria-describedby={errors.mobile ? 'mobile-error' : 'mobile-hint'}
              />
            </div>
          </Field>
          <Field id="email" label="Email address" hint="We’ll send updates and document requests here." error={errors.email}>
            <input
              id="email"
              type="email"
              className={`control ${errors.email ? 'control--error' : ''}`.trim()}
              autoComplete="email"
              placeholder="name@example.com"
              value={contact.email}
              onChange={(e) => change('email', e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'email-error' : 'email-hint'}
            />
          </Field>
        </form>
        <p className="step__caption">SMS and email messages are sent in English.</p>
      </StepScreen>
    )
  }

  // ---- Review and submit (also shown while submitting)
  const docLabel = DOC_TYPES.find((d) => d.id === documentType)?.label ?? ''
  const count = agreed.filter(Boolean).length
  return (
    <StepScreen
      step={6}
      onBack={locked ? undefined : () => setStage('contact')}
      footer={
        <Button loading={locked} onClick={submit}>
          {locked ? 'Submitting…' : 'Submit application →'}
        </Button>
      }
    >
      <h1 className="step__title">{page.title}</h1>
      <p className="step__intro">{pageText(page, prefs.wording)}</p>

      {locked && (
        <StatusBanner variant="loading" label="Submitting your application…">Please keep the app open.</StatusBanner>
      )}
      {declError && (
        <StatusBanner variant="error" label="One more thing">
          Please tick all three boxes to continue. Your details are saved.
        </StatusBanner>
      )}
      {submitFailed && (
        <StatusBanner variant="error" label="We couldn’t submit right now">
          Your information is saved. Please try again.
        </StatusBanner>
      )}

      <Card className="details">
        <h2 className="details__title">Your details</h2>
        <DetailRow icon={BookOpen} label="Passport country" value={countryName(applicant.country)} onEdit={locked ? undefined : editCountry} />
        <DetailRow icon={Smartphone} label="Mobile number" value={maskMobile(contact)} onEdit={locked ? undefined : () => setStage('contact')} />
        <DetailRow icon={Mail} label="Email address" value={contact.email} onEdit={locked ? undefined : () => setStage('contact')} />
        <DetailRow icon={FileText} label="Supporting document" value={docLabel} onEdit={locked ? undefined : () => navigate('/step/5')} />
      </Card>

      <Card className="decls">
        <div className="decls__head">
          <h2 className="details__title">Declarations</h2>
          <span className="decls__count">{count} of 3 confirmed</span>
        </div>
        {DECLARATIONS.map((text, i) => (
          <Declaration
            key={text}
            checked={agreed[i]}
            onToggle={() => toggleDeclaration(i)}
            error={declError && !agreed[i]}
            disabled={locked}
          >
            {text}
          </Declaration>
        ))}
      </Card>
    </StepScreen>
  )
}