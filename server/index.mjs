import Anthropic from "@anthropic-ai/sdk";
import cors from "cors";
import express from "express";

import { SYSTEM_PROMPT } from "./system-prompt.mjs";
import {
  isDuffelConfigured,
  searchOffers as duffelSearchOffers,
  duffelOfferToFlight,
} from "./duffel.mjs";

const PORT = Number(process.env.PORT) || 8787;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    "[trvlplnr-api] ANTHROPIC_API_KEY is not set. Requests to /api/plan-trip will fail.",
  );
}

const client = new Anthropic();

const app = express();
app.use(cors({ origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(",").map(s => s.trim()) }));
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    model: "claude-sonnet-4-6",
    duffel: isDuffelConfigured() ? "enabled" : "disabled",
  });
});

app.post("/api/plan-trip", async (req, res) => {
  const { prompt, constraints, today } = req.body ?? {};

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: { message: "prompt is required" } });
  }
  if (prompt.length > 2000) {
    return res.status(400).json({ error: { message: "prompt is too long (max 2000 chars)" } });
  }

  const userMessage = buildUserMessage(prompt, constraints, today);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      // Adaptive thinking shares this budget with the final JSON output.
      // Trip JSON is ~3-4K tokens; allow plenty of headroom for thinking
      // so we never truncate the response (which produces an unparseable
      // half-finished JSON object).
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      // NOTE: structured outputs (output_config.format with a JSON schema)
      // would be ideal here, but the trip schema is too deeply nested for
      // Anthropic's grammar compiler — it returns
      // "The compiled grammar is too large". We instead instruct Claude
      // in the system prompt to return JSON-only and parse defensively.
      output_config: {
        effort: "low",
      },
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    console.log(
      "[plan-trip] tokens",
      JSON.stringify({
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cache_read: response.usage.cache_read_input_tokens ?? 0,
        cache_create: response.usage.cache_creation_input_tokens ?? 0,
        stop: response.stop_reason,
      }),
    );

    if (response.stop_reason === "refusal") {
      return res
        .status(422)
        .json({ error: { message: "I can't plan that trip.", category: "refusal" } });
    }

    if (response.stop_reason === "max_tokens") {
      console.error(
        "[plan-trip] hit max_tokens before finishing — output truncated. ",
        "Consider raising max_tokens or lowering effort.",
      );
      return res.status(502).json({
        error: { message: "The plan ran out of room before finishing. Please try again." },
      });
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) {
      return res
        .status(502)
        .json({ error: { message: "Empty response from model." } });
    }

    const jsonText = extractJsonObject(textBlock.text);
    if (!jsonText) {
      console.error("[plan-trip] no JSON object found in response:", textBlock.text.slice(0, 300));
      return res
        .status(502)
        .json({ error: { message: "Model did not return JSON." } });
    }

    let trip;
    try {
      trip = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error("[plan-trip] JSON parse failed:", parseErr.message, "near:", jsonText.slice(0, 300));
      return res
        .status(502)
        .json({ error: { message: "Model returned invalid JSON." } });
    }

    // Best-effort enhance the AI's estimated flights with real Duffel offers.
    // Failures here are logged + ignored — the user still gets the AI plan.
    const finalTrip = await enhanceWithDuffel(trip, today);

    return res.json({ trip: finalTrip });
  } catch (err) {
    return handleAnthropicError(err, res);
  }
});

// ────────────────────────────────────────────────────────────
// Duffel enhancement
// ────────────────────────────────────────────────────────────

