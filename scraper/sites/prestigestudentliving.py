"""prestigestudentliving.com — single LodgingBusiness JSON-LD per property page."""
from __future__ import annotations

from ..normalize import Listing, parse_price, to_float
from ..parsing import jsonld_items, of_type, soup as make_soup

SOURCE = "prestigestudentliving"


def extract(html: str, source_url: str) -> list[Listing]:
    soup = make_soup(html)
    items = jsonld_items(soup)
    lodging = of_type(items, "LodgingBusiness")

    out: list[Listing] = []
    for lb in lodging:
        addr = lb.get("address") or {}
        geo = lb.get("geo") or {}
        name = lb.get("name") or ""
        # name often includes long marketing text — keep first segment before " | "
        short_name = name.split(" | ")[0].strip() if name else None

        price_text = lb.get("priceRange")
        val, cur, period = parse_price(price_text)

        image = lb.get("image")
        if isinstance(image, dict):
            image = image.get("url")
        elif isinstance(image, list) and image:
            image = image[0] if isinstance(image[0], str) else (image[0] or {}).get("url")

        out.append(Listing(
            source=SOURCE,
            source_url=source_url,
            id=f"{SOURCE}:{(short_name or 'unknown').lower().replace(' ', '-')}",
            name=short_name or name or None,
            url=lb.get("url") or source_url,
            price_text=price_text,
            price_value=val,
            price_currency=cur or "GBP",
            price_period=period or "week",
            address=addr.get("streetAddress"),
            city=addr.get("addressLocality"),
            country=addr.get("addressCountry") or "UK",
            postal_code=addr.get("postalCode"),
            lat=to_float(geo.get("latitude")),
            lng=to_float(geo.get("longitude")),
            image=image,
            description=lb.get("description"),
            raw={"lodging": lb},
        ))
    return out
