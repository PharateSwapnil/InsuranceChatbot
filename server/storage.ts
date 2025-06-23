import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import {
  users,
  customers,
  policies,
  competitor_policies,
  chat_sessions,
  interaction_logs,
  user_exemptions,
  type User,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Policy,
  type InsertPolicy,
  type CompetitorPolicy,
  type InsertCompetitorPolicy,
  type ChatSession,
  type InsertChatSession,
  type InteractionLog,
  type InsertInteractionLog,
  type UserExemption,
  type InsertUserExemption,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // User exemptions methods
  getUserExemptions(userId: string): Promise<UserExemption[]>;
  getUserExemptionByProductType(userId: string, productType: string): Promise<UserExemption | undefined>;
  createUserExemption(exemption: InsertUserExemption): Promise<UserExemption>;
  updateUserExemption(id: string, updates: Partial<UserExemption>): Promise<UserExemption>;

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
    try {
      const dataDir = path.resolve(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new Database(path.join(dataDir, "insurance.db"));
      this.initTables();
      this.seedData();
    } catch (error) {
      console.error("Database initialization error:", error);
      // Fallback to current directory
      this.db = new Database("insurance.db");
      this.initTables();
      this.seedData();
    }
  }

  private initTables() {
    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'sales_rep',
        level TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS customers (
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

      CREATE TABLE IF NOT EXISTS policies (
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

      CREATE TABLE IF NOT EXISTS competitor_policies (
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

      CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        customer_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS interaction_logs (
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

      CREATE TABLE IF NOT EXISTS user_exemptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_type TEXT NOT NULL,
        exemption_limit REAL NOT NULL,
        certification_type TEXT NOT NULL,
        valid_till TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);
  }

  private seedData() {
    // Check if demo user exists
    const existingUser = this.db.prepare("SELECT * FROM users LIMIT 1").get();
    if (existingUser) return;

    console.log("Seeding database with demo data...");

    // Create demo users with different certification types
    const currentTime = new Date().toISOString();

    const insertUser = this.db.prepare(`
      INSERT INTO users (id, username, password, name, email, role, level, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const demoUsers = [
      {
        id: "FHcKInMqnIZXqCISjkP4B",
        username: "sales.rep001",
        password: "abhi2024",
        name: "Abhishek Kumar (POSP)",
        email: "posp@adityabirla.com",
        role: "POSP",
        level: "level-3",
        created_at: new Date().toISOString(),
      },
      {
        id: "FHcKInMqnIZXqCISjkP5C",
        username: "agent.001",
        password: "agent2024",
        name: "Priya Sharma (IRDAI Agent)",
        email: "agent@adityabirla.com",
        role: "IRDAI_Agent",
        level: "level-2",
        created_at: new Date().toISOString(),
      },
      {
        id: "FHcKInMqnIZXqCISjkP6D",
        username: "broker.001",
        password: "broker2024",
        name: "Rajesh Gupta (Corporate Broker)",
        email: "broker@adityabirla.com",
        role: "Corporate_Broker",
        level: "level-3",
        created_at: new Date().toISOString(),
      },
      {
        id: "FHcKInMqnIZXqCISjkP7E",
        username: "group.001",
        password: "group2024",
        name: "Sunita Mehta (Group Insurance)",
        email: "group@adityabirla.com",
        role: "Group_Insurance",
        level: "level-1",
        created_at: new Date().toISOString(),
      },
    ];

    for (const user of demoUsers) {
      insertUser.run(
        user.id,
        user.username,
        user.password,
        user.name,
        user.email,
        user.role,
        user.level,
        user.created_at,
      );
    }

    // Create user exemptions for each user type
    const exemptionInsert = this.db.prepare(
      `INSERT INTO user_exemptions (id, user_id, product_type, exemption_limit, certification_type, valid_till, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const validTill = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year from now

    // POSP exemptions (limited to ₹2-5 lakhs)
    const pospUserId = "FHcKInMqnIZXqCISjkP4B";
    exemptionInsert.run(nanoid(), pospUserId, "Health", 200000, "POSP", validTill, currentTime, currentTime);
    exemptionInsert.run(nanoid(), pospUserId, "Term", 300000, "POSP", validTill, currentTime, currentTime);
    exemptionInsert.run(nanoid(), pospUserId, "Life", 500000, "POSP", validTill, currentTime, currentTime);

    // IRDAI Agent exemptions (moderate limits)
    const agentUserId = "FHcKInMqnIZXqCISjkP5C";
    exemptionInsert.run(nanoid(), agentUserId, "Health", 1000000, "IRDAI Agent", validTill, currentTime, currentTime);
    exemptionInsert.run(nanoid(), agentUserId, "Term", 2000000, "IRDAI Agent", validTill, currentTime, currentTime);
    exemptionInsert.run(nanoid(), agentUserId, "Life", 1500000, "IRDAI Agent", validTill, currentTime, currentTime);
    exemptionInsert.run(nanoid(), agentUserId, "ULIP", 1000000, "IRDAI Agent", validTill, currentTime, currentTime);

    // Corporate Broker exemptions (high limits)
    const brokerUserId = "FHcKInMqnIZXqCISjkP6D";
    exemptionInsert.run(nanoid(), brokerUserId, "Health", 5000000, "Corporate Agent", validTill, currentTime, currentTime);
    exemptionInsert.run(nanoid(), brokerUserId, "Term", 10000000, "Corporate Agent", validTill, currentTime, currentTime);
    exemptionInsert.run(nanoid(), brokerUserId, "Life", 7500000, "Corporate Agent", validTill, currentTime, currentTime);
    exemptionInsert.run(nanoid(), brokerUserId, "ULIP", 5000000, "Corporate Agent", validTill, currentTime, currentTime);

    // Group Insurance exemptions (group-based limits)
    const groupUserId = "FHcKInMqnIZXqCISjkP7E";
    exemptionInsert.run(nanoid(), groupUserId, "Group Health", 2000000, "Group Insurance", validTill, currentTime, currentTime);
    exemptionInsert.run(nanoid(), groupUserId, "Group Term", 5000000, "Group Insurance", validTill, currentTime, currentTime);

    // Generate and insert demo customers
    const demoCustomers = this.generateDummyCustomers(100);
    const insertCustomer = this.db.prepare(`
      INSERT INTO customers (
        id, name, age, gender, marital_status, profession, income_bracket,
        annual_income, city, state, dependents_count, health_conditions,
        financial_goals, risk_appetite, lifestyle, existing_policies,
        lead_source, last_login, phone, email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const customer of demoCustomers) {
      insertCustomer.run(
        customer.id,
        customer.name,
        customer.age,
        customer.gender,
        customer.marital_status,
        customer.profession,
        customer.income_bracket,
        customer.annual_income,
        customer.city,
        customer.state,
        customer.dependents_count,
        customer.health_conditions,
        customer.financial_goals,
        customer.risk_appetite,
        customer.lifestyle,
        customer.existing_policies,
        customer.lead_source,
        customer.last_login,
        customer.phone,
        customer.email,
      );
    }

    // Generate and insert demo policies
    const demoPolicies = this.generateAdityaBirlaPolicies();
    const insertPolicy = this.db.prepare(`
      INSERT INTO policies (
        id, name, type, eligibility_criteria, coverage_amounts, term_range,
        premium_range, tax_benefits, claim_settlement_ratio, riders_available,
        features, documents_required, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const policy of demoPolicies) {
      insertPolicy.run(
        policy.id,
        policy.name,
        policy.type,
        policy.eligibility_criteria,
        policy.coverage_amounts,
        policy.term_range,
        policy.premium_range,
        policy.tax_benefits,
        policy.claim_settlement_ratio,
        policy.riders_available,
        policy.features,
        policy.documents_required,
        policy.last_updated,
      );
    }

    // Generate and insert competitor policies
    const competitorPolicies = this.generateCompetitorPolicies();
    const insertCompetitor = this.db.prepare(`
      INSERT INTO competitor_policies (
        id, provider, policy_name, type, coverage_amount, premium, policy_term,
        claim_settlement_ratio, features, pros, cons, fetched_from, last_checked
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const policy of competitorPolicies) {
      insertCompetitor.run(
        policy.id,
        policy.provider,
        policy.policy_name,
        policy.type,
        policy.coverage_amount,
        policy.premium,
        policy.policy_term,
        policy.claim_settlement_ratio,
        policy.features,
        policy.pros,
        policy.cons,
        policy.fetched_from,
        policy.last_checked,
      );
    }

    console.log("Database seeded successfully with demo data");
  }

  private generateDummyCustomers(count: number): any[] {
    const customers = [];
    const maleNames = [
      "Rajesh Kumar",
      "Amit Patel",
      "Vikram Gupta",
      "Anil Joshi",
      "Suresh Menon",
      "Dev Sharma",
      "Karan Verma",
      "Arjun Kapoor",
      "Vivek Reddy",
      "Rohan Singh",
    ];
    const femaleNames = [
      "Priya Sharma",
      "Sunita Singh",
      "Anjali Nair",
      "Deepika Verma",
      "Neha Reddy",
      "Aisha Khan",
      "Shweta Patel",
      "Meera Joshi",
      "Divya Menon",
      "Sakshi Kapoor",
    ];
    const cities = [
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Chennai",
      "Kolkata",
      "Pune",
      "Hyderabad",
    ];
    const states = [
      "Maharashtra",
      "Delhi",
      "Karnataka",
      "Tamil Nadu",
      "West Bengal",
      "Telangana",
    ];
    const professions = [
      "Software Engineer",
      "Teacher",
      "Doctor",
      "Businessman",
      "Government Employee",
    ];

    for (let i = 0; i < count; i++) {
      const gender = Math.random() > 0.5 ? "M" : "F";
      const name = gender === "M" 
        ? maleNames[Math.floor(Math.random() * maleNames.length)]
        : femaleNames[Math.floor(Math.random() * femaleNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const profession = professions[Math.floor(Math.random() * professions.length)];
      const customerId = `cust-${String(i).padStart(3, "0")}`;
      customers.push({
        id: customerId,
        name: name,
        age: Math.floor(Math.random() * 42) + 18, // Age between 18-59
        gender: gender,
        marital_status: Math.random() > 0.6 ? "Married" : "Single",
        profession: professions[Math.floor(Math.random() * professions.length)],
        income_bracket: ["<5L", "5-10L", "10-25L", ">25L"][
          Math.floor(Math.random() * 4)
        ],
        annual_income: Math.floor(Math.random() * 2000000) + 300000,
        city: city,
        state: state,
        dependents_count: Math.floor(Math.random() * 4),
        health_conditions: JSON.stringify({
          diabetes: Math.random() > 0.8,
          hypertension: Math.random() > 0.7,
          heart_disease: Math.random() > 0.9,
        }),
        financial_goals: JSON.stringify([
          "Retirement Planning",
          "Child Education",
          "Wealth Creation",
        ]),
        risk_appetite: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        lifestyle: "Active",
        existing_policies: JSON.stringify([
          {
            provider: "Aditya Birla Sun Life Insurance",
            type: ["Health", "Term", "Life", "ULIP"][Math.floor(Math.random() * 4)],
            premium: 15000 + Math.floor(Math.random() * 35000),
            coverage: ["5,00,000", "10,00,000", "25,00,000", "50,00,000"][Math.floor(Math.random() * 4)],
            term: "20 years"
          },
          {
            provider: ["HDFC Life", "ICICI Prudential", "LIC", "SBI Life"][Math.floor(Math.random() * 4)],
            type: ["Health", "Term"][Math.floor(Math.random() * 2)],
            premium: 8000 + Math.floor(Math.random() * 25000),
            coverage: ["3,00,000", "5,00,000", "15,00,000"][Math.floor(Math.random() * 3)],
            term: "15 years"
          },
          {
            provider: ["Max Life", "Bajaj Allianz", "Tata AIA"][Math.floor(Math.random() * 3)],
            type: ["Health", "Life"][Math.floor(Math.random() * 2)],
            premium: 12000 + Math.floor(Math.random() * 20000),
            coverage: ["2,00,000", "7,50,000", "20,00,000"][Math.floor(Math.random() * 3)],
            term: "25 years"
          }
        ]),
        lead_source: "Website",
        last_login: new Date().toISOString(),
        phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        email: `customer${i}@example.com`,
      });
    }
    return customers;
  }

  private generateAdityaBirlaPolicies(): any[] {
    return [
      {
        id: "abhi-term-001",
        name: "Aditya Birla SL Insurance Smart Term Plan",
        type: "Term",
        eligibility_criteria: JSON.stringify({
          min_age: 18,
          max_age: 65,
          min_income: 300000,
        }),
        coverage_amounts: JSON.stringify([500000, 1000000, 2500000, 5000000]),
        term_range: "10-40 years",
        premium_range: JSON.stringify([5000, 50000]),
        tax_benefits: "Section 80C & 10(10D)",
        claim_settlement_ratio: 98.2,
        riders_available: JSON.stringify([
          "Accidental Death",
          "Critical Illness",
          "Waiver of Premium",
        ]),
        features: JSON.stringify([
          "High Sum Assured",
          "Affordable Premiums",
          "Tax Benefits",
        ]),
        documents_required: JSON.stringify([
          "Age Proof",
          "Income Proof",
          "Medical Reports",
        ]),
        last_updated: new Date().toISOString(),
      },
      {
        id: "abhi-ulip-001",
        name: "Aditya Birla SL Insurance ULIP Plan",
        type: "ULIP",
        eligibility_criteria: JSON.stringify({
          min_age: 18,
          max_age: 60,
          min_income: 500000,
        }),
        coverage_amounts: JSON.stringify([1000000, 2500000, 5000000, 10000000]),
        term_range: "10-30 years",
        premium_range: JSON.stringify([12000, 100000]),
        tax_benefits: "Section 80C & 10(10D)",
        claim_settlement_ratio: 97.8,
        riders_available: JSON.stringify([
          "Accidental Death",
          "Critical Illness",
        ]),
        features: JSON.stringify([
          "Investment + Insurance",
          "Flexible Premiums",
          "Wealth Creation",
        ]),
        documents_required: JSON.stringify([
          "Age Proof",
          "Income Proof",
          "Medical Reports",
        ]),
        last_updated: new Date().toISOString(),
      },
      {
        id: "abhi-health-001",
        name: "Aditya Birla Activ Health Plan",
        type: "Health",
        eligibility_criteria: JSON.stringify({
          min_age: 18,
          max_age: 65,
          min_income: 200000,
        }),
        coverage_amounts: JSON.stringify([300000, 500000, 1000000, 2000000]),
        term_range: "1 year renewable",
        premium_range: JSON.stringify([8000, 25000]),
        tax_benefits: "Section 80D",
        claim_settlement_ratio: 96.5,
        riders_available: JSON.stringify([
          "Critical Illness",
          "Personal Accident",
        ]),
        features: JSON.stringify([
          "Cashless Treatment",
          "No Room Rent Limit",
          "Wellness Benefits",
        ]),
        documents_required: JSON.stringify([
          "Age Proof",
          "Medical Reports",
          "Salary Certificate",
        ]),
        last_updated: new Date().toISOString(),
      },
    ];
  }

  private generateCompetitorPolicies(): any[] {
    return [
      {
        id: "hdfc-term-001",
        provider: "HDFC Life",
        policy_name: "HDFC Life Click 2 Protect Plus",
        type: "Term",
        coverage_amount: 1000000,
        premium: 8500,
        policy_term: "30 years",
        claim_settlement_ratio: 98.1,
        features: JSON.stringify([
          "Online Purchase",
          "Multiple Payment Options",
          "Tax Benefits",
        ]),
        pros: JSON.stringify(["Low Premium", "High Coverage", "Good CSR"]),
        cons: JSON.stringify(["Limited Riders", "No Money Back"]),
        fetched_from: "HDFC Website",
        last_checked: new Date().toISOString(),
      },
      {
        id: "icici-term-001",
        provider: "ICICI Prudential",
        policy_name: "ICICI Pru iProtect Smart",
        type: "Term",
        coverage_amount: 1000000,
        premium: 9200,
        policy_term: "30 years",
        claim_settlement_ratio: 97.8,
        features: JSON.stringify([
          "Flexible Premium",
          "Return of Premium Option",
          "Multiple Riders",
        ]),
        pros: JSON.stringify([
          "Return of Premium",
          "Flexible Options",
          "Strong Brand",
        ]),
        cons: JSON.stringify(["Higher Premium", "Complex Structure"]),
        fetched_from: "ICICI Website",
        last_checked: new Date().toISOString(),
      },
    ];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const stmt = this.db.prepare("SELECT * FROM users WHERE username = ?");
    const result = stmt.get(username) as User | undefined;
    return result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = {
      id: nanoid(),
      created_at: new Date().toISOString(),
      ...user,
    };

    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, password, name, email, role, level, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newUser.id,
      newUser.username,
      newUser.password,
      newUser.name,
      newUser.email,
      newUser.role,
      newUser.level,
      newUser.created_at,
    );

    return newUser as User;
  }

  // User exemptions methods
  async getUserExemptions(userId: string): Promise<UserExemption[]> {
    const stmt = this.db.prepare("SELECT * FROM user_exemptions WHERE user_id = ? ORDER BY product_type");
    return stmt.all(userId) as UserExemption[];
  }

  async getUserExemptionByProductType(userId: string, productType: string): Promise<UserExemption | undefined> {
    const stmt = this.db.prepare("SELECT * FROM user_exemptions WHERE user_id = ? AND product_type = ?");
    return stmt.get(userId, productType) as UserExemption | undefined;
  }

  async createUserExemption(exemption: InsertUserExemption): Promise<UserExemption> {
    const currentTime = new Date().toISOString();
    const newExemption = {
      id: nanoid(),
      created_at: currentTime,
      updated_at: currentTime,
      ...exemption,
    };

    const stmt = this.db.prepare(`
      INSERT INTO user_exemptions (id, user_id, product_type, exemption_limit, certification_type, valid_till, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newExemption.id,
      newExemption.user_id,
      newExemption.product_type,
      newExemption.exemption_limit,
      newExemption.certification_type,
      newExemption.valid_till,
      newExemption.created_at,
      newExemption.updated_at,
    );

    return newExemption as UserExemption;
  }

  async updateUserExemption(id: string, updates: Partial<UserExemption>): Promise<UserExemption> {
    const currentTime = new Date().toISOString();
    const updatedData = {
      ...updates,
      updated_at: currentTime,
    };

    const setClause = Object.keys(updatedData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updatedData);

    const stmt = this.db.prepare(`UPDATE user_exemptions SET ${setClause} WHERE id = ?`);
    stmt.run(...values, id);

    const selectStmt = this.db.prepare("SELECT * FROM user_exemptions WHERE id = ?");
    return selectStmt.get(id) as UserExemption;
  }

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
      WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? OR id LIKE ?
      ORDER BY name
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm, searchTerm) as Customer[];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const newCustomer = {
      id: nanoid(),
      ...customer,
    };

    const stmt = this.db.prepare(`
      INSERT INTO customers (
        id, name, age, gender, marital_status, profession, income_bracket,
        annual_income, city, state, dependents_count, health_conditions,
        financial_goals, risk_appetite, lifestyle, existing_policies,
        lead_source, last_login, phone, email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newCustomer.id,
      newCustomer.name,
      newCustomer.age,
      newCustomer.gender,
      newCustomer.marital_status,
      newCustomer.profession,
      newCustomer.income_bracket,
      newCustomer.annual_income,
      newCustomer.city,
      newCustomer.state,
      newCustomer.dependents_count,
      newCustomer.health_conditions,
      newCustomer.financial_goals,
      newCustomer.risk_appetite,
      newCustomer.lifestyle,
      newCustomer.existing_policies,
      newCustomer.lead_source,
      newCustomer.last_login,
      newCustomer.phone,
      newCustomer.email,
    );

    return newCustomer as Customer;
  }

  async getPolicies(): Promise<Policy[]> {
    const stmt = this.db.prepare("SELECT * FROM policies ORDER BY name");
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

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const stmt = this.db.prepare("SELECT * FROM chat_sessions WHERE id = ?");
    return stmt.get(id) as ChatSession | undefined;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const newSession = {
      id: nanoid(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: 1,
      ...session,
    };

    const stmt = this.db.prepare(`
      INSERT INTO chat_sessions (id, user_id, customer_id, created_at, updated_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newSession.id,
      newSession.user_id,
      newSession.customer_id,
      newSession.created_at,
      newSession.updated_at,
      newSession.is_active,
    );

    return newSession as ChatSession;
  }

  async updateChatSession(
    id: string,
    updates: Partial<ChatSession>,
  ): Promise<ChatSession> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const stmt = this.db.prepare(`
      UPDATE chat_sessions 
      SET customer_id = ?, updated_at = ?, is_active = ?
      WHERE id = ?
    `);

    stmt.run(
      updateData.customer_id,
      updateData.updated_at,
      updateData.is_active,
      id,
    );

    const getStmt = this.db.prepare("SELECT * FROM chat_sessions WHERE id = ?");
    return getStmt.get(id) as ChatSession;
  }

  async createInteractionLog(
    log: InsertInteractionLog,
  ): Promise<InteractionLog> {
    const newLog = {
      id: nanoid(),
      created_at: new Date().toISOString(),
      ...log,
    };

    const stmt = this.db.prepare(`
      INSERT INTO interaction_logs (
        id, chat_id, user_id, customer_id, messages, created_at,
        recommended_policy, conversion_status, feedback_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newLog.id,
      newLog.chat_id,
      newLog.user_id,
      newLog.customer_id,
      newLog.messages,
      newLog.created_at,
      newLog.recommended_policy,
      newLog.conversion_status,
      newLog.feedback_rating,
    );

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