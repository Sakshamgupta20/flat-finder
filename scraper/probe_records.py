"""Print one sample listing-like record per site so we can map fields."""
from __future__ import annotations

import json
import re
from pathlib import Path

from bs4 import BeautifulSoup

RAW = Path(__file__).resolve().parent.parent / "data" / "raw"


def _safe_load(s: str):
    try:
        return json.loads(s)
    except Exception:  # noqa: BLE001
        return None


def jsonld(soup):
    out = []
    for tag in soup.find_all("script", type="application/ld+json"):
        d = _safe_load(tag.string or tag.get_text() or "")
        if d is None:
            continue
        if isinstance(d, list):
            out.extend(d)
        else:
            out.append(d)
    return out


def first_of_type(items, *types):
    for it in items:
        if isinstance(it, dict):
            t = it.get("@type")
            if isinstance(t, list):
                if any(x in types for x in t):
                    return it
            elif t in types:
                return it
    return None


def all_of_type(items, *types):
    out = []
    for it in items:
        if isinstance(it, dict):
            t = it.get("@type")
            if isinstance(t, list):
                if any(x in types for x in t):
                    out.append(it)
            elif t in types:
                out.append(it)
    return out


def show(label, obj, depth=2):
    print(f"--- {label} ---")
    print(json.dumps(obj, indent=2, default=str)[: 1500])


def probe_casita(html):
    soup = BeautifulSoup(html, "lxml")
    items = jsonld(soup)
    hostels = all_of_type(items, "Hostel")
    products = all_of_type(items, "Product")
    print(f"casita: hostels={len(hostels)} products={len(products)}")
    if hostels:
        show("casita Hostel[0]", hostels[0])
    if products:
        show("casita Product[0]", products[0])
    nd_tag = soup.find("script", id="__NEXT_DATA__")
    if nd_tag:
        nd = _safe_load(nd_tag.string)
        buildings = nd.get("props", {}).get("pageProps", {}).get("buildings")
        if buildings:
            print(f"casita next buildings: {type(buildings).__name__} len="
                  f"{len(buildings) if hasattr(buildings, '__len__') else '-'}")
            if isinstance(buildings, list) and buildings:
                show("casita buildings[0]", buildings[0])


def probe_amber(html):
    soup = BeautifulSoup(html, "lxml")
    items = jsonld(soup)
    products = all_of_type(items, "Product")
    print(f"amber: products={len(products)}")
    if products:
        show("amber Product[0]", products[0])
    # parse the searchPageData JS object
    m = re.search(r"searchPageData\s*:\s*\{readyStatus", html)
    if m:
        # Extract roughly — use the broad slice and cut at the next top-level key
        idx = m.start()
        snippet = html[idx: idx + 2000]
        print("amber raw initial-state slice:")
        print(snippet[:1200])


def probe_uhomes(html):
    soup = BeautifulSoup(html, "lxml")
    items = jsonld(soup)
    products = all_of_type(items, "Product")
    itemlists = all_of_type(items, "ItemList")
    print(f"uhomes: products={len(products)} itemlists={len(itemlists)}")
    if products:
        show("uhomes Product[0]", products[0])
    if itemlists:
        show("uhomes ItemList[0]", itemlists[0])


def probe_universityliving(html):
    soup = BeautifulSoup(html, "lxml")
    items = jsonld(soup)
    itemlists = all_of_type(items, "ItemList")
    products = all_of_type(items, "Product")
    print(f"universityliving: itemlists={len(itemlists)} products={len(products)}")
    if itemlists:
        show("universityliving ItemList[0]", itemlists[0])
    if products:
        show("universityliving Product[0]", products[0])
    nd_tag = soup.find("script", id="__NEXT_DATA__")
    if nd_tag:
        nd = _safe_load(nd_tag.string)
        sub = nd.get("props", {}).get("pageProps", {}).get("subListingsData")
        if sub:
            print(f"universityliving subListingsData type={type(sub).__name__}")
            if isinstance(sub, dict):
                print(f"  keys: {list(sub.keys())[:12]}")
                for k, v in list(sub.items())[:2]:
                    print(f"  {k}: {str(v)[:200]}")


def probe_yugo(html):
    soup = BeautifulSoup(html, "lxml")
    items = jsonld(soup)
    itemlists = all_of_type(items, "ItemList")
    print(f"yugo: itemlists={len(itemlists)}")
    if itemlists:
        show("yugo ItemList[0]", itemlists[0])


def probe_uniacco(html):
    soup = BeautifulSoup(html, "lxml")
    cards = soup.select("a[href*='accommodation'], a[href*='/property/'], a[href*='/properties/']")
    print(f"uniacco: anchor candidates={len(cards)}")
    for a in cards[:3]:
        print(f"  href={a.get('href')} text={a.get_text(strip=True)[:80]}")
    items = jsonld(soup)
    print(f"uniacco jsonld count={len(items)} types={[i.get('@type') for i in items if isinstance(i, dict)][:5]}")


def probe_vita(html):
    soup = BeautifulSoup(html, "lxml")
    items = jsonld(soup)
    print(f"vita jsonld count={len(items)}")
    for x in items:
        if isinstance(x, dict):
            print(f"  keys: {list(x.keys())[:8]}")
            graph = x.get("@graph")
            if graph:
                print(f"  graph types: {[g.get('@type') for g in graph if isinstance(g, dict)][:10]}")


def probe_unitestudents(html):
    soup = BeautifulSoup(html, "lxml")
    items = jsonld(soup)
    print(f"unitestudents jsonld count={len(items)}")
    for x in items:
        if isinstance(x, dict):
            print(f"  keys: {list(x.keys())[:8]}")
            graph = x.get("@graph")
            if graph:
                print(f"  graph types: {[g.get('@type') for g in graph if isinstance(g, dict)][:15]}")
                if graph:
                    show("unitestudents graph[0]", graph[0])


def probe_prestige(html):
    soup = BeautifulSoup(html, "lxml")
    items = jsonld(soup)
    lb = first_of_type(items, "LodgingBusiness")
    print(f"prestige: lodging={'yes' if lb else 'no'}")
    if lb:
        show("prestige LodgingBusiness", lb)


def probe_aa4s(html):
    soup = BeautifulSoup(html, "lxml")
    items = jsonld(soup)
    print(f"aa4s jsonld count={len(items)}")
    for x in items:
        if isinstance(x, dict):
            print(f"  keys: {list(x.keys())[:8]}")
            graph = x.get("@graph")
            if graph:
                print(f"  graph types: {[g.get('@type') for g in graph if isinstance(g, dict)][:10]}")


PROBES = {
    "casita_london": probe_casita,
    "amberstudent_search_london": probe_amber,
    "uhomes_london": probe_uhomes,
    "universityliving_london": probe_universityliving,
    "yugo_london": probe_yugo,
    "uniacco_london": probe_uniacco,
    "vitastudent": probe_vita,
    "unitestudents_home": probe_unitestudents,
    "prestigestudentliving": probe_prestige,
    "aa4s": probe_aa4s,
}


def main():
    for slug, fn in PROBES.items():
        path = RAW / f"{slug}.html"
        if not path.exists():
            continue
        html = path.read_text(encoding="utf-8", errors="ignore")
        print(f"\n========== {slug} ==========")
        try:
            fn(html)
        except Exception as e:  # noqa: BLE001
            print(f"  probe error: {e}")


if __name__ == "__main__":
    main()
