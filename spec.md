# Vaibhav Enterprises

## Current State
Business website with admin panel, enquiry form, stock system, brand logos, and product management. Backend uses stable arrays for storage. Products and enquiries are still not visible across devices.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `getProducts()` changed from `public query` to `public shared` (update call) so all devices read from consensus-committed state instead of a potentially stale replica
- `getProduct()` changed from `public query` to `public shared` for the same reason
- `getProductStock()` and `getAllStock()` changed from query to update calls
- Removed `mo:core/Map` import and associated non-stable map variables entirely (they were unused for actual storage but could cause upgrade hook interference)

### Remove
- `import Map "mo:core/Map"` and the three non-stable `var products`, `var enquiries`, `var stockMap` Map variables

## Implementation Plan
1. Rewrite backend/main.mo without mo:core dependency, using only mo:base
2. Change all read functions to update calls for consistent cross-device state
3. Keep all stable variable names identical to avoid M0169 upgrade errors
4. Deploy
