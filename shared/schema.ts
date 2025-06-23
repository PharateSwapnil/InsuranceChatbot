import { text, integer, real } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customer Profile Table
export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // M/F/Others
  marital_status: text("marital_status").notNull(), // Single/Married/Widowed/Divorced
  profession: text("profession").notNull(),
  income_bracket: text("income_bracket").notNull(), // <5L, 5-10L, 10-25L, >25L
  annual_income: real("annual_income"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  dependents_count: integer("dependents_count").notNull(),
  health_conditions: text("health_conditions").notNull(), // JSON string
  financial_goals: text("financial_goals").notNull(), // JSON array string
  risk_appetite: text("risk_appetite").notNull(), // Low/Medium/High
  lifestyle: text("lifestyle").notNull(),
  existing_policies: text("existing_policies").notNull(), // JSON array string
  lead_source: text("lead_source").notNull(),
  last_login: text("last_login"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
});

// Product Catalog Table (Aditya Birla Policies)
export const policies = sqliteTable("policies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Life, Health, Term, Retirement, Child, ULIP
  eligibility_criteria: text("eligibility_criteria").notNull(), // JSON string
  coverage_amounts: text("coverage_amounts").notNull(), // JSON array string
  term_range: text("term_range").notNull(),
  premium_range: text("premium_range").notNull(), // JSON array string
  tax_benefits: text("tax_benefits").notNull(),
  claim_settlement_ratio: real("claim_settlement_ratio").notNull(),
  riders_available: text("riders_available").notNull(), // JSON array string
  features: text("features").notNull(), // JSON array string
  documents_required: text("documents_required").notNull(), // JSON array string
  last_updated: text("last_updated").notNull(),
});

// Third-Party Policy Comparison Table
export const competitor_policies = sqliteTable("competitor_policies", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  policy_name: text("policy_name").notNull(),
  type: text("type").notNull(),
  coverage_amount: real("coverage_amount").notNull(),
  premium: real("premium").notNull(),
  policy_term: text("policy_term").notNull(),
  claim_settlement_ratio: real("claim_settlement_ratio").notNull(),
  features: text("features").notNull(), // JSON array string
  pros: text("pros").notNull(), // JSON array string
  cons: text("cons").notNull(), // JSON array string
  fetched_from: text("fetched_from").notNull(),
  last_checked: text("last_checked").notNull(),
});

// Interaction Logs Table
export const interaction_logs = sqliteTable("interaction_logs", {
  id: text("id").primaryKey(),
  chat_id: text("chat_id").notNull(),
  user_id: text("user_id").notNull(),
  customer_id: text("customer_id"),
  messages: text("messages").notNull(), // JSON array string
  created_at: text("created_at").notNull(),
  recommended_policy: text("recommended_policy"),
  conversion_status: text("conversion_status"), // Interested/Purchased/Rejected
  feedback_rating: integer("feedback_rating"),
});

// Chat Sessions Table
export const chat_sessions = sqliteTable("chat_sessions", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  customer_id: text("customer_id"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
  is_active: integer("is_active").notNull().default(1),
});

// Users Table (Sales Representatives)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("sales_advisor"),
  level: text("level").notNull().default("level-1"),
  created_at: text("created_at").notNull(),
});

export const user_exemptions = sqliteTable("user_exemptions", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().references(() => users.id),
  product_type: text("product_type").notNull(), // "Health", "Life", "Term", "ULIP"
  exemption_limit: real("exemption_limit").notNull(), // Amount limit for sales without underwriting
  certification_type: text("certification_type").notNull(), // "POSP", "IRDAI Agent", "Corporate Agent", "Group Insurance"
  valid_till: text("valid_till").notNull(), // Date till exemption is valid
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

// Create insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertPolicySchema = createInsertSchema(policies).omit({ id: true });
export const insertCompetitorPolicySchema = createInsertSchema(competitor_policies).omit({ id: true });
export const insertInteractionLogSchema = createInsertSchema(interaction_logs).omit({ id: true, created_at: true });
export const insertChatSessionSchema = createInsertSchema(chat_sessions).omit({ id: true, created_at: true, updated_at: true, is_active: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true });
export const insertUserExemptionSchema = createInsertSchema(user_exemptions).omit({ id: true, created_at: true, updated_at: true });

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
export type UserExemption = typeof user_exemptions.$inferSelect;
export type InsertUserExemption = z.infer<typeof insertUserExemptionSchema>;

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
