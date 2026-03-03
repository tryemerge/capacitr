---
title: "Part IV: Implementation"
---

## Part IV: Implementation
Capacitor is built as **native infrastructure** from day one. A single
transaction deploys a token with full Capacitor mechanics: emmission
distribution, fee splitting, and permanent liquidity locking. The
off-chain emWork SDK handles Work measurement and reporting.

### Smart Contract Architecture
The protocol consists of 8 core contracts organized into three layers:

### Launchpad Layer
Handles token creation and initial liquidity:

-   **CapacitorFactory:** Main entry point. Deploys token + all
    infrastructure in one transaction.

-   **CapacitorToken:** Native ERC-20 with built-in 2% fee-on-transfer.
    Fees route automatically to FeeSplitter.

-   **CapacitorLpLocker:** Locks Uniswap V3/V4 LP positions permanently.
    Rug-proof by design.

### Engine Layer
Manages emmissions and distribution:

-   **CapacitorEngine:** Main orchestrator per-token. Holds reserve,
    manages emmission pool, and exposes reportWork() — the single
    entry point for reporting user actions. Only the project's
    authorized address can call it.

-   **EmToken:** Emmission ERC-20 (em{TOKEN}). Mintable only by Engine.
    14-day minting lock on new mints.

-   **EmPool:** Emmission liquidity pool. Simple x\*y=k AMM where
    emmissions trade against base tokens.

### Infrastructure Layer
Shared utilities and math:

-   **FeeSplitter:** Routes all fees: 40% → EmPool, 50% → Creator, 10% →
    Protocol.

-   **DecayCurve:** Library implementing Tokens(n) = Base / (1 + K × n).
    Pure math, no state.

### Deployment Flow
When a creator (or agent) launches through Capacitor:

1.  Call CapacitorFactory.launch(name, symbol, reservePct)

2.  Factory deploys CapacitorToken with fee-on-transfer mechanics

3.  Factory creates Uniswap pool with single-sided liquidity (1 ETH
    market cap)

4.  LP position locked permanently via CapacitorLpLocker

5.  Factory deploys CapacitorEngine, EmToken, EmPool for this token

6.  Reserve allocation (e.g., 5% of supply) transferred to Engine

7.  Default Work metric activated; project receives authorized address
    for reportWork()

*Result:* One transaction, fully operational token with emmissions, fee
distribution, default Work metric, and permanent liquidity.

### Contract Summary
  —————— —————- ————————————-
  **Contract**       **Layer**        **Purpose**

  CapacitorFactory     Launchpad        One-click token deployment

  CapacitorToken       Launchpad        Fee-on-transfer ERC-20

  CapacitorLpLocker    Launchpad        Permanent LP locking

  CapacitorEngine      Engine           Per-token orchestration +
                                      reportWork()

  EmToken            Engine           Emmission token with 14-day minting
                                      lock

  EmPool             Engine           Emmission liquidity pool

  FeeSplitter        Infrastructure   40/50/10 fee distribution

  DecayCurve         Infrastructure   Emmission math library
  —————— —————- ————————————-

**Timeline:** Estimated 10--12 weeks from development start to mainnet
deployment.
