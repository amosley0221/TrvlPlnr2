// PDF document for a trip plan. Renders via @react-pdf/renderer, which uses
// its own React-like primitives (Document, Page, View, Text) and Yoga for
// layout — not the same as the React DOM components elsewhere in the app.
// Kept in its own file so the ~500KB library only loads when the user
// actually clicks Export.

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Link,
  Svg,
  Circle,
  Path,
  Rect,
  G,
} from "@react-pdf/renderer";

// NOTE: deliberately not registering Fraunces / Inter from Google Fonts.
// react-pdf fetches font files at render time (not at Font.register), and
// any CORS/network blip throws inside pdf().toBlob(), surfacing as
// "Couldn't generate the PDF" to the user. We use the built-in PDF fonts
// (Helvetica, Times-Roman, Times-Bold) instead — less brand-matched but
// 100% reliable since the fonts are baked into every PDF reader.

// Brand palette — keep in sync with :root in styles.css.
const C = {
  bg: "#fff4e6",
  bg2: "#ffe6c7",
  paper: "#fffaf2",
  ink: "#1a1330",
  ink2: "#4a3f6b",
  muted: "#8a7fa8",
  line: "#f0d8b8",
  coral: "#ff4d6d",
  tangerine: "#ff8a2b",
  sunshine: "#ffd23f",
  lime: "#b8e436",
  mint: "#38d9a9",
  sky: "#4cc9f0",
  grape: "#7c5cff",
  bubblegum: "#ff7ac6",
};

// Aliases mapped to built-in PDF fonts. Keeps the rest of the stylesheet
// readable while ensuring the font is always available.
const SERIF = "Times-Bold";
const SANS = "Helvetica";
const SANS_BOLD = "Helvetica-Bold";

