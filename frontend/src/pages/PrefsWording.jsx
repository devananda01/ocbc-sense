import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Volume2 } from 'lucide-react'
import Screen from '../components/Screen'
import Header from '../components/Header'
import ProgressBar from '../components/ProgressBar'
import OptionCard from '../components/OptionCard'
import Toggle from '../components/Toggle'
import Button from '../components/Button'
import { usePreferences } from '../context/PreferencesContext'
import { canSpeak, speak } from '../utils/speech'
import './Prefs.css'
import { useT } from '../i18n/useT'

export default function PrefsWording() {
  const navigate = useNavigate()
  const { prefs, update, finishSetup } = usePreferences()
  const t = useT()
  const [voiceMessage, setVoiceMessage] = useState('')

  function hearSample() {
    const samples = { en: 'Your passport has a small chip inside the cover.', zh: '您的护照封面内有一枚小芯片。', ms: 'Pasport anda mempunyai cip kecil di dalam kulitnya.' }
    const ok = speak(samples[prefs.language] ?? samples.en, prefs.language)
    setVoiceMessage(ok ? '' : t('voiceUnavailable'))
  }

  function save() {
    finishSetup()
    navigate('/preferences/saved')
  }



  return (
    <Screen header={<Header onBack={() => navigate('/preferences/1')} />}>
      <ProgressBar current={2} total={2} label={t('personalise', { n: 2 })} />
      <h1 className="prefs__title">{t('page2Title')}</h1>
      <p className="prefs__intro">{t('page2Intro')}</p>

      <section className="prefs__section" aria-labelledby="wording-h">
        <h2 id="wording-h" className="prefs__heading">{t('wording')}</h2>
        <div className="prefs__grid">
          <OptionCard tone="blue" tag selected={prefs.wording === 'simple'} onSelect={() => update({ wording: 'simple' })}>
            <span className="option__title">{t('simple')}</span>
            <span className="option__note">{t('shortWords')}</span>
            <span className="example">{t('exampleSimple')}</span>
          </OptionCard>
          <OptionCard tone="blue" tag selected={prefs.wording === 'standard'} onSelect={() => update({ wording: 'standard' })}>
            <span className="option__title">{t('standard')}</span>
            <span className="option__note">{t('standardTerms')}</span>
            <span className="example">{t('exampleStandard')}</span>
          </OptionCard>
        </div>
      </section>

      <section className="prefs__section" aria-labelledby="read-h">
        <h2 id="read-h" className="prefs__heading">{t('readAloud')}</h2>
        <div className="row-card">
          <div className="row-card__line">
            <span>
              <span className="row-card__label">{t('readInstructions')}</span>
              <br />
              <span className="row-card__note">{t('speakerHint')}</span>
            </span>
            <Toggle
              label={t("readInstructions")}
              checked={prefs.readAloud}
              onChange={(readAloud) => update({ readAloud })}
            />
          </div>
          <div className="row-card__voice">
            <Button variant="secondary" fullWidth={false} onClick={hearSample} disabled={!canSpeak()}>
              <Volume2 size={18} aria-hidden="true" /> {t('hearSample')}
            </Button>
            <span className="row-card__note">{t('voiceDefault')}</span>
          </div>
          {(voiceMessage || !canSpeak()) && (
            <p className="row-card__hint" role="status">{voiceMessage || t('voiceUnavailable')}</p>
          )}
        </div>
      </section>

      <section className="prefs__section" aria-labelledby="layout-h">
        <h2 id="layout-h" className="prefs__heading">{t('layout')}</h2>
        <OptionCard selected={prefs.layout === 'standard'} onSelect={() => update({ layout: 'standard' })}>
          <span className="layout-row">
            <span className="thumb" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>
              <span className="option__title">{t('standard')}</span>
              <br />
              <span className="option__note">{t('compact')}</span>
            </span>
          </span>
        </OptionCard>
        <OptionCard tone="blue" tag selected={prefs.layout === 'guided'} onSelect={() => update({ layout: 'guided' })}>
          <span className="layout-row">
            <span className="thumb thumb--guided" aria-hidden="true"><i /><i /><b /></span>
            <span>
              <span className="option__title">{t('guided')}</span>
              <br />
              <span className="option__note">{t('oneTask')}</span>
            </span>
          </span>
          <span className="recommended"><Star size={14} aria-hidden="true" />{t("recommendedFirst")}</span>
        </OptionCard>
      </section>

      <div className="prefs__actions">
        <Button onClick={save}>{t('saveContinue')}</Button>
        <Button variant="secondary" onClick={() => navigate('/preferences/1')}>{t('back')}</Button>
      </div>
    </Screen>
  )
}