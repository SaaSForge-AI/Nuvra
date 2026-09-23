# Setup

## Requirements

- Node 22+ (for node:sqlite)
- npm 10+

## Steps

1. Clone
2. `npm install`
3. `cp .env.example .env`
4. Edit `.env` if needed (Stripe, Email optional — mock works without)
5. `npm run db:seed` — creates dev.db and demo data
6. `npm run dev` — http://localhost:3000

## Demo Accounts

- admin@nuvra.com / admin123
- creator@nuvra.com / creator123
- reseller@nuvra.com / reseller123
- student@nuvra.com / student123

## Build

`npm run build` then `npm start`

## DB

Dev uses SQLite file `./prisma/dev.db` via node:sqlite. Prod should use Postgres: change `lib/db.ts` to use PrismaClient with DATABASE_URL postgres, and update prisma/schema.prisma provider to postgresql, then `prisma migrate dev`.

## Stripe

Set STRIPE_SECRET_KEY, PUBLISHABLE, WEBHOOK_SECRET. Without keys, checkout returns mock URL that still triggers order creation via webhook mock handling.

## Email

Set EMAIL_API_KEY (Resend re_...). Without, emails are logged to console.

## Env

See ENVIRONMENT.md
