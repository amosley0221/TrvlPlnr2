import { useState, useEffect } from "react";
import { fmtMoney, SWAP_OPTIONS } from "../data/trips.js";
import { DUFFEL_OFFER, BOOKING_HOTEL } from "../data/api.js";
import { jsonHighlight } from "./Pipeline.jsx";

export function TripHeader({ trip }) {
  return (
    <div className="trip-header">
      <div className="trip-meta">
        <span className="pill">📅 {trip.dateFrom} → {trip.dateTo}</span>
        <span className="pill">👯 {trip.travelers} travelers</span>
        <span className="pill">💞 {trip.vibe}</span>
        <span className="pill">🌍 {trip.origin}</span>
      </div>
      <h2 className="trip-title">
        <span className="accent">{trip.nights} nights</span> in {trip.title} {trip.hero}
      </h2>
      <p className="trip-sub">{trip.destination}</p>
      <div className="total-block">
        <div className="label">Trip total</div>
        <div className="num">{fmtMoney(trip.total)}</div>
        <div className="per">{fmtMoney(trip.perPerson)} / person</div>
      </div>
    </div>
  );
}

export function CostBreakdown({ trip }) {
  const total = trip.breakdown.reduce((s, b) => s + b.val, 0);
  return (
    <div className="side-card">
      <h3>Where the money goes</h3>
      <div style={{ display: "flex", height: 14, borderRadius: 999, overflow: "hidden", border: "2.5px solid var(--ink)", margin: "10px 0 14px" }}>
        {trip.breakdown.map(b => (
          <div key={b.key} style={{ width: ((b.val / total) * 100) + "%", background: b.color, borderRight: "2px solid var(--ink)" }}></div>
        ))}
      </div>
      {trip.breakdown.map(b => (
        <div key={b.key} className="cost-row">
          <span className="lbl"><span style={{ width: 12, height: 12, borderRadius: 4, border: "2px solid var(--ink)", display: "inline-block", background: b.color }}></span> {b.emoji} {b.label}</span>
          <span className="val">{fmtMoney(b.val)}</span>
        </div>
      ))}
      <div className="total">
        <span style={{ fontFamily: "Fraunces, serif", fontSize: 18 }}>Total</span>
        <span className="num">{fmtMoney(total)}</span>
      </div>
    </div>
  );
}

export function InspectModal({ kind, onClose }) {
  if (!kind) return null;
  const data = kind === "flight" ? DUFFEL_OFFER : BOOKING_HOTEL;
  const label = kind === "flight" ? "Duffel · GET /air/offers/{id}" : "Booking · GET /hotels/{id}/availability";
  return (
    <div className="book-modal" onClick={onClose}>
      <div className="book-card" onClick={e => e.stopPropagation()} style={{ width: "min(720px, 100%)", padding: 0, background: "#0d0a1f" }}>
        <div className="pipeline-head" style={{ borderRadius: "32px 32px 0 0" }}>
          <div className="dot3"><span className="a"></span><span className="b"></span><span className="c"></span></div>
          <span className="label">{label}</span>
          <span className="grow"></span>
          <button onClick={onClose} style={{ background: "var(--coral)", color: "white", border: "2px solid #000", borderRadius: 999, padding: "4px 10px", fontWeight: 800, fontFamily: "JetBrains Mono, monospace", fontSize: 11, cursor: "pointer" }}>esc ✕</button>
        </div>
        <div className="pipeline-body" style={{ maxHeight: "60vh" }}>
          <div className="frame result">
            <div className="res-head">
              <span className="ok">← 200 OK</span>
              <span className="nm">live response</span>
              <span className="ms">cached 2m ago</span>
            </div>
            <div className="res-body">
              <pre className="json">{jsonHighlight(data)}</pre>
            </div>
          </div>
          <div style={{ color: "#a89dc8", fontSize: 11, fontFamily: "JetBrains Mono, monospace", padding: "8px 4px" }}>
            This is the exact shape your backend would receive. The itinerary card above is just a humanized view of these fields.
          </div>
        </div>
      </div>
    </div>
  );
}

