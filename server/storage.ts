import Database from "better-sqlite3";
import {
  customers,
  policies,
  competitor_policies,
  interaction_logs,
  chat_sessions,
  users,
  type Customer,
  type InsertCustomer,
  type Policy,
  type InsertPolicy,
  type CompetitorPolicy,
  type InsertCompetitorPolicy,
  type InteractionLog,
  type InsertInteractionLog,
  type ChatSession,
  type InsertChatSession,
  type User,
  type InsertUser,
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // User methods
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  searchCustomers(query: string): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;

  // Policy methods
  getPolicies(): Promise<Policy[]>;
  getPolicy(id: string): Promise<Policy | undefined>;
  getPoliciesByType(type: string): Promise<Policy[]>;

  // Competitor policy methods
  getCompetitorPolicies(): Promise<CompetitorPolicy[]>;
  getCompetitorPoliciesByProvider(
    provider: string,
  ): Promise<CompetitorPolicy[]>;

  // Chat methods
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(
    id: string,
    updates: Partial<ChatSession>,
  ): Promise<ChatSession>;

  // Interaction log methods
  createInteractionLog(log: InsertInteractionLog): Promise<InteractionLog>;
  getInteractionLogsByCustomer(customerId: string): Promise<InteractionLog[]>;
}

export class SqliteStorage implements IStorage {
  private db: Database.Database;

  constructor() {
    this.db = new Database(":memory:");
    this.initTables();
    this.seedData();
  }

  private initTables() {
    // Create tables
    this.db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'sales_rep',
        created_at TEXT NOT NULL
      );

