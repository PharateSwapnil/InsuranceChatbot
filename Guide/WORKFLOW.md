
# Insurance Sales Advisor AI Assistant - Complete Workflow Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [File Structure Analysis](#file-structure-analysis)
5. [Application Flow](#application-flow)
6. [Detailed Component Analysis](#detailed-component-analysis)
7. [Database Schema & Operations](#database-schema--operations)
8. [API Endpoints & Routes](#api-endpoints--routes)
9. [Authentication Flow](#authentication-flow)
10. [Chat System Workflow](#chat-system-workflow)
11. [Development Workflow](#development-workflow)
12. [Production Deployment](#production-deployment)
13. [Troubleshooting Guide](#troubleshooting-guide)

## System Overview

The Insurance Sales Advisor AI Assistant is a full-stack web application designed to empower Aditya Birla sales representatives with AI-powered tools for customer management and policy recommendations.

### Core Features:
- AI-powered chat assistant using Groq LLM
- Customer profile management (100+ demo customers)
- Policy recommendation engine
- Multi-role authentication system
- Real-time underwriting validation
- Responsive web interface

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript Frontend                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Pages     │ │ Components  │ │    Hooks    │              │
│  │             │ │             │ │             │              │
│  │ • Homepage  │ │ • Sidebar   │ │ • useToast  │              │
│  │ • Login     │ │ • Chat UI   │ │ • useMobile │              │
│  │ • Dashboard │ │ • Customer  │ │             │              │
│  │             │ │   Profile   │ │             │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                 │
│  Libraries: Radix UI, Tailwind CSS, Tanstack Query             │
└─────────────────────────────────────────────────────────────────┘
                                    ↕ HTTP/API
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Express.js + Node.js Backend                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Routes    │ │   Storage   │ │     DB      │              │
│  │             │ │             │ │             │              │
│  │ • Auth      │ │ • Customer  │ │ • Schema    │              │
│  │ • Customer  │ │   Ops       │ │ • Types     │              │
│  │ • Chat      │ │ • Chat Ops  │ │             │              │
│  │ • Policy    │ │ • User Ops  │ │             │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                 │
│  Session Management: Express-Session + Cookies                 │
└─────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  SQLite Database (data/insurance.db)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │    Users    │ │  Customers  │ │   Policies  │              │
│  │             │ │             │ │             │              │
│  │ • POSP      │ │ • Profile   │ │ • Health    │              │
│  │ • IRDAI     │ │   Data      │ │ • Term      │              │
│  │ • Broker    │ │ • Financial │ │ • Motor     │              │
│  │             │ │   Goals     │ │             │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                 │
│  Chat Sessions │ Exemptions │ Competitor Data                  │
└─────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────────┤
│  Groq API (AI Chat Processing)                                 │
│  Environment Variables (.env)                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Technologies
- **React 18**: UI framework with hooks and functional components
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI component library
- **Tanstack Query**: Data fetching and caching
- **Wouter**: Lightweight routing
- **Framer Motion**: Animation library

### Backend Technologies
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server development
- **SQLite**: Embedded database
- **Drizzle ORM**: Type-safe database operations
- **Better-SQLite3**: SQLite driver
- **Express-Session**: Session management
- **Cookie-Parser**: Cookie handling

### Development Tools
- **TSX**: TypeScript execution
- **ESBuild**: JavaScript bundler
- **Drizzle Kit**: Database migrations
- **PM2**: Process management (production)

## File Structure Analysis

```
Insurance-Sales-Advisor/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Radix UI components
│   │   │   ├── chat-interface.tsx   # Main chat component
│   │   │   ├── customer-profile.tsx # Customer details display
│   │   │   ├── customer-search.tsx  # Customer search functionality
│   │   │   ├── sidebar.tsx          # Navigation sidebar
│   │   │   └── user-profile.tsx     # User profile management
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utility libraries
│   │   │   ├── chat-service.ts      # Groq API integration
│   │   │   ├── queryClient.ts       # Tanstack Query setup
│   │   │   └── utils.ts             # Helper functions
│   │   ├── pages/                   # Application pages
│   │   │   ├── dashboard.tsx        # Main dashboard
│   │   │   ├── homepage.tsx         # Landing page
│   │   │   ├── login.tsx            # Authentication page
│   │   │   └── not-found.tsx        # 404 error page
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Application entry point
│   │   └── index.css                # Global styles
│   └── index.html                   # HTML template
├── server/                          # Backend Express application
│   ├── db.ts                        # Database configuration
│   ├── index.ts                     # Server entry point
│   ├── routes.ts                    # API route definitions
│   ├── storage.ts                   # Database operations
│   └── vite.ts                      # Vite integration
├── shared/                          # Shared types and schemas
│   └── schema.ts                    # Database schema definitions
├── data/                            # Database storage
│   └── insurance.db                 # SQLite database file
├── Guide/                           # Documentation
│   ├── INSTALLATION.md              # Setup instructions
│   ├── API_DOCUMENTATION.md         # API reference
│   ├── ENVIRONMENT.md               # Environment variables
│   └── CLOUD_HOSTING.md             # Deployment guide
├── dist/                            # Production build output
├── .env                             # Environment variables
├── package.json                     # Dependencies and scripts
└── Configuration files              # TypeScript, Tailwind, etc.
```

## Application Flow

### 1. Application Startup Sequence

```
1. Server Initialization (server/index.ts)
   ↓
2. Database Connection (server/db.ts)
   ↓
3. Route Registration (server/routes.ts)
   ↓
4. Vite Development Setup (server/vite.ts)
   ↓
5. Port Binding (5000)
   ↓
6. Client Application Load (client/src/main.tsx)
   ↓
7. React App Initialization (client/src/App.tsx)
```

### 2. User Journey Flow

```
Landing Page (homepage.tsx)
    ↓
Login Authentication (login.tsx)
    ↓
Dashboard Access (dashboard.tsx)
    ↓
Customer Search & Selection
    ↓
AI Chat Interface
    ↓
Policy Recommendations
    ↓
Profile Management
```

## Detailed Component Analysis

### Server Components

#### 1. `server/index.ts` - Application Entry Point
**Purpose**: Main server configuration and startup
**Key Features**:
- Express app initialization
- Middleware setup (JSON, URL encoding, cookies)
- Request logging middleware
- Error handling
- Vite integration for development
- Windows-compatible server configuration

**Execution Flow**:
```javascript
1. Create Express app
2. Configure middleware
3. Setup request logging
4. Register routes
5. Setup error handling
6. Configure Vite (development) or static serving (production)
7. Start server on port 5000
```

#### 2. `server/routes.ts` - API Route Handler
**Purpose**: Defines all API endpoints and business logic
**Key Routes**:
- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/customers/*` - Customer operations
- `/api/chat/*` - Chat functionality
- `/api/policies/*` - Policy management

#### 3. `server/storage.ts` - Database Operations
**Purpose**: Handles all database interactions using Drizzle ORM
**Key Functions**:
- Customer CRUD operations
- User authentication
- Chat session management
- Policy data retrieval

#### 4. `server/db.ts` - Database Configuration
**Purpose**: Database connection setup and schema initialization

### Client Components

#### 1. `client/src/App.tsx` - Root Component
**Purpose**: Main application wrapper with routing
**Features**:
- Route configuration using Wouter
- Global state management
- Theme provider setup
- Toast notifications

#### 2. `client/src/pages/dashboard.tsx` - Main Dashboard
**Purpose**: Primary user interface after authentication
**Components**:
- Sidebar navigation
- Customer search
- Chat interface
- User profile access

**State Management**:
```typescript
- selectedCustomer: Customer | null
- chatSession: ChatSession | null
- user: User | null
- searchResults: Customer[]
```

#### 3. `client/src/components/chat-interface.tsx` - AI Chat Component
**Purpose**: Handles AI-powered conversations
**Features**:
- Message history display
- Real-time chat responses
- Groq API integration
- Customer context awareness

#### 4. `client/src/components/customer-search.tsx` - Customer Search
**Purpose**: Search and select customers
**Features**:
- Real-time search
- Customer profile preview
- Filter capabilities

#### 5. `client/src/lib/chat-service.ts` - AI Service Integration
**Purpose**: Manages communication with Groq API
**Functions**:
- Message processing
- Context building
- Response formatting

## Database Schema & Operations

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### Customers Table
```sql
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    profession TEXT,
    income_bracket TEXT,
    city TEXT,
    risk_appetite TEXT,
    existing_policies TEXT,
    financial_goals TEXT,
    health_conditions TEXT
);
```

#### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);
```

### Database Operations Flow

```
1. Application Start
   ↓
2. Database Connection (better-sqlite3)
   ↓
3. Schema Validation (Drizzle)
   ↓
4. Data Population (if empty)
   ↓
5. Query Execution (CRUD operations)
```

## API Endpoints & Routes

### Authentication Routes
```
POST /api/auth/login
- Body: { username, password }
- Response: { user } or error
- Creates session cookie

GET /api/auth/me
- Response: Current user data
- Requires valid session

POST /api/auth/logout
- Clears session
- Response: success message
```

### Customer Routes
```
GET /api/customers/search?q={query}
- Query parameter: search term
- Response: Array of matching customers

GET /api/customers/:id
- Response: Detailed customer data
- Includes profile, policies, health conditions

GET /api/customers
- Response: All customers (paginated)
```

### Chat Routes
```
POST /api/chat/session
- Body: { user_id, customer_id }
- Response: Chat session object

POST /api/chat/message
- Body: { message, chat_session_id, customer_id, user_id }
- Response: AI-generated response
- Integrates with Groq API
```

### Policy Routes
```
GET /api/policies
- Response: All available policies

GET /api/policies/type/:type
- Response: Policies filtered by type

GET /api/competitor-policies
- Response: Competitor policy data
```

## Authentication Flow

### Login Process
```
1. User submits credentials (login.tsx)
   ↓
2. POST /api/auth/login (routes.ts)
   ↓
3. Password validation (bcrypt)
   ↓
4. Session creation (express-session)
   ↓
5. Cookie setting (httpOnly, secure)
   ↓
6. Dashboard redirect
```

### Session Management
```
1. Session middleware checks cookies
   ↓
2. Validates session ID
   ↓
3. Retrieves user data
   ↓
4. Attaches to request object
   ↓
5. Protected route access granted/denied
```

### User Roles & Permissions
- **POSP Sales Rep**: Basic policy selling, limited exemptions
- **IRDAI Agent**: Extended policy access, higher exemptions
- **Corporate Broker**: Corporate policies, group insurance
- **Group Insurance**: Specialized group coverage handling

## Chat System Workflow

### AI Chat Processing Flow
```
1. User types message (chat-interface.tsx)
   ↓
2. Message sent to /api/chat/message
   ↓
3. Customer context retrieved (storage.ts)
   ↓
4. User profile & exemptions loaded
   ↓
5. Context prompt built with:
   - Customer details
   - User role & limits
   - Available policies
   - Conversation history
   ↓
6. Groq API called (chat-service.ts)
   ↓
7. AI response processed
   ↓
8. Response sent to client
   ↓
9. UI updated with response
```

### Context Building
```typescript
const contextPrompt = `
You are ${user.name}, a ${user.role} at Aditya Birla.
Customer: ${customer.name}
- Age: ${customer.age}
- Profession: ${customer.profession}
- Income: ${customer.income_bracket}
- Risk Appetite: ${customer.risk_appetite}

Your exemption limits:
${exemptions.map(e => `${e.product_type}: ₹${e.exemption_limit}`)}

Available policies: ${policies}
Conversation history: ${chatHistory}
`;
```

## Development Workflow

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev  # Windows
npm run dev  # Unix/Linux/Mac

# Build for production
npm run build
npm start

# Type checking
npm run check

# Database operations
npm run db:push
```

### Development Server Flow
```
1. TSX loads server/index.ts
   ↓
2. Express server starts on port 5000
   ↓
3. Vite dev server integrates
   ↓
4. Hot module replacement enabled
   ↓
5. API and client served from same port
```

### Build Process
```
1. Client Build (Vite)
   - TypeScript compilation
   - Tailwind CSS processing
   - Asset optimization
   - Output: dist/public/
   ↓
2. Server Build (ESBuild)
   - TypeScript compilation
   - Bundle external packages
   - Output: dist/index.js
```

## Production Deployment

### Production Startup Sequence
```
1. Environment validation (.env)
   ↓
2. Database initialization
   ↓
3. Static file serving (dist/public)
   ↓
4. API routes activation
   ↓
5. Server binding (localhost on Windows, 0.0.0.0 on Linux)
   ↓
6. Application ready
```

### Environment Variables Required
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
NODE_ENV=production
PORT=5000
DATABASE_URL=sqlite:./data/insurance.db
SESSION_SECRET=your_session_secret_here
JWT_SECRET=your_jwt_secret_here
```

### Production Commands
```bash
# Windows Production
npm run build
npm start

# Linux/Mac Production
npm run build
npm start
```

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. Server Hanging After "serving on port 5000"
**Issue**: Windows command prompt appears to hang
**Solution**: This is normal behavior. Server is running. Open http://localhost:5000

#### 2. Build Path Issues
**Issue**: Vite build creates wrong directory structure
**Solution**: Use correct commands:
```bash
npx vite build  # Creates dist/public/
npm run build   # Full build process
```

#### 3. API Connection Errors
**Issue**: Chat functionality not working
**Solution**: 
- Verify GROQ_API_KEY in .env
- Check API key format (starts with gsk_)
- Ensure no extra spaces in .env file

#### 4. Database Connection Issues
**Issue**: SQLite database not found
**Solution**:
```bash
mkdir data
# Database will be created automatically on first run
```

#### 5. Authentication Issues
**Issue**: Login not working
**Solution**:
- Check SESSION_SECRET in .env
- Clear browser cookies
- Verify user credentials in database

### Debug Commands
```bash
# Check server logs
npm run dev  # Watch console output

# Verify database
sqlite3 data/insurance.db
.tables
SELECT * FROM users LIMIT 5;

# Check environment variables
echo $GROQ_API_KEY  # Linux/Mac
echo %GROQ_API_KEY%  # Windows
```

### Performance Monitoring
- Server logs API response times
- Database query performance via SQLite EXPLAIN
- Client-side React DevTools for component profiling
- Network tab for API call analysis

## System Integration Points

### Frontend-Backend Communication
- REST API over HTTP/HTTPS
- JSON data format
- Session-based authentication
- Real-time updates via polling

### Database Integration
- Drizzle ORM for type safety
- SQLite for development/small deployments
- PostgreSQL ready for production scaling
- Automatic schema migrations

### External Service Integration
- Groq API for AI chat functionality
- Environment-based configuration
- Error handling and fallbacks
- Rate limiting considerations

This comprehensive workflow documentation provides a complete understanding of how the Insurance Sales Advisor AI Assistant operates from startup to user interaction, covering all major components and their interactions.
