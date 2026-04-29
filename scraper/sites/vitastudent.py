"""vitastudent.com — locations/london page lists Vita's London buildings.

We pull anchors of the form /en/cities/london/<building>/.
"""
from __future__ import annotations

import re
from urllib.parse import urlparse

from ..normalize import Listing
from ..parsing import soup as make_soup

SOURCE = "vitastudent"

_BUILDING_RE = re.compile(
    r"^https://www\.vitastudent\.com/en/cities/london/([^/?#]+)/?$"
)


def extract(html: str, source_url: str) -> list[Listing]:
    soup = make_soup(html)
    seen: set[str] = set()
    out: list[Listing] = []
    for a in soup.find_all("a", href=True):
        m = _BUILDING_RE.match(a["href"])
        if not m:
            continue
        slug = m.group(1)
        if slug in seen:
            continue
        seen.add(slug)
        name = a.get_text(" ", strip=True) or slug.replace("-", " ").title()
        out.append(Listing(
            source=SOURCE,
            source_url=source_url,
            id=f"{SOURCE}:{slug}",
            name=name,
            url=a["href"],
            city="London",
            country="UK",
            raw={"slug": slug},
        ))
    return out
