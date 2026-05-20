// Build a deep-link URL for a bookingOptions row (flight / stay / etc.)
// from the trip context. For flight rows where we recognize the carrier,
// the URL pre-fills origin, destination, dates, and traveler count in
// that airline's flight-search form. Otherwise we fall back to a
// Skyscanner search for the route, then finally to the bare host.
//
// Airline URL formats break occasionally — when one stops working, the
// Skyscanner fallback still gives the user a useful starting point.

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function shortDateToISO(short) {
  if (!short) return null;
  const m = String(short).trim().match(/^(\w+)\s+(\d+)/);
  if (!m) return null;
  const monthIdx = MONTHS[m[1].slice(0, 3).toLowerCase()];
  if (monthIdx == null) return null;
  const day = parseInt(m[2], 10);
  if (!day || day < 1 || day > 31) return null;

  // Pick the year — if the date is already in the past, roll to next year.
  const today = new Date();
  let year = today.getFullYear();
  const candidate = new Date(year, monthIdx, day);
  if (candidate.getTime() < today.getTime() - 7 * 86400000) year += 1;
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function extractRoutePair(route) {
  if (!route) return [null, null];
  const codes = String(route).match(/\b[A-Z]{3}\b/g) || [];
  // Require BOTH endpoints. Otherwise "Your hub → MCO" would yield
  // origin=MCO/dest=MCO and the deep-link would send the user to a
  // same-airport round-trip search that 404s or errors on every carrier.
  if (codes.length < 2) return [null, null];
  const origin = codes[0];
  const dest = codes[codes.length - 1];
  if (origin === dest) return [null, null];
  return [origin, dest];
}

// Skyscanner uses YYMMDD (6-digit, no dashes) in its URL segments.
function isoToSkyTag(iso) {
  if (!iso) return null;
  return iso.slice(2).replace(/-/g, "");
}

function buildSkyscannerUrl(origin, dest, depart, ret, travelers) {
  const dTag = isoToSkyTag(depart);
  if (!dTag) return null;
  const rTag = isoToSkyTag(ret);
  const path = rTag
    ? `${origin}/${dest}/${dTag}/${rTag}/`
    : `${origin}/${dest}/${dTag}/`;
  return `https://www.skyscanner.com/transport/flights/${path}?adults=${travelers}&cabinclass=economy`;
}

// Airline-specific deep-link builders. Keep the format conservative —
// over-specifying query params makes the link more likely to break when
// the airline tweaks their site. Bare minimum is route + dates + pax.
const AIRLINE_BOOKERS = [
  {
    match: /\bdelta\.com\b/,
    build: (o, d, dep, ret, n) =>
      `https://www.delta.com/flight-search/book-a-flight?tripType=${ret ? "ROUND_TRIP" : "ONE_WAY"}&origin=${o}&destination=${d}&departureDate=${dep}${ret ? `&returnDate=${ret}` : ""}&adults=${n}`,
  },
  {
    match: /\baa\.com\b/,
    build: (o, d, dep, ret, n) =>
      `https://www.aa.com/booking/find-flights?tripType=${ret ? "roundTrip" : "oneWay"}&adult=${n}&from=${o}&to=${d}&departDate=${dep}${ret ? `&returnDate=${ret}` : ""}`,
  },
  {
    match: /\bunited\.com\b/,
    build: (o, d, dep, ret, n) =>
      `https://www.united.com/en/us/fsr/choose-flights?f=${o}&t=${d}&d=${dep}${ret ? `&r=${ret}` : ""}&tt=${ret ? "1" : "2"}&px=${n}&clm=7&st=bestmatches`,
  },
  {
    match: /\bjetblue\.com\b/,
    build: (o, d, dep, ret, n) =>
      `https://www.jetblue.com/booking/flights?from=${o}&to=${d}&depart=${dep}${ret ? `&return=${ret}` : ""}&isMultiCity=false&noOfRoute=1&adults=${n}&children=0&infants=0`,
  },
  {
    match: /\bsouthwest\.com\b/,
    build: (o, d, dep, ret, n) =>
      `https://www.southwest.com/air/booking/select.html?adultPassengersCount=${n}&departureDate=${dep}&destinationAirportCode=${d}&originationAirportCode=${o}${ret ? `&returnDate=${ret}` : ""}&tripType=${ret ? "roundtrip" : "oneway"}`,
  },
  {
    match: /\balaskaair\.com\b/,
    build: (o, d, dep, ret, n) =>
      `https://www.alaskaair.com/search/results?A=${n}&O=${o}&D=${d}&OD=${dep}${ret ? `&RD=${ret}` : ""}&RT=${ret ? "true" : "false"}`,
  },
  {
    match: /\bspirit\.com\b/,
    build: (o, d, dep, ret, n) =>
      `https://www.spirit.com/book/flights?o1=${o}&d1=${d}&dd1=${dep}${ret ? `&o2=${d}&d2=${o}&dd2=${ret}` : ""}&ADT=${n}&type=${ret ? "RT" : "OW"}`,
  },
  {
    match: /\bflyfrontier\.com\b/,
    build: (o, d, dep, ret, n) =>
      `https://booking.flyfrontier.com/Flight/InternetBooking?fromto=${o}-${d}-${dep}${ret ? `-${d}-${o}-${ret}` : ""}&adults=${n}`,
  },
  {
    match: /\bhawaiianair(lines)?\.com\b/,
    build: (o, d, dep, ret, n) =>
      `https://www.hawaiianairlines.com/search?from=${o}&to=${d}&depart=${dep}${ret ? `&return=${ret}` : ""}&adults=${n}`,
  },
  {
    match: /\baircanada\.com\b/,
    build: (o, d, dep, ret, n) =>
      `https://www.aircanada.com/bookings/flights/search?org0=${o}&dest0=${d}&departureDate0=${dep}${ret ? `&org1=${d}&dest1=${o}&departureDate1=${ret}` : ""}&adt=${n}`,
  },
  // International carriers (BA, Iberia, Lufthansa, AF, KLM, TAP, ANA, JAL,
  // Singapore, etc.) intentionally fall through to Skyscanner. Their deep-
  // link URLs change too often and frequently land on a wrong page (e.g.
  // Iberia's check-in path). Skyscanner shows the same route + dates and
  // includes the carrier among its results.
];

export function buildBookingUrl(opt, trip) {
  if (!opt) return "#";
  const host = (opt.host || "").toLowerCase();
  if (!host) return "#";

  const fallback = `https://${host}`;

  // Non-flight bookings: drive (Google Maps), Amtrak, Airbnb, hotel, etc.
  // For these we can't do anything smarter than the host itself yet, except
  // Google Maps which benefits from a real directions URL.
  if (!opt.route) return fallback;

  const [origin, dest] = extractRoutePair(opt.route);
  if (!origin || !dest) return fallback;

  // Drive options → Google Maps directions with the route's airport codes.
  if (host.includes("maps.google") || host.includes("google.com/maps")) {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
  }

  const depart = shortDateToISO(trip?.dateFrom);
  const ret = shortDateToISO(trip?.dateTo);
  const travelers = Math.max(1, Math.min(9, trip?.travelers || 2));
  if (!depart) return fallback;

  // Airline-specific deep link if we know this host.
  for (const { match, build } of AIRLINE_BOOKERS) {
    if (match.test(host)) {
      try {
        return build(origin, dest, depart, ret, travelers);
      } catch {
        break;
      }
    }
  }

  // Skyscanner search results for the route — works for any carrier.
  const sky = buildSkyscannerUrl(origin, dest, depart, ret, travelers);
  return sky || fallback;
}
