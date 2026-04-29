"""Fetch the seed URLs once and save raw HTML to data/raw/.

This is intentionally a separate step from extraction so we can iterate on
parsers without re-hitting the sites.
"""
from __future__ import annotations

import sys
from . import http

SEEDS: list[tuple[str, str]] = [
    ("londonist", "https://londonist.co.uk/landing-student/london-student-accommodation"),
    ("vitastudent_london", "https://www.vitastudent.com/en/locations/london/"),
    ("prestigestudentliving", "https://prestigestudentliving.com/student-accommodation/london/charles-morton-court"),
    ("amberstudent_search_london", "https://amberstudent.com/places/search/london-1811028205760"),
    ("uniacco_london", "https://uniacco.com/uk/london"),
    ("casita_london", "https://www.casita.com/student-accommodation/uk/london"),
    ("uhomes_london", "https://en.uhomes.com/uk/london"),
    ("unitestudents_london", "https://www.unitestudents.com/student-accommodation/london"),
    ("citystgeorges", "https://www.citystgeorges.ac.uk/prospective-students/accommodation"),
    ("yugo_london", "https://yugo.com/en-us/global/united-kingdom/london"),
    ("universityliving_london", "https://www.universityliving.com/united-kingdom/city/london"),
    ("aa4s", "https://aa4s.co.uk/"),
]


def main() -> int:
    s = http.session()
    failures: list[tuple[str, int | str]] = []
    for slug, url in SEEDS:
        try:
            r = http.fetch(s, url)
            http.save_raw(slug, r.content)
            print(f"[{r.status_code}] {slug:30s} {len(r.content):>8} bytes")
            if r.status_code >= 400:
                failures.append((slug, r.status_code))
        except Exception as e:  # noqa: BLE001
            print(f"[ERR] {slug:30s} {e}")
            failures.append((slug, str(e)))
        http.polite_sleep(1.2)
    if failures:
        print("\nFailures:")
        for slug, why in failures:
            print(f"  {slug}: {why}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
