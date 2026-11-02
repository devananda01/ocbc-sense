import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Splash.css'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/welcome', { replace: true }), 2000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="splash" role="status" aria-label="Loading">
      <h1 className="splash__name">OCBC Sense</h1>
      <p className="splash__tag">Ask, don’t assume</p>
      <span className="splash__spinner" aria-hidden="true" />
    </div>
  )
}