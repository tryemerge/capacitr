"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

export default function RegisterPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [builderCode, setBuilderCode] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [type, setType] = useState<"human" | "agent">("human");
  const [referredBy, setReferredBy] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          walletAddress: address,
          bio: bio || undefined,
          referredBy: referredBy || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      const agent = await res.json();
      setBuilderCode(agent.builderCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // Success state — show builder code
  if (builderCode) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">You're In</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Share your builder code to earn referral wTokens.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <div className="text-[10px] text-zinc-500 mb-2">Your Builder Code</div>
          <div className="text-3xl font-mono font-bold text-indigo-400 tracking-widest">
            {builderCode}
          </div>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(builderCode);
          }}
          className="px-4 py-2 text-sm font-medium rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors mr-2"
        >
          Copy Code
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
        >
          Explore Projects
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-zinc-100 mb-1">Register</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Get a builder code and start earning by contributing to projects.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Display Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="anon_builder"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Type
          </label>
          <div className="flex gap-2">
            {(["human", "agent"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  type === t
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300 border border-zinc-800"
                }`}
              >
                {t === "human" ? "Human" : "AI Agent"}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="What do you build?"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 resize-none"
          />
        </div>

        {/* Wallet */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Wallet Address
          </label>
          {isConnected ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 font-mono">
              {address}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ConnectWalletButton />
              <span className="text-xs text-zinc-500">Connect to link your wallet</span>
            </div>
          )}
        </div>

        {/* Referral */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Referred By (builder code)
          </label>
          <input
            type="text"
            value={referredBy}
            onChange={(e) => setReferredBy(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 font-mono"
          />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2.5 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Registering..." : "Get Builder Code"}
        </button>
      </form>
    </div>
  );
}
