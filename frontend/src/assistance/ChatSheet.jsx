import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Info } from 'lucide-react'
import Button from '../components/Button'
import { suggestedQuestions } from '../data/answers'

export default function ChatSheet({ title, pageId, messages, asking, canStaff, onAsk, onRate, onStaff }) {
  const [text, setText] = useState('')
  const endRef = useRef(null)
  const asked = new Set(messages.filter((m) => m.from === 'user').map((m) => m.text))
  const chips = suggestedQuestions(pageId).filter((q) => !asked.has(q))

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' })
  }, [messages, asking])

  function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    onAsk(text)
    setText('')
  }

  return (
    <div className="chat">
      {title && (
        <p className="chat__context">
          <Info size={14} aria-hidden="true" /> Helping with: {title}
        </p>
      )}
      <div className="chat__log" role="log" aria-live="polite">
        {messages.length === 0 && <p className="chat__empty">Ask about this step, or tap a question below.</p>}
        {messages.map((m) =>
          m.from === 'user' ? (
            <div key={m.id} className="msg msg--user">
              <p className="msg__bubble">{m.text}</p>
              <span className="msg__time">{m.time}</span>
            </div>
          ) : (
            <div key={m.id} className="msg msg--bot">
              <span className="msg__who">OCBC Sense</span>
              <p className="msg__bubble">{m.text}</p>
              <span className="msg__time">{m.time}</span>
              {canStaff && (m.fallback || m.refused) && m.feedback === null && (
                <Button variant="secondary" fullWidth={false} onClick={onStaff}>Talk to a staff member</Button>
              )}
              {!m.fallback && !m.refused && m.feedback === null && (
                <div className="msg__rate">
                  <Button variant="secondary" fullWidth={false} onClick={() => onRate(m.id, 'helped')}>That helped</Button>
                  {canStaff ? (
                    <Button variant="tertiary" fullWidth={false} onClick={() => onRate(m.id, 'not_helped')}>
                      Still stuck → Talk to a person
                    </Button>
                  ) : (
                    <Button variant="tertiary" fullWidth={false} onClick={() => onRate(m.id, 'not_helped')}>Still stuck</Button>
                  )}
                </div>
              )}
              {m.feedback === 'helped' && <span className="msg__time">Glad that helped.</span>}
            </div>
          )
        )}
        {asking && <p className="chat__typing" role="status">Sense is typing…</p>}
        <div ref={endRef} />
      </div>

      {chips.length > 0 && (
        <div className="chat__chips">
          {chips.map((q) => (
            <button key={q} type="button" className="chip" onClick={() => onAsk(q)} disabled={asking}>{q}</button>
          ))}
        </div>
      )}

      <form className="chat__form" onSubmit={send}>
        <input
          className="chat__input"
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question"
          aria-label="Type your question"
        />
        <button className="chat__send" type="submit" aria-label="Send" disabled={!text.trim() || asking}>
          <ArrowUp size={20} aria-hidden="true" />
        </button>
      </form>
      <p className="step__caption">Simulated AI assistant for this prototype. Answers are pre-written for this step; please don’t type personal details.</p>
    </div>
  )
}
