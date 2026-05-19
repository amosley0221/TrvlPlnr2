// Multiple trip templates. Each prompt routes to one of these.

window.SUGGESTIONS = [
  { emoji: "🏖️", label: "Beach week in Tulum" },
  { emoji: "🗼", label: "Paris anniversary" },
  { emoji: "🎿", label: "Snowboard trip to Aspen" },
  { emoji: "🍣", label: "Foodie tour of Tokyo" },
  { emoji: "🥧", label: "Long weekend in Lisbon" },
  { emoji: "🏝️", label: "Bali honeymoon" },
];

window.QUICK_CHIPS = [
  { id: "people", label: "2 travelers", emoji: "👯", color: "sky" },
  { id: "budget", label: "$3,500 budget", emoji: "💸", color: "lime" },
  { id: "vibe", label: "Romantic", emoji: "💞", color: "coral" },
  { id: "dates", label: "Sep 14 → Sep 21", emoji: "📅", color: "sun" },
];

window.THINKING_STEPS = [
  { emoji: "🌍", text: "Reading your prompt and pulling location data" },
  { emoji: "✈️", text: "Scanning 47 flights across 6 carriers" },
  { emoji: "🏨", text: "Comparing 124 hotels and 86 Airbnbs" },
  { emoji: "🚗", text: "Checking rental cars, trains, and shuttles" },
  { emoji: "🍽️", text: "Curating restaurants and reservations" },
  { emoji: "✨", text: "Stitching it all into a plan" },
];

window.SWAP_OPTIONS = {
  flight: [
    { emoji: "✈️", title: "JetBlue 1487 · Nonstop", meta: "4h 22m · arr 13:57", price: 471, tag: "fast" },
    { emoji: "✈️", title: "Spirit 234 · 1 stop in FLL", meta: "7h 50m · arr 17:25", price: 218, tag: "cheap" },
    { emoji: "✈️", title: "Delta 612 · Nonstop", meta: "4h 30m · main cabin", price: 512, tag: null },
    { emoji: "🛬", title: "American 88 · Nonstop", meta: "4h 18m · arr 13:50", price: 489, tag: null },
    { emoji: "✈️", title: "AeroMéxico 901 · Premium", meta: "Nonstop · lie-flat", price: 1240, tag: "lux" },
  ],
  hotel: [
    { emoji: "🏨", title: "Casa Malca · Oceanfront", meta: "Boutique · 9.4/10", price: 1418, tag: null },
    { emoji: "🏡", title: "Airbnb · Jungle treehouse", meta: "2 BR · pool · 4.92★", price: 980, tag: "cheap" },
    { emoji: "🌴", title: "Azulik · Adults-only villa", meta: "No electricity · iconic", price: 2640, tag: "lux" },
    { emoji: "🏖️", title: "Be Tulum · Beachfront", meta: "Spa + breakfast · 9.1/10", price: 1720, tag: null },
  ],
  car: [
    { emoji: "🚗", title: "Hertz · Compact", meta: "Auto · 7 days · CUN", price: 286, tag: null },
    { emoji: "🚌", title: "ADO shuttle bus", meta: "CUN → Tulum · 2h 10m", price: 32, tag: "cheap" },
    { emoji: "🚙", title: "Avis · SUV", meta: "Auto · 7 days · CUN", price: 412, tag: null },
    { emoji: "🚐", title: "Private transfer", meta: "Door-to-door · driver", price: 180, tag: null },
  ],
};

