import { Clock, Headset, CircleCheck } from 'lucide-react'
import Button from '../components/Button'
import useT from '../i18n/useT'

export default function StaffSheet({ staff, onCancel, onClose }) {
  const { t } = useT()
  const { status, position, messages } = staff
  return (
    <div className="chat">
      <div className="staff__state" role="status">
        <span className={`sheet__icon ${status === 'waiting' ? 'sheet__icon--red' : 'sheet__icon--green'}`} aria-hidden="true">
          {status === 'waiting' && <Clock size={22} />}
          {status === 'joined' && <Headset size={22} />}
          {status === 'resolved' && <CircleCheck size={22} />}
        </span>
        <span className="sheet__text">
          <span className="sheet__title">
            {status === 'waiting' && (position <= 1 ? t('staff.next') : t('staff.position', { n: position }))}
            {status === 'joined' && t('staff.joined')}
            {status === 'resolved' && t('staff.done')}
          </span>
          <span className="sheet__sub">
            {status === 'waiting' && t('staff.waiting')}
            {status === 'joined' && t('staff.joined.sub')}
            {status === 'resolved' && t('staff.done.sub')}
          </span>
        </span>
      </div>

      <div className="chat__log" role="log" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className="msg msg--bot">
            <span className="msg__who">{t('chat.who.staff')}</span>
            <p className="msg__bubble">{m.text}</p>
            <span className="msg__time">{m.time}</span>
          </div>
        ))}
      </div>

      <div className="sheet">
        {status === 'resolved' ? (
          <Button onClick={onCancel}>{t('staff.continue')}</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>{t('staff.backToStep')}</Button>
            <Button variant="tertiary" onClick={onCancel}>{t('staff.cancel')}</Button>
          </>
        )}
      </div>
    </div>
  )
}
