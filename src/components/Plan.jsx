import { useState, useEffect } from "react";
import {
  fmtMoney,
  initialSelection,
  recomputeTripForSelection,
} from "../data/trips.js";
import { DUFFEL_OFFER, BOOKING_HOTEL } from "../data/api.js";
import { jsonHighlight } from "./Pipeline.jsx";
import { exportTripAsPDF } from "../lib/export-pdf.js";
import { buildBookingUrl } from "../lib/booking-links.js";

export function NoMatchModal({ open, prompt, destinations, onClose, onPick }) {
  if (!open) return null;
  const snippet = (prompt || "").trim();
  const short = snippet.length > 140 ? snippet.slice(0, 140) + "…" : snippet;
  return (
    <div className="book-modal" onClick={onClose}>
      <div className="book-card no-match-card" onClick={e => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Close">✕</button>
        <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 8 }}>🤔</div>
        <h3>I don't know that destination yet</h3>
        <p className="lead">
          I'm currently a small AI — I only plan trips to a curated set of places. Here's what I'm good at right now:
        </p>
        {short && (
          <div className="no-match-prompt">
            <span className="no-match-prompt-label">you asked for</span>
            <span className="no-match-prompt-text">"{short}"</span>
          </div>
        )}
        <div className="no-match-grid">
          {destinations.map(d => (
            <button key={d.id} className="no-match-tile" onClick={() => onPick(d.title)}>
              <span className="emoji">{d.hero}</span>
              <span>{d.title}</span>
            </button>
          ))}
        </div>
        <p className="no-match-note">
          Pick one above, or rewrite your prompt with one of these in it.
          Live flight + hotel APIs (Duffel, Booking.com, Google Places) aren't wired up yet —
          when they are, I'll be able to plan anywhere.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button className="btn btn-ghost" onClick={onClose}>Rewrite my prompt</button>
        </div>
      </div>
    </div>
  );
}

function vendorHost(vendor, icon) {
  const v = (vendor || "").toLowerCase();
  const map = [
    ["jetblue", "jetblue.com"],
    ["united", "united.com"],
    ["delta", "delta.com"],
    ["american", "aa.com"],
    ["ana", "ana.co.jp"],
    ["air france", "airfrance.com"],
    ["singapore", "singaporeair.com"],
    ["tap", "flytap.com"],
    ["aeroméxico", "aeromexico.com"],
    ["spirit", "spirit.com"],
    ["airbnb", "airbnb.com"],
    ["booking", "booking.com"],
    ["hertz", "hertz.com"],
    ["avis", "avis.com"],
    ["enterprise", "enterprise.com"],
    ["jr", "japanrailpass.net"],
    ["sncf", "sncf-connect.com"],
  ];
  for (const [needle, host] of map) if (v.includes(needle)) return host;
  if (icon === "food") return "resy.com";
  if (icon === "fun") return "getyourguide.com";
  if (icon === "train") return "rail.com";
  return v ? v.replace(/[^a-z0-9]/g, "") + ".com" : "expedia.com";
}

export function extractBookingLinks(trip) {
  const links = [];
  const seen = new Set();
  const priority = { flight: 0, hotel: 1, car: 2, train: 2, bus: 2, food: 3, fun: 4 };
  for (const day of trip.days) {
    for (const ev of day.events) {
      if (!ev.vendor) continue;
      const key = ev.vendor + "::" + ev.title;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({
        icon: ev.icon,
        emoji: ev.emoji,
        title: ev.title,
        vendor: ev.vendor,
        cost: ev.cost,
        host: vendorHost(ev.vendor, ev.icon),
        rank: priority[ev.icon] ?? 5,
      });
    }
  }
  links.sort((a, b) => a.rank - b.rank);
  return links;
}

