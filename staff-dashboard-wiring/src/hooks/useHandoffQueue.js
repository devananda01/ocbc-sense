// Live queue of help requests, in the same shape as mockData.js's `applicants`,
// so FrictionQueue.jsx only needs one import changed.
import { useEffect, useState } from "react";
import { socket } from "../socket";

const TRIGGER_LABELS = {
  repeated_errors: "Action failed twice",
  long_pause: "No input for 45s",
  back_and_forth: "Back used twice",
};

const mmss = (seconds) =>
  seconds == null
    ? "—"
    : `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

// handoff:new payload → one queue item
export function toApplicant(request) {
  const share = request.share || {};
  return {
    id: request.session_id.slice(-4),             // short label: "Applicant #…_1"
    sessionId: request.session_id,
    pageId: request.page_id,
    customer: request.customer,                   // needed to reply (until session rooms land)
    phone: "",                                    // not collected, by design
    step: share.step_no,
    stepName: share.step_title || request.page_id,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: TRIGGER_LABELS[share.trigger] || "Asked for help",
    detail: share.last_error || null,
    error: share.last_error || null,
    inactivity: mmss(share.time_on_step_s),
    failedAttempts: share.failed_attempts || 0,
    lastInteraction: share.back_count ? `Back used ${share.back_count}×` : "—",
    events: [],                                   // filled in by the server later (event stream)
  };
}

export default function useHandoffQueue() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const onNew = (request) =>
      setQueue((previous) => [
        toApplicant(request),
        ...previous.filter((a) => a.sessionId !== request.session_id),   // newest first, no duplicates
      ]);

    socket.on("handoff:new", onNew);
    return () => socket.off("handoff:new", onNew);
  }, []);

  return queue;
}