async function enhanceWithDuffel(trip, today) {
  if (!isDuffelConfigured()) return trip;
  if (!trip?.bookingOptions?.flights?.length) return trip;

  const origin =
    extractIata(trip.origin) ||
    extractRouteOrigin(trip.bookingOptions.flights[0]?.route);
  const dest =
    extractIata(trip.destination) ||
    extractRouteDest(trip.bookingOptions.flights[0]?.route);

  if (!origin || !dest || origin === dest) {
    console.log("[duffel] skipping — no usable route from", {
      origin: trip.origin,
      dest: trip.destination,
    });
    return trip;
  }

  const dateFrom = shortDateToISO(trip.dateFrom, today);
  const dateTo = shortDateToISO(trip.dateTo, today);
  if (!dateFrom) {
    console.log("[duffel] skipping — bad dateFrom:", trip.dateFrom);
    return trip;
  }

  let offers;
  try {
    offers = await duffelSearchOffers({
      origin,
      destination: dest,
      dateFrom,
      dateTo,
      passengers: trip.travelers || 2,
    });
  } catch (err) {
    console.warn("[duffel] search failed:", err.message);
    return trip;
  }

  if (!offers.length) {
    console.log("[duffel] zero offers for", origin, "→", dest, dateFrom);
    return trip;
  }

  // Sort by price, take top 6.
  const sorted = [...offers].sort(
    (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount),
  );
  const top = sorted.slice(0, 6);

  // Best fit = cheapest nonstop, else just the cheapest.
  const bestIdx = top.findIndex(
    (o) => (o.slices?.[0]?.segments?.length || 0) === 1,
  );
  const bestI = bestIdx >= 0 ? bestIdx : 0;

  const realFlights = top
    .map((offer, i) =>
      duffelOfferToFlight(offer, {
        isBest: i === bestI,
        tag: i === 0 && i !== bestI ? "cheapest" : undefined,
      }),
    )
    .filter(Boolean);

  if (!realFlights.length) return trip;

  // Keep any drive / Amtrak / bus entries Claude included (they're not in
  // Duffel's catalog, but they're still valid alternatives).
  const groundOptions = trip.bookingOptions.flights.filter((f) => {
    const a = (f.airline || "").toLowerCase();
    return (
      a.includes("drive") ||
      a.includes("amtrak") ||
      a.includes("self-drive") ||
      a.includes("rail") ||
      a.includes("greyhound")
    );
  });

  console.log(
    `[duffel] ${origin}→${dest} ${dateFrom}: replaced ${trip.bookingOptions.flights.length - groundOptions.length} estimated flights with ${realFlights.length} live offers (kept ${groundOptions.length} ground options)`,
  );

  return {
    ...trip,
    bookingOptions: {
      ...trip.bookingOptions,
      flights: [...realFlights, ...groundOptions],
    },
    priceSource: { ...(trip.priceSource || {}), flights: "duffel" },
  };
}

// "Charleston, SC (CHS)" / "Tulum, Mexico (via CUN)" / "Orlando metro (MCO)"
// → "CHS" / "CUN" / "MCO".
function extractIata(text) {
  if (!text || typeof text !== "string") return null;
  const paren = text.match(/\(([^)]+)\)/);
  if (paren) {
    const inner = paren[1].match(/\b([A-Z]{3})\b/);
    if (inner) return inner[1];
  }
  // Also handle a bare uppercase code at end of string, e.g. "Boston BOS"
  const bare = text.match(/\b([A-Z]{3})\b\s*$/);
  return bare ? bare[1] : null;
}

function extractRouteOrigin(route) {
  if (!route) return null;
  const m = String(route).match(/\b([A-Z]{3})\b/);
  return m ? m[1] : null;
}

function extractRouteDest(route) {
  if (!route) return null;
  // Last IATA-shaped token in the route.
  const matches = String(route).match(/\b[A-Z]{3}\b/g);
  return matches && matches.length ? matches[matches.length - 1] : null;
}