      CREATE TABLE customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        marital_status TEXT NOT NULL,
        profession TEXT NOT NULL,
        income_bracket TEXT NOT NULL,
        annual_income REAL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        dependents_count INTEGER NOT NULL,
        health_conditions TEXT NOT NULL,
        financial_goals TEXT NOT NULL,
        risk_appetite TEXT NOT NULL,
        lifestyle TEXT NOT NULL,
        existing_policies TEXT NOT NULL,
        lead_source TEXT NOT NULL,
        last_login TEXT,
        phone TEXT NOT NULL,
        email TEXT NOT NULL
      );

      CREATE TABLE policies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        eligibility_criteria TEXT NOT NULL,
        coverage_amounts TEXT NOT NULL,
        term_range TEXT NOT NULL,
        premium_range TEXT NOT NULL,
        tax_benefits TEXT NOT NULL,
        claim_settlement_ratio REAL NOT NULL,
        riders_available TEXT NOT NULL,
        features TEXT NOT NULL,
        documents_required TEXT NOT NULL,
        last_updated TEXT NOT NULL
      );

      CREATE TABLE competitor_policies (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        policy_name TEXT NOT NULL,
        type TEXT NOT NULL,
        coverage_amount REAL NOT NULL,
        premium REAL NOT NULL,
        policy_term TEXT NOT NULL,
        claim_settlement_ratio REAL NOT NULL,
        features TEXT NOT NULL,
        pros TEXT NOT NULL,
        cons TEXT NOT NULL,
        fetched_from TEXT NOT NULL,
        last_checked TEXT NOT NULL
      );

      CREATE TABLE interaction_logs (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        customer_id TEXT,
        messages TEXT NOT NULL,
        created_at TEXT NOT NULL,
        recommended_policy TEXT,
        conversion_status TEXT,
        feedback_rating INTEGER
      );

      CREATE TABLE chat_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        customer_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1
      );
    `);
  }

  private seedData() {
    // Insert demo user
    this.db
      .prepare(
        `
      INSERT INTO users (id, username, password, name, email, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        nanoid(),
        "sales.adv001",
        "abhi2024",
        "Sales Advisor 001",
        "sales.adv001@adityabirla.com",
        "Sales_Advisor",
        new Date().toISOString(),
      );

    // Insert Aditya Birla policies
    const adityaBirlaPolicies = [
      {
        id: nanoid(),
        name: "Activ Health Enhanced",
        type: "Health",
        eligibility_criteria: JSON.stringify({
          min_age: 18,
          max_age: 65,
          income_min: 200000,
        }),
        coverage_amounts: JSON.stringify([
          300000, 500000, 1000000, 2500000, 5000000, 10000000,
        ]),
        term_range: "1 year renewable",
        premium_range: JSON.stringify([5500, 45000]),
        tax_benefits: "Section 80D up to ₹25,000",
        claim_settlement_ratio: 98.2,
        riders_available: JSON.stringify([
          "Critical Illness",
          "Personal Accident",
          "Hospital Cash",
        ]),
        features: JSON.stringify([
          "No room rent capping",
          "Global coverage",
          "Wellness rewards",
          "Cashless network 6500+",
        ]),
        documents_required: JSON.stringify([
          "Aadhaar",
          "PAN",
          "Medical reports",
          "Salary slips",
        ]),
        last_updated: new Date().toISOString(),
      },
      {
        id: nanoid(),
        name: "Protect@Ease",
        type: "Term",
        eligibility_criteria: JSON.stringify({
          min_age: 18,
          max_age: 65,
          income_min: 150000,
        }),
        coverage_amounts: JSON.stringify([
          2500000, 5000000, 10000000, 25000000, 50000000, 100000000,
        ]),
        term_range: "10-40 years",
        premium_range: JSON.stringify([8500, 85000]),
        tax_benefits: "Section 80C up to ₹1.5L + Section 10(10D)",
        claim_settlement_ratio: 98.2,
        riders_available: JSON.stringify([
          "Accidental Death",
          "Critical Illness",
          "Waiver of Premium",
          "Terminal Illness",
        ]),
        features: JSON.stringify([
          "Return of premium option",
          "Increasing cover",
          "Online policy",
          "Quick claims",
        ]),
        documents_required: JSON.stringify([
          "Aadhaar",
          "PAN",
          "Income proof",
          "Medical reports",
        ]),
        last_updated: new Date().toISOString(),
      },
      {
        id: nanoid(),
        name: "Vision LifeIncome Plan",
        type: "ULIP",
        eligibility_criteria: JSON.stringify({
          min_age: 18,
          max_age: 60,
          income_min: 300000,
        }),
        coverage_amounts: JSON.stringify([
          500000, 1000000, 2500000, 5000000, 10000000,
        ]),
        term_range: "10-30 years",
        premium_range: JSON.stringify([24000, 250000]),
        tax_benefits: "Section 80C up to ₹1.5L + Section 10(10D) on maturity",
        claim_settlement_ratio: 98.2,
        riders_available: JSON.stringify([
          "Accidental Death",
          "Critical Illness",
          "Waiver of Premium",
        ]),
        features: JSON.stringify([
          "Guaranteed income",
          "Fund switching",
          "Partial withdrawals",
          "Top-up facility",
        ]),
        documents_required: JSON.stringify([
          "Aadhaar",
          "PAN",
          "Income proof",
          "Bank statements",
        ]),
        last_updated: new Date().toISOString(),
      },
      {
        id: nanoid(),
        name: "Child Secure Plan",
        type: "Child",
        eligibility_criteria: JSON.stringify({
          child_age: 0,
          child_max_age: 17,
          parent_min_age: 18,
          parent_max_age: 55,
        }),
        coverage_amounts: JSON.stringify([500000, 1000000, 2500000, 5000000]),
        term_range: "Until child turns 25",
        premium_range: JSON.stringify([10000, 100000]),
        tax_benefits: "Section 80C up to ₹1.5L",
        claim_settlement_ratio: 98.2,
        riders_available: JSON.stringify([
          "Waiver of Premium",
          "Accidental Death",
        ]),
        features: JSON.stringify([
          "Education bonuses",
          "Marriage benefit",
          "Premium waiver",
          "Flexible payouts",
        ]),
        documents_required: JSON.stringify([
          "Child birth certificate",
          "Parent Aadhaar",
          "PAN",
          "Income proof",
        ]),
        last_updated: new Date().toISOString(),
      },
      {
        id: nanoid(),
        name: "Vision Life Pension Plan",
        type: "Retirement",
        eligibility_criteria: JSON.stringify({
          min_age: 18,
          max_age: 60,
          income_min: 200000,
        }),
        coverage_amounts: JSON.stringify([500000, 1000000, 2500000, 5000000]),
        term_range: "10-40 years",
        premium_range: JSON.stringify([12000, 500000]),
        tax_benefits: "Section 80C up to ₹1.5L + Section 80CCC",
        claim_settlement_ratio: 98.2,
        riders_available: JSON.stringify(["Joint Life", "Guaranteed Period"]),
        features: JSON.stringify([
          "Immediate/Deferred annuity",
          "Life annuity",
          "Pension guarantee",
          "Spouse coverage",
        ]),
        documents_required: JSON.stringify([
          "Aadhaar",
          "PAN",
          "Income proof",
          "Age proof",
        ]),
        last_updated: new Date().toISOString(),
      },
    ];

    const insertPolicy = this.db.prepare(`
      INSERT INTO policies (id, name, type, eligibility_criteria, coverage_amounts, term_range, premium_range, tax_benefits, claim_settlement_ratio, riders_available, features, documents_required, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    adityaBirlaPolicies.forEach((policy) => {
      insertPolicy.run(...Object.values(policy));
    });

    // Insert competitor policies
    const competitorPolicies = [
      {
        id: nanoid(),
        provider: "ICICI Prudential",
        policy_name: "iProtect Smart Term Plan",
        type: "Term",
        coverage_amount: 10000000,
        premium: 12000,
        policy_term: "30 years",
        claim_settlement_ratio: 97.8,
        features: JSON.stringify([
          "Online application",
          "Return of premium",
          "Life stage benefit",
        ]),
        pros: JSON.stringify([
          "Good claim ratio",
          "Flexible premium payment",
          "Return option available",
        ]),
        cons: JSON.stringify([
          "Higher premium than ABL",
          "Limited rider options",
          "Complex terms",
        ]),
        fetched_from: "Official website",
        last_checked: new Date().toISOString(),
      },
      {
        id: nanoid(),
        provider: "HDFC Life",
        policy_name: "Click 2 Protect Life",
        type: "Term",
        coverage_amount: 10000000,
        premium: 11500,
        policy_term: "30 years",
        claim_settlement_ratio: 98.0,
        features: JSON.stringify([
          "Online policy",
          "Income benefit",
          "Terminal illness cover",
        ]),
        pros: JSON.stringify([
          "Competitive pricing",
          "Good online experience",
          "Income replacement",
        ]),
        cons: JSON.stringify([
          "Premium increases with add-ons",
          "Limited coverage options",
          "Strict underwriting",
        ]),
        fetched_from: "Official website",
        last_checked: new Date().toISOString(),
      },
      {
        id: nanoid(),
        provider: "LIC",
        policy_name: "Tech Term Plan",
        type: "Term",
        coverage_amount: 10000000,
        premium: 13500,
        policy_term: "30 years",
        claim_settlement_ratio: 98.5,
        features: JSON.stringify([
          "Traditional insurer",
          "Terminal illness benefit",
          "Accidental death benefit",
        ]),
        pros: JSON.stringify([
          "Trusted brand",
          "High claim ratio",
          "Simplified underwriting",
        ]),
        cons: JSON.stringify([
          "Higher premiums",
          "Limited online features",
          "Slow processing",
        ]),
        fetched_from: "Official website",
        last_checked: new Date().toISOString(),
      },
    ];

    const insertCompetitorPolicy = this.db.prepare(`
      INSERT INTO competitor_policies (id, provider, policy_name, type, coverage_amount, premium, policy_term, claim_settlement_ratio, features, pros, cons, fetched_from, last_checked)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    competitorPolicies.forEach((policy) => {
      insertCompetitorPolicy.run(...Object.values(policy));
    });

    // Insert 100 dummy customers
    const customers = this.generateDummyCustomers(100);
    const insertCustomer = this.db.prepare(`
      INSERT INTO customers (id, name, age, gender, marital_status, profession, income_bracket, annual_income, city, state, dependents_count, health_conditions, financial_goals, risk_appetite, lifestyle, existing_policies, lead_source, last_login, phone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    customers.forEach((customer) => {
      insertCustomer.run(...Object.values(customer));
    });
  }

  private generateDummyCustomers(count: number): any[] {
    const names = [
      "Rajesh Kumar",
      "Priya Sharma",
      "Amit Patel",
      "Sneha Gupta",
      "Vikram Singh",
      "Anjali Mehta",
      "Ravi Agarwal",
      "Pooja Jain",
      "Suresh Reddy",
      "Kavita Iyer",
      "Manoj Verma",
      "Sunita Rao",
      "Ashok Tiwari",
      "Meera Nair",
      "Deepak Joshi",
      "Ritu Khanna",
      "Sanjay Malhotra",
      "Neha Agrawal",
      "Ramesh Choudhary",
      "Anita Bansal",
    ];

    const cities = [
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Hyderabad",
      "Chennai",
      "Kolkata",
      "Pune",
      "Ahmedabad",
      "Jaipur",
      "Lucknow",
      "Kanpur",
      "Nagpur",
      "Indore",
      "Thane",
      "Bhopal",
      "Visakhapatnam",
      "Pimpri-Chinchwad",
      "Patna",
      "Vadodara",
      "Ghaziabad",
    ];

    const professions = [
      "Software Engineer",
      "Marketing Manager",
      "Business Owner",
      "Doctor",
      "Teacher",
      "Accountant",
      "Sales Manager",
      "Consultant",
      "Banker",
      "Engineer",
      "Architect",
      "Lawyer",
      "CA",
      "Designer",
      "Project Manager",
      "Analyst",
      "Executive",
      "Supervisor",
    ];

    const providers = [
      "Aditya Birla",
      "ICICI Prudential",
      "HDFC Life",
      "LIC",
      "SBI Life",
      "Star Health",
      "Max Life",
    ];
    const policyTypes = ["Health", "Term", "ULIP", "Endowment", "Whole Life"];

    const customers = [];

    for (let i = 0; i < count; i++) {
      const age = 25 + Math.floor(Math.random() * 40);
      const income = 300000 + Math.floor(Math.random() * 2000000);
      const dependents = Math.floor(Math.random() * 4);

      // Generate existing policies - at least one Aditya Birla + 2 others
      const existingPolicies = [];

      // Always add one Aditya Birla policy
      existingPolicies.push({
        provider: "Aditya Birla",
        type: policyTypes[Math.floor(Math.random() * policyTypes.length)],
        premium: 8000 + Math.floor(Math.random() * 40000),
        coverage: (500000 + Math.floor(Math.random() * 4500000)).toString(),
        term: 10 + Math.floor(Math.random() * 25) + "yrs",
      });

      // Add 2 other policies from different providers
      for (let j = 0; j < 2; j++) {
        const otherProviders = providers.filter((p) => p !== "Aditya Birla");
        existingPolicies.push({
          provider:
            otherProviders[Math.floor(Math.random() * otherProviders.length)],
          type: policyTypes[Math.floor(Math.random() * policyTypes.length)],
          premium: 5000 + Math.floor(Math.random() * 35000),
          coverage: (300000 + Math.floor(Math.random() * 4700000)).toString(),
          term: 5 + Math.floor(Math.random() * 30) + "yrs",
        });
      }

      const customer = {
        id: `cust-${String(i + 1).padStart(3, "0")}`,
        name: `${names[i % names.length]} ${i > 19 ? Math.floor(i / 20) : ""}`.trim(),
        age,
        gender: i % 2 === 0 ? "M" : "F",
        marital_status: age > 28 && Math.random() > 0.3 ? "Married" : "Single",
        profession: professions[Math.floor(Math.random() * professions.length)],
        income_bracket:
          income < 500000
            ? "<5L"
            : income < 1000000
              ? "5-10L"
              : income < 2500000
                ? "10-25L"
                : ">25L",
        annual_income: income,
        city: cities[Math.floor(Math.random() * cities.length)],
        state: "India",
        dependents_count: dependents,
        health_conditions: JSON.stringify({
          diabetes: Math.random() > 0.9,
          heart_disease: Math.random() > 0.95,
          hypertension: Math.random() > 0.85,
          smoker: Math.random() > 0.8,
        }),
        financial_goals: JSON.stringify(
          [
            "Term Insurance",
            "Health Insurance",
            Math.random() > 0.5 ? "Child Education" : "Retirement Planning",
            Math.random() > 0.7 ? "Tax Saving" : "Wealth Creation",
          ].filter(Boolean),
        ),
        risk_appetite: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        lifestyle:
          Math.random() > 0.8
            ? "Smoker, Occasional Exercise"
            : "Non-smoker, Regular Exercise",
        existing_policies: JSON.stringify(existingPolicies),
        lead_source: [
          "Website",
          "Referral",
          "Branch",
          "Social Media",
          "Cold Call",
        ][Math.floor(Math.random() * 5)],
        last_login: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
        ).toISOString(),
        phone: `+91-98765${String(43210 + i).slice(-5)}`,
        email: `${names[i % names.length].toLowerCase().replace(" ", ".")}${i > 19 ? i : ""}@email.com`,
      };

      customers.push(customer);
    }

    return customers;
  }

  // User methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    const stmt = this.db.prepare("SELECT * FROM users WHERE username = ?");
    return stmt.get(username) as User | undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = nanoid();
    const created_at = new Date().toISOString();
    const newUser = { id, ...user, created_at };

    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, password, name, email, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newUser.id,
      newUser.username,
      newUser.password,
      newUser.name,
      newUser.email,
      newUser.role,
      newUser.created_at,
    );
    return newUser as User;
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    const stmt = this.db.prepare("SELECT * FROM customers ORDER BY name");
    return stmt.all() as Customer[];
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const stmt = this.db.prepare("SELECT * FROM customers WHERE id = ?");
    return stmt.get(id) as Customer | undefined;
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM customers 
      WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? 
      ORDER BY name 
      LIMIT 10
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm) as Customer[];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = nanoid();
    const newCustomer = { id, ...customer };

    const stmt = this.db.prepare(`
      INSERT INTO customers (id, name, age, gender, marital_status, profession, income_bracket, annual_income, city, state, dependents_count, health_conditions, financial_goals, risk_appetite, lifestyle, existing_policies, lead_source, last_login, phone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(...Object.values(newCustomer));
    return newCustomer as Customer;
  }

  // Policy methods
  async getPolicies(): Promise<Policy[]> {
    const stmt = this.db.prepare("SELECT * FROM policies ORDER BY type, name");
    return stmt.all() as Policy[];
  }

  async getPolicy(id: string): Promise<Policy | undefined> {
    const stmt = this.db.prepare("SELECT * FROM policies WHERE id = ?");
    return stmt.get(id) as Policy | undefined;
  }

  async getPoliciesByType(type: string): Promise<Policy[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM policies WHERE type = ? ORDER BY name",
    );
    return stmt.all(type) as Policy[];
  }

  // Competitor policy methods
  async getCompetitorPolicies(): Promise<CompetitorPolicy[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM competitor_policies ORDER BY provider, policy_name",
    );
    return stmt.all() as CompetitorPolicy[];
  }

  async getCompetitorPoliciesByProvider(
    provider: string,
  ): Promise<CompetitorPolicy[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM competitor_policies WHERE provider = ? ORDER BY policy_name",
    );
    return stmt.all(provider) as CompetitorPolicy[];
  }

  // Chat methods
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const stmt = this.db.prepare("SELECT * FROM chat_sessions WHERE id = ?");
    return stmt.get(id) as ChatSession | undefined;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const stmt = this.db.prepare(`
      INSERT INTO chat_sessions (id, user_id, customer_id, created_at, updated_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const isActiveValue =
      typeof session.is_active === "boolean"
        ? session.is_active
          ? 1
          : 0
        : session.is_active;
    stmt.run(
      session.id,
      session.user_id,
      session.customer_id,
      session.created_at,
      session.updated_at,
      isActiveValue,
    );
    return session as ChatSession;
  }

  async updateChatSession(
    id: string,
    updates: Partial<ChatSession>,
  ): Promise<ChatSession> {
    const updated_at = new Date().toISOString();
    const session = await this.getChatSession(id);
    if (!session) throw new Error("Chat session not found");

    const updatedSession = { ...session, ...updates, updated_at };

    const stmt = this.db.prepare(`
      UPDATE chat_sessions 
      SET customer_id = ?, updated_at = ?, is_active = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedSession.customer_id,
      updatedSession.updated_at,
      updatedSession.is_active ? 1 : 0,
      id,
    );
    return updatedSession;
  }

  // Interaction log methods
  async createInteractionLog(
    log: InsertInteractionLog,
  ): Promise<InteractionLog> {
    const newLog = log;

    const stmt = this.db.prepare(`
      INSERT INTO interaction_logs (id, chat_id, user_id, customer_id, messages, created_at, recommended_policy, conversion_status, feedback_rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(...Object.values(newLog));
    return newLog as InteractionLog;
  }

  async getInteractionLogsByCustomer(
    customerId: string,
  ): Promise<InteractionLog[]> {
    const stmt = this.db.prepare(
      "SELECT * FROM interaction_logs WHERE customer_id = ? ORDER BY created_at DESC",
    );
    return stmt.all(customerId) as InteractionLog[];
  }
}

export const storage = new SqliteStorage();