function OptionRow({ opt, category, defaultEmoji, isSelected, isStatic, onSelect, trip }) {
  const title =
    opt.name || (opt.airline ? opt.airline + " · " + opt.flight : opt.flight);
  const sub = opt.airline && opt.route ? opt.route : opt.type || opt.airline || "";
  const onRowClick = () => {
    if (!isStatic && onSelect) onSelect();
  };
  const onKey = (e) => {
    if (isStatic || !onSelect) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };
  return (
    <div
      className={
        "popup-link-row" +
        (opt.best ? " best" : "") +
        (isSelected ? " selected" : "") +
        (isStatic ? " static" : "")
      }
      onClick={onRowClick}
      role={isStatic ? undefined : "radio"}
      aria-checked={isStatic ? undefined : !!isSelected}
      tabIndex={isStatic ? -1 : 0}
      onKeyDown={onKey}
    >
      {!isStatic && (
        <span className="popup-link-radio" aria-hidden>
          {isSelected ? <span className="dot" /> : null}
        </span>
      )}
      <span className={"popup-link-icon " + category}>
        {opt.emoji || defaultEmoji}
      </span>
      <div className="popup-link-body">
        <div className="popup-link-title">
          {title}
          {opt.best && <span className="best-badge">★ best fit</span>}
          {opt.tag && !opt.best && (
            <span className={"opt-tag " + opt.tag}>{opt.tag}</span>
          )}
        </div>
        <div className="popup-link-meta">
          {sub ? sub + " · " : ""}
          {opt.meta}
        </div>
      </div>
      <div className="popup-link-cost">
        {opt.price === 0 ? "free" : fmtMoney(opt.price)}
      </div>
      <a
        href={buildBookingUrl(opt, trip)}
        target="_blank"
        rel="noopener noreferrer"
        className="popup-link-cta"
        onClick={(e) => e.stopPropagation()}
      >
        Book on {opt.host} ↗
      </a>
    </div>
  );
}

function PopupSection({
  icon,
  title,
  sub,
  items,
  category,
  defaultEmoji,
  selectionKey,
  selectedIndex,
  onPick,
  trip,
}) {
  if (!items || !items.length) return null;
  const isStatic = !selectionKey;
  return (
    <section className="popup-section" role={isStatic ? undefined : "radiogroup"}>
      <div className="popup-section-head">
        <h4>
          <span className="popup-section-icon">{icon}</span> {title}
        </h4>
        <span className="popup-sub">{sub}</span>
      </div>
      <div className="popup-links">
        {items.map((opt, i) => (
          <OptionRow
            key={i}
            opt={opt}
            category={category}
            defaultEmoji={defaultEmoji}
            isStatic={isStatic}
            isSelected={!isStatic && selectedIndex === i}
            onSelect={isStatic ? undefined : () => onPick(selectionKey, i)}
            trip={trip}
          />
        ))}
      </div>
    </section>
  );
}

