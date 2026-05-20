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
  const tFetchStart = performance.now();
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
  const fetchMs = Math.round(performance.now() - tFetchStart);

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

  // Surface timing so we can debug "searches are slow" without piping through
  // server logs. fetchMs - total_ms ≈ network overhead (incl. cold start
  // wait for the Render dyno to wake).
  if (data.timing) {
    const t = data.timing;
    const networkMs = Math.max(0, fetchMs - (t.total_ms || 0));
    /* eslint-disable no-console */
    console.groupCollapsed(
      `%c[TrvlPlnr] plan-trip took ${fetchMs}ms total (${t.cache_hit ? "cache HIT" : "cache MISS"}${t.likely_cold_start ? ", COLD START" : ""})`,
      "color:#ff4d6d;font-weight:700",
    );
    console.log("fetch (browser → server → browser):", fetchMs + "ms");
    console.log("  network overhead (incl. dyno wake):", networkMs + "ms");
    console.log("  server total:", t.total_ms + "ms");
    console.log("    claude:", t.claude_ms + "ms", `(${t.output_tokens} output tokens)`);
    console.log("    duffel:", t.duffel_ms + "ms");
    console.log(
      "cache: read",
      t.cache_read_tokens,
      "tok / create",
      t.cache_create_tokens,
      "tok",
    );
    console.log("server uptime when received:", t.seconds_since_boot + "s");
    console.groupEnd();
    /* eslint-enable no-console */
  }

  return data.trip;
}
