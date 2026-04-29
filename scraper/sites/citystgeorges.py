"""City St George's, University of London — accommodation index links a small
set of halls of residence."""
from __future__ import annotations

import re

from ..normalize import Listing
from ..parsing import soup as make_soup

SOURCE = "citystgeorges"

_HALLS_RE = re.compile(
    r"^https://www\.citystgeorges\.ac\.uk/prospective-students/accommodation/residential-halls/([^/?#]+)$"
)


def extract(html: str, source_url: str) -> list[Listing]:
    soup = make_soup(html)
    seen: set[str] = set()
    out: list[Listing] = []
    for a in soup.find_all("a", href=True):
        m = _HALLS_RE.match(a["href"])
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
            type="university_halls",
            raw={"slug": slug},
        ))
    return out
