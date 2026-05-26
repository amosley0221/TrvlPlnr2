# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend dev (Vite, port 5173). Proxies /api → localhost:8787.
npm run dev

# Backend dev (Node, port 8787). Uses --watch + --env-file=.env.
# Requires .env with at minimum ANTHROPIC_API_KEY (see .env.example).
npm run dev:server

# Production build of the static site → dist/
npm run build

# Run built server (Render uses this for the API service)
npm start

# Regenerate PWA icons from src into public/ (requires sharp)
npm run generate-icons
```

There are no tests, no linter, no formatter. Don't add them unless the user asks.

## Deploy target

Render. `render.yaml` defines two services off this repo's single branch:

- `trvlplnnr-api` (Node) — serves `/api/*`. Reads `ANTHROPIC_API_KEY`, `CORS_ORIGIN`, `DUFFEL_API_KEY` from the dashboard. The system prompt is loaded once at boot, so prompt edits require the service to restart for the change to be live.
- `trvlplnnr` (static) — Vite build. Reads `VITE_API_URL` at build time so the bundle knows where to send `/api` calls.

Sessions run in an ephemeral cloud container; the working branch is `claude/implement-index-html-ttrHQ` and it's the only branch on the remote, so Render deploys from it directly. There is no `main`. `/api/health` returns a `version` block (commit SHA, branch, uptime) — curl it after pushing to confirm a deploy actually picked up the new code.

## Architecture

Two-tier app: a React SPA that calls a single Node endpoint, which calls Claude and (optionally) Duffel.

### Backend (`server/`)

`server/index.mjs` is the only entry. One real endpoint:

- `POST /api/plan-trip` — takes `{ prompt, constraints, today }`, returns `{ trip, timing }`.

Flow inside the handler:

1. `buildUserMessage()` prepends `Today is …` (sent by the browser in its locale, so relative phrases like "this weekend" resolve correctly) and serializes constraints into a literal-instruction block.
2. Calls `anthropic.messages.create()` with `claude-sonnet-4-6`, `thinking: { type: "adaptive" }`, and the system prompt cached at `ttl: "1h"`. The 1h TTL is deliberate — sessions plan multiple trips, so any second call within the hour cache-reads at 0.1× cost.
3. `extractJsonObject()` defensively parses Claude's response. The trip schema is too deep for Anthropic's grammar compiler ("compiled grammar is too large"), so we instruct JSON-only output in the system prompt and strip ``` fences / leading prose on the way in.
4. `enhanceWithDuffel()` swaps Claude's estimated flight prices for real Duffel offers when `DUFFEL_API_KEY` is set. Failures are logged and ignored — the user always gets the AI plan even if Duffel breaks. Ground options (drive / Amtrak / bus) Claude included are preserved alongside the Duffel-sourced flights.

The system prompt lives in `server/system-prompt.mjs` and is large (~13K characters) by design — it must clear Sonnet's 2048-token caching minimum. It encodes the trip schema, IATA airport mappings by ZIP prefix, vendor → booking-host mapping (~100 airlines/hotels/cars/rail), and the rules for multi-destination `lodging` vs flat `stays`, round-trip flight handling, etc. Changes here always invalidate the prompt cache; the next call after a deploy will be a full cache miss.

`server/duffel.mjs` is a thin wrapper around Duffel's `POST /air/offer_requests?return_offers=true`. `duffelOfferToFlight()` maps a Duffel offer into the `bookingOptions.flights` row shape; it filters out the sandbox carrier "Duffel Airways" / IATA `ZZ`.

### Frontend (`src/`)

`App.jsx` owns all top-level state (view, prompt text, constraints, current trip, saved trips, bookings, modal state). It coordinates `Views.jsx` which switches between landing / thinking / plan / saved / bookings panels. Saved trips, bookings, and constraints persist to `localStorage` under versioned keys (`trvlplnr.saved.v1`, etc.) — bump the version to silently reset stale data on schema changes.

Two flows for producing a trip:

- **AI path** — `src/lib/api.js` `planTripWithAI()` calls `/api/plan-trip`. `AI_ENABLED` is true when `VITE_API_URL` is set OR `vite dev` is running.
- **Template path** — `src/data/trips.js` `matchTrip(prompt, constraints)` returns a hard-coded template trip if the prompt matches a keyword. Used as a fallback when the AI fails and as offline demo content. `matchTrip` returns `null` rather than a default so the no-match modal can surface.

Either way, the trip object is the unit of currency for the whole UI. Its shape is documented exhaustively in `server/system-prompt.mjs`. Key invariants:

- `bookingOptions` has parallel arrays (`flights`, `stays` OR `lodging`, `transport`, `extras`). `lodging` is per-segment for multi-city trips and replaces `stays` entirely.
- `selection` (added client-side by `initialSelection()`) is a map of `{ flights: idx, stays: idx, transport: idx, lodging: [idxPerSegment] }` pointing into those arrays.
- `recomputeTripForSelection()` rebuilds `total`, `breakdown`, and `days` from the current selection. Call it after any swap. The `applyFlightToEvents` / `applyStayToEvents` / `applyTransportToEvents` helpers stamp the chosen option onto the matching events in `days`; `applyFlightToEvents` is the one that auto-reverses the route on the last flight event of the trip (return leg).

Modal interactions (swap, plan popup, no-match) all live in `Plan.jsx`. The popup uses radio-group `OptionRow`s to drive the selection state; the side `BookingsSummary` card hosts Save / Archive / Export-PDF actions because the popup can be dismissed before booking.

### PDF export (`src/components/TripPDF.jsx`)

Lazy-loaded via `src/lib/export-pdf.js` so the ~500KB `@react-pdf/renderer` chunk only ships when the user clicks Export. Render-side service worker config keeps the PDF chunk out of precache (large + rarely used).

Uses only the built-in Helvetica / Times-Bold fonts — react-pdf fetches Google Fonts at render time and any CORS/network blip throws inside `pdf().toBlob()` as the user-facing "Couldn't generate" error. The built-in fonts have **no emoji glyphs**, which is why:

- All event/booking icons go through a `PDFIcon` SVG component (`flight`, `hotel`, `house`, `car`, `train`, `bus`, `food`, `fun`, …) instead of emoji `<Text>` nodes.
- Free-form text fields like `trip.summary` are run through `stripEmoji()` before rendering.
- The system prompt explicitly forbids emoji in the `summary` field.

The brand mark and agent avatar are both drawn with react-pdf's `Svg` primitives — no network fetch, no font dependency.

### Booking links (`src/lib/booking-links.js`)

`buildBookingUrl(opt, trip)` produces a deep link into the carrier's flight-search form when the carrier is recognized (Delta, AA, United, JetBlue, Southwest, Alaska, Spirit, Frontier, Hawaiian, Air Canada), falls back to Skyscanner for foreign carriers, and falls back further to the bare host. `extractRoutePair` returns `[null, null]` unless it can find two distinct IATA codes — otherwise we'd produce malformed URLs like Southwest's old MCO→MCO bug.

`buildMapsUrl(ev, trip)` returns a Google Maps search URL for stays / restaurants / activities, combining `ev.vendor` (preferred) or the title (with common prefixes like "Dinner at …" / "Visit …" stripped) with the destination city for disambiguation. Flights and transport intentionally skip the Maps link.

### Floating agent (`src/components/FloatingAgent.jsx`)

The cursor-chasing agent on desktop. On touch / coarse-pointer devices it switches to a static bottom-right anchor (`.floating-agent-static`) and keeps mood-driven animations (thinking spinner, happy smile) — no cursor chase. Detection uses `matchMedia("(hover: none), (pointer: coarse)")` with a change listener so an iPad attaching a mouse gets the chase mode back.

All hooks run on every render (Rules of Hooks); behavior is gated inside effects.

### iOS PWA

`index.html` declares `apple-mobile-web-app-status-bar-style: black-translucent`, which means web content extends *under* the Dynamic Island / status bar. `.nav`, `.main`, and `.footer` use `calc(N + env(safe-area-inset-*))` padding to clear it. `html` and `body` both have `overflow-x: hidden` because a sticky child can otherwise cause horizontal page scrolling in Safari even when only `body` has the rule.
