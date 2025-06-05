import { text, integer, real, pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customer Profile Table
export const customers = pgTable("customers", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(), // M/F/Others
  marital_status: varchar("marital_status", { length: 50 }).notNull(), // Single/Married/Widowed/Divorced
  profession: varchar("profession", { length: 255 }).notNull(),
  income_bracket: varchar("income_bracket", { length: 50 }).notNull(), // <5L, 5-10L, 10-25L, >25L
  annual_income: real("annual_income"),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  dependents_count: integer("dependents_count").notNull(),
  health_conditions: text("health_conditions").notNull(), // JSON string
  financial_goals: text("financial_goals").notNull(), // JSON array string
  risk_appetite: varchar("risk_appetite", { length: 50 }).notNull(), // Low/Medium/High
  lifestyle: varchar("lifestyle", { length: 255 }).notNull(),
  existing_policies: text("existing_policies").notNull(), // JSON array string
  lead_source: varchar("lead_source", { length: 100 }).notNull(),
  last_login: timestamp("last_login"),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
});

// Product Catalog Table (Aditya Birla Policies)
export const policies = pgTable("policies", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // Life, Health, Term, Retirement, Child, ULIP
  eligibility_criteria: text("eligibility_criteria").notNull(), // JSON string
  coverage_amounts: text("coverage_amounts").notNull(), // JSON array string
  term_range: varchar("term_range", { length: 255 }).notNull(),
  premium_range: text("premium_range").notNull(), // JSON array string
  tax_benefits: text("tax_benefits").notNull(),
  claim_settlement_ratio: real("claim_settlement_ratio").notNull(),
  riders_available: text("riders_available").notNull(), // JSON array string
  features: text("features").notNull(), // JSON array string
  documents_required: text("documents_required").notNull(), // JSON array string
  last_updated: timestamp("last_updated").notNull(),
});

// Third-Party Policy Comparison Table
export const competitor_policies = pgTable("competitor_policies", {
  id: varchar("id", { length: 255 }).primaryKey(),
  provider: varchar("provider", { length: 255 }).notNull(),
  policy_name: varchar("policy_name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  coverage_amount: real("coverage_amount").notNull(),
  premium: real("premium").notNull(),
  policy_term: varchar("policy_term", { length: 100 }).notNull(),
  claim_settlement_ratio: real("claim_settlement_ratio").notNull(),
  features: text("features").notNull(), // JSON array string
  pros: text("pros").notNull(), // JSON array string
  cons: text("cons").notNull(), // JSON array string
  fetched_from: varchar("fetched_from", { length: 255 }).notNull(),
  last_checked: timestamp("last_checked").notNull(),
});

// Interaction Logs Table
export const interaction_logs = pgTable("interaction_logs", {
  id: varchar("id", { length: 255 }).primaryKey(),
  chat_id: varchar("chat_id", { length: 255 }).notNull(),
  user_id: varchar("user_id", { length: 255 }).notNull(),
  customer_id: varchar("customer_id", { length: 255 }),
  messages: text("messages").notNull(), // JSON array string
  created_at: timestamp("created_at").notNull(),
  recommended_policy: varchar("recommended_policy", { length: 255 }),
  conversion_status: varchar("conversion_status", { length: 50 }), // Interested/Purchased/Rejected
  feedback_rating: integer("feedback_rating"),
});

// Chat Sessions Table
export const chat_sessions = pgTable("chat_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  user_id: varchar("user_id", { length: 255 }).notNull(),
  customer_id: varchar("customer_id", { length: 255 }),
  created_at: timestamp("created_at").notNull(),
  updated_at: timestamp("updated_at").notNull(),
  is_active: boolean("is_active").notNull().default(true),
});

// Users Table (Sales Representatives)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("sales_rep"),
  created_at: text("created_at").notNull(),
});

// Create insert schemas
export const insertCustomerSchema = createInsertSchema(customers);
export const insertPolicySchema = createInsertSchema(policies);
export const insertCompetitorPolicySchema = createInsertSchema(competitor_policies);
export const insertInteractionLogSchema = createInsertSchema(interaction_logs);
export const insertChatSessionSchema = createInsertSchema(chat_sessions);
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true });

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type CompetitorPolicy = typeof competitor_policies.$inferSelect;
export type InsertCompetitorPolicy = z.infer<typeof insertCompetitorPolicySchema>;
export type InteractionLog = typeof interaction_logs.$inferSelect;
export type InsertInteractionLog = z.infer<typeof insertInteractionLogSchema>;
export type ChatSession = typeof chat_sessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Additional types for API responses
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
};

export type CustomerPolicy = {
  provider: string;
  type: string;
  premium: number;
  coverage: string;
  term: string;
};

export type HealthCondition = {
  [key: string]: boolean;
};
