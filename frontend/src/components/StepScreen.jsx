import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Screen from './Screen'
import Header from './Header'
import StepList from './StepList'
import ProgressBar from './ProgressBar'
import AskSenseButton from './AskSenseButton'
import StatusBanner from './StatusBanner'
import Dialog from './Dialog'
import Button from './Button'
import { Volume2, VolumeX } from 'lucide-react'
import { usePreferences } from '../context/PreferencesContext'
import { canSpeak, speak, stopSpeaking } from '../utils/speech'
import { useHelp } from '../context/HelpContext'
import { getPage, pageText } from '../data/content'
import { TIPS } from '../data/answers'
import './StepScreen.css'

const STEP_TITLES = [1, 2, 3, 4, 5, 6]

export default function StepScreen({ step, onBack, footer, progressRight, children }) {
  const navigate = useNavigate()
  const { openHelp, level } = useHelp()
  const { prefs } = usePreferences()
  const page = getPage(`account.step${step}`, prefs.language)
  const intro = pageText(page, prefs.wording)
  const [guideOpen, setGuideOpen] = useState(prefs.layout === 'guided')
  const [speaking, setSpeaking] = useState(false)
  const guideRef = useRef(null)

  // Level 2: glow the main button (and show the arrow) if it can be pressed.
  useEffect(() => {
    const el = guideRef.current
    if (!el) return
    el.classList.toggle('guide--on', level >= 2 && !!el.querySelector('.btn--primary:not(:disabled)'))
  })

  useEffect(() => {
    if (prefs.readAloud && canSpeak()) {
      const timer = window.setTimeout(() => {
        setSpeaking(speak(`${page.title}. ${intro}`, prefs.language))
      }, prefs.layout === 'guided' ? 350 : 100)
      return () => {
        window.clearTimeout(timer)
        stopSpeaking()
      }
    }
    return () => stopSpeaking()
  }, [step, prefs.readAloud, prefs.language, prefs.wording, page.title, intro, prefs.layout])

  function replayInstructions() {
    setSpeaking(speak(`${page.title}. ${intro}`, prefs.language))
  }

  function stopInstructions() {
    stopSpeaking()
    setSpeaking(false)
  }

  return (
    <>
    <Screen
      header={<Header onBack={onBack} onSettings={() => navigate('/settings')} />}
      aside={<StepList steps={STEP_TITLES.map((n) => getPage(`account.step${n}`, prefs.language).title)} current={step} />}
      footer={
        <>
          <div className="guide" ref={guideRef}>
            <span className="guide__pill" aria-hidden="true">{prefs.language === 'zh' ? '从这里开始 ↓' : prefs.language === 'ms' ? 'Mula di sini ↓' : 'Start here ↓'}</span>
            {footer}
          </div>
          <AskSenseButton onClick={openHelp} />
        </>
      }
    >
      <ProgressBar current={step} right={progressRight} />
      {prefs.readAloud && canSpeak() && (
        <div className="step__speech-controls">
          <Button variant="tertiary" onClick={replayInstructions}>
            <Volume2 size={18} aria-hidden="true" /> {prefs.language === 'zh' ? '朗读说明' : prefs.language === 'ms' ? 'Baca arahan' : 'Read instructions'}
          </Button>
          {speaking && <Button variant="tertiary" onClick={stopInstructions}><VolumeX size={18} aria-hidden="true" /> {prefs.language === 'zh' ? '停止' : prefs.language === 'ms' ? 'Henti' : 'Stop'}</Button>}
        </div>
      )}
      {level >= 1 && TIPS[`account.step${step}`] && (
        <StatusBanner variant="tip" label={prefs.language === 'zh' ? '此步骤提示' : prefs.language === 'ms' ? 'Petua untuk langkah ini' : 'A hint for this step'}>{TIPS[`account.step${step}`]}</StatusBanner>
      )}
      {children}
    </Screen>
    <Dialog
      open={guideOpen}
      onClose={() => setGuideOpen(false)}
      title={`${prefs.language === 'zh' ? '开始前说明' : prefs.language === 'ms' ? 'Sebelum anda bermula' : 'Before you begin'}: ${page.title}`}
    >
      <p className="dialog__body">{intro}</p>
      <p className="dialog__body">
        {prefs.language === 'zh'
          ? '我们会在每个步骤开始前说明操作内容。您也可以随时向 Sense 寻求帮助。'
          : prefs.language === 'ms'
            ? 'Kami akan menerangkan perkara yang perlu dilakukan sebelum anda meneruskan. Anda boleh meminta bantuan Sense pada bila-bila masa.'
            : 'We’ll explain what to do before you continue. You can ask Sense for help at any time.'}
      </p>
      <div className="prefs__actions">
        {prefs.readAloud && canSpeak() && (
          <Button variant="secondary" onClick={replayInstructions}>
            <Volume2 size={18} aria-hidden="true" /> {prefs.language === 'zh' ? '朗读' : prefs.language === 'ms' ? 'Baca dengan kuat' : 'Read aloud'}
          </Button>
        )}
        <Button onClick={() => setGuideOpen(false)}>
          {prefs.language === 'zh' ? '开始此步骤 →' : prefs.language === 'ms' ? 'Mulakan langkah ini →' : 'Start this step →'}
        </Button>
      </div>
    </Dialog>
    </>
  )
}