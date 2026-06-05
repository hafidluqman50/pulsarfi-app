// src/components/SparkLine.tsx
// Mini SVG sparkline chart for stock price history previews

import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────
interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  /** Override color. If omitted, auto-picks green/red from trend. */
  color?: string;
  /** Whether to fill the area under the line with a gradient. */
  showFill?: boolean;
}

// ─── Deterministic mock data generator ───────────────────────
/**
 * Generates a seeded pseudo-random sparkline for a given ticker so the
 * preview always looks consistent even when real history isn't fetched.
 * Seed is derived from the sum of character codes in the ticker.
 */
export function generateMockSparkline(ticker: string, points = 20): number[] {
  let seed = ticker
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff; // [0, 1)
  };

  const result: number[] = [100];
  for (let i = 1; i < points; i++) {
    const delta = (rand() - 0.46) * 4; // slight upward bias
    result.push(Math.max(80, Math.min(130, result[i - 1] + delta)));
  }
  return result;
}

// ─── Path builder ─────────────────────────────────────────────
function buildPath(data: number[], w: number, h: number): string {
  if (data.length < 2) return '';

  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;

  const xStep = w / (data.length - 1);
  const pad = 2; // vertical padding px

  const points = data.map((v, i) => ({
    x: i * xStep,
    y: pad + ((maxV - v) / range) * (h - pad * 2),
  }));

  // Smooth cubic bezier
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX.toFixed(1)} ${prev.y.toFixed(1)}, ${cpX.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  return d;
}

function buildFillPath(data: number[], w: number, h: number): string {
  const linePath = buildPath(data, w, h);
  if (!linePath) return '';
  const lastX = w.toFixed(1);
  const firstX = '0.0';
  return `${linePath} L ${lastX} ${h} L ${firstX} ${h} Z`;
}

// ─── Component ────────────────────────────────────────────────
export default function SparkLine({
  data,
  width = 64,
  height = 32,
  color,
  showFill = true,
}: SparkLineProps) {
  const trend = useMemo(
    () =>
      data.length >= 2
        ? data[data.length - 1] >= data[0]
        : true,
    [data],
  );

  const lineColor  = color ?? (trend ? '#1f7a4b' : '#c8102e');
  const linePath   = useMemo(() => buildPath(data, width, height), [data, width, height]);
  const fillPath   = useMemo(() => buildFillPath(data, width, height), [data, width, height]);
  const gradId     = `spark-grad-${lineColor.replace('#', '')}`;

  if (data.length < 2) {
    return <View style={{ width, height }} />;
  }

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {showFill && (
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={lineColor} stopOpacity={0.18} />
              <Stop offset="1" stopColor={lineColor} stopOpacity={0} />
            </LinearGradient>
          </Defs>
        )}
        {showFill && (
          <Path
            d={fillPath}
            fill={`url(#${gradId})`}
          />
        )}
        <Path
          d={linePath}
          stroke={lineColor}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
