"use client";

import type { CSSProperties, ReactNode } from "react";
import { ns } from "@/lib/theme";
import { PROVIDERS } from "@/lib/data";
import type { ProviderKey } from "@/lib/types";

type Tone = "sage" | "clay" | "ink" | "line" | "good" | "warn" | "bad";

export function Pill({
  children,
  tone = "sage",
  size = "sm",
}: {
  children: ReactNode;
  tone?: Tone;
  size?: "sm" | "md";
}) {
  const tones: Record<Tone, { bg: string; fg: string; border?: string }> = {
    sage: { bg: "#e3e7dd", fg: "#3a4a3f" },
    clay: { bg: "#f3e2d2", fg: "#7a4a2a" },
    ink: { bg: "#1c1f1d", fg: "#eef0ec" },
    line: { bg: "transparent", fg: "#3f4640", border: "1px solid #d4d8cf" },
    good: { bg: "#e0e8d6", fg: "#3a5a2a" },
    warn: { bg: "#f3e6c8", fg: "#6a4a18" },
    bad: { bg: "#f0d8d2", fg: "#7a2a1a" },
  };
  const t = tones[tone] ?? tones.sage;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: size === "sm" ? "3px 9px" : "5px 11px",
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 500,
        letterSpacing: "0.01em",
        border: t.border ?? "none",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

type BtnVariant = "primary" | "ghost" | "soft" | "ink" | "danger";

export function Btn({
  children,
  variant = "primary",
  size = "md",
  onClick,
  style = {},
  type = "button",
}: {
  children: ReactNode;
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
}) {
  const variants: Record<BtnVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: ns.primary, fg: "#f4f6f0", border: "none" },
    ghost: { bg: "transparent", fg: ns.ink, border: `1px solid ${ns.line}` },
    soft: { bg: "#e3e7dd", fg: ns.primary, border: "none" },
    ink: { bg: ns.ink, fg: "#eef0ec", border: "none" },
    danger: { bg: "transparent", fg: ns.bad, border: `1px solid ${ns.line}` },
  };
  const v = variants[variant];
  const sz =
    size === "sm"
      ? { p: "7px 12px", fs: 12 }
      : size === "lg"
        ? { p: "13px 22px", fs: 14 }
        : { p: "10px 16px", fs: 13 };
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: sz.p,
        fontSize: sz.fs,
        fontWeight: 500,
        background: v.bg,
        color: v.fg,
        border: v.border,
        borderRadius: 8,
        cursor: "pointer",
        letterSpacing: "0.01em",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "inherit",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

const baseSvg = (s: number, children: ReactNode) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
  >
    {children}
  </svg>
);

export const Icon = {
  search: (s = 14) =>
    baseSvg(
      s,
      <>
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3 3" />
      </>,
    ),
  star: (filled: boolean, s = 14) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 16 16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    >
      <path d="M8 1.8l1.92 4.05 4.4.55-3.24 3.05.85 4.36L8 11.7 4.07 13.8l.85-4.36L1.68 6.4l4.4-.55z" />
    </svg>
  ),
  walk: (s = 14) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <circle cx="9" cy="2.7" r="1.2" />
      <path d="M9 5l-2.5 3 1.5 2 .5 3M11.5 9l-2-1.5M5 8l-1.5 2.5M9.5 13l1.5-1" />
    </svg>
  ),
  tube: (s = 14) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <rect x="3" y="2.5" width="10" height="9" rx="2.5" />
      <path d="M3.5 8.5h9M5.5 13.5l-1 1.5M10.5 13.5l1 1.5" />
      <circle cx="6" cy="10" r=".6" fill="currentColor" />
      <circle cx="10" cy="10" r=".6" fill="currentColor" />
    </svg>
  ),
  cycle: (s = 14) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <circle cx="3.5" cy="11" r="2.3" />
      <circle cx="12.5" cy="11" r="2.3" />
      <path d="M6 11l2.5-5h2M8.5 6l3.5 5M5.5 6h2.5" />
    </svg>
  ),
  pin: (s = 14) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 1 0-9 0C3.5 9.8 8 14 8 14z" />
      <circle cx="8" cy="6.5" r="1.6" />
    </svg>
  ),
  check: (s = 12) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2.5 6.2 2.5 2.3 4.5-5" />
    </svg>
  ),
  arrow: (s = 12) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M2.5 6h7M6.5 3l3 3-3 3" />
    </svg>
  ),
  close: (s = 12) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="m3 3 6 6M9 3l-6 6" />
    </svg>
  ),
  ext: (s = 11) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M5 3H3v6h6V7M7 3h2v2M9 3l-4 4" />
    </svg>
  ),
  sliders: (s = 14) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M2 4h7M11 4h3M2 12h3M7 12h7" />
      <circle cx="10" cy="4" r="1.4" />
      <circle cx="6" cy="12" r="1.4" />
    </svg>
  ),
};

export function ScoreRing({
  score,
  size = 56,
  label = true,
}: {
  score: number;
  size?: number;
  label?: boolean;
}) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const off = c * (1 - score / 100);
  const tone = score >= 75 ? ns.good : score >= 55 ? ns.warn : ns.bad;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e6e9e2"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .35s" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: size * 0.32,
            fontWeight: 600,
            color: ns.ink,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {score}
        </div>
        {label && (
          <div
            style={{
              fontSize: 8,
              color: ns.ink3,
              letterSpacing: "0.1em",
              marginTop: 1,
            }}
          >
            SCORE
          </div>
        )}
      </div>
    </div>
  );
}

export function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function PhotoPlaceholder({
  w,
  h,
  seed = 0,
  label,
}: {
  w: number;
  h: number;
  seed?: number;
  label?: string;
}) {
  const tones: [string, string][] = [
    ["#dde2d6", "#cfd5c8"],
    ["#d6dccf", "#c8cfc1"],
    ["#e0e3da", "#d2d6cb"],
    ["#d8ddd1", "#cad0c2"],
  ];
  const safeSeed = Number.isFinite(seed) ? Math.abs(seed) : 0;
  const t = tones[safeSeed % tones.length];
  // Stable id from seed + label so SSR and client agree.
  const id = `ph-${seed}-${label ?? "x"}`.replace(/\s+/g, "-");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: "block", borderRadius: "inherit" }}
    >
      <defs>
        <pattern
          id={id}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <rect width="14" height="14" fill={t[0]} />
          <rect width="7" height="14" fill={t[1]} />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
      {label && (
        <text
          x={w / 2}
          y={h / 2 + 3}
          textAnchor="middle"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize="10"
          fill="rgba(28,31,29,.45)"
          letterSpacing="0.12em"
        >
          {label}
        </text>
      )}
    </svg>
  );
}

export function FreshnessDot({ days }: { days: number }) {
  const t = days < 7 ? ns.good : days < 30 ? ns.warn : ns.bad;
  return (
    <span
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: t,
        marginRight: 6,
      }}
    />
  );
}

export function ProviderBadge({ provider }: { provider: ProviderKey }) {
  const p = PROVIDERS[provider];
  if (!p) return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        color: ns.ink2,
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: p.tone,
          color: "#f4f6f0",
          display: "grid",
          placeItems: "center",
          fontSize: 8,
          fontWeight: 600,
          letterSpacing: "0.04em",
        }}
      >
        {p.name[0]}
      </span>
      {p.name}
    </span>
  );
}

export function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M14 4 L24 12 V23 H4 V12 Z"
        stroke={ns.primary}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="16" r="3" fill={ns.primary} />
    </svg>
  );
}
