"use client";

import Link from "next/link";
import { ns } from "@/lib/theme";
import { useAppState } from "@/lib/state";
import { Btn, Icon, Logo } from "./ui";

export function TopBar() {
  const { state, setState } = useAppState();
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 32px",
        borderBottom: `1px solid ${ns.line2}`,
        background: ns.card,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Logo />
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
            NestNear
          </span>
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 11px",
            background: ns.bg,
            borderRadius: 8,
            fontSize: 12,
            color: ns.ink2,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: ns.primary,
            }}
          />
          Imperial Business School · Sept 2026
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Btn
          variant="ghost"
          size="sm"
          onClick={() =>
            setState((s) => ({ ...s, settingsOpen: !s.settingsOpen }))
          }
        >
          {Icon.sliders()} Weights
        </Btn>
        <Link href="/compare" prefetch>
          <Btn variant="ghost" size="sm">
            Compare ({state.compare.length})
          </Btn>
        </Link>
        <Link href="/shortlist" prefetch>
          <Btn variant="ghost" size="sm">
            {Icon.star(false)} Shortlist ({state.starred.length})
          </Btn>
        </Link>
        <Btn variant="ink" size="sm">
          + Add property
        </Btn>
      </div>
    </header>
  );
}
