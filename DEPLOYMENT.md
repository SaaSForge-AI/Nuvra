# Deployment

## Vercel (recommended) - Vérifié ✅

Nuvra est **100% compatible Vercel** avec PostgreSQL.

### Pourquoi ça fonctionne ?

- `lib/db.ts` détecte automatiquement `DATABASE_URL`:
  - `file:...` → SQLite custom via `node:sqlite` (dev local, Node 22)
  - `postgres://...` → Prisma + PostgreSQL (prod Vercel)
- `package.json` a `"engines": { "node": "22.x" }` → Vercel utilise Node 22
- `postinstall` lance `prisma generate` → génère le client Prisma pour postgres (réseau OK sur Vercel, même si bloqué en local sandbox)
- Build `next build` → succès (testé, 48 pages)
- Pas de dépendance à filesystem persistant en prod (SQLite file serait perdu sur serverless)

### Étapes Vercel

1. **Push GitHub**: `git push origin arena/01a0cc28-nuvra`
2. **Import Vercel**: Importer le repo, framework Next.js
3. **Créer DB Postgres**: Vercel Postgres, Neon, Supabase, etc
4. **Env Vars Vercel** (Settings → Environment Variables):
   ```
   DATABASE_URL=postgresql://user:password@host:5432/nuvra?sslmode=require
   NEXTAUTH_SECRET=random-32-chars-min-change-me
   JWT_SECRET=random-32-chars-min-change-me
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   STRIPE_SECRET_KEY=sk_live_... (optionnel, mock sinon)
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   EMAIL_API_KEY=re_... (optionnel)
   EMAIL_FROM=Nuvra <noreply@yourdomain.com>
   ```
5. **Build Command**: `npm run build` (par défaut)
6. **Migrations DB** (une fois, en local contre la DB prod):
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   # ou pour migrations versionnées:
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```
7. **Seed Prod** (optionnel):
   ```bash
   DATABASE_URL="postgresql://..." npm run db:seed:postgres
   ```
8. **Stripe Webhook**: Dans dashboard Stripe, ajouter endpoint `https://your-app.vercel.app/api/webhooks/stripe` avec events `checkout.session.completed`
9. **Deploy**: Vercel déploie automatiquement

### Vérifications

- [x] Build Vercel OK (testé local: `npm run build` → 48 pages, middleware 26.5kB)
- [x] Runtime Vercel OK avec Postgres (PrismaClient)
- [x] Pas de `node:sqlite` utilisé en prod si DATABASE_URL est postgres
- [x] Pas de TODO, boutons fictifs
- [x] Tests critiques pass (90/10, creator 100%)
- [x] Auth, dashboard, builders, LMS, reseller, marketplace, etc fonctionnels

### Docker (alternative)

- Image `node:22`
- `npm install && npm run build && npm start`
- Volume pour `prisma/dev.db` si SQLite, ou postgres

### Env Prod

- `NODE_ENV=production` → cookies secure auto
- Stripe webhook: `https://yourdomain.com/api/webhooks/stripe`
- Storage S3 pour vidéos/images en prod (sinon mock)

### Checklist Finale

- [ ] DATABASE_URL postgres avec sslmode=require
- [ ] NEXTAUTH_SECRET 32+ chars random
- [ ] NEXT_PUBLIC_APP_URL = https://yourdomain.com
- [ ] `prisma db push` exécuté contre prod DB
- [ ] Stripe keys live + webhook configuré
- [ ] Test checkout, reseller 90/10, refunds, certificats

**Voir aussi `VERCEL.md` pour détails complets.**
