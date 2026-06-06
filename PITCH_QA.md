# Pitch Q&A

## 30 Second Opening

Sage Persuasion Colosseum turns an AI Agent into a player with a wallet, identity, and financial consequence. The Agent pays to challenge a Vault's opinion. If the argument fails, the fee grows the pool. If it succeeds, the winner wallet receives the pool.

## Live Demo Script

| Time | Action | What Judges See |
| --- | --- | --- |
| 0:00 | Open `/` with cleared localStorage | Wallet gate blocks the arena |
| 0:30 | Bind a demo wallet | Local wallet address appears |
| 1:00 | Enter one X/Twitter owner handle | xAPI simulation scans posts and generates Agent soul |
| 1:45 | Create Managed Agent | Agent receives 300 credits and optional NFA |
| 2:30 | Enter the arena | Vault stance, BNB pool, fee curve, danmu feed |
| 3:15 | Submit weak argument | Pay fee, queue, Arbiter, Sovereign, failed settlement |
| 4:15 | Submit strong argument | Same pipeline, success verdict, winner wallet |
| 5:00 | Open `/feed` and `/markets` | Attempt stream and prize leaderboard update |

## What Is Novel

- The Agent is not just chat output; it has a demo wallet, identity, and battle history.
- Failure is productive because every failed argument increases the prize pool.
- The judge is deterministic for live demo stability.
- The interface makes the invisible protocol flow visible: payment, queue, screening, evaluation, settlement.
- The xAPI owner scan is a front-end simulation: it makes the Agent feel autonomous without needing real crawler credentials.

## Expected Questions

### Is this real BNB?

No. This is a local hackathon demo. The app simulates BNB fees, tx hashes, NFA identity, and settlement in `data/db.json`.

### Is there a real wallet signature?

No. The provider buttons are demo gates. They create local wallet records and never request signatures.

### Is the xAPI scan real?

No. It is a local simulation inspired by WTF-xAPI. X/Twitter is a future integration target, not live data.

### Is the judge an external model?

No. The judge is deterministic TypeScript. It scores evidence, incentive loop, onchain narrative, and structure, then the UI derives six visible dimensions from that result.

### How do you win?

A strong argument must combine verifiable evidence, an incentive loop, onchain terms, and clear structure. The score threshold is 90.

### Why not make it random?

Live demos need reproducibility. Deterministic scoring lets the presenter reliably show both failure and success.

### What becomes production later?

Replace demo wallet binding with signed sessions, move fee escrow and prize release into contracts, store attempts in a durable database, and replace the local judge with an auditable AI or hybrid judging layer.

## Recovery Lines

| Problem | Line |
| --- | --- |
| Wallet gate looks stuck | Clear localStorage and reload |
| Data looks stale | Run `bun run sage:seed` |
| Strong argument fails | Mention evidence, fee/pool/reward, wallet/contract/BNB/NFA, and first/second/third |
| Build issue | Fall back to explaining local JSON state and deterministic judge |
