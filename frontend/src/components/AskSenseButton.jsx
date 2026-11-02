import { MessageSquare } from 'lucide-react'
import './AskSenseButton.css'

export default function AskSenseButton({ onClick }) {
  return (
    <div className="ask-sense-row">
      <button className="ask-sense" onClick={onClick}>
        <MessageSquare size={20} aria-hidden="true" />
        Ask Sense
      </button>
    </div>
  )
}