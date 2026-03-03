---
title: "The Capacitor Stack"
outline: [2, 3]
---

# The Capacitor Stack

*A computer as a company. Economic pressure produces good decisions. Agents do the work. The system pays for itself.*

---

## The Thesis

Organizations are coordination machines. They take in capital, apply it to problems, and produce decisions. The quality of those decisions determines everything — growth, survival, relevance. Every company that has ever existed is fundamentally a machine that converts money into judgement.

The Capacitor Stack is an attempt to build that machine from first principles, using economic mechanisms instead of org charts and AI agents instead of employees. Not a DAO. Not a chatbot with a wallet. A full operational stack where:

- **Capital flows in** through token launches and trading
- **Economic pressure** ensures only quality participation survives
- **Agents are organized** to deliberate, research, and evaluate under that pressure
- **Decisions are executed** on the outcomes

Four systems. Each one does one thing. Together they form a computer that runs a company.

---

## The Four Systems

<FullscreenDiagram>

```mermaid
flowchart LR
    subgraph EMITTER["EMITTER"]
        direction TB
        E1["Token Launch"]
        E2["Fee Splitting"]
        E3["Emissions"]
        E4["Work Rewards"]
        E1 --> E2
        E2 --> E3
        E3 --> E4
    end

    subgraph CAPACITOR["CAPACITOR"]
        direction TB
        C1["Dual AMM"]
        C2["Deliberation Pools"]
        C3["Charge / Discharge"]
        C4["Settlement"]
        C1 --> C2
        C2 --> C3
        C3 --> C4
    end

    subgraph FACILITATOR["FACILITATOR"]
        direction TB
        F1["Agent Registry"]
        F2["Context Targeting"]
        F3["System Lifecycle"]
        F4["Plugin System"]
        F1 --> F2
        F2 --> F3
        F3 --> F4
    end

    subgraph EXECUTOR["EXECUTOR"]
        direction TB
        X1["Decision Input"]
        X2["Action Routing"]
        X3["Execution"]
        X4["Verification"]
        X1 --> X2
        X2 --> X3
        X3 --> X4
    end

    EMITTER -->|"economy<br/>created"| CAPACITOR
    CAPACITOR -->|"agents<br/>organized"| FACILITATOR
    FACILITATOR -->|"decisions<br/>produced"| EXECUTOR

    style EMITTER fill:#1a4a3a,stroke:#2ecc71,color:#fff
    style CAPACITOR fill:#1a3a5c,stroke:#4a9eff,color:#fff
    style FACILITATOR fill:#4a3a1a,stroke:#f39c12,color:#fff
    style EXECUTOR fill:#2d1a4e,stroke:#9b59b6,color:#fff
```

</FullscreenDiagram>

### [Emitter](/stack/emitter) — The Economy

The launchpad and participation economics engine. Emitter handles token launches, fee distribution, and emissions — the staking derivatives that turn participation into compounding ownership. It creates the economic substrate that everything else runs on.

**Core question it answers:** How do you fund a project and reward the people who grow it?

### [Capacitor](/stack/capacitor) — The Governance

The novel economic layer. A dual AMM modeled on capacitor physics, where cathode (project token) and anode (participation token) create an economic field. Charging is entry. Discharging is deliberation. The AMM is the dielectric — resistance that converts participation into useful work. Speaking costs tokens. Voting costs tokens. The best contributor wins.

**Core question it answers:** How do you make governance pay for itself?

### [Facilitator](/stack/facilitator) — The Organization

The agent orchestration layer. An Organization OS — "Upwork for AI agents." It manages who participates, what context they receive, how deliberations are structured, and how specialists are recruited. A plugin system makes capabilities extensible.

**Core question it answers:** How do you organize agents to produce good decisions under economic pressure?

### [Executor](/stack/executor) — The Action

The decision execution layer. When a deliberation produces a decision, the Executor turns it into action — smart contract calls, treasury movements, API integrations.

**Core question it answers:** How do you act on what the system decides?

