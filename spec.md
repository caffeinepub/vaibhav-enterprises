# Vaibhav Enterprises

## Current State
- Backend has `getProducts()` as a `query` call — returns stale data from a single replica, so products added via admin don't show on other devices
- `getEnquiries()` is also a `query` call — same stale data issue
- AdminPage: `fetchEnquiries` is never called automatically when switching to the Enquiries tab — only triggered by a manual refresh button click
- Both issues cause the user to see empty/stale products and no enquiries in the admin panel

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- `src/backend/main.mo`: Change `getProducts()` from `query` to `shared` (update call) so it always returns committed state
- `src/backend/main.mo`: Change `getEnquiries()` from `query` to `shared` (update call) for same reason
- `src/frontend/src/declarations/backend.did.js`: Remove `'query'` annotation from `getProducts` and `getEnquiries` IDL entries
- `src/frontend/src/AdminPage.tsx`: Call `fetchEnquiries()` automatically whenever the Enquiries tab is activated (not just on manual refresh)

### Remove
- Nothing to remove

## Implementation Plan
1. Change `getProducts` and `getEnquiries` in main.mo from `public query func` to `public shared func`
2. Update `backend.did.js` IDL — remove `['query']` annotation from both methods
3. Update `AdminPage.tsx` — add `fetchEnquiries()` call in the tab switch handler when switching to enquiries tab
