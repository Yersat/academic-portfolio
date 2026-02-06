# Academic Portfolio & CMS

A minimalist academic professor website with book catalog and PDF sales functionality. Built with React + Vite (frontend) and Express + Prisma (backend).

## Features

- 📚 Book catalog with detail pages
- 💳 PDF purchase via Robokassa payment gateway
- 📧 Automatic email delivery of PDF download links
- 🔐 Secure token-based PDF downloads
- 👨‍💼 Admin panel for content management
- 🌐 RU/KZ localization

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS (CDN)
- Lucide React icons

**Backend:**
- Node.js + Express
- Prisma ORM
- SQLite (development) / PostgreSQL (production)
- Nodemailer for emails
- Robokassa payment integration

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:Yersat/academic-portfolio.git
cd academic-portfolio

# Install all dependencies (frontend + backend + Prisma)
npm run setup
```

### Configuration

1. Copy the environment example file:

```bash
cp server/.env.example server/.env
```

2. Edit `server/.env` with your settings:

```env
# Database
DATABASE_URL="file:./dev.db"

# Server
SERVER_PORT=4000
FRONTEND_ORIGIN=http://localhost:3000

# Robokassa (get from partner.robokassa.ru)
ROBOKASSA_MERCHANT_LOGIN=your_merchant_login
ROBOKASSA_PASSWORD1=your_password1
ROBOKASSA_PASSWORD2=your_password2
ROBOKASSA_TEST_MODE=1

# Email (SMTP)
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_USER=your_email@mail.ru
SMTP_PASS=your_password
SMTP_FROM="Bilig <no-reply@bilig.kz>"
```

### Running Locally

```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:server    # Backend on http://localhost:4000
```

### Database

```bash
# Generate Prisma client
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Seed Sample Data

After starting the server, seed the database with sample books:

```bash
curl -X POST http://localhost:4000/api/admin/seed
```

## Robokassa Integration

### Configuration

1. Register at [Robokassa Partner Portal](https://partner.robokassa.ru/)
2. Create a new shop/merchant
3. Get your `MerchantLogin`, `Password #1`, and `Password #2`
4. Configure callback URLs:

| URL Type | URL |
|----------|-----|
| Result URL | `https://yourdomain.com/api/robokassa/result` |
| Success URL | `https://yourdomain.com/api/robokassa/success` |
| Fail URL | `https://yourdomain.com/api/robokassa/fail` |

### Test Mode

When `ROBOKASSA_TEST_MODE=1`:
- Payments are simulated (no real money)
- Use test card data provided by Robokassa
- The `IsTest=1` parameter is added to payment URLs

### Signature Verification

The backend verifies Robokassa signatures using MD5 hashes:

- **ResultURL** (server-to-server): Uses `Password #2`
- **SuccessURL** (user redirect): Uses `Password #1`

Custom parameters (`Shp_*`) are included in signature verification and sorted alphabetically.

### Security Notes

1. **Idempotency**: Duplicate callbacks for the same order are handled gracefully
2. **Token-based downloads**: PDF download links expire after 24 hours
3. **Signature verification**: All callbacks are verified before processing
4. **Order status tracking**: Each payment event is logged for debugging

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/books` | List published books |
| GET | `/api/books/:id` | Get book by ID |
| POST | `/api/checkout/pdf` | Initiate PDF checkout |

### Robokassa Callbacks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST/GET | `/api/robokassa/result` | Server-to-server callback |
| GET | `/api/robokassa/success` | User redirect after success |
| GET | `/api/robokassa/fail` | User redirect after fail |

### Secure Download

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/:orderId/download?token=...` | Download PDF |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/books` | List all books |
| POST | `/api/admin/books` | Create book |
| PUT | `/api/admin/books/:id` | Update book |
| DELETE | `/api/admin/books/:id` | Delete book |
| POST | `/api/admin/books/:id/upload-pdf` | Upload PDF file |
| GET | `/api/admin/orders` | List all orders |
| POST | `/api/admin/seed` | Seed sample data |

## PDF Storage

PDFs are stored in `server/uploads/pdfs/` (gitignored). 

To add a PDF:
1. Upload via admin panel (POST `/api/admin/books/:id/upload-pdf`)
2. Or manually place the file and set `pdfFilePath` in the database

## Project Structure

```
academic-portfolio/
├── App.tsx               # Main app with routes
├── api.ts                # API client
├── types.ts              # TypeScript types
├── constants.tsx         # Initial data
├── components/
│   ├── PublicLayout.tsx
│   ├── AdminLayout.tsx
│   └── PdfCheckoutModal.tsx
├── pages/
│   ├── Books.tsx
│   ├── BookDetail.tsx
│   ├── PaymentSuccess.tsx
│   ├── PaymentFail.tsx
│   └── admin/
│       └── AdminBooks.tsx
└── server/
    ├── src/
    │   ├── index.ts      # Express server
    │   ├── lib/
    │   │   ├── prisma.ts
    │   │   ├── robokassa.ts
    │   │   └── email.ts
    │   └── routes/
    │       ├── books.ts
    │       ├── checkout.ts
    │       ├── robokassa.ts
    │       ├── download.ts
    │       └── admin.ts
    ├── prisma/
    │   └── schema.prisma
    ├── uploads/pdfs/
    └── .env.example
```

## Deployment

### Frontend

Build and deploy to any static hosting (Vercel, Netlify, etc.):

```bash
npm run build
```

### Backend

1. Set up PostgreSQL and update `DATABASE_URL`
2. Run migrations: `npx prisma migrate deploy`
3. Build: `npm run build:server`
4. Start: `npm run server:start`

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."
ROBOKASSA_TEST_MODE=0
NODE_ENV=production
```

## License

MIT
