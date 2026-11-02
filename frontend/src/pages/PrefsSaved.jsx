import { useNavigate } from 'react-router-dom'
import { Check, Globe, Info, LayoutGrid, MessageSquare, Type, Volume2, VolumeX } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Button from '../components/Button'
import { usePreferences } from '../context/PreferencesContext'
import './Prefs.css'

const SIZE = { default: 'Standard', large: 'Large', larger: 'Larger', largest: 'Largest' }
const LANGUAGE = { en: 'English', zh: '中文', ms: 'Bahasa Melayu' }
const WORDING = { simple: 'Simple', standard: 'Standard' }
const LAYOUT = { standard: 'Standard', guided: 'Guided' }

export default function PrefsSaved() {
  const navigate = useNavigate()
  const { prefs, startSetup } = usePreferences()

  function change() {
    if (prefs.skipped) startSetup()
    navigate('/preferences/1')
  }

  const rows = [
    { icon: Type, label: 'Text size', value: SIZE[prefs.textSize] },
    { icon: Globe, label: 'Language', value: LANGUAGE[prefs.language] },
    { icon: MessageSquare, label: 'Wording', value: WORDING[prefs.wording] },
    { icon: prefs.readAloud ? Volume2 : VolumeX, label: 'Read aloud', value: prefs.readAloud ? 'On' : 'Off' },
    { icon: LayoutGrid, label: 'Layout', value: LAYOUT[prefs.layout] },
  ]

  return (
    <Screen
      header={<Header desktopOnly />}
      footer={<Button onClick={() => navigate('/signup')}>Continue to sign up</Button>}
    >
      <div className="saved">
        <span className={`saved__icon ${prefs.skipped ? 'saved__icon--neutral' : 'saved__icon--ok'}`} aria-hidden="true">
          {prefs.skipped ? <Info size={32} /> : <Check size={32} />}
        </span>
        <h1 className="saved__title">{prefs.skipped ? 'Using the default settings' : 'Your preferences are saved'}</h1>
        <p className="saved__intro">
          {prefs.skipped
            ? 'You can personalise the app any time in Settings.'
            : 'We’ve set up the app the way you chose. You can change these any time in Settings.'}
        </p>

        <div className="summary">
          {rows.map(({ icon: Icon, label, value }) => (
            <div className="summary__row" key={label}>
              <span className="summary__label"><Icon size={20} aria-hidden="true" /> {label}</span>
              <span className="summary__value">{value}</span>
            </div>
          ))}
          <div className="summary__row">
            <Button variant="tertiary" onClick={change}>
              {prefs.skipped ? 'Set up preferences' : 'Change preferences'}
            </Button>
          </div>
        </div>
      </div>
    </Screen>
  )
}