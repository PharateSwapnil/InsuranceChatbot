# Database Schema Documentation

## Overview
The application uses SQLite database with Drizzle ORM for data persistence. The database is automatically created and seeded with demo data on application startup.

## Database Location
- **Development**: `./data/insurance.db`
- **Schema Definition**: `shared/schema.ts`
- **Database Configuration**: `server/db.ts`
- **Storage Implementation**: `server/storage.ts`

## Tables and Schema

### 1. users
**Purpose**: Store sales advisor information and authentication
**Location**: `shared/schema.ts` line 89-97

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | text (primary key) | Unique identifier | "FHcKInMqnIZXqCISjkP4B" |
| username | text (unique) | Login username | "sales.rep001" |
| password | text | Plain text password | "abhi2024" |
| name | text | Full name | "Rajesh Kumar" |
| email | text | Email address | "rajesh.kumar@adityabirla.com" |
| role | text | Advisor role | "POSP" |
| created_at | text | Creation timestamp | "2024-06-05T10:30:00Z" |

**Demo Users Created**:
- sales.rep001/abhi2024 (POSP)
- agent.001/agent2024 (IRDAI Agent)
- broker.001/broker2024 (Corporate Broker)
- group.001/group2024 (Group Insurance)

### 2. user_exemptions
**Purpose**: Define underwriting exemption limits for each advisor type
**Location**: `shared/schema.ts` line 99-108

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | text (primary key) | Unique identifier | "exemp_001" |
| user_id | text (foreign key) | Reference to users.id | "FHcKInMqnIZXqCISjkP4B" |
| product_type | text | Insurance product type | "Health Insurance" |
| exemption_limit | integer | Max coverage without underwriting | 200000 |
| certification_type | text | Certification level | "POSP" |
| created_at | text | Creation timestamp | "2024-06-05T10:30:00Z" |
| updated_at | text | Last update timestamp | "2024-06-05T10:30:00Z" |

**Exemption Limits by Role**:
- **POSP**: Health Insurance (₹2L), Term Insurance (₹10L), Investment Products (₹5L)
- **IRDAI Agent**: Health Insurance (₹10L), Term Insurance (₹50L), Investment Products (₹25L)
- **Corporate Broker**: Health Insurance (₹25L), Term Insurance (₹1Cr), Investment Products (₹50L)
- **Group Insurance**: Health Insurance (₹50L), Term Insurance (₹2Cr), Investment Products (₹1Cr)

### 3. customers
**Purpose**: Store customer profiles and demographics
**Location**: `shared/schema.ts` line 9-25

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | text (primary key) | Unique identifier | "cust-001" |
| name | text | Customer name | "Priya Sharma" |
| age | integer | Customer age | 32 |
| gender | text | Gender | "Female" |
| marital_status | text | Marital status | "Married" |
| profession | text | Occupation | "Software Engineer" |
| income_bracket | text | Income range | "₹8-12 Lakhs" |
| city | text | City of residence | "Bangalore" |
| dependents_count | integer | Number of dependents | 2 |
| risk_appetite | text | Risk tolerance | "Moderate" |
| existing_policies | text (JSON) | Current insurance policies | "[{\"provider\":\"HDFC ERGO\",\"type\":\"Health\"}]" |
| financial_goals | text (JSON) | Financial objectives | "[\"Child Education\",\"Retirement\"]" |
| health_conditions | text (JSON) | Medical conditions | "{\"diabetes\":false,\"hypertension\":true}" |

**Auto-generated**: 100 demo customers with realistic profiles

### 4. policies
**Purpose**: Aditya Birla Insurance product catalog
**Location**: `shared/schema.ts` line 27-40

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | text (primary key) | Unique identifier | "pol-001" |
| name | text | Policy name | "Activ Health Enhanced" |
| type | text | Insurance type | "Health Insurance" |
| description | text | Policy description | "Comprehensive health coverage..." |
| coverage_amount | text | Coverage details | "₹3L to ₹1Cr" |
| premium_range | text | Premium range | "₹8,500 - ₹45,000/year" |
| key_features | text (JSON) | Main features | "[\"No room rent capping\",\"Global coverage\"]" |
| eligibility | text | Eligibility criteria | "Age 18-65, No pre-existing conditions" |
| claim_settlement_ratio | real | Settlement percentage | 98.2 |

