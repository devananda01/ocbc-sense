const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const Session = require("./models/Session");
const Event = require("./models/Event");
const { EVENT_TYPES, SERVER_ONLY_TYPES } = Event;
const BROWSER_EVENT_TYPES = EVENT_TYPES.filter((t) => !SERVER_ONLY_TYPES.includes(t));

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ---------- database ----------
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";

// ---------- allowed values ----------
const PATCH_OUTCOMES = ["abandoned", "not_eligible"];   // "submitted" is set by /api/applications
const ELIGIBLE_COUNTRIES = ["HK", "MY", "ID", "CN"];     // Hong Kong, Malaysia, Indonesia, Mainland China

// ---------- REST: eligibility (nothing stored) ----------
app.post("/api/eligibility", (req, res) => {
  const { passport_country, is_18_or_older } = req.body;
  if (!ELIGIBLE_COUNTRIES.includes(passport_country))
    return res.json({ eligible: false, code: "COUNTRY_NOT_SUPPORTED" });
  if (is_18_or_older !== true)
    return res.json({ eligible: false, code: "AGE_REQUIREMENT" });
  res.json({ eligible: true });
});

// ---------- REST: sessions (one per journey attempt) ----------
let counter = 0;
app.post("/api/sessions", async (req, res) => {
  const { preferences = {} } = req.body;
  const id = "s" + Date.now() + "_" + ++counter;
  await Session.create({
    _id: id, source: "live",
    started_at: new Date(), preferences, current_preferences: preferences,
  });
  res.status(201).json({ session_id: id });
});

app.patch("/api/sessions/:id", async (req, res) => {
  const { current_preferences, outcome } = req.body;   // only these fields
  const update = {};
  if (current_preferences) update.current_preferences = current_preferences;
  if (outcome) {
    if (!PATCH_OUTCOMES.includes(outcome)) return res.status(400).json({ error: "bad_outcome" });
    update.outcome = outcome;
    update.ended_at = new Date();
  }
  const r = await Session.updateOne({ _id: req.params.id }, { $set: update }, { runValidators: true });
  if (r.matchedCount === 0) return res.sendStatus(404);
  res.sendStatus(204);
});

// ---------- REST: submit application (mock) ----------
app.post("/api/applications", async (req, res) => {
  const { session_id } = req.body;
  const r = await Session.updateOne(
    { _id: session_id, outcome: "in_progress" },
    { $set: { outcome: "submitted", ended_at: new Date() } }
  );
  if (r.matchedCount === 0) return res.status(400).json({ error: "session_not_active" });
  const reference = "APP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  res.status(201).json({ reference });   // shown on screen only, not stored
});

// ---------- REST: insights ----------
app.get("/api/insights/friction", async (req, res) => {
  const rows = await Event.aggregate([
    { $match: { type: /^friction:/ } },
    { $group: { _id: { page: "$page_id", type: "$type" }, count: { $sum: 1 } } },
  ]);
  res.json(rows);
});

// ---------- REST: errors ----------
// Mongoose rejects values that don't match a schema (e.g. language: "fr") → 400
app.use((err, req, res, next) => {
  if (err.name === "ValidationError" || err.name === "CastError")
    return res.status(400).json({ error: "invalid_data", fields: Object.keys(err.errors || { [err.path]: 1 }) });
  console.error(err);
  res.status(500).json({ error: "server_error" });
});

// ---------- Socket.IO ----------
io.on("connection", (socket) => {
  // the console tells the server who it is
  socket.on("join_console", () => socket.join("console"));

  // events from the customer app (only during a journey)
  socket.on("event", async (e, ack) => {
    try {
      if (!BROWSER_EVENT_TYPES.includes(e?.type)) return ack?.({ ok: false, error: "unknown_type" });
      const session = await Session.findById(e.session_id).lean();
      if (!session) return ack?.({ ok: false, error: "unknown_session" });

      await Event.create({
        session_id: e.session_id, page_id: e.page_id, type: e.type,
        source: session.source, time: new Date(),
      });
      io.to("console").emit("insights:update");   // charts refresh
      ack?.({ ok: true });
    } catch (err) {
      ack?.({ ok: false, error: "invalid_event" });  // e.g. missing page_id
    }
  });

  // hand-off: customer -> console
  socket.on("handoff:request", (data) => {
    io.to("console").emit("handoff:new", { ...data, customer: socket.id });
  });

  // hand-off: console -> that customer
  socket.on("handoff:accepted", (d) => io.to(d.customer).emit("handoff:accepted"));
  socket.on("handoff:message",  (d) => io.to(d.customer).emit("handoff:message", d.text));
  socket.on("handoff:resolved", (d) => io.to(d.customer).emit("handoff:resolved"));
});

// ---------- start ----------
mongoose.connect(MONGO_URL, { dbName: "askdontassume" })
  .then(() => {
    const port = process.env.PORT || 3000;
    server.listen(port, "0.0.0.0", () => console.log(`Server on :${port}`));
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
