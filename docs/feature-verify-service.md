# Feature: Verify Service (proof verification)

The verify service lets anyone confirm that a `proved` proof is actually valid — by
running the proof through its zkVM's **WASM stark verifier** together with the cluster's
**verification key (VK)**. There are two paths that share the same core logic:

- **In-browser** — the "verify" button on a proof runs the WASM verifier client-side.
- **Server-side** — an SSE endpoint streams `downloading → verifying → complete` status
  back to the client.

Verification is **computed on demand and never persisted.** There is no
verification-status column on `proofs`, no history, and no success-rate metric. Each
check re-runs from scratch (WASM modules are cached in-process to keep that cheap).

## The pieces

| File                                                | Role                                              |
| --------------------------------------------------- | ------------------------------------------------- |
| `lib/zkvm-verifiers.ts`                             | The list of verifiable zkVM slugs + type guard.    |
| `lib/server/verify-service.ts`                      | Server WASM loader + `verifyProofServer()`.        |
| `lib/server/vk-cache.ts`                            | Server in-memory VK cache (LRU).                   |
| `components/proof-buttons/use-verifier.tsx`         | Client WASM loader (`MODULE_LOADERS`).             |
| `components/proof-buttons/use-verify-proof.tsx`     | Client hook wrapping the verifier, tracks time.    |
| `lib/wasm-cache.ts`                                 | Client WASM module cache.                          |
| `components/proof-buttons/verify-button.tsx`        | The interactive "verify" button + state machine.   |
| `components/error-boundaries/WasmErrorBoundary.tsx` | Catches WASM init/verify failures.                 |
| `app/api/verify/proofs/[id]/route.ts`               | Server-side SSE verification endpoint.             |
| `app/api/verification-keys/upload/route.ts`         | Admin VK upload.                                   |
| `app/api/verification-keys/download/[id]/route.ts`  | VK download by proof id.                           |
| `lib/api/verification-keys.ts`                      | Supabase storage helpers for VKs.                  |
| `scripts/concat-vk.ts`                              | airbender-only VK assembly helper.                 |

## How verifiers are mapped

A proof's zkVM is found via `proof → cluster_version → zkvm_version → zkvm.slug`. That
**slug is the key** to everything:

1. `isVerifiableZkvm(slug)` (`lib/zkvm-verifiers.ts`) gates whether verification is even
   offered. The verifiable set is currently: `zisk`, `pico`, `ziren`, `sp1-hypercube`,
   `openvm`, `openvm2`, `airbender`, `airbender-80`, `venus`, `zkdtvm`.
2. The slug maps to a WASM package via a `switch` in **two** places that must stay in
   sync:
   - server: `loadWasmModule()` in `lib/server/verify-service.ts`,
   - client: `MODULE_LOADERS` in `components/proof-buttons/use-verifier.tsx`.
3. `verifyWithModule()` calls the package's `verify_stark(proofBytes, vkBytes)`.

### The WASM packages (package.json)

Each zkVM has a `@ethproofs/<name>-wasm-stark-verifier` dependency. Most are a plain
slug→package mapping. Two non-obvious cases:

- **`airbender-80`** is a *separate, older* verifier, pinned via an npm alias:
  `@ethproofs/airbender-wasm-stark-verifier-v0.10.0` → the 0.10.0 release. The current
  `airbender` slug points at 0.11.x. So both an 80-bit and a current airbender verifier
  ship side by side.
- **`zisk` has a fallback.** The primary `zisk` package plus an aliased
  `@ethproofs/zisk-wasm-stark-verifier-v0.12.0` (note: the alias name is misleading —
  it resolves to an older published version, not literally 0.12.0). The fallback exists
  to survive version transitions.

> **Naming gotcha:** the `-vX.Y.Z` aliases in package.json are just npm alias *names*;
> the real resolved version is whatever the alias points at in the registry, which does
> **not** always equal the number in the alias name. Don't trust the alias name —
> check what it resolves to.

### Two correctness quirks baked into `verifyWithModule()`

- **Fallback chain (zisk):** if the primary verifier throws *or* returns false, the code
  loads the fallback module and retries. Only zisk currently has a fallback
  (`loadFallbackModule()` returns `null` for everything else).
- **Pico double-signature:** for `pico`, it first tries
  `verify_stark("Pico", proof, vk)` and, on throw, falls through to
  `verify_stark("PicoPrism", proof, vk)`. This absorbs a zkVM API change.

## Verification key (VK) flow

