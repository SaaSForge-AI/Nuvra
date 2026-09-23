# Nuvra — Create. Sell. Teach. Scale.

Nuvra is a premium all-in-one SaaS platform for creators and entrepreneurs.

It replaces 12 tools with one coherent dashboard:

- **Funnel Builder** — visual flow with conversion tracking
- **Page Builder** — hero, pricing, testimonials, checkout blocks
- **Products** — course, ebook, template, coaching, bundle, etc.
- **LMS & Academy** — Nuvra Academy (8 modules, 50+ lessons) + your own courses, certificates
- **Marketplace** — discover & sell courses
- **Link in Bio** — /@username and /u/username public pages
- **CRM** — leads, customers, segments, tags
- **Email Marketing** — broadcasts, sequences, templates
- **Automations** — workflow builder with triggers/actions/conditions
- **Affiliates** — your own affiliate program (separate from reseller)
- **Reseller** — Resell Nuvra Academy with 90% commission, 10% to Nuvra, transparent fees
- **Payments** — Stripe + Connect, ledger, payouts, refunds
- **Analytics** — proprietary event tracking, revenue, conversion
- **Admin** — users, moderation, resellers, payouts

## Stack

- Next.js 14 App Router, React 18, TypeScript
- Tailwind CSS, Lucide Icons, Framer Motion, Recharts
- Custom SQLite layer using Node 22 `node:sqlite` (experimental) — zero-config dev, compatible with PostgreSQL in prod via Prisma schema
- Auth: JWT (jose) + bcryptjs, httpOnly cookies, RBAC
- Stripe (mock fallback if keys missing), email architecture for Resend/Postmark
- Event tracking, ledger, notifications, command palette (CMD+K)

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env if needed
npm run db:seed
npm run dev
```

Open http://localhost:3000

Demo accounts after seed:

- admin@nuvra.com / admin123 (SUPER_ADMIN)
- creator@nuvra.com / creator123 (CREATOR)
- reseller@nuvra.com / reseller123 (RESELLER)
- student@nuvra.com / student123 (STUDENT)

## URLs

- / — marketing landing (premium, minimal, no classic header/footer)
- /login, /register, /onboarding
- /dashboard — overview with greeting, revenue, visitors, conversion, opportunities, checklist
- /funnels, /funnels/[id], /funnels/new
- /pages, /pages/[id]
- /products, /products/[id], /products/new
- /courses, /courses/[id], /courses/new
- /academy — Nuvra Academy with 8 modules
- /academy/[moduleId] — module detail
- /academy/resell — reseller dashboard with 90/10 breakdown
- /marketplace, /marketplace/[slug]
- /learn — My Learning
- /learn/[course]/[lesson] — LMS reader with progress
- /customers, /leads
- /emails, /automations, /analytics, /payments, /settings, /admin
- /links — link-in-bio builder
- /store — digital boutique
- /affiliates — affiliate program
- /u/[username] and /@username (via middleware) — public link-in-bio
- /certificate/[id] — public verification
- /checkout/[id] — checkout with reseller support
- /r/[slug] — reseller redirect
- /p/[slug] — public page
- /f/[slug] — public funnel

## Business Model

### Nuvra Academy Resell: 90/10

- Sale price: $497.00
- Stripe fees: 2.9% + 30c = $14.71 (example) — shown separately
- After fees: $482.29
- Nuvra share 10%: $48.23
- Reseller share 90%: $434.06

Refund recalculates 90/10 automatically. Ledger is immutable (SALE, REFUND, COMMISSION, FEE, PAYOUT, etc.). Payout statuses: pending → available (14d) → processing → paid.

### Creator Revenue: 100% after fees

For personal courses/products, creator keeps 100% after Stripe fees. No Nuvra 10%. Displayed transparently.

## Security

- Server-side validation (zod)
- RBAC, multi-tenant isolation via userId
- Secure httpOnly cookies, CSRF safe (SameSite lax)
- Stripe webhook signature verification (when keys configured)
- Rate limiting ready, audit logs, IP logging
- GDPR: export, delete, anonymization, cookie consent architecture

## Docs

- ARCHITECTURE.md — system design
- SETUP.md — local setup
- DATABASE.md — schema & SQLite vs Postgres
- STRIPE.md — Stripe integration & Connect
- SECURITY.md — security measures
- ENVIRONMENT.md — env vars
- DEPLOYMENT.md — deploy guide

## Tests

Critical business logic tested:

- Auth (register/login)
- Product creation
- Course creation
- Funnel builder
- 90/10 commission calculation
- Creator revenue 100%
- Refund recalculation
- Progress & certificate
- RBAC isolation

Run: `npm run test`

## License

Private — SaaSForge-AI
