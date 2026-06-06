# Sage Persuasion Colosseum

ETH Beijing 2026 hackathon demo. A wallet owns a Managed Agent, the Agent pays a demo BNB fee to challenge Sage Vault, and the Vault either rejects the argument or releases the prize pool to the winner wallet.

This is a frontend-first demo. It does not request real signatures, send real BNB, deploy contracts, or call an external judge model. Wallets, NFA identity, fees, tx hashes, settlement, and prize pools are stored in local JSON for a stable live presentation.

## What You Demo

1. Bind a demo wallet with MetaMask / OKX / WalletConnect style buttons.
2. Enter one X/Twitter owner handle and let the frontend simulate a WTF-xAPI scan.
3. Create a Managed Agent from the generated owner signal, with personality, debate style, risk profile, and optional demo NFA.
4. Enter the Sage Vault Arena.
5. Submit one Agent argument.
6. Watch the battle pipeline: pay fee, queue, Arbiter pre-screen, Sovereign evaluation, settlement.
7. Failed attempts add the fee to the prize pool. Strong arguments can pass the deterministic judge and lock the pool to the winner wallet.

## Core Routes

| Route | Purpose |
| --- | --- |
| `/` | Main arena entry and current Vault stance |
| `/arena/[id]` | Playable persuasion battle |
| `/feed` | Attempt stream and recent verdicts |
| `/markets` | Prize-pool leaderboard |
| `/about` | Mechanism and demo constants |
| `/agent` | Wallet, Agent, NFA, and judge rule console |

Legacy `/pick/[id]` redirects to `/arena`. Legacy `/api/cosign` is deprecated; the active challenge endpoint is `/api/attempt`.

## Run Locally

```bash
bun install
bun run sage:seed
bun --bun next dev
```

Open http://localhost:3000.

Useful validation:

```bash
bun run sage:seed
bun --bun next build
```

## Demo Data

`scripts/seed-demo.ts` writes `data/db.json` with:

- one active Vault challenge
- one already-won Vault challenge
- six demo wallets and Managed Agents
- failed attempts that grow the prize pool
- one successful argument sample
- local transaction records for wallet connect, credit grants, NFA minting, fee deposits, and prize release

The fee curve is:

```txt
fee(n) = 0.005 * 1.0038^(n - 1), cap 0.5 BNB
```

The win threshold is `90/100`.

## Deterministic Judge

The judge is local and reproducible. It rewards arguments that include:

- verifiable identity or evidence: signature, attestation, audit, event, proof
- incentive loop: fee, pool, prize, reward, failure, success
- onchain narrative: wallet, contract, BNB, EVM, NFA, protocol, asset
- clear structure: first/second/third, because/therefore, concrete numbers

The UI displays six derived dimensions: Evidence, Logic, Incentive, Onchain, Narrative, and Risk Control. Only the original three judge criteria are stored in `data/db.json`; the six bars are presentation helpers.

## xAPI Owner Scan Simulation

The Agent creation flow is inspired by WTF-xAPI, which exposes agent-friendly social and search APIs. This demo does not call WTF-xAPI, X/Twitter, OpenAI, Codex, or any cloud worker.

The flow is local-only:

- input one owner handle for X/Twitter
- run a simulated xAPI gateway scan animation
- generate mock posts, tags, tone, danmu, and Agent soul
- store the generated owner signal inside the local Agent profile

X/Twitter is shown as a future integration target, not a live data source.

## Boundaries

- No real wallet signing.
- No real BNB transfer.
- No contract deployment.
- No external LLM judge.
- No production auth or database.

For a production version, replace `lib/db.ts` with a durable store, replace demo wallet actions with signed sessions, and move fee settlement into contracts.
