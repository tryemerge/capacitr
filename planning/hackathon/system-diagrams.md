# System Diagrams

## Sequence Diagram: Idea Launch → Work → Graduation

```mermaid
sequenceDiagram
    participant Creator
    participant Platform as Capacitr Platform
    participant BC as Bonding Curve
    participant OA as Orchestration Agent
    participant Worker as Worker (Agent/Human)
    participant Chain as On-Chain
    participant Pool as Work Token Pool

    Note over Creator,Pool: PHASE 1: BONDING CURVE (PRE-GRADUATION)

    Creator->>Platform: Write system prompt + settings
    Platform->>BC: Deploy token on bonding curve
    Platform->>OA: Spin up orchestration agent (seeded with prompt)
    Platform->>Chain: Publish idea to marketplace

    loop Trading Activity
        Note right of BC: Anyone can buy/sell
        BC->>BC: 2% fee on each trade
        BC->>Pool: 40% of fee → work token pool
        BC->>Creator: 50% of fee → creator revenue
        BC->>Platform: 10% of fee → protocol
    end

    Worker->>Chain: Submit work on-chain (self-attested + requested wToken amount)
    OA->>Chain: Review submission against system prompt

    alt Auto-approved
        OA->>Chain: Approve → mint wTokens to worker
    else Ambiguous
        OA->>Chain: Trigger snap poll
        Note right of Chain: Token holders vote (short window)
        Chain->>Chain: Tally votes
        alt Approved
            Chain->>Chain: Mint wTokens to worker
        else Rejected
            Chain->>Worker: Submission rejected
        end
    end

    Note over Worker,Pool: wTokens are NOT pegged yet — earned claims only

    Note over Creator,Pool: GRADUATION (Market cap threshold reached)

    BC->>Chain: Migrate liquidity to Uniswap pool
    Chain->>Chain: Bond wToken supply to pool value
    Note right of Chain: wToken price = pool value / total wTokens
    Chain->>Chain: Set reserve pool for future emissions

    Note over Creator,Pool: PHASE 2: DEX TRADING (POST-GRADUATION)

    loop Continuous Trading
        Chain->>Pool: 40% of swap fees → work token pool
        Chain->>Creator: 50% → creator
        Chain->>Platform: 10% → protocol
    end

    Worker->>Chain: Submit work (same flow as pre-graduation)
    Chain->>Chain: Mint new wTokens from reserve pool

    Note over Chain,Pool: Governance activates: quadratic voting, wToken = 1.5x weight
```

## Flow Chart: System Architecture

```mermaid
flowchart TB
    subgraph SUPPLY["SUPPLY SIDE"]
        C[Creator] -->|writes| SP[System Prompt + Settings]
        SP -->|seeds| OA[Orchestration Agent]
        SP -->|configures| CP[Context Packs]
    end

    subgraph LAUNCH["TOKEN LAUNCH"]
        SP -->|deploys| BC[Bonding Curve]
        BC -->|2% fee split| FEE{Fee Splitter}
        FEE -->|40%| WP[Work Token Pool]
        FEE -->|50%| CR[Creator Revenue]
        FEE -->|10%| PR[Protocol Revenue]
    end

    subgraph DEMAND["DEMAND SIDE"]
        BYOA[BYOA Agents] -->|browse| MKT[Idea Marketplace]
        PSA[Platform-Spun Agents] -->|browse| MKT
        HUM[Direct Humans] -->|browse| MKT
    end

    subgraph WORK["WORK FLOW"]
        MKT -->|discover idea| WS[Work Submission]
        WS -->|on-chain, self-attested| OA
        OA -->|auto-approve| MINT[Mint wTokens]
        OA -->|ambiguous| SNAP[Snap Poll]
        SNAP -->|approved| MINT
        SNAP -->|rejected| REJ[Rejected]
        SDK[Work SDK] -->|third-party verification| WS
    end

    subgraph GRAD["GRADUATION"]
        BC -->|market cap threshold| MIG[Migrate to Uniswap]
        MIG --> BOND[Bond wTokens to Pool]
        BOND --> RES[Set Reserve Pool]
        RES --> DEX[DEX Trading Begins]
    end

    subgraph POSTGOV["POST-GRADUATION"]
        DEX -->|fees continue 40/50/10| WP
        RES -->|funds new emissions| MINT
        GOV[Governance] -->|quadratic voting| DEC[Decisions]
        GOV -.->|wToken = 1.5x weight| DEC
    end

    WP --> BOND

    style SUPPLY fill:#1a4a3a,stroke:#2ecc71,color:#fff
    style LAUNCH fill:#1a3a5c,stroke:#4a9eff,color:#fff
    style DEMAND fill:#4a3a1a,stroke:#f39c12,color:#fff
    style WORK fill:#2d1a4e,stroke:#9b59b6,color:#fff
    style GRAD fill:#5c1a1a,stroke:#e74c3c,color:#fff
    style POSTGOV fill:#1a4a4a,stroke:#1abc9c,color:#fff
```

## Flow Chart: Work Submission Lifecycle

```mermaid
flowchart LR
    A[Worker submits work on-chain] -->|includes: work proof + requested wToken amount| B{Orchestration Agent}
    B -->|clear match to system prompt| C[Auto-Approve]
    B -->|ambiguous or high claim| D[Snap Poll]
    B -->|obvious spam| E[Auto-Reject]

    D -->|token holders vote| F{Vote Result}
    F -->|approved| C
    F -->|rejected| E

    C --> G[Mint wTokens to worker]
    G --> H{Pre or Post Graduation?}
    H -->|pre| I[wTokens are earned claims, not yet pegged]
    H -->|post| J[wTokens track pool value immediately]

    subgraph SDK["Third-Party Work SDK"]
        S1[External signal provider] -->|e.g. Twitter engagement| S2[Submit tx on behalf of user]
        S2 --> A
    end

    style C fill:#1a4a3a,stroke:#2ecc71,color:#fff
    style E fill:#5c1a1a,stroke:#e74c3c,color:#fff
    style D fill:#4a3a1a,stroke:#f39c12,color:#fff
```

## Flow Chart: Fee Flow (Pre vs Post Graduation)

```mermaid
flowchart TB
    subgraph PRE["PRE-GRADUATION"]
        T1[Trade on Bonding Curve] -->|2% fee| F1{Fee Splitter}
        F1 -->|40%| P1[Work Token Pool<br/>accumulates, not yet bonded]
        F1 -->|50%| C1[Creator Revenue]
        F1 -->|10%| PR1[Protocol]
    end

    subgraph GRAD_EVENT["GRADUATION EVENT"]
        P1 -->|pool value| BOND[Bond: pool value / wToken supply = price]
        WT[Outstanding wTokens] --> BOND
        BOND --> PEGGED[wTokens now track pool value]
        BOND --> RESERVE[Reserve pool set for future emissions]
    end

    subgraph POST["POST-GRADUATION"]
        T2[Trade on Uniswap] -->|fee via V4 hooks or wrapper| F2{Fee Splitter}
        F2 -->|40%| P2[Work Token Pool<br/>compounds, wTokens appreciate]
        F2 -->|50%| C2[Creator Revenue]
        F2 -->|10%| PR2[Protocol]
        RESERVE -->|funds new wTokens| NEW[New Work Emissions]
    end

    style PRE fill:#1a3a5c,stroke:#4a9eff,color:#fff
    style GRAD_EVENT fill:#5c1a1a,stroke:#e74c3c,color:#fff
    style POST fill:#1a4a3a,stroke:#2ecc71,color:#fff
```
