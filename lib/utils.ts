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
  // Stripe fee: 2.9% + 30c
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
  };
}

export function calculateCreatorRevenue(priceCents: number, stripeFeePercent = 2.9, stripeFixed = 30) {
  const stripeFees = Math.round(priceCents * (stripeFeePercent / 100) + stripeFixed);
  const net = priceCents - stripeFees;
  return {
    price: priceCents,
    stripeFees,
    net,
    creatorShare: net, // 100% to creator after fees
  };
}
