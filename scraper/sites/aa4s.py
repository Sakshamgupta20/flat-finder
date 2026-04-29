"""aa4s.co.uk — small site with two booking categories (term-time and summer)
and three properties (Claredale, Cordwainers Court, Well Street Hall).
"""
from __future__ import annotations

import re

from ..normalize import Listing
from ..parsing import soup as make_soup

SOURCE = "aa4s"

_PROP_RE = re.compile(
    r"^https://aa4s\.co\.uk/(term-time-accommodation|summer-accommodation)/([^/?#]+)/?$"
)


def extract(html: str, source_url: str) -> list[Listing]:
    soup = make_soup(html)
    seen: set[str] = set()
    out: list[Listing] = []
    for a in soup.find_all("a", href=True):
        m = _PROP_RE.match(a["href"].rstrip("/") + "/")
        if not m:
            continue
        category, slug = m.group(1), m.group(2)
        key = f"{category}:{slug}"
        if key in seen:
            continue
        seen.add(key)
        # Trim category-specific suffixes from slug for a cleaner name
        clean = re.sub(r"-(term-time|summer)$", "", slug)
        name = clean.replace("-", " ").title()
        out.append(Listing(
            source=SOURCE,
            source_url=source_url,
            id=f"{SOURCE}:{category}:{slug}",
            name=f"{name} ({category.replace('-', ' ').title()})",
            url=a["href"],
            city="London",
            country="UK",
            type=f"aa4s:{category}",
            raw={"slug": slug, "category": category},
        ))
    return out