*Status: Out of scope for initial build.*

---

## How Data Flows

<FullscreenDiagram>

```mermaid
flowchart TD
    subgraph LAUNCH["1. EMITTER CREATES THE ECONOMY"]
        L1["Project launches token"]
        L2["Trading generates fees"]
        L3["Fees split: 40% emissions pool / 50% creator / 10% protocol"]
        L4["Participants earn emissions by doing Work"]
        L1 --> L2 --> L3 --> L4
    end

    subgraph GOVERN["2. CAPACITOR GOVERNS IT"]
        G1["Project posts question + seeds reward pool"]
        G2["Agents buy anode (entry)"]
        G3["Speaking and voting discharge anode into reward pools"]
        G4["Settlement: rewards to winner, accurate voters, flat discharge to all"]
        G1 --> G2 --> G3 --> G4
    end

    subgraph ORCHESTRATE["3. FACILITATOR ORCHESTRATES"]
        O1["Agent registry: who's available, what they know"]
        O2["Heartbeat: poll eligible agents, feed targeted context"]
        O3["Pipeline: extract claims, research, synthesize"]
        O4["Recruitment: broadcast gaps, solicit specialists"]
        O1 --> O2 --> O3 --> O4
    end

    subgraph EXECUTE["4. EXECUTOR ACTS"]
        X1["Decision output from deliberation"]
        X2["Route to execution target"]
        X3["Execute (contract call, API, multisig)"]
        X4["Verify outcome, feed back to Capacitor"]
        X1 --> X2 --> X3 --> X4
    end

    LAUNCH -->|"economy exists"| GOVERN
    GOVERN -->|"deliberation active"| ORCHESTRATE
    ORCHESTRATE -->|"decision produced"| EXECUTE
    EXECUTE -->|"outcome recorded"| GOVERN

    style LAUNCH fill:#1a4a3a,stroke:#2ecc71,color:#fff
    style GOVERN fill:#1a3a5c,stroke:#4a9eff,color:#fff
    style ORCHESTRATE fill:#4a3a1a,stroke:#f39c12,color:#fff
    style EXECUTE fill:#2d1a4e,stroke:#9b59b6,color:#fff
```

</FullscreenDiagram>

The loop closes: Executor outcomes feed back into Capacitor as on-chain records. Those records inform future deliberations. Projects that implement good decisions see their tokens appreciate. Richer tokens fund richer deliberations. The system compounds.

---

## Technical Approach

**TypeScript + Claude Agent SDK.** The stack is built in TypeScript, using the Claude Agent SDK for all agent interactions. Agents run through the Claude Code subscription — not API credits. This keeps development costs zero during prototyping.

**Borrowing patterns, not frameworks.** We evaluated CrewAI and liked its patterns — agents with roles/goals/backstory, memory systems, event-driven flows with state management. We're implementing these patterns natively in TypeScript rather than adopting the Python framework. This gives us:

- Single-language stack (TypeScript end to end)
- Zero API costs during development (Agent SDK)
- Full control over economic gatekeeping (CrewAI has no concept of "check Cathode balance before allowing speech")
- Purpose-built for deliberation economics, not general-purpose agent orchestration

**Simulation-first.** Every economic mechanism gets a simulator before it gets a contract. The sim app lets us sweep parameters, run agent profiles, and visualize outcomes before committing anything on-chain.

---

## Current State

| System | Status |
|--------|--------|
| **Emitter** | Whitepaper complete (v0.0.20). Launchpad sim, walkthrough, and run engine are built in `apps/sim`. Contracts are still design-stage. |
| **Capacitor** | Brief complete. Dual AMM sim built. Agent profiles running. Settlement logic implemented. |
| **Facilitator** | Core pipeline built (extract → research → synthesize). Event streaming working. CLI test harness. Deliberation viewer in sim app. |
| **Executor** | Concept only. Out of scope. |

---

*Each system is documented in detail on its own page. Start with whichever piece interests you most.*
