// API-shape mock data — Duffel for flights, Booking-style for hotels, etc.
// Plus a pipeline script that the "peek under the hood" view replays.

window.DUFFEL_OFFER = {
  id: "off_0000Ay8Z6Hv8YQ5fz3X9aB",
  total_amount: "471.32",
  total_currency: "USD",
  tax_amount: "62.18",
  base_amount: "409.14",
  owner: { iata_code: "B6", name: "JetBlue Airways" },
  passengers: [{ id: "pas_0000Ay8Z...", type: "adult" }, { id: "pas_0000Ay8X...", type: "adult" }],
  slices: [{
    id: "sli_0000Ay8Z6Hv...",
    origin: { iata_code: "JFK", city_name: "New York", name: "John F. Kennedy International" },
    destination: { iata_code: "CUN", city_name: "Cancún", name: "Cancún International" },
    duration: "PT4H22M",
    segments: [{
      id: "seg_0000Ay8Z...",
      origin: { iata_code: "JFK" },
      destination: { iata_code: "CUN" },
      departing_at: "2025-09-14T09:35:00",
      arriving_at: "2025-09-14T13:57:00",
      marketing_carrier: { iata_code: "B6", name: "JetBlue Airways" },
      operating_carrier: { iata_code: "B6" },
      marketing_carrier_flight_number: "1487",
      aircraft: { iata_code: "320", name: "Airbus A320" },
      duration: "PT4H22M",
      distance: "1568.4",
    }],
    fare_brand_name: "Blue Basic",
  }],
  conditions: {
    refund_before_departure: { allowed: false, penalty_amount: null },
    change_before_departure: { allowed: true, penalty_amount: "75.00", penalty_currency: "USD" },
  },
  payment_requirements: { requires_instant_payment: true },
  expires_at: "2025-09-12T15:32:00Z",
};

window.BOOKING_HOTEL = {
  hotel_id: 1842016,
  name: "Casa Malca",
  type: "Boutique Hotel",
  address: { city: "Tulum", country: "MX", postal_code: "77780" },
  lat: 20.1378, lng: -87.4636,
  star_rating: 5,
  review_score: 9.4,
  review_count: 1287,
  rooms: [{
    room_id: "ocean_suite_king",
    name: "Oceanfront Suite — King",
    bed_config: "1 king",
    max_occupancy: 2,
    breakfast_included: true,
    free_cancellation_until: "2025-09-10T23:59:00",
    price: { currency: "USD", per_night: 202.57, total_7n: 1418.00, taxes_included: true },
  }],
  amenities: ["beachfront", "pool", "spa", "wifi", "breakfast"],
  policies: { check_in: "15:00", check_out: "12:00", deposit_required: false },
};

// Pipeline = ordered list of agent reasoning + tool-call frames.
// Each frame: { kind: 'thought' | 'tool' | 'result', ... }
window.PIPELINE = [
  { kind: "thought", text: "Parse the prompt: extract destination, dates, travelers, vibe, budget." },
  { kind: "tool", name: "parse_intent", req: { prompt: "anniversary in tulum sept 14-21 for 2, budget $3500, beach vibes" } },
  { kind: "result", from: "parse_intent", data: {
      destination: "Tulum, MX",
      origin_guess: "JFK",
      date_from: "2025-09-14",
      date_to: "2025-09-21",
      travelers: { adults: 2 },
      vibe: ["romantic", "beach", "anniversary"],
      budget_usd: 3500,
  }},
  { kind: "thought", text: "Search flights round-trip JFK ↔ CUN. Prefer nonstop, fits 2 adults." },
  { kind: "tool", name: "duffel.offer_requests.create", req: {
      slices: [
        { origin: "JFK", destination: "CUN", departure_date: "2025-09-14" },
        { origin: "CUN", destination: "JFK", departure_date: "2025-09-21" },
      ],
      passengers: [{ type: "adult" }, { type: "adult" }],
      cabin_class: "economy",
  }},
  { kind: "result", from: "duffel.offer_requests.create", data: { request_id: "orq_0000Ay8Z6Hv...", offers_found: 47, top_carriers: ["B6","DL","AA","AM","NK"] } },
  { kind: "tool", name: "duffel.offers.list", req: { offer_request_id: "orq_0000Ay8Z6Hv...", sort: "total_amount", limit: 5 } },
  { kind: "result", from: "duffel.offers.list", data: window.DUFFEL_OFFER, summary: "Best nonstop = JetBlue 1487 @ $471.32 — fits budget, fastest, anniversary-friendly evening arrival." },
  { kind: "thought", text: "Search hotels in Tulum beachfront, 9.0+ score, 7 nights." },
  { kind: "tool", name: "booking.hotels.search", req: {
      city_id: "tulum", check_in: "2025-09-14", check_out: "2025-09-21",
      guests: { adults: 2 }, min_review: 9.0, tags: ["beachfront","boutique"],
  }},
  { kind: "result", from: "booking.hotels.search", data: window.BOOKING_HOTEL, summary: "Casa Malca — oceanfront, 9.4/10, $1,418 total. Locks in 9-Sep cancellation buffer." },
  { kind: "thought", text: "Ground transport — compare rental car vs. ADO bus vs. private shuttle." },
  { kind: "tool", name: "rentalcars.search", req: { pickup: "CUN", dropoff: "CUN", from: "2025-09-14T14:30", to: "2025-09-21T13:00", driver_age: 32 } },
  { kind: "result", from: "rentalcars.search", data: { vendor: "Hertz", category: "compact", total: 286.00, deep_link: "rentalcars.com/..." } },
  { kind: "thought", text: "Dinner res + activities — Hartwood, cenote tour, Tulum ruins early entry." },
  { kind: "tool", name: "getyourguide.activities.search", req: { city: "Tulum", tags: ["cenote","ruins","food-tour"], dates: ["2025-09-15","2025-09-16"] } },
  { kind: "result", from: "getyourguide.activities.search", data: { activities: 3, total: 175.00 } },
  { kind: "tool", name: "resy.reservations.find", req: { restaurant: "Hartwood", party_size: 2, date: "2025-09-14", time: "20:00" } },
  { kind: "result", from: "resy.reservations.find", data: { available: true, hold_token: "rsy_0000hx9..." } },
  { kind: "thought", text: "Compose itinerary. Check total: $3,286 — under $3,500 budget ✓. Return plan." },
  { kind: "tool", name: "synthesize_plan", req: { lock_for_user_review: true } },
  { kind: "result", from: "synthesize_plan", data: { total_usd: 3286, days: 7, items: 14, status: "ready_for_review" } },
];
