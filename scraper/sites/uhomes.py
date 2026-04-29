"""uhomes.com — ItemList JSON-LD with detail URLs (link-only on the listing page).

Detail-page enrichment is left for a follow-up stage.
"""
from __future__ import annotations

from urllib.parse import urlparse

from ..normalize import Listing
from ..parsing import jsonld_items, of_type, soup as make_soup

SOURCE = "uhomes"


def _id_from_url(u: str) -> str:
    path = urlparse(u).path.rstrip("/")
    return path.rsplit("/", 1)[-1] or path


def _name_from_id(slug: str) -> str:
    # "detail-apartments-1651838" -> "Apartments 1651838"
    parts = [p for p in slug.split("-") if p and p != "detail"]
    return " ".join(p.capitalize() for p in parts) if parts else slug


def extract(html: str, source_url: str) -> list[Listing]:
    soup = make_soup(html)
    items = jsonld_items(soup)
    lists = of_type(items, "ItemList")

    out: list[Listing] = []
    seen: set[str] = set()
    for il in lists:
        for el in il.get("itemListElement") or []:
            url = None
            name = None
            if isinstance(el, dict):
                url = el.get("url")
                if not url and isinstance(el.get("item"), dict):
                    url = el["item"].get("@id") or el["item"].get("url")
                    name = el["item"].get("name")
                if not name:
                    name = el.get("name")
            if not url or url in seen:
                continue
            seen.add(url)
            slug = _id_from_url(url)
            out.append(Listing(
                source=SOURCE,
                source_url=source_url,
                id=f"{SOURCE}:{slug}",
                name=name or _name_from_id(slug),
                url=url,
                city="London",
                country="UK",
                raw={"itemListEntry": el},
            ))
    return out
