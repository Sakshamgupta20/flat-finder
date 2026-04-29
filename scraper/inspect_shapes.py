"""Walk every saved raw HTML, extract structured payloads, and print a one-line
summary of what kinds of records each site exposes.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

RAW = Path(__file__).resolve().parent.parent / "data" / "raw"


def _safe_load(text: str):
    try:
        return json.loads(text)
    except Exception:  # noqa: BLE001
        return None


def extract_jsonld(soup: BeautifulSoup) -> list:
    out = []
    for tag in soup.find_all("script", type="application/ld+json"):
        data = _safe_load(tag.string or tag.get_text() or "")
        if data is None:
            continue
        if isinstance(data, list):
            out.extend(data)
        else:
            out.append(data)
    return out


def extract_nextdata(soup: BeautifulSoup):
    tag = soup.find("script", id="__NEXT_DATA__")
    if not tag:
        return None
    return _safe_load(tag.string or tag.get_text() or "")


def extract_nuxt_or_initial(html: str):
    # window.__NUXT__ = ...; or self.__NUXT__=(...); various forms
    m = re.search(r"window\.__NUXT__\s*=\s*(.*?);\s*</script>", html, re.S)
    if m:
        return ("nuxt_window", m.group(1)[:200])
    m = re.search(r"window\.__PRELOADED_STATE__\s*=\s*(.*?);\s*</script>", html, re.S)
    if m:
        return ("preloaded", m.group(1)[:200])
    m = re.search(r"window\.__INITIAL_STATE__\s*=\s*(.*?);\s*</script>", html, re.S)
    if m:
        return ("initial", m.group(1)[:200])
    return None


def classify_jsonld(item: dict) -> str:
    if not isinstance(item, dict):
        return type(item).__name__
    t = item.get("@type")
    if isinstance(t, list):
        t = "+".join(t)
    return str(t)


def main():
    for path in sorted(RAW.glob("*.html")):
        html = path.read_text(encoding="utf-8", errors="ignore")
        soup = BeautifulSoup(html, "lxml")
        ld = extract_jsonld(soup)
        nd = extract_nextdata(soup)
        other = extract_nuxt_or_initial(html)

        print(f"\n=== {path.stem} ===")
        if ld:
            types = [classify_jsonld(x) for x in ld]
            print(f"  jsonld types: {types}")
            for x in ld[:3]:
                if isinstance(x, dict):
                    keys = list(x.keys())[:8]
                    print(f"    keys: {keys}")
        if nd:
            try:
                page = nd.get("page")
                props_keys = list(nd.get("props", {}).get("pageProps", {}).keys())[:12]
                print(f"  next page={page} pageProps keys={props_keys}")
            except Exception:  # noqa: BLE001
                pass
        if other:
            kind, snippet = other
            print(f"  {kind}: {snippet[:120]}...")
        if not ld and not nd and not other:
            # Sniff for any obviously listing-shaped repeating pattern
            anchors = soup.select("a[href*='accommodation'], a[href*='/property/'], a[href*='/properties/']")
            print(f"  no structured payloads; matching anchors: {len(anchors)}")


if __name__ == "__main__":
    main()
