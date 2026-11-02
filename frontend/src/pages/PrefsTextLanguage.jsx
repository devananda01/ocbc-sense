import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import ProgressBar from '../components/ProgressBar'
import OptionCard from '../components/OptionCard'
import Button from '../components/Button'
import { usePreferences } from '../context/PreferencesContext'
import './Prefs.css'

const SIZES = [
  { id: 'default', label: 'Standard', note: 'Default scale', aa: '16px' },
  { id: 'large', label: 'Large', note: 'Recommended', aa: '20px' },
  { id: 'larger', label: 'Larger', note: 'Bigger text', aa: '24px' },
  { id: 'largest', label: 'Largest', note: 'High visibility', aa: '28px' },
]

const LANGUAGES = [
  { id: 'en', badge: 'EN', name: 'English', note: 'Default system language' },
  { id: 'zh', badge: '中', name: '中文 (Chinese)', note: 'Simplified' },
  { id: 'ms', badge: 'BM', name: 'Bahasa Melayu', note: 'Malay' },
]

export default function PrefsTextLanguage() {
  const navigate = useNavigate()
  const { prefs, update, skipSetup } = usePreferences()
  const sizeLabel = SIZES.find((s) => s.id === prefs.textSize)?.label

  function skip() {
    skipSetup()
    navigate('/preferences/saved')
  }

  return (
    <Screen header={<Header onBack={() => navigate('/welcome')} />}>
      <ProgressBar current={1} total={2} label="Personalise · 1 of 2" />
      <h1 className="prefs__title">Make the app comfortable for you</h1>
      <p className="prefs__intro">Choose what works best. You can change these any time in Settings.</p>

      <section className="prefs__section" aria-labelledby="size-h">
        <h2 id="size-h" className="prefs__heading">Text size</h2>
        <div className="prefs__grid">
          {SIZES.map((s) => (
            <OptionCard key={s.id} selected={prefs.textSize === s.id} onSelect={() => update({ textSize: s.id })}>
              <span className="aa" style={{ fontSize: s.aa }}>Aa</span>
              <span className="option__title">{s.label}</span>
              <span className="option__note">{s.note}</span>
            </OptionCard>
          ))}
        </div>
      </section>

      <section className="preview" aria-label="Live sample preview">
        <div className="preview__head">
          <span className="preview__title"><Eye size={16} aria-hidden="true" /> Live Sample Preview</span>
          <span className="preview__tag">{sizeLabel}</span>
        </div>
        <p className="preview__sample">Your passport has a small chip inside the cover.</p>
        <p className="preview__note">Adjusted dynamically for balance, readability, and financial clarity.</p>
      </section>

      <section className="prefs__section" aria-labelledby="lang-h">
        <h2 id="lang-h" className="prefs__heading">Language</h2>
        {LANGUAGES.map((l) => (
          <OptionCard key={l.id} selected={prefs.language === l.id} onSelect={() => update({ language: l.id })}>
            <span className="lang-row">
              <span className="lang-badge" aria-hidden="true">{l.badge}</span>
              <span className="lang-text">
                <span className="option__title">{l.name}</span>
                <span className="option__note">{l.note}</span>
              </span>
            </span>
          </OptionCard>
        ))}
      </section>

      <div className="prefs__actions">
        <Button onClick={() => navigate('/preferences/2')}>Next →</Button>
        <Button variant="tertiary" onClick={skip}>Skip for now — use the default</Button>
      </div>
    </Screen>
  )
}