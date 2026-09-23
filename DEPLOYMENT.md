# Deployment

## Vercel (recommended)

1. Push to GitHub
2. Import in Vercel
3. Set env vars (DATABASE_URL postgres, NEXTAUTH_SECRET, STRIPE keys, EMAIL key, NEXT_PUBLIC_APP_URL)
4. Build command: `npm run build`
5. For Postgres, update lib/db.ts to use PrismaClient or keep custom but point to postgres via adapter
6. Run seed via `npm run db:seed` locally against prod DB or via Vercel job

## Docker

- Use node:22 image
- Copy files, npm install, npm run build, npm start
- Ensure prisma/dev.db is volume or use postgres

## Env

- Set NODE_ENV=production
- Secure cookies auto-enabled
- Stripe webhook URL: https://yourdomain.com/api/webhooks/stripe

## Checklist

- [ ] DATABASE_URL postgres
- [ ] NEXTAUTH_SECRET random 32+ chars
- [ ] STRIPE keys live
- [ ] EMAIL key
- [ ] NEXT_PUBLIC_APP_URL = https://yourdomain.com
- [ ] Run seed if needed
- [ ] Configure Stripe webhook
- [ ] Test checkout, reseller 90/10, refunds, certificates
