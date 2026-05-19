import { useState, useEffect } from "react";
import { QUICK_CHIPS, SAVED_TRIPS, MOCK_TRIP, matchTrip } from "./data/trips.js";
import { PIPELINE } from "./data/api.js";
import { THINKING_STEPS } from "./data/trips.js";
import { Landing, Thinking, PlanView } from "./components/Views.jsx";
import { SavedTrips } from "./components/Saved.jsx";
import { Bookings } from "./components/Bookings.jsx";
import { SwapModal, BookModal, InspectModal, TripPlanModal } from "./components/Plan.jsx";
import { FloatingAgent } from "./components/FloatingAgent.jsx";

function recomputeBreakdown(days, original) {
  const buckets = { flights: 0, stay: 0, car: 0, food: 0, fun: 0 };
  const map = { flight: "flights", hotel: "stay", car: "car", train: "car", bus: "car", food: "food", fun: "fun" };
  for (const d of days) for (const e of d.events) {
    const k = map[e.icon] || "fun";
    buckets[k] += (e.cost || 0);
  }
  return original.map(b => ({ ...b, val: buckets[b.key] || 0 }));
}

function nowStamp() {
  return "Saved " + new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function tripToSaved(trip, { archived = false } = {}) {
  return {
    id: trip.id + "-" + Date.now(),
    tripId: trip.id,
    title: trip.title + " — " + trip.vibe,
    where: trip.destination + " · " + trip.nights + " days",
    hero: trip.hero,
    color: trip.color,
    savedAt: nowStamp(),
    priceWhenSaved: trip.total,
    priceNow: trip.total,
    nights: trip.nights,
    travelers: trip.travelers,
    archived,
  };
}

function tripToBooking(trip) {
  return {
    id: "book-" + trip.id + "-" + Date.now(),
    tripId: trip.id,
    title: trip.title + " — " + trip.vibe,
    where: trip.destination + " · " + trip.nights + " days",
    hero: trip.hero,
    color: trip.color,
    bookedAt: "Booked " + new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    total: trip.total,
    travelers: trip.travelers,
    confirmation: Math.random().toString(36).slice(2, 8).toUpperCase(),
    cancelled: false,
  };
}

export default function App() {
  const [view, setView] = useState("landing");
  const [prompt, setPrompt] = useState("");
  const [chips, setChips] = useState(QUICK_CHIPS.map(c => ({ ...c, active: true })));
  const [thinkStep, setThinkStep] = useState(0);
  const [pipeIdx, setPipeIdx] = useState(0);
  const [inspect, setInspect] = useState(null);
  const [agentMood, setAgentMood] = useState("idle");
  const [locks, setLocks] = useState({ "Sun, Sep 14-0": true });
  const [refine, setRefine] = useState("");
  const [swap, setSwap] = useState(null);
  const [book, setBook] = useState(null);
  const [trip, setTrip] = useState(MOCK_TRIP);

  const [saved, setSaved] = useState(SAVED_TRIPS.map(t => ({ ...t, archived: false })));
  const [bookings, setBookings] = useState([]);
  const [planPopupOpen, setPlanPopupOpen] = useState(false);
  const [savedCurrentTrip, setSavedCurrentTrip] = useState(false);
  const [archivedCurrentTrip, setArchivedCurrentTrip] = useState(false);

  const startThinking = () => startThinkingWith(prompt);

  const startThinkingWith = (text) => {
    const matched = matchTrip(text);
    setPrompt(text);
    setTrip(matched);
    setLocks({});
    setView("thinking");
    setThinkStep(0);
    setPipeIdx(0);
    setAgentMood("thinking");
    setSavedCurrentTrip(false);
    setArchivedCurrentTrip(false);
  };

  useEffect(() => {
    if (view !== "thinking") return;
    const pipeMax = PIPELINE.length - 1;
    if (pipeIdx < pipeMax) {
      const id = setTimeout(() => setPipeIdx(p => p + 1), 380);
      return () => clearTimeout(id);
    }
  }, [view, pipeIdx]);

  useEffect(() => {
    if (view !== "thinking") return;
    if (thinkStep < THINKING_STEPS.length - 1) {
      const id = setTimeout(() => setThinkStep(s => s + 1), 900);
      return () => clearTimeout(id);
    } else {
      const id = setTimeout(() => {
        setAgentMood("happy");
        setView("plan");
        setPlanPopupOpen(true);
      }, 900);
      return () => clearTimeout(id);
    }
  }, [view, thinkStep]);

  const toggleLock = (key) => {
    setLocks(l => ({ ...l, [key]: !l[key] }));
  };

  const onSwap = (ev) => setSwap({ kind: ev.icon === "flight" ? "flight" : ev.icon === "hotel" ? "hotel" : "car", ev });

  const applySwap = (opt) => {
    if (!swap) return setSwap(null);
    const targetKind = swap.kind;
    const targetTitle = swap.ev.title;
    setTrip(t => {
      const days = t.days.map(d => ({
        ...d,
        events: d.events.map(e => {
          if (e.icon !== targetKind) return e;
          if (e.title !== targetTitle) return e;
          return { ...e, title: opt.title, meta: opt.meta, cost: opt.price, was: e.cost > opt.price ? e.cost : undefined };
        }),
      }));
      const breakdown = recomputeBreakdown(days, t.breakdown);
      const total = breakdown.reduce((s, b) => s + b.val, 0);
      return { ...t, days, breakdown, total, perPerson: Math.round(total / (t.travelers || 1)) };
    });
    setSwap(null);
  };

  const onApplyRefine = () => {
    const text = refine.toLowerCase();
    setTrip(t => {
      let days = t.days;
      if (text.includes("cheaper hotel") || text.includes("airbnb")) {
        days = days.map(d => ({ ...d, events: d.events.map(e => e.icon === "hotel" ? { ...e, was: e.cost, cost: Math.round(e.cost * 0.62), title: e.title.replace(/·.+/, "· Airbnb instead"), meta: "Highly-rated · self check-in" } : e) }));
      }
      if (text.includes("nonstop")) {
        days = days.map(d => ({ ...d, events: d.events.map(e => e.icon === "flight" && /stop/i.test(e.meta) ? { ...e, meta: e.meta.replace(/.*stop[^·]*/i, "Nonstop"), cost: Math.round(e.cost * 1.15), was: e.cost } : e) }));
      }
      if (text.includes("drop") && text.includes("car")) {
        days = days.map(d => ({ ...d, events: d.events.filter(e => e.icon !== "car") }));
      }
      if (text.includes("add") && (text.includes("beach") || text.includes("day"))) {
        const idx = Math.min(2, days.length - 1);
        const extra = { time: "10:00", icon: "fun", emoji: "🏖️", title: "Extra beach day", meta: "Cabana + lunch · added by you", cost: 120 };
        days = days.map((d, i) => i === idx ? { ...d, events: [...d.events, extra] } : d);
      }
      if (text.includes("cheaper") && !text.includes("hotel")) {
        days = days.map(d => ({ ...d, events: d.events.map(e => e.icon === "flight" ? { ...e, was: e.cost, cost: Math.round(e.cost * 0.70), title: e.title.replace("Nonstop", "1 stop"), meta: e.meta.replace("Nonstop", "1 stop · longer") } : e) }));
      }
      const breakdown = recomputeBreakdown(days, t.breakdown);
      const total = breakdown.reduce((s, b) => s + b.val, 0);
      return { ...t, days, breakdown, total, perPerson: Math.round(total / (t.travelers || 1)) };
    });
    setRefine("");
  };

  const handleSaveCurrent = ({ archived = false } = {}) => {
    setSaved(list => [tripToSaved(trip, { archived }), ...list]);
    if (archived) setArchivedCurrentTrip(true);
    else setSavedCurrentTrip(true);
  };

  const handleRemoveSaved = (id) => {
    setSaved(list => list.filter(t => t.id !== id));
  };

  const handleArchiveSaved = (id) => {
    setSaved(list => list.map(t => t.id === id ? { ...t, archived: true } : t));
  };

  const handleUnarchiveSaved = (id) => {
    setSaved(list => list.map(t => t.id === id ? { ...t, archived: false } : t));
  };

  const handleCancelBooking = (id) => {
    setBookings(list => list.map(b => b.id === id ? { ...b, cancelled: true } : b));
  };

  const activeSavedCount = saved.filter(t => !t.archived).length;
  const navAgentHidden = view === "saved" || view === "bookings";

  return (
    <div className="app">
      <header className="nav">
        <div className="brand">
          <div className="brand-mark"></div>
          <span>trvlplnnr</span>
        </div>
        <nav className="nav-links">
          <button className={"nav-link " + (view === "landing" || view === "thinking" || view === "plan" ? "active" : "")} onClick={() => { setView("landing"); setAgentMood("idle"); }}>Plan a trip</button>
          <button className={"nav-link " + (view === "saved" ? "active" : "")} onClick={() => setView("saved")}>Saved trips ({activeSavedCount})</button>
          <button className={"nav-link " + (view === "bookings" ? "active" : "")} onClick={() => setView("bookings")}>Bookings{bookings.filter(b => !b.cancelled).length ? ` (${bookings.filter(b => !b.cancelled).length})` : ""}</button>
        </nav>
        <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>
          <span style={{ width: 22, height: 22, borderRadius: 99, background: "var(--coral)", color: "white", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>M</span>
          Maya
        </button>
      </header>

      <main className="main">
        {view === "landing" && <Landing prompt={prompt} setPrompt={setPrompt} chips={chips} setChips={setChips} onSend={startThinking} onPickSuggestion={(label, send) => { setPrompt(label); if (send) setTimeout(() => startThinkingWith(label), 50); }} />}
        {view === "thinking" && <Thinking prompt={prompt} chips={chips} thinkStep={thinkStep} pipeIdx={pipeIdx} />}
        {view === "plan" && (
          <PlanView
            trip={trip} locks={locks} toggleLock={toggleLock}
            onSwap={onSwap} refine={refine} setRefine={setRefine}
            onApplyRefine={onApplyRefine}
            onBook={() => setBook("choose")}
            onInspect={setInspect}
          />
        )}
        {view === "saved" && (
          <SavedTrips
            trips={saved}
            onOpen={() => setView("plan")}
            onRemove={handleRemoveSaved}
            onArchive={handleArchiveSaved}
            onUnarchive={handleUnarchiveSaved}
          />
        )}
        {view === "bookings" && (
          <Bookings
            bookings={bookings}
            onCancel={handleCancelBooking}
          />
        )}
      </main>

      <footer className="footer">
        <span>© trvlplnnr — your AI travel concierge</span>
        <span>prices update every 6 hours · usd</span>
      </footer>

      <FloatingAgent mood={agentMood} hidden={navAgentHidden} />

      <TripPlanModal
        trip={trip}
        open={planPopupOpen && view === "plan"}
        onClose={() => setPlanPopupOpen(false)}
        onSave={() => handleSaveCurrent({ archived: false })}
        onArchive={() => handleSaveCurrent({ archived: true })}
        alreadySaved={savedCurrentTrip}
        alreadyArchived={archivedCurrentTrip}
      />

      <SwapModal kind={swap?.kind} onClose={() => setSwap(null)} onChoose={applySwap} />
      <InspectModal kind={inspect} onClose={() => setInspect(null)} />
      <BookModal
        stage={book}
        onClose={() => setBook(null)}
        onSavedLinks={() => setBook("links")}
        onConfirm={(action) => {
          if (action === "agent") setBook("card");
          else if (action === "pay") {
            setBook("progress");
            setTimeout(() => {
              setBookings(list => [tripToBooking(trip), ...list]);
              setBook("done");
            }, 4500);
          }
        }}
      />
    </div>
  );
}
