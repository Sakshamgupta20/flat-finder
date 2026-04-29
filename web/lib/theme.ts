// NestNear design tokens — keep in sync with globals.css :root.
export const ns = {
  bg: "#eef0ec",
  card: "#ffffff",
  ink: "#1c1f1d",
  ink2: "#3f4640",
  ink3: "#6b7268",
  line: "#dfe2dc",
  line2: "#e8eae4",
  primary: "#3a4a3f",
  primaryDark: "#2a3a30",
  sage: "#b8c2b0",
  sageMuted: "#d8ddd2",
  clay: "#c9885a",
  clayMuted: "#e8c9b0",
  good: "#5a7a4a",
  warn: "#b88a3a",
  bad: "#a84e3a",
} as const;

export type NsTheme = typeof ns;