export function TripPlanModal({
  trip,
  open,
  onClose,
  onSave,
  onArchive,
  alreadySaved,
  alreadyArchived,
}) {
  const [selection, setSelection] = useState(() => initialSelection(trip));
  const [pdfLoading, setPdfLoading] = useState(false);

  // Reset selection back to the trip's default whenever a different trip
  // opens. (We don't reset on every render — the user's in-progress picks
  // should survive while the popup is open.)
  useEffect(() => {
    if (open) setSelection(trip?.selection || initialSelection(trip));
  }, [open, trip?.id]);

  if (!open || !trip) return null;
  const opts = trip.bookingOptions;
  const legacyLinks = !opts ? extractBookingLinks(trip) : [];

  // Effective trip = base trip with the user's current picks applied. This
  // is what we display, save, and archive — never the raw best-fit baseline.
  const effective =
    opts && selection ? recomputeTripForSelection(trip, selection) : trip;

  const pick = (key, index) =>
    setSelection((s) => ({ ...(s || {}), [key]: index }));

  const handleSave = () => onSave && onSave(effective);
  const handleArchive = () => onArchive && onArchive(effective);

  const handleExport = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      await exportTripAsPDF(effective);
    } catch (err) {
      console.error("[export-pdf] failed:", err);
      alert("Couldn't generate the PDF. Try again in a moment.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="book-modal" onClick={onClose}>
      <div className="book-card trip-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="popup-hero">
          <span className="popup-hero-emoji">{effective.hero}</span>
          <div>
            <div className="popup-eyebrow">your plan is ready</div>
            <h3 style={{ marginTop: 2 }}>
              {effective.nights} nights in {effective.title}
            </h3>
            <div className="popup-meta">
              {effective.dateFrom} → {effective.dateTo} ·{" "}
              {effective.travelers} travelers · {effective.vibe}
            </div>
          </div>
          <div className="popup-total">
            <div className="lbl">Trip total</div>
            <div className="num">{fmtMoney(effective.total)}</div>
            <div className="per">{fmtMoney(effective.perPerson)} / person</div>
          </div>
        </div>

        {opts ? (
          <>
            <PopupSection
              icon="✈️"
              title="Getting there"
              sub={`Pick one · ${opts.flights.length} ${opts.flights.length === 1 ? "option" : "options"}`}
              items={opts.flights}
              category="flight"
              defaultEmoji="✈️"
              selectionKey="flights"
              selectedIndex={selection?.flights}
              onPick={pick}
              trip={effective}
            />
            <PopupSection
              icon="🏨"
              title="Where you'll stay"
              sub="Pick one · hotels + Airbnbs"
              items={opts.stays}
              category="hotel"
              defaultEmoji="🏨"
              selectionKey="stays"
              selectedIndex={selection?.stays}
              onPick={pick}
              trip={effective}
            />
            <PopupSection
              icon="🚗"
              title="Getting around"
              sub="Pick one · transport for the whole stay"
              items={opts.transport}
              category="car"
              defaultEmoji="🚗"
              selectionKey="transport"
              selectedIndex={selection?.transport}
              onPick={pick}
              trip={effective}
            />
            <PopupSection
              icon="🎟️"
              title="On the ground"
              sub="Dinner reservations + activities (all suggested)"
              items={opts.extras}
              category="fun"
              defaultEmoji="🎟️"
              trip={effective}
            />
          </>
        ) : (
          <>
            <div className="popup-section-head">
              <h4>Suggested bookings</h4>
              <span className="popup-sub">Tap a vendor to book it directly.</span>
            </div>
            <div className="popup-links">
              {legacyLinks.map((l, i) => (
                <a
                  key={i}
                  href="#"
                  className="popup-link-row"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className={"popup-link-icon " + l.icon}>{l.emoji}</span>
                  <div className="popup-link-body">
                    <div className="popup-link-title">{l.title}</div>
                    <div className="popup-link-meta">{l.vendor}</div>
                  </div>
                  <div className="popup-link-cost">
                    {l.cost === 0 ? "free" : fmtMoney(l.cost)}
                  </div>
                  <div className="popup-link-cta">Book on {l.host} ↗</div>
                </a>
              ))}
            </div>
          </>
        )}

        <div className="popup-disclaimer">
          <strong>Heads up:</strong> prices are AI estimates based on typical
          rates for the route. Always verify on the booking site before purchasing.
        </div>

        <div className="popup-actions">
          <button
            className="btn btn-accent"
            onClick={handleSave}
            disabled={alreadySaved}
          >
            {alreadySaved ? "✓ Saved" : "💾 Save to Saved Trips"}
          </button>
          <button
            className="btn btn-ghost"
            onClick={handleArchive}
            disabled={alreadyArchived}
          >
            {alreadyArchived ? "✓ Archived" : "🗄️ Archive for later"}
          </button>
          <button
            className="btn btn-ghost"
            onClick={handleExport}
            disabled={pdfLoading}
          >
            {pdfLoading ? "Preparing PDF…" : "📄 Export PDF"}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Refine the plan first →
          </button>
        </div>
      </div>
    </div>
  );
}

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
          {(ev.icon === "flight" || ev.icon === "hotel" || ev.icon === "car" || ev.icon === "train" || ev.icon === "bus") && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <button className="refine-chip" onClick={() => onSwap(ev)}>↺ See more choices</button>
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

// SwapModal — pick a different option from the trip's own bookingOptions.
// kind is the bookingOptions key ("flights" | "stays" | "transport").
const SWAP_TITLES = {
  flights: "Pick a different flight",
  stays: "Pick a different stay",
  transport: "Pick a different transport",
};
const SWAP_CATEGORIES = {
  flights: "flight",
  stays: "hotel",
  transport: "car",
};
const SWAP_DEFAULT_EMOJI = {
  flights: "✈️",
  stays: "🏨",
  transport: "🚗",
};

function swapRowLabel(kind, o) {
  if (kind === "flights") {
    return (o.airline || "") + (o.flight ? " · " + o.flight : "");
  }
  return o.name || "";
}

function swapRowSub(kind, o) {
  if (kind === "flights") return o.route || "";
  if (kind === "stays") return o.type || "";
  return "";
}

export function SwapModal({ kind, options, selectedIndex, onClose, onChoose, trip }) {
  const [sel, setSel] = useState(selectedIndex ?? 0);

  useEffect(() => {
    setSel(selectedIndex ?? 0);
  }, [kind, selectedIndex]);

  if (!kind) return null;
  if (!Array.isArray(options) || options.length === 0) return null;

  const category = SWAP_CATEGORIES[kind] || "fun";
  const defaultEmoji = SWAP_DEFAULT_EMOJI[kind] || "🎟️";

  return (
    <div className="book-modal" onClick={onClose}>
      <div className="book-card trip-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Close">✕</button>
        <h3 style={{ marginBottom: 4 }}>{SWAP_TITLES[kind] || "Pick a different option"}</h3>
        <p className="lead">
          We'll re-cost the trip with your new pick. Other selections stay put.
        </p>
        <div className="popup-links" role="radiogroup" style={{ marginBottom: 18 }}>
          {options.map((o, i) => {
            const title = swapRowLabel(kind, o);
            const sub = swapRowSub(kind, o);
            return (
              <div
                key={i}
                role="radio"
                aria-checked={sel === i}
                tabIndex={0}
                className={
                  "popup-link-row" +
                  (o.best ? " best" : "") +
                  (sel === i ? " selected" : "")
                }
                onClick={() => setSel(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSel(i);
                  }
                }}
              >
                <span className="popup-link-radio" aria-hidden>
                  {sel === i ? <span className="dot" /> : null}
                </span>
                <span className={"popup-link-icon " + category}>
                  {o.emoji || defaultEmoji}
                </span>
                <div className="popup-link-body">
                  <div className="popup-link-title">
                    {title}
                    {o.best && <span className="best-badge">★ best fit</span>}
                    {o.tag && !o.best && (
                      <span className={"opt-tag " + o.tag}>{o.tag}</span>
                    )}
                  </div>
                  <div className="popup-link-meta">
                    {sub ? sub + " · " : ""}
                    {o.meta}
                  </div>
                </div>
                <div className="popup-link-cost">
                  {o.price === 0 ? "free" : fmtMoney(o.price)}
                </div>
                <a
                  href={buildBookingUrl(o, trip)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="popup-link-cta"
                  onClick={(e) => e.stopPropagation()}
                >
                  Book on {o.host} ↗
                </a>
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            paddingTop: 12,
            borderTop: "2.5px dashed var(--line)",
          }}
        >
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-accent"
            onClick={() => onChoose(options[sel], sel)}
            disabled={sel === selectedIndex}
          >
            {sel === selectedIndex ? "No change" : "Use this one"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Side-panel summary of the trip's currently-selected bookings, with a
// "see more choices" link per category that opens the SwapModal.
export function BookingsSummary({ trip, onOpenSwap }) {
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!trip?.bookingOptions || !trip?.selection) return null;
  const flight = trip.bookingOptions.flights?.[trip.selection.flights];
  const stay = trip.bookingOptions.stays?.[trip.selection.stays];
  const transport = trip.bookingOptions.transport?.[trip.selection.transport];
  if (!flight || !stay || !transport) return null;

  const handleExport = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      await exportTripAsPDF(trip);
    } catch (err) {
      console.error("[export-pdf] failed:", err);
      alert("Couldn't generate the PDF. Try again in a moment.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="side-card mint">
      <h3>Your bookings</h3>
      <p className="booked-hint">
        The options you picked. Tap "see more choices" to swap any of them.
      </p>

      <BookedRow
        emoji={flight.emoji || "✈️"}
        title={`${flight.airline} · ${flight.flight}`}
        meta={`${flight.route} · ${flight.meta}`}
        price={fmtMoney(flight.price) + " / pax"}
        host={flight.host}
        bookingUrl={buildBookingUrl(flight, trip)}
        onSeeMore={() => onOpenSwap("flights")}
      />
      <BookedRow
        emoji={stay.emoji || "🏨"}
        title={stay.name}
        meta={`${stay.type} · ${stay.meta}`}
        price={fmtMoney(stay.price)}
        host={stay.host}
        bookingUrl={buildBookingUrl(stay, trip)}
        onSeeMore={() => onOpenSwap("stays")}
      />
      <BookedRow
        emoji="🚗"
        title={transport.name}
        meta={transport.meta}
        price={transport.price === 0 ? "free" : fmtMoney(transport.price)}
        host={transport.host}
        bookingUrl={buildBookingUrl(transport, trip)}
        onSeeMore={() => onOpenSwap("transport")}
      />

      <button
        className="btn btn-primary"
        style={{ marginTop: 10, width: "100%" }}
        onClick={handleExport}
        disabled={pdfLoading}
      >
        {pdfLoading ? "Preparing PDF…" : "📄 Export PDF to share"}
      </button>
    </div>
  );
}

function BookedRow({ emoji, title, meta, price, host, bookingUrl, onSeeMore }) {
  return (
    <div className="booked-row">
      <span className="booked-emoji">{emoji}</span>
      <div className="booked-body">
        <div className="booked-title">{title}</div>
        <div className="booked-meta">{meta}</div>
        <div className="booked-actions">
          <a
            className="booked-link"
            href={bookingUrl || (host ? "https://" + host : "#")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book on {host} ↗
          </a>
          <button className="booked-more" onClick={onSeeMore}>
            see more choices →
          </button>
        </div>
      </div>
      <div className="booked-price">{price}</div>
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
