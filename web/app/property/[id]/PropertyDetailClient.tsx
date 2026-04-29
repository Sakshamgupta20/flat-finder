"use client";

import { ns } from "@/lib/theme";
import { AMENITY_LABEL, PROPERTIES } from "@/lib/data";
import { scoreProperty } from "@/lib/scoring";
import { useAppState } from "@/lib/state";
import {
  Btn,
  FreshnessDot,
  Icon,
  PhotoPlaceholder,
  ProviderBadge,
  ScoreRing,
} from "@/components/ui";
import { BackHeader } from "@/components/BackHeader";
import type { ReactNode } from "react";

const DASH = "—";

export function PropertyDetailClient({ id }: { id: string }) {
  const { state, setState } = useAppState();
  const p = PROPERTIES.find((x) => x.id === id);
  if (!p) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: ns.bg,
          color: ns.ink,
        }}
      >
        <BackHeader />
        <div
          style={{
            maxWidth: 720,
            margin: "120px auto 0",
            padding: "0 32px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 500,
              fontFamily: "var(--font-display), serif",
              margin: 0,
            }}
          >
            Property not found
          </h1>
          <p style={{ color: ns.ink3, marginTop: 8 }}>
            This listing may have been removed or never indexed.
          </p>
        </div>
      </div>
    );
  }

  const scored = scoreProperty(p, state.prefs, state.weights);
  const monthly = p.weekly != null ? Math.round(scored.monthly) : null;
  const total = monthly != null ? monthly + (p.travelMonthly ?? 0) : null;
  const starred = state.starred.includes(p.id);
  const fmtMins = (m: number | null) => (m == null ? DASH : `${m} min`);

  const subRows: [string, number, number][] = [
    ["Affordability", scored.subs.affordability, state.weights.affordability],
    ["Commute", scored.subs.commute, state.weights.commute],
    ["Distance", scored.subs.distance, state.weights.distance],
    ["Bills", scored.subs.bills, state.weights.bills],
    ["Amenities", scored.subs.amenities, state.weights.amenities],
    ["Flexibility", scored.subs.flexibility, state.weights.flexibility],
    ["Reviews", scored.subs.reviews, state.weights.reviews],
    ["Freshness", scored.subs.freshness, state.weights.freshness],
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
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() =>
                setState((s) => ({
                  ...s,
                  starred: starred
                    ? s.starred.filter((x) => x !== p.id)
                    : [...s.starred, p.id],
                }))
              }
            >
              <span style={{ color: starred ? ns.clay : "inherit" }}>
                {Icon.star(starred)}
              </span>
              {starred ? "Saved" : "Save"}
            </Btn>
            <Btn variant="ink" size="sm">
              Visit listing {Icon.ext()}
            </Btn>
          </div>
        }
      />

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "32px 32px 64px",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 32,
        }}
      >
        {/* Main column */}
        <div>
          {/* Photo grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gridTemplateRows: "180px 180px",
              gap: 6,
              marginBottom: 28,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div style={{ gridRow: "span 2" }}>
              <PhotoPlaceholder w={580} h={366} seed={1} label="HERO PHOTO" />
            </div>
            <PhotoPlaceholder w={200} h={180} seed={2} label="LIVING" />
            <PhotoPlaceholder w={200} h={180} seed={3} label="KITCHEN" />
            <PhotoPlaceholder w={200} h={180} seed={4} label="STUDY" />
            <PhotoPlaceholder w={200} h={180} seed={5} label="EXTERIOR" />
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <ProviderBadge provider={p.provider} />
              {p.eligibility && (
                <>
                  <span style={{ fontSize: 12, color: ns.ink3 }}>·</span>
                  <span style={{ fontSize: 12, color: ns.ink3 }}>
                    {p.eligibility}
                  </span>
                </>
              )}
              {p.lastUpdated != null && (
                <>
                  <span style={{ fontSize: 12, color: ns.ink3 }}>·</span>
                  <span
                    style={{
                      fontSize: 12,
                      color: ns.ink3,
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <FreshnessDot days={p.lastUpdated} />Updated {p.lastUpdated}d
                    ago
                  </span>
                </>
              )}
            </div>
            <h1
              style={{
                fontSize: 38,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                margin: "0 0 6px",
                fontFamily: "var(--font-display), serif",
              }}
            >
              {p.name}
            </h1>
            <p
              style={{
                fontSize: 14,
                color: ns.ink2,
                margin: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {Icon.pin()} {p.address ?? DASH}
              {p.station ? ` · ${p.station}` : ""}
            </p>
          </div>

          {/* Quick facts grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0,
              background: ns.card,
              border: `1px solid ${ns.line}`,
              borderRadius: 14,
              padding: 20,
              marginBottom: 28,
            }}
          >
            <Fact label="Room type" value={p.roomType ?? DASH} />
            <Fact label="Tube zone" value={p.zone ?? DASH} mono />
            <Fact
              label="Contract"
              value={p.contractMonths == null ? DASH : `${p.contractMonths} mo`}
            />
            <Fact
              label="Deposit"
              value={
                p.deposit == null
                  ? DASH
                  : p.depositHigh != null && p.depositHigh !== p.deposit
                    ? `£${p.deposit}–£${p.depositHigh}`
                    : `£${p.deposit}`
              }
              mono
            />
          </div>

          {/* Commute */}
          <Section
            title="Commute to central London"
            caption="From the source's reference destination"
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              <CommuteCell
                icon={Icon.walk(18)}
                mode="Walk"
                mins={p.walk}
                cost={0}
                best={p.walk != null && p.walk === scored.bestMode}
              />
              <CommuteCell
                icon={Icon.tube(18)}
                mode="Transit"
                mins={p.tube}
                cost={p.travelMonthly}
                best={p.tube != null && p.tube === scored.bestMode}
              />
              <CommuteCell
                icon={Icon.cycle(18)}
                mode="Cycle"
                mins={p.cycle}
                cost={null}
                best={false}
              />
            </div>
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: ns.bg,
                borderRadius: 10,
                fontSize: 13,
                color: ns.ink2,
                lineHeight: 1.55,
              }}
            >
              <b style={{ color: ns.ink }}>Best mode:</b>{" "}
              {scored.bestMode > 0
                ? `${scored.bestMode === p.walk ? "Walking" : "Transit"} · ${fmtMins(
                    scored.bestMode,
                  )}`
                : DASH}{" "}
              · Distance ≈ {scored.km.toFixed(1)} km from central London.
            </div>
          </Section>

          {/* Amenities */}
          <Section title="Amenities">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {(Object.keys(AMENITY_LABEL) as (keyof typeof AMENITY_LABEL)[]).map(
                (k) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid ${ns.line}`,
                      fontSize: 13,
                      color: p.amenities.includes(k) ? ns.ink : ns.ink3,
                      background: p.amenities.includes(k)
                        ? "#e3e7dd"
                        : "transparent",
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: p.amenities.includes(k)
                          ? ns.primary
                          : ns.line,
                        color: "#f4f6f0",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {p.amenities.includes(k) ? Icon.check(10) : ""}
                    </span>
                    {AMENITY_LABEL[k]}
                  </div>
                ),
              )}
            </div>
          </Section>

          {/* Tenancy */}
          <Section title="Tenancy & policy">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 0,
                border: `1px solid ${ns.line}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <Row k="Move-in window" v={p.contract ?? DASH} />
              <Row
                k="Bills"
                v={
                  p.billsIncluded === "all"
                    ? "All inclusive"
                    : p.billsIncluded === "partial"
                      ? "Partial"
                      : p.billsIncluded === "none"
                        ? "Not included"
                        : DASH
                }
              />
              <Row k="Cancellation" v={p.cancellation ?? DASH} />
              <Row k="Eligibility" v={p.eligibility ?? DASH} />
              <Row
                k="Rating"
                v={p.rating == null ? DASH : `${p.rating}/5 · ${p.ratingSrc ?? ""}`}
              />
              <Row
                k="Availability"
                v={
                  <span style={{ textTransform: "capitalize" }}>
                    {p.availability}
                  </span>
                }
              />
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <aside style={{ position: "sticky", top: 80, alignSelf: "start" }}>
          <div
            style={{
              background: ns.card,
              border: `1px solid ${ns.line}`,
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: ns.ink3,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Total / month
                </div>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 500,
                    color: ns.ink,
                    letterSpacing: "-0.025em",
                    fontVariantNumeric: "tabular-nums",
                    fontFamily: "var(--font-display), serif",
                  }}
                >
                  {total == null ? DASH : `£${total.toLocaleString()}`}
                </div>
              </div>
              <ScoreRing score={scored.score} size={70} />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 0,
                borderTop: `1px solid ${ns.line2}`,
                paddingTop: 12,
              }}
            >
              <Mini
                label="Rent"
                v={p.weekly == null ? DASH : `£${p.weekly}/wk`}
                sub={monthly == null ? "" : `£${monthly} mo`}
              />
              <Mini
                label="Travel"
                v={
                  p.travelMonthly == null
                    ? DASH
                    : p.travelMonthly === 0
                      ? "Free"
                      : `£${p.travelMonthly}/mo`
                }
                sub={p.zone ? `Zone ${p.zone}` : ""}
              />
            </div>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Btn variant="primary">Visit original listing {Icon.ext()}</Btn>
              <Btn variant="soft">+ Add to comparison</Btn>
            </div>
          </div>

          <div
            style={{
              background: ns.card,
              border: `1px solid ${ns.line}`,
              borderRadius: 14,
              padding: 20,
              marginTop: 12,
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 500, margin: "0 0 4px" }}>
              Why this score?
            </h3>
            <p style={{ fontSize: 12, color: ns.ink3, margin: "0 0 14px" }}>
              Each sub-score is normalised 0–1 and weighted.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 9 }}
            >
              {subRows.map(([n, v, w]) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ flex: 1, fontSize: 12, color: ns.ink2 }}>
                    {n}
                  </span>
                  <div
                    style={{
                      flex: 2,
                      height: 6,
                      background: ns.line2,
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${v * 100}%`,
                        height: "100%",
                        background: ns.primary,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      width: 36,
                      textAlign: "right",
                      fontSize: 11,
                      color: ns.ink3,
                      fontVariantNumeric: "tabular-nums",
                      fontFamily: "ui-monospace, monospace",
                    }}
                  >
                    ×{w.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 28 }}>
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
            fontSize: 18,
            fontWeight: 500,
            color: ns.ink,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        {caption && <span style={{ fontSize: 11, color: ns.ink3 }}>{caption}</span>}
      </div>
      {children}
    </section>
  );
}

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div style={{ borderRight: `1px solid ${ns.line2}`, paddingRight: 16 }}>
      <div
        style={{
          fontSize: 10,
          color: ns.ink3,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 500,
          color: ns.ink,
          fontFamily: mono ? "ui-monospace, monospace" : "inherit",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function CommuteCell({
  icon,
  mode,
  mins,
  cost,
  best,
}: {
  icon: ReactNode;
  mode: string;
  mins: number | null;
  cost: number | null;
  best: boolean;
}) {
  return (
    <div
      style={{
        background: ns.card,
        border: `1px solid ${best ? ns.primary : ns.line}`,
        borderRadius: 12,
        padding: 16,
        position: "relative",
      }}
    >
      {best && (
        <span
          style={{
            position: "absolute",
            top: -8,
            left: 12,
            padding: "2px 8px",
            background: ns.primary,
            color: "#f4f6f0",
            fontSize: 10,
            fontWeight: 500,
            borderRadius: 999,
            letterSpacing: "0.04em",
          }}
        >
          BEST
        </span>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: ns.ink2,
          marginBottom: 8,
        }}
      >
        {icon}
        <span style={{ fontSize: 12 }}>{mode}</span>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: ns.ink,
          letterSpacing: "-0.02em",
        }}
      >
        {mins ?? DASH}
        <span style={{ fontSize: 14, color: ns.ink3, fontWeight: 400 }}> min</span>
      </div>
      <div style={{ fontSize: 11, color: ns.ink3, marginTop: 4 }}>
        {cost == null ? DASH : cost === 0 ? "No cost" : `£${cost}/month`}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <>
      <div
        style={{
          padding: "11px 14px",
          background: ns.bg,
          fontSize: 12,
          color: ns.ink3,
          borderBottom: `1px solid ${ns.line2}`,
          borderRight: `1px solid ${ns.line2}`,
        }}
      >
        {k}
      </div>
      <div
        style={{
          padding: "11px 14px",
          fontSize: 13,
          color: ns.ink,
          borderBottom: `1px solid ${ns.line2}`,
        }}
      >
        {v}
      </div>
    </>
  );
}

function Mini({ label, v, sub }: { label: string; v: string; sub: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: ns.ink3,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: ns.ink }}>{v}</div>
      <div style={{ fontSize: 11, color: ns.ink3 }}>{sub}</div>
    </div>
  );
}