VKs are uploaded per cluster version and stored in the Supabase **`verification-keys`**
bucket (`VERIFICATION_KEYS_BUCKET` in `lib/constants.ts`).

- **Upload** (`app/api/verification-keys/upload/route.ts`): admin or the owning team.
  Filename is `{teamSlug}_{clusterId}_{versionIndex}.bin`, and the upload writes the
  resulting path back to `cluster_versions.vk_path`, then revalidates caches.
- **Download** (`app/api/verification-keys/download/[id]/route.ts`): by proof id. Tries
  the versioned filename first, then falls back to a legacy `{teamSlug}_{clusterId}.bin`
  for older uploads.
- **Server cache** (`lib/server/vk-cache.ts`): in-memory, keyed by
  `clusterId_versionIndex`, LRU with limits (≈100 entries / 500 MB). Concurrent requests
  for the same VK are de-duplicated so a cache miss doesn't trigger parallel downloads
  ("thundering herd" guard).
- **airbender VKs** are assembled from two files (`setup.bin` + `layout.bin`) with a
  length prefix using `scripts/concat-vk.ts` before upload.

## End-to-end flows

### In-browser (the verify button)

1. Button is enabled only when `proof_status === "proved"` and `isVerifiableZkvm(slug)`.
2. On click: download the proof binary and the VK in parallel (button shows
   "downloading" + speed).
3. The WASM module for the slug is loaded once via `useVerifier()` and cached in
   `lib/wasm-cache.ts` (concurrent loads share one promise).
4. `verify_stark(...)` runs (button shows "verifying"); result → success (with time in
   ms) / failed / error. State auto-resets after a couple seconds.
5. The whole thing is wrapped in `WasmErrorBoundary` so a WASM crash shows a retry UI
   rather than blanking the page.

### Server-side (SSE endpoint)

`GET/POST app/api/verify/proofs/[id]/route.ts` streams Server-Sent Events:

1. **downloading** — fetch proof data (`getProofData`), validate: status is `proved`,
   the `cluster_version` exists and **is active**, and the zkVM is verifiable. Download
   the proof binary with retry (≈5 attempts, exponential backoff).
2. Fetch the VK via `getCachedVk(...)` if `vk_path` is set (else an empty VK is passed).
3. **verifying** — `verifyProofServer(slug, proofBytes, vkBytes)` (same core + fallback
   logic as the client).
4. **complete** — emits `{ isValid, error, verifyTime }` and closes the stream.

Errors (download failure, missing VK, inactive cluster version, unsupported zkVM) are
sent as terminal SSE events with a message.

> **Inactive cluster versions are intentionally blocked.** If
> `cluster_version.is_active === false`, server verification is refused
> ("verification disabled"). This stops people verifying against a retired verifier
> config. There's no DB flag for it — it's a conditional in the route.

## Upgrading or adding a verifier

**Upgrade** (the common case — recent commits like "upgrade zkdtvm verifier", "update
openvm2 verifier" did exactly this):

1. Bump the package version in `package.json` (and let `pnpm-lock.yaml` update).
2. Usually no code change — unless the import path or the `verify_stark` signature
   changed.
3. Smoke-test verification for that zkVM (browser button + server endpoint) against a
   real `proved` proof. If the new version is risky, consider wiring a fallback (see
   zisk) so a bad release degrades instead of breaking.

**Add a brand-new verifier:**

1. Add the `@ethproofs/<name>-wasm-stark-verifier` dependency.
2. Add the slug to `VerifiableZkvmSlug` **and** the `isVerifiableZkvm` array in
   `lib/zkvm-verifiers.ts`.
3. Add a `case` in `loadWasmModule()` (`lib/server/verify-service.ts`).
4. Add the loader to `MODULE_LOADERS` in
   `components/proof-buttons/use-verifier.tsx`.
5. (Optional) add a fallback loader if you need to keep an old version around.
6. Make sure VKs for that zkVM's clusters are uploaded (and use `concat-vk.ts` if it
   needs the airbender-style two-file assembly).

## Gotchas summary

- Server and client keep **separate** WASM caches and **separate** module switches — add
  a verifier in both.
- VK alias *names* in package.json don't necessarily equal the resolved version.
- Verification results aren't stored — there's no audit trail and no success metric (a
  plausible future feature).
- A proof with a missing/NULL `cluster_version` can't be verified; there's no graceful
  fallback.
- The server VK cache's 500 MB ceiling could be tight if proof/VK sizes grow — watch
  eviction under load.
</content>
