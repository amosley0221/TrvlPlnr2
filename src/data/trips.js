export const SUGGESTIONS = [
  { emoji: "🏖️", label: "Beach week in Tulum" },
  { emoji: "🗼", label: "Paris anniversary" },
  { emoji: "🎿", label: "Snowboard trip to Aspen" },
  { emoji: "🍣", label: "Foodie tour of Tokyo" },
  { emoji: "🥧", label: "Long weekend in Lisbon" },
  { emoji: "🏝️", label: "Bali honeymoon" },
];

export const QUICK_CHIPS = [
  { id: "people", label: "2 travelers", emoji: "👯", color: "sky" },
  { id: "budget", label: "$3,500 budget", emoji: "💸", color: "lime" },
  { id: "vibe", label: "Romantic", emoji: "💞", color: "coral" },
  { id: "dates", label: "Sep 14 → Sep 21", emoji: "📅", color: "sun" },
];

export const THINKING_STEPS = [
  { emoji: "🌍", text: "Reading your prompt and pulling location data" },
  { emoji: "✈️", text: "Scanning 47 flights across 6 carriers" },
  { emoji: "🏨", text: "Comparing 124 hotels and 86 Airbnbs" },
  { emoji: "🚗", text: "Checking rental cars, trains, and shuttles" },
  { emoji: "🍽️", text: "Curating restaurants and reservations" },
  { emoji: "✨", text: "Stitching it all into a plan" },
];

