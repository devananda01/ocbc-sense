import { useEffect, useRef } from 'react'

export default function CodeInput({ value, onChange, error, disabled }) {
  const refs = useRef([])
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '')

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  function type(i, text) {
    const digit = text.replace(/\D/g, '').slice(-1)
    if (!digit) return
    const at = Math.min(i, value.length)
    onChange((value.slice(0, at) + digit + value.slice(at + 1)).slice(0, 6))
    refs.current[Math.min(at + 1, 5)]?.focus()
  }

  function press(i, e) {
    if (e.key !== 'Backspace') return
    e.preventDefault()
    if (digits[i]) {
      onChange(value.slice(0, i) + value.slice(i + 1))
    } else if (i > 0) {
      onChange(value.slice(0, i - 1) + value.slice(i))
      refs.current[i - 1]?.focus()
    }
  }

  function paste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(text)
    refs.current[Math.min(text.length, 5)]?.focus()
  }

  return (
    <div className="code" role="group" aria-label="6-digit code" onPaste={paste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          className={`code__box ${error ? 'code__box--error' : ''}`.trim()}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1} of 6`}
          aria-invalid={error ? true : undefined}
          value={d}
          disabled={disabled}
          onChange={(e) => type(i, e.target.value)}
          onKeyDown={(e) => press(i, e)}
        />
      ))}
    </div>
  )
}