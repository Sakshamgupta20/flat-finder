"""amberstudent.com — extract from the inventory API JSON pages.

Each record exposes pricing.min_price / max_price (weekly), location with full
postcode + lat/lng, source_link, image gallery, and amenity/feature tags.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from ..normalize import Listing, to_float, to_int

SOURCE = "amberstudent"

ROOT = Path(__file__).resolve().parent.parent.parent
RAW_DIR = ROOT / "data" / "raw" / "amber_api"

_CURRENCY_MAP = {
    "pound": "GBP",
    "gbp": "GBP",
    "usd": "USD",
    "eur": "EUR",
}

_PERIOD_MAP = {
    "weekly": "week",
    "monthly": "month",
    "yearly": "year",
}


def _featured_image(rec: dict) -> str | None:
    p = rec.get("inventory_featured_image_path")
    if p:
        return p
    images = rec.get("images") or []
    for img in images:
        if isinstance(img, dict) and img.get("featured"):
            return img.get("path") or img.get("base_path")
    if images and isinstance(images[0], dict):
        return images[0].get("path") or images[0].get("base_path")
    return None


def _short_desc(rec: dict) -> str | None:
    short = rec.get("meta_short")
    if isinstance(short, dict):
        # the field has been observed under variations; pick the most useful
        for key in ("description", "value", "title"):
            v = short.get(key)
            if isinstance(v, str) and v:
                return v[:600]
    elif isinstance(short, str) and short:
        return short[:600]
    return None


# Canonical amenity vocabulary we expose to the UI.
_AMENITY_PATTERNS: dict[str, re.Pattern[str]] = {
    "wifi": re.compile(r"\b(wi[- ]?fi|wifi|broadband|internet)\b", re.I),
    "laundry": re.compile(r"\b(laundry|washer|washing|launderette)\b", re.I),
    "gym": re.compile(r"\b(gym|fitness)\b", re.I),
    "study": re.compile(r"\b(study|library|workspace|coworking|laptop bar)\b", re.I),
    "social": re.compile(r"\b(common area|common room|social|lounge|games|communal)\b", re.I),
    "security": re.compile(r"\b(24/?7|cctv|security|concierge|reception|secure access)\b", re.I),
    "cinema": re.compile(r"\b(cinema|movie|screening|theatre)\b", re.I),
    "bike_storage": re.compile(r"\b(bike|bicycle|cycle storage)\b", re.I),
    "parking": re.compile(r"\b(parking|car park)\b", re.I),
    "all_bills": re.compile(r"all[- ]bills|bills included|all[- ]inclusive", re.I),
}


def _amenities(rec: dict) -> list[str]:
    """Derive canonical amenity keys from amber's `tags` and `features` blocks."""
    haystack_parts: list[str] = []
    for t in rec.get("tags") or []:
        if isinstance(t, str):
            haystack_parts.append(t)
    for f in rec.get("features") or []:
        if isinstance(f, dict):
            haystack_parts.append(f.get("name") or "")
            haystack_parts.append(f.get("type") or "")
            for v in f.get("values") or []:
                if isinstance(v, dict):
                    haystack_parts.append(v.get("name") or "")
                    haystack_parts.append(v.get("type") or "")
                elif isinstance(v, str):
                    haystack_parts.append(v)
    haystack = " ".join(haystack_parts)
    return [k for k, p in _AMENITY_PATTERNS.items() if p.search(haystack)]


def _bills_in_features(rec: dict) -> bool:
    for f in rec.get("features") or []:
        if isinstance(f, dict) and f.get("type") == "bills_included":
            return True
    return False


def _commute_from_destination_distances(
    rec: dict,
) -> tuple[int | None, int | None, int | None, float | None]:
    """Return (walk_min, transit_min, drive_min, transit_fare) extracted from
    amber's destination_distances block. The block is a list of arrays like
    `[ok_flag, status, marker, payload]`; payload.request.mode tells us the mode
    and payload.data.duration.value is in seconds.
    """
    walk = transit = drive = None
    fare = None
    for entry in rec.get("destination_distances") or []:
        if not isinstance(entry, list) or len(entry) < 4:
            continue
        payload = entry[3]
        if not isinstance(payload, dict):
            continue
        mode = ((payload.get("request") or {}).get("mode") or "").lower()
        data = payload.get("data") or {}
        if not isinstance(data, dict):
            continue
        dur = ((data.get("duration") or {}).get("value"))
        minutes = round(dur / 60) if isinstance(dur, (int, float)) else None
        if mode == "walking":
            walk = minutes
        elif mode == "driving":
            drive = minutes
        elif mode == "transit":
            transit = minutes
            f = (data.get("fare") or {}).get("value")
            if isinstance(f, (int, float)):
                fare = float(f)
    return walk, transit, drive, fare


