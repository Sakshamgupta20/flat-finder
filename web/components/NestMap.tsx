"use client";

import { ns } from "@/lib/theme";
import { IMPERIAL } from "@/lib/data";
import type { Property, ScoredResult } from "@/lib/types";

interface Props {
  width?: number;
  height?: number;
  properties?: Property[];
  focused?: string | null;
  onPin?: (id: string) => void;
  scoredById?: Record<string, ScoredResult>;
  showRings?: boolean;
  hoverable?: boolean;
  mapStyle?: "light" | "dark" | "muted";
}

export function NestMap({
  width = 700,
  height = 460,
  properties = [],
  focused = null,
  onPin,
  scoredById = {},
  showRings = true,
  hoverable = true,
  mapStyle = "light",
}: Props) {
  const isDark = mapStyle === "dark";
  const t = isDark
    ? {
        land: "#1f2422",
        water: "#15191a",
        park: "#28332a",
        roadMinor: "#2c3431",
        label: "#aab1a8",
        faint: "#2c3431",
      }
    : {
        land: "#e7eae3",
        water: "#cdd5d3",
        park: "#d2dccd",
        roadMinor: "#f4f6ef",
        label: "#6b7268",
        faint: "#cfd5c8",
      };

  const sx = (n: number) => (n / 1000) * width;
  const sy = (n: number) => (n / 680) * height;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", borderRadius: "inherit", background: t.land }}
    >
      {/* Thames — abstract winding ribbon */}
      <path
        d={`M ${sx(0)} ${sy(440)} C ${sx(150)} ${sy(420)}, ${sx(280)} ${sy(490)}, ${sx(420)} ${sy(470)} S ${sx(620)} ${sy(420)}, ${sx(740)} ${sy(460)} S ${sx(900)} ${sy(520)}, ${sx(1000)} ${sy(490)} L ${sx(1000)} ${sy(680)} L ${sx(0)} ${sy(680)} Z`}
        fill={t.water}
      />

      {/* Hyde Park / Kensington Gardens block */}
      <rect
        x={sx(380)}
        y={sy(190)}
        width={sx(220)}
        height={sy(110)}
        fill={t.park}
        rx={sx(6)}
      />

      {/* Regents-ish park top right */}
      <rect
        x={sx(700)}
        y={sy(80)}
        width={sx(140)}
        height={sy(70)}
        fill={t.park}
        rx={sx(6)}
      />

      {/* Holland Park west */}
      <rect
        x={sx(160)}
        y={sy(220)}
        width={sx(70)}
        height={sy(60)}
        fill={t.park}
        rx={sx(6)}
      />

      {/* major roads — cross hatch grid */}
      {[120, 200, 280, 380, 460, 540, 620, 700, 780, 860].map((y, i) => (
        <line
          key={"h" + i}
          x1={0}
          y1={sy(y)}
          x2={width}
          y2={sy(y + (i % 3) * 8)}
          stroke={t.roadMinor}
          strokeWidth={i % 4 === 0 ? 4 : 1.5}
        />
      ))}
      {[80, 180, 280, 380, 480, 580, 680, 780, 880, 960].map((x, i) => (
        <line
          key={"v" + i}
          x1={sx(x)}
          y1={0}
          x2={sx(x + (i % 2) * 10)}
          y2={height}
          stroke={t.roadMinor}
          strokeWidth={i % 3 === 0 ? 4 : 1.5}
        />
      ))}

      {/* Tube lines — Piccadilly + District */}
      <path
        d={`M ${sx(40)} ${sy(360)} Q ${sx(280)} ${sy(380)}, ${sx(500)} ${sy(360)} T ${sx(960)} ${sy(280)}`}
        fill="none"
        stroke={isDark ? "#3a5a8a" : "#0f3a7a"}
        strokeWidth={2.2}
        strokeOpacity="0.7"
      />
      <path
        d={`M ${sx(20)} ${sy(420)} Q ${sx(260)} ${sy(390)}, ${sx(500)} ${sy(360)} T ${sx(980)} ${sy(380)}`}
        fill="none"
        stroke={isDark ? "#4a7a4a" : "#1a6a2a"}
        strokeWidth={2.2}
        strokeOpacity="0.7"
      />

      {/* Distance rings around Imperial */}
      {showRings &&
        [120, 200, 300].map((r, i) => (
          <circle
            key={i}
            cx={sx(IMPERIAL.x)}
            cy={sy(IMPERIAL.y)}
            r={r * (width / 1000)}
            fill="none"
            stroke={t.faint}
            strokeWidth={1}
            strokeDasharray="3 5"
            opacity="0.55"
          />
        ))}
      {showRings && (
        <text
          x={sx(IMPERIAL.x) + 122}
          y={sy(IMPERIAL.y) - 4}
          fontSize="9"
          fill={t.label}
          fontFamily="ui-monospace,monospace"
          letterSpacing="0.1em"
        >
          1KM
        </text>
      )}

      {/* Imperial pin */}
      <g transform={`translate(${sx(IMPERIAL.x)}, ${sy(IMPERIAL.y)})`}>
        <circle r="22" fill={ns.primary} opacity="0.12" />
        <circle r="13" fill={ns.primary} />
        <path d="M -4 0 L 0 -5 L 4 0 L 0 5 Z" fill="#f4f6f0" />
        <text
          y="32"
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill={isDark ? "#cfd5c8" : ns.ink}
          fontFamily="inherit"
          letterSpacing="0.04em"
        >
          IMPERIAL
        </text>
      </g>

      {/* Property pins */}
      {properties.map((p, i) => {
        const score = scoredById[p.id]?.score ?? 0;
        const tone = score >= 75 ? ns.good : score >= 55 ? ns.warn : ns.bad;
        const isFoc = focused === p.id;
        return (
          <g
            key={p.id}
            transform={`translate(${sx(p.mapX)}, ${sy(p.mapY)})`}
            style={{ cursor: hoverable ? "pointer" : "default" }}
            onClick={() => onPin?.(p.id)}
          >
            {isFoc && <circle r="22" fill={tone} opacity="0.18" />}
            <circle
              r={isFoc ? 14 : 11}
              fill={tone}
              stroke={isDark ? "#1f2422" : "#fff"}
              strokeWidth={2.5}
            />
            <text
              textAnchor="middle"
              y="3.5"
              fontSize={isFoc ? 11 : 10}
              fontWeight="600"
              fill="#fff"
              fontFamily="ui-monospace,monospace"
            >
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* Map label */}
      <text
        x={sx(20)}
        y={sy(30)}
        fontSize="10"
        fill={t.label}
        letterSpacing="0.18em"
        fontFamily="ui-monospace,monospace"
      >
        CENTRAL LONDON · SW
      </text>
    </svg>
  );
}
