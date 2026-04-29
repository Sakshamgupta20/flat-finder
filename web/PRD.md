# Product Requirements Document
## Student Accommodation Finder for Imperial MBA (London, September 2026)

**Author:** Shubham Goyal
**Date:** 28 April 2026
**Status:** Draft v1.0 — pending review before implementation
**Target Launch (MVP):** Within 4–6 weeks of PRD approval

---

## 1. Product Overview

### 1.1 Product Name Suggestions
A shortlist of working names, ranked by clarity:

1. **NestNear** — emphasizes proximity to university, easy to remember.
2. **CampusKey** — student-housing focused, suggests unlocking the right place.
3. **GradPadFinder** — descriptive, but risk of trademark overlap with GradPad (avoid).
4. **CommuteFit** — anchors the unique value: every option scored by commute.
5. **HouseHunt MBA** — niche-clear, MBA flavour.
6. **ImpHome** (working codename) — Imperial-specific, fine for personal MVP.

**Recommended:** `NestNear` for public-facing, `imphome` for repo/codename.

### 1.2 One-line Description
> A single-page tool that aggregates London student accommodation listings, scores each option by commute, cost, and amenities against your university, and produces a shortlist you can compare side-by-side.

### 1.3 Problem Statement
Researching student accommodation in London is fragmented, repetitive, and high-stakes. A prospective international student must:
- Visit 8–15 different platforms (GradPad, Amber Student, UniAcco, Unite, Scape, Chapter, IQ, Host, university halls, SpareRoom, Rightmove, Zoopla, etc.).
- Re-enter the same filters on each.
- Reconcile inconsistent data fields (some sites quote weekly rent, others monthly; some include bills, some do not).
- Manually paste each address into Google Maps to check commute to their campus.
- Estimate travel cost using TfL's separate fare tool.
- Build a private spreadsheet to compare what's worth applying to.

This burns 20–40 hours of student time, frequently produces apples-to-oranges comparisons, and can lead to suboptimal or scam-prone bookings made under deadline pressure.

