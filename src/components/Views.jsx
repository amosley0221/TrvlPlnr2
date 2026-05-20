import { useState } from "react";
import { PromptBox, Suggestions, ThinkingLog } from "./Agent.jsx";
import { Pipeline } from "./Pipeline.jsx";
import { TripHeader, CostBreakdown, DayCard, RefineBar, BookingsSummary } from "./Plan.jsx";

function FloatyShapes() {
  return (
    <>
      <div className="floaty s1" style={{ "--r": "-8deg" }}>
        <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#ffd23f" stroke="#1a1330" strokeWidth="3"/><path d="M20 32 Q32 20 44 32 Q32 44 20 32" fill="#ff4d6d" stroke="#1a1330" strokeWidth="3"/></svg>
      </div>
      <div className="floaty s2" style={{ "--r": "10deg" }}>
        <svg width="72" height="72" viewBox="0 0 72 72"><polygon points="36,6 66,60 6,60" fill="#4cc9f0" stroke="#1a1330" strokeWidth="3" strokeLinejoin="round"/><circle cx="36" cy="40" r="8" fill="#1a1330"/></svg>
      </div>
      <div className="floaty s3" style={{ "--r": "6deg" }}>
        <svg width="58" height="58" viewBox="0 0 58 58"><rect x="6" y="6" width="46" height="46" rx="14" fill="#b8e436" stroke="#1a1330" strokeWidth="3"/><circle cx="20" cy="22" r="4" fill="#1a1330"/><circle cx="38" cy="22" r="4" fill="#1a1330"/><path d="M18 36 Q29 46 40 36" stroke="#1a1330" strokeWidth="3" fill="none" strokeLinecap="round"/></svg>
      </div>
      <div className="floaty s4" style={{ "--r": "-12deg" }}>
        <svg width="66" height="66" viewBox="0 0 66 66"><path d="M33 8 L40 26 L60 26 L44 38 L50 58 L33 46 L16 58 L22 38 L6 26 L26 26 Z" fill="#ff7ac6" stroke="#1a1330" strokeWidth="3" strokeLinejoin="round"/></svg>
      </div>
    </>
  );
}

export function Landing({ prompt, setPrompt, constraints, setConstraints, onSend, onPickSuggestion }) {
  return (
    <>
      <section className="hero">
        <FloatyShapes />
        <span className="eyebrow"><span className="dot"></span> agent online · sniffing out deals</span>
        <h1>
          Tell me <span className="squiggle">where</span><br/>
          and I'll plan <span className="pop">everything</span>.
        </h1>
        <p>Flights, stays, cars, trains, dinner res, sunset cocktails — one prompt, one plan, one tap to book.</p>
      </section>

      <PromptBox
        value={prompt}
        setValue={setPrompt}
        constraints={constraints}
        setConstraints={setConstraints}
        onSend={onSend}
        thinking={false}
      />
      <Suggestions onPick={onPickSuggestion} />
    </>
  );
}

export function Thinking({ prompt, constraints, thinkStep, pipeIdx }) {
  const [peek, setPeek] = useState(false);
  return (
    <section className="hero" style={{ paddingTop: 20 }}>
      <span className="eyebrow"><span className="dot"></span> thinking…</span>
      <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>
        Hang tight — I'm <span className="pop">cooking</span>.
      </h1>
      <p style={{ marginBottom: 20 }}>"{prompt.slice(0, 120)}{prompt.length > 120 ? "…" : ""}"</p>

      <PromptBox
        value={prompt}
        setValue={() => {}}
        constraints={constraints || {}}
        setConstraints={() => {}}
        onSend={() => {}}
        thinking={true}
      />

      <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
        <button className={"peek-toggle " + (peek ? "on" : "")} onClick={() => setPeek(p => !p)}>
          {peek ? "💡 story mode" : "🔧 peek under the hood"}
        </button>
      </div>

      {peek
        ? <Pipeline activeIdx={pipeIdx} />
        : <ThinkingLog activeStep={thinkStep} />}
    </section>
  );
}

export function PlanView({ trip, locks, toggleLock, onSwap, onSwapKind, refine, setRefine, onApplyRefine, onBook, onInspect, onSave, onArchive, alreadySaved, alreadyArchived }) {
  return (
    <>
      <TripHeader trip={trip} />
      <div className="plan-grid">
        <div className="timeline">
          {trip.days.map((d, i) => (
            <DayCard key={i} idx={i} day={d} onSwap={onSwap} locks={locks} toggleLock={toggleLock} onInspect={onInspect} />
          ))}
        </div>
        <aside className="side">
          <BookingsSummary
            trip={trip}
            onOpenSwap={onSwapKind}
            onSave={onSave}
            onArchive={onArchive}
            alreadySaved={alreadySaved}
            alreadyArchived={alreadyArchived}
          />
          <CostBreakdown trip={trip} />
          <div className="side-card sky">
            <h3>Stats</h3>
            <div className="cost-row"><span className="lbl">⏱️ Total travel time</span><span className="val">8h 34m</span></div>
            <div className="cost-row"><span className="lbl">🌤️ Avg high</span><span className="val">86°F</span></div>
            <div className="cost-row"><span className="lbl">🌊 Beach mins from stay</span><span className="val">0</span></div>
            <div className="cost-row"><span className="lbl">🍽️ Restaurants picked</span><span className="val">9</span></div>
          </div>
        </aside>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "40px 0 16px" }}>
        <div style={{ background: "var(--paper)", border: "2.5px solid var(--ink)", borderRadius: 18, padding: "14px 18px", boxShadow: "var(--shadow-hard-sm)", maxWidth: 420 }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Looking good?</div>
          <div style={{ fontSize: 13, color: "var(--ink-2)" }}>Tell me what to change below — "cheaper hotel", "shorter flights", anything. I'll keep your locks.</div>
        </div>
      </div>

      <RefineBar value={refine} setValue={setRefine} onApply={onApplyRefine} onBook={onBook} />
    </>
  );
}
