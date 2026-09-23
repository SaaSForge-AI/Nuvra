# Stripe Integration

## Architecture

- `lib/stripe.ts` exports `stripe` client (null if no key) and `createCheckoutSession`
- If no key, mock session with URL to success page + mock flag
- Checkout API (`/api/checkout`) creates order for free products directly, otherwise creates Stripe session
- Metadata includes productId, courseId, ownerId, resellerId, affiliateCode, isNuvraAcademy flag
- Webhook `/api/webhooks/stripe` handles `checkout.session.completed`
  - Verifies signature if STRIPE_WEBHOOK_SECRET set
  - Handles mock payload if no Stripe
  - Creates Order, Payment, LedgerEntry
  - If isNuvraAcademy && resellerId: calculates 90/10 split via `calculateResellerSplit`, creates ResellerSale, updates reseller stats, ledger entries for COMMISSION (90%), FEE, COMMISSION (10% Nuvra), notifications
  - Else: creator 100% after fees via `calculateCreatorRevenue`
  - Creates Enrollment if course, Event purchase_completed, Notification to owner, sends email via `lib/email.ts`

## Fees

- 2.9% + 30c default, configurable
- Shown transparently in reseller dashboard and checkout

## Connect

- User.stripeConnectId ready for Stripe Connect accounts for creators/resellers
- Payouts model with statuses pending, available, processing, paid, failed, reversed

## Refunds

- Refund model, recalculates 90/10 on refund, ledger reversal, prevents double refunds via unique orderId

## Taxes

- Architecture ready: tax field in Order, currency, coupon, tax rates configurable, invoices ready
- Not providing tax advice

## Idempotence

- Order creation idempotent via stripeSessionId uniqueness check recommended (add in prod)
- Webhook should check existing order by stripeSessionId before creating
