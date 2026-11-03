import { Headset, MessageSquare } from 'lucide-react'
import Button from '../components/Button'

// The reason is always stated, so no separate "Why am I seeing this?" is needed.
const REASONS = {
  long_pause: 'You’ve been on this step for a while. Would you like some help?',
  back_and_forth: 'You’ve come back to this step a few times. Would you like some help?',
  repeated_errors: 'This step didn’t work twice. Would you like some help?',
}

export default function OfferCard({ trigger, onChat, onStaff, onNo, onNever }) {
  return (
    <section className="offer" role="region" aria-labelledby="offer-title">
      <span className="sheet__icon sheet__icon--red" aria-hidden="true"><Headset size={22} /></span>
      <div className="offer__head">
        <h2 id="offer-title" className="offer__title">Need a hand?</h2>
        <p className="offer__reason">{REASONS[trigger] ?? REASONS.long_pause}</p>
      </div>
      <Button onClick={onChat}>
        <MessageSquare size={18} aria-hidden="true" /> Chat with assistant
      </Button>
      <Button variant="secondary" onClick={onStaff}>Talk to a staff member</Button>
      <div className="offer__foot">
        <button className="link-btn" onClick={onNo}>No thanks</button>
        <button className="link-btn link-btn--muted" onClick={onNever}>Don’t ask again</button>
      </div>
    </section>
  )
}
