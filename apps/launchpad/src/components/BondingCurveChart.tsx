"use client";

import { useMemo } from "react";
import { createBondingCurve, curvePoints, spotPrice } from "@/lib/emitter";

interface BondingCurveChartProps {
  reserveETH?: number;
  reserveToken?: number;
}

export function BondingCurveChart({
  reserveETH = 10,
  reserveToken = 1_000_000,
}: BondingCurveChartProps) {
  const state = useMemo(
    () => createBondingCurve(reserveETH, reserveToken),
    [reserveETH, reserveToken],
  );

  const points = useMemo(() => curvePoints(state, 40), [state]);
  const currentPrice = spotPrice(state);

  // Normalize for CSS rendering
  const maxPrice = Math.max(...points.map((p) => p.price));
  const minPrice = Math.min(...points.map((p) => p.price));
  const priceRange = maxPrice - minPrice || 1;

  const currentPriceY = ((currentPrice - minPrice) / priceRange) * 100;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-400">Bonding Curve</span>
        <span className="text-xs font-mono text-zinc-300">
          {currentPrice.toFixed(8)} ETH
        </span>
      </div>

      {/* CSS-only chart */}
      <div className="relative h-32 flex items-end gap-[1px]">
        {points.map((p, i) => {
          const height = ((p.price - minPrice) / priceRange) * 100;
          const isCurrentArea =
            Math.abs(p.supply - state.reserveToken) <
            (state.reserveToken * 3 - state.reserveToken * 0.1) / 40;

          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all"
              style={{
                height: `${Math.max(height, 1)}%`,
                backgroundColor: isCurrentArea
                  ? "rgb(99 102 241)"
                  : "rgb(63 63 70)",
              }}
            />
          );
        })}

        {/* Current price marker */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-indigo-500/50"
          style={{ bottom: `${currentPriceY}%` }}
        >
          <span className="absolute right-0 -top-3 text-[9px] text-indigo-400 font-mono">
            current
          </span>
        </div>
      </div>

      <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
        <span>Low Supply</span>
        <span>High Supply</span>
      </div>
    </div>
  );
}
