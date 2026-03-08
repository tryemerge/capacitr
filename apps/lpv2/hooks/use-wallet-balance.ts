"use client"

import { useState, useEffect } from "react"

const ARBITRUM_SEPOLIA_RPC = "https://arbitrum-sepolia.drpc.org"

export function useWalletBalance(address: string | undefined) {
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setBalance(null)
      return
    }

    let cancelled = false

    async function fetchBalance() {
      try {
        const res = await fetch(ARBITRUM_SEPOLIA_RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getBalance",
            params: [address, "latest"],
          }),
        })
        const data = await res.json()
        if (!cancelled && data.result) {
          const wei = BigInt(data.result)
          const eth = Number(wei) / 1e18
          setBalance(eth.toFixed(4))
        }
      } catch {
        if (!cancelled) setBalance(null)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 15_000) // refresh every 15s

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [address])

  return balance
}
