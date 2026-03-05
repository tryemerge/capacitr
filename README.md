# Capacitor

TypeScript monorepo: token launchpad, governance simulator, and documentation.

## Prerequisites

- Node.js >= 18
- [pnpm](https://pnpm.io/) 9.x (`corepack enable`)
- [composable.env](https://github.com/tryemerge/composable.env) (`ce`) CLI
- [PM2](https://pm2.keymetrics.io/) for multi-app dev (`npm i -g pm2`)

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Get secrets from a teammate
#    Place at repo root as .env.secrets.shared
#    Contains: GCP_DB_PASSWORD, PRIVY_APP_SECRET, PRIVY_CLIENT_ID, etc.

# 3. Build environment files
pnpm env:build local        # for local development
pnpm env:build production   # for production

# 4. Build all apps
pnpm build

# 5. Start all dev servers via PM2
pnpm ce start
```

## Apps

| App | Port | Description |
|-----|------|-------------|
| `apps/launchpad` | 3001 | Token launchpad — projects, agents, investors, bonding curves |
| `apps/sim` | 3000 | Governance & emitter simulator |
| `apps/docs` | 5173 | VitePress documentation site |

## Packages

| Package | Description |
|---------|-------------|
| `@capacitr/auth` | Shared Privy authentication — provider, middleware, server-side session |
| `@capacitr/database` | Drizzle ORM schema + Neon/PgBouncer client |
| `@capacitr/facilitator` | Deliberation facilitation agent |

## Scripts

```bash
# Environment
pnpm env:build <profile>     # Build .env files (local, production, staging)

# All apps
pnpm dev                      # Dev servers via turbo
pnpm build                    # Build all
pnpm start                    # Start all

# Single app
pnpm dev:launchpad            # Dev server for launchpad only
pnpm dev:sim                  # Dev server for sim only
pnpm dev:docs                 # Dev server for docs only

# Database
pnpm db:push                  # Push schema to database
pnpm db:studio                # Open Drizzle Studio
```

## Environment System

Uses [composable.env](https://github.com/tryemerge/composable.env) for environment management:

- `env/components/` — Shared config fragments (database, privy, etc.)
- `env/contracts/` — Per-app env var contracts with variable interpolation
- `env/profiles/` — Profile definitions (local, production, staging)
- `.env.secrets.shared` — Team secrets file (git-ignored, get from teammate)

`pnpm env:build local` resolves contracts + components + secrets into `.env.default` files per app.

## Planning System

Architectural decisions and implementation plans live in `planning/` at the repo root. Each feature gets its own folder:

```
planning/
├── hackathon/
│   ├── adr.md         # Architecture Decision Record (Y-statement format)
│   └── impl.md        # Implementation plan with checklists
├── cross-system-integration/
│   ├── adr.md
│   └── impl.md
└── archive/           # Completed or abandoned plans
```

- **ADR** — Records _why_ a decision was made using the Y-statement format (context, decision, alternatives rejected, tradeoffs accepted)
- **Impl** — Execution checklist reviewed before work begins, updated as work progresses. Each item gets checked off as completed.

## Claude Code Skills

Two custom skills in `.claude/skills/` for working with the planning system:

| Skill | Trigger | What it does |
|-------|---------|--------------|
| `/plan` | Start planning a feature | Creates ADR and/or impl docs in `planning/` after researching the codebase |
| `/work` | Execute an impl plan | Finds an active impl doc, works through its checklist items in order, checks each off immediately |

The impl doc is the source of truth for progress — anyone can read it and know exactly what's done and what's left.