// "Nov 15" + today's date → "2025-11-15". If the resolved date is already
// in the past relative to `today`, roll forward to next year.
function shortDateToISO(short, today) {
  if (!short) return null;
  const MONTHS = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const m = String(short).trim().match(/^(\w+)\s+(\d+)/);
  if (!m) return null;
  const monthIdx = MONTHS[m[1].slice(0, 3).toLowerCase()];
  if (monthIdx == null) return null;
  const day = parseInt(m[2], 10);
  if (!day || day < 1 || day > 31) return null;

  // Strip the "Tuesday, " day-of-week prefix before parsing, since Node
  // accepts "November 12, 2025" more reliably than the long form.
  const todayStr = typeof today === "string" ? today.replace(/^\w+,\s*/, "") : today;
  const todayDate = todayStr ? new Date(todayStr) : new Date();
  const baseYear = isNaN(todayDate.getTime())
    ? new Date().getFullYear()
    : todayDate.getFullYear();

  let year = baseYear;
  const candidate = new Date(year, monthIdx, day);
  const todayMidnight = isNaN(todayDate.getTime())
    ? new Date()
    : new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  // If candidate is more than a week in the past, assume next year.
  if (candidate.getTime() < todayMidnight.getTime() - 7 * 86400000) {
    year += 1;
  }
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Sonnet 4.6 reliably outputs raw JSON when instructed, but occasionally
// wraps the body in a ```json fence or a brief preamble. Strip both, then
// trim to the outermost { ... } so JSON.parse has the best chance.
function extractJsonObject(text) {
  if (!text || typeof text !== "string") return null;
  let cleaned = text.trim();

  // Drop a fenced code block if present.
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json|JSON)?\s*\n?/, "");
    cleaned = cleaned.replace(/\n?```\s*$/, "");
    cleaned = cleaned.trim();
  }

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last < first) return null;
  return cleaned.slice(first, last + 1);
}

function buildUserMessage(prompt, constraints, today) {
  const lines = [];

  // Prepend the date so Claude can resolve relative phrases like
  // "this weekend" or "next month" against the actual current date.
  // Fall back to the server's clock if the client didn't send one.
  const dateLabel =
    typeof today === "string" && today.trim()
      ? today.trim()
      : new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  lines.push(`Today is ${dateLabel}.`);
  lines.push("");
  lines.push(`User trip request:\n"""\n${prompt.trim()}\n"""`);

  const c = constraints && typeof constraints === "object" ? constraints : null;
  if (c) {
    const set = [];
    if (typeof c.home === "string" && /^\d{5}$/.test(c.home.trim())) {
      set.push(`home US ZIP code: ${c.home.trim()}`);
    }
    if (typeof c.travelers === "number" && c.travelers > 0) {
      set.push(`travelers: ${c.travelers}`);
    }
    if (typeof c.budget === "number" && c.budget > 0) {
      set.push(`budget: $${c.budget} USD`);
    }
    if (typeof c.vibe === "string" && c.vibe.trim()) {
      set.push(`vibe: ${c.vibe.trim()}`);
    }
    if (c.dates && typeof c.dates === "object" && c.dates.from && c.dates.to) {
      set.push(`dates: ${c.dates.from} through ${c.dates.to}`);
    }
    if (set.length) {
      lines.push("\nUser-set constraints (use these verbatim — do not override):");
      for (const s of set) lines.push(`- ${s}`);
    } else {
      lines.push("\n(No user-set constraints — infer reasonable defaults from the prompt.)");
    }
  }
  lines.push(
    "\nReturn the full trip as a single JSON object. No markdown fences, no prose, nothing outside the JSON.",
  );
  return lines.join("\n");
}

function handleAnthropicError(err, res) {
  if (err instanceof Anthropic.RateLimitError) {
    console.warn("[plan-trip] rate limited");
    return res.status(429).json({
      error: { message: "Rate limited. Try again in a moment." },
    });
  }
  if (err instanceof Anthropic.AuthenticationError) {
    console.error("[plan-trip] auth error — check ANTHROPIC_API_KEY");
    return res.status(500).json({
      error: { message: "Server misconfigured (auth)." },
    });
  }
  if (err instanceof Anthropic.BadRequestError) {
    console.error("[plan-trip] bad request:", err.message);
    return res.status(400).json({ error: { message: err.message } });
  }
  if (err instanceof Anthropic.APIError) {
    console.error("[plan-trip] API error", err.status, err.message);
    return res
      .status(502)
      .json({ error: { message: `Upstream error (${err.status}).` } });
  }
  console.error("[plan-trip] unexpected error:", err);
  return res.status(500).json({ error: { message: "Unexpected error." } });
}

app.listen(PORT, () => {
  console.log(`[trvlplnr-api] listening on :${PORT}`);
});
