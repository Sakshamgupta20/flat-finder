"use client";

import { ns } from "@/lib/theme";
import { PRESETS } from "@/lib/data";
import { useAppState } from "@/lib/state";
import { Icon } from "./ui";
import type { Weights } from "@/lib/types";

export function WeightsDrawer() {
  const { state, setState } = useAppState();
  const W = state.weights;
  const update = (k: keyof Weights, v: number) =>
    setState((s) => ({ ...s, weights: { ...s.weights, [k]: v } }));
  const applyPreset = (name: string) =>
    setState((s) => ({ ...s, weights: PRESETS[name] }));
  const total = Object.values(W).reduce((a, b) => a + b, 0);

  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        right: 32,
        width: 360,
        background: ns.card,
        border: `1px solid ${ns.line}`,
        borderRadius: 14,
        padding: 20,
        boxShadow: "0 24px 48px -16px rgba(28,31,29,0.18)",
        zIndex: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <h3
          style={{
            fontSize: 15,
            fontWeight: 500,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Score weights
        </h3>
        <button
          onClick={() => setState((s) => ({ ...s, settingsOpen: false }))}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: ns.ink3,
            padding: 4,
          }}
        >
          {Icon.close()}
        </button>
      </div>
      <p style={{ fontSize: 12, color: ns.ink3, margin: "0 0 14px" }}>
        Adjust how each dimension contributes. Live re-rank.
      </p>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => applyPreset(name)}
            style={{
              flex: 1,
              padding: "7px 8px",
              fontSize: 11,
              fontWeight: 500,
              background: "transparent",
              color: ns.ink2,
              border: `1px solid ${ns.line}`,
              borderRadius: 7,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(Object.entries(W) as [keyof Weights, number][]).map(([k, v]) => (
          <div key={k}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: ns.ink2,
                  textTransform: "capitalize",
                }}
              >
                {k}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: ns.ink3,
                  fontFamily: "ui-monospace, monospace",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {(v * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={v}
              onChange={(e) => update(k, parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: ns.primary }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${ns.line2}`,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: ns.ink3,
        }}
      >
        <span>Total weight</span>
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            color: Math.abs(total - 1) < 0.05 ? ns.good : ns.warn,
          }}
        >
          {(total * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
