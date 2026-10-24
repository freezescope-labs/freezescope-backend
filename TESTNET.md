# Controlled testnet pilot

Contract `CA4BH362U546SAZ243OPMFDYSMG65WL5NYHO5UYZXTQKJDEB76GZLIKX`

Optimized Wasm SHA-256 `76db8ffb9c03c6b731a016f83f57bf171acd8082700b6b64546ad48d04594d8a` (1159 bytes). Built with Stellar CLI 28.1.0, Rust 1.97.1 and soroban-sdk 29.0.1.

- Upload review specimen: `8cfcb02f6dbf012b5a87d29322580857223ba2b1b8ab58289b6e0250625a2b98` — confirmed SUCCESS
- Deploy review specimen: `2a5945bb59e2c11272fa13b1aebb041fe35946ca34c12580373c8a0537ba7381` — confirmed SUCCESS
- Initialize review value: `72654e9435b6ecd749ca0274d79cdbfd56b2325b04386c1d7bebf648cb956212` — confirmed SUCCESS

The baseline is an actual point-in-time testnet RPC read of settings 17 (frozen keys) and 19 (bypass hashes). The initial snapshot has neither frozen keys nor bypass hashes. Two independently simulated specimen calls retain unsigned envelope and resource XDR. A local proposal adds only the persistent value key; the engine then calculates a matching read-only or read-write hit. No validator vote, real frozen transaction rejection, bypass recovery or mainnet execution was attempted.

Reproduce from sibling clones:
```sh
stellar contract build --locked --manifest-path freezescope-contracts/Cargo.toml --out-dir build
FREEZESCOPE_ALLOW_TESTNET=1 \
FREEZESCOPE_PILOT_DIR=/absolute/private/path/outside/backend \
FREEZESCOPE_WASM=/absolute/path/build/freezescope_specimen.wasm \
node freezescope-backend/pilot-testnet.mjs
```

The opt-in pilot uses only disposable Friendbot identities and updates public specimen/evidence files. Keep its private directory outside all source checkouts. `node freezescope-backend/verify-testnet.mjs` independently checks currently available public receipts and the deployed executable hash, then replays retained counterfactuals. Replaying saved XDR does not authenticate historical simulation responses.
