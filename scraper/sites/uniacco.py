"""uniacco.com — listing cards rendered as <a href="https://uniacco.com/uk/london/<slug>">.

We extract name, image, and "From £xxx / week" from each card's parent block.
"""
from __future__ import annotations

import re
from urllib.parse import urlparse

from ..normalize import Listing, parse_price
from ..parsing import soup as make_soup

SOURCE = "uniacco"

_LISTING_HREF = re.compile(r"^https://uniacco\.com/uk/london/([^/?#]+)$")
_PRICE_RE = re.compile(r"£\s?(\d[\d,]*)\s*/?\s*(?:wk|week|pw|/\s*week)?", re.I)
_FILTER_SLUGS = {
    "student-accommodation",
    "house-shares",
}


def extract(html: str, source_url: str) -> list[Listing]:
    soup = make_soup(html)
    seen: dict[str, Listing] = {}

    for a in soup.find_all("a", href=True):
        m = _LISTING_HREF.match(a["href"])
        if not m:
            continue
        slug = m.group(1)
        if slug in _FILTER_SLUGS:
            continue
        if slug in seen:
            continue

        url = a["href"]
        parent = a.parent or a
        block_text = parent.get_text(" ", strip=True)
        anchor_text = a.get_text(" ", strip=True)

        # Name: prefer "From £..." pattern context — text before "From £"
        name = None
        # If anchor itself has substantive text and no price, that's the name
        if anchor_text and "£" not in anchor_text and len(anchor_text) > 2:
            name = anchor_text
        else:
            # Find name by looking for the property name in the block
            # Format observed: "Add to compare <Name> From £xxx / week <address>"
            name_match = re.search(r"(?:Add to compare\s+)?([A-Z][^£]+?)\s+From\s+£", block_text)
            if name_match:
                name = name_match.group(1).strip()
        if not name:
            name = slug.replace("-", " ").title()

        price_match = _PRICE_RE.search(block_text)
        price_text = price_match.group(0) if price_match else None
        val, cur, period = parse_price(price_text)

        img = a.find("img")
        image = None
        if img:
            image = img.get("src") or img.get("data-src")

        # Try to capture short address/description after "/ week"
        desc = None
        if price_match:
            tail = block_text[price_match.end():].strip()
            if tail:
                desc = tail[:240]

        seen[slug] = Listing(
            source=SOURCE,
            source_url=source_url,
            id=f"{SOURCE}:{slug}",
            name=name,
            url=url,
            price_text=price_text,
            price_value=val,
            price_currency=cur or ("GBP" if price_text else None),
            price_period=period or ("week" if price_text else None),
            city="London",
            country="UK",
            image=image,
            description=desc,
            raw={"slug": slug, "block_text": block_text[:500]},
        )

    return list(seen.values())
