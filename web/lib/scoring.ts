import { pxToKm } from "./projection";
import type {
  Preferences,
  Property,
  ScoredResult,
  SubScores,
  Weights,
} from "./types";

export function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

export function approxKm(p: Property): number {
  return pxToKm(p.mapX, p.mapY);
}

const MISSING = 0.5; // neutral score when a dimension has no data

export function scoreProperty(
  p: Property,
  prefs: Preferences,
  weights: Weights,
): ScoredResult {
  const monthly = p.weekly != null ? (p.weekly * 52) / 12 : null;
  const aff =
    p.weekly == null
      ? MISSING
      : 1 -
        clamp(
          ((p.weekly * 52) / 12 - prefs.budgetMin * 4.33) /
            (prefs.budgetMax * 4.33 - prefs.budgetMin * 4.33),
          0,
          1,
        );

  const modeMins = prefs.modes
    .map((m) => p[m])
    .filter((v): v is number => typeof v === "number");
  const bestMode = modeMins.length ? Math.min(...modeMins) : null;
  const com = bestMode == null ? MISSING : 1 - clamp(bestMode / prefs.maxCommute, 0, 1);

  const km = approxKm(p);
  const dist = 1 - clamp(km / 10, 0, 1);

  const bills =
    p.billsIncluded === "all"
      ? 1
      : p.billsIncluded === "partial"
        ? 0.5
        : p.billsIncluded === "none"
          ? 0
          : MISSING;

  const amen = p.amenities.length === 0 ? MISSING : clamp(p.amenities.length / 7, 0, 1);

  const flex =
    p.contractMonths == null
      ? MISSING
      : p.contractMonths <= 10
        ? 1
        : p.contractMonths <= 12
          ? 0.6
          : 0.2;

  const rev = p.rating != null ? p.rating / 5 : MISSING;

  const fresh =
    p.lastUpdated == null
      ? MISSING
      : p.lastUpdated < 7
        ? 1
        : p.lastUpdated < 30
          ? 0.5
          : 0.2;

  const subs: SubScores = {
    affordability: aff,
    commute: com,
    distance: dist,
    bills,
    amenities: amen,
    flexibility: flex,
    reviews: rev,
    freshness: fresh,
  };
  let total = 0;
  for (const k in weights) {
    const key = k as keyof Weights;
    total += (subs[key] ?? 0) * weights[key];
  }
  return {
    score: Math.round(total * 100),
    subs,
    monthly: monthly ?? 0,
    bestMode: bestMode ?? 0,
    km,
  };
}
