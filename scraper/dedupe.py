"""Cluster listings that look like the same physical property across sources.

Heuristics combined via union-find:

  1. Name token-set Jaccard >= 0.6 after stripping brand/locality stopwords.
  2. Postcode exact match (when both records have one).
  3. Lat/lng within ~120m (when both records have coords).

Outputs:
  data/duplicate_clusters.json   — clusters with >= 2 members, sorted by size
  data/listings_deduped.json     — one canonical record per cluster (best fields
                                   merged across sources, all source records kept
                                   under `appearances`).
Also prints a human-readable report.
"""
from __future__ import annotations

import json
import math
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

# Brand/locality tokens that don't help identify a property uniquely.
NAME_STOPWORDS = {
    "the", "and", "of",
    "london", "uk",
    "unite", "vita", "yugo", "iq",
    "student", "students", "accommodation", "housing",
    "residence", "residences", "halls", "hall", "house",
    "londonist", "amber", "amberstudent",
    "gobritanya", "go", "britanya",
}

# Strip leading aggregator/brand prefixes.
_PREFIXES = re.compile(
    r"^(?:londonist|gobritanya|amber|vita\s+student|chapter\s+at\s+|aes\s+)",
    re.IGNORECASE,
)


def name_tokens(name: str | None) -> set[str]:
    if not name:
        return set()
    s = name.lower()
    s = re.sub(r"\([^)]*\)", " ", s)         # drop parentheticals
    s = _PREFIXES.sub("", s.strip())
    toks = re.findall(r"[a-z0-9]+", s)
    return {t for t in toks if t not in NAME_STOPWORDS and len(t) > 1}


def jaccard(a: set, b: set) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def haversine_m(a: tuple[float, float], b: tuple[float, float]) -> float:
    lat1, lon1 = map(math.radians, a)
    lat2, lon2 = map(math.radians, b)
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * 6_371_000 * math.asin(math.sqrt(h))


def normalize_postcode(p: str | None) -> str | None:
    if not p:
        return None
    s = re.sub(r"\s+", "", p).upper()
    return s if len(s) >= 4 else None


class UF:
    def __init__(self, n: int):
        self.p = list(range(n))

    def find(self, i: int) -> int:
        while self.p[i] != i:
            self.p[i] = self.p[self.p[i]]
            i = self.p[i]
        return i

    def union(self, i: int, j: int) -> None:
        ri, rj = self.find(i), self.find(j)
        if ri != rj:
            self.p[ri] = rj


def cluster(records: list[dict]) -> list[list[int]]:
    n = len(records)
    uf = UF(n)

    tokens = [name_tokens(r.get("name")) for r in records]
    postcodes = [normalize_postcode(r.get("postal_code")) for r in records]
    coords = [
        (r.get("lat"), r.get("lng")) if r.get("lat") is not None and r.get("lng") is not None else None
        for r in records
    ]

    # Bucket by first letter of any name-token to keep the pairwise sweep cheap.
    bucket: dict[str, list[int]] = defaultdict(list)
    for i, ts in enumerate(tokens):
        for t in ts:
            bucket[t[0]].append(i)
    seen_pairs: set[tuple[int, int]] = set()

    def consider(i: int, j: int) -> bool:
        same_source = records[i]["source"] == records[j]["source"]
        ti, tj = tokens[i], tokens[j]
        pi, pj = postcodes[i], postcodes[j]
        ci, cj = coords[i], coords[j]
        overlap = ti & tj

        # Cross-source: looser — any one of name jaccard, postcode, or near coords.
        if not same_source:
            if jaccard(ti, tj) >= 0.6 and overlap:
                return True
            if pi and pj and pi == pj and overlap:
                return True
            if ci and cj and haversine_m(ci, cj) < 120 and overlap:
                return True
            return False

        # Same-source: stricter — need both location proof AND name overlap, to
        # collapse "reseller" listings (e.g. amber's LST/GoBritanya/iQ wrappers
        # of the same building) without merging genuinely distinct properties.
        if not overlap:
            return False
        if pi and pj and pi == pj:
            return True
        if ci and cj and haversine_m(ci, cj) < 50:
            return True
        return False

    for ids in bucket.values():
        for x in range(len(ids)):
            for y in range(x + 1, len(ids)):
                a, b = ids[x], ids[y]
                key = (a, b) if a < b else (b, a)
                if key in seen_pairs:
                    continue
                seen_pairs.add(key)
                if consider(a, b):
                    uf.union(a, b)

    groups: dict[int, list[int]] = defaultdict(list)
    for i in range(n):
        groups[uf.find(i)].append(i)
    return list(groups.values())


