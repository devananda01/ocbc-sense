import Button from './Button'

export default function DetailRow({ icon: Icon, label, value, onEdit }) {
  return (
    <div className="detail">
      <span className="detail__icon" aria-hidden="true"><Icon size={20} /></span>
      <span className="detail__text">
        <span className="detail__label">{label}</span>
        <span className="detail__value">{value}</span>
      </span>
      {onEdit && (
        <Button variant="tertiary" aria-label={`Edit ${label}`} onClick={onEdit}>Edit</Button>
      )}
    </div>
  )
}