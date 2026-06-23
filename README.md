# Tubulu-v1 Monorepo
## Structure
- `apps/tubulu_mobile` — Flutter app (Customer + Merchant mobile)
- `apps/admin_portal` — React web dashboard (Super Admin + Merchant Admin)
- `backend/` — Node.js + PostgreSQL API server
- `reference/tubulu_reactnative` — Original RN app (read-only reference)
- `docs/` — API specs and architecture docs
## Running Locally
- Backend: `cd backend && npm start`
- Admin Portal: `cd apps/admin_portal && npm run dev`
- Flutter: `cd apps/tubulu_mobile && flutter run`
