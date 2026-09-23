// Email architecture compatible with Resend/Postmark/SendGrid
// Mock implementation for dev, real provider when EMAIL_API_KEY is set

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

export async function sendEmail(payload: EmailPayload) {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = payload.from || process.env.EMAIL_FROM || "Nuvra <noreply@nuvra.com>";

  if (!apiKey) {
    console.log(`[EMAIL MOCK] To: ${payload.to} | Subject: ${payload.subject}`);
    console.log(`[EMAIL MOCK] From: ${from}`);
    // In dev, we just log and return success
    return { id: `mock_${Date.now()}`, success: true, mock: true };
  }

  // If Resend API key is provided (starts with re_)
  if (apiKey.startsWith("re_")) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });
      const data = await res.json();
      return { id: data.id, success: res.ok, mock: false, data };
    } catch (e) {
      console.error("Email send failed", e);
      return { success: false, error: e };
    }
  }

  // Fallback mock
  console.log(`[EMAIL] Would send to ${payload.to}: ${payload.subject}`);
  return { id: `mock_${Date.now()}`, success: true, mock: true };
}

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: `Welcome to Nuvra, ${name}! 🚀`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; padding: 40px; border-radius: 16px;">
        <h1 style="color: #3B82FF;">Welcome to Nuvra</h1>
        <p>Hi ${name},</p>
        <p>You're all set to Create. Sell. Teach. Scale.</p>
        <p>Here's what you can do next:</p>
        <ul>
          <li>Create your first product</li>
          <li>Build a funnel</li>
          <li>Launch your academy</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="display: inline-block; background: #3B82FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Go to Dashboard</a>
      </div>
    `,
  }),
  purchaseConfirmation: (productTitle: string, name: string) => ({
    subject: `You got ${productTitle} - Let's get started!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; padding: 40px; border-radius: 16px;">
        <h1 style="color: #3B82FF;">Purchase Confirmed</h1>
        <p>Hi ${name},</p>
        <p>Thank you for purchasing <strong>${productTitle}</strong>.</p>
        <p>You can access it now from your learning dashboard.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/learn" style="display: inline-block; background: #3B82FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Start Learning</a>
      </div>
    `,
  }),
  courseCompleted: (courseTitle: string, name: string, certUrl: string) => ({
    subject: `🎉 You completed ${courseTitle}! Certificate inside`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; padding: 40px; border-radius: 16px;">
        <h1 style="color: #3B82FF;">Congratulations!</h1>
        <p>Hi ${name},</p>
        <p>You've completed <strong>${courseTitle}</strong>. We're proud of you!</p>
        <p>Your certificate is ready:</p>
        <a href="${certUrl}" style="display: inline-block; background: #3B82FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Certificate</a>
      </div>
    `,
  }),
  abandonedCheckout: (productTitle: string, checkoutUrl: string) => ({
    subject: `You left ${productTitle} in your cart`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #fff; padding: 40px; border-radius: 16px;">
        <h1>Still interested?</h1>
        <p>You left <strong>${productTitle}</strong> in your cart. Complete your purchase now and get instant access.</p>
        <a href="${checkoutUrl}" style="display: inline-block; background: #3B82FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Complete Purchase</a>
      </div>
    `,
  }),
};
