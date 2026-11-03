import { useNavigate } from 'react-router-dom'
import { BookOpen, ChevronDown, Contact, Smartphone } from 'lucide-react'
import StepScreen from '../components/StepScreen'
import ChecklistItem from '../components/ChecklistItem'
import Button from '../components/Button'
import { usePreferences } from '../context/PreferencesContext'
import { useJourney } from '../context/JourneyContext'
import usePageView from '../hooks/usePageView'
import { getPage, pageText } from '../data/content'

const ITEMS = [
  { key: 'passport', icon: BookOpen, label: 'Biometric passport', note: 'Look for the small chip symbol on the cover.' },
  { key: 'nationalId', icon: Contact, label: 'National ID card', note: 'Your camera will capture its details.' },
  { key: 'phone', icon: Smartphone, label: 'Phone with NFC and camera', note: 'NFC reads the chip in your passport.' },
]

export default function Step2() {
  const navigate = useNavigate()
  const { prefs } = usePreferences()
  const { checklist, toggleChecklist } = useJourney()
  const page = getPage('account.step2', prefs.language)
  usePageView('account.step2')

  const count = ITEMS.filter((i) => checklist[i.key]).length
  const allReady = count === ITEMS.length

  return (
    <StepScreen
      step={2}
      onBack={() => navigate('/step/1')}
      progressRight={`${count} of 3 ready`}
      footer={
        <Button disabled={!allReady} onClick={() => navigate('/step/3')}>
          {allReady ? 'Continue →' : 'Check items above to continue'}
        </Button>
      }
    >
      <h1 className="step__title">{page.title}</h1>
      <p className="step__intro">{pageText(page, prefs.wording)}</p>

      <div className="checklist" role="group" aria-label="Things to have ready">
        {ITEMS.map((item) => (
          <ChecklistItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            note={item.note}
            checked={checklist[item.key]}
            onToggle={() => toggleChecklist(item.key)}
          />
        ))}
      </div>

      <details className="expander">
        <summary>
          Not sure your phone has NFC?
          <ChevronDown size={20} aria-hidden="true" />
        </summary>
        <p>
          NFC lets your phone read the chip inside your passport. You need a smartphone with a camera and NFC.
          If you’re not sure, check your phone’s settings or manual, or tap Ask Sense.
        </p>
      </details>
    </StepScreen>
  )
}