# Staff dashboard: connecting the queue to the backend

Tonight's goal: **real help requests appear in the Friction Queue.** Chat comes tomorrow.

## 1. Install the Socket.IO client

```bash
npm install socket.io-client@4
```

## 2. Add two files

Copy these into the dashboard's `src/` folder:

| File | What it does |
|---|---|
| `src/socket.js` | Opens one connection to the backend and sends `join_console` on every (re)connect |
| `src/hooks/useHandoffQueue.js` | Listens for `handoff:new` and returns the queue in the **same shape as `applicants` in `mockData.js`** |

## 3. Tell it where the backend is

Create `.env.local` in the dashboard folder:
```
VITE_API_URL=http://localhost:3000
```
Use Laptop A's IP instead when the backend runs on another machine, e.g. `http://172.20.10.4:3000`. Restart `npm run dev` after changing it.

## 4. Change `src/pages/FrictionQueue.jsx`

**Imports**: replace the mock `applicants` with the live queue:
```js
// before
import { applicants, onboardingSteps } from "../data/mockData";

// after
import { onboardingSteps } from "../data/mockData";
import useHandoffQueue from "../hooks/useHandoffQueue";
import { socket } from "../socket";
```

**Top of `FrictionQueue()`**:
```js
const applicants = useHandoffQueue();
const [selectedId, setSelectedId] = useState(null);      // was "491"
const [chatOpen, setChatOpen] = useState(false);         // was true
const [resolvedIds, setResolvedIds] = useState([]);

const selected =
  applicants.find((a) => String(a.id) === selectedId) || applicants[0];   // first request if none picked
```

**Pick Up Chat**: tell the server, so the applicant sees "Staff has joined":
```js
const handlePickUpChat = (applicantId) => {
  const applicant = applicants.find((a) => String(a.id) === String(applicantId));
  if (applicant) socket.emit("handoff:accepted", { customer: applicant.customer });
  setSelectedId(String(applicantId));
  setChatOpen(true);
};
```

**Empty queue**: the existing `if (!selected)` already handles it; change the text:
```js
if (!selected) {
  return <p>No help requests yet.</p>;
}
```

Nothing else in the page needs to change: each queue item has the same fields as before (`id`, `sessionId`, `step`, `stepName`, `status`, `inactivity`, `failedAttempts`, `events`, …).

## 5. Test it without the customer app

With the backend running, in the backend folder:
```bash
SID=$(curl -s -X POST localhost:3000/api/sessions -H "Content-Type: application/json" \
  -d '{}' | sed 's/.*"session_id":"\([^"]*\)".*/\1/')
node test-client.js $SID
```
`test-client.js` sends a help request for step 3. **A card should appear in the Friction Queue straight away.**

## Field mapping (handoff:new → queue item)

| Queue item field | Comes from | Notes |
|---|---|---|
| `id` | last 4 characters of `session_id` | Short label for the card |
| `sessionId` | `session_id` | |
| `customer` | `customer` (added by the server) | Used to reply; replaced by session rooms tomorrow |
| `step`, `stepName` | `share.step_no`, `share.step_title` | |
| `status` | `share.trigger` | `repeated_errors` → "Action failed twice", etc. |
| `error`, `detail` | `share.last_error` | e.g. `NFC_READ_FAILED` |
| `inactivity` | `share.time_on_step_s` | Shown as mm:ss |
| `failedAttempts` | `share.failed_attempts` | |
| `lastInteraction` | `share.back_count` | |
| `phone` | — | Empty: phone numbers aren't collected |
| `events` | — | Empty for now; the server will add the step's recent events later |

**For Deva:** the customer app's `share` should include `step_no`, `step_title`, `trigger`, `last_error`, `failed_attempts`, `back_count` and `time_on_step_s`. Anything missing just shows as "—".

## Still mock until tomorrow

The chat panel, Escalated tab, SLA and average-resolution numbers. Those need `handoff:reply`, hand-off logging and message storage on the backend.
