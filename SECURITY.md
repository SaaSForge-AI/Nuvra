# Security

- **Validation**: zod schemas in lib/validations.ts, server-side checks
- **Auth**: bcryptjs hash, jose JWT, httpOnly SameSite=lax secure cookies, 7d expiry
- **Authorization**: Every query checks userId/ownerId, RBAC via role, isSuperAdmin flag
- **RBAC**: SUPER_ADMIN, CREATOR, RESELLER, CUSTOMER/STUDENT. Middleware checks.
- **CSRF**: SameSite cookies, no state-changing GET
- **Rate limiting**: Ready to add via middleware (e.g., upstash)
- **Uploads**: Validation ready (check file type, size)
- **Permissions**: Strict, no cross-user data access
- **Cookies**: Secure in prod, httpOnly
- **Webhooks**: Stripe signature verification
- **Audit logs**: AuditLog model with userId, action, entity, IP
- **Fraud**: Basic detection via event logs, IP, abnormal activity, Stripe Radar ready, admin suspend
- **Privacy**: Privacy Policy, Terms, Cookie, Refund, Reseller, Creator, Marketplace terms pages ready (create in admin)
- **GDPR**: Export data, delete account, anonymization, marketing preferences, unsubscribe
- **Ledger**: Immutable, prevents tampering
