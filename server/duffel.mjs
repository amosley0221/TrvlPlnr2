// Duffel Flights API wrapper.
//
// Docs: https://duffel.com/docs/api
//
// Sandbox keys (duffel_test_*) and live keys (duffel_live_*) hit the same
// endpoint; the key selects the environment. Sandbox returns realistic-
// shaped test offers for free; live returns real airline inventory and
// charges per booked offer (searches are free).

const DUFFEL_BASE = "https://api.duffel.com";
const DUFFEL_VERSION = "v2";

export function isDuffelConfigured() {
  return !!process.env.DUFFEL_API_KEY;
}

// Search round-trip offers for a route. Returns the raw `data.offers` array
// from Duffel (already sorted server-side). Throws on any failure — the
// caller is responsible for catching + falling back to Claude's estimates.
export async function searchOffers({
  origin,
  destination,
  dateFrom,
  dateTo,
  passengers = 2,
  cabinClass = "economy",
}) {
  if (!isDuffelConfigured()) throw new Error("DUFFEL_API_KEY not set");
  if (!origin || !destination || !dateFrom) {
    throw new Error("origin, destination, dateFrom required");
  }

  const slices = [{ origin, destination, departure_date: dateFrom }];
  if (dateTo) {
    slices.push({
      origin: destination,
      destination: origin,
      departure_date: dateTo,
    });
  }

  const body = {
    data: {
      slices,
      passengers: Array(Math.max(1, Math.min(9, passengers))).fill({
        type: "adult",
      }),
      cabin_class: cabinClass,
    },
  };

  // `return_offers=true` inlines offers in the response, so we get them
  // in one round-trip instead of poll-for-offers.
  const resp = await fetch(
    `${DUFFEL_BASE}/air/offer_requests?return_offers=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
        "Duffel-Version": DUFFEL_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    const err = new Error(`Duffel ${resp.status}: ${text.slice(0, 300)}`);
    err.status = resp.status;
    throw err;
  }

  const json = await resp.json();
  return json?.data?.offers || [];
}

// Map a Duffel offer to the bookingOptions.flights row shape the UI expects.
// Returns null for offers we want to drop entirely (e.g. Duffel's fake test
// carrier "Duffel Airways" / IATA "ZZ" that shows up in sandbox results).
export function duffelOfferToFlight(offer, { isBest = false, tag } = {}) {
  const slice = offer?.slices?.[0];
  const segments = slice?.segments || [];
  if (!slice || segments.length === 0) return null;

  const seg0 = segments[0];
  const airline = offer.owner?.name || seg0.marketing_carrier?.name || "Airline";

  // Drop Duffel's sandbox test airline — it's not a real carrier and links
  // back to duffel.com instead of a bookable site. When the user upgrades
  // to a live key these never appear, but the filter is cheap insurance.
  const ownerCode = (offer.owner?.iata_code || "").toUpperCase();
  const segCode = (seg0.marketing_carrier?.iata_code || "").toUpperCase();
  if (
    ownerCode === "ZZ" ||
    segCode === "ZZ" ||
    /duffel\s*airways/i.test(airline)
  ) {
    return null;
  }

  const carrierCode = seg0.marketing_carrier?.iata_code || "";
  const flightNum = seg0.marketing_carrier_flight_number || "";
  const flightLabel = (carrierCode + " " + flightNum).trim() || airline;

  const originCode = slice.origin?.iata_code || "";
  const destCode = slice.destination?.iata_code || "";
  const route = `${originCode} → ${destCode}`;

  const stops = segments.length - 1;
  const stopsPart =
    stops === 0 ? "Nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`;
  const duration = humanizeIsoDuration(slice.duration);

  const cabin =
    seg0.passengers?.[0]?.cabin_class_marketing_name ||
    seg0.passengers?.[0]?.cabin_class ||
    "main cabin";

  const meta = [stopsPart, duration, cabin].filter(Boolean).join(" · ");

  const totalUsd = parseFloat(offer.total_amount || "0");
  const price = Number.isFinite(totalUsd) ? Math.round(totalUsd) : 0;

  return {
    airline,
    flight: flightLabel,
    route,
    meta,
    price,
    host: airlineHost(airline) || "duffel.com",
    ...(isBest ? { best: true } : {}),
    ...(tag ? { tag } : {}),
  };
}

function humanizeIsoDuration(iso) {
  // "PT4H22M" -> "4h 22m"
  if (!iso) return "";
  const m = String(iso).match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  const h = m[1] ? `${m[1]}h` : "";
  const min = m[2] ? `${m[2]}m` : "";
  return [h, min].filter(Boolean).join(" ") || iso;
}

// Map a carrier name to a known booking host. Falls back to duffel.com.
function airlineHost(name) {
  const n = (name || "").toLowerCase();
  const map = [
    ["jetblue", "jetblue.com"],
    ["delta", "delta.com"],
    ["united", "united.com"],
    ["american", "aa.com"],
    ["southwest", "southwest.com"],
    ["alaska", "alaskaair.com"],
    ["spirit", "spirit.com"],
    ["frontier", "flyfrontier.com"],
    ["hawaiian", "hawaiianair.com"],
    ["allegiant", "allegiantair.com"],
    ["breeze", "flybreeze.com"],
    ["avelo", "aveloair.com"],
    ["sun country", "suncountry.com"],
    ["air canada", "aircanada.com"],
    ["westjet", "westjet.com"],
    ["porter", "flyporter.com"],
    ["british airways", "britishairways.com"],
    ["lufthansa", "lufthansa.com"],
    ["air france", "airfrance.com"],
    ["klm", "klm.com"],
    ["iberia", "iberia.com"],
    ["tap", "flytap.com"],
    ["azores", "azoresairlines.pt"],
    ["swiss", "swiss.com"],
    ["austrian", "austrian.com"],
    ["ita", "ita-airways.com"],
    ["sas", "flysas.com"],
    ["aer lingus", "aerlingus.com"],
    ["virgin atlantic", "virginatlantic.com"],
    ["ryanair", "ryanair.com"],
    ["easyjet", "easyjet.com"],
    ["norwegian", "norwegian.com"],
    ["finnair", "finnair.com"],
    ["vueling", "vueling.com"],
    ["wizz", "wizzair.com"],
    ["french bee", "frenchbee.com"],
    ["la compagnie", "lacompagnie.com"],
    ["emirates", "emirates.com"],
    ["qatar", "qatarairways.com"],
    ["etihad", "etihad.com"],
    ["turkish", "turkishairlines.com"],
    ["singapore", "singaporeair.com"],
    ["cathay", "cathaypacific.com"],
    ["korean", "koreanair.com"],
    ["asiana", "flyasiana.com"],
    ["ana", "ana.co.jp"],
    ["all nippon", "ana.co.jp"],
    ["jal", "jal.co.jp"],
    ["japan airlines", "jal.co.jp"],
    ["zipair", "zipair.net"],
    ["eva", "evaair.com"],
    ["china airlines", "china-airlines.com"],
    ["airasia", "airasia.com"],
    ["vietnam", "vietnamairlines.com"],
    ["thai airways", "thaiairways.com"],
    ["garuda", "garuda-indonesia.com"],
    ["philippine", "philippineairlines.com"],
    ["air india", "airindia.com"],
    ["indigo", "goindigo.in"],
    ["aeromexico", "aeromexico.com"],
    ["aeroméxico", "aeromexico.com"],
    ["latam", "latamairlines.com"],
    ["avianca", "avianca.com"],
    ["copa", "copaair.com"],
    ["volaris", "volaris.com"],
    ["azul", "voeazul.com.br"],
    ["gol", "voegol.com.br"],
    ["qantas", "qantas.com"],
    ["air new zealand", "airnewzealand.com"],
    ["virgin australia", "virginaustralia.com"],
    ["fiji", "fijiairways.com"],
    ["jetstar", "jetstar.com"],
  ];
  for (const [needle, host] of map) if (n.includes(needle)) return host;
  return null;
}
