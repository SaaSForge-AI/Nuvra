import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const onboardingSchema = z.object({
  activity: z.string(),
  goal: z.string(),
  usageType: z.string(),
});

export const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.string(),
  price: z.number().min(0),
  isFree: z.boolean().optional(),
});

export const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  price: z.number().min(0),
  isFree: z.boolean().optional(),
});

export const funnelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const pageSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export const leadSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.number().min(1),
});