window.SAVED_TRIPS = [
  { id: "saved-1", title: "Tokyo cherry blossom run", where: "Tokyo + Kyoto · 10 days", hero: "🌸", color: "bubblegum", savedAt: "Saved Aug 02", priceWhenSaved: 4890, priceNow: 4612, nights: 10, travelers: 2 },
  { id: "saved-2", title: "Iceland ring road", where: "Reykjavik loop · 8 days", hero: "🌋", color: "sky", savedAt: "Saved Jul 18", priceWhenSaved: 3120, priceNow: 3445, nights: 8, travelers: 2 },
  { id: "saved-3", title: "Lisbon long weekend", where: "Lisbon · 4 nights", hero: "🇵🇹", color: "sun", savedAt: "Saved Aug 21", priceWhenSaved: 1280, priceNow: 1280, nights: 4, travelers: 2 },
  { id: "saved-4", title: "Banff family ski", where: "Banff · 6 days · 4 ppl", hero: "🏔️", color: "mint", savedAt: "Saved Aug 30", priceWhenSaved: 6420, priceNow: 5980, nights: 6, travelers: 4 },
];

window.fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
window.fmtDelta = (a, b) => {
  const d = b - a;
  if (d === 0) return { dir: "flat", text: "no change", val: 0 };
  return { dir: d > 0 ? "up" : "down", text: (d > 0 ? "+" : "−") + "$" + Math.abs(d).toLocaleString(), val: d };
};

