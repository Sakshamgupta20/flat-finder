"""Page through amberstudent's inventory API and save each page as JSON.

The endpoint was discovered via the network panel on the amberstudent search
page. It returns rich, structured listings — far more than the SSR HTML.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from . import http

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw" / "amber_api"

ENDPOINT = "https://base.amberstudent.com/api/v1/inventories/"

# Fields chosen to mirror what the live amberstudent page requests (so the
# response shape stays compatible with what their UI consumes).
COMMON_PARAMS = {
    "limit": "30",
    "only": "id,name,parent_id,pricing,images,videos,location,canonical_name,tags,features,source_link,available,slashed_available_price,nearby_distances",
    "methods": "destination_distances,active_children_count,location_coordinates,reviews_count,reviews_rating,meta_short,feature_tags,amber_sales,images_with_featured",
    "region_radius": "20000",
    "region_type": "circle",
    "sort_key": "relevance_v0",
    "sort_order": "desc",
    "statuses": "active",
    "use_open_search": "true",
    "isInternalUser": "false",
    "with_active_rooms": "true",
    "use_v2_structure": "true",
    "lang": "en",
    "use_java_api": "true",
}

EXTRA_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://amberstudent.com",
    "Referer": "https://amberstudent.com/",
    "x-use-java-api": "true",
}

REGIONS = [
    # (region_canonical_name, slug-for-filenames, optional destination_coordinates)
    ("london-1811028205760", "london", None),
]


def fetch_region(s, region: str, slug: str, dest: str | None) -> int:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    page = 1
    total_seen = 0
    while True:
        params = {
            **COMMON_PARAMS,
            "p": str(page),
            "region_canonical_name": region,
        }
        if dest:
            params["destination_coordinates"] = dest

        r = s.get(ENDPOINT, params=params, headers=EXTRA_HEADERS, timeout=30)
        if r.status_code != 200:
            print(f"  [{r.status_code}] page={page} bytes={len(r.content)}")
            break
        body = r.json()
        meta = (body.get("data") or {}).get("meta") or {}
        results = (body.get("data") or {}).get("result") or []

        out_path = RAW_DIR / f"{slug}_p{page:02d}.json"
        out_path.write_bytes(r.content)
        total_seen += len(results)
        print(f"  saved {out_path.name} (page {page}/{meta.get('pages',[None])[-1]} count={meta.get('count')} got={len(results)})")

        nxt = meta.get("next")
        if not nxt or len(results) == 0:
            break
        page = int(nxt)
        http.polite_sleep(1.0)
    return total_seen


def main() -> int:
    s = http.session()
    grand_total = 0
    for region, slug, dest in REGIONS:
        print(f"\nRegion {slug} ({region}):")
        grand_total += fetch_region(s, region, slug, dest)
    print(f"\nGrand total records fetched: {grand_total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
