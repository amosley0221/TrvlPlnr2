const RAW_BASE = import.meta.env.VITE_API_URL ?? "";
const API_BASE = RAW_BASE.replace(/\/$/, "");

// AI is enabled if either:
//   - VITE_API_URL is set (production deploys), OR
//   - we're running through `vite dev` (which proxies /api → localhost:8787)
export const AI_ENABLED = Boolean(RAW_BASE) || Boolean(import.meta.env.DEV);

export class AINotEnabledError extends Error {
  constructor() {
    super("AI not enabled (set VITE_API_URL or run vite dev with the server up)");
    this.name = "AINotEnabledError";
  }
}

export async function planTripWithAI(prompt, constraints, { signal } = {}) {
  if (!AI_ENABLED) throw new AINotEnabledError();

  // Send today's date with every request so Claude can resolve relative
  // phrases like "this weekend" or "next month". We use the browser's
  // local date (not the server's UTC) so timezones don't shift the answer.
  const now = new Date();
  const today = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const url = `${API_BASE}/api/plan-trip`;
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, constraints, today }),
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new Error(`Network error contacting AI: ${err?.message || err}`);
  }

  if (!response.ok) {
    let message = `AI returned ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error?.message) message = body.error.message;
    } catch {
      // ignore — non-JSON error
    }
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  if (!data?.trip || typeof data.trip !== "object") {
    throw new Error("AI returned an invalid response");
  }
  return data.trip;
}
