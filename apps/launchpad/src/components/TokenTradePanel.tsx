"use client";

import { useState, useMemo } from "react";
import { createBondingCurve, buyToken, sellToken, spotPrice } from "@/lib/emitter";

interface TokenTradePanelProps {
  projectId: string;
  symbol: string;
  reserveETH: number;
  reserveToken: number;
  onTrade?: () => void;
}

export function TokenTradePanel({
  projectId,
  symbol,
  reserveETH,
  reserveToken,
  onTrade,
}: TokenTradePanelProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [trading, setTrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = useMemo(
    () => createBondingCurve(reserveETH, reserveToken),
    [reserveETH, reserveToken],
  );

  const preview = useMemo(() => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return null;
    return side === "buy" ? buyToken(state, val) : sellToken(state, val);
  }, [state, side, amount]);

  const currentPrice = spotPrice(state);

  async function executeTrade() {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    setTrading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side, amount: val }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Trade failed");
      }

      setAmount("");
      onTrade?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trade failed");
    } finally {
      setTrading(false);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-zinc-400">Trade</span>
        <span className="text-xs font-mono text-zinc-500">
          1 ${symbol} = {currentPrice.toFixed(8)} ETH
        </span>
      </div>

      {/* Buy/Sell toggle */}
      <div className="flex gap-1 mb-4 bg-zinc-800/50 rounded-md p-0.5">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
            side === "buy"
              ? "bg-emerald-600 text-white"
              : "text-zinc-400 hover:text-zinc-300"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
            side === "sell"
              ? "bg-red-600 text-white"
              : "text-zinc-400 hover:text-zinc-300"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Amount input */}
      <div className="mb-3">
        <label className="block text-[10px] text-zinc-500 mb-1">
          {side === "buy" ? "ETH Amount" : `${symbol} Amount`}
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-700 font-mono focus:outline-none focus:border-zinc-700"
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-zinc-950 rounded-md p-3 mb-3 space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500">You receive</span>
            <span className="text-zinc-200 font-mono">
              {side === "buy"
                ? `${preview.tokensTraded.toFixed(2)} ${symbol}`
                : `${preview.ethTraded.toFixed(6)} ETH`}
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-500">Fee (2%)</span>
            <span className="text-zinc-400 font-mono">
              {preview.fee.toFixed(6)} ETH
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-600">→ Creator (50%)</span>
            <span className="text-zinc-500 font-mono">
              {preview.creatorFee.toFixed(6)}
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-600">→ Work Pool (40%)</span>
            <span className="text-zinc-500 font-mono">
              {preview.workPoolFee.toFixed(2)} tokens
            </span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-600">→ Protocol (10%)</span>
            <span className="text-zinc-500 font-mono">
              {preview.protocolFee.toFixed(6)}
            </span>
          </div>
          <div className="flex justify-between text-[10px] pt-1 border-t border-zinc-800">
            <span className="text-zinc-500">Price after</span>
            <span className="text-zinc-300 font-mono">
              {preview.priceAfter.toFixed(8)} ETH
            </span>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

      {/* Action button */}
      <button
        onClick={executeTrade}
        disabled={!preview || trading}
        className={`w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          side === "buy"
            ? "bg-emerald-600 text-white hover:bg-emerald-500"
            : "bg-red-600 text-white hover:bg-red-500"
        }`}
      >
        {trading
          ? "Processing..."
          : side === "buy"
            ? `Buy ${symbol}`
            : `Sell ${symbol}`}
      </button>

      <p className="text-[9px] text-zinc-600 text-center mt-2">
        DB mock mode — trades persist server-side
      </p>
    </div>
  );
}
