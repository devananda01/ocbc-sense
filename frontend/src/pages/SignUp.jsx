import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Fingerprint, Info, Smartphone, Zap } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import OptionCard from '../components/OptionCard'
import Button from '../components/Button'
import Dialog from '../components/Dialog'
import StatusBanner from '../components/StatusBanner'
import { usePreferences } from '../context/PreferencesContext'
import { useJourney } from '../context/JourneyContext'
import './SignUp.css'

export default function SignUp() {
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const { startJourney } = useJourney()
  const [singpassInfo, setSingpassInfo] = useState(false)
  const [status, setStatus] = useState('idle') // idle | starting | error

  async function start() {
    setStatus('starting')
    try {
      await startJourney(prefs)
      navigate('/step/1')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <Screen
        header={<Header onBack={() => navigate('/preferences/saved')} onSettings={() => navigate('/settings')} />}
        footer={
          <Button onClick={start} loading={status === 'starting'}>
            {status === 'starting' ? 'Starting…' : 'Continue →'}
          </Button>
        }
      >
        <h1 className="signup__title">Sign up</h1>

        <OptionCard selected={false} onSelect={() => setSingpassInfo(true)}>
          <span className="reg">
            <span className="reg__top">
              <span className="reg__icon" aria-hidden="true"><Fingerprint size={22} /></span>
              <span className="reg__name">Singpass</span>
            </span>
            <span className="reg__desc">
              For Singapore Citizens and Permanent Residents. Instant retrieval of Myinfo details.
            </span>
            <span className="reg__feature"><Zap size={14} aria-hidden="true" /> Instant verification</span>
          </span>
        </OptionCard>

        <OptionCard selected onSelect={() => {}}>
          <span className="reg">
            <span className="reg__top">
              <span className="reg__icon" aria-hidden="true"><BookOpen size={22} /></span>
              <span className="reg__name">Foreigner with e-passport</span>
              <span className="reg__tag">Available</span>
            </span>
            <span className="reg__desc">For foreigners with a biometric passport and a national ID card.</span>
            <span className="reg__feature"><Smartphone size={14} aria-hidden="true" /> NFC passport scan</span>
          </span>
        </OptionCard>

        <p className="signup__info">
          <Info size={18} aria-hidden="true" />
          Singapore residents can retrieve personal info via Singpass. Foreigners will need an NFC-enabled phone.
        </p>

        {status === 'error' && (
          <StatusBanner variant="error" label="We couldn’t start your application">
            Please try again.
          </StatusBanner>
        )}
      </Screen>

      <Dialog open={singpassInfo} onClose={() => setSingpassInfo(false)} title="Singpass is not part of this demo">
        <p className="dialog__body">
          This prototype follows the Foreigner with e-passport route. Please choose that option to continue.
        </p>
        <Button onClick={() => setSingpassInfo(false)}>Choose e-passport option</Button>
      </Dialog>
    </>
  )
}