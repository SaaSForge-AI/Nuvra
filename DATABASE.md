# Database

## Schema

See prisma/schema.prisma — 40+ models covering User, Profile, Workspace, Product, Course, Module, Lesson, Quiz, Enrollment, Progress, Certificate, Funnel, FunnelStep, Page, PageBlock, LinkInBio, Lead, Customer, Order, Payment, Refund, Reseller, ResellerSale, Commission, Affiliate, EmailCampaign, Automation, Notification, Coupon, Payout, AuditLog, Event, LedgerEntry, MarketplaceListing, Review.

Enums for roles, product types, course status, funnel step types, order/payment/payout/reseller statuses, ledger types, automation triggers/actions, etc.

## Dev vs Prod

- Dev: SQLite via node:sqlite, zero-config, file prisma/dev.db, tables auto-created on import of lib/db.ts
- Prod: PostgreSQL recommended. Change lib/db.ts to use PrismaClient, set DATABASE_URL to postgres, update schema.prisma provider to postgresql, run migrations.

## Ledger

Immutable financial log. Every SALE, REFUND, COMMISSION, FEE, PAYOUT, REVERSAL, ADJUSTMENT recorded. Allows reconstituting balance by summing entries.

## Multi-tenant

All queries filtered by userId/ownerId. WorkspaceMembership for future agency.

## Seed

prisma/seed-new.ts creates demo users, academy course, creator course, products, funnels, pages, leads, customers, reseller with 90/10 sale, orders, enrollments, automations, events, notifications.
