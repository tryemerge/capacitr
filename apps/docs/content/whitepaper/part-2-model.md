---
title: "Part II: The Capacitor Model"
---

## Part II: The Capacitor Model
Capacitor provides economic infrastructure that makes participation-based
token launches work. It solves three fundamental problems: how to lock
liquidity permanently, how to distribute value to participants fairly,
and how to create liquid markets for earned positions.

### The Flywheel: Meet Aviary
To illustrate how Capacitor works, imagine a company called **Aviary**
launching their token **BIRD**. Users who participate in growing
Aviary's ecosystem earn **emBIRD**—the emmission. Here's the flywheel:

1.  **BIRD launches at 1 ETH market cap** (single-sided liquidity, no
    capital required from Aviary)

2.  **Reserve set aside:** 5% of BIRD supply is locked as the "emmission
    reserve" to back all future emBIRD

3.  **Default Work activates:** Participants who engage with and grow
    the BIRD ecosystem earn emBIRD from the baseline metric

4.  **Custom Work (optional):** Aviary can also wire app-specific
    actions — content creation, feature usage, referrals

5.  **Trading generates fees:** Every BIRD trade has 2% fees

6.  **40/50/10 split:** 40% of fees compound in the emBIRD pool, 50%
    goes to Aviary, 10% to Capacitor

7.  **emBIRD appreciates:** As trading fees compound, emBIRD becomes
    worth more BIRD. Early participants earn more emBIRD per action
    (decay curve)

**The key insight:** emBIRD is a staking derivative where the yield
comes from LP trading fees. Your emBIRD increases in value as more BIRD
enters the pool, effectively giving you a claim on future fees.

### Emmissions (em{Token})
The core primitive is the em{Token}—an emmission that represents a
staked position in the project's fee-earning pool. Key properties:

-   **Reserve-backed at mint:** When you emmitt, reserve tokens transfer
    to pool, keeping price stable at mint time

-   **14-day minting lock:** Newly earned emmissions are locked in the
    holder's wallet for 14 days. No selling, no redeeming, no
    transferring. This prevents Work farming and immediate dumping

-   **After unlock — sell on EmPool:** Emmissions can be sold
    instantly on the secondary market at market price

-   **After unlock — redeem against LP:** Alternatively, emmissions
    can be burned to redeem the underlying LP value. This requires an
    additional 7-day lockup to allow graceful LP unwinding (3 weeks
    total from minting)

-   **Appreciates from fees:** 40% of all trading fees compound in the
    pool, increasing emmission value

### The Decay Curve
Emmissions are distributed according to a decay function that rewards
early participants:

### Tokens(n) = Base / (1 + K × n)
Each emmission produces fewer tokens than the last. The K parameter
controls steepness. At K = 0.002, the first Work earns approximately 3x
what later Work earns. This creates meaningful early-adopter advantage
without making late participation worthless.

### Fee Distribution
  ——————— ————- ————————————
  **Recipient**         **Share**     **Purpose**

  **Emmission Pool**    **40%**       Auto-compounds into LP position

  Creator               50%           Liquid revenue (1% of volume)

  Capacitor Protocol      10%           Protocol sustainability
  ——————— ————- ————————————

**Key insight:** Creator fees are undiluted. No matter how many people
emmitt, the creator always gets 50% of trading fees (1% of volume)
directly. Emmissions dilute each other; creator revenue doesn't dilute.

### Auto-Compounding: The Emmission Pool as a Growing LP Position
The emmission pool is not a passive pot of tokens. It is an active LP
position that compounds.

When fees arrive in the pool (40% of trading fees), the protocol
executes an auto-compound: it swaps half the fees into the other side of
the LP pair, mints new LP tokens, and adds them back to the pool's
position. This is the same mechanic used by yield optimizers like Beefy
Finance, applied natively at the protocol level. Compounding is
triggered dynamically — whenever accrued fees exceed the transaction
cost — meaning on low-cost chains like Base, it can happen multiple
times per day.

The result: the emmission pool's LP position grows with every compound.
A larger LP position captures a larger share of DEX-level swap fees.
Those LP fees are also compounded back in. So the pool earns from two
sources:

**1. Protocol allocation** — the 40% of trading fees directed by the
fee splitter.

**2. LP trading fees** — the pool's proportional share of DEX-level
swap fees, earned because it is itself a liquidity provider.

Both streams compound. The pool's share of total liquidity grows over
time, and with it, its share of all trading activity. emToken holders
receive both streams. No one else does.

### The Long-Term Dynamic
This creates a specific and intentional economic dynamic between
creators and participants.

The creator receives 50% of fees as liquid revenue. They spend it —
pay for compute, fund development, take profit. That's their income. It
does not compound.

The emmission pool compounds. It never withdraws. It reinvests every fee
event back into a larger LP position. Over time, the pool's share of
total liquidity grows relative to every other participant — including
the creator.

This means emToken holders — the people and agents who did the Work
— gradually earn a larger and larger claim on the token's economy. Not
because the creator is penalized. The creator is paid, consistently,
every day. But the participants who showed up, did the Work, and held
their positions are building compounding equity in the project they
helped grow.

**This is the core promise of participation economics:** the people who
build a project end up owning more of it. The creator gets revenue. The
participants get compounding ownership. Both are rewarded. But time
favors the participants.
