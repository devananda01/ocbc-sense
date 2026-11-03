import { Check, TriangleAlert } from 'lucide-react'

export default function Declaration({ checked, onToggle, error, disabled, children }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={`decl ${error ? 'decl--error' : ''}`.trim()}
      onClick={onToggle}
      disabled={disabled}
    >
      <span className={`decl__box ${checked ? 'decl__box--on' : ''}`.trim()} aria-hidden="true">
        {checked && <Check size={16} />}
      </span>
      <span>
        {children}
        {error && (
          <span className="decl__required">
            <TriangleAlert size={16} aria-hidden="true" /> Please tick this box
          </span>
        )}
      </span>
    </button>
  )
}