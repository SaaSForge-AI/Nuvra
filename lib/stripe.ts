import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

export const isStripeConfigured = !!stripeSecret;

export async function createCheckoutSession(params: {
  productTitle: string;
  amount: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  if (!stripe) {
    // Mock checkout for dev without Stripe keys
    return {
      id: `cs_mock_${Date.now()}`,
      url: params.successUrl + `?mock=1&session_id=mock_${Date.now()}`,
      mock: true,
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: params.currency || "usd",
          product_data: { name: params.productTitle },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: params.metadata,
  });

  return { id: session.id, url: session.url, mock: false };
}

export async function constructWebhookEvent(payload: string | Buffer, signature: string) {
  if (!stripe) throw new Error("Stripe not configured");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("Webhook secret not configured");
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export function calculateFees(amount: number) {
  // 2.9% + 30c
  return Math.round(amount * 0.029 + 30);
}
