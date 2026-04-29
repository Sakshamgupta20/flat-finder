"""universityliving.com — ItemList JSON-LD with name+url pairs."""
from __future__ import annotations

from urllib.parse import urlparse

from ..normalize import Listing
from ..parsing import jsonld_items, of_type, soup as make_soup

SOURCE = "universityliving"


def _slug(u: str) -> str:
    p = urlparse(u).path.rstrip("/")
    return p.rsplit("/", 1)[-1] or p


def extract(html: str, source_url: str) -> list[Listing]:
    soup = make_soup(html)
    items = jsonld_items(soup)
    lists = of_type(items, "ItemList")

    out: list[Listing] = []
    seen: set[str] = set()
    for il in lists:
        for el in il.get("itemListElement") or []:
            if not isinstance(el, dict):
                continue
            url = el.get("url")
            name = el.get("name")
            if isinstance(el.get("item"), dict):
                url = url or el["item"].get("@id") or el["item"].get("url")
                name = name or el["item"].get("name")
            if not url or url in seen:
                continue
            seen.add(url)
            out.append(Listing(
                source=SOURCE,
                source_url=source_url,
                id=f"{SOURCE}:{_slug(url)}",
                name=name,
                url=url,
                city="London",
                country="UK",
                raw={"itemListEntry": el},
            ))
    return out
