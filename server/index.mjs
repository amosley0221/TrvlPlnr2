import Anthropic from "@anthropic-ai/sdk";
import cors from "cors";
import express from "express";

import { SYSTEM_PROMPT } from "./system-prompt.mjs";
import { TRIP_SCHEMA } from "./schema.mjs";

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
  res.json({ ok: true, model: "claude-sonnet-4-6" });
});

app.post("/api/plan-trip", async (req, res) => {
  const { prompt, constraints } = req.body ?? {};

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: { message: "prompt is required" } });
  }
  if (prompt.length > 2000) {
    return res.status(400).json({ error: { message: "prompt is too long (max 2000 chars)" } });
  }

  const userMessage = buildUserMessage(prompt, constraints);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: TRIP_SCHEMA },
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

    // Log cache + token usage for observability. Cache hit rate should
    // approach 100% on cache_read_input_tokens after the first request.
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

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) {
      return res
        .status(502)
        .json({ error: { message: "Empty response from model." } });
    }

    let trip;
    try {
      trip = JSON.parse(textBlock.text);
    } catch (parseErr) {
      console.error("[plan-trip] JSON parse failed:", parseErr.message);
      return res
        .status(502)
        .json({ error: { message: "Model returned invalid JSON." } });
    }

    return res.json({ trip });
  } catch (err) {
    return handleAnthropicError(err, res);
  }
});

function buildUserMessage(prompt, constraints) {
  const lines = [`User trip request:\n"""\n${prompt.trim()}\n"""`];
  const c = constraints && typeof constraints === "object" ? constraints : null;
  if (c) {
    const set = [];
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
  lines.push("\nReturn the full trip JSON.");
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
