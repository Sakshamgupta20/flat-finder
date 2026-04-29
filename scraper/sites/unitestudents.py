"""unitestudents.com — JSON-LD ProductGroup with hasVariant[] for each property.

Each variant has name, description, image, address, lat/lng, multiple Offer rows
(one per room type) with a `price` in GBP. We pick the lowest price as the
"from" weekly rate.
"""
from __future__ import annotations

import re
from urllib.parse import urlparse

from ..normalize import Listing, to_float, to_int
from ..parsing import flatten_graph, jsonld_items, of_type, soup as make_soup

SOURCE = "unitestudents"

# Same canonical vocabulary as amber_api.py — keep them in sync if you extend.
_AMENITY_PATTERNS: dict[str, re.Pattern[str]] = {
    "wifi": re.compile(r"\b(wi[- ]?fi|wifi|broadband|internet)\b", re.I),
    "laundry": re.compile(r"\b(laundry|washer|washing|launderette)\b", re.I),
    "gym": re.compile(r"\b(gym|fitness)\b", re.I),
    "study": re.compile(r"\b(study|library|workspace|coworking)\b", re.I),
    "social": re.compile(r"\b(common area|common room|social|lounge|games|communal|cinema room)\b", re.I),
    "security": re.compile(r"\b(24/?7|cctv|security|concierge|reception|secure access)\b", re.I),
    "cinema": re.compile(r"\b(cinema|movie|screening|theatre)\b", re.I),
    "bike_storage": re.compile(r"\b(bike|bicycle|cycle storage)\b", re.I),
    "parking": re.compile(r"\b(parking|car park)\b", re.I),
}


def _amenities_from_offers(offers: list) -> list[str]:
    parts: list[str] = []
    for o in offers:
        if not isinstance(o, dict):
            continue
        area = o.get("areaServed") or {}
        if not isinstance(area, dict):
            continue
        af = area.get("amenityFeature")
        if not isinstance(af, dict):
            continue
        for v in af.get("value") or []:
            if isinstance(v, str):
                parts.append(v)
    haystack = " ".join(parts)
    return [k for k, p in _AMENITY_PATTERNS.items() if p.search(haystack)]


def _slug_from_url(u: str | None) -> str | None:
    if not u:
        return None
    p = urlparse(u).path.rstrip("/")
    return p.rsplit("/", 1)[-1] or None


def extract(html: str, source_url: str) -> list[Listing]:
    soup = make_soup(html)
    items = flatten_graph(jsonld_items(soup))
    groups = of_type(items, "ProductGroup")

    out: list[Listing] = []
    for g in groups:
        for v in g.get("hasVariant") or []:
            if not isinstance(v, dict):
                continue
            name = v.get("name")
            offers = v.get("offers") or []
            if isinstance(offers, dict):
                offers = [offers]

            prices = []
            currency = None
            potential_url = None
            address = None
            lat = lng = None
            for o in offers:
                if not isinstance(o, dict):
                    continue
                p = o.get("price")
                if p is not None:
                    pf = to_float(p)
                    if pf is not None:
                        prices.append(pf)
                if o.get("priceCurrency"):
                    currency = o.get("priceCurrency")
                pa = o.get("potentialAction") or {}
                if isinstance(pa, dict) and pa.get("url"):
                    potential_url = potential_url or pa["url"]
                area = o.get("areaServed") or {}
                if isinstance(area, dict):
                    addr = area.get("address") or {}
                    if isinstance(addr, dict):
                        address = address or addr.get("streetAddress")
                    if area.get("latitude") is not None:
                        lat = lat or to_float(area.get("latitude"))
                        lng = lng or to_float(area.get("longitude"))

            image = v.get("image")
            if isinstance(image, dict):
                image = image.get("contentUrl") or image.get("url")

            url = potential_url
            slug = _slug_from_url(url)
            listing_id = f"{SOURCE}:{slug or (name or '').lower().replace(' ', '-')}"

            amenities = _amenities_from_offers(offers)

            out.append(Listing(
                source=SOURCE,
                source_url=source_url,
                id=listing_id,
                name=name,
                url=url,
                price_text=str(min(prices)) if prices else None,
                price_value=min(prices) if prices else None,
                price_currency=currency or "GBP",
                price_period="week",
                price_low=min(prices) if prices else None,
                price_high=max(prices) if prices else None,
                address=address,
                city="London",
                country="UK",
                lat=lat,
                lng=lng,
                image=image,
                description=v.get("description"),
                amenities=amenities,
                raw={"variant": v},
            ))
    return out
