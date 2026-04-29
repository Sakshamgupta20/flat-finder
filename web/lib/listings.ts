// Adapter: the scraper's deduped JSON → the web app's Property shape.
// Source: ../data/listings_deduped.json (canonical scraper output, sibling of web/).
//
// Rule: never invent values. If a field isn't supplied by any source for a
// given listing, leave it null and the UI shows "—".

import rawListings from "@data/listings_deduped.json";
import type {
  AmenityKey,
  BillsIncluded,
  Property,
  ProviderKey,
  RoomType,
} from "./types";
import {
  haversineKm,
  IMPERIAL_LATLNG,
  latLngToMap,
  zoneFromPostcode,
} from "./projection";

interface Appearance {
  source: string;
  id: string;
  name: string | null;
  url: string | null;
  price_value: number | null;
  price_currency: string | null;
  price_period: string | null;
}

interface DedupedListing {
  source: string;
  source_url: string;
  id: string;
  name: string;
  url: string | null;
  price_value: number | null;
  price_low: number | null;
  price_high: number | null;
  price_currency: string | null;
  price_period: string | null;
  deposit_min: number | null;
  deposit_max: number | null;
  address: string | null;
  city: string;
  country: string | null;
  postal_code: string | null;
  lat: number | null;
  lng: number | null;
  image: string | null;
  description: string | null;
  rating: number | null;
  rating_count: number | null;
  amenities: string[];
  commute_walk_min: number | null;
  commute_transit_min: number | null;
  commute_drive_min: number | null;
  transit_fare: number | null;
  cancellation_policy: string | null;
  payment_plan: string | null;
  type: string;
  canonical_name: string;
  sources: string[];
  appearance_count: number;
  appearances: Appearance[];
}

const SOURCE_TO_PROVIDER: Record<string, ProviderKey> = {
  amberstudent: "amber",
  unitestudents: "unite",
  universityliving: "scape",
  casita: "iq",
  uniacco: "host",
  uhomes: "chapter",
  yugo: "scape",
  prestigestudentliving: "imperial",
  vitastudent: "gradpad",
  citystgeorges: "imperial",
  aa4s: "host",
};

const NAME_PROVIDER_HINTS: Array<[RegExp, ProviderKey]> = [
  [/\bchapter\b/i, "chapter"],
  [/\biq\b/i, "iq"],
  [/\bunite\b/i, "unite"],
  [/\bvita\b/i, "gradpad"],
  [/\bgradpad\b/i, "gradpad"],
  [/\bscape\b/i, "scape"],
  [/\byugo\b/i, "scape"],
  [/\bhost\b/i, "host"],
  [/\bimperial\b/i, "imperial"],
];

function inferProvider(rec: DedupedListing): ProviderKey {
  for (const [re, key] of NAME_PROVIDER_HINTS) {
    if (re.test(rec.name)) return key;
  }
  return SOURCE_TO_PROVIDER[rec.source] ?? "amber";
}

const NAME_ROOM_HINTS: Array<[RegExp, RoomType]> = [
  [/\bstudio\b/i, "Studio"],
  [/\bensuite|en[- ]suite\b/i, "En-suite"],
  [/\btwin\b/i, "Twin"],
  [/\bshared\b/i, "Shared flat"],
  [/\bflat\b/i, "Flat"],
];

function inferRoomType(rec: DedupedListing): RoomType | null {
  for (const [re, rt] of NAME_ROOM_HINTS) {
    if (re.test(rec.name) || re.test(rec.description ?? "")) return rt;
  }
  return null;
}

const KNOWN_AMENITY_KEYS = new Set<AmenityKey>([
  "wifi",
  "laundry",
  "gym",
  "study",
  "social",
  "security",
  "cinema",
  "bike_storage",
  "parking",
  "all_bills",
]);

function inferBills(rec: DedupedListing): BillsIncluded {
  if (rec.amenities.includes("all_bills")) return "all";
  // We deliberately avoid guessing for non-amber sources.
  return "unknown";
}

function shortAddress(rec: DedupedListing): string | null {
  if (rec.address) return rec.address.length > 60 ? rec.address.slice(0, 57) + "…" : rec.address;
  if (rec.postal_code) return `London ${rec.postal_code}`;
  return null;
}

function postcodeOutward(pc: string | null | undefined): string | null {
  if (!pc) return null;
  const m = pc.replace(/\s+/g, "").toUpperCase().match(/^[A-Z]{1,2}\d{1,2}/);
  return m ? m[0] : pc.slice(0, 4);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function urlSafeId(rec: DedupedListing): string {
  // Prefer the source-provided canonical_name (e.g. "north-lodge-london-...")
  // when it's already URL-safe; otherwise slugify the property name.
  const cn = rec.canonical_name;
  if (cn && /^[a-z0-9-]+$/.test(cn)) return cn;
  const slugged = slugify(rec.name);
  return slugged || slugify(rec.id) || rec.id;
}

function adapt(rec: DedupedListing): Property | null {
  // Drop records outside the map canvas — we can't place them or reason about
  // proximity. ~17 records (mostly link-only entries from yugo/aa4s/etc).
  if (rec.lat == null || rec.lng == null) return null;
  const km = haversineKm(IMPERIAL_LATLNG, { lat: rec.lat, lng: rec.lng });
  if (km > 20) return null;

  const { x, y } = latLngToMap(rec.lat, rec.lng);

  const weekly = rec.price_low ?? rec.price_value ?? null;
  const weeklyHigh = rec.price_high ?? null;

  const amenities = rec.amenities.filter((a): a is AmenityKey =>
    KNOWN_AMENITY_KEYS.has(a as AmenityKey),
  );

  // Estimate monthly travel cost from a single-leg fare × 2 trips/day × 22 days.
  // Only when we actually have a fare — otherwise null.
  const travelMonthly =
    rec.transit_fare != null ? Math.round(rec.transit_fare * 2 * 22) : null;

  const p: Property = {
    id: urlSafeId(rec),
    name: rec.name,
    provider: inferProvider(rec),
    address: shortAddress(rec),
    postcode: postcodeOutward(rec.postal_code),
    weekly,
    weeklyHigh,
    billsIncluded: inferBills(rec),
    roomType: inferRoomType(rec),
    deposit: rec.deposit_min ?? null,
    depositHigh: rec.deposit_max ?? null,
    contractMonths: null,
    contract: null,
    cancellation: rec.cancellation_policy ?? null,
    paymentPlan: rec.payment_plan ?? null,
    availability: "unknown",
    eligibility: null,
    amenities,
    rating: rec.rating ?? null,
    ratingSrc: rec.rating != null ? rec.source : null,
    lastUpdated: null,
    mapX: x,
    mapY: y,
    walk: rec.commute_walk_min ?? null,
    tube: rec.commute_transit_min ?? null,
    cycle: null,
    transitFare: rec.transit_fare ?? null,
    travelMonthly,
    zone: zoneFromPostcode(rec.postal_code),
    station: null,
    notes: "",
    sources: rec.sources,
    appearances: rec.appearances,
    sourceUrl: rec.url ?? rec.source_url,
  };
  return p;
}

const all = (rawListings as DedupedListing[])
  .map(adapt)
  .filter((p): p is Property => p !== null);

// Push price-less listings to the bottom so the default sort is useful.
all.sort((a, b) => {
  const aw = a.weekly ?? Number.POSITIVE_INFINITY;
  const bw = b.weekly ?? Number.POSITIVE_INFINITY;
  return aw - bw;
});

export const REAL_PROPERTIES: Property[] = all;
