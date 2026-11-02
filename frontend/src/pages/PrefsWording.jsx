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

export default function PrefsWording() {
  const navigate = useNavigate()
  const { prefs, update, finishSetup, skipSetup } = usePreferences()
  const [voiceMessage, setVoiceMessage] = useState('')

  function hearSample() {
    const ok = speak('Your passport has a small chip inside the cover.', prefs.language)
    setVoiceMessage(ok ? '' : 'Voice isn’t available on this device.')
  }

  function save() {
    finishSetup()
    navigate('/preferences/saved')
  }

  function skip() {
    skipSetup()
    navigate('/preferences/saved')
  }

  return (
    <Screen header={<Header onBack={() => navigate('/preferences/1')} />}>
      <ProgressBar current={2} total={2} label="Personalise · 2 of 2" />
      <h1 className="prefs__title">How should we guide you?</h1>
      <p className="prefs__intro">Choose the wording and style that feels right. You can adjust this anytime in Settings.</p>

      <section className="prefs__section" aria-labelledby="wording-h">
        <h2 id="wording-h" className="prefs__heading">Wording</h2>
        <div className="prefs__grid">
          <OptionCard tone="blue" tag selected={prefs.wording === 'simple'} onSelect={() => update({ wording: 'simple' })}>
            <span className="option__title">Simple</span>
            <span className="option__note">Short, everyday words</span>
            <span className="example">“We check your passport.”</span>
          </OptionCard>
          <OptionCard tone="blue" tag selected={prefs.wording === 'standard'} onSelect={() => update({ wording: 'standard' })}>
            <span className="option__title">Standard</span>
            <span className="option__note">Standard banking terms</span>
            <span className="example">“Biometric document verification”</span>
          </OptionCard>
        </div>
      </section>

      <section className="prefs__section" aria-labelledby="read-h">
        <h2 id="read-h" className="prefs__heading">Read aloud</h2>
        <div className="row-card">
          <div className="row-card__line">
            <span>
              <span className="row-card__label">Read instructions aloud</span>
              <br />
              <span className="row-card__note">You can also tap a speaker icon on any section</span>
            </span>
            <Toggle
              label="Read instructions aloud"
              checked={prefs.readAloud}
              onChange={(readAloud) => update({ readAloud })}
            />
          </div>
          <div className="row-card__voice">
            <Button variant="secondary" fullWidth={false} onClick={hearSample} disabled={!canSpeak()}>
              <Volume2 size={18} aria-hidden="true" /> Hear a sample
            </Button>
            <span className="row-card__note">Voice: Device default</span>
          </div>
          {(voiceMessage || !canSpeak()) && (
            <p className="row-card__hint" role="status">{voiceMessage || 'Voice isn’t available on this device.'}</p>
          )}
        </div>
      </section>

      <section className="prefs__section" aria-labelledby="layout-h">
        <h2 id="layout-h" className="prefs__heading">Layout</h2>
        <OptionCard selected={prefs.layout === 'standard'} onSelect={() => update({ layout: 'standard' })}>
          <span className="layout-row">
            <span className="thumb" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>
              <span className="option__title">Standard</span>
              <br />
              <span className="option__note">Compact, several fields on one screen.</span>
            </span>
          </span>
        </OptionCard>
        <OptionCard tone="blue" tag selected={prefs.layout === 'guided'} onSelect={() => update({ layout: 'guided' })}>
          <span className="layout-row">
            <span className="thumb thumb--guided" aria-hidden="true"><i /><i /><b /></span>
            <span>
              <span className="option__title">Guided</span>
              <br />
              <span className="option__note">One task per screen with extra explanations.</span>
            </span>
          </span>
          <span className="recommended"><Star size={14} aria-hidden="true" /> Recommended for first-time users</span>
        </OptionCard>
      </section>

      <div className="prefs__actions">
        <Button onClick={save}>Save and continue →</Button>
        <Button variant="secondary" onClick={() => navigate('/preferences/1')}>Back</Button>
        <Button variant="tertiary" onClick={skip}>Skip for now — use the default</Button>
      </div>
    </Screen>
  )
}