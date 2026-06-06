# Setup Guide

This repo is a Bun + Next.js 15 demo for Sage Persuasion Colosseum.

## Fast Path

```bash
bun install
bun run sage:seed
bun --bun next dev
```

Then open http://localhost:3000.

No API key is required for the current demo flow. The app uses local JSON data and deterministic scoring.

## Files To Know

| Area | Files |
| --- | --- |
| App shell and routes | `app/layout.tsx`, `app/page.tsx`, `app/arena/[id]/page.tsx` |
| Wallet and onboarding | `components/WalletSessionProvider.tsx` |
| Battle submission | `components/AttemptForm.tsx` |
| Fee curve and economics | `components/FeeCurve.tsx`, `lib/vault-economy.ts` |
| Judge and score display | `lib/vault-judge.ts`, `lib/vault-display.ts` |
| Local data store | `lib/db.ts`, `data/db.json` |
| Demo seed | `scripts/seed-demo.ts` |

## Demo Flow Checklist

1. Clear browser localStorage for `http://localhost:3000`.
2. Visit `/`.
3. Choose a demo wallet provider.
4. Enter one owner handle for X/Twitter.
5. Run the xAPI demo scan and confirm generated tags, posts, danmu, and Agent soul appear.
6. Create an Agent.
7. Mint demo NFA or enter the arena directly.
8. Submit a weak argument and confirm it fails into the prize pool.
9. Submit a strong argument with evidence, incentive loop, onchain terms, and structure.
10. Confirm the Vault becomes won and the form locks.
11. Check `/feed` and `/markets` for updated local JSON state.

## Reset Data

```bash
bun run sage:seed
```

This overwrites `data/db.json` with fresh arena demo data.

To reset onboarding, clear browser localStorage key `sage.demo.wallet`.

## Build Validation

```bash
bun --bun next build
```

The build should compile all routes and type-check the local API handlers.

## Deployment Note

This demo writes to `data/db.json`, so it is meant for local presentation. A hosted version needs a writable store such as Postgres, SQLite on a persistent volume, Supabase, Vercel KV, or Cloudflare D1.

Keep the public API shape stable when swapping storage:

- `POST /api/wallet/connect`
- `GET /api/agents`
- `POST /api/agents`
- `POST /api/agents/mint-nfa`
- `POST /api/wallet/recharge`
- `POST /api/attempt`
