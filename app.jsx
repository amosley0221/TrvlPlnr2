// Main app — state machine: landing → thinking → plan → booked
const { useState, useEffect } = React;

// Recompute the cost-breakdown buckets from the current days, preserving labels/colors.
function recomputeBreakdown(days, original) {
  const buckets = { flights: 0, stay: 0, car: 0, food: 0, fun: 0 };
  const map = { flight: "flights", hotel: "stay", car: "car", train: "car", bus: "car", food: "food", fun: "fun" };
  for (const d of days) for (const e of d.events) {
    const k = map[e.icon] || "fun";
    buckets[k] += (e.cost || 0);
  }
  return original.map(b => ({ ...b, val: buckets[b.key] || 0 }));
}


function App() {
  const [view, setView] = useState("landing"); // landing | thinking | plan | saved
  const [prompt, setPrompt] = useState("");
  const [chips, setChips] = useState(window.QUICK_CHIPS.map(c => ({ ...c, active: true })));
  const [thinkStep, setThinkStep] = useState(0);
  const [pipeIdx, setPipeIdx] = useState(0);
  const [inspect, setInspect] = useState(null);
  const [agentMood, setAgentMood] = useState("idle");
  const [locks, setLocks] = useState({ "Sun, Sep 14-0": true }); // flight locked by default
  const [refine, setRefine] = useState("");
  const [swap, setSwap] = useState(null); // { kind, ev }
  const [book, setBook] = useState(null);
  const [trip, setTrip] = useState(window.MOCK_TRIP);

  const startThinking = () => startThinkingWith(prompt);

  const startThinkingWith = (text) => {
    // Pick a trip based on prompt + active chips.
    const matched = window.matchTrip(text);
    setPrompt(text);
    setTrip(matched);
    setLocks({}); // reset locks for new trip
    setView("thinking");
    setThinkStep(0);
    setPipeIdx(0);
    setAgentMood("thinking");
  };

  useEffect(() => {
    if (view !== "thinking") return;
    const steps = window.THINKING_STEPS;
    // Advance pipeline ~2x faster than story log so both finish roughly together
    const pipeMax = window.PIPELINE.length - 1;
    if (pipeIdx < pipeMax) {
      const id = setTimeout(() => setPipeIdx(p => p + 1), 380);
      return () => clearTimeout(id);
    }
  }, [view, pipeIdx]);

  useEffect(() => {
    if (view !== "thinking") return;
    const steps = window.THINKING_STEPS;
    if (thinkStep < steps.length - 1) {
      const id = setTimeout(() => setThinkStep(s => s + 1), 900);
      return () => clearTimeout(id);
    } else {
      const id = setTimeout(() => {
        setAgentMood("happy");
        setView("plan");
      }, 900);
      return () => clearTimeout(id);
    }
  }, [view, thinkStep]);

  const toggleLock = (key) => {
    setLocks(l => ({ ...l, [key]: !l[key] }));
  };

  const onSwap = (ev) => setSwap({ kind: ev.icon === "flight" ? "flight" : ev.icon === "hotel" ? "hotel" : "car", ev });

  // Apply a swap: replace the matching event in the trip and recompute totals.
  const applySwap = (opt) => {
    if (!swap) return setSwap(null);
    const targetKind = swap.kind; // 'flight' | 'hotel' | 'car'
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

  // Apply a refine quick action — mutate trip in a believable way.
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

  return (
    <div className="app">
      <header className="nav">
        <div className="brand">
          <div className="brand-mark"></div>
          <span>trvlplnnr</span>
        </div>
        <nav className="nav-links">
          <button className={"nav-link " + (view === "landing" || view === "thinking" || view === "plan" ? "active" : "")} onClick={() => setView("landing")}>Plan a trip</button>
          <button className={"nav-link " + (view === "saved" ? "active" : "")} onClick={() => setView("saved")}>Saved trips ({window.SAVED_TRIPS.length})</button>
          <button className="nav-link">Bookings</button>
        </nav>
        <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }}>
          <span style={{ width: 22, height: 22, borderRadius: 99, background: "var(--coral)", color: "white", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>M</span>
          Maya
        </button>
      </header>

      <main className="main">
        {view === "landing" && <Landing prompt={prompt} setPrompt={setPrompt} chips={chips} setChips={setChips} onSend={startThinking} agentMood={agentMood} onPickSuggestion={(label, send) => { setPrompt(label); if (send) setTimeout(() => startThinkingWith(label), 50); }} />}
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
        {view === "saved" && <SavedTrips trips={window.SAVED_TRIPS} onOpen={() => setView("plan")} />}
      </main>

      <footer className="footer">
        <span>© trvlplnnr — your AI travel concierge</span>
        <span>prices update every 6 hours · usd</span>
      </footer>

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
            setTimeout(() => setBook("done"), 4500);
          }
        }}
      />
    </div>
  );
}

Object.assign(window, { App });
