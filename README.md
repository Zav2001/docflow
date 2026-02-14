# DocFlow SaaS

Frontend document-review platform built with a local-storage backed data layer (JSON-seeded) and no external database.

## Technologies Used

- React 19
- TypeScript (strict mode)
- Vite
- Tailwind CSS v4
- Redux Toolkit
- TanStack React Query
- React Router
- React PDF (`react-pdf` + PDF.js worker)
- Framer Motion
- React Hook Form
- Zod
- Lucide React icons
- `react-window` (thumbnail virtualization)

## Core Features

- Authentication (login/register/logout) with local persistence
- Role-based permissions and protected routes
- PDF viewing, thumbnails, pagination, annotation tools
- Upload/delete/approval workflows
- Notifications center (unread, filters, bulk read, mute categories)
- Settings (profile, preferences, password, sessions)
- Audit log and analytics from live app data
- PWA basics (manifest + service worker)

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Notes

- Initial seed data loads from `public/data/*.json`.
- Runtime writes are persisted to `localStorage` (browser-side).
- Uploaded/updated/deleted documents are also mirrored as JSON in `localStorage` key `docflow_documents_json_snapshot`.
