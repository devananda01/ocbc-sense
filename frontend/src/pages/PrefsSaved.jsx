import { useNavigate } from 'react-router-dom'
import { Check, Globe, LayoutGrid, MessageSquare, Type, Volume2, VolumeX } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Button from '../components/Button'
import { usePreferences } from '../context/PreferencesContext'
import './Prefs.css'
import { useT } from '../i18n/useT'

const SIZE = { default: 'standard', large: 'large', larger: 'larger', largest: 'largest' }
const LANGUAGE = { en: 'english', zh: 'chinese', ms: 'malay' }
const WORDING = { simple: 'simple', standard: 'standard' }
const LAYOUT = { standard: 'standard', guided: 'guided' }

export default function PrefsSaved() {
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const t = useT()

  function change() {
    navigate('/preferences/1')
  }

  const rows = [
    { icon: Type, label: t('textSize'), value: t(SIZE[prefs.textSize]) },
    { icon: Globe, label: t('language'), value: t(LANGUAGE[prefs.language]) },
    { icon: MessageSquare, label: t('wording'), value: t(WORDING[prefs.wording]) },
    { icon: prefs.readAloud ? Volume2 : VolumeX, label: t('readAloud'), value: prefs.readAloud ? t('on') : t('off') },
    { icon: LayoutGrid, label: t('layout'), value: t(LAYOUT[prefs.layout]) },
  ]

  return (
    <Screen
      header={<Header desktopOnly />}
      footer={<Button onClick={() => navigate('/signup')}>{t('continueSignup')}</Button>}
    >
      <div className="saved">
        <span className="saved__icon saved__icon--ok" aria-hidden="true">
          <Check size={32} />
        </span>
        <h1 className="saved__title">{t('savedTitle')}</h1>
        <p className="saved__intro">
          {t('savedIntro')}
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
              {t('changePrefs')}
            </Button>
          </div>
        </div>
      </div>
    </Screen>
  )
}