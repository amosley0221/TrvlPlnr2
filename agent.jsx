// Agent character + thinking log
const { useState, useEffect, useRef } = React;

function Agent({ mood = "idle", caption }) {
  // mood: idle, thinking, happy, surprised
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

function ThinkingLog({ activeStep }) {
  const steps = window.THINKING_STEPS;
  return (
    <div className="think-log">
      {steps.slice(0, activeStep + 1).map((s, i) => {
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

function PromptBox({ value, setValue, chips, setChips, onSend, thinking }) {
  const onKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend();
  };
  const toggleChip = (id) => {
    setChips(chips.map(c => c.id === id ? { ...c, active: !c.active } : c));
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
            {chips.map(c => (
              <button
                key={c.id}
                className={"chip " + (c.active ? c.color : "")}
                onClick={() => toggleChip(c.id)}
                disabled={thinking}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
          <button className="send-btn" onClick={onSend} disabled={thinking || !value.trim()}>
            {thinking
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><circle cx="12" cy="12" r="8" strokeDasharray="32" strokeDashoffset="20"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></circle></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Suggestions({ onPick, disabled }) {
  return (
    <div className="suggestions">
      {window.SUGGESTIONS.map((s, i) => (
        <button key={i} className="suggestion" onClick={() => onPick(s.label, true)} disabled={disabled}>
          <span className="emoji">{s.emoji}</span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { Agent, ThinkingLog, PromptBox, Suggestions });
