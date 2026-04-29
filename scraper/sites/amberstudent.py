"""amberstudent.com — listing URLs are visible in the static HTML; richer details
load via XHR after page load. We capture the listing URL set (name derived from
slug) for stage-1 storage; price/coords would require a per-detail fetch.
"""
from __future__ import annotations

import re
from urllib.parse import urlparse

from ..normalize import Listing

SOURCE = "amberstudent"

# Match listing URLs that aren't /search/ hub pages.
_LISTING_RE = re.compile(
    r"https?://amberstudent\.com/places/(?!search/)([a-z0-9][a-z0-9\-]+-\d{8,})"
)


def _name_from_slug(slug: str) -> str:
    # "north-lodge-london-1710102555905" -> "North Lodge London"
    parts = slug.split("-")
    while parts and parts[-1].isdigit():
        parts.pop()
    return " ".join(p.capitalize() for p in parts) if parts else slug


def extract(html: str, source_url: str) -> list[Listing]:
    seen: set[str] = set()
    out: list[Listing] = []
    for m in _LISTING_RE.finditer(html):
        slug = m.group(1).rstrip("\\")
        if slug in seen:
            continue
        seen.add(slug)
        url = f"https://amberstudent.com/places/{slug}"
        out.append(Listing(
            source=SOURCE,
            source_url=source_url,
            id=f"{SOURCE}:{slug}",
            name=_name_from_slug(slug),
            url=url,
            city="London",
            country="UK",
            raw={"slug": slug},
        ))
    return out
