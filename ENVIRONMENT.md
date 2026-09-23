# Environment Variables

```
DATABASE_URL="file:./dev.db" # or postgres URL in prod
NEXTAUTH_SECRET="random-32-chars"
JWT_SECRET="random-32-chars"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID="ca_..."
STORAGE_ENDPOINT="https://s3.amazonaws.com"
STORAGE_ACCESS_KEY="..."
STORAGE_SECRET_KEY="..."
STORAGE_BUCKET="nuvra-storage"
STORAGE_REGION="us-east-1"
EMAIL_API_KEY="re_..." # Resend
EMAIL_FROM="Nuvra <noreply@nuvra.com>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Only DATABASE_URL, NEXTAUTH_SECRET, NEXT_PUBLIC_APP_URL required for dev. Stripe and Email work in mock mode without keys.
