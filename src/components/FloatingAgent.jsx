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
  const [touchMode, setTouchMode] = useState(false);

  // Detect touch / coarse-pointer devices and react to changes
  // (e.g. iPad attaching a mouse). All hooks run on every render to
  // satisfy Rules of Hooks; behavior gates inside the effects.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mql = window.matchMedia("(hover: none), (pointer: coarse)");
    setTouchMode(mql.matches);
    const onChange = () => setTouchMode(mql.matches);
    if (mql.addEventListener) {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  useEffect(() => {
    if (hidden || touchMode) return undefined;

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
  }, [ready, hidden, touchMode]);

  useEffect(() => {
    if (hidden || touchMode) return undefined;

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
  }, [mood, overInteractive, hidden, touchMode]);

  if (hidden) return null;

  // Touch / iPad / mobile: anchor in the bottom-right, no cursor chase. The
  // mood still drives the agent's face — thinking spinner, happy smile, etc.
  if (touchMode) {
    return (
      <div className="floating-agent floating-agent-static" aria-hidden="true">
        <div className="floating-agent-inner-static">
          <Agent mood={mood} />
        </div>
      </div>
    );
  }

  // Desktop chase mode — thinking takes priority over confused so a submitted
  // prompt always animates correctly even if the cursor rests on a button.
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
