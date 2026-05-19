import { fmtMoney } from "../data/trips.js";

export function Bookings({ bookings, onCancel, onOpen }) {
  if (!bookings.length) {
    return (
      <div>
        <div className="section-head">
          <div>
            <h2>Your <em>bookings</em></h2>
            <div className="sub">Confirmed trips show up here once you complete checkout.</div>
          </div>
        </div>
        <div className="empty">
          <div className="big">🎟️</div>
          <h3>No bookings yet</h3>
          <div className="sub">Plan a trip, hit "Book the trip", and complete checkout. Confirmations land here.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Your <em>bookings</em></h2>
          <div className="sub">{bookings.length} confirmed {bookings.length === 1 ? "trip" : "trips"}. Cancel anything before the cancellation deadline.</div>
        </div>
        <span className="pill">
          <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--green, #1f8a5b)" }}></span>
          {bookings.length} confirmed
        </span>
      </div>

      <div className="saved-grid">
        {bookings.map(b => (
          <div
            key={b.id}
            className={"saved-card " + (b.color || "sun") + (b.cancelled ? " archived" : "")}
            onClick={() => onOpen && onOpen(b)}
            style={{ cursor: "pointer" }}
          >
            <div className="saved-card-actions" onClick={e => e.stopPropagation()}>
              {!b.cancelled && (
                <button
                  className="saved-card-action remove"
                  title="Cancel booking"
                  onClick={() => onCancel(b.id)}
                >✕</button>
              )}
            </div>
            <div className="hero-strip">
              {b.hero}
              <span className="sticker" style={{
                top: 10, right: 10,
                background: b.cancelled ? "var(--muted)" : "var(--lime)",
                color: "var(--ink)",
                transform: "rotate(6deg)"
              }}>
                {b.cancelled ? "✕ cancelled" : "✓ booked"}
              </span>
            </div>
            <h3>{b.title}</h3>
            <div className="where">{b.where} · {b.travelers} ppl</div>
            <div className="price-row">
              <div>
                <div className="price">{fmtMoney(b.total)}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  {b.bookedAt}
                </div>
              </div>
              <span className="delta flat" style={{ fontSize: 11 }}>
                conf #{b.confirmation}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
