import Button from '../components/Button'

export default function StaffStatusBar({ staff, onOpen }) {
  const { status, position, unread } = staff
  const text =
    status === 'waiting' ? (position <= 1 ? 'Staff help: you’re next in line' : `Staff help: number ${position} in line`)
    : status === 'joined' ? (unread ? 'New message from staff' : 'Staff has joined')
    : 'Staff has finished helping'
  return (
    <div className="staffbar" role="status">
      <span className="staffbar__text">{text}</span>
      <Button variant="secondary" fullWidth={false} onClick={onOpen}>{status === 'resolved' ? 'Continue' : 'View'}</Button>
    </div>
  )
}
