import { useNavigate } from 'react-router-dom'
import Screen from '../components/Screen'
import Header from '../components/Header'
import Button from '../components/Button'

export default function Placeholder({ title, message }) {
  const navigate = useNavigate()
  return (
    <Screen
      header={<Header onBack={() => navigate(-1)} />}
      footer={<Button variant="secondary" onClick={() => navigate('/welcome')}>Back to start</Button>}
    >
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h1>
      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{message}</p>
    </Screen>
  )
}