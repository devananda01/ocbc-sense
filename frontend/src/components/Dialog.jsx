import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import './Dialog.css'

export default function Dialog({ open, onClose, title, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      <div className="dialog__panel">
        <div className="dialog__handle" aria-hidden="true" />
        <div className="dialog__head">
          <h2 id="dialog-title" className="dialog__title">{title}</h2>
          <button className="dialog__close" onClick={onClose} aria-label="Close">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}