const s = StyleSheet.create({
  page: {
    padding: 36,
    paddingBottom: 60,
    backgroundColor: C.bg,
    color: C.ink,
    fontFamily: SANS,
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Brand strip at the very top
  brandStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brand: {
    fontFamily: SERIF,
    fontSize: 20,
    fontWeight: 700,
    color: C.ink,
  },
  brandTag: {
    fontFamily: SANS,
    fontSize: 8,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Hero card
  hero: {
    backgroundColor: C.paper,
    border: `2pt solid ${C.ink}`,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  heroEmoji: {
    width: 56,
    height: 56,
    backgroundColor: C.sunshine,
    border: `1.5pt solid ${C.ink}`,
    borderRadius: 14,
    fontSize: 32,
    textAlign: "center",
    lineHeight: 1.6,
    marginRight: 14,
  },
  heroBody: { flex: 1 },
  eyebrow: {
    fontSize: 7,
    color: C.coral,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  heroTitle: {
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.15,
    marginBottom: 3,
  },
  heroMeta: { fontSize: 9, color: C.ink2 },
  heroTotalBox: {
    backgroundColor: C.sunshine,
    border: `2pt solid ${C.ink}`,
    borderRadius: 10,
    padding: 8,
    minWidth: 90,
    alignItems: "center",
  },
  heroTotalLabel: {
    fontSize: 7,
    color: C.ink,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  heroTotalNum: {
    fontFamily: SERIF,
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
  },
  heroTotalPer: { fontSize: 8, color: C.ink2, marginTop: 2 },

  // Section
  sectionHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: SERIF,
    fontSize: 14,
    fontWeight: 700,
  },
  sectionSub: { fontSize: 8, color: C.muted },

  // Booking rows
  row: {
    flexDirection: "row",
    padding: 8,
    marginBottom: 4,
    border: `1pt solid ${C.ink}`,
    borderRadius: 8,
    backgroundColor: C.paper,
    alignItems: "center",
  },
  rowIcon: {
    width: 26,
    height: 26,
    backgroundColor: C.sky,
    border: `1pt solid ${C.ink}`,
    borderRadius: 6,
    textAlign: "center",
    lineHeight: 1.8,
    fontSize: 14,
    marginRight: 8,
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 10, fontWeight: 700 },
  rowMeta: { fontSize: 8, color: C.ink2 },
  rowPrice: {
    fontFamily: SERIF,
    fontSize: 12,
    fontWeight: 700,
    marginRight: 8,
  },
  rowLink: {
    fontSize: 8,
    color: C.coral,
    textDecoration: "none",
    fontWeight: 700,
  },

  // Day cards
  dayCard: {
    border: `1.5pt solid ${C.ink}`,
    backgroundColor: C.paper,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  dayHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 6,
    marginBottom: 6,
    borderBottom: `0.5pt dashed ${C.line}`,
  },
  dayNum: {
    width: 22,
    height: 22,
    backgroundColor: C.coral,
    color: "#fff",
    borderRadius: 11,
    border: `1pt solid ${C.ink}`,
    fontSize: 11,
    fontWeight: 700,
    textAlign: "center",
    lineHeight: 1.9,
    marginRight: 6,
  },
  dayTitleRow: { flexDirection: "row", alignItems: "center" },
  dayTitle: { fontFamily: SERIF, fontSize: 13, fontWeight: 700 },
  dayLabel: { fontSize: 9, color: C.ink2 },
  event: {
    flexDirection: "row",
    paddingVertical: 5,
    borderTop: `0.5pt dashed ${C.line}`,
    alignItems: "flex-start",
  },
  eventFirst: { borderTop: 0 },
  eventTime: {
    width: 38,
    fontSize: 9,
    color: C.ink2,
    fontWeight: 700,
  },
  eventEmoji: { width: 18, fontSize: 12 },
  eventBody: { flex: 1, paddingRight: 8 },
  eventTitle: { fontSize: 10, fontWeight: 700 },
  eventMeta: { fontSize: 8, color: C.ink2 },
  eventCost: { fontSize: 10, fontWeight: 700, marginLeft: 4 },

  // Cost breakdown
  breakdown: {
    flexDirection: "row",
    height: 10,
    border: `1pt solid ${C.ink}`,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 6,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    fontSize: 9,
  },

  // Agent summary card
  summaryCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: C.paper,
    border: `2pt solid ${C.ink}`,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  summaryAvatar: {
    width: 52,
    paddingTop: 4,
  },
  summaryBody: { flex: 1 },
  summaryTag: {
    fontFamily: SANS,
    fontSize: 8,
    fontWeight: 700,
    color: C.coral,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  summaryText: {
    fontFamily: SERIF,
    fontSize: 11,
    lineHeight: 1.45,
    color: C.ink,
  },

  // Disclaimer + footer
  disclaimer: {
    marginTop: 14,
    padding: 8,
    backgroundColor: C.bg2,
    border: `1pt dashed ${C.ink}`,
    borderRadius: 8,
    fontSize: 8,
    color: C.ink2,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    fontSize: 7,
    color: C.muted,
    borderTop: `0.5pt solid ${C.line}`,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const fmtMoney = (n) => "$" + Math.round(n || 0).toLocaleString();

// A small inline SVG render of the agent character — coral round head, white
// cheeks, ink eyes, smile, antenna. Rendered via react-pdf's Svg primitives,
// no network fetch needed.
function AgentAvatar({ size = 64 }) {
  return (
    <Svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      <G>
        {/* antenna */}
        <Rect x="48" y="6" width="4" height="14" fill={C.ink} />
        <Circle cx="50" cy="6" r="5" fill={C.lime} stroke={C.ink} strokeWidth="2" />
        {/* head */}
        <Circle cx="50" cy="56" r="32" fill={C.coral} stroke={C.ink} strokeWidth="3" />
        {/* cheeks */}
        <Circle cx="34" cy="66" r="5" fill="#ffb7c5" />
        <Circle cx="66" cy="66" r="5" fill="#ffb7c5" />
        {/* eyes */}
        <Circle cx="40" cy="54" r="4" fill={C.ink} />
        <Circle cx="60" cy="54" r="4" fill={C.ink} />
        <Circle cx="42" cy="52" r="1.5" fill="#fff" />
        <Circle cx="62" cy="52" r="1.5" fill="#fff" />
        {/* smile */}
        <Path
          d="M 38 70 Q 50 80 62 70"
          stroke={C.ink}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

// Map the option's color hex from the existing var(--name) breakdown to a
// flat color (PDF can't read CSS vars).
const VAR_MAP = {
  "var(--coral)": C.coral,
  "var(--tangerine)": C.tangerine,
  "var(--sunshine)": C.sunshine,
  "var(--lime)": C.lime,
  "var(--mint)": C.mint,
  "var(--sky)": C.sky,
  "var(--grape)": C.grape,
  "var(--bubblegum)": C.bubblegum,
};

function BookedRow({ emoji, iconColor, title, meta, price, host }) {
  return (
    <View style={s.row}>
      <Text style={[s.rowIcon, { backgroundColor: iconColor || C.sky }]}>
        {emoji}
      </Text>
      <View style={s.rowBody}>
        <Text style={s.rowTitle}>{title}</Text>
        {meta ? <Text style={s.rowMeta}>{meta}</Text> : null}
      </View>
      <Text style={s.rowPrice}>{price === 0 ? "free" : fmtMoney(price)}</Text>
      {host ? (
        <Link src={`https://${host}`} style={s.rowLink}>
          {host} →
        </Link>
      ) : null}
    </View>
  );
}

export function TripPDF({ trip }) {
  if (!trip) return null;

  const flight = trip.bookingOptions?.flights?.[trip.selection?.flights ?? 0];
  const stay = trip.bookingOptions?.stays?.[trip.selection?.stays ?? 0];
  const transport =
    trip.bookingOptions?.transport?.[trip.selection?.transport ?? 0];

  const breakdown = (trip.breakdown || []).map((b) => ({
    ...b,
    flatColor: VAR_MAP[b.color] || C.sky,
  }));
  const breakdownTotal = breakdown.reduce((s, b) => s + (b.val || 0), 0) || 1;

  return (
    <Document
      title={`${trip.title} trip plan`}
      author="TrvlPlnr"
      subject="AI-generated trip itinerary"
    >
      <Page size="LETTER" style={s.page}>
        {/* Brand strip with agent avatar */}
        <View style={s.brandStrip}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ marginRight: 8 }}>
              <AgentAvatar size={36} />
            </View>
            <Text style={s.brand}>TrvlPlnr</Text>
          </View>
          <Text style={s.brandTag}>your AI travel concierge</Text>
        </View>

        {/* Hero card */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>{trip.hero || "✈️"}</Text>
          <View style={s.heroBody}>
            <Text style={s.eyebrow}>your plan</Text>
            <Text style={s.heroTitle}>
              {trip.nights} nights in {trip.title}
            </Text>
            <Text style={s.heroMeta}>
              {trip.dateFrom} → {trip.dateTo} · {trip.travelers}{" "}
              {trip.travelers === 1 ? "traveler" : "travelers"} · {trip.vibe}
            </Text>
            <Text style={s.heroMeta}>
              {trip.origin} → {trip.destination}
            </Text>
          </View>
          <View style={s.heroTotalBox}>
            <Text style={s.heroTotalLabel}>Total</Text>
            <Text style={s.heroTotalNum}>{fmtMoney(trip.total)}</Text>
            <Text style={s.heroTotalPer}>
              {fmtMoney(trip.perPerson)} / person
            </Text>
          </View>
        </View>

        {/* From your agent — narrative summary */}
        {trip.summary ? (
          <View style={s.summaryCard} wrap={false}>
            <View style={s.summaryAvatar}>
              <AgentAvatar size={48} />
            </View>
            <View style={s.summaryBody}>
              <Text style={s.summaryTag}>FROM YOUR AGENT</Text>
              <Text style={s.summaryText}>{trip.summary}</Text>
            </View>
          </View>
        ) : null}

        {/* Where the money goes */}
        {breakdown.length > 0 && (
          <View>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Where the money goes</Text>
              <Text style={s.sectionSub}>USD · all-in</Text>
            </View>
            <View style={s.breakdown}>
              {breakdown.map((b, i) => (
                <View
                  key={b.key}
                  style={{
                    width: ((b.val || 0) / breakdownTotal) * 100 + "%",
                    backgroundColor: b.flatColor,
                    borderRight:
                      i < breakdown.length - 1 ? `1pt solid ${C.ink}` : 0,
                  }}
                />
              ))}
            </View>
            {breakdown.map((b) => (
              <View key={b.key} style={s.breakdownRow}>
                <Text>
                  {b.emoji} {b.label}
                </Text>
                <Text>{fmtMoney(b.val)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Your bookings */}
        {(flight || stay || transport) && (
          <View wrap={false}>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Your bookings</Text>
              <Text style={s.sectionSub}>Tap a link to book</Text>
            </View>
            {flight && (
              <BookedRow
                emoji={flight.emoji || "✈️"}
                iconColor={C.sky}
                title={`${flight.airline} · ${flight.flight}`}
                meta={`${flight.route} · ${flight.meta}`}
                price={flight.price}
                host={flight.host}
              />
            )}
            {stay && (
              <BookedRow
                emoji={stay.emoji || "🏨"}
                iconColor={C.bubblegum}
                title={stay.name}
                meta={`${stay.type} · ${stay.meta}`}
                price={stay.price}
                host={stay.host}
              />
            )}
            {transport && (
              <BookedRow
                emoji="🚗"
                iconColor={C.tangerine}
                title={transport.name}
                meta={transport.meta}
                price={transport.price}
                host={transport.host}
              />
            )}
          </View>
        )}

        {/* Day-by-day */}
        {trip.days && trip.days.length > 0 && (
          <View>
            <View style={s.sectionHead}>
              <Text style={s.sectionTitle}>Day-by-day</Text>
              <Text style={s.sectionSub}>
                {trip.days.length} {trip.days.length === 1 ? "day" : "days"}
              </Text>
            </View>
            {trip.days.map((day, i) => (
              <View key={i} style={s.dayCard} wrap={false}>
                <View style={s.dayHead}>
                  <View style={s.dayTitleRow}>
                    <Text style={s.dayNum}>{i + 1}</Text>
                    <Text style={s.dayTitle}>{day.title}</Text>
                  </View>
                  <Text style={s.dayLabel}>{day.label}</Text>
                </View>
                {day.events.map((ev, j) => (
                  <View
                    key={j}
                    style={[s.event, j === 0 ? s.eventFirst : null]}
                  >
                    <Text style={s.eventTime}>{ev.time}</Text>
                    <Text style={s.eventEmoji}>{ev.emoji}</Text>
                    <View style={s.eventBody}>
                      <Text style={s.eventTitle}>{ev.title}</Text>
                      <Text style={s.eventMeta}>
                        {ev.meta}
                        {ev.vendor ? ` · ${ev.vendor}` : ""}
                      </Text>
                    </View>
                    <Text style={s.eventCost}>
                      {ev.cost === 0 ? "free" : fmtMoney(ev.cost)}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Text style={{ fontWeight: 700, marginBottom: 2 }}>Heads up:</Text>
          <Text>
            All prices in this plan are AI-generated estimates based on typical
            mid-season, mid-week rates for the route. Real prices vary by date,
            availability, and class. Always verify on the booking site before
            purchasing.
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>Generated by TrvlPlnr</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
