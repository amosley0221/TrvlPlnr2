import { useEffect, useRef, useState } from "react";
import { THINKING_STEPS, SUGGESTIONS, VIBE_OPTIONS, BUDGET_PRESETS } from "../data/trips.js";

export function Agent({ mood = "idle" }) {
  return (
    <div className="agent-stage">
      <div className={"agent " + mood}>
        <div className="agent-body">
          <div className="antenna"></div>
          <div className="head">
            <div className="cheek l"></div>
            <div className="cheek r"></div>
            <div className="eye l"></div>
            <div className="eye r"></div>
            <div className="mouth"></div>
          </div>
        </div>
        {mood === "thinking" && (
          <div className="orbit">
            <div className="orbit-item i1">✈️</div>
            <div className="orbit-item i2">🏨</div>
            <div className="orbit-item i3">🚗</div>
            <div className="orbit-item i4">🍽️</div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ThinkingLog({ activeStep }) {
  return (
    <div className="think-log">
      {THINKING_STEPS.slice(0, activeStep + 1).map((s, i) => {
        const isActive = i === activeStep;
        const isDone = i < activeStep;
        return (
          <div key={i} className={"think-row " + (isActive ? "active" : isDone ? "done" : "")}
               style={{ animationDelay: (i * 60) + "ms" }}>
            <span className="emoji">{s.emoji}</span>
            <span style={{ flex: 1 }}>{s.text}</span>
            {isActive && <span className="spin"></span>}
            {isDone && <span className="check">✓</span>}
          </div>
        );
      })}
    </div>
  );
}

function fmtUsd(n) {
  return "$" + n.toLocaleString();
}

function fmtDateRange(d) {
  if (!d || !d.from || !d.to) return null;
  const f = (iso) => new Date(iso + "T00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  return f(d.from) + " → " + f(d.to);
}

function ChipPicker({ kind, value, onChange, onClose, anchorRect }) {
  const popRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!anchorRect || !popRef.current) return;
    const pop = popRef.current.getBoundingClientRect();
    const pad = 8;
    let left = anchorRect.left;
    let top = anchorRect.bottom + pad;
    // Keep on-screen
    if (left + pop.width > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - pop.width - 16);
    }
    if (top + pop.height > window.innerHeight - 16) {
      top = Math.max(16, anchorRect.top - pop.height - pad);
    }
    setPos({ left, top });
  }, [anchorRect]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="chip-popover-backdrop" onClick={onClose} />
      <div
        ref={popRef}
        className="chip-popover"
        style={{ left: pos.left, top: pos.top }}
        onClick={e => e.stopPropagation()}
      >
        {kind === "travelers" && (
          <TravelersPicker value={value} onChange={onChange} onDone={onClose} />
        )}
        {kind === "budget" && (
          <BudgetPicker value={value} onChange={onChange} onDone={onClose} />
        )}
        {kind === "vibe" && (
          <VibePicker value={value} onChange={onChange} onDone={onClose} />
        )}
        {kind === "dates" && (
          <DatesPicker value={value} onChange={onChange} onDone={onClose} />
        )}
      </div>
    </>
  );
}

function TravelersPicker({ value, onChange, onDone }) {
  const [n, setN] = useState(value || 2);
  return (
    <div className="picker">
      <div className="picker-head">👯 Who's coming?</div>
      <div className="picker-counter">
        <button className="picker-step" onClick={() => setN(v => Math.max(1, v - 1))}>−</button>
        <span className="picker-counter-num">{n}</span>
        <button className="picker-step" onClick={() => setN(v => Math.min(20, v + 1))}>+</button>
      </div>
      <div className="picker-counter-label">{n === 1 ? "traveler" : "travelers"}</div>
      <div className="picker-actions">
        <button className="btn btn-ghost" onClick={() => { onChange(null); onDone(); }}>Clear</button>
        <button className="btn btn-accent" onClick={() => { onChange(n); onDone(); }}>Set</button>
      </div>
    </div>
  );
}

function BudgetPicker({ value, onChange, onDone }) {
  const [v, setV] = useState(value || 3000);
  return (
    <div className="picker">
      <div className="picker-head">💸 Budget (USD)</div>
      <div className="picker-budget">
        <span className="picker-budget-sign">$</span>
        <input
          type="number"
          className="picker-budget-input"
          value={v}
          min={100}
          step={100}
          onChange={e => setV(parseInt(e.target.value, 10) || 0)}
        />
      </div>
      <div className="picker-presets">
        {BUDGET_PRESETS.map(b => (
          <button
            key={b}
            className={"picker-preset" + (v === b ? " active" : "")}
            onClick={() => setV(b)}
          >
            {fmtUsd(b)}
          </button>
        ))}
      </div>
      <div className="picker-actions">
        <button className="btn btn-ghost" onClick={() => { onChange(null); onDone(); }}>Clear</button>
        <button className="btn btn-accent" onClick={() => { onChange(v); onDone(); }} disabled={!v || v < 100}>Set</button>
      </div>
    </div>
  );
}

function VibePicker({ value, onChange, onDone }) {
  const [sel, setSel] = useState(value || null);
  return (
    <div className="picker">
      <div className="picker-head">✨ Trip vibe</div>
      <div className="picker-vibe-grid">
        {VIBE_OPTIONS.map(v => (
          <button
            key={v.id}
            className={"picker-vibe-opt" + (sel === v.id ? " active" : "")}
            onClick={() => setSel(v.id)}
          >
            <span className="emoji">{v.emoji}</span>
            <span>{v.label}</span>
          </button>
        ))}
      </div>
      <div className="picker-actions">
        <button className="btn btn-ghost" onClick={() => { onChange(null); onDone(); }}>Clear</button>
        <button className="btn btn-accent" onClick={() => { onChange(sel); onDone(); }} disabled={!sel}>Set</button>
      </div>
    </div>
  );
}

function DatesPicker({ value, onChange, onDone }) {
  const [from, setFrom] = useState((value && value.from) || "");
  const [to, setTo] = useState((value && value.to) || "");

  const setQuick = (kind) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() + 14);
    const end = new Date(start);
    if (kind === "weekend") end.setDate(start.getDate() + 2);
    if (kind === "long-weekend") end.setDate(start.getDate() + 3);
    if (kind === "week") end.setDate(start.getDate() + 7);
    const iso = (d) => d.toISOString().slice(0, 10);
    setFrom(iso(start));
    setTo(iso(end));
  };

  const valid = from && to && to >= from;

  return (
    <div className="picker">
      <div className="picker-head">📅 Trip dates</div>
      <div className="picker-dates">
        <label>
          <span>From</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} min={from || undefined} />
        </label>
      </div>
      <div className="picker-quick">
        <button onClick={() => setQuick("weekend")}>This weekend</button>
        <button onClick={() => setQuick("long-weekend")}>Long weekend</button>
        <button onClick={() => setQuick("week")}>A week</button>
      </div>
      <div className="picker-actions">
        <button className="btn btn-ghost" onClick={() => { onChange(null); onDone(); }}>Clear</button>
        <button className="btn btn-accent" onClick={() => { onChange({ from, to }); onDone(); }} disabled={!valid}>Set</button>
      </div>
    </div>
  );
}

