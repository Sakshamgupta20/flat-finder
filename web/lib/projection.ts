// Geographic projection from real lat/lng onto the stylized 1000x680 SVG canvas.
// The canvas covers ~26km E-W and ~17km N-S centered on Imperial College
// (South Kensington), so all of Greater London fits with a small margin.

export const IMPERIAL_LATLNG = { lat: 51.4988, lng: -0.1749 };

export const MAP_PX_W = 1000;
export const MAP_PX_H = 680;
export const MAP_KM_W = 26;
export const MAP_KM_H = 17;

const LAT_DEG_PER_KM = 1 / 111;
const LNG_DEG_PER_KM = 1 / (111 * Math.cos((IMPERIAL_LATLNG.lat * Math.PI) / 180));

export function latLngToMap(
  lat: number,
  lng: number,
): { x: number; y: number } {
  const dxKm = (lng - IMPERIAL_LATLNG.lng) / LNG_DEG_PER_KM;
  const dyKm = (IMPERIAL_LATLNG.lat - lat) / LAT_DEG_PER_KM; // y grows downward
  const x = MAP_PX_W / 2 + (dxKm * MAP_PX_W) / MAP_KM_W;
  const y = MAP_PX_H / 2 + (dyKm * MAP_PX_H) / MAP_KM_H;
  return { x, y };
}

export function pxToKm(mapX: number, mapY: number): number {
  const dx = (mapX - MAP_PX_W / 2) * (MAP_KM_W / MAP_PX_W);
  const dy = (mapY - MAP_PX_H / 2) * (MAP_KM_H / MAP_PX_H);
  return Math.sqrt(dx * dx + dy * dy);
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// Rough commute estimates from straight-line km. For a real product these
// would be replaced by TfL Journey Planner / Google Distance Matrix lookups.
export function estimateCommutes(km: number): {
  walk: number;
  tube: number;
  cycle: number;
} {
  return {
    walk: Math.round(km * 12), // ~5 km/h
    tube: Math.round(km * 2 + 5), // ~30 km/h, +5 min platform overhead
    cycle: Math.round(km * 4), // ~15 km/h
  };
}

// Postcode → London zone: very rough mapping from outward code (first 1-2
// letters + digit). We classify by central postcodes; missing postcodes default
// to zone 2.
const ZONE_RULES: Array<[RegExp, string]> = [
  [/^(WC|EC)/, "1"],
  [/^(W1|N1|E1|SE1|SW1|NW1)$/, "1"],
  [/^(W[2-9]|N[2-9]|E[2-9]|SE[2-9]|SW[2-9]|NW[2-9])$/, "2"],
  [/^(W1[0-9]|N1[0-9]|E1[0-9]|SE1[0-9]|SW1[0-9]|NW1[0-9])$/, "2"],
  [/^(N2[0-9]|E2[0-9]|SE2[0-9])$/, "3"],
  [/^(HA|UB|TW|KT|SM|CR|BR|RM|IG)/, "4"],
];

export function zoneFromPostcode(pc: string | null | undefined): string {
  if (!pc) return "2";
  const head = pc.replace(/\s+/g, "").toUpperCase().match(/^[A-Z]{1,2}\d{1,2}/);
  if (!head) return "2";
  for (const [re, z] of ZONE_RULES) if (re.test(head[0])) return z;
  return "3";
}
