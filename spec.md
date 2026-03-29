# Vaibhav Enterprises

## Current State
Enquiry form exists on the site but throws "Failed to send enquiry" error. The backend Motoko code has `submitEnquiry`, `getEnquiries`, `deleteEnquiry` functions but they are missing from the generated DID/bindings files, so the frontend cannot call them.

## Requested Changes (Diff)

### Add
- Enquiry functions properly registered in backend bindings

### Modify
- Regenerate backend with all enquiry functions (submitEnquiry, getEnquiries, deleteEnquiry) so frontend can call them

### Remove
- Nothing

## Implementation Plan
1. Regenerate Motoko backend including enquiry functions
2. Frontend already has the enquiry form and admin enquiry tab wired up — just needs working bindings
