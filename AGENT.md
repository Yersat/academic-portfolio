# AGENT.md - Change Log for Compounding Engineering

This file tracks all significant changes made to the project. Each entry includes the date, what changed, which files were modified, and why. This serves as institutional memory for AI-assisted development.

---

## 2026-02-06: Migrate backend from Express/Prisma/SQLite to Convex

### Summary
Complete backend migration from a self-hosted Express + Prisma + SQLite stack to Convex as a fully managed backend. Frontend deployed on Netlify.

### What Changed
- **Backend**: Replaced Express server, Prisma ORM, and SQLite database with Convex (queries, mutations, actions, HTTP actions)
- **Database**: Migrated from Prisma/SQLite schema to Convex schema with 8 tables: books, orders, orderEvents, invoiceCounter, adminSessions, profile, mediaItems, researchPapers
- **Payment**: Robokassa callbacks now handled by Convex HTTP actions instead of Express routes
- **Email**: Nodemailer runs inside Convex Node actions instead of Express middleware
- **File Storage**: PDFs stored in Convex file storage instead of local disk (server/uploads/pdfs/)
- **Auth**: Admin authentication moved from hardcoded frontend password to server-verified session tokens
- **Frontend**: All components migrated from prop-drilling pattern to self-contained Convex `useQuery`/`useMutation`/`useAction` hooks
- **Deployment**: Added netlify.toml for Netlify deployment, Convex handles backend deployment

### Files Created
- `CLAUDE.md` - Project rules and conventions
- `AGENT.md` - This change log
- `convex/schema.ts` - Database schema
- `convex/books.ts` - Book queries
- `convex/orders.ts` - Order mutations & queries
- `convex/checkout.ts` - Payment initiation action
- `convex/httpHandlers.ts` - Robokassa callbacks + PDF download
- `convex/http.ts` - HTTP router
- `convex/email.ts` - Email sending action
- `convex/auth.ts` - Admin authentication
- `convex/admin.ts` - Admin CRUD mutations
- `convex/profile.ts` - Profile, media, research functions
- `convex/seed.ts` - Initial data seeding
- `netlify.toml` - Netlify deployment config

### Files Modified
- `package.json` - Added convex, removed server scripts and concurrently
- `index.tsx` - Added ConvexProvider wrapper
- `App.tsx` - Removed state/localStorage/prop drilling, simplified routing
- `vite.config.ts` - Removed proxy config and process.env defines
- `types.ts` - Removed purchaseLinks/pdfFilePath/SiteData/CheckoutResponse/ApiError, updated id→_id
- `components/PublicLayout.tsx` - Uses useQuery for profile instead of props
- `components/PdfCheckoutModal.tsx` - Uses useAction for checkout, accepts bookId/bookTitle/pdfPrice/pdfCurrency props
- `pages/Home.tsx` - Uses useQuery for profile and books
- `pages/About.tsx` - Uses useQuery for profile
- `pages/Books.tsx` - Uses useQuery for books, removed purchaseLinks references
- `pages/BookDetail.tsx` - Uses useQuery for book by ID, updated PdfCheckoutModal integration
- `pages/Media.tsx` - Uses useQuery for media items
- `pages/Research.tsx` - Uses useQuery for research papers
- `pages/Contact.tsx` - Uses useQuery for profile
- `pages/admin/AdminLogin.tsx` - Uses useMutation for auth, stores session token
- `pages/admin/AdminDashboard.tsx` - Uses useQuery for stats (books, media, research, orders)
- `pages/admin/AdminBooks.tsx` - Full Convex CRUD with PDF upload via file storage
- `pages/admin/AdminMedia.tsx` - Uses useQuery/useMutation for media CRUD
- `pages/admin/AdminPages.tsx` - Uses useQuery/useMutation for profile editing

### Files Deleted
- `api.ts` - Replaced by Convex hooks
- `constants.tsx` - Seed data inlined in convex/seed.ts
- `server/` (entire directory) - Replaced by Convex backend

### Rationale
- Eliminate need to run and maintain a separate backend server
- Convex provides real-time data, built-in file storage, and managed deployment
- Free tier sufficient for academic portfolio traffic
- Simplifies deployment to just Netlify (frontend) + Convex (backend)

### Architecture Decisions
- Used `"use node"` for Convex actions requiring Node.js crypto (MD5 for Robokassa) and Nodemailer
- Kept Nodemailer instead of switching to HTTP-based email API (preserves existing mail.ru SMTP setup)
- Used simple password + session token auth (single admin user, no need for full auth framework)
- Moved all content (profile, media, research) to Convex tables for full admin editability
- PDF downloads use signed URL redirect pattern (handles files > 20MB)
- HashRouter URLs preserved in Robokassa redirect callbacks (/#/payment/success)