### 1.4 Target User
**Primary:** Incoming international postgraduate students (MBA, Master's, MSc) arriving in London for an autumn intake, with a fixed campus address (e.g., Imperial College Business School, South Kensington).

**Secondary:** UK-based home students with similar fragmented-search frustration; education agents who help students with placement.

**Initial user (v1):** Shubham — incoming Imperial MBA, September 2026, working from a known campus location, budget-conscious, technically literate.

### 1.5 Primary Use Case
*Given* I am moving to London for Imperial MBA in September 2026 with a budget of £350–£500/week, *when* I open this tool and enter my preferences, *then* I receive a ranked, mappable, side-by-side comparison of viable accommodations, with commute time and total monthly cost calculated to Imperial Business School, so I can shortlist 5–10 properties to apply to in under an hour.

### 1.6 Why This Product Matters
- **Time:** Compresses 20–40 hours of cross-site comparison into 30–60 minutes.
- **Money:** Surfaces *total* monthly cost (rent + bills + commute) rather than headline rent, which is the figure that actually constrains a student's budget.
- **Confidence:** Reduces decision regret by enforcing apples-to-apples comparison and a transparent scoring rubric.
- **Personal scratch:** I'm building this for myself first; if it works, it generalises trivially to any other university campus by changing one anchor.

---

## 2. User Persona

### Persona: "Shubham" — The Incoming MBA International Student

| Attribute | Detail |
|---|---|
| Age | 28 |
| Background | Working professional from outside the UK, accepted to Imperial MBA, Sept 2026 intake |
| Tech literacy | High — comfortable with web tools, GitHub, Vercel, spreadsheets |
| Budget | £350–£500/week all-in (rent + bills) |
| Lead time to move | 4–5 months out |
| Pain | Hates repeating the same 8 filters across 12 websites; can't tell which "weekly rent" includes bills; doesn't know which Tube zones equal "near campus" |
| Behaviour | Has 3 spreadsheets open, 30 browser tabs, a half-filled-in WhatsApp note from a friend, and zero confidence in any single number |
| Goal | Lock down 3–5 strong applications before the August rush, ideally en-suite, walking or single-tube-line distance from South Kensington, all-inclusive bills |
| Anti-goal | Doesn't want to scrape personal-data sites or violate ToS; doesn't want to spend money on SaaS for a one-off use case |
| Decision drivers | (1) total monthly cost, (2) commute to Imperial Business School, (3) bills included, (4) cancellation flexibility, (5) reviews/reputation |
| Channels | Google search, university accommodation portal, Reddit, WhatsApp group of admitted students |
| Devices | Laptop primary; phone for spot-checks while walking around (when visiting in person) |

---

## 3. Goals and Non-Goals

### 3.1 MVP Goals
- Centralise property data from at least 2–3 sources via **manual URL entry, CSV upload, or paste-from-page** (no automated scraping in v1).
- Compute commute to Imperial Business School (South Kensington) for every entry using a Distance Matrix-style API.
- Render results on **a sortable list, a map, and a side-by-side comparison table**.
- Apply a **transparent scoring formula** the user can re-weight.
- Allow **shortlisting and CSV/PDF export**.
- Ship to a public URL via Vercel + GitHub in under 6 weeks.

### 3.2 Future Goals (post-MVP)
- Automated discovery via search APIs and structured-data extraction.
- AI-assisted page parsing (LLM extracts price/amenities from a pasted URL).
- Live availability re-checks and price-change alerts.
- Multi-university support and neighbourhood guides.
- WhatsApp/email notifications.
- Visa- and intake-aware planning (move-in dates, deposit cycles).

### 3.3 Explicit Non-Goals (v1)
- Will not automatically scrape sites that prohibit scraping in their robots.txt or ToS.
- Will not act as a booking platform — we link to source listings only.
- Will not guarantee availability; freshness is shown but not enforced.
- Will not handle payments, deposits, or contracts.
- Will not host user accounts or social features (anonymous local-storage only in v1).
- Will not do recommendations for non-student housing markets (e.g., family rentals).

---

## 4. User Journey

### 4.1 Happy-Path Flow

1. **Land** on home page → headline "Find your London student home, scored by commute and cost."
2. **Setup**: pick city (London — preselected), university (Imperial College Business School — preselected), intake (Sept 2026), budget range, preferred commute (≤30 min), room type (en-suite studio / shared flat), bills-included preference.
3. **Add properties** via three input modes:
   - Paste a listing URL (we attempt to extract title, address, price; otherwise prompt for missing fields).
   - Upload a CSV (template provided).
   - Manual form entry.
4. **Auto-enrichment**: tool geocodes each address and computes walk/transit/cycle time and cost to Imperial Business School.
5. **Browse results**: a list view (default sort: weighted score) and a map view with Imperial as a pin and walking/transit isochrone rings.
6. **Filter**: drag filter chips for commute, price, bills, room type.
7. **Compare**: tick up to 5 properties → side-by-side comparison table with totals and pros/cons.
8. **Score**: each property has a 0–100 score; user can adjust weights (e.g., bump commute weight, drop amenities weight) and the ranking re-sorts live.
9. **Shortlist**: star properties → saved locally; add notes ("emailed Tuesday", "viewing scheduled 12 May"); mark interested / rejected.
10. **Export**: download CSV or PDF of shortlist.
11. **Return visit**: data persists in browser localStorage; user can re-open and continue.

### 4.2 Unhappy Paths

- URL extraction fails → fall back to a manual form prefilled with whatever fields succeeded.
- Address fails geocoding → ask user to confirm/correct address.
- Commute API quota exceeded → cache results aggressively; show "estimate" badge on cached values older than 7 days.
- User loses local data (cleared cache) → CSV export is the recovery mechanism; remind user on shortlist of >3 properties.

---

## 5. Core Features

### A. Search Input

The user fills a single setup form (collapsible, persists across visits):

| Field | Type | Required | Default |
|---|---|---|---|
| City | dropdown | yes | London |
| University | dropdown | yes | Imperial College Business School |
| Campus / specific address | text + geocode | yes | Imperial College Business School, South Kensington, SW7 |
| Intake month | month picker | yes | September 2026 |
| Budget (weekly £) | range slider | yes | 300–550 |
| Room type | multi-select | yes | Studio, En-suite, Shared flat |
| Max commute (minutes) | slider | yes | 30 |
| Travel mode preference | multi-select | yes | Walk, Tube, Bus |
| Bills included | radio | yes | Required / Preferred / Don't care |
| Amenities (gym, laundry, study room, social, kitchen, security) | multi-select | no | — |
| Min contract length (months) | slider | no | 9 |
| Max deposit (£) | numeric | no | 1000 |
| Preferred providers/sources | multi-select | no | All |

### B. Accommodation Discovery

#### Sources (target list)
GradPad, Amber Student, UniAcco, Imperial College Halls (official portal), Student.com, Unite Students, Scape, Chapter London, IQ Student Accommodation, Host Student, CRM Students, SpareRoom, Rightmove, Zoopla.

#### Legal & Technical Considerations

Most of the above platforms either explicitly prohibit scraping in their ToS or aggressively block scrapers. A respectful, durable approach for a personal MVP:

| Strategy | Risk | Effort | MVP-fit |
|---|---|---|---|
| **User-submitted URLs / paste-and-extract** | Low — user is acting on data they're already viewing | Low | ✅ Primary |
| **CSV upload from existing spreadsheets** | Low | Low | ✅ Primary |
| **Manual entry form** | None | Low | ✅ Primary |
| **Official affiliate feeds / partner APIs** (Student.com, Amber, UniAcco offer these) | Low — sanctioned use | Medium (apply, get keys) | ⚪ v1.5 |
| **Google search via SerpAPI / Bing Search API** to surface listing URLs | Low — search APIs are sanctioned | Medium | ⚪ v1.5 |
| **Structured-data extraction (JSON-LD, OpenGraph, schema.org RealEstateListing)** from public listing pages | Low — public, structured | Medium | ⚪ v1.5 |
| **Headless browser scraping (Playwright/Browserless/Firecrawl)** | Medium-high — many sites block; ToS varies | High | ❌ Out of scope for MVP |
| **AI extraction (LLM reads page text → JSON)** | Low if user pastes the page; medium if we fetch it | Medium | ⚪ v1.5 — only on user-pasted content |

**MVP rule of thumb:** the user is the data collector; we are the analyser. If the user has the listing open in their browser, they can copy the URL or page content into our tool, which then extracts and normalises. This sidesteps virtually all scraping concerns.

### C. Property Result Cards

Each card displays:

- Property name
- Provider / source (logo + name)
- Address (with map pin)
- Distance from Imperial Business School (km, miles)
- Commute time per mode (walk / tube / bus / cycle)
- Estimated monthly travel cost
- Weekly rent (£) and computed monthly rent (£×52÷12)
- Bills included? (Yes / No / Partial — list which)
- Room type (Studio / En-suite / Shared / Twin / Flat)
- Amenities (icon row)
- Deposit (£)
- Contract length (months) and tenancy dates
- Availability status (Available / Limited / Waitlist / Unknown)
- Cancellation policy (free until X / non-refundable)
- Eligibility (postgrad-only / open / Imperial-only)
- Reviews / ratings if available (with source)
- Source link (opens listing in new tab)
- Last updated date (with freshness badge: green <7d, amber 7–30d, red >30d)
- Score (0–100) with breakdown tooltip

### D. Map View

- Mapbox or Google Maps base layer.
- Imperial Business School pinned with a distinct marker.
- All properties as numbered pins coloured by score (green/amber/red).
- Toggleable distance rings: 1 km, 2 km, 5 km.
- Toggleable isochrones: 15-min, 30-min, 45-min walk/transit (if API permits).
- Click pin → property card preview; click "View" → full card.
- Filter chips on map mirror list filters.
- Mobile: map and list are tabs; desktop: side-by-side.

### E. Commute Calculator

Provider candidates (in order of preference for cost):
1. **OpenRouteService** (free tier, walking/cycling/driving) + **TfL Open API** (London-specific transit, free) — preferred for cost.
2. **Mapbox Directions** (free tier 100k req/mo) — good fallback.
3. **Google Maps Distance Matrix + Directions API** — most accurate, but pay-as-you-go.

Computes:
- Walking distance and time
- Tube/bus/Overground time including transfers (TfL Journey Planner)
- Cycling time (Santander / personal bike heuristic)
- Estimated taxi/driving time (off-peak)
- **Estimated monthly travel cost**: TfL fare zone + assumed 22 commute days/month, capped at TfL monthly cap for the relevant zones
- Tube zone of property
- Walk-to-nearest-station distance and station name

All commute results cached per address+destination for 30 days to control API spend.

### F. Comparison Table

Selectable from list (max 5 properties). Columns:

| Field | Show? |
|---|---|
| Photo (if available) | yes |
| Name + provider | yes |
| Weekly rent | yes |
| Monthly rent (computed) | yes |
| Bills included | yes (boolean + detail row) |
| Estimated monthly travel | yes |
| **Total estimated monthly cost** | yes (highlighted) |
| Commute time (best mode) | yes |
| Distance | yes |
| Room type | yes |
| Amenities (delta vs others) | yes |
| Deposit | yes |
| Contract length | yes |
| Cancellation | yes |
| Score | yes |
| Pros / cons | yes (auto-generated from delta) |
| Notes (user-editable) | yes |
| Source link | yes |

Best-in-row values highlighted green; worst-in-row red.

### G. Recommendation Engine

#### Default scoring formula

Score = weighted sum of normalised sub-scores, rounded to integer 0–100.

| Sub-score | Default weight | How it's computed |
|---|---|---|
| Affordability | 0.25 | `1 - clamp((monthly_rent - budget_min)/(budget_max - budget_min), 0, 1)` |
| Commute | 0.25 | `1 - clamp(commute_min / max_commute, 0, 1)` (using best mode within preferred modes) |
| Distance | 0.10 | `1 - clamp(distance_km / 10, 0, 1)` |
| Bills included | 0.10 | 1 if all-inclusive, 0.5 if partial, 0 if exclusive |
| Amenities | 0.10 | fraction of user-selected amenities present |
| Contract flexibility | 0.05 | 1 if cancellable + month-to-month-ish; 0.5 if 9–12 mo; 0 if >12 mo non-cancellable |
| Reviews | 0.10 | normalised rating (or neutral 0.5 if unknown — visibly marked) |
| Freshness | 0.05 | 1 if <7 days, 0.5 if 7–30, 0.2 if >30 |

The user can edit weights in a Settings panel; presets: "Cheapest", "Closest", "Balanced", "Lifestyle".

#### Tie-breakers
1. Lower total monthly cost.
2. Shorter commute.
3. Better cancellation policy.

#### Transparency
A "Why this score?" tooltip on each card itemises the contribution of every sub-score so users can sanity-check.

### H. Shortlist Feature

- Star icon on every card and in comparison view.
- Shortlist page lists starred properties with quick filters: All / Interested / Rejected / Pending.
- Per-property fields: status (Interested / Pending / Rejected), notes (free text), application status (Not started / Applied / Viewing booked / Offered / Declined / Accepted), tags.
- Persisted to browser **localStorage** (v1); optional Supabase sync if user opts in (v1.5).
- Export: CSV (full data), PDF (printable comparison sheet).

### I. Admin / Data Input for MVP

Three input modes, switchable per property:

1. **Paste URL**
   - We fetch via a serverless function (server-side, since CORS blocks browser fetch).
   - Parse JSON-LD, OpenGraph, schema.org RealEstateListing if present.
   - If parsing fails → open a "fill in the gaps" form prefilled with whatever was extracted.
2. **CSV upload**
   - Provide downloadable template (`template.csv`).
   - Validate on upload, show errors per row.
3. **Manual entry**
   - Single-page form with all property fields; address geocoded on save.

Properties are stored in Supabase (or localStorage-only in the simplest variant) and re-enriched with commute on first save.

---

## 6. Data Sources and Integrations

| Layer | Recommendation | Cost | Why |
|---|---|---|---|
| Hosting / frontend | Vercel | Free hobby tier | Zero-config Next.js, edge functions, env vars |
| Code repo | GitHub | Free | Personal repos free, CI/CD via Vercel auto-deploy |
| Database | Supabase (Postgres) | Free 500MB tier | Managed Postgres, row-level security, simple SDK |
| Maps | Mapbox primary, Google Maps fallback | Free up to 50k loads/mo | Cheaper than Google for our scale; nicer styling |
| Geocoding | Mapbox Geocoding API | Free up to 100k/mo | Bundled with maps |
| Distance / routing | OpenRouteService + TfL Open API | Free | London transit accuracy via TfL; ORS for walk/cycle |
| Search (future) | SerpAPI or Bing Search API | Pay-as-you-go (~$0.005/req) | Sanctioned access; only post-MVP |
| AI extraction (future) | OpenAI / Anthropic API | ~$0.001–$0.01/page | Only on user-pasted content |
| Auth (optional) | Supabase Auth | Free | Magic links if we ever need accounts |
| Analytics (optional) | Vercel Analytics or Plausible | Free / cheap | Privacy-friendly |

---

## 7. Data Model

Schemas below assume Supabase Postgres. `id` is `uuid` with default `gen_random_uuid()`. Timestamps `created_at` / `updated_at` are `timestamptz` with `now()` defaults.

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | text unique | optional, only if user signs in |
| display_name | text | |
| home_university_id | uuid FK → universities | preferred default |
| preferences | jsonb | weights, default filters |
| created_at, updated_at | timestamptz | |

### `universities`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | "Imperial College Business School" |
| city | text | "London" |
| address | text | |
| lat, lng | double | |
| created_at | timestamptz | |

Seeded with Imperial Business School (lat 51.4988, lng -0.1749), Imperial South Kensington main campus, etc.

### `providers`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | "GradPad", "Amber Student" |
| website | text | |
| logo_url | text | |
| reputation_notes | text | |

### `properties`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| provider_id | uuid FK → providers | nullable |
| source_url | text | |
| address | text | |
| postcode | text | |
| lat, lng | double | |
| weekly_rent_gbp | numeric | |
| monthly_rent_gbp | numeric | computed; stored for sort speed |
| bills_included | text | "all" / "partial" / "none" |
| bills_detail | jsonb | which bills |
| room_type | text | "studio" / "en-suite" / "shared" / "twin" / "flat" |
| deposit_gbp | numeric | |
| contract_length_months | int | |
| contract_start | date | |
| contract_end | date | |
| availability | text | "available" / "limited" / "waitlist" / "unknown" |
| cancellation_policy | text | |
| eligibility | text | |
| amenities | text[] | array of tags |
| rating | numeric | nullable |
| rating_source | text | |
| last_verified | timestamptz | |
| input_method | text | "url" / "csv" / "manual" |
| created_by | uuid FK → users | nullable |
| created_at, updated_at | timestamptz | |

### `commute_estimates`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| property_id | uuid FK | |
| destination_university_id | uuid FK | |
| mode | text | walk / transit / cycle / drive |
| duration_minutes | int | |
| distance_km | numeric | |
| monthly_cost_gbp | numeric | |
| zone | text | TfL zone of property |
| computed_at | timestamptz | for cache freshness |

Composite index on (property_id, destination_university_id, mode).

### `shortlists`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | nullable for anonymous |
| name | text | |
| created_at | timestamptz | |

### `shortlist_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| shortlist_id | uuid FK | |
| property_id | uuid FK | |
| status | text | interested / pending / rejected |
| application_status | text | applied / viewing_booked / offered / declined / accepted |
| notes | text | |
| tags | text[] | |
| added_at | timestamptz | |

### `reviews_notes`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| property_id | uuid FK | |
| user_id | uuid FK | nullable |
| rating | int | 1–5 |
| comment | text | |
| created_at | timestamptz | |

### `amenities` (controlled vocabulary)
| Column | Type | Notes |
|---|---|---|
| key | text PK | "gym", "laundry", "study_room", "social_space", "all_bills_included", "wifi", "24_7_security", "ensuite_bath" |
| label | text | |
| icon | text | lucide-icon name |

(In v1 you can keep amenities as a `text[]` on `properties` and skip a separate table.)

---

## 8. MVP Scope

The smallest useful version ships these and only these:

1. **Single anchor university**: Imperial College Business School, South Kensington (hard-coded; one-line change to add more).
2. **Setup form** with budget, room type, max commute, bills preference.
3. **Three input modes**: paste URL (best-effort extraction), CSV upload (template provided), manual form.
4. **Geocoding + commute calculation** for every property to Imperial Business School (walk + transit + cycle, monthly cost).
5. **List view** with sort by score / rent / commute / freshness, plus filters.
6. **Map view** with Imperial pin, property pins, distance rings.
7. **Comparison table** for up to 5 properties.
8. **Score with editable weights** (Cheapest / Closest / Balanced presets).
9. **Shortlist** persisted to localStorage; **CSV/PDF export**.
10. **Deployed to Vercel** under a personal subdomain.

**Out of MVP**: automated discovery, AI extraction, accounts, alerts, multiple universities, neighbourhood guides.

---

## 9. Future Scope

Listed in rough priority order:

1. **Search-API-driven discovery**: query SerpAPI/Bing for "studio near Imperial College London under £500" → return candidate URLs to enrich.
2. **AI extraction** of properties from a pasted URL (LLM reads page text and emits JSON conforming to our schema).
3. **Live availability re-check** (weekly job re-fetches the listing, flags status changes).
4. **Price tracking** with sparkline per property.
5. **Email / WhatsApp alerts** ("3 new properties under £450 within 25-min commute this week").
6. **Multi-university support** with university picker (LSE, LBS, UCL, KCL, etc.).
7. **Neighbourhood guides**: safety, supermarket density, nightlife, distance to nearest park/gym, with sources cited.
8. **Student review aggregation** from Reddit, Trustpilot, Google.
9. **Booking reminder timeline** (deposit deadlines, viewing dates, document checklist).
10. **Visa / intake-aware planning**: align tenancy with CAS letter / RQF dates.
11. **Mobile app** (React Native or PWA).

---

## 10. UX/UI Requirements

### Principles
- **Clean** — student-friendly, calm typography, low-clutter.
- **Decision-first** — the most important number on every card is *total monthly cost*, not headline rent.
- **Map-and-list parity** — desktop shows them side-by-side; mobile tabs.
- **No dark patterns** — no fake scarcity, no hidden bills. Bills-included status is always shown explicitly.
- **Mobile-responsive** breakpoints at 640 / 1024 / 1280.
- **Fast** — perceived load <1s on the list view; commute calculations happen async with placeholders.

### Pages (and key components)

1. **Landing** — value prop hero, "Get started" CTA, brief explainer (3 cards: enter prefs → add properties → compare scored shortlist). Footer: privacy & ToS note.
2. **Setup / Preferences** — single form, save state to localStorage, "Continue" button.
3. **Add Properties** — three tabs (URL / CSV / Manual); per-tab form; "Saved properties" list at the bottom.
4. **Results — List + Map** — split view (resizable on desktop, tabbed on mobile); filter rail; sort dropdown.
5. **Property Detail** — full card with all fields, embedded map, edit / delete buttons.
6. **Comparison** — table with up to 5 columns, removable; export buttons.
7. **Shortlist** — saved properties with status filters, notes editor, export buttons.
8. **Settings / Weights** — slider for each sub-score weight; presets; reset.
9. **Export** — preview pane + CSV/PDF download.

### Visual style
- Tailwind CSS, neutral palette (warm greys), single accent colour (Imperial-ish blue `#003E74` works).
- Inter or Geist for typography.
- Lucide icons.
- No gratuitous illustration; map carries visual weight.

---

## 11. Technical Architecture

### Stack
- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Maps:** Mapbox GL JS + Mapbox Geocoding (Google Maps fallback behind feature flag)
- **Routing/transit:** OpenRouteService (walk, cycle) + TfL Open API (London transit)
- **Database:** Supabase (Postgres) — optional in v1 (localStorage-first)
- **Auth:** Supabase Auth (magic link) — optional in v1
- **Server functions:** Next.js Route Handlers (Vercel Edge / Node runtime)
- **AI extraction (post-MVP):** OpenAI/Anthropic API behind a server route
- **Hosting:** Vercel (preview deploys from PRs, prod from `main`)
- **Repo:** GitHub

### Architecture diagram (text)

```
                   ┌─────────────────────┐
                   │      Browser        │
                   │  Next.js (App Router)
                   │  React + Tailwind    │
                   │  Mapbox GL           │
                   │  localStorage cache  │
                   └──────────┬──────────┘
                              │ HTTPS
                              ▼
            ┌───────────────────────────────────┐
            │  Vercel Edge / Serverless Routes  │
            │  /api/extract       (URL→JSON)    │
            │  /api/geocode       (addr→lat/lng)│
            │  /api/commute       (orig→dest)   │
            │  /api/properties    (CRUD)        │
            │  /api/export        (CSV / PDF)   │
            └────┬──────────┬───────────┬───────┘
                 │          │           │
                 ▼          ▼           ▼
          ┌──────────┐ ┌──────────┐ ┌──────────────┐
          │ Supabase │ │  Mapbox  │ │ ORS + TfL    │
          │ Postgres │ │ Geocode  │ │ routing/transit
          └──────────┘ └──────────┘ └──────────────┘
                              ▲
                              │ (post-MVP)
                              │
                       ┌──────┴───────┐
                       │ OpenAI / SerpAPI │
                       │ for auto-extract │
                       └──────────────┘
```

### Why this stack
- Next.js + Vercel = zero-friction deploy with free tier; route handlers cover all backend needs.
- Supabase replaces a self-hosted Postgres + auth + storage — the cheapest credible data layer.
- Mapbox + ORS + TfL give us a free, accurate London-specific routing stack without Google Maps billing surprises.
- Tailwind + shadcn/ui = professional UI in days, not weeks.

---

## 12. Important Constraints

- **Cost ceiling:** $0 in fixed monthly fees for v1. Pay-as-you-go API budget capped at £20/mo.
- **ToS-respecting:** No automated scraping of platforms whose ToS forbid it. User-submitted URLs only.
- **Freshness disclosure:** Every property card shows last-updated date and badge.
- **No availability guarantees:** All listings link out; we never claim a room is bookable.
- **Bills transparency:** Always show whether bills are included; never bury this.
- **Time-boxed:** MVP must be deployable within 6 weeks of start.
- **Personal-first:** This is a personal tool; we're not building for scale on day one.

---

## 13. Success Metrics

| Metric | Target (Personal MVP) | How measured |
|---|---|---|
| Time to first shortlist | <60 minutes from landing | Self-reported |
| Time saved vs manual | ≥10× | Compared to spreadsheet baseline |
| Properties compared per session | ≥10 | Frontend event |
| Shortlist size at decision | 3–7 | Final shortlist |
| Commute estimate accuracy | ±10% vs Google Maps live | Spot-check 10 properties |
| Export usage | ≥1 export per week of active use | Frontend event |
| User confidence (1–5) | ≥4 at decision time | Self-rated |
| Cost of running for 6 mo | <£50 total | Vercel + API bills |

---

## 14. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Scraping triggers ToS / IP blocks | Medium | High (forces redesign) | User-submitted URLs and CSV-first; no automated scraping in v1 |
| Listing prices/availability go stale | High | Medium | Show last-updated badge; freshness affects score; one-click re-check |
| Commute API quota exceeded / cost runaway | Medium | Medium | Cache for 30 days; rate-limit on user side; daily quota alarms |
| Extraction failures on pasted URLs | High | Low | Always offer manual form fallback prefilled with what we got |
| Geocoding ambiguity ("Kensington" vs "South Kensington") | Medium | Medium | Show map preview during entry; require user to confirm pin |
| Travel cost wrong (e.g., misjudged Tube zone) | Medium | Medium | Surface assumed zone and fare; let user override |
| Scams / fraudulent listings | Low (we don't book) | High (user trust) | Always link to source; provider reputation tags; warning if listing has no provider |
| User loses localStorage data | Medium | High | Prompt to export CSV after 3+ shortlisted; offer Supabase sync |
| Mapbox/Google free tier exceeded | Low at personal scale | Medium | Cache aggressively; soft-degrade map to static tiles |
| Single-user app accidentally goes viral | Low | Medium | Add waitlist gating if traffic spikes; rate-limit API routes |

---

## 15. Build Plan

| Phase | Duration | Deliverables |
|---|---|---|
| **1. PRD & wireframes** | 3 days | This PRD signed off; low-fi wireframes (Figma or hand-drawn) for all 9 pages |
| **2. Data model & frontend prototype** | 4 days | Next.js app skeleton; Tailwind setup; Supabase schema; routes scaffolded; Imperial seeded |
| **3. Manual property input + CSV upload** | 5 days | Manual form, CSV uploader with template, property list view, edit/delete |
| **4. Map + commute calculator** | 6 days | Mapbox integration; geocoding; ORS + TfL routing; commute caching; map view UI |
| **5. Comparison + scoring** | 4 days | Comparison table; scoring engine; weight-editor settings panel; sub-score tooltip |
| **6. Shortlist + export** | 3 days | Star/save flow; shortlist page; CSV export; PDF export (server route via puppeteer or react-pdf) |
| **7. Deployment & polish** | 3 days | Vercel deploy; custom domain; error states; analytics; 404 / empty / loading polish |
| **8. Optional: URL extract** | 5 days | `/api/extract` route; JSON-LD/OG parser; AI fallback (gated, opt-in) |

**Total MVP: phases 1–7 ≈ 28 working days (~5–6 weeks part-time).**

---

## 16. Output Artifacts

### 16.1 Feature List (MVP-tagged)

- [MVP] Setup form with persistence
- [MVP] Property URL input (best-effort extraction)
- [MVP] CSV upload with template
- [MVP] Manual property entry form
- [MVP] Geocoding
- [MVP] Commute calculator (walk/transit/cycle, monthly cost)
- [MVP] List view with sort + filter
- [MVP] Map view with Imperial pin, property pins, distance rings
- [MVP] Property detail page
- [MVP] Comparison table (up to 5)
- [MVP] Recommendation score + editable weights
- [MVP] Presets: Cheapest, Closest, Balanced, Lifestyle
- [MVP] Shortlist with status + notes
- [MVP] CSV export
- [MVP] PDF export
- [MVP] Deploy to Vercel
- [v1.5] AI extraction from pasted URL
- [v1.5] Search-API-driven discovery
- [v1.5] Supabase auth + cloud sync
- [v2] Live availability re-check
- [v2] Price tracking
- [v2] Email / WhatsApp alerts
- [v2] Multi-university
- [v2] Neighbourhood guides
- [v2] Review aggregation

### 16.2 User Stories (MVP)

- **US-01** — *As a student* I want to enter my budget and university *so that* properties are filtered and scored against my actual constraints.
- **US-02** — *As a student* I want to paste a listing URL *so that* I don't have to retype data I already see in my browser.
- **US-03** — *As a student* I want to upload a CSV of properties I already collected *so that* my existing spreadsheet research isn't wasted.
- **US-04** — *As a student* I want to see commute time and cost to Imperial Business School for every property *so that* I can compare them on a like-for-like basis.
- **US-05** — *As a student* I want to view properties on a map with Imperial pinned *so that* I can spot clusters in nearby neighbourhoods.
- **US-06** — *As a student* I want to compare up to five properties side-by-side *so that* I can see which beats which on each dimension.
- **US-07** — *As a student* I want a single 0–100 score per property *so that* I have a quick rank at a glance.
- **US-08** — *As a student* I want to adjust the weights of the scoring formula *so that* the ranking matches my personal priorities.
- **US-09** — *As a student* I want to star and shortlist properties *so that* I can return to my final candidates.
- **US-10** — *As a student* I want to export my shortlist as CSV/PDF *so that* I can share with family or a roommate.
- **US-11** — *As a student* I want each property to show its last-updated date *so that* I don't trust stale prices.
- **US-12** — *As a student* I want my shortlist to persist between visits *so that* I don't lose my work.

### 16.3 Acceptance Criteria (sample, MVP)

**US-04 — Commute time and cost**
- Given I have a property with a valid London address,
- When the property is saved,
- Then the system calculates walk, transit, and cycle time + estimated monthly TfL cost to Imperial Business School,
- And the values are cached for 30 days,
- And the property card displays all three modes with the fastest one highlighted,
- And freshness >30 days re-triggers a calculation on next view.

**US-06 — Side-by-side comparison**
- Given I have starred at least 2 and at most 5 properties,
- When I open the Comparison page,
- Then I see all selected properties as columns,
- And every comparable field is a row,
- And the best value per row is highlighted green,
- And the worst is highlighted red,
- And I can remove a property from comparison without affecting my shortlist.

**US-08 — Editable weights**
- Given I am on the Settings panel,
- When I change a sub-score weight,
- Then property scores are recomputed live without page reload,
- And the new ranking is reflected in the list view immediately,
- And weights are persisted to localStorage.

(Full acceptance criteria for every user story to be filled out at start of Phase 2.)

### 16.4 API Requirements

Internal routes (Next.js Route Handlers):

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/properties` | Create / update a property (manual or extracted) |
| GET | `/api/properties` | List user's properties |
| DELETE | `/api/properties/:id` | Remove |
| POST | `/api/properties/upload-csv` | Bulk-create from CSV |
| POST | `/api/extract` | Best-effort URL→property JSON (v1: JSON-LD/OG only) |
| POST | `/api/geocode` | Address → lat/lng + postcode |
| POST | `/api/commute` | Origin lat/lng → destination → modes → time + cost |
| GET | `/api/shortlist` | Read shortlist |
| POST | `/api/shortlist` | Add / update item |
| GET | `/api/export?format=csv\|pdf` | Stream export |

External APIs:

| Service | Calls | Auth |
|---|---|---|
| Mapbox Geocoding | `/geocoding/v5` | API key (env) |
| Mapbox Tiles | static + GL JS | API key |
| OpenRouteService | `/v2/directions/{profile}` | API key |
| TfL Journey Planner | `/Journey/JourneyResults` | App key |

### 16.5 MVP Backlog (ordered)

1. Repo init + Next.js + Tailwind + shadcn/ui + ESLint/Prettier
2. Supabase project + schema migration + seed Imperial Business School
3. Setup/Preferences page + localStorage persistence
4. Manual property form + Supabase save + list view (no scoring yet)
5. CSV upload + template + parsing + validation
6. Mapbox map + Imperial pin + property pins
7. Geocoding integration on property save
8. ORS + TfL commute calculation + caching
9. Sort + filters + property detail page
10. Scoring engine + weight editor + presets
11. Comparison page (≤5 selectable)
12. Shortlist + status + notes
13. CSV export + PDF export
14. Empty / error / loading states + 404
15. Vercel deploy + env vars + custom domain
16. Smoke-test with 20 real Imperial-area listings
17. (Stretch) URL `/api/extract` with JSON-LD/OG parsing

### 16.6 Recommended Implementation Plan

- Build phases 2–7 strictly sequentially; do not start phase 4 (map) before phase 3 (data) feels solid, or you'll hard-code addresses.
- Cache aggressively from day one; rate-limit at the route level so a runaway loop can't burn API credits.
- Seed 20 real Imperial-area properties early — this is your only test data, and you'll need it to feel where the UI hurts.
- Keep all secrets in Vercel env vars; never commit keys.
- Branch per phase; merge with a Vercel preview review.
- Don't add auth until you actually need cross-device sync. localStorage is enough for v1.

### 16.7 Deployment Instructions (GitHub → Vercel)

```bash
# 1. Initialise repo
mkdir nestnear && cd nestnear
npx create-next-app@latest . --typescript --tailwind --app --eslint
git init && git add -A && git commit -m "init"

# 2. Push to GitHub
gh repo create cordialfir/nestnear --public --source=. --push
# (or via the GitHub web UI + git remote add origin ... && git push -u origin main)

# 3. Connect to Vercel
# - Sign in to vercel.com with GitHub
# - "Add New Project" → import the nestnear repo
# - Framework: Next.js (auto-detected)
# - Set environment variables:
#     NEXT_PUBLIC_MAPBOX_TOKEN=...
#     SUPABASE_URL=...
#     SUPABASE_ANON_KEY=...
#     SUPABASE_SERVICE_ROLE_KEY=...   (server-only, used in route handlers)
#     ORS_API_KEY=...
#     TFL_APP_KEY=...
# - Deploy.

# 4. Custom domain (optional)
# - In Vercel project settings → Domains, add nestnear.app (or a subdomain you own)
# - Vercel issues an SSL cert automatically.

# 5. CI is implicit — every PR gets a preview URL; main deploys to prod.
```

GitHub Pages alternative (static-only fallback): not recommended because we need server routes (`/api/*`) for geocoding, commute, and extract. If we ever make a fully client-side variant (with API keys exposed via proxies), GitHub Pages becomes viable, but Vercel is the better default.

---

## Sign-off

This PRD is intentionally over-specified for a personal MVP because writing it out has been the cheapest way to find the gaps. Anything tagged `[MVP]` is committed; anything `[v1.5]` or `[v2]` is parked.

**Open questions for you to decide before I write any code:**
1. Are you OK with starting **localStorage-only** (no Supabase, no auth) and adding cloud sync later? It cuts a week off the build.
2. **Mapbox vs Google Maps** — Mapbox is cheaper and prettier; Google Maps is more accurate for transit. Default: Mapbox + TfL.
3. **Naming** — happy with `NestNear`, or prefer something else? Affects domain and repo name.
4. **Deploy target** — Vercel (recommended) or Netlify? Both are equally easy.
5. **Scope check** — anything in the [MVP] list you want to drop to ship faster? Anything in [v1.5] you want to pull forward?
6. **Repo visibility** — public or private GitHub repo?
7. **Domain** — do you already own a domain you want to use, or should we use a `vercel.app` subdomain to start?

Once you answer those, I'll proceed with code.
