"use client";

import { ns } from "@/lib/theme";
import { AMENITY_LABEL } from "@/lib/data";
import type { Property, ScoredResult } from "@/lib/types";
import {
  FreshnessDot,
  hashSeed,
  Icon,
  PhotoPlaceholder,
  Pill,
  ProviderBadge,
  ScoreRing,
} from "./ui";

interface Props {
  p: Property;
  scored: ScoredResult;
  starred: boolean;
  inCompare: boolean;
  onStar: () => void;
  onCompare: () => void;
  onOpen: () => void;
}

export function PropertyCard({
  p,
  scored,
  starred,
  onStar,
  onOpen,
  onCompare,
  inCompare,
}: Props) {
  const monthly = p.weekly != null ? Math.round(scored.monthly) : null;
  const total = monthly != null ? monthly + (p.travelMonthly ?? 0) : null;
  return (
    <div
      onClick={onOpen}
      style={{
        background: ns.card,
        border: `1px solid ${ns.line}`,
        borderRadius: 14,
        padding: 16,
        display: "grid",
        gridTemplateColumns: "120px 1fr auto",
        gap: 16,
        cursor: "pointer",
        transition: "border-color .15s, transform .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = ns.primary + "55";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = ns.line;
      }}
    >
      <div
        style={{
          width: 120,
          height: 110,
          borderRadius: 10,
          overflow: "hidden",
          background: ns.line2,
        }}
      >
        <PhotoPlaceholder w={120} h={110} seed={hashSeed(p.id)} />
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <h3
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: ns.ink,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {p.name}
          </h3>
          {p.roomType && (
            <span style={{ fontSize: 11, color: ns.ink3 }}>{p.roomType}</span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
            fontSize: 12,
            color: ns.ink3,
          }}
        >
          <ProviderBadge provider={p.provider} />
          <span>·</span>
          {p.address && (
            <>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                {Icon.pin(11)} {p.address}
              </span>
              <span>·</span>
            </>
          )}
          {p.lastUpdated != null && (
            <span>
              <FreshnessDot days={p.lastUpdated} />
              {p.lastUpdated}d ago
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 18,
            fontSize: 12,
            color: ns.ink2,
            marginBottom: 10,
          }}
        >
          {p.walk != null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              {Icon.walk()}{" "}
              <b style={{ color: ns.ink, fontWeight: 600 }}>{p.walk}</b> min
            </span>
          )}
          {p.tube != null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              {Icon.tube()}{" "}
              <b style={{ color: ns.ink, fontWeight: 600 }}>{p.tube}</b> min
            </span>
          )}
          {p.cycle != null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              {Icon.cycle()}{" "}
              <b style={{ color: ns.ink, fontWeight: 600 }}>{p.cycle}</b> min
            </span>
          )}
          {p.zone && (
            <span style={{ color: ns.ink3 }}>· Zone {p.zone}</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {p.billsIncluded !== "unknown" && (
            <Pill
              tone={
                p.billsIncluded === "all"
                  ? "good"
                  : p.billsIncluded === "partial"
                    ? "warn"
                    : "bad"
              }
            >
              Bills{" "}
              {p.billsIncluded === "all"
                ? "included"
                : p.billsIncluded === "partial"
                  ? "partial"
                  : "excluded"}
            </Pill>
          )}
          {p.amenities.slice(0, 4).map((a) => (
            <Pill key={a} tone="line">
              {AMENITY_LABEL[a]}
            </Pill>
          ))}
          {p.amenities.length > 4 && (
            <Pill tone="line">+{p.amenities.length - 4}</Pill>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompare();
            }}
            style={{
              background: inCompare ? ns.primary : "transparent",
              color: inCompare ? "#f4f6f0" : ns.ink2,
              border: `1px solid ${inCompare ? ns.primary : ns.line}`,
              padding: "5px 10px",
              borderRadius: 7,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {inCompare ? "✓ Compare" : "+ Compare"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStar();
            }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: starred ? ns.clay : ns.ink3,
              padding: 4,
              display: "flex",
            }}
          >
            {Icon.star(starred, 18)}
          </button>
        </div>

        <div style={{ textAlign: "right" }}>
          {p.weekly != null ? (
            <>
              <div
                style={{ fontSize: 11, color: ns.ink3, letterSpacing: "0.04em" }}
              >
                £{p.weekly}
                {p.weeklyHigh != null && p.weeklyHigh !== p.weekly
                  ? `–£${p.weeklyHigh}`
                  : ""}
                /wk
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: ns.ink,
                  letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                £{(total ?? 0).toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: ns.ink3,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {p.travelMonthly != null ? "Total/month" : "Rent/month"}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 22, color: ns.ink3, fontWeight: 500 }}>
                Price on request
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: ns.ink3,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginTop: 4,
                }}
              >
                Visit source
              </div>
            </>
          )}
        </div>
        <ScoreRing score={scored.score} size={50} />
      </div>
    </div>
  );
}
