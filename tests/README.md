# Test Scaffolding

This project now includes a baseline testing strategy:

- `unit`: permission and state utility validation
- `integration`: API + storage interaction checks
- `e2e`: critical user journey scripts (auth, settings, upload)

Suggested stack:

- `Vitest` + `@testing-library/react` for unit/integration
- `Playwright` for e2e

Priority scenarios:

1. Login and registration validation
2. Settings save flows (profile, preferences, password)
3. Notifications unread count and bulk actions
4. Document upload, approval, delete, and version history
5. RBAC route guards
