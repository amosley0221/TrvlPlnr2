import { fmtMoney, fmtDelta } from "../data/trips.js";

function Card({ t, onOpen, onRemove, onArchive, onUnarchive, archived }) {
  const d = fmtDelta(t.priceWhenSaved, t.priceNow);
  const pctChange = ((t.priceNow - t.priceWhenSaved) / t.priceWhenSaved) * 100;
  const bigSwing = Math.abs(pctChange) >= 5;
  const stop = e => e.stopPropagation();
  return (
    <div
      className={"saved-card " + t.color + (archived ? " archived" : "")}
      onClick={() => onOpen(t)}
      style={{ cursor: "pointer" }}
    >
      <div className="saved-card-actions" onClick={stop}>
        {archived ? (
          <button
            className="saved-card-action unarchive"
            title="Restore from archive"
            onClick={() => onUnarchive(t.id)}
          >↩</button>
        ) : (
          <button
            className="saved-card-action archive"
            title="Archive for later"
            onClick={() => onArchive(t.id)}
          >🗄</button>
        )}
        <button
          className="saved-card-action remove"
          title="Remove permanently"
          onClick={() => onRemove(t.id)}
        >✕</button>
      </div>
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
          <div className="price">{fmtMoney(t.priceNow)}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
            was {fmtMoney(t.priceWhenSaved)} · {t.savedAt}
          </div>
        </div>
        <span className={"delta " + d.dir}>
          {d.dir === "down" ? "↓" : d.dir === "up" ? "↑" : "="} {d.text}
        </span>
      </div>
      {bigSwing && !archived && (
        <div className="price-warn">
          {d.dir === "down"
            ? "💰 Drop of " + Math.abs(pctChange).toFixed(0) + "%. Good time to book."
            : "⚠️ Up " + Math.abs(pctChange).toFixed(0) + "% since you saved. Lock soon?"}
        </div>
      )}
    </div>
  );
}

export function SavedTrips({ trips, archived, onOpen, onRemove, onArchive, onUnarchive }) {
  const active = trips.filter(t => !t.archived);
  const archivedList = archived || trips.filter(t => t.archived);
  const total = active.length + archivedList.length;

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Your <em>saved</em> trips</h2>
          <div className="sub">Prices update daily. Hover a card to remove or archive.</div>
        </div>
        <span className="pill">
          <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--green, #1f8a5b)" }}></span>
          Tracking {active.length} {active.length === 1 ? "trip" : "trips"}
        </span>
      </div>

      {total === 0 ? (
        <div className="empty">
          <div className="big">🧳</div>
          <h3>No saved trips yet</h3>
          <div className="sub">Plan something on the home page — you'll be able to save it from there.</div>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="saved-grid">
              {active.map(t => (
                <Card
                  key={t.id} t={t}
                  onOpen={onOpen}
                  onRemove={onRemove}
                  onArchive={onArchive}
                  onUnarchive={onUnarchive}
                  archived={false}
                />
              ))}
            </div>
          )}

          {archivedList.length > 0 && (
            <>
              <div className="section-divider">
                <h3>Archived <em>· plan later</em></h3>
                <div className="sub">{archivedList.length} {archivedList.length === 1 ? "trip" : "trips"} on the back burner. We stop tracking price changes here.</div>
              </div>
              <div className="saved-grid">
                {archivedList.map(t => (
                  <Card
                    key={t.id} t={t}
                    onOpen={onOpen}
                    onRemove={onRemove}
                    onArchive={onArchive}
                    onUnarchive={onUnarchive}
                    archived={true}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
