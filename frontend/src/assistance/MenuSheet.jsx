import { ChevronRight, Headset, Info, Bot } from 'lucide-react'
import Button from '../components/Button'

export default function MenuSheet({ canStaff, onChat, onStaff, onClose }) {
  return (
    <div className="sheet">
      <button className="sheet__row" onClick={onChat}>
        <span className="sheet__icon sheet__icon--red" aria-hidden="true"><Bot size={22} /></span>
        <span className="sheet__text">
          <span className="sheet__title">Chat with assistant</span>
          <span className="sheet__sub">Ask a question about this step.</span>
        </span>
        <ChevronRight size={20} aria-hidden="true" />
      </button>
      <button className="sheet__row" onClick={onStaff} disabled={!canStaff}>
        <span className="sheet__icon sheet__icon--green" aria-hidden="true"><Headset size={22} /></span>
        <span className="sheet__text">
          <span className="sheet__title">Talk to a staff member</span>
          <span className="sheet__sub">
            {canStaff ? 'A team member replies to you here in text.' : 'Available while you are signing up.'}
          </span>
        </span>
        <ChevronRight size={20} aria-hidden="true" />
      </button>
      <p className="step__note">
        <Info size={16} aria-hidden="true" />
        Staff only see your step, the error you saw and your display settings. Never your passport, ID or documents.
      </p>
      <Button variant="tertiary" onClick={onClose}>Close</Button>
    </div>
  )
}
