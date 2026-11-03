import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Cake, Calendar, ChevronDown, Globe, Info } from 'lucide-react'
import StepScreen from '../components/StepScreen'
import StatusBanner from '../components/StatusBanner'
import Card from '../components/Card'
import Button from '../components/Button'
import Field from '../components/Field'
import { usePreferences } from '../context/PreferencesContext'
import { useJourney } from '../context/JourneyContext'
import { useHelp } from '../context/HelpContext'
import usePageView from '../hooks/usePageView'
import { getPage, pageText } from '../data/content'
import { COUNTRIES, countryName } from '../data/countries'
import { ageFrom, formatDob, parseDob } from '../utils/dob'
import { checkEligibility, logEvent } from '../api/client'

const NOT_ELIGIBLE_TEXT = {
  COUNTRY_NOT_SUPPORTED:
    'Based on the information provided, remote sign-up with an e-passport isn’t available for this passport yet.',
  AGE_REQUIREMENT:
    'Based on the information provided, you need to be 18 or older to open an account with this app.',
}

function DetailRow({ icon: Icon, label, value, onEdit }) {
  return (
    <div className="detail">
      <span className="detail__icon" aria-hidden="true"><Icon size={20} /></span>
      <span className="detail__text">
        <span className="detail__label">{label}</span>
        <span className="detail__value">{value}</span>
      </span>
      {onEdit && <Button variant="tertiary" onClick={onEdit}>Edit</Button>}
    </div>
  )
}

export default function Step1() {
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const { sessionId, applicant, saveApplicant, eligibility, setEligibility, clearEligibility, endJourney } =
    useJourney()
  const { openHelp } = useHelp()
  const page = getPage('account.step1', prefs.language)
  usePageView('account.step1')

  const [country, setCountry] = useState(applicant.country)
  const [dob, setDob] = useState(applicant.dob)
  const [dobError, setDobError] = useState('')
  const [status, setStatus] = useState('idle') // idle | checking | error

  const ready = Boolean(country) && dob.replace(/\D/g, '').length === 8
  const intro = <p className="step__intro">{pageText(page, prefs.wording)}</p>

  async function submit(e) {
    e.preventDefault()
    const date = parseDob(dob)
    if (!date) {
      setDobError('Enter a real date of birth, like 15 / 03 / 1996.')
      return
    }
    setDobError('')
    setStatus('checking')
    try {
      const result = await checkEligibility({
        passport_country: country,
        is_18_or_older: ageFrom(date) >= 18,
      })
      saveApplicant({ country, dob })
      if (!result.eligible) logEvent(sessionId, 'account.step1', 'error', { code: result.code })
      setEligibility(result)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  async function saveAndExit() {
    await endJourney('not_eligible')
    navigate('/welcome')
  }

  // ---- Eligible
  if (eligibility?.eligible) {
    const age = ageFrom(parseDob(applicant.dob))
    return (
      <StepScreen step={1} onBack={() => navigate('/signup')} footer={<Button onClick={() => navigate('/step/2')}>Continue →</Button>}>
        <h1 className="step__title">{page.title}</h1>
        {intro}
        <StatusBanner variant="success" label="Eligibility check complete">
          Based on the information provided, you can continue with this application.
        </StatusBanner>
        <Card className="details">
          <h2 className="details__title">Your details</h2>
          <DetailRow icon={BookOpen} label="Passport country" value={countryName(applicant.country)} onEdit={clearEligibility} />
          <DetailRow icon={Cake} label="Age" value={`${age} years old`} onEdit={clearEligibility} />
        </Card>
        <p className="step__note">
          <Info size={16} aria-hidden="true" />
          A biometric passport has a small chip symbol on its cover for NFC authentication.
        </p>
      </StepScreen>
    )
  }

  // ---- Not eligible
  if (eligibility && !eligibility.eligible) {
    const ageFailed = eligibility.code === 'AGE_REQUIREMENT'
    return (
      <StepScreen
        step={1}
        onBack={() => navigate('/signup')}
        footer={
          <>
            <Button onClick={clearEligibility}>Change my details</Button>
            <Button variant="secondary" onClick={openHelp}>Contact customer service</Button>
            <Button variant="tertiary" onClick={saveAndExit}>Save and exit</Button>
          </>
        }
      >
        <h1 className="step__title">We can’t continue online</h1>
        <p className="step__intro">We reviewed your preliminary details against current digital application guidelines.</p>
        <StatusBanner variant="error" label="Not eligible for online opening">
          {NOT_ELIGIBLE_TEXT[eligibility.code]}
        </StatusBanner>
        <Card className="details">
          <DetailRow icon={Globe} label="Passport country" value={countryName(applicant.country)} onEdit={clearEligibility} />
          {ageFailed && (
            <DetailRow icon={Cake} label="Age" value={`${ageFrom(parseDob(applicant.dob))} years old`} onEdit={clearEligibility} />
          )}
        </Card>
      </StepScreen>
    )
  }

  // ---- Form
  return (
    <StepScreen
      step={1}
      onBack={() => navigate('/signup')}
      footer={
        <Button type="submit" form="eligibility-form" disabled={!ready} loading={status === 'checking'}>
          {status === 'checking' ? 'Checking…' : 'Check eligibility'}
        </Button>
      }
    >
      <h1 className="step__title">{page.title}</h1>
      {intro}
      {status === 'error' && (
        <StatusBanner variant="error" label="We couldn’t check right now">
          Your information is saved. Please try again.
        </StatusBanner>
      )}
      <form id="eligibility-form" className="form-card" onSubmit={submit} noValidate>
        <Field id="country" label="Passport country">
          <div className="control-wrap">
            <select id="country" className="control" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="" disabled>Select your passport country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="control-icon" size={20} aria-hidden="true" />
          </div>
        </Field>
        <Field id="dob" label="Date of birth" error={dobError}>
          <div className="control-wrap">
            <input
              id="dob"
              className={`control ${dobError ? 'control--error' : ''}`.trim()}
              inputMode="numeric"
              autoComplete="off"
              placeholder="DD / MM / YYYY"
              value={dob}
              onChange={(e) => {
                setDob(formatDob(e.target.value))
                setDobError('')
              }}
              aria-invalid={dobError ? true : undefined}
              aria-describedby={dobError ? 'dob-error' : undefined}
            />
            <Calendar className="control-icon" size={20} aria-hidden="true" />
          </div>
        </Field>
      </form>
    </StepScreen>
  )
}