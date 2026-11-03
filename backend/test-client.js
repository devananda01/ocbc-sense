// Tests Socket.IO: plays both an applicant and a staff console.
// Usage: node test-client.js <session_id>
const { io } = require("socket.io-client");

const URL = process.env.SERVER || "http://localhost:3000";
const sessionId = process.argv[2];
if (!sessionId) {
  console.log("Usage: node test-client.js <session_id>");
  process.exit(1);
}

const consoleSocket = io(URL);
const applicant = io(URL);

// ---- console side
consoleSocket.on("connect", () => {
  consoleSocket.emit("join_console");
  console.log("console: connected and joined");
});
consoleSocket.on("insights:update", () => console.log("console: insights:update received"));
consoleSocket.on("handoff:new", (h) => {
  console.log("console: help request for step", h.share.step_no);
  consoleSocket.emit("handoff:accepted", { customer: h.customer });
  consoleSocket.emit("handoff:message", { customer: h.customer, text: "Try removing your phone case." });
  consoleSocket.emit("handoff:resolved", { customer: h.customer });
});

// ---- applicant side
applicant.on("handoff:accepted", () => console.log("applicant: staff has joined"));
applicant.on("handoff:message", (t) => console.log("applicant: message ->", t));
applicant.on("handoff:resolved", () => {
  console.log("applicant: resolved. All tests done.");
  process.exit(0);
});

applicant.on("connect", () => {
  console.log("applicant: connected");
  setTimeout(() => {
    applicant.emit("event",
      { session_id: sessionId, page_id: "account.step3", type: "error:NFC_READ_FAILED" },
      (res) => console.log("applicant: event ack ->", res));
    applicant.emit("event",
      { session_id: sessionId, page_id: "account.step3", type: "error:NOT_A_REAL_CODE" },
      (res) => console.log("applicant: bad event ack ->", res));
    setTimeout(() => applicant.emit("handoff:request",
      { session_id: sessionId, page_id: "account.step3", share: { step_no: 3 } }), 300);
  }, 300);
});

setTimeout(() => {
  console.log("Timed out: is the server running?");
  process.exit(1);
}, 5000);
