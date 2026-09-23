# Architecture

## Overview

Nuvra is a monolithic Next.js app with App Router, server components, route handlers, and a custom SQLite data layer for zero-config dev. Production should use PostgreSQL with Prisma (schema.prisma is Postgres-compatible, just change provider).

## Layers

- **UI**: Tailwind, Radix-like primitives, Framer Motion, Lucide, Recharts. Sidebar navigation (no classic header/footer), minimal topbar, command palette CMD+K.
- **Auth**: JWT via jose, bcryptjs, httpOnly cookie `nuvra_session`. `getSession()` reads cookie, verifies. RBAC via role field.
- **DB**: `lib/db.ts` uses `node:sqlite` DatabaseSync. Creates tables on import. Implements Model class with findMany, findUnique, count, create, update, upsert, deleteMany. Includes handled via manual joins for known relations. For Postgres prod, replace with PrismaClient.
- **API**: Route handlers under `app/api/*`. All check session. Stripe checkout creates session or mock URL. Webhook handles purchase, creates order, payment, ledger, reseller split, enrollment, events, notifications, email.
- **Events**: `lib/events.ts` tracks page_view, lead_created, checkout_started, purchase_completed, etc. Used for analytics. Also triggers automations.
- **Email**: `lib/email.ts` — mock logs if no EMAIL_API_KEY, real via Resend if key starts with re_.
- **Stripe**: `lib/stripe.ts` — mock if no secret key, real otherwise. Checkout session, webhook verification, fee calculation.
- **Academy**: Content in `lib/academy/content.ts` — 8 modules, 50+ lessons, real useful content, not lorem.
- **Reseller**: 90/10 split calculated in `lib/utils.ts` `calculateResellerSplit`. Ledger entries for SALE, FEE, COMMISSION. ResellerSale tracks breakdown.
- **Creator**: 100% after fees via `calculateCreatorRevenue`.
- **Ledger**: Immutable entries, allows reconstituting balance. Payout statuses.
- **LMS**: Enrollment, Progress, Certificate with unique code and /certificate/[id] verification.
- **Builders**: Funnel builder visual flow, Page builder with blocks (hero, pricing, testimonials, etc.), Course builder with modules/lessons/quiz.
- **CRM**: Lead, Customer with tags, source, totalSpent.
- **Link in Bio**: LinkInBio model, /u/[username] public, middleware rewrites /@username -> /u/username.

## Multi-tenancy

All data isolated by userId (ownerId). Workspace model ready for future agency multi-workspace.

## Security

- Validation via zod
- Authorization checks (userId === ownerId)
- AuditLog, Event with IP
- Secure cookies
- Stripe signature verification

## Performance

- Server components for data fetching
- Pagination via take
- Lazy loading via dynamic imports where needed
- Images remotePatterns **

## Deployment

- Next.js standalone build
- DATABASE_URL env for Postgres in prod
- STRIPE keys, EMAIL key
- NEXT_PUBLIC_APP_URL
