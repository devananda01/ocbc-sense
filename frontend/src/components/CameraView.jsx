import './CameraView.css'

export default function CameraView({ shape = 'card', children }) {
  const description =
    shape === 'card'
      ? 'Simulated camera view with a frame for your ID card'
      : 'Simulated camera view with an oval for your face'
  return (
    <div className={`camera camera--${shape}`} role="img" aria-label={description}>
      <span className="camera__frame" aria-hidden="true" />
      <p className="camera__hint">{children}</p>
      <span className="camera__label">Simulated camera view</span>
    </div>
  )
}