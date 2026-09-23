import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function generateCode(prefix = "") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = prefix;
  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function calculateResellerSplit(priceCents: number, stripeFeePercent = 2.9, stripeFixed = 30) {
  // Nuvra Academy Resell: 90% reseller / 10% Nuvra after Stripe fees
  // Price is $197 = 19700 cents
  const stripeFees = Math.round(priceCents * (stripeFeePercent / 100) + stripeFixed);
  const afterFees = priceCents - stripeFees;
  const nuvraShare = Math.round(afterFees * 0.10);
  const resellerShare = afterFees - nuvraShare;
  return {
    price: priceCents,
    stripeFees,
    afterFees,
    nuvraShare,
    resellerShare,
    net: resellerShare,
    breakdown: `90% reseller / 10% Nuvra after fees`,
  };
}

export function calculateCreatorRevenue(priceCents: number, stripeFeePercent = 2.9, stripeFixed = 30, platformFeePercent = 5) {
  // Platform fee: 5% Nuvra / 95% creator after Stripe fees
  // For creator's own products sold via Nuvra platform (free access model)
  const stripeFees = Math.round(priceCents * (stripeFeePercent / 100) + stripeFixed);
  const afterFees = priceCents - stripeFees;
  const nuvraShare = Math.round(afterFees * (platformFeePercent / 100));
  const creatorShare = afterFees - nuvraShare;
  return {
    price: priceCents,
    stripeFees,
    afterFees,
    nuvraShare,
    creatorShare,
    net: creatorShare,
    breakdown: `${100 - platformFeePercent}% creator / ${platformFeePercent}% Nuvra after fees`,
  };
}

export function calculateOldCreatorRevenue100(priceCents: number, stripeFeePercent = 2.9, stripeFixed = 30) {
  // Legacy 100% creator (kept for reference, not used in new model)
  const stripeFees = Math.round(priceCents * (stripeFeePercent / 100) + stripeFixed);
  const net = priceCents - stripeFees;
  return {
    price: priceCents,
    stripeFees,
    net,
    creatorShare: net,
  };
}
