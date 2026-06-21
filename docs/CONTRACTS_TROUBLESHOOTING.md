# Sui Move — Build & Publish Troubleshooting

## Issue 1: `Could not resolve the name 'internal'` (E03006)

### Symptom

```
error[E03006]: unexpected name in this position
   ┌─ ...sui-framework/sources/funds_accumulator.move:77:68
   │
77 │ public(package) fun redeem<T: store>(withdrawal: Withdrawal<T>, _: internal::Permit<T>): T {
   │                                                                    ^^^^^^^^ Could not resolve the name 'internal'
```

Plus warnings like:

```
[warning] Client/Server api version mismatch, client api version : 1.61.x, server api version : 1.73.x
[warning] CLI's protocol version is 102, but the active network's protocol version is 126.
```

### Root Cause

Your local Sui CLI version is **older** than the on-chain framework you are pulling from `framework/testnet`. The newer framework uses a `module internal { ... }` block that the older CLI compiler can't resolve.

### Fix (already applied)

Remove the explicit Sui dependency from `Move.toml` and let the CLI auto-inject the framework version that matches the CLI itself:

```toml
[package]
name = "NexusMemory"
edition = "2024.beta"

# Do NOT declare [dependencies] for Sui / MoveStdlib here.
# Modern `sui client publish` injects them automatically at the version
# matching your CLI.

[addresses]
nexus_memory = "0x0"
```

### (Optional) Upgrade your CLI

If you also want the very latest features, upgrade Sui CLI:

```bash
# macOS (Homebrew)
brew upgrade sui

# Or build from source
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui

# Verify
sui --version
```

---

## Issue 2: `unnecessary 'entry' on a 'public' function` (W99010)

Warnings only — not a build failure. We removed all `public entry fun` declarations because `public fun` is sufficient for being callable from a PTB (Programmable Transaction Block) and is more composable.

If you still see this warning anywhere, change:

```move
public entry fun foo(...) { ... }
```

to:

```move
public fun foo(...) { ... }
```

---

## Issue 3: `INCLUDING DEPENDENCY` git clone is slow

The toolchain caches dependencies under `~/.move/`. Once the first clone completes you won't pay the cost again. To re-fetch:

```bash
rm -rf ~/.move/
sui client publish --gas-budget 200000000
```

---

## Issue 4: Faucet / Gas

First-time wallets have zero SUI. Request testnet gas:

```bash
sui client faucet
sui client gas
```

---

## Recommended publish flow

```bash
cd contracts
sui client switch --env testnet
sui client faucet                       # if balance == 0
sui client publish --gas-budget 200000000

# Read the printed "PackageID" line, e.g.
#   Published Objects:
#     ┌──
#     │ PackageID: 0x1234abcd...
#     └──
# and copy that into apps/web/.env.local as SUI_PACKAGE_ID
```
