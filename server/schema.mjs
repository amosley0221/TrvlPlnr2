// JSON schema for the trip plan response. Anthropic's structured outputs
// enforce this shape on the model — see SKILL.md "Structured Outputs".
// Notes: numerical/string constraints (minimum, maxLength, etc.) aren't
// supported by structured outputs and are intentionally omitted.

const flightItem = {
  type: "object",
  additionalProperties: false,
  required: ["airline", "flight", "route", "meta", "price", "host"],
  properties: {
    airline: { type: "string" },
    flight: { type: "string" },
    route: { type: "string" },
    meta: { type: "string" },
    price: { type: "integer" },
    host: { type: "string" },
    best: { type: "boolean" },
    tag: { type: "string", enum: ["cheapest", "lux", "cheaper", "fast"] },
  },
};

const stayItem = {
  type: "object",
  additionalProperties: false,
  required: ["type", "emoji", "name", "meta", "price", "host"],
  properties: {
    type: { type: "string", enum: ["Hotel", "Airbnb", "Hostel", "Resort"] },
    emoji: { type: "string" },
    name: { type: "string" },
    meta: { type: "string" },
    price: { type: "integer" },
    host: { type: "string" },
    best: { type: "boolean" },
    tag: { type: "string", enum: ["cheapest", "lux", "cheaper", "fast"] },
  },
};

const transportItem = {
  type: "object",
  additionalProperties: false,
  required: ["name", "meta", "price", "host"],
  properties: {
    name: { type: "string" },
    meta: { type: "string" },
    price: { type: "integer" },
    host: { type: "string" },
    best: { type: "boolean" },
    tag: { type: "string", enum: ["cheapest", "lux", "cheaper", "fast"] },
  },
};

const extraItem = {
  type: "object",
  additionalProperties: false,
  required: ["name", "meta", "price", "host"],
  properties: {
    name: { type: "string" },
    meta: { type: "string" },
    price: { type: "integer" },
    host: { type: "string" },
  },
};

const breakdownItem = {
  type: "object",
  additionalProperties: false,
  required: ["key", "label", "val", "color", "emoji"],
  properties: {
    key: { type: "string", enum: ["flights", "stay", "car", "food", "fun"] },
    label: { type: "string" },
    val: { type: "integer" },
    color: {
      type: "string",
      enum: [
        "var(--coral)", "var(--tangerine)", "var(--sunshine)",
        "var(--lime)", "var(--mint)", "var(--sky)", "var(--grape)",
        "var(--bubblegum)",
      ],
    },
    emoji: { type: "string" },
  },
};

const eventItem = {
  type: "object",
  additionalProperties: false,
  required: ["time", "icon", "emoji", "title", "meta", "cost"],
  properties: {
    time: { type: "string" },
    icon: { type: "string", enum: ["flight", "hotel", "car", "train", "bus", "food", "fun"] },
    emoji: { type: "string" },
    title: { type: "string" },
    meta: { type: "string" },
    cost: { type: "integer" },
    vendor: { type: "string" },
    was: { type: "integer" },
  },
};

const dayItem = {
  type: "object",
  additionalProperties: false,
  required: ["label", "title", "events"],
  properties: {
    label: { type: "string" },
    title: { type: "string" },
    events: { type: "array", items: eventItem },
  },
};

export const TRIP_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "id", "title", "vibe", "travelers", "origin", "destination",
    "dateFrom", "dateTo", "nights", "total", "perPerson",
    "hero", "color", "bookingOptions", "breakdown", "days",
  ],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    vibe: { type: "string" },
    travelers: { type: "integer" },
    origin: { type: "string" },
    destination: { type: "string" },
    dateFrom: { type: "string" },
    dateTo: { type: "string" },
    nights: { type: "integer" },
    total: { type: "integer" },
    perPerson: { type: "integer" },
    hero: { type: "string" },
    color: {
      type: "string",
      enum: [
        "coral", "tangerine", "sunshine", "sun",
        "lime", "mint", "sky", "grape", "bubblegum",
      ],
    },
    bookingOptions: {
      type: "object",
      additionalProperties: false,
      required: ["flights", "stays", "transport", "extras"],
      properties: {
        flights: { type: "array", items: flightItem },
        stays: { type: "array", items: stayItem },
        transport: { type: "array", items: transportItem },
        extras: { type: "array", items: extraItem },
      },
    },
    breakdown: { type: "array", items: breakdownItem },
    days: { type: "array", items: dayItem },
  },
};
