import { Clock, Headset, CircleCheck } from 'lucide-react'
import Button from '../components/Button'

export default function StaffSheet({ staff, onCancel, onClose }) {
  const { status, position, messages } = staff
  return (
    <div className="chat">
      <p className="step__caption">Simulated staff handoff — no real staff member is contacted.</p>
      <div className="staff__state" role="status">
        <span className={`sheet__icon ${status === 'waiting' ? 'sheet__icon--red' : 'sheet__icon--green'}`} aria-hidden="true">
          {status === 'waiting' && <Clock size={22} />}
          {status === 'joined' && <Headset size={22} />}
          {status === 'resolved' && <CircleCheck size={22} />}
        </span>
        <span className="sheet__text">
          <span className="sheet__title">
            {status === 'waiting' && (position <= 1 ? 'You’re next in line' : `You’re number ${position} in line`)}
            {status === 'joined' && 'Staff has joined'}
            {status === 'resolved' && 'Staff has finished helping'}
          </span>
          <span className="sheet__sub">
            {status === 'waiting' && 'You can close this and keep going. We’ll tell you when staff joins.'}
            {status === 'joined' && 'Replies show here as text. You do the step yourself.'}
            {status === 'resolved' && 'You can carry on from the same step.'}
          </span>
        </span>
      </div>

      <div className="chat__log" role="log" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className="msg msg--bot">
            <span className="msg__who">Staff</span>
            <p className="msg__bubble">{m.text}</p>
            <span className="msg__time">{m.time}</span>
          </div>
        ))}
      </div>

      <div className="sheet">
        {status === 'resolved' ? (
          <Button onClick={onCancel}>Continue</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>Back to the step</Button>
            <Button variant="tertiary" onClick={onCancel}>Cancel request</Button>
          </>
        )}
      </div>
    </div>
  )
}