### 5. competitor_policies
**Purpose**: Competitor insurance products for comparison
**Location**: `shared/schema.ts` line 42-53

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | text (primary key) | Unique identifier | "comp-001" |
| provider | text | Insurance company | "HDFC ERGO" |
| name | text | Policy name | "My Health Suraksha" |
| type | text | Insurance type | "Health Insurance" |
| coverage_amount | text | Coverage details | "₹1L to ₹50L" |
| premium_range | text | Premium range | "₹6,000 - ₹35,000/year" |
| key_features | text (JSON) | Main features | "[\"Cashless claims\",\"Wellness benefits\"]" |
| claim_settlement_ratio | real | Settlement percentage | 95.1 |

### 6. chat_sessions
**Purpose**: Track chat conversations between advisors and customers
**Location**: `shared/schema.ts` line 55-64

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | text (primary key) | Unique identifier | "sess_001" |
| user_id | text (foreign key) | Reference to users.id | "FHcKInMqnIZXqCISjkP4B" |
| customer_id | text (nullable) | Reference to customers.id | "cust-001" |
| created_at | text | Session start time | "2024-06-05T10:30:00Z" |
| updated_at | text | Last activity time | "2024-06-05T10:45:00Z" |
| is_active | integer | Session status (0/1) | 1 |

### 7. interaction_logs
**Purpose**: Store detailed chat messages and interactions
**Location**: `shared/schema.ts` line 66-77

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | text (primary key) | Unique identifier | "log_001" |
| chat_id | text (foreign key) | Reference to chat_sessions.id | "sess_001" |
| user_id | text (foreign key) | Reference to users.id | "FHcKInMqnIZXqCISjkP4B" |
| customer_id | text (nullable) | Reference to customers.id | "cust-001" |
| messages | text (JSON) | Chat messages array | "[{\"role\":\"user\",\"content\":\"Hello\"}]" |
| recommended_policy | text (nullable) | Recommended policy ID | "pol-001" |
| conversion_status | text (nullable) | Sales outcome | "Interested" |
| feedback_rating | integer (nullable) | Customer rating (1-5) | 4 |
| created_at | text | Log timestamp | "2024-06-05T10:30:00Z" |

## How to Modify Database

### 1. Schema Changes
**File**: `shared/schema.ts`
- Add new tables using `sqliteTable()` function
- Define relationships using `relations()` function
- Create insert/select schemas using `createInsertSchema()`

### 2. Migration Process
```bash
# Push schema changes to database
npm run db:push

# Generate migrations (if needed)
npm run db:generate

# View database content
npm run db:studio
```

### 3. Storage Interface Updates
**File**: `server/storage.ts`
- Update `IStorage` interface for new CRUD operations
- Implement methods in `SqliteStorage` class
- Add data seeding in `seedData()` method

### 4. API Routes
**File**: `server/routes.ts`
- Add new endpoints for database operations
- Use storage interface methods
- Validate request data with Zod schemas

## Database Initialization

### Automatic Setup
1. Database file created at `./data/insurance.db`
2. Tables created from schema definitions
3. Demo data seeded automatically on first run
4. 100 customers, 4 user types, policies generated

### Manual Reset
```bash
# Delete database file
rm ./data/insurance.db

# Restart application to regenerate
npm run dev
```

## Configuration Files

### drizzle.config.ts
```typescript
export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./data/insurance.db"
  }
}
```

### server/db.ts
```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";

const sqlite = new Database("./data/insurance.db");
export const db = drizzle(sqlite, { schema });
```

## Troubleshooting

### Common Issues
1. **Database locked**: Close all connections and restart
2. **Schema mismatch**: Run `npm run db:push` to sync
3. **Missing data**: Check seeding process in storage.ts
4. **Permission errors**: Ensure write access to `./data/` directory

### Debug Commands
```bash
# Check database file
ls -la ./data/

# View tables
sqlite3 ./data/insurance.db ".tables"

# Query data
sqlite3 ./data/insurance.db "SELECT * FROM users LIMIT 5;"
```