# CLAUDE.md - Project Rules & Conventions

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, React Router (HashRouter), Tailwind CSS (CDN)
- **Backend**: Convex (queries, mutations, actions, HTTP actions)
- **Purchases**: No online payment. The book page links to WhatsApp (`wa.me`), number set in `pages/BookDetail.tsx`
- **Deployment**: Netlify (frontend), Convex Cloud (backend)

## Project Structure
```
/                       # Frontend root
├── convex/             # Convex backend functions
│   ├── schema.ts       # Database schema
│   ├── books.ts        # Book queries
│   ├── orders.ts       # Past order records (admin list, download checks)
│   ├── httpHandlers.ts # HTTP action (download links from past orders)
│   ├── http.ts         # HTTP router
│   ├── auth.ts         # Admin authentication
│   ├── admin.ts        # Admin CRUD mutations
│   ├── profile.ts      # Profile, media, research functions
│   └── seed.ts         # Initial data seeding
├── components/         # React layout & shared components
├── pages/              # Page components (public + admin)
├── types.ts            # Shared TypeScript types
├── constants.tsx        # Fallback/seed data
└── netlify.toml        # Netlify deployment config
```

## Convex Patterns
- **Queries** (`query`): Read-only data fetching. Used in frontend via `useQuery()`.
- **Mutations** (`mutation`): Write operations. Used via `useMutation()`.
- **Actions** (`action`): For external API calls. Used via `useAction()`.
- **Internal functions** (`internalQuery`, `internalMutation`, `internalAction`): Called only from other Convex functions, not from the client.
- **HTTP actions** (`httpAction`): Public HTTP endpoints, currently PDF downloads for past orders.
- Use `"use node"` directive at top of files needing Node.js APIs.

## Naming Conventions
- **Functions**: camelCase (`listPublished`, `createBook`)
- **Components**: PascalCase (`BookDetail`, `AdminBooks`)
- **Files**: camelCase for Convex (`books.ts`), PascalCase for components (`BookDetail.tsx`)
- **Tables**: camelCase plural (`books`, `orders`, `mediaItems`, `researchPapers`)

## Authentication
- Admin auth uses simple password verification against `ADMIN_PASSWORD` env var
- Login returns a session token (UUID) stored in `adminSessions` table with 24h expiry
- Frontend stores token in `localStorage('admin_session_token')`
- Admin mutations accept `sessionToken` arg and verify before executing

## Data Flow
- Each page component queries its own data via Convex `useQuery` hooks
- No prop drilling from App.tsx - components are self-contained
- Convex queries auto-update in real-time when data changes
- Book IDs use Convex `Id<"books">` type, not plain strings

## Book Purchases
Robokassa was removed (the provider refused service). The "Купить через WhatsApp" button on the book page opens a chat with a prefilled message; payment and delivery are arranged manually. The `orders` tables and `/download` route remain only for records and links from past orders.

## Environment Variables
### Convex Dashboard
- `ADMIN_PASSWORD`

### Netlify / Local .env
- `VITE_CONVEX_URL` - Convex deployment URL

## UI Language
- All user-facing text is in Russian/Kazakh
- No i18n library - text is hardcoded in components
- Brand name: "Bilig"

## User Preferences
- The project owner is not highly technical — always provide full copy-paste terminal commands
- Avoid short or ambiguous answers — explain step-by-step what to do and why
- When giving terminal commands, always include `cd` to the project directory first

## Project Paths
- **Main worktree**: `/Users/yernur/.claude-worktrees/academic-portfolio/exciting-hellman/`
- **Original repo**: `/Users/yernur/Projects/academic-portfolio/`

## Commands
- `npm run dev` - Start Convex dev server + Vite frontend
- `npm run build` - Build frontend for production
- `npx convex deploy` - Deploy Convex functions to production
- `npx convex dev` - Run Convex in development mode
