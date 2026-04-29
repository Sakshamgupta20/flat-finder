import type {
  AmenityKey,
  AppState,
  Preferences,
  ProviderInfo,
  ProviderKey,
  Weights,
} from "./types";
import { REAL_PROPERTIES } from "./listings";

export const PROVIDERS: Record<ProviderKey, ProviderInfo> = {
  gradpad: { name: "GradPad", tone: "#2f4a3a" },
  unite: { name: "Unite Students", tone: "#5a6b4a" },
  scape: { name: "Scape", tone: "#3f5247" },
  chapter: { name: "Chapter", tone: "#4a3f2e" },
  iq: { name: "iQ", tone: "#3a4a3f" },
  amber: { name: "Amber", tone: "#7a5a3f" },
  imperial: { name: "Imperial Halls", tone: "#1c1f1d" },
  host: { name: "Host", tone: "#5a4a3a" },
};

// Imperial Business School ≈ 51.4988, -0.1749 (South Kensington).
// Properties are positioned on a 1000×680 stylized SVG map; Imperial centered.
export const IMPERIAL = {
  x: 500,
  y: 340,
  name: "Imperial Business School",
  address: "South Kensington, SW7 2AZ",
};

export const PROPERTIES = REAL_PROPERTIES;


export const AMENITY_LABEL: Record<AmenityKey, string> = {
  wifi: "Wi-Fi",
  laundry: "Laundry",
  gym: "Gym",
  study: "Study room",
  social: "Social space",
  security: "24/7 security",
  cinema: "Cinema",
  bike_storage: "Bike storage",
  parking: "Parking",
  all_bills: "Bills included",
};

export const DEFAULT_PREFS: Preferences = {
  budgetMin: 320,
  budgetMax: 500,
  maxCommute: 30,
  modes: ["walk", "tube", "cycle"],
  bills: "preferred",
  roomTypes: ["Studio", "En-suite", "Shared flat"],
};

export const DEFAULT_WEIGHTS: Weights = {
  affordability: 0.25,
  commute: 0.25,
  distance: 0.1,
  bills: 0.1,
  amenities: 0.1,
  flexibility: 0.05,
  reviews: 0.1,
  freshness: 0.05,
};

export const PRESETS: Record<string, Weights> = {
  Balanced: DEFAULT_WEIGHTS,
  Cheapest: {
    affordability: 0.45,
    commute: 0.15,
    distance: 0.05,
    bills: 0.15,
    amenities: 0.05,
    flexibility: 0.05,
    reviews: 0.05,
    freshness: 0.05,
  },
  Closest: {
    affordability: 0.1,
    commute: 0.45,
    distance: 0.2,
    bills: 0.05,
    amenities: 0.05,
    flexibility: 0.05,
    reviews: 0.05,
    freshness: 0.05,
  },
  Lifestyle: {
    affordability: 0.1,
    commute: 0.15,
    distance: 0.05,
    bills: 0.1,
    amenities: 0.3,
    flexibility: 0.05,
    reviews: 0.2,
    freshness: 0.05,
  },
};

export const DEFAULT_APP_STATE: AppState = {
  prefs: DEFAULT_PREFS,
  weights: DEFAULT_WEIGHTS,
  starred: [],
  compare: [],
  sort: "score",
  mapStyle: "light",
  settingsOpen: false,
  shortlistStatus: {},
};
