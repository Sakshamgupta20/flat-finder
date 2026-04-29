export type ProviderKey =
  | "gradpad"
  | "unite"
  | "scape"
  | "chapter"
  | "iq"
  | "amber"
  | "imperial"
  | "host"
  | (string & {});

export type AmenityKey =
  | "wifi"
  | "laundry"
  | "gym"
  | "study"
  | "social"
  | "security"
  | "cinema"
  | "bike_storage"
  | "parking"
  | "all_bills";

export type BillsIncluded = "all" | "partial" | "none" | "unknown";

export type Availability = "available" | "limited" | "waitlist" | "unknown";

export type RoomType = "Studio" | "En-suite" | "Shared flat" | "Twin" | "Flat";

export interface Property {
  id: string;
  name: string;
  provider: ProviderKey;
  address: string | null;
  postcode: string | null;
  /** Lowest known weekly price in GBP. Null when no source provided one. */
  weekly: number | null;
  weeklyHigh: number | null;
  billsIncluded: BillsIncluded;
  roomType: RoomType | null;
  deposit: number | null;
  depositHigh: number | null;
  /** None of the scrapers expose contract length yet. */
  contractMonths: number | null;
  contract: string | null;
  cancellation: string | null;
  paymentPlan: string | null;
  availability: Availability;
  eligibility: string | null;
  amenities: AmenityKey[];
  rating: number | null;
  ratingSrc: string | null;
  lastUpdated: number | null;
  /** Stylized SVG map x/y on a 1000x680 canvas. */
  mapX: number;
  mapY: number;
  /** Walking minutes to the source's reference destination (amber: central London). */
  walk: number | null;
  /** Transit minutes (tube/bus) to the same destination. */
  tube: number | null;
  /** No source provides cycle minutes; always null until we wire a routing API. */
  cycle: number | null;
  /** Single-leg transit fare in GBP, when reported. */
  transitFare: number | null;
  /** Estimated monthly travel cost; null when we don't know the fare. */
  travelMonthly: number | null;
  zone: string | null;
  station: string | null;
  notes: string;
  /** Featured image (cover). Null when no source provided one. */
  image: string | null;
  /** Full gallery, featured first. May be empty. */
  images: string[];
  /** Sources this property was matched against (after dedup). */
  sources: string[];
  appearances: Array<{
    source: string;
    id: string;
    name: string | null;
    url: string | null;
    price_value: number | null;
    price_currency: string | null;
    price_period: string | null;
  }>;
  sourceUrl?: string;
}

export interface Preferences {
  budgetMin: number;
  budgetMax: number;
  maxCommute: number;
  modes: ("walk" | "tube" | "cycle")[];
  bills: "required" | "preferred" | "any";
  roomTypes: RoomType[];
}

export interface Weights {
  affordability: number;
  commute: number;
  distance: number;
  bills: number;
  amenities: number;
  flexibility: number;
  reviews: number;
  freshness: number;
}

export interface SubScores {
  affordability: number;
  commute: number;
  distance: number;
  bills: number;
  amenities: number;
  flexibility: number;
  reviews: number;
  freshness: number;
}

export interface ScoredResult {
  score: number;
  subs: SubScores;
  monthly: number;
  bestMode: number;
  km: number;
}

export interface ShortlistEntry {
  status?: "interested" | "pending" | "rejected";
  application?: "none" | "applied" | "viewing" | "offered" | "accepted";
  notes?: string;
}

export interface AppState {
  prefs: Preferences;
  weights: Weights;
  starred: string[];
  compare: string[];
  sort: "score" | "rent" | "commute";
  mapStyle: "light" | "muted" | "dark";
  settingsOpen: boolean;
  shortlistStatus: Record<string, ShortlistEntry>;
}

export interface ProviderInfo {
  name: string;
  tone: string;
}