def merge_cluster(records: list[dict], idxs: list[int]) -> dict:
    """Pick the richest record as the canonical, keep all sources under appearances."""
    members = [records[i] for i in idxs]

    def richness(r):
        return (
            int(r.get("price_value") is not None) * 4
            + int(r.get("lat") is not None) * 3
            + int(r.get("address") is not None) * 2
            + int(bool(r.get("amenities"))) * 2
            + int(r.get("commute_walk_min") is not None) * 2
            + int(r.get("deposit_min") is not None)
            + int(bool(r.get("image")))
            + int(bool(r.get("description")))
        )

    best = max(members, key=richness).copy()
    canonical_name = best.get("name")

    prices = [m["price_value"] for m in members if m.get("price_value") is not None]
    if prices:
        best["price_value"] = min(prices)
        best["price_low"] = min(prices)
        best["price_high"] = max(prices)

    # Union amenities across all members so we don't lose info when an amber
    # reseller wrapper has fewer tags than its sibling.
    amenities: set[str] = set()
    for m in members:
        for a in m.get("amenities") or []:
            amenities.add(a)
    if amenities:
        best["amenities"] = sorted(amenities)

    # Pick the richest images gallery across the cluster (preserve order from
    # the source that supplied it; don't shuffle by mixing).
    galleries = [m.get("images") or [] for m in members]
    galleries.sort(key=len, reverse=True)
    if galleries and galleries[0]:
        best["images"] = galleries[0]
    elif "images" not in best:
        best["images"] = []

    # Best-known commute = the smallest non-null minute count across members.
    for k in ("commute_walk_min", "commute_transit_min", "commute_drive_min"):
        vals = [m.get(k) for m in members if m.get(k) is not None]
        if vals:
            best[k] = min(vals)
        elif k not in best:
            best[k] = None

    # Lowest deposit wins; carry the highest as the upper bound.
    dep_min = [m.get("deposit_min") for m in members if m.get("deposit_min") is not None]
    dep_max = [m.get("deposit_max") for m in members if m.get("deposit_max") is not None]
    if dep_min:
        best["deposit_min"] = min(dep_min)
    if dep_max:
        best["deposit_max"] = max(dep_max)

    # Take any non-null rating/cancellation_policy/payment_plan/transit_fare
    # from the cluster (best record may be from a source without these).
    for k in ("rating", "rating_count", "transit_fare",
              "cancellation_policy", "payment_plan"):
        if best.get(k) in (None, "", 0) or (k == "rating" and not best.get(k)):
            for m in members:
                v = m.get(k)
                if v not in (None, "", 0):
                    best[k] = v
                    break

    appearances = []
    for m in members:
        appearances.append({
            "source": m["source"],
            "id": m["id"],
            "name": m.get("name"),
            "url": m.get("url"),
            "price_value": m.get("price_value"),
            "price_currency": m.get("price_currency"),
            "price_period": m.get("price_period"),
        })

    sources = sorted({m["source"] for m in members})
    best["canonical_name"] = canonical_name
    best["sources"] = sources
    best["appearance_count"] = len(members)
    best["appearances"] = appearances
    # Drop the per-record raw blob — the per-source files in data/normalized/
    # already keep the originals.
    best.pop("raw", None)
    return best


def main() -> int:
    listings = json.loads((DATA / "listings.json").read_text())
    clusters = cluster(listings)
    clusters.sort(key=lambda c: (-len(c), records_first_name(listings, c)))

    duplicates = [c for c in clusters if len(c) > 1]
    deduped = [merge_cluster(listings, c) for c in clusters]

    (DATA / "duplicate_clusters.json").write_text(
        json.dumps(
            [
                {
                    "size": len(c),
                    "members": [
                        {
                            "source": listings[i]["source"],
                            "id": listings[i]["id"],
                            "name": listings[i].get("name"),
                            "url": listings[i].get("url"),
                            "price_value": listings[i].get("price_value"),
                            "address": listings[i].get("address"),
                            "lat": listings[i].get("lat"),
                            "lng": listings[i].get("lng"),
                        }
                        for i in c
                    ],
                }
                for c in duplicates
            ],
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    (DATA / "listings_deduped.json").write_text(
        json.dumps(deduped, indent=2, ensure_ascii=False, default=str),
        encoding="utf-8",
    )

    print(f"Total listings:  {len(listings)}")
    print(f"Unique clusters: {len(clusters)}")
    print(f"Duplicate clusters (size >= 2): {len(duplicates)}")
    print(f"Listings absorbed by dedup: {len(listings) - len(clusters)}")
    print()
    print("Top duplicate clusters:")
    for c in duplicates[:25]:
        names = [listings[i].get("name") or "?" for i in c]
        sources = [listings[i]["source"] for i in c]
        prices = [listings[i].get("price_value") for i in c if listings[i].get("price_value") is not None]
        plo, phi = (min(prices), max(prices)) if prices else (None, None)
        cheapest = f"£{plo:g}" if plo is not None else "—"
        spread = f"–£{phi:g}" if phi is not None and phi != plo else ""
        print(f"  [{len(c)}x] {names[0][:40]:40s} {cheapest}{spread}  via {sorted(set(sources))}")
    print()
    print(f"Wrote: {DATA/'duplicate_clusters.json'}")
    print(f"Wrote: {DATA/'listings_deduped.json'}")
    return 0


def records_first_name(records, idxs):
    return (records[idxs[0]].get("name") or "").lower()


if __name__ == "__main__":
    sys.exit(main())
