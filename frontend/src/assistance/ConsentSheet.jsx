import { CircleCheck, ShieldCheck } from 'lucide-react'
import Button from '../components/Button'
import { ERROR_LABELS } from '../data/errors'

const SIZE = { default: 'Default text', large: 'Large text', larger: 'Larger text', largest: 'Largest text' }
const LANG = { en: 'English', zh: 'Chinese', ms: 'Malay', id: 'Bahasa Indonesia' }

export default function ConsentSheet({ share, onShare, onBack }) {
  const tried = [share.tried.tip && 'Tip banner', share.tried.chat && 'Assistant chat'].filter(Boolean)
  return (
    <div className="sheet">
      <p className="dialog__body">A staff member will see only this summary. Nothing is shared until you agree.</p>

      <dl className="summary">
        <div>
          <dt>Step</dt>
          <dd>{share.step_no} of 6 · {share.step_title}</dd>
        </div>
        <div>
          <dt>What happened</dt>
          <dd>{share.last_error ? ERROR_LABELS[share.last_error] ?? share.last_error : 'No error shown'}</dd>
        </div>
        <div>
          <dt>Help already tried</dt>
          <dd>
            {tried.length === 0 ? 'None yet' : (
              <span className="chips">
                {tried.map((t) => (
                  <span key={t} className="chip chip--done"><CircleCheck size={14} aria-hidden="true" /> {t}</span>
                ))}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>Your settings</dt>
          <dd>
            {share.preferences.wording === 'simple' ? 'Simple wording' : 'Standard wording'} ·{' '}
            {SIZE[share.preferences.text_size] ?? 'Default text'} · {LANG[share.preferences.language] ?? 'English'}
          </dd>
        </div>
      </dl>

      <p className="step__note">
        <ShieldCheck size={16} aria-hidden="true" />
        Staff never see your passport, ID, country, age or documents. Replies come as text here. No phone call.
      </p>

      <Button onClick={onShare}>Share and ask for help</Button>
      <Button variant="tertiary" onClick={onBack}>Go back</Button>
    </div>
  )
}