const CHIP_DEFS = [
  { id: "travelers", label: "Who", emoji: "👯", color: "sky" },
  { id: "budget",    label: "Budget", emoji: "💸", color: "lime" },
  { id: "vibe",      label: "Type", emoji: "💞", color: "coral" },
  { id: "dates",     label: "Dates", emoji: "📅", color: "sun" },
];

function chipDisplay(id, value) {
  if (value == null) return null;
  if (id === "travelers") return value + (value === 1 ? " traveler" : " travelers");
  if (id === "budget") return fmtUsd(value) + " budget";
  if (id === "vibe") {
    const v = VIBE_OPTIONS.find(o => o.id === value);
    return v ? v.emoji + " " + v.label : null;
  }
  if (id === "dates") return fmtDateRange(value);
  return null;
}

export function PromptBox({ value, setValue, constraints, setConstraints, onSend, thinking }) {
  const [openChip, setOpenChip] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const chipRefs = useRef({});

  const openPicker = (id) => {
    const node = chipRefs.current[id];
    if (node) setAnchorRect(node.getBoundingClientRect());
    setOpenChip(id);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend();
  };

  return (
    <div className={"prompt-wrap " + (thinking ? "thinking" : "")}>
      <div className="prompt-box">
        <textarea
          className="prompt-input"
          placeholder="Tell me where you want to go, who's coming, the occasion, and the budget…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKey}
          disabled={thinking}
        />
        <div className="prompt-actions">
          <div className="chip-row">
            {CHIP_DEFS.map(c => {
              const display = chipDisplay(c.id, constraints[c.id]);
              const isSet = display != null;
              return (
                <span key={c.id} className="chip-wrap">
                  <button
                    ref={el => (chipRefs.current[c.id] = el)}
                    className={"chip" + (isSet ? " " + c.color : " unset")}
                    onClick={() => !thinking && openPicker(c.id)}
                    disabled={thinking}
                  >
                    <span>{c.emoji}</span>
                    <span>{isSet ? display : c.label}</span>
                    {!isSet && <span className="chip-plus">+</span>}
                  </button>
                  {isSet && (
                    <button
                      className="chip-x"
                      title="Clear"
                      onClick={() => setConstraints(s => ({ ...s, [c.id]: null }))}
                      disabled={thinking}
                    >×</button>
                  )}
                </span>
              );
            })}
          </div>
          <button className="send-btn" onClick={onSend} disabled={thinking || !value.trim()}>
            {thinking
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><circle cx="12" cy="12" r="8" strokeDasharray="32" strokeDashoffset="20"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></circle></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
          </button>
        </div>
      </div>

      {openChip && (
        <ChipPicker
          kind={openChip}
          value={constraints[openChip]}
          anchorRect={anchorRect}
          onChange={(v) => setConstraints(s => ({ ...s, [openChip]: v }))}
          onClose={() => { setOpenChip(null); setAnchorRect(null); }}
        />
      )}
    </div>
  );
}

export function Suggestions({ onPick, disabled }) {
  return (
    <div className="suggestions">
      {SUGGESTIONS.map((s, i) => (
        <button key={i} className="suggestion" onClick={() => onPick(s.label, true)} disabled={disabled}>
          <span className="emoji">{s.emoji}</span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
