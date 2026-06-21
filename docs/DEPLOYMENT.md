# Deployment Guide

## Prerequisites

- Node.js 20+
- pnpm 9+
- MongoDB 6/7 (local Docker or MongoDB Atlas)
- Sui CLI (testnet, **1.30+ recommended**) + a funded testnet wallet
- Walrus testnet publisher / aggregator endpoints
- An OpenAI API key (used for embeddings)

> If you hit `error[E03006]: Could not resolve the name 'internal'` or
> `Client/Server api version mismatch` during `sui client publish`,
> see **docs/CONTRACTS_TROUBLESHOOTING.md** before doing anything else.

## 1. Install dependencies

```bash
pnpm install
```

## 2. Configure environment variables

```bash
cp apps/web/.env.local.example apps/web/.env.local

# Generate a random 32-byte AES key (base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Paste the output into APP_ENCRYPTION_KEY in .env.local
```

## 3. Publish the Move package

```bash
cd contracts
sui client switch --env testnet
sui client faucet                       # if your wallet has 0 SUI
sui client publish --gas-budget 200000000
# Copy the printed PackageID into SUI_PACKAGE_ID in apps/web/.env.local
```

> The `Move.toml` in this repo intentionally has **no explicit Sui dependency**.
> This is the recommended pattern — `sui client publish` will inject the
> framework version that matches your CLI automatically. Do NOT add a
> `[dependencies]` block pointing at `framework/testnet` unless you know
> your CLI is on the exact same protocol version as that branch.

## 4. Run locally

```bash
docker compose up -d mongo
pnpm dev
# Open http://localhost:3000/en
```

## 5. Production

- Frontend: deploy `apps/web` to Vercel.
- Database: MongoDB Atlas (M10+ recommended for later Atlas Vector Search).
- Storage: switch to Walrus mainnet publisher / aggregator URLs.
- Chain: switch Sui CLI / RPC URL to Sui mainnet.
- Monitoring: integrate Sentry, Datadog or a Grafana-Loki stack.
