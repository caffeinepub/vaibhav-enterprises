# Vaibhav Enterprises

## Current State
Backend uses `mo:core/Map` with non-stable `var products`, `var enquiries`, and `var stockMap`. These are wiped on every redeployment. The `postupgrade` hook only restores from `stableProducts` legacy arrays which are never written to (no `preupgrade` hook), so data is permanently lost after every build.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Rewrite backend to use `stable var products : [Product]`, `stable var enquiries : [Enquiry]`, `stable var stockEntries : [StockEntry]` as the primary storage
- Use `mo:base/Array` and `mo:base/Time` instead of `mo:core`
- Remove all non-stable maps and legacy migration code

### Remove
- Non-stable `var products`, `var enquiries`, `var stockMap` maps
- Legacy `stableProducts`, `stableEnquiries`, `stableStockMap` backup arrays
- `postupgrade` migration hook (no longer needed)

## Implementation Plan
1. Backend already rewritten with stable arrays
2. Deploy — data will now persist permanently across all redeployments
