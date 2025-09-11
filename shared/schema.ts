import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  firebaseUid: text("firebase_uid").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  firebaseUid: text("firebase_uid").notNull(),
  provider: text("provider").notNull(), // "stripe"
  planId: text("plan_id").notNull(), // "daily", "weekly", "monthly", "sixmonth"
  status: text("status").notNull(), // "active", "cancelled", "expired"
  providerSubscriptionId: text("provider_subscription_id"), // Stripe subscription ID
  providerCustomerId: text("provider_customer_id"), // Stripe customer ID
  providerInvoiceId: text("provider_invoice_id"),
  providerReceiptUrl: text("provider_receipt_url"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD").notNull(),
  interval: text("interval").notNull(), // "day", "week", "month"
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at").notNull(),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firebaseUid: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Subscription Plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'day' | 'week' | 'month';
  intervalCount: number;
  description: string;
  features: string[];
  stripePriceId?: string;
}

// API Types for external services
export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Match {
  id: string;
  sport: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  status: string;
  scheduled_time: string;
  poster?: string;
  streams?: Stream[];
}

export interface Stream {
  id: string;
  source: string;
  quality: string;
  url: string;
  type: string;
}
