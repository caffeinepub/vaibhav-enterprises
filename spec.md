# Vaibhav Enterprises

## Current State
Backend imports `mo:core/Map` and uses it in `preupgrade`/`postupgrade` hooks with `.entries().toArray()` and `.add()` calls. If these methods trap at runtime the canister upgrade is aborted and `productList`/`enquiryList` data is lost on every redeploy. Products added via admin panel don't persist and enquiries submitted on the site don't appear in the admin inbox.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Rewrite backend `main.mo`: remove ALL `mo:core` imports and Map usage, remove complex preupgrade/postupgrade hooks, use ONLY stable arrays and `mo:base` library
- Simplify preupgrade/postupgrade to only copy stable vars that are actually used

### Remove
- `mo:core/Map` import and all Map-related variables and operations from backend
- Complex migration logic in postupgrade that could trap

## Implementation Plan
1. Rewrite `src/backend/main.mo` using only `mo:base/Array`, `mo:base/Time` — no mo:core
2. Keep stable vars: `productList`, `enquiryList`, `nextId`, `nextEnquiryId`
3. Remove preupgrade/postupgrade entirely (not needed when only stable primitives are used)
4. Keep all public function signatures identical so frontend bindings stay valid
