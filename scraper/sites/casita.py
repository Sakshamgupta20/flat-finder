"""casita.com — JSON-LD pairs Hostel+Product per listing on the search page."""
from __future__ import annotations

from ..normalize import Listing, parse_price, to_float, to_int
from ..parsing import jsonld_items, of_type, soup as make_soup

SOURCE = "casita"


def _slug(name: str) -> str:
    return "-".join(filter(None, (name or "").lower().split()))


def extract(html: str, source_url: str) -> list[Listing]:
    soup = make_soup(html)
    items = jsonld_items(soup)
    hostels = of_type(items, "Hostel")
    products = of_type(items, "Product")
    itemlists = of_type(items, "ItemList")

    by_name: dict[str, dict] = {p.get("name"): p for p in products if p.get("name")}

    url_by_name: dict[str, str] = {}
    for il in itemlists:
        for el in il.get("itemListElement") or []:
            if not isinstance(el, dict):
                continue
            item = el.get("item") if isinstance(el.get("item"), dict) else {}
            url = item.get("@id") or item.get("url")
            nm = item.get("name")
            if url and nm:
                url_by_name[nm] = url
                # also index by a "core" name (strip parenthetical suffixes)
                core = nm.split(" - ")[1].strip() if " - " in nm else nm
                url_by_name.setdefault(core, url)

    out: list[Listing] = []
    for h in hostels:
        name = h.get("name") or ""
        prod = by_name.get(name, {})
        offer = (prod.get("offers") or {}) if isinstance(prod.get("offers"), dict) else {}
        addr = h.get("address") or {}
        geo = h.get("geo") or {}
        rating = (prod.get("aggregateRating") or {}) if isinstance(prod.get("aggregateRating"), dict) else {}

        price_text = offer.get("price") or h.get("priceRange")
        val, cur, period = parse_price(price_text)
        if not cur:
            cur = offer.get("priceCurrency")

        out.append(Listing(
            source=SOURCE,
            source_url=source_url,
            id=f"{SOURCE}:{_slug(name)}" if name else f"{SOURCE}:{len(out)}",
            name=name or None,
            url=prod.get("url") or url_by_name.get(name),
            price_text=str(price_text) if price_text is not None else None,
            price_value=val,
            price_currency=cur,
            price_period=period or "week",
            address=addr.get("streetAddress") or addr.get("addressLocality"),
            city=addr.get("addressLocality"),
            country=addr.get("addressCountry"),
            postal_code=addr.get("postalCode"),
            lat=to_float(geo.get("latitude")),
            lng=to_float(geo.get("longitude")),
            image=prod.get("image"),
            description=prod.get("description"),
            rating=to_float(rating.get("ratingValue")),
            rating_count=to_int(rating.get("reviewCount") or rating.get("ratingCount")),
            raw={"hostel": h, "product": prod},
        ))
    return out