def _strip_html(s: str | None) -> str | None:
    if not isinstance(s, str) or not s:
        return None
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s)).strip() or None


def _feature_tag_text(rec: dict, name: str) -> str | None:
    """Pull the `short_text` of a feature_tag whose `name` matches."""
    for t in rec.get("feature_tags") or []:
        if isinstance(t, dict) and t.get("name") == name:
            return _strip_html(t.get("short_text") or t.get("value"))
    return None


def _record_to_listing(rec: dict, source_url: str) -> Listing:
    name = rec.get("name") or rec.get("location", {}).get("name")
    canonical = rec.get("canonical_name") or str(rec.get("id"))

    pricing = rec.get("pricing") or {}
    cur = _CURRENCY_MAP.get((pricing.get("currency") or "").lower(), pricing.get("currency"))
    period = _PERIOD_MAP.get((pricing.get("duration") or "").lower(), pricing.get("duration"))
    min_p = to_float(pricing.get("min_available_price") or pricing.get("min_price"))
    max_p = to_float(pricing.get("max_available_price") or pricing.get("max_price"))

    location = rec.get("location") or {}
    coords = rec.get("location_coordinates") or location.get("location_coordinates") or {}
    if not isinstance(coords, dict):
        coords = {}
    postal = location.get("postal_code") or {}
    locality = location.get("locality") or {}
    country = location.get("country") or {}

    address_parts = []
    for key in ("primary", "secondary"):
        v = location.get(key)
        if isinstance(v, str) and v:
            address_parts.append(v)
    address = ", ".join(address_parts) or None

    src_link = rec.get("source_link") or f"https://amberstudent.com/places/{canonical}"

    deposit_min = to_float(pricing.get("min_deposit"))
    deposit_max = to_float(pricing.get("max_deposit"))
    amenities = _amenities(rec)
    if _bills_in_features(rec) and "all_bills" not in amenities:
        amenities.append("all_bills")
    walk_m, transit_m, drive_m, fare = _commute_from_destination_distances(rec)
    cancellation = _feature_tag_text(rec, "cancellation_policy")
    payment = _feature_tag_text(rec, "payment")

    return Listing(
        source=SOURCE,
        source_url=source_url,
        id=f"{SOURCE}:{canonical}",
        name=name,
        url=src_link,
        price_text=str(min_p) if min_p is not None else None,
        price_value=min_p,
        price_currency=cur or "GBP",
        price_period=period or "week",
        price_low=min_p,
        price_high=max_p,
        deposit_min=deposit_min,
        deposit_max=deposit_max,
        address=address,
        city=locality.get("long_name") if isinstance(locality, dict) else None,
        country=country.get("short_name") if isinstance(country, dict) else None,
        postal_code=postal.get("long_name") if isinstance(postal, dict) else None,
        lat=to_float(coords.get("lat")),
        lng=to_float(coords.get("lng")),
        image=_featured_image(rec),
        description=_short_desc(rec),
        rating=to_float(rec.get("reviews_rating")),
        rating_count=to_int(rec.get("reviews_count")),
        amenities=amenities,
        commute_walk_min=walk_m,
        commute_transit_min=transit_m,
        commute_drive_min=drive_m,
        transit_fare=fare,
        cancellation_policy=cancellation,
        payment_plan=payment,
        raw={"amber_inventory": rec},
    )


def extract_from_pages(source_url: str = "https://amberstudent.com/places/search/london-1811028205760") -> list[Listing]:
    out: list[Listing] = []
    seen: set[str] = set()
    if not RAW_DIR.exists():
        return out
    for path in sorted(RAW_DIR.glob("london_p*.json")):
        body = json.loads(path.read_text())
        for rec in (body.get("data") or {}).get("result") or []:
            canonical = rec.get("canonical_name") or str(rec.get("id"))
            if not canonical or canonical in seen:
                continue
            seen.add(canonical)
            out.append(_record_to_listing(rec, source_url))
    return out


def extract(html: str, source_url: str) -> list[Listing]:
    """Compat with the orchestrator's extract(html, source_url) contract.

    The HTML is unused — we read the cached API pages.
    """
    return extract_from_pages(source_url)
