"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ns } from "@/lib/theme";
import { PROPERTIES } from "@/lib/data";
import { scoreProperty } from "@/lib/scoring";
import { useAppState } from "@/lib/state";
import {
  Btn,
  FreshnessDot,
  hashSeed,
  Icon,
  PropertyImage,
  ScoreRing,
} from "@/components/ui";
import { BackHeader } from "@/components/BackHeader";
import type { ShortlistEntry } from "@/lib/types";

type Filter = "all" | "interested" | "pending" | "rejected";

const APPLICATION_STEPS: ShortlistEntry["application"][] = [
  "none",
  "applied",
  "viewing",
  "offered",
  "accepted",
];

const STEP_LABELS = ["Not started", "Applied", "Viewing", "Offered", "Accepted"];

export default function ShortlistPage() {
  const router = useRouter();
  const { state, setState } = useAppState();
  const [filter, setFilter] = useState<Filter>("all");

  const all = state.starred
    .map((id) => PROPERTIES.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const status = state.shortlistStatus ?? {};

  const filtered = all.filter((p) => {
    const s = status[p.id]?.status ?? "interested";
    if (filter === "all") return true;
    return s === filter;
  });

  const counts: Record<Filter, number> = {
    all: all.length,
    interested: all.filter(
      (p) => (status[p.id]?.status ?? "interested") === "interested",
    ).length,
    pending: all.filter((p) => status[p.id]?.status === "pending").length,
    rejected: all.filter((p) => status[p.id]?.status === "rejected").length,
  };

  const setStatus = <K extends keyof ShortlistEntry>(
    id: string,
    key: K,
    val: ShortlistEntry[K],
  ) => {
    setState((s) => ({
      ...s,
      shortlistStatus: {
        ...s.shortlistStatus,
        [id]: { ...(s.shortlistStatus?.[id] ?? {}), [key]: val },
      },
    }));
  };

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
        title="My Shortlist"
        right={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/compare" prefetch>
              <Btn variant="ghost" size="sm">
                Compare all
              </Btn>
            </Link>
            <Btn variant="ink" size="sm">
              Export PDF
            </Btn>
          </div>
        }
      />

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 32px 64px",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: 0,
              fontFamily: "var(--font-display), serif",
            }}
          >
            {all.length} properties saved
          </h2>
          <p style={{ fontSize: 14, color: ns.ink2, margin: "6px 0 0" }}>
            Track applications, add notes, and decide. Saved locally — export to
            keep a backup.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 20,
            borderBottom: `1px solid ${ns.line2}`,
          }}
        >
          {(
            [
              ["all", "All"],
              ["interested", "Interested"],
              ["pending", "Pending"],
              ["rejected", "Rejected"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              style={{
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 500,
                background: "transparent",
                color: filter === k ? ns.primary : ns.ink3,
                border: "none",
                borderBottom: `2px solid ${filter === k ? ns.primary : "transparent"}`,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: -1,
              }}
            >
              {l}{" "}
              <span style={{ fontSize: 11, color: ns.ink3 }}>{counts[k]}</span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <span
            style={{ fontSize: 11, color: ns.ink3, alignSelf: "center" }}
          >
            Sorted by score · Persisted locally
          </span>
        </div>

        {filtered.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              color: ns.ink3,
              border: `1px dashed ${ns.line}`,
              borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 14 }}>
              No properties in <b>{filter}</b>.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((p) => {
              const sc = scoreProperty(p, state.prefs, state.weights);
              const total =
                p.weekly != null
                  ? Math.round(sc.monthly) + (p.travelMonthly ?? 0)
                  : null;
              const cur = status[p.id] ?? {};
              const cur_i = APPLICATION_STEPS.indexOf(cur.application ?? "none");
              return (
                <div
                  key={p.id}
                  style={{
                    background: ns.card,
                    border: `1px solid ${ns.line}`,
                    borderRadius: 14,
                    padding: 16,
                    display: "grid",
                    gridTemplateColumns: "90px 1fr auto",
                    gap: 16,
                  }}
                >
                  <div
                    onClick={() => router.push(`/property/${p.id}`)}
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 10,
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                  >
                    <PropertyImage
                      src={p.image}
                      alt={p.name}
                      w={90}
                      h={90}
                      seed={hashSeed(p.id)}
                    />
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
                        onClick={() => router.push(`/property/${p.id}`)}
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          margin: 0,
                          letterSpacing: "-0.01em",
                          cursor: "pointer",
                        }}
                      >
                        {p.name}
                      </h3>
                      <span style={{ fontSize: 11, color: ns.ink3 }}>
                        {[p.roomType, p.address].filter(Boolean).join(" · ") ||
                          "—"}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 14,
                        fontSize: 11,
                        color: ns.ink3,
                        marginBottom: 10,
                      }}
                    >
                      <span>{total == null ? "£—" : `£${total}/mo`}</span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {Icon.tube(10)} {p.tube != null ? `${p.tube}m` : "—"}
                      </span>
                      {p.zone && <span>Zone {p.zone}</span>}
                      {p.lastUpdated != null && (
                        <span>
                          <FreshnessDot days={p.lastUpdated} />
                          {p.lastUpdated}d
                        </span>
                      )}
                    </div>
                    {/* Application timeline */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                      {STEP_LABELS.map((label, i) => {
                        const active = i <= cur_i;
                        return (
                          <button
                            key={label}
                            onClick={() =>
                              setStatus(p.id, "application", APPLICATION_STEPS[i])
                            }
                            style={{
                              flex: 1,
                              padding: "6px 4px",
                              fontSize: 10,
                              fontWeight: 500,
                              background: active ? ns.primary : "#f1f3ed",
                              color: active ? "#f4f6f0" : ns.ink3,
                              border: "none",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              opacity: active || i === cur_i + 1 ? 1 : 0.7,
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      value={cur.notes ?? ""}
                      onChange={(e) =>
                        setStatus(p.id, "notes", e.target.value)
                      }
                      placeholder="Add a note (e.g. emailed Tue, viewing 12 May)"
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        border: `1px solid ${ns.line2}`,
                        borderRadius: 7,
                        background: ns.bg,
                        color: ns.ink,
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                    }}
                  >
                    <ScoreRing score={sc.score} size={44} label={false} />
                    <select
                      value={cur.status ?? "interested"}
                      onChange={(e) =>
                        setStatus(
                          p.id,
                          "status",
                          e.target.value as ShortlistEntry["status"],
                        )
                      }
                      style={{
                        padding: "6px 8px",
                        fontSize: 11,
                        border: `1px solid ${ns.line}`,
                        borderRadius: 6,
                        background: ns.card,
                        color: ns.ink,
                        fontFamily: "inherit",
                      }}
                    >
                      <option value="interested">Interested</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