export const SWAP_OPTIONS = {
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

export const SAVED_TRIPS = [
  { id: "saved-1", title: "Tokyo cherry blossom run", where: "Tokyo + Kyoto · 10 days", hero: "🌸", color: "bubblegum", savedAt: "Saved Aug 02", priceWhenSaved: 4890, priceNow: 4612, nights: 10, travelers: 2 },
  { id: "saved-2", title: "Iceland ring road", where: "Reykjavik loop · 8 days", hero: "🌋", color: "sky", savedAt: "Saved Jul 18", priceWhenSaved: 3120, priceNow: 3445, nights: 8, travelers: 2 },
  { id: "saved-3", title: "Lisbon long weekend", where: "Lisbon · 4 nights", hero: "🇵🇹", color: "sun", savedAt: "Saved Aug 21", priceWhenSaved: 1280, priceNow: 1280, nights: 4, travelers: 2 },
  { id: "saved-4", title: "Banff family ski", where: "Banff · 6 days · 4 ppl", hero: "🏔️", color: "mint", savedAt: "Saved Aug 30", priceWhenSaved: 6420, priceNow: 5980, nights: 6, travelers: 4 },
];

export const fmtMoney = (n) => "$" + Math.round(n).toLocaleString();
export const fmtDelta = (a, b) => {
  const d = b - a;
  if (d === 0) return { dir: "flat", text: "no change", val: 0 };
  return { dir: d > 0 ? "up" : "down", text: (d > 0 ? "+" : "−") + "$" + Math.abs(d).toLocaleString(), val: d };
};

export const TRIPS = {
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
    bookingOptions: {
      flights: [
        { airline: "JetBlue", flight: "B6 1487", route: "JFK → CUN", meta: "Nonstop · 4h 22m · 1 bag", price: 471, host: "jetblue.com", best: true },
        { airline: "Delta", flight: "DL 612", route: "JFK → CUN", meta: "Nonstop · 4h 30m · main cabin", price: 512, host: "delta.com" },
        { airline: "American", flight: "AA 88", route: "JFK → CUN", meta: "Nonstop · 4h 18m · main", price: 489, host: "aa.com" },
        { airline: "Spirit", flight: "NK 234", route: "JFK → FLL → CUN", meta: "1 stop · 7h 50m · bare fare", price: 218, host: "spirit.com", tag: "cheapest" },
        { airline: "Frontier", flight: "F9 1602", route: "JFK → MCO → CUN", meta: "1 stop · 8h 15m", price: 232, host: "flyfrontier.com" },
        { airline: "AeroMéxico", flight: "AM 901", route: "JFK → CUN", meta: "Nonstop · lie-flat premier", price: 1240, host: "aeromexico.com", tag: "lux" },
      ],
      stays: [
        { type: "Hotel", emoji: "🏨", name: "Casa Malca · Oceanfront suite", meta: "Boutique · 9.4/10 · breakfast incl.", price: 1418, host: "booking.com", best: true },
        { type: "Airbnb", emoji: "🏡", name: "Airbnb · Jungle treehouse", meta: "2 BR · private pool · 4.92★ · self check-in", price: 980, host: "airbnb.com", tag: "cheaper" },
        { type: "Hotel", emoji: "🌴", name: "Azulik · Adults-only villa", meta: "No electricity · iconic on Insta", price: 2640, host: "azulik.com", tag: "lux" },
        { type: "Hotel", emoji: "🏖️", name: "Be Tulum · Beachfront", meta: "Spa + breakfast · 9.1/10", price: 1720, host: "betulum.com" },
        { type: "Airbnb", emoji: "🏝️", name: "Airbnb · Aldea Zama 2BR", meta: "Walk to beach · pool · 4.87★", price: 640, host: "airbnb.com" },
      ],
      transport: [
        { name: "Hertz · Compact car", meta: "Auto · 7 days · CUN pickup", price: 286, host: "hertz.com", best: true },
        { name: "ADO shuttle bus", meta: "CUN → Tulum · 2h 10m · A/C", price: 32, host: "ado.com.mx", tag: "cheapest" },
        { name: "Avis · SUV", meta: "Auto · 7 days · ski-rack ready", price: 412, host: "avis.com" },
        { name: "Private transfer", meta: "Door-to-door · driver · A/C", price: 180, host: "happyshuttlecancun.com" },
      ],
      extras: [
        { name: "Hartwood dinner reservation", meta: "Open-fire kitchen · res for 2", price: 140, host: "resy.com" },
        { name: "Cenote Dos Ojos snorkel tour", meta: "Half-day · gear + guide", price: 95, host: "viator.com" },
        { name: "Tulum Ruins early-entry", meta: "Skip-the-line · 2 hrs", price: 80, host: "getyourguide.com" },
      ],
    },
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
    bookingOptions: {
      flights: [
        { airline: "Air France", flight: "AF 23", route: "JFK → CDG", meta: "Nonstop · 7h 10m · main cabin", price: 690, host: "airfrance.com", best: true },
        { airline: "Delta", flight: "DL 264", route: "JFK → CDG", meta: "Nonstop · 7h 25m · main cabin", price: 720, host: "delta.com" },
        { airline: "United", flight: "UA 57", route: "EWR → CDG", meta: "Nonstop · 7h 30m · main cabin", price: 702, host: "united.com" },
        { airline: "American", flight: "AA 44", route: "JFK → CDG", meta: "Nonstop · 7h 20m", price: 715, host: "aa.com" },
        { airline: "French Bee", flight: "BF 711", route: "EWR → CDG", meta: "Nonstop · 7h 15m · low-cost", price: 450, host: "frenchbee.com", tag: "cheapest" },
        { airline: "La Compagnie", flight: "B0 24", route: "EWR → CDG", meta: "All-business · 76 seats", price: 2180, host: "lacompagnie.com", tag: "lux" },
      ],
      stays: [
        { type: "Hotel", emoji: "🏨", name: "Hôtel Particulier Montmartre", meta: "Boutique · 6 nights · breakfast · 9.0/10", price: 1680, host: "booking.com", best: true },
        { type: "Hotel", emoji: "🥂", name: "Le Bristol Paris", meta: "5-star palace · 9.5/10 · Michelin", price: 4200, host: "lebristolparis.com", tag: "lux" },
        { type: "Airbnb", emoji: "🏡", name: "Airbnb · Marais 1BR loft", meta: "Walk everywhere · 4.94★", price: 920, host: "airbnb.com" },
        { type: "Hotel", emoji: "🌃", name: "Hôtel des Grands Boulevards", meta: "Boutique · 8.9/10 · 9th arr.", price: 1100, host: "booking.com" },
        { type: "Airbnb", emoji: "🥐", name: "Airbnb · Saint-Germain studio", meta: "Left bank · 4.89★ · charming", price: 760, host: "airbnb.com", tag: "cheaper" },
      ],
      transport: [
        { name: "Navigo Découverte weekly pass", meta: "Unlimited Métro · 2 travelers", price: 70, host: "ratp.fr", best: true },
        { name: "RER B · CDG ↔ city", meta: "Airport train · 35 min · return", price: 22, host: "sncf-connect.com" },
        { name: "Uber · city rides budget", meta: "~10 rides for 6 days", price: 150, host: "uber.com" },
        { name: "Hertz · Compact (if leaving city)", meta: "6 days · for day trips", price: 340, host: "hertz.com" },
      ],
      extras: [
        { name: "Septime dinner reservation", meta: "Tasting menu · hard res", price: 290, host: "resy.com" },
        { name: "Louvre skip-the-line", meta: "Timed entry + audio guide", price: 60, host: "getyourguide.com" },
        { name: "Versailles Passport", meta: "Palace + gardens · 4 hrs", price: 130, host: "chateauversailles.fr" },
        { name: "Sunset Seine cruise", meta: "1h 15m · champagne incl.", price: 90, host: "viator.com" },
      ],
    },
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
    bookingOptions: {
      flights: [
        { airline: "ANA", flight: "NH 175", route: "LAX → HND", meta: "Nonstop · 11h 30m · premium econ", price: 1120, host: "ana.co.jp", best: true },
        { airline: "JAL", flight: "JL 61", route: "LAX → HND", meta: "Nonstop · 11h 45m · premium econ", price: 1180, host: "jal.co.jp" },
        { airline: "United", flight: "UA 32", route: "LAX → NRT", meta: "Nonstop · 12h 10m · main", price: 980, host: "united.com" },
        { airline: "Delta", flight: "DL 167", route: "LAX → HND", meta: "Nonstop · 11h 50m · main", price: 1020, host: "delta.com" },
        { airline: "ZIPAIR", flight: "ZG 1", route: "LAX → NRT", meta: "Nonstop · 11h 40m · low-cost", price: 620, host: "zipair.net", tag: "cheapest" },
        { airline: "Singapore", flight: "SQ 11", route: "LAX → NRT", meta: "Nonstop · 11h 45m · business", price: 5800, host: "singaporeair.com", tag: "lux" },
      ],
      stays: [
        { type: "Hotel", emoji: "🏯", name: "Hoshinoya Tokyo · Ryokan suite", meta: "9 nights · onsen · tatami", price: 1980, host: "booking.com", best: true },
        { type: "Hotel", emoji: "🌃", name: "Park Hyatt Tokyo", meta: "Iconic · 9.3/10 · Shinjuku skyline", price: 2400, host: "hyatt.com" },
        { type: "Airbnb", emoji: "🏡", name: "Airbnb · Shibuya loft", meta: "Crossing-adjacent · 4.88★", price: 890, host: "airbnb.com" },
        { type: "Hotel", emoji: "🛏️", name: "Aman Tokyo", meta: "5-star · 9.5/10 · top of Otemachi", price: 3800, host: "aman.com", tag: "lux" },
        { type: "Hotel", emoji: "🏨", name: "Toyoko Inn Shimbashi", meta: "Budget · 8.4/10 · clean & central", price: 480, host: "toyoko-inn.com", tag: "cheaper" },
      ],
      transport: [
        { name: "JR Pass · 7-day", meta: "Whisper-quiet rail · activate at HND", price: 320, host: "japanrailpass.net", best: true },
        { name: "Suica IC card + subway", meta: "Daily commute · top-up", price: 80, host: "suica.jp" },
        { name: "Limousine Bus · HND transfers", meta: "Airport ↔ hotel · 1 hr", price: 35, host: "limousinebus.co.jp" },
        { name: "Taxi night budget", meta: "Trains stop at midnight", price: 120, host: "japantaxi.jp" },
      ],
      extras: [
        { name: "Sukiyabashi Jiro Roppongi", meta: "Omakase · 20 pieces", price: 380, host: "pocketconcierge.jp" },
        { name: "Toyosu Market tuna auction", meta: "Tour + breakfast incl.", price: 95, host: "viator.com" },
        { name: "Teamlab Borderless", meta: "Immersive art · timed entry", price: 75, host: "klook.com" },
      ],
    },
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
    bookingOptions: {
      flights: [
        { airline: "United", flight: "UA 5821", route: "ORD → DEN → ASE", meta: "1 stop · 5h 40m · main", price: 670, host: "united.com", best: true },
        { airline: "American", flight: "AA 1148", route: "ORD → DFW → ASE", meta: "1 stop · 7h 00m · main", price: 620, host: "aa.com" },
        { airline: "Frontier", flight: "F9 622", route: "ORD → DEN (+ shuttle)", meta: "Nonstop to DEN · 4h drive after", price: 245, host: "flyfrontier.com", tag: "cheapest" },
        { airline: "Spirit", flight: "NK 1242", route: "ORD → DEN (+ shuttle)", meta: "Nonstop to DEN · 4h drive after", price: 198, host: "spirit.com" },
        { airline: "Southwest", flight: "WN 2018", route: "MDW → DEN (+ shuttle)", meta: "Nonstop · 2 bags free", price: 312, host: "southwest.com" },
        { airline: "Charter", flight: "Private 12-seat", route: "ORD → ASE direct", meta: "Door-to-mountain · party of 4", price: 4800, host: "jetsuiteapp.com", tag: "lux" },
      ],
      stays: [
        { type: "Airbnb", emoji: "🏡", name: "Airbnb · 4BR slope-side cabin", meta: "Hot tub · sleeps 6 · 7 nights", price: 3640, host: "airbnb.com", best: true },
        { type: "Hotel", emoji: "⛷️", name: "The Little Nell", meta: "Ski-in/ski-out luxury · 9.4/10", price: 4800, host: "thelittlenell.com", tag: "lux" },
        { type: "Hotel", emoji: "🏨", name: "St. Regis Aspen", meta: "5-star · 9.3/10 · butler service", price: 5200, host: "marriott.com" },
        { type: "Airbnb", emoji: "🛷", name: "Airbnb · 3BR downtown condo", meta: "Walk to gondola · sleeps 4", price: 2180, host: "airbnb.com", tag: "cheaper" },
        { type: "Hotel", emoji: "🏔️", name: "Hotel Aspen", meta: "Boutique · 8.6/10 · hot tub", price: 1420, host: "hotelaspen.com" },
      ],
      transport: [
        { name: "Enterprise · 4WD SUV", meta: "7 days · ski racks · ASE pickup", price: 540, host: "enterprise.com", best: true },
        { name: "Hertz · 4WD SUV", meta: "7 days · alternative", price: 480, host: "hertz.com" },
        { name: "High Mountain Taxi shuttle", meta: "Airport transfers · party of 4", price: 280, host: "highmountaintaxi.com" },
      ],
      extras: [
        { name: "Aspen Snowmass 4-day pass", meta: "All 4 mountains · party of 4", price: 640, host: "aspensnowmass.com" },
        { name: "Cloud Nine Bistro lunch", meta: "On-mountain · res. required", price: 280, host: "resy.com" },
        { name: "Snowcat dinner", meta: "Backcountry · 5-course", price: 180, host: "aspensnowmass.com" },
      ],
    },
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
    bookingOptions: {
      flights: [
        { airline: "Singapore Airlines", flight: "SQ 1", route: "SFO → SIN → DPS", meta: "1 stop · 22h · business class", price: 1320, host: "singaporeair.com", best: true },
        { airline: "Qatar", flight: "QR 738", route: "SFO → DOH → DPS", meta: "1 stop · 23h 40m · qsuite", price: 1420, host: "qatarairways.com" },
        { airline: "Cathay Pacific", flight: "CX 879", route: "SFO → HKG → DPS", meta: "1 stop · 22h 30m · premium econ", price: 1180, host: "cathaypacific.com" },
        { airline: "Korean Air", flight: "KE 24", route: "SFO → ICN → DPS", meta: "1 stop · 22h 50m · main", price: 1250, host: "koreanair.com" },
        { airline: "EVA Air", flight: "BR 7", route: "SFO → TPE → DPS", meta: "1 stop · 22h 15m · main", price: 1080, host: "evaair.com", tag: "cheapest" },
        { airline: "Emirates", flight: "EK 226", route: "SFO → DXB → DPS", meta: "1 stop · 24h · first class", price: 6400, host: "emirates.com", tag: "lux" },
      ],
      stays: [
        { type: "Hotel", emoji: "🌿", name: "Bambu Indah · Jungle villa", meta: "12 nights · private pool · sustainable", price: 3120, host: "booking.com", best: true },
        { type: "Hotel", emoji: "🛕", name: "Four Seasons Sayan", meta: "5-star · Ayung river · 9.5/10", price: 5800, host: "fourseasons.com", tag: "lux" },
        { type: "Airbnb", emoji: "🏡", name: "Airbnb · Ubud private villa", meta: "Rice paddy view · 4.93★ · 2BR", price: 1640, host: "airbnb.com" },
        { type: "Hotel", emoji: "💆", name: "COMO Shambhala Estate", meta: "Wellness retreat · all-inclusive", price: 4200, host: "comohotels.com" },
        { type: "Hotel", emoji: "🌺", name: "Padma Resort Ubud", meta: "Boutique · 9.1/10 · infinity pool", price: 1890, host: "padmaresortubud.com" },
        { type: "Airbnb", emoji: "🌴", name: "Airbnb · Canggu beach villa", meta: "Beachfront · pool · 4.91★", price: 1240, host: "airbnb.com", tag: "cheaper" },
      ],
      transport: [
        { name: "Private driver (full trip)", meta: "12 days · A/C SUV · all-inclusive", price: 420, host: "klook.com", best: true },
        { name: "Scooter rental", meta: "12 days · faster in traffic", price: 80, host: "balibikerental.com", tag: "cheaper" },
        { name: "Grab rides budget", meta: "App-based · ~30 rides", price: 180, host: "grab.com" },
        { name: "Private airport transfer", meta: "DPS → Ubud · 1h 30m", price: 80, host: "klook.com" },
      ],
      extras: [
        { name: "Tegallalang sunrise walk", meta: "Guided · 2 hrs", price: 45, host: "viator.com" },
        { name: "Karsa Spa couples massage", meta: "90 min · in jungle", price: 110, host: "karsaspa.com" },
        { name: "Locavore tasting menu", meta: "Top-50 World restaurant", price: 220, host: "locavore.co.id" },
      ],
    },
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
    bookingOptions: {
      flights: [
        { airline: "TAP Air Portugal", flight: "TP 218", route: "BOS → LIS", meta: "Nonstop · 6h 35m · main cabin", price: 510, host: "flytap.com", best: true },
        { airline: "Delta", flight: "DL 130", route: "BOS → JFK → LIS", meta: "1 stop · 9h 40m · main", price: 423, host: "delta.com" },
        { airline: "United", flight: "UA 964", route: "BOS → EWR → LIS", meta: "1 stop · 10h 15m · main", price: 388, host: "united.com" },
        { airline: "Iberia", flight: "IB 2658", route: "BOS → MAD → LIS", meta: "1 stop · 11h 00m · main", price: 412, host: "iberia.com" },
        { airline: "Azores Airlines", flight: "S4 122", route: "BOS → PDL → LIS", meta: "1 stop · 11h 30m", price: 342, host: "azoresairlines.pt", tag: "cheapest" },
        { airline: "JetBlue Mint", flight: "B6 707", route: "JFK → LIS (BOS shuttle)", meta: "Lie-flat suite · feeder included", price: 1640, host: "jetblue.com", tag: "lux" },
      ],
      stays: [
        { type: "Airbnb", emoji: "🏡", name: "Airbnb · Alfama loft (3BR)", meta: "4 nights · views of Tagus · 4.92★", price: 720, host: "airbnb.com", best: true },
        { type: "Hotel", emoji: "🏨", name: "Memmo Alfama", meta: "Boutique · 9.1/10 · rooftop pool", price: 1240, host: "booking.com" },
        { type: "Hotel", emoji: "👑", name: "Pousada de Lisboa", meta: "Historic palace · 8.9/10", price: 980, host: "pousadasdeportugal.com" },
        { type: "Hotel", emoji: "🌆", name: "Sonder Castilho", meta: "Apt-hotel · 8.8/10 · 4 nights", price: 640, host: "sonder.com", tag: "cheaper" },
        { type: "Hotel", emoji: "🥂", name: "The Lumiares Hotel & Spa", meta: "Chiado · 9.0/10 · skyline bar", price: 890, host: "booking.com" },
      ],
      transport: [
        { name: "Metro day passes + Uber", meta: "Combo · 4 days · efficient", price: 80, host: "uber.com", best: true },
        { name: "Bolt rides budget", meta: "Cheaper than Uber here", price: 65, host: "bolt.eu", tag: "cheaper" },
        { name: "Hertz · Compact", meta: "4 days · for day trips out", price: 156, host: "hertz.com" },
        { name: "Tram 28 multi-pass", meta: "Iconic yellow trams", price: 24, host: "carris.pt" },
      ],
      extras: [
        { name: "Cervejaria Ramiro · seafood", meta: "Walk-in dinner · party of 3", price: 145, host: "resy.com" },
        { name: "Fado night at Tasca do Chico", meta: "Live music · 2 hrs", price: 110, host: "viator.com" },
        { name: "Sintra castles day trip", meta: "Guided · Pena + Quinta", price: 85, host: "getyourguide.com" },
        { name: "Pastéis de Belém pilgrimage", meta: "Tram 15 · the original tarts", price: 12, host: "pasteisdebelem.pt" },
      ],
    },
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

  florida: {
    id: "trip-florida",
    title: "Florida",
    keywords: ["florida", "fl", "orlando", "tampa", "clearwater", "clermont", "kissimmee", "disney", "disneyworld", "disney world", "miami", "naples", "sarasota", "st pete", "saint pete", "key west", "florida keys", "everglades", "sanibel"],
    vibeTags: ["family", "birthday", "beach", "kids"],
    vibe: "Florida family trip",
    travelers: 4,
    origin: "Your home airport",
    destination: "Orlando + Tampa Bay (MCO)",
    dateFrom: "Jun 18", dateTo: "Jun 21", nights: 3,
    total: 3160, perPerson: 790,
    hero: "🌴", color: "sun",
    bookingOptions: {
      flights: [
        { airline: "Southwest", flight: "WN 1432", route: "Your hub → MCO", meta: "Nonstop · 2 bags free · main", price: 198, host: "southwest.com", best: true },
        { airline: "JetBlue", flight: "B6 581", route: "Your hub → MCO", meta: "Nonstop · most legroom · main", price: 212, host: "jetblue.com" },
        { airline: "Delta", flight: "DL 1872", route: "Your hub → MCO", meta: "Nonstop · main cabin", price: 245, host: "delta.com" },
        { airline: "American", flight: "AA 1654", route: "Your hub → MCO", meta: "Nonstop · main cabin", price: 234, host: "aa.com" },
        { airline: "Frontier", flight: "F9 1410", route: "Your hub → MCO", meta: "Nonstop · ultra-low-cost", price: 102, host: "flyfrontier.com" },
        { airline: "Spirit", flight: "NK 2304", route: "Your hub → MCO", meta: "Nonstop · bare fare · pack light", price: 89, host: "spirit.com", tag: "cheapest" },
      ],
      stays: [
        { type: "Airbnb", emoji: "🏡", name: "Airbnb · Clermont vacation home", meta: "4BR · pool · near grandma · 4.91★", price: 720, host: "airbnb.com", best: true },
        { type: "Hotel", emoji: "🏖️", name: "Sandpearl Resort · Clearwater Beach", meta: "Beachfront · 9.0/10 · 2 nights", price: 980, host: "marriott.com" },
        { type: "Airbnb", emoji: "🏝️", name: "Airbnb · Clearwater Beach condo", meta: "3BR · walk to beach · 4.88★", price: 540, host: "airbnb.com", tag: "cheaper" },
        { type: "Hotel", emoji: "🎢", name: "Hyatt Place Tampa/Wesley Chapel", meta: "8.7/10 · pool · breakfast incl.", price: 420, host: "hyatt.com" },
        { type: "Hotel", emoji: "🌅", name: "Opal Sands Resort · Clearwater", meta: "Gulf-front suites · 9.2/10", price: 1240, host: "opalsands.com", tag: "lux" },
      ],
      transport: [
        { name: "Enterprise · Minivan", meta: "Auto · 4 days · MCO pickup · sleeps 7", price: 320, host: "enterprise.com", best: true },
        { name: "Hertz · 7-seat SUV", meta: "Auto · 4 days · airport pickup", price: 380, host: "hertz.com" },
        { name: "Budget · Compact SUV", meta: "Auto · 4 days · cheaper trim", price: 240, host: "budget.com", tag: "cheaper" },
        { name: "Mears airport shuttle", meta: "MCO ↔ Clermont · party of 5", price: 180, host: "mearstransportation.com" },
      ],
      extras: [
        { name: "Birthday dinner at Bern's Steakhouse", meta: "Tampa landmark · res for 5", price: 480, host: "opentable.com" },
        { name: "Clearwater Marine Aquarium", meta: "Family-friendly · dolphins", price: 110, host: "cmaquarium.org" },
        { name: "Pier 60 sunset festival", meta: "Free · Clearwater Beach", price: 0, host: "myclearwater.com" },
        { name: "Magic Kingdom day tickets", meta: "Optional · 1-day base · party of 5", price: 580, host: "disneyworld.disney.go.com" },
      ],
    },
    breakdown: [
      { key: "flights", label: "Flights", val: 990, color: "var(--sky)", emoji: "✈️" },
      { key: "stay", label: "Stay", val: 1260, color: "var(--bubblegum)", emoji: "🏠" },
      { key: "car", label: "Rental car", val: 320, color: "var(--tangerine)", emoji: "🚙" },
      { key: "food", label: "Food", val: 480, color: "var(--lime)", emoji: "🍽️" },
      { key: "fun", label: "Activities", val: 110, color: "var(--sunshine)", emoji: "🎟️" },
    ],
    days: [
      { label: "Wed, Jun 18", title: "Fly in + Clermont", events: [
        { time: "08:45", icon: "flight", emoji: "✈️", title: "Southwest 1432 · → MCO", meta: "Nonstop · 2 bags free", cost: 198, vendor: "Southwest" },
        { time: "13:00", icon: "car", emoji: "🚙", title: "Enterprise · Minivan", meta: "MCO pickup · 4 days · sleeps 7", cost: 320, vendor: "Enterprise" },
        { time: "15:00", icon: "hotel", emoji: "🏡", title: "Airbnb · Clermont vacation home", meta: "Check-in · 1 night · near grandma", cost: 240, vendor: "Airbnb" },
        { time: "18:00", icon: "fun", emoji: "🎂", title: "Birthday dinner with grandma", meta: "Home-cooked · in Clermont", cost: 80 },
      ]},
      { label: "Thu, Jun 19", title: "Drive to Clearwater", events: [
        { time: "10:00", icon: "car", emoji: "🚙", title: "Drive Clermont → Clearwater", meta: "~2h · I-4 west", cost: 0 },
        { time: "13:00", icon: "hotel", emoji: "🏖️", title: "Sandpearl Resort · Clearwater", meta: "Check-in · 2 nights · beachfront", cost: 980, vendor: "Marriott" },
        { time: "17:00", icon: "fun", emoji: "🐬", title: "Clearwater Marine Aquarium", meta: "Family-friendly · 2 hrs", cost: 110 },
        { time: "20:00", icon: "food", emoji: "🥩", title: "Birthday dinner at Bern's", meta: "Tampa · party of 5 · res 8pm", cost: 480 },
      ]},
      { label: "Fri, Jun 20", title: "Beach day", events: [
        { time: "10:00", icon: "fun", emoji: "🏖️", title: "Clearwater Beach", meta: "Sugar sand · cabana rental", cost: 60 },
        { time: "19:00", icon: "fun", emoji: "🌅", title: "Pier 60 sunset festival", meta: "Free · street performers", cost: 0 },
        { time: "20:30", icon: "food", emoji: "🦞", title: "Dinner at Frenchy's Rockaway", meta: "Grouper sandwiches · walk-in", cost: 180 },
      ]},
      { label: "Sat, Jun 21", title: "Fly home", events: [
        { time: "08:00", icon: "car", emoji: "🚙", title: "Drive Clearwater → MCO", meta: "~1h 40m · return rental", cost: 0 },
        { time: "12:25", icon: "flight", emoji: "✈️", title: "Southwest 1433 · MCO →", meta: "Nonstop · home", cost: 198, vendor: "Southwest" },
      ]},
    ],
  },
};

// Add vibeTags to every other trip so the constraint matcher can use them.
TRIPS.tulum.vibeTags = ["romantic", "beach", "anniversary"];
TRIPS.paris.vibeTags = ["romantic", "anniversary", "city", "honeymoon"];
TRIPS.tokyo.vibeTags = ["foodie", "solo", "city", "adventure"];
TRIPS.aspen.vibeTags = ["friends", "adventure", "mountain"];
TRIPS.bali.vibeTags = ["honeymoon", "romantic", "beach", "wellness"];
TRIPS.lisbon.vibeTags = ["friends", "city", "weekend"];

export const VIBE_OPTIONS = [
  { id: "romantic", label: "Romantic", emoji: "💞" },
  { id: "anniversary", label: "Anniversary", emoji: "🥂" },
  { id: "honeymoon", label: "Honeymoon", emoji: "🌺" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧‍👦" },
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "kids", label: "With kids", emoji: "🧒" },
  { id: "friends", label: "Friends trip", emoji: "🎉" },
  { id: "solo", label: "Solo", emoji: "🧘" },
  { id: "foodie", label: "Foodie", emoji: "🍣" },
  { id: "adventure", label: "Adventure", emoji: "🏔️" },
  { id: "beach", label: "Beach", emoji: "🏖️" },
  { id: "city", label: "City break", emoji: "🌆" },
  { id: "weekend", label: "Long weekend", emoji: "📅" },
  { id: "wellness", label: "Wellness", emoji: "💆" },
];

export const BUDGET_PRESETS = [1000, 2000, 3500, 5000, 10000];

// matchTrip(prompt, constraints?) -> trip | null
// Scores each template by:
//   keyword hits in the prompt (weight 2)
//   vibeTag matches against the constraints.vibe (weight 3)
//   travelers count proximity to constraints.travelers (weight 1, only if set)
//   total under constraints.budget (weight 1, only if set)
// Returns null if no destination keyword from any template was seen in the
// prompt AND no vibe constraint was set — that tells the caller "I don't
// know where they want to go." No more random fallback.
export function matchTrip(prompt, constraints = {}) {
  const p = (prompt || "").toLowerCase();
  const trips = Object.values(TRIPS);

  let best = null;
  let bestScore = 0;
  let anyDestinationKeywordHit = false;

  for (const t of trips) {
    let score = 0;
    for (const kw of t.keywords) {
      if (kw && p.includes(kw)) {
        score += 2;
        anyDestinationKeywordHit = true;
      }
    }
    if (constraints.vibe && t.vibeTags) {
      if (t.vibeTags.includes(constraints.vibe)) score += 3;
    }
    if (constraints.travelers) {
      const diff = Math.abs((t.travelers || 0) - constraints.travelers);
      if (diff === 0) score += 1;
      else if (diff <= 1) score += 0.5;
    }
    if (constraints.budget) {
      if ((t.total || 0) <= constraints.budget) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }

  if (!anyDestinationKeywordHit && !constraints.vibe) return null;
  return best;
}

// Overlay user-set constraints onto the matched trip's headline fields so
// the popup shows what they asked for instead of the template defaults.
export function applyConstraints(trip, constraints = {}) {
  if (!trip) return trip;
  let out = trip;
  if (constraints.travelers && constraints.travelers !== trip.travelers) {
    const t = constraints.travelers;
    out = { ...out, travelers: t, perPerson: Math.round(out.total / t) };
  }
  if (constraints.dates && constraints.dates.from && constraints.dates.to) {
    const fmt = (iso) => {
      const d = new Date(iso + "T00:00");
      return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    };
    const from = fmt(constraints.dates.from);
    const to = fmt(constraints.dates.to);
    const nights = Math.max(
      1,
      Math.round((new Date(constraints.dates.to) - new Date(constraints.dates.from)) / 86400000)
    );
    out = { ...out, dateFrom: from, dateTo: to, nights };
  }
  if (constraints.vibe) {
    const vibeLabel = VIBE_OPTIONS.find(v => v.id === constraints.vibe)?.label;
    if (vibeLabel) out = { ...out, vibe: vibeLabel };
  }
  return out;
}

export const MOCK_TRIP = TRIPS.tulum;
