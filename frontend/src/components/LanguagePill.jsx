import { Check } from 'lucide-react'
import './LanguagePill.css'

const OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
  { code: 'ms', label: 'BM' },
]

export default function LanguagePill({ value, onChange }) {
  return (
    <div className="lang-pill" role="radiogroup" aria-label="Language">
      {OPTIONS.map((o) => {
        const selected = o.code === value
        return (
          <button
            key={o.code}
            role="radio"
            aria-checked={selected}
            className={`lang-pill__opt ${selected ? 'lang-pill__opt--on' : ''}`.trim()}
            onClick={() => onChange(o.code)}
          >
            {selected && <Check size={14} aria-hidden="true" />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}