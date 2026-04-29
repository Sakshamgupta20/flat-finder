"""Common normalized listing record + helpers."""
from __future__ import annotations

import re
from dataclasses import dataclass, asdict, field
from typing import Any


@dataclass
class Listing:
    source: str
    source_url: str
    id: str
    name: str | None = None
    url: str | None = None
    price_text: str | None = None
    price_value: float | None = None
    price_currency: str | None = None
    price_period: str | None = None
    price_low: float | None = None
    price_high: float | None = None
    deposit_min: float | None = None
    deposit_max: float | None = None
    address: str | None = None
    city: str | None = None
    country: str | None = None
    postal_code: str | None = None
    lat: float | None = None
    lng: float | None = None
    image: str | None = None
    images: list[str] = field(default_factory=list)
    description: str | None = None
    rating: float | None = None
    rating_count: int | None = None
    # Canonical amenity keys we've observed across sources.
    amenities: list[str] = field(default_factory=list)
    # Real commute times (minutes) to the source's reference destination
    # (amber's "central London" point). Null when not provided by the source.
    commute_walk_min: int | None = None
    commute_transit_min: int | None = None
    commute_drive_min: int | None = None
    transit_fare: float | None = None
    cancellation_policy: str | None = None
    payment_plan: str | None = None
    type: str = "student_accommodation"
    raw: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


_NUM = re.compile(r"(\d+(?:\.\d+)?)")


def parse_price(text: str | None) -> tuple[float | None, str | None, str | None]:
    """Return (value, currency, period) parsed from a free-form price string."""
    if not text:
        return None, None, None
    s = str(text)
    cur = None
    if "£" in s or "GBP" in s.upper():
        cur = "GBP"
    elif "$" in s or "USD" in s.upper():
        cur = "USD"
    elif "€" in s or "EUR" in s.upper():
        cur = "EUR"

    period = None
    sl = s.lower()
    if "/wk" in sl or "per week" in sl or "pw" in sl or "/week" in sl or "weekly" in sl:
        period = "week"
    elif "/mo" in sl or "per month" in sl or "pm" in sl or "monthly" in sl:
        period = "month"
    elif "per night" in sl or "/night" in sl:
        period = "night"

    m = _NUM.search(s.replace(",", ""))
    val = float(m.group(1)) if m else None
    return val, cur, period


def to_float(v: Any) -> float | None:
    if v is None or v == "":
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def to_int(v: Any) -> int | None:
    if v is None or v == "":
        return None
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None