function EventRow({ ev, onSwap, locked, onLock, onInspect }) {
  return (
    <div className="event">
      <div>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>{ev.time}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div className={"event-icon " + ev.icon}>{ev.emoji}</div>
        <div className="event-body">
          <div className="title">{ev.title}</div>
          <div className="meta">{ev.meta}{ev.vendor ? " · " + ev.vendor : ""}</div>
          {(ev.icon === "flight" || ev.icon === "hotel" || ev.icon === "car") && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <button className="refine-chip" onClick={() => onSwap(ev)}>↺ Swap option</button>
              <button className="refine-chip" onClick={onLock}
                style={locked ? { background: "var(--lime)" } : {}}>
                {locked ? "🔒 Locked" : "🔓 Lock this"}
              </button>
              {(ev.icon === "flight" || ev.icon === "hotel") && (
                <button className="inspect-btn" onClick={() => onInspect(ev.icon)}>{"{}"} raw json</button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="event-cost">
        {ev.was && <span className="strike">{fmtMoney(ev.was)}</span>}
        {ev.cost === 0 ? <span style={{ color: "var(--green, #1f8a5b)" }}>free</span> : fmtMoney(ev.cost)}
      </div>
    </div>
  );
}

export function DayCard({ day, idx, onSwap, locks, toggleLock, onInspect }) {
  const dayCost = day.events.reduce((s, e) => s + (e.cost || 0), 0);
  return (
    <div className="day-card">
      <div className="day-head">
        <div className="day-num">
          <span className="badge">{idx + 1}</span>
          <span>{day.title}</span>
        </div>
        <div className="day-date">{day.label} · <strong>{fmtMoney(dayCost)}</strong></div>
      </div>
      {day.events.map((ev, i) => (
        <EventRow key={i} ev={ev} onSwap={onSwap}
               locked={locks[day.label + "-" + i]}
               onLock={() => toggleLock(day.label + "-" + i)}
               onInspect={onInspect} />
      ))}
    </div>
  );
}

export function RefineBar({ value, setValue, onApply, onBook }) {
  const quick = ["Cheaper hotel", "Nonstop flights only", "Add a beach day", "Drop the rental car", "Closer to dinner spots"];
  return (
    <div className="refine">
      <div>
        <textarea
          className="refine-input"
          placeholder="Tell me what to change. e.g. 'too expensive on the hotel, keep the flight'"
          rows="2"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="refine-chips">
          {quick.map(q => (
            <button key={q} className="refine-chip" onClick={() => setValue(q)}>{q}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button className="btn btn-ghost" onClick={onApply} disabled={!value.trim()}>🔄 Re-plan</button>
        <button className="btn btn-primary" onClick={onBook}>🎟️ Book the trip</button>
      </div>
    </div>
  );
}

export function SwapModal({ kind, onClose, onChoose }) {
  const [sel, setSel] = useState(0);
  if (!kind) return null;
  const opts = SWAP_OPTIONS[kind] || [];
  const titles = { flight: "Pick a different flight", hotel: "Pick a different stay", car: "Pick a different transport" };
  return (
    <div className="book-modal" onClick={onClose}>
      <div className="book-card" onClick={e => e.stopPropagation()} style={{ width: "min(620px, 100%)" }}>
        <h3>{titles[kind]}</h3>
        <p className="lead">Your other locked choices stay put. We'll re-cost the trip after.</p>
        <div className="options-list">
          {opts.map((o, i) => (
            <div key={i} className={"option-row " + (sel === i ? "selected" : "")} onClick={() => setSel(i)}>
              <div className="opt-icon" style={{ background: i === 0 ? "var(--sky)" : i === 1 ? "var(--lime)" : "var(--paper)" }}>{o.emoji}</div>
              <div>
                <div className="opt-title">{o.title}</div>
                <div className="opt-meta">{o.meta}</div>
              </div>
              {o.tag && <span className={"opt-tag " + o.tag}>{o.tag}</span>}
              {!o.tag && <span></span>}
              <div className="opt-price">{fmtMoney(o.price)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-accent" onClick={() => onChoose(opts[sel])}>Use this one</button>
        </div>
      </div>
    </div>
  );
}

function BookingProgress() {
  const items = [
    { ico: "✈️", t: "Booking JetBlue JFK → CUN" },
    { ico: "🏨", t: "Reserving Casa Malca" },
    { ico: "🚗", t: "Renting from Hertz" },
    { ico: "🍽️", t: "Holding dinner reservations" },
    { ico: "🎟️", t: "Confirming activities" },
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step < items.length) {
      const id = setTimeout(() => setStep(s => s + 1), 700);
      return () => clearTimeout(id);
    }
  }, [step]);
  return (
    <div className="booking-progress">
      {items.map((it, i) => {
        const cls = i < step ? "done" : i === step ? "active" : "";
        return (
          <div key={i} className={"bp-row " + cls}>
            <span className="ico">{it.ico}</span>
            <span>{it.t}</span>
            {i < step && <span className="check">✓</span>}
            {i === step && <span className="spin"></span>}
          </div>
        );
      })}
    </div>
  );
}

export function BookModal({ stage, onClose, onConfirm, onSavedLinks }) {
  if (!stage) return null;
  return (
    <div className="book-modal" onClick={stage === "progress" ? null : onClose}>
      <div className="book-card" onClick={e => e.stopPropagation()}>
        {stage === "choose" && (
          <>
            <h3>How should I book this?</h3>
            <p className="lead">I can book everything for you, or just hand you direct links to do it yourself.</p>
            <div className="book-options">
              <button className="book-option sun" onClick={() => onConfirm("agent")}>
                <div className="ico">🤖</div>
                <div className="ttl">Book it for me</div>
                <div className="desc">Charge my card and confirm every reservation in one go.</div>
              </button>
              <button className="book-option sky" onClick={onSavedLinks}>
                <div className="ico">🔗</div>
                <div className="ttl">Just give me the links</div>
                <div className="desc">I'll book each one myself — no card on file.</div>
              </button>
            </div>
          </>
        )}
        {stage === "card" && (
          <>
            <h3>Pay with card</h3>
            <p className="lead">$3,286 will be charged once every reservation confirms.</p>
            <div className="card-input">
              <input className="card-field" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
              <input className="card-field" placeholder="09 / 28" defaultValue="09 / 28" />
              <input className="card-field" placeholder="CVC" defaultValue="123" />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={onClose}>Back</button>
              <button className="btn btn-primary" onClick={() => onConfirm("pay")}>Charge $3,286</button>
            </div>
          </>
        )}
        {stage === "progress" && (
          <>
            <h3>Booking your trip…</h3>
            <p className="lead">Hang tight — I'll confirm each one.</p>
            <BookingProgress />
          </>
        )}
        {stage === "done" && (
          <>
            <div className="success-bursts">
              {Array.from({ length: 14 }).map((_, i) => {
                const ang = (i / 14) * Math.PI * 2;
                const dx = Math.cos(ang) * 80;
                const dy = Math.sin(ang) * 80;
                const colors = ["var(--coral)", "var(--sunshine)", "var(--lime)", "var(--sky)", "var(--grape)", "var(--bubblegum)"];
                return <span key={i} className="b" style={{ "--dx": dx + "px", "--dy": dy + "px", background: colors[i % colors.length], animationDelay: (i * 60) + "ms" }}></span>;
              })}
            </div>
            <h3>You're going to Tulum! 🎉</h3>
            <p className="lead">Everything's booked. I sent confirmations to your inbox and saved the trip.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn btn-primary" onClick={onClose}>See itinerary</button>
            </div>
          </>
        )}
        {stage === "links" && (
          <>
            <h3>Your direct booking links</h3>
            <p className="lead">Open each, book in your own account, mark done.</p>
            <div className="booking-progress">
              {[
                { ico: "✈️", t: "JetBlue · JFK → CUN", h: "jetblue.com" },
                { ico: "🏨", t: "Casa Malca · Oceanfront", h: "booking.com" },
                { ico: "🚗", t: "Hertz · Compact", h: "hertz.com" },
                { ico: "🍽️", t: "Hartwood · Dinner res.", h: "resy.com" },
              ].map((r, i) => (
                <div key={i} className="bp-row">
                  <span className="ico">{r.ico}</span>
                  <span>{r.t}</span>
                  <a className="btn btn-ghost" style={{ marginLeft: "auto", padding: "6px 12px", fontSize: 12 }} href="#" onClick={e => e.preventDefault()}>{r.h} ↗</a>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
