"""Run every per-site extractor against its saved raw HTML and write:

  data/normalized/<site>.json   — full per-site records (raw + normalized)
  data/listings.json            — aggregated normalized records
  data/listings.csv             — flat CSV (sans `raw` blob)
"""
from __future__ import annotations

import csv
import json
import sys
from dataclasses import asdict
from importlib import import_module
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
NORM = ROOT / "data" / "normalized"
OUT = ROOT / "data"

# (raw-html slug, dotted module path under scraper.sites, original source URL)
SITES: list[tuple[str, str, str]] = [
    ("casita_london", "casita", "https://www.casita.com/student-accommodation/uk/london"),
    ("uhomes_london", "uhomes", "https://en.uhomes.com/uk/london"),
    ("universityliving_london", "universityliving", "https://www.universityliving.com/united-kingdom/city/london"),
    ("yugo_london", "yugo", "https://yugo.com/en-us/global/united-kingdom/london"),
    ("prestigestudentliving", "prestigestudentliving", "https://prestigestudentliving.com/student-accommodation/london/charles-morton-court"),
    ("unitestudents_london", "unitestudents", "https://www.unitestudents.com/student-accommodation/london"),
    ("uniacco_london", "uniacco", "https://uniacco.com/uk/london"),
    ("amberstudent_search_london", "amber_api", "https://amberstudent.com/places/search/london-1811028205760"),
    ("vitastudent_london", "vitastudent", "https://www.vitastudent.com/en/locations/london/"),
    ("citystgeorges", "citystgeorges", "https://www.citystgeorges.ac.uk/prospective-students/accommodation"),
    ("aa4s", "aa4s", "https://aa4s.co.uk/"),
    # londonist landing page has no listings; skipped intentionally.
]


CSV_COLUMNS = [
    "source", "id", "name", "url",
    "price_value", "price_currency", "price_period",
    "price_low", "price_high", "price_text",
    "address", "city", "country", "postal_code",
    "lat", "lng",
    "rating", "rating_count",
    "type", "image", "description",
    "source_url",
]


def main() -> int:
    NORM.mkdir(parents=True, exist_ok=True)

    aggregate = []
    summary = []
    for raw_slug, mod_name, source_url in SITES:
        path = RAW / f"{raw_slug}.html"
        if not path.exists():
            summary.append((raw_slug, "missing-raw", 0))
            continue
        try:
            mod = import_module(f"scraper.sites.{mod_name}")
        except ImportError as e:
            summary.append((raw_slug, f"import-error: {e}", 0))
            continue

        html = path.read_text(encoding="utf-8", errors="ignore")
        try:
            listings = mod.extract(html, source_url)
        except Exception as e:  # noqa: BLE001
            summary.append((raw_slug, f"extract-error: {e}", 0))
            continue

        records = [l.to_dict() for l in listings]
        (NORM / f"{mod_name}.json").write_text(
            json.dumps(records, indent=2, ensure_ascii=False, default=str),
            encoding="utf-8",
        )
        aggregate.extend(records)
        summary.append((raw_slug, "ok", len(records)))

    # Combined JSON
    (OUT / "listings.json").write_text(
        json.dumps(aggregate, indent=2, ensure_ascii=False, default=str),
        encoding="utf-8",
    )

    # Combined CSV (drop raw blob, truncate description)
    with (OUT / "listings.csv").open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CSV_COLUMNS, extrasaction="ignore")
        w.writeheader()
        for r in aggregate:
            row = {k: r.get(k) for k in CSV_COLUMNS}
            if isinstance(row.get("description"), str) and len(row["description"]) > 400:
                row["description"] = row["description"][:400] + "..."
            w.writerow(row)

    print("\nExtraction summary:")
    for slug, status, n in summary:
        print(f"  {slug:32s} {status:20s} listings={n}")
    print(f"\nTotal records: {len(aggregate)}")
    print(f"Wrote: {OUT/'listings.json'}")
    print(f"Wrote: {OUT/'listings.csv'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
