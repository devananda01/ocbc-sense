# OCBC Sense frontend integration notes

## Backend contract currently integrated

- `POST /api/sessions` with `{ preferences }`
- `POST /api/eligibility` with `{ passport_country, is_18_or_older }`
- `PATCH /api/sessions/:id` with `{ current_preferences }` or `{ outcome }`
- `POST /api/applications` with `{ session_id }`
- Socket.IO `event` with `{ session_id, page_id, type }`

## Simulated in this frontend by design

- NFC passport chip scan
- Camera / identity capture and face verification
- AI assistance
- Staff handoff

OTP has been removed.

## Document handling

The supplied API documentation does not define a document upload endpoint. It says OCBC requests supporting documents by email after application submission. The frontend therefore records a document-type preparation choice only; it does not claim that a file was uploaded.

## Important backend limitation

The documented `POST /api/applications` request contains only `session_id`. The backend documentation explicitly says application details, documents and reference number are not stored in MongoDB. Therefore the contact details and personal documents are not transmitted or persisted by this API contract.

## Run

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and set `VITE_API_URL` to the backend address.
3. Start the backend and its MongoDB/Socket.IO services.
4. Run `npm run dev`.

`socket.io-client` is required for journey event delivery.
