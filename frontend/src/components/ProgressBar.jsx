import './ProgressBar.css'

export default function ProgressBar({ current, total = 6, label, right }) {
  const text = label ?? `Step ${current} of ${total}`
  return (
    <div className="progress">
      <div className="progress__top">
        <p className="progress__label">{text}</p>
        {right && <span className="progress__right">{right}</span>}
      </div>
      <div className="progress__segments" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`progress__seg ${i < current ? 'progress__seg--on' : ''}`.trim()}
          />
        ))}
      </div>
    </div>
  )
}