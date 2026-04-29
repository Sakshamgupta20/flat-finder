"""Shared HTML/JSON parsing helpers."""
from __future__ import annotations

import json
import re
from typing import Any

from bs4 import BeautifulSoup


def soup(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "lxml")


def safe_load(s: str | None) -> Any:
    if not s:
        return None
    try:
        return json.loads(s)
    except Exception:  # noqa: BLE001
        return None


def jsonld_items(soup: BeautifulSoup) -> list[Any]:
    out: list[Any] = []
    for tag in soup.find_all("script", type="application/ld+json"):
        data = safe_load(tag.string or tag.get_text() or "")
        if data is None:
            continue
        if isinstance(data, list):
            out.extend(data)
        else:
            out.append(data)
    return out


def of_type(items: list[Any], *types: str) -> list[dict]:
    out = []
    for it in items:
        if not isinstance(it, dict):
            continue
        t = it.get("@type")
        if isinstance(t, list):
            if any(x in types for x in t):
                out.append(it)
        elif t in types:
            out.append(it)
    return out


def flatten_graph(items: list[Any]) -> list[dict]:
    out: list[dict] = []
    for it in items:
        if isinstance(it, dict):
            if "@graph" in it and isinstance(it["@graph"], list):
                out.extend([x for x in it["@graph"] if isinstance(x, dict)])
            else:
                out.append(it)
    return out


def next_data(soup: BeautifulSoup) -> dict | None:
    tag = soup.find("script", id="__NEXT_DATA__")
    if not tag:
        return None
    return safe_load(tag.string or tag.get_text() or "")


_PROP_RE = re.compile(r'(?P<key>[A-Za-z_][A-Za-z0-9_]*)\s*:\s*"(?P<val>(?:[^"\\]|\\.)*)"')


def grep_kv(text: str) -> list[tuple[str, str]]:
    """Cheap grep of `key:"value"` pairs from inlined JS object literals."""
    return [(m.group("key"), m.group("val")) for m in _PROP_RE.finditer(text)]
