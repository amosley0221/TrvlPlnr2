import { useEffect, useRef, useState } from "react";
import { Agent } from "./Agent.jsx";

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "summary",
  "label",
  '[role="button"]',
  '[contenteditable="true"]',
  ".suggestion",
  ".chip",
  ".nav-link",
  ".refine-chip",
  ".send-btn",
  ".saved-card",
  ".book-option",
  ".option-row",
  ".inspect-btn",
  ".peek-toggle",
  ".brand",
].join(",");

const CHASE_LERP = 0.045;

export function FloatingAgent({ mood, hidden }) {
  const wrapRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const seeded = useRef(false);
  const [overInteractive, setOverInteractive] = useState(false);
  const [ready, setReady] = useState(false);

  if (hidden) return null;

  useEffect(() => {
    const seed = () => {
      target.current = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35 };
      pos.current = { ...target.current };
    };
    seed();

    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!seeded.current) {
        pos.current = { ...target.current };
        seeded.current = true;
      }
      if (!ready) setReady(true);

      const el = e.target;
      const hit = el && el.closest ? el.closest(INTERACTIVE_SELECTOR) : null;
      setOverInteractive(!!hit);
    };

    const onLeave = () => setOverInteractive(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [ready]);

  useEffect(() => {
    // Freeze the chase when the agent is thinking (it stays where it was at submit
    // time and plays the thinking animation in place) or when the cursor sits over
    // an interactive element (it stops to look confused).
    const moving = mood !== "thinking" && !overInteractive;
    let raf;
    const tick = () => {
      const lerp = moving ? CHASE_LERP : 0;
      pos.current.x += (target.current.x - pos.current.x) * lerp;
      pos.current.y += (target.current.y - pos.current.y) * lerp;
      const node = wrapRef.current;
      if (node) {
        node.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mood, overInteractive]);

  // Thinking takes priority over confused so a submitted prompt always
  // animates correctly even if the cursor rests on a button.
  let effectiveMood = mood;
  if (mood !== "thinking" && overInteractive) effectiveMood = "confused";

  return (
    <div
      ref={wrapRef}
      className="floating-agent"
      data-ready={ready ? "true" : "false"}
      aria-hidden="true"
    >
      <div className="floating-agent-inner">
        <Agent mood={effectiveMood} />
      </div>
    </div>
  );
}
