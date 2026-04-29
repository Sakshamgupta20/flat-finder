"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ns } from "@/lib/theme";
import { Icon } from "./ui";

export function BackHeader({
  title,
  backHref = "/results",
  backLabel = "Back to results",
  right,
}: {
  title?: string;
  backHref?: string;
  backLabel?: string;
  right?: ReactNode;
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 32px",
        borderBottom: `1px solid ${ns.line2}`,
        background: ns.card,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Link
        href={backHref}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: ns.ink2,
          fontSize: 13,
          fontFamily: "inherit",
          padding: 0,
        }}
      >
        <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}>
          {Icon.arrow()}
        </span>{" "}
        {backLabel}
      </Link>
      {title && (
        <h1
          style={{
            fontSize: 16,
            fontWeight: 500,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h1>
      )}
      {right ?? <div style={{ width: 1 }} />}
    </header>
  );
}
