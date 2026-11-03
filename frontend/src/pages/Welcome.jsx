import { useNavigate } from 'react-router-dom'
import Screen from '../components/Screen'
import Header from '../components/Header'
import LanguagePill from '../components/LanguagePill'
import Button from '../components/Button'
import PassportPhoneArt from '../components/PassportPhoneArt'
import { usePreferences } from '../context/PreferencesContext'
import { useJourney } from '../context/JourneyContext'
import './Welcome.css'

export default function Welcome() {
  const navigate = useNavigate()
  const journey = useJourney()
  const { prefs, update, startSetup } = usePreferences()

    function createAccount() {
    journey.reset()
    startSetup()
    navigate('/preferences/1')
  }

  return (
    <Screen
      header={
        <Header right={<LanguagePill value={prefs.language} onChange={(language) => update({ language })} />} />
      }
    >
      <PassportPhoneArt />
      <div className="welcome__text">
        <h1>Welcome to OCBC Sense</h1>
        <p>Ask, don’t assume. We will shape the app around how you like to bank.</p>
      </div>
      <div className="welcome__actions">
        <Button variant="secondary" onClick={() => navigate('/login')}>Log in</Button>
        <Button onClick={createAccount}>Create new account</Button>
      </div>
    </Screen>
  )
}