"use client";

import Link from "next/link";
import { ns } from "@/lib/theme";
import { DEFAULT_PREFS, DEFAULT_WEIGHTS, PROPERTIES } from "@/lib/data";
import { scoreProperty } from "@/lib/scoring";
import { Btn, Icon, Logo, PhotoPlaceholder } from "@/components/ui";
import { NestMap } from "@/components/NestMap";

export default function LandingPage() {
  const scoredById = Object.fromEntries(
    PROPERTIES.map((p) => [p.id, scoreProperty(p, DEFAULT_PREFS, DEFAULT_WEIGHTS)]),
  );

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: ns.bg,
        color: ns.ink,
        position: "relative",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 56px",
          borderBottom: `1px solid ${ns.line2}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
            NestNear
          </span>
        </div>
        <nav style={{ display: "flex", gap: 28, fontSize: 13, color: ns.ink2 }}>
          <a>How it works</a>
          <a>Sources</a>
          <a>About</a>
        </nav>
        <Btn variant="ghost" size="sm">
          Sign in
        </Btn>
      </header>

      <main
        style={{
          padding: "64px 56px 0",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: 64,
          alignItems: "center",
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 999,
              background: "#e3e7dd",
              color: ns.primary,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 24,
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
            For Imperial MBA · September 2026
          </div>
          <h1
            style={{
              fontSize: 64,
              lineHeight: 1.02,
              fontWeight: 500,
              letterSpacing: "-0.035em",
              margin: 0,
              color: ns.ink,
              fontFamily: "var(--font-display), Georgia, serif",
            }}
          >
            Find your London{" "}
            <em
              style={{ fontStyle: "italic", color: ns.primary, fontWeight: 400 }}
            >
              student home
            </em>
            , scored by commute &amp; cost.
          </h1>
          <p
            style={{
              fontSize: 17,
              color: ns.ink2,
              lineHeight: 1.5,
              marginTop: 22,
              maxWidth: 520,
              fontWeight: 400,
            }}
          >
            Stop juggling 12 tabs and 3 spreadsheets. Drop in listings, see commute
            time to Imperial Business School, and compare side by side — with one
            transparent score.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <Link href="/results" prefetch>
              <Btn variant="primary" size="lg">
                Start with my preferences {Icon.arrow(14)}
              </Btn>
            </Link>
            <Btn variant="ghost" size="lg">
              Watch the 60-sec demo
            </Btn>
          </div>
          <div
            style={{
              display: "flex",
              gap: 28,
              marginTop: 40,
              fontSize: 12,
              color: ns.ink3,
            }}
          >
            <Stat n="40h→1h" l="Research time" />
            <Stat n="14" l="Sources covered" />
            <Stat n="£0" l="To use" />
          </div>
        </div>

        <div style={{ position: "relative", height: 480 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid ${ns.line}`,
              background: ns.card,
            }}
          >
            <NestMap
              width={580}
              height={480}
              properties={PROPERTIES.slice(0, 5)}
              scoredById={scoredById}
              hoverable={false}
              mapStyle="light"
            />
          </div>
          <FloatCard top={28} right={-18} score={86} name="Beit Hall" rent={358} commute={4} mode="walk" />
          <FloatCard top={220} left={-24} score={78} name="Chapter White City" rent={449} commute={18} mode="tube" />
          <FloatCard bottom={36} right={20} score={73} name="iQ Shoreditch" rent={379} commute={28} mode="tube" />
        </div>
      </main>

      <section
        style={{
          padding: "88px 56px 56px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        {(
          [
            ["01", "Set preferences", "Budget, room type, max commute, bills. One screen, persists across visits."],
            ["02", "Drop in listings", "Paste a URL, upload a CSV, or fill the form. We extract address, price, amenities."],
            ["03", "Compare & shortlist", "Side-by-side table, transparent score, export your final 5 to PDF."],
          ] as const
        ).map(([n, t, d]) => (
          <div key={n} style={{ padding: "28px 24px 24px", borderTop: `1px solid ${ns.line}` }}>
            <div
              style={{
                fontSize: 11,
                color: ns.primary,
                letterSpacing: "0.16em",
                fontFamily: "ui-monospace, Menlo, monospace",
                marginBottom: 14,
              }}
            >
              STEP {n}
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 500,
                color: ns.ink,
                margin: "0 0 8px",
                letterSpacing: "-0.01em",
              }}
            >
              {t}
            </h3>
            <p style={{ fontSize: 13, color: ns.ink2, lineHeight: 1.55, margin: 0 }}>
              {d}
            </p>
          </div>
        ))}
      </section>

      <footer
        style={{
          padding: "24px 56px",
          borderTop: `1px solid ${ns.line2}`,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: ns.ink3,
        }}
      >
        <span>Built for one student. Useful to many.</span>
        <span>Privacy · ToS · Sources</span>
      </footer>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: ns.ink,
          letterSpacing: "-0.02em",
          fontFamily: "var(--font-display), serif",
        }}
      >
        {n}
      </div>
      <div
        style={{
          fontSize: 11,
          color: ns.ink3,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        {l}
      </div>
    </div>
  );
}

function FloatCard({
  top,
  left,
  right,
  bottom,
  score,
  name,
  rent,
  commute,
  mode,
}: {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  score: number;
  name: string;
  rent: number;
  commute: number;
  mode: "walk" | "tube";
}) {
  const tone = score >= 75 ? ns.good : score >= 55 ? ns.warn : ns.bad;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        background: ns.card,
        border: `1px solid ${ns.line}`,
        borderRadius: 12,
        padding: 12,
        width: 220,
        boxShadow: "0 12px 32px -16px rgba(28,31,29,0.18)",
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden" }}>
        <PhotoPlaceholder w={36} h={36} seed={score} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: ns.ink,
            marginBottom: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: ns.ink3,
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          £{rent}/wk · {mode === "walk" ? Icon.walk(10) : Icon.tube(10)} {commute}m
        </div>
      </div>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: tone + "22",
          color: tone,
          display: "grid",
          placeItems: "center",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {score}
      </div>
    </div>
  );
}