window.TRIPS = {
  tulum: {
    id: "trip-tulum",
    title: "Tulum",
    keywords: ["tulum", "mexico", "beach", "anniversary", "romantic", "cenote"],
    vibe: "Romantic anniversary",
    travelers: 2,
    origin: "New York (JFK)",
    destination: "Tulum, Mexico (via CUN)",
    dateFrom: "Sep 14", dateTo: "Sep 21", nights: 7,
    total: 3286, perPerson: 1643,
    hero: "🌴", color: "coral",
    breakdown: [
      { key: "flights", label: "Flights", val: 942, color: "var(--sky)", emoji: "✈️" },
      { key: "stay", label: "Stay", val: 1418, color: "var(--bubblegum)", emoji: "🏨" },
      { key: "car", label: "Transport", val: 286, color: "var(--tangerine)", emoji: "🚗" },
      { key: "food", label: "Food", val: 420, color: "var(--lime)", emoji: "🍽️" },
      { key: "fun", label: "Activities", val: 220, color: "var(--sunshine)", emoji: "🎟️" },
    ],
    days: [
      { label: "Sun, Sep 14", title: "Fly + arrive", events: [
        { time: "09:35", icon: "flight", emoji: "✈️", title: "JetBlue 1487 · JFK → CUN", meta: "Nonstop · 4h 22m · 1 bag", cost: 471, was: 519, vendor: "JetBlue" },
        { time: "16:10", icon: "car", emoji: "🚗", title: "Hertz compact · CUN airport", meta: "Pickup at terminal 4 · 7 days", cost: 286, vendor: "Hertz" },
        { time: "18:30", icon: "hotel", emoji: "🏨", title: "Casa Malca · Oceanfront suite", meta: "Check-in · 7 nights · breakfast", cost: 1418, was: 1582, vendor: "Booking.com" },
        { time: "20:00", icon: "food", emoji: "🍽️", title: "Dinner at Hartwood", meta: "Open-fire kitchen · res. for 2", cost: 140 },
      ]},
      { label: "Mon, Sep 15", title: "Beach + cenote", events: [
        { time: "10:00", icon: "fun", emoji: "🤿", title: "Cenote Dos Ojos snorkel tour", meta: "Half-day · gear + guide", cost: 95 },
        { time: "14:00", icon: "food", emoji: "🌮", title: "Lunch at Taqueria Honorio", meta: "Local favorite · cash", cost: 28 },
        { time: "19:30", icon: "food", emoji: "🍸", title: "Sunset cocktails at Gitano", meta: "Reservation suggested", cost: 60 },
      ]},
      { label: "Tue, Sep 16", title: "Ruins day", events: [
        { time: "08:00", icon: "fun", emoji: "🏛️", title: "Tulum Ruins early-entry tour", meta: "Skip-the-line · 2 hrs", cost: 80 },
        { time: "13:00", icon: "food", emoji: "🥗", title: "Lunch at Arca", meta: "Coastal Mexican · res. 1pm", cost: 95 },
      ]},
      { label: "Sun, Sep 21", title: "Fly home", events: [
        { time: "11:00", icon: "car", emoji: "🚗", title: "Drop rental at CUN", meta: "Return Hertz · before noon", cost: 0 },
        { time: "14:25", icon: "flight", emoji: "✈️", title: "JetBlue 1488 · CUN → JFK", meta: "Nonstop · 4h 12m", cost: 471, vendor: "JetBlue" },
      ]},
    ],
  },

  paris: {
    id: "trip-paris",
    title: "Paris",
    keywords: ["paris", "france", "anniversary", "europe", "romantic", "eiffel"],
    vibe: "Anniversary in the City of Light",
    travelers: 2,
    origin: "New York (JFK)",
    destination: "Paris, France (CDG)",
    dateFrom: "Oct 12", dateTo: "Oct 18", nights: 6,
    total: 4120, perPerson: 2060,
    hero: "🗼", color: "grape",
    breakdown: [
      { key: "flights", label: "Flights", val: 1380, color: "var(--sky)", emoji: "✈️" },
      { key: "stay", label: "Stay", val: 1680, color: "var(--bubblegum)", emoji: "🏨" },
      { key: "car", label: "Transit", val: 95, color: "var(--tangerine)", emoji: "🚆" },
      { key: "food", label: "Food", val: 685, color: "var(--lime)", emoji: "🍽️" },
      { key: "fun", label: "Activities", val: 280, color: "var(--sunshine)", emoji: "🎟️" },
    ],
    days: [
      { label: "Sun, Oct 12", title: "Red-eye + check-in", events: [
        { time: "21:55", icon: "flight", emoji: "✈️", title: "Air France 23 · JFK → CDG", meta: "Nonstop · 7h 10m · main", cost: 690, was: 820, vendor: "Air France" },
        { time: "12:30", icon: "train", emoji: "🚆", title: "RER B · CDG → Châtelet", meta: "Airport train · 35 min", cost: 22, vendor: "SNCF" },
        { time: "14:00", icon: "hotel", emoji: "🏨", title: "Hôtel Particulier Montmartre", meta: "Boutique · 6 nights · breakfast", cost: 1680, was: 1820, vendor: "Booking.com" },
        { time: "20:00", icon: "food", emoji: "🍷", title: "Dinner at Septime", meta: "Hard reservation · tasting menu", cost: 290 },
      ]},
      { label: "Mon, Oct 13", title: "Louvre + Seine", events: [
        { time: "09:30", icon: "fun", emoji: "🖼️", title: "Louvre skip-the-line", meta: "Timed entry · audio guide", cost: 60 },
        { time: "13:00", icon: "food", emoji: "🥐", title: "Lunch at Le Comptoir du Relais", meta: "Classic bistro · St-Germain", cost: 95 },
        { time: "19:00", icon: "fun", emoji: "🛥️", title: "Sunset Seine cruise", meta: "1h 15m · with champagne", cost: 90 },
      ]},
      { label: "Tue, Oct 14", title: "Versailles day-trip", events: [
        { time: "08:30", icon: "train", emoji: "🚆", title: "RER C to Versailles", meta: "45 min · return", cost: 18 },
        { time: "10:00", icon: "fun", emoji: "🏰", title: "Château de Versailles · Passport", meta: "Palace + gardens · 4 hrs", cost: 130 },
      ]},
      { label: "Sat, Oct 18", title: "Fly home", events: [
        { time: "10:25", icon: "train", emoji: "🚆", title: "RER B to CDG", meta: "35 min", cost: 22 },
        { time: "13:50", icon: "flight", emoji: "✈️", title: "Air France 22 · CDG → JFK", meta: "Nonstop · 8h 30m", cost: 690, vendor: "Air France" },
      ]},
    ],
  },

  tokyo: {
    id: "trip-tokyo",
    title: "Tokyo",
    keywords: ["tokyo", "japan", "food", "foodie", "sushi", "asia"],
    vibe: "Foodie tour of Tokyo",
    travelers: 2,
    origin: "Los Angeles (LAX)",
    destination: "Tokyo, Japan (HND)",
    dateFrom: "Apr 03", dateTo: "Apr 12", nights: 9,
    total: 5840, perPerson: 2920,
    hero: "🍣", color: "bubblegum",
    breakdown: [
      { key: "flights", label: "Flights", val: 2240, color: "var(--sky)", emoji: "✈️" },
      { key: "stay", label: "Stay", val: 1980, color: "var(--bubblegum)", emoji: "🏨" },
      { key: "car", label: "Rail pass", val: 320, color: "var(--tangerine)", emoji: "🚄" },
      { key: "food", label: "Food", val: 980, color: "var(--lime)", emoji: "🍣" },
      { key: "fun", label: "Activities", val: 320, color: "var(--sunshine)", emoji: "🎟️" },
    ],
    days: [
      { label: "Thu, Apr 03", title: "Fly + ramen night", events: [
        { time: "11:25", icon: "flight", emoji: "✈️", title: "ANA 175 · LAX → HND", meta: "Nonstop · 11h 30m · Premium econ", cost: 1120, was: 1340, vendor: "ANA" },
        { time: "17:00", icon: "train", emoji: "🚄", title: "JR Pass · 7-day", meta: "Activate at HND · whisper-quiet", cost: 320, vendor: "JR East" },
        { time: "18:30", icon: "hotel", emoji: "🏨", title: "Hoshinoya Tokyo · Ryokan suite", meta: "9 nights · onsen · tatami", cost: 1980, was: 2120, vendor: "Booking.com" },
        { time: "21:00", icon: "food", emoji: "🍜", title: "Ramen at Afuri Ebisu", meta: "Yuzu-shio · no res.", cost: 24 },
      ]},
      { label: "Fri, Apr 04", title: "Tsukiji + sushi", events: [
        { time: "06:00", icon: "fun", emoji: "🐟", title: "Toyosu Market tour", meta: "Tuna auction · breakfast incl.", cost: 95 },
        { time: "12:00", icon: "food", emoji: "🍣", title: "Sukiyabashi Jiro Roppongi", meta: "Omakase · 20 pieces", cost: 380 },
        { time: "20:00", icon: "fun", emoji: "🎮", title: "Akihabara arcade crawl", meta: "Self-guided · 3 hrs", cost: 40 },
      ]},
      { label: "Sat, Apr 12", title: "Fly home", events: [
        { time: "11:00", icon: "train", emoji: "🚄", title: "Narita Express to airport", meta: "60 min · reserved seat", cost: 0 },
        { time: "16:55", icon: "flight", emoji: "✈️", title: "ANA 176 · HND → LAX", meta: "Nonstop · 9h 50m", cost: 1120, vendor: "ANA" },
      ]},
    ],
  },

  aspen: {
    id: "trip-aspen",
    title: "Aspen",
    keywords: ["aspen", "ski", "snowboard", "snow", "mountain", "winter", "banff", "colorado"],
    vibe: "Snowboard squad trip",
    travelers: 4,
    origin: "Chicago (ORD)",
    destination: "Aspen, CO (ASE)",
    dateFrom: "Feb 14", dateTo: "Feb 21", nights: 7,
    total: 8420, perPerson: 2105,
    hero: "🏔️", color: "sky",
    breakdown: [
      { key: "flights", label: "Flights", val: 2680, color: "var(--sky)", emoji: "✈️" },
      { key: "stay", label: "Cabin", val: 3640, color: "var(--bubblegum)", emoji: "🏡" },
      { key: "car", label: "SUV + gas", val: 540, color: "var(--tangerine)", emoji: "🚙" },
      { key: "food", label: "Food", val: 920, color: "var(--lime)", emoji: "🍽️" },
      { key: "fun", label: "Lift tickets", val: 640, color: "var(--sunshine)", emoji: "🎿" },
    ],
    days: [
      { label: "Sat, Feb 14", title: "Fly + cabin in", events: [
        { time: "08:15", icon: "flight", emoji: "✈️", title: "United 5821 · ORD → ASE", meta: "1 stop in DEN · 5h 40m", cost: 670, was: 720, vendor: "United" },
        { time: "16:30", icon: "car", emoji: "🚙", title: "Enterprise · 4WD SUV", meta: "7 days · ski racks", cost: 540, vendor: "Enterprise" },
        { time: "18:00", icon: "hotel", emoji: "🏡", title: "Airbnb · 4BR slope-side cabin", meta: "Hot tub · sleeps 6 · 7 nights", cost: 3640, was: 3920, vendor: "Airbnb" },
        { time: "20:30", icon: "food", emoji: "🍕", title: "Pizza at New York Pizza", meta: "Late night · casual", cost: 95 },
      ]},
      { label: "Sun, Feb 15", title: "First day on snow", events: [
        { time: "08:00", icon: "fun", emoji: "🎿", title: "Aspen Snowmass 4-day pass", meta: "All 4 mountains · party of 4", cost: 640 },
        { time: "13:00", icon: "food", emoji: "🍔", title: "Lunch at Cloud Nine Bistro", meta: "On-mountain · res. req.", cost: 280 },
      ]},
      { label: "Sat, Feb 21", title: "Fly home", events: [
        { time: "12:00", icon: "car", emoji: "🚙", title: "Return SUV to ASE", meta: "Top off gas", cost: 0 },
        { time: "15:25", icon: "flight", emoji: "✈️", title: "United 5822 · ASE → ORD", meta: "1 stop in DEN", cost: 670, vendor: "United" },
      ]},
    ],
  },

  bali: {
    id: "trip-bali",
    title: "Bali",
    keywords: ["bali", "indonesia", "honeymoon", "villa", "tropical", "ubud"],
    vibe: "Honeymoon in paradise",
    travelers: 2,
    origin: "San Francisco (SFO)",
    destination: "Bali, Indonesia (DPS)",
    dateFrom: "Jun 08", dateTo: "Jun 20", nights: 12,
    total: 7240, perPerson: 3620,
    hero: "🏝️", color: "mint",
    breakdown: [
      { key: "flights", label: "Flights", val: 2640, color: "var(--sky)", emoji: "✈️" },
      { key: "stay", label: "Villa", val: 3120, color: "var(--bubblegum)", emoji: "🏡" },
      { key: "car", label: "Driver", val: 420, color: "var(--tangerine)", emoji: "🚐" },
      { key: "food", label: "Food", val: 680, color: "var(--lime)", emoji: "🍜" },
      { key: "fun", label: "Activities", val: 380, color: "var(--sunshine)", emoji: "🌺" },
    ],
    days: [
      { label: "Sun, Jun 08", title: "Long-haul arrival", events: [
        { time: "10:55", icon: "flight", emoji: "✈️", title: "Singapore 1 · SFO → DPS", meta: "1 stop in SIN · 22h 10m · biz", cost: 1320, was: 1480, vendor: "Singapore Airlines" },
        { time: "22:00", icon: "car", emoji: "🚐", title: "Private transfer · DPS → Ubud", meta: "1h 30m · A/C", cost: 80 },
        { time: "23:30", icon: "hotel", emoji: "🏡", title: "Bambu Indah · Jungle villa", meta: "12 nights · private pool", cost: 3120, vendor: "Booking.com" },
      ]},
      { label: "Mon, Jun 09", title: "Rice terraces + spa", events: [
        { time: "08:00", icon: "fun", emoji: "🌾", title: "Tegallalang sunrise walk", meta: "Guided · 2 hrs", cost: 45 },
        { time: "14:00", icon: "fun", emoji: "💆", title: "Couples spa at Karsa", meta: "90 min · in jungle", cost: 110 },
        { time: "19:00", icon: "food", emoji: "🍜", title: "Dinner at Locavore To Go", meta: "Tasting box · in-villa", cost: 95 },
      ]},
      { label: "Fri, Jun 20", title: "Fly home", events: [
        { time: "06:30", icon: "car", emoji: "🚐", title: "Transfer DPS · early run", meta: "Sunrise on the way", cost: 80 },
        { time: "10:40", icon: "flight", emoji: "✈️", title: "Singapore 2 · DPS → SFO", meta: "1 stop in SIN · 24h", cost: 1320, vendor: "Singapore Airlines" },
      ]},
    ],
  },

  lisbon: {
    id: "trip-lisbon",
    title: "Lisbon",
    keywords: ["lisbon", "portugal", "europe", "backpack", "weekend", "porto"],
    vibe: "Long weekend with friends",
    travelers: 3,
    origin: "Boston (BOS)",
    destination: "Lisbon, Portugal (LIS)",
    dateFrom: "Sep 25", dateTo: "Sep 29", nights: 4,
    total: 2980, perPerson: 993,
    hero: "🇵🇹", color: "sun",
    breakdown: [
      { key: "flights", label: "Flights", val: 1530, color: "var(--sky)", emoji: "✈️" },
      { key: "stay", label: "Airbnb", val: 720, color: "var(--bubblegum)", emoji: "🏡" },
      { key: "car", label: "Tram + Uber", val: 80, color: "var(--tangerine)", emoji: "🚋" },
      { key: "food", label: "Food", val: 480, color: "var(--lime)", emoji: "🥧" },
      { key: "fun", label: "Activities", val: 170, color: "var(--sunshine)", emoji: "🎶" },
    ],
    days: [
      { label: "Thu, Sep 25", title: "Red-eye in", events: [
        { time: "21:40", icon: "flight", emoji: "✈️", title: "TAP 218 · BOS → LIS", meta: "Nonstop · 6h 35m", cost: 510, was: 595, vendor: "TAP Air Portugal" },
        { time: "11:00", icon: "hotel", emoji: "🏡", title: "Airbnb · Alfama loft (3BR)", meta: "4 nights · views of Tagus", cost: 720, vendor: "Airbnb" },
        { time: "20:00", icon: "food", emoji: "🦐", title: "Dinner at Cervejaria Ramiro", meta: "Walk-in · seafood", cost: 145 },
      ]},
      { label: "Fri, Sep 26", title: "Pastéis + fado", events: [
        { time: "10:00", icon: "fun", emoji: "🥧", title: "Pastéis de Belém pilgrimage", meta: "Tram 15 · custard tarts", cost: 12 },
        { time: "21:00", icon: "fun", emoji: "🎶", title: "Fado night at Tasca do Chico", meta: "Live music · 2 hrs", cost: 110 },
      ]},
      { label: "Mon, Sep 29", title: "Fly home", events: [
        { time: "13:25", icon: "flight", emoji: "✈️", title: "TAP 217 · LIS → BOS", meta: "Nonstop · 7h 55m", cost: 510, vendor: "TAP Air Portugal" },
      ]},
    ],
  },
};

// Pick a trip from the user's prompt + chips
window.matchTrip = function(prompt) {
  const p = (prompt || "").toLowerCase();
  const trips = Object.values(window.TRIPS);
  let best = null, bestScore = 0;
  for (const t of trips) {
    let score = 0;
    for (const kw of t.keywords) if (p.includes(kw)) score += 1;
    if (score > bestScore) { bestScore = score; best = t; }
  }
  if (best) return best;
  // No match — pick a random one so the user sees variety
  return trips[Math.floor(Math.random() * trips.length)];
};

// keep MOCK_TRIP for backward compat — points at Tulum
window.MOCK_TRIP = window.TRIPS.tulum;
