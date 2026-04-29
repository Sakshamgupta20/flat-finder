"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ns } from "@/lib/theme";
import { PROPERTIES } from "@/lib/data";
import { scoreProperty } from "@/lib/scoring";
import { useAppState } from "@/lib/state";
import { Btn, Icon } from "@/components/ui";
import { TopBar } from "@/components/TopBar";
import { WeightsDrawer } from "@/components/WeightsDrawer";
import { PropertyCard } from "@/components/PropertyCard";
import { NestMap } from "@/components/NestMap";
import type { ScoredResult } from "@/lib/types";

type FilterMode = "all" | "bills" | "studio";

export default function ResultsPage() {
  const router = useRouter();
  const { state, setState } = useAppState();
  const { prefs, weights, starred, compare, sort, mapStyle } = state;
  const [hover, setHover] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const scoredById = useMemo<Record<string, ScoredResult>>(() => {
    const o: Record<string, ScoredResult> = {};
    PROPERTIES.forEach((p) => {
      o[p.id] = scoreProperty(p, prefs, weights);
    });
    return o;
  }, [prefs, weights]);

  const sorted = useMemo(() => {
    const arr = PROPERTIES.filter((p) => {
      // Budget filter only applies when we know the price.
      if (p.weekly != null) {
        const m = (p.weekly * 52) / 12;
        if (m > prefs.budgetMax * 4.5) return false;
      }
      // Commute filter only applies when at least one selected mode has data.
      const modeMins = prefs.modes
        .map((md) => p[md])
        .filter((v): v is number => typeof v === "number");
      if (modeMins.length) {
        const best = Math.min(...modeMins);
        if (best > prefs.maxCommute + 10) return false;
      }
      if (filterMode === "bills" && p.billsIncluded !== "all") return false;
      if (filterMode === "studio" && p.roomType !== "Studio") return false;
      return true;
    });
    const minTravel = (p: (typeof PROPERTIES)[number]): number => {
      const v = [p.walk, p.tube, p.cycle].filter(
        (n): n is number => typeof n === "number",
      );
      return v.length ? Math.min(...v) : Number.POSITIVE_INFINITY;
    };
    arr.sort((a, b) => {
      if (sort === "rent") {
        const aw = a.weekly ?? Number.POSITIVE_INFINITY;
        const bw = b.weekly ?? Number.POSITIVE_INFINITY;
        return aw - bw;
      }
      if (sort === "commute") return minTravel(a) - minTravel(b);
      return scoredById[b.id].score - scoredById[a.id].score;
    });
    return arr;
  }, [prefs, weights, sort, filterMode, scoredById]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: ns.bg,
        color: ns.ink,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <TopBar />

      {/* Filter bar */}
      <div
        style={{
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: `1px solid ${ns.line2}`,
          background: ns.card,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {(
            [
              ["all", "All"],
              ["bills", "All-inclusive"],
              ["studio", "Studio only"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilterMode(k)}
              style={{
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 500,
                background: filterMode === k ? ns.ink : "transparent",
                color: filterMode === k ? "#eef0ec" : ns.ink2,
                border: `1px solid ${filterMode === k ? ns.ink : ns.line}`,
                borderRadius: 7,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <FilterChip
          label={`Budget £${prefs.budgetMin}–${prefs.budgetMax}/wk`}
        />
        <FilterChip label={`≤${prefs.maxCommute} min`} />
        <FilterChip
          label={prefs.modes
            .map((m) => m[0].toUpperCase() + m.slice(1))
            .join(" · ")}
        />
        <div
          style={{
            width: 1,
            height: 22,
            background: ns.line,
            margin: "0 4px",
          }}
        />
        <span
          style={{
            fontSize: 11,
            color: ns.ink3,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Sort
        </span>
        <select
          value={sort}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              sort: e.target.value as typeof sort,
            }))
          }
          style={{
            padding: "7px 10px",
            fontSize: 12,
            border: `1px solid ${ns.line}`,
            borderRadius: 7,
            background: ns.card,
            color: ns.ink,
            fontFamily: "inherit",
          }}
        >
          <option value="score">Best match</option>
          <option value="rent">Lowest rent</option>
          <option value="commute">Shortest commute</option>
        </select>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 600px",
          minHeight: 0,
        }}
      >
        {/* List */}
        <div style={{ overflow: "auto", padding: "20px 32px 40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 500,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {sorted.length} properties near Imperial
            </h2>
            <span style={{ fontSize: 12, color: ns.ink3 }}>
              Updated daily · 14 sources
            </span>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {sorted.map((p) => (
              <div
                key={p.id}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
              >
                <PropertyCard
                  p={p}
                  scored={scoredById[p.id]}
                  starred={starred.includes(p.id)}
                  inCompare={compare.includes(p.id)}
                  onStar={() =>
                    setState((s) => ({
                      ...s,
                      starred: s.starred.includes(p.id)
                        ? s.starred.filter((x) => x !== p.id)
                        : [...s.starred, p.id],
                    }))
                  }
                  onCompare={() =>
                    setState((s) => ({
                      ...s,
                      compare: s.compare.includes(p.id)
                        ? s.compare.filter((x) => x !== p.id)
                        : [...s.compare, p.id].slice(0, 5),
                    }))
                  }
                  onOpen={() => router.push(`/property/${p.id}`)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Map sidebar */}
        <div
          style={{
            background: ns.card,
            borderLeft: `1px solid ${ns.line2}`,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${ns.line2}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: ns.ink2,
                letterSpacing: "0.04em",
              }}
            >
              MAP VIEW
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {(["light", "muted", "dark"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    setState((st) => ({ ...st, mapStyle: s }))
                  }
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    cursor: "pointer",
                    border:
                      mapStyle === s
                        ? `2px solid ${ns.primary}`
                        : `1px solid ${ns.line}`,
                    background:
                      s === "dark"
                        ? "#1f2422"
                        : s === "muted"
                          ? "#dde2d6"
                          : "#f4f6f0",
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", padding: 16 }}>
            <div
              style={{
                borderRadius: 12,
                overflow: "hidden",
                height: "100%",
              }}
            >
              <NestMap
                width={568}
                height={520}
                properties={sorted}
                scoredById={scoredById}
                focused={hover ?? compare[0] ?? null}
                onPin={(id) => router.push(`/property/${id}`)}
                mapStyle={mapStyle === "muted" ? "light" : mapStyle}
              />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 24,
                left: 24,
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${ns.line}`,
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 11,
                color: ns.ink2,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 6,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: ns.ink3,
                }}
              >
                SCORE
              </div>
              <Legend dot={ns.good} label="75+ Strong" />
              <Legend dot={ns.warn} label="55–74 Decent" />
              <Legend dot={ns.bad} label="< 55 Skip" />
            </div>
          </div>
        </div>
      </div>

      {/* Compare bar */}
      {compare.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            background: ns.ink,
            color: "#eef0ec",
            borderRadius: 14,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 16px 40px -12px rgba(28,31,29,0.4)",
            zIndex: 50,
          }}
        >
          <span style={{ fontSize: 13 }}>
            <b>{compare.length}</b> selected for comparison
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {compare.map((id) => {
              const p = PROPERTIES.find((x) => x.id === id);
              if (!p) return null;
              return (
                <span
                  key={id}
                  style={{
                    padding: "3px 8px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                >
                  {p.name.split(" ").slice(0, 2).join(" ")}
                </span>
              );
            })}
          </div>
          <Link href="/compare" prefetch>
            <Btn
              variant="primary"
              size="sm"
              style={{ background: "#f4f6f0", color: ns.ink }}
            >
              Compare side by side {Icon.arrow()}
            </Btn>
          </Link>
        </div>
      )}

      {state.settingsOpen && <WeightsDrawer />}
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <span
      style={{
        padding: "6px 11px",
        borderRadius: 999,
        background: "#e3e7dd",
        color: ns.primary,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 3,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: dot,
        }}
      />
      {label}
    </div>
  );
}
