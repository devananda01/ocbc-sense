import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import ProgressBar from '../components/ProgressBar'
import OptionCard from '../components/OptionCard'
import Button from '../components/Button'
import { usePreferences } from '../context/PreferencesContext'
import './Prefs.css'
import { useT } from '../i18n/useT'

const SIZES = [
  { id: 'default', key: 'standard', noteKey: 'defaultScale', aa: '16px' },
  { id: 'large', key: 'large', noteKey: 'recommended', aa: '20px' },
  { id: 'larger', key: 'larger', noteKey: 'biggerText', aa: '24px' },
  { id: 'largest', key: 'largest', noteKey: 'highVisibility', aa: '28px' },
]

const LANGUAGES = [
  { id: 'en', badge: 'EN', nameKey: 'english', noteKey: 'defaultLanguage' },
  { id: 'zh', badge: '中', nameKey: 'chinese', noteKey: 'simplified' },
  { id: 'ms', badge: 'BM', nameKey: 'malay', noteKey: 'malay' },
]

export default function PrefsTextLanguage() {
  const navigate = useNavigate()
  const { prefs, update } = usePreferences()
  const t = useT()
  const sizeLabel = t(SIZES.find((s) => s.id === prefs.textSize)?.key ?? 'standard')



  return (
    <Screen header={<Header onBack={() => navigate('/welcome')} />}>
      <ProgressBar current={1} total={2} label={t('personalise', { n: 1 })} />
      <h1 className="prefs__title">{t('page1Title')}</h1>
      <p className="prefs__intro">{t('page1Intro')}</p>

      <section className="prefs__section" aria-labelledby="size-h">
        <h2 id="size-h" className="prefs__heading">{t('textSize')}</h2>
        <div className="prefs__grid">
          {SIZES.map((s) => (
            <OptionCard key={s.id} selected={prefs.textSize === s.id} onSelect={() => update({ textSize: s.id })}>
              <span className="aa" style={{ fontSize: s.aa }}>Aa</span>
              <span className="option__title">{t(s.key)}</span>
              <span className="option__note">{t(s.noteKey)}</span>
            </OptionCard>
          ))}
        </div>
      </section>

      <section className="preview" aria-label={t("livePreview")}>
        <div className="preview__head">
          <span className="preview__title"><Eye size={16} aria-hidden="true" />{t("livePreview")}</span>
          <span className="preview__tag">{sizeLabel}</span>
        </div>
        <p className="preview__sample" style={{ fontSize: SIZES.find((s) => s.id === prefs.textSize)?.aa }}>{t('passportChip')}</p>
        <p className="preview__note">{t('previewNote')}</p>
      </section>

      <section className="prefs__section" aria-labelledby="lang-h">
        <h2 id="lang-h" className="prefs__heading">{t('language')}</h2>
        {LANGUAGES.map((l) => (
          <OptionCard key={l.id} selected={prefs.language === l.id} onSelect={() => update({ language: l.id })}>
            <span className="lang-row">
              <span className="lang-badge" aria-hidden="true">{l.badge}</span>
              <span className="lang-text">
                <span className="option__title">{t(l.nameKey)}</span>
                <span className="option__note">{t(l.noteKey)}</span>
              </span>
            </span>
          </OptionCard>
        ))}
      </section>

      <div className="prefs__actions">
        <Button onClick={() => navigate('/preferences/2')}>{t('next')}</Button>
      </div>
    </Screen>
  )
}