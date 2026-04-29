"use client";

import { ns } from "@/lib/theme";
import { PROPERTIES, PROVIDERS } from "@/lib/data";
import { scoreProperty } from "@/lib/scoring";
import { useAppState } from "@/lib/state";
import {
  Btn,
  hashSeed,
  Icon,
  PhotoPlaceholder,
  ScoreRing,
} from "@/components/ui";
import { BackHeader } from "@/components/BackHeader";
import type { ScoredResult } from "@/lib/types";

interface Row {
  label: string;
  vals: (string | number | null)[];
  nums?: (number | null)[];
  lower?: boolean;
  big?: boolean;
  suffix?: string;
}

const DASH = "—";

function fmtPrice(v: number | null, suffix = ""): string {
  return v == null ? DASH : `£${v.toLocaleString()}${suffix}`;
}

function fmtMins(v: number | null): string {
  return v == null ? DASH : `${v} min`;
}

function fmtKm(v: number | null): string {
  return v == null ? DASH : `${v.toFixed(1)} km`;
}

export default function ComparePage() {
  const { state, setState } = useAppState();
  const ids = state.compare.length
    ? state.compare
    : PROPERTIES.slice(0, 4).map((p) => p.id);
  const props = ids
    .map((id) => PROPERTIES.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const scoredById: Record<string, ScoredResult> = Object.fromEntries(
    props.map((p) => [p.id, scoreProperty(p, state.prefs, state.weights)]),
  );

  const totals: (number | null)[] = props.map((p) => {
    if (p.weekly == null) return null;
    return Math.round(scoredById[p.id].monthly) + (p.travelMonthly ?? 0);
  });

  const bestVal = (
    vals: (number | null)[],
    lowerBetter = true,
  ): [number | null, number | null] => {
    const filtered = vals.filter((v): v is number => typeof v === "number");
    if (!filtered.length) return [null, null];
    return lowerBetter
      ? [Math.min(...filtered), Math.max(...filtered)]
      : [Math.max(...filtered), Math.min(...filtered)];
  };

  const billsOrder: Record<string, number | null> = {
    all: 2,
    partial: 1,
    none: 0,
    unknown: null,
  };

  const rows: Row[] = [
    {
      label: "Total / month",
      vals: totals.map((v) => fmtPrice(v)),
      nums: totals,
      lower: true,
      big: true,
    },
    {
      label: "Weekly rent",
      vals: props.map((p) => fmtPrice(p.weekly)),
      nums: props.map((p) => p.weekly),
      lower: true,
    },
    {
      label: "Bills",
      vals: props.map((p) =>
        p.billsIncluded === "all"
          ? "Inclusive"
          : p.billsIncluded === "partial"
            ? "Partial"
            : p.billsIncluded === "none"
              ? "Excluded"
              : DASH,
      ),
      nums: props.map((p) => billsOrder[p.billsIncluded] ?? null),
      lower: false,
    },
    {
      label: "Travel cost",
      vals: props.map((p) =>
        p.travelMonthly == null
          ? DASH
          : p.travelMonthly === 0
            ? "Free"
            : `£${p.travelMonthly}/mo`,
      ),
      nums: props.map((p) => p.travelMonthly),
      lower: true,
    },
    {
      label: "Best commute",
      vals: props.map((p) => fmtMins(scoredById[p.id].bestMode || null)),
      nums: props.map((p) => scoredById[p.id].bestMode || null),
      lower: true,
    },
    {
      label: "Distance",
      vals: props.map((p) => fmtKm(scoredById[p.id].km)),
      nums: props.map((p) => scoredById[p.id].km),
      lower: true,
    },
    {
      label: "Tube zone",
      vals: props.map((p) => p.zone ?? DASH),
      nums: props.map((p) => (p.zone ? parseInt(p.zone) : null)),
      lower: true,
    },
    { label: "Room type", vals: props.map((p) => p.roomType ?? DASH) },
    {
      label: "Amenities",
      vals: props.map((p) => (p.amenities.length ? p.amenities.length : DASH)),
      nums: props.map((p) => (p.amenities.length ? p.amenities.length : null)),
      lower: false,
    },
    {
      label: "Deposit",
      vals: props.map((p) => fmtPrice(p.deposit)),
      nums: props.map((p) => p.deposit),
      lower: true,
    },
    {
      label: "Contract",
      vals: props.map((p) =>
        p.contractMonths == null ? DASH : `${p.contractMonths} mo`,
      ),
      nums: props.map((p) => p.contractMonths),
      lower: true,
    },
    {
      label: "Cancellation",
      vals: props.map((p) => p.cancellation ?? DASH),
    },
    {
      label: "Rating",
      vals: props.map((p) => (p.rating == null ? DASH : `${p.rating}/5`)),
      nums: props.map((p) => p.rating),
      lower: false,
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: ns.bg,
        color: ns.ink,
      }}
    >
      <BackHeader
        title={`Side by side · ${props.length} properties`}
        backHref="/results"
        backLabel="Back"
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" size="sm">
              Export CSV
            </Btn>
            <Btn variant="ink" size="sm">
              Export PDF
            </Btn>
          </div>
        }
      />

      <div style={{ padding: "24px 32px 64px" }}>
        <p
          style={{
            fontSize: 13,
            color: ns.ink3,
            margin: "0 0 16px",
            maxWidth: 720,
          }}
        >
          Best value per row is highlighted; worst is muted. Total monthly cost is
          the headline figure — it includes rent and travel.
        </p>

        <div
          style={{
            background: ns.card,
            border: `1px solid ${ns.line}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `200px repeat(${props.length}, 1fr)`,
              borderBottom: `1px solid ${ns.line}`,
            }}
          >
            <div
              style={{
                padding: 16,
                fontSize: 11,
                color: ns.ink3,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRight: `1px solid ${ns.line2}`,
              }}
            >
              Property
            </div>
            {props.map((p, i) => (
              <div
                key={p.id}
                style={{
                  padding: 16,
                  borderRight:
                    i < props.length - 1 ? `1px solid ${ns.line2}` : "none",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 80,
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 10,
                  }}
                >
                  <PhotoPlaceholder
                    w={220}
                    h={80}
                    seed={hashSeed(p.id)}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: ns.ink,
                        letterSpacing: "-0.01em",
                        marginBottom: 2,
                      }}
                    >
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: ns.ink3 }}>
                      {PROVIDERS[p.provider]?.name ?? p.provider}
                    </div>
                  </div>
                  <ScoreRing
                    score={scoredById[p.id].score}
                    size={42}
                    label={false}
                  />
                </div>
                <button
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      compare: s.compare.filter((x) => x !== p.id),
                    }))
                  }
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: ns.ink3,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "inherit",
                  }}
                >
                  {Icon.close(10)} Remove
                </button>
              </div>
            ))}
          </div>

          {rows.map((row, ri) => {
            const [best, worst] = row.nums
              ? bestVal(row.nums, row.lower !== false)
              : [null, null];
            return (
              <div
                key={ri}
                style={{
                  display: "grid",
                  gridTemplateColumns: `200px repeat(${props.length}, 1fr)`,
                  borderBottom:
                    ri < rows.length - 1 ? `1px solid ${ns.line2}` : "none",
                  background: ri % 2 ? "#fafbf8" : "transparent",
                }}
              >
                <div
                  style={{
                    padding: "14px 16px",
                    fontSize: 12,
                    color: ns.ink3,
                    borderRight: `1px solid ${ns.line2}`,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {row.label}
                </div>
                {row.vals.map((v, i) => {
                  const n = row.nums?.[i];
                  const isBest =
                    n !== undefined && n === best && best !== worst;
                  const isWorst =
                    n !== undefined && n === worst && best !== worst;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "14px 16px",
                        fontSize: row.big ? 18 : 13,
                        fontWeight: row.big ? 600 : 500,
                        color: isWorst ? ns.bad : ns.ink,
                        background: isBest ? "#e0e8d6" : "transparent",
                        borderRight:
                          i < props.length - 1
                            ? `1px solid ${ns.line2}`
                            : "none",
                        letterSpacing: row.big ? "-0.02em" : 0,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {v}
                      {row.suffix ?? ""}
                      {isBest && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 10,
                            color: ns.good,
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                          }}
                        >
                          BEST
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Pros / cons */}
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: `200px repeat(${props.length}, 1fr)`,
            gap: 0,
            background: ns.card,
            border: `1px solid ${ns.line}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 16,
              fontSize: 11,
              color: ns.ink3,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              borderRight: `1px solid ${ns.line2}`,
            }}
          >
            At a glance
          </div>
          {props.map((p, i) => {
            const sc = scoredById[p.id];
            const pros: string[] = [];
            const cons: string[] = [];
            if (sc.subs.affordability > 0.7) pros.push("Within budget");
            if (sc.subs.commute > 0.7) pros.push("Quick commute");
            if (sc.subs.bills === 1) pros.push("All bills inclusive");
            if (sc.subs.amenities > 0.8) pros.push("Rich amenities");
            if (sc.subs.affordability < 0.3) cons.push("Above budget");
            if (sc.subs.commute < 0.3) cons.push("Long commute");
            if (p.contractMonths != null && p.contractMonths > 11) cons.push("Long contract");
            if (p.lastUpdated != null && p.lastUpdated > 14) cons.push("Stale listing");
            return (
              <div
                key={p.id}
                style={{
                  padding: 16,
                  borderRight:
                    i < props.length - 1 ? `1px solid ${ns.line2}` : "none",
                }}
              >
                <div style={{ marginBottom: 10 }}>
                  {pros.map((t) => (
                    <div
                      key={t}
                      style={{
                        fontSize: 12,
                        color: ns.good,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      {Icon.check(11)} {t}
                    </div>
                  ))}
                </div>
                <div>
                  {cons.map((t) => (
                    <div
                      key={t}
                      style={{
                        fontSize: 12,
                        color: ns.bad,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      − {t}
                    </div>
                  ))}
                  {!cons.length && !pros.length && (
                    <div style={{ fontSize: 12, color: ns.ink3 }}>
                      Balanced across criteria
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
