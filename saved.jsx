// Saved trips view with price tracking
function SavedTrips({ trips, onOpen }) {
  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Your <em>saved</em> trips</h2>
          <div className="sub">Prices update daily. Big swings get a heads-up sticker.</div>
        </div>
        <span className="pill"><span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--green, #1f8a5b)" }}></span> Tracking {trips.length} trips</span>
      </div>
      <div className="saved-grid">
        {trips.map(t => {
          const d = window.fmtDelta(t.priceWhenSaved, t.priceNow);
          const pctChange = ((t.priceNow - t.priceWhenSaved) / t.priceWhenSaved) * 100;
          const bigSwing = Math.abs(pctChange) >= 5;
          return (
            <div key={t.id} className={"saved-card " + t.color} onClick={() => onOpen(t)} style={{ cursor: "pointer" }}>
              <div className="hero-strip">
                {t.hero}
                <span className="sticker" style={{
                  top: 10, right: 10, background: d.dir === "down" ? "var(--lime)" : d.dir === "up" ? "var(--coral)" : "var(--paper)",
                  color: d.dir === "up" ? "white" : "var(--ink)",
                  transform: "rotate(6deg)"
                }}>
                  {d.dir === "down" ? "↓ price drop" : d.dir === "up" ? "↑ price up" : "stable"}
                </span>
              </div>
              <h3>{t.title}</h3>
              <div className="where">{t.where} · {t.travelers} ppl</div>
              <div className="price-row">
                <div>
                  <div className="price">{window.fmtMoney(t.priceNow)}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    was {window.fmtMoney(t.priceWhenSaved)} · {t.savedAt}
                  </div>
                </div>
                <span className={"delta " + d.dir}>
                  {d.dir === "down" ? "↓" : d.dir === "up" ? "↑" : "="} {d.text}
                </span>
              </div>
              {bigSwing && (
                <div className="price-warn">
                  {d.dir === "down"
                    ? "💰 Drop of " + Math.abs(pctChange).toFixed(0) + "%. Good time to book."
                    : "⚠️ Up " + Math.abs(pctChange).toFixed(0) + "% since you saved. Lock soon?"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { SavedTrips });
