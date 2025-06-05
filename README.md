
# Aditya Birla Insurance AI Assistant (ABHi)

## Overview
ABHi (Aditya Birla Hybrid Insurance) Assistant is an AI-powered insurance policy recommendation system built for Aditya Birla Insurance sales advisors. The system provides personalized policy recommendations, customer management, and competitive analysis capabilities.

## Application Features

### 🤖 AI-Powered Assistance
- **Personalized Policy Recommendations**: AI analyzes customer profiles to suggest the most suitable insurance policies
- **Competitive Analysis**: Compare Aditya Birla policies with competitor offerings
- **Premium Calculations**: Real-time premium estimates based on customer demographics
- **Smart Chat Interface**: Natural language interaction for policy queries and customer management

### 👥 Customer Management
- **Customer Profiles**: Comprehensive customer information including demographics, financial goals, and health conditions
- **Policy Tracking**: Monitor existing policies (both Aditya Birla and competitor policies)
- **Search & Filter**: Quick customer search with intelligent filtering
- **Interaction Logging**: Track all customer interactions and recommendations

### 📊 Sales Support
- **Dashboard Overview**: Key metrics and customer insights
- **Quote Generation**: Generate detailed policy quotes
- **Comparison Tools**: Side-by-side policy comparisons
- **Lead Management**: Track lead sources and conversion status

### 🔐 Security & Authentication
- **User Authentication**: Secure login for sales advisors
- **Role-based Access**: Different access levels for different user roles
- **Session Management**: Secure session handling

## Repository Structure & Workflow

```
├── client/                     # Frontend React Application
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── ui/            # Base UI components (shadcn/ui)
│   │   │   ├── chat-interface.tsx    # Main chat component
│   │   │   ├── customer-profile.tsx  # Customer profile display
│   │   │   ├── customer-search.tsx   # Customer search functionality
│   │   │   └── sidebar.tsx          # Navigation sidebar
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries
│   │   │   ├── chat-service.ts      # Chat service logic
│   │   │   ├── queryClient.ts       # React Query configuration
│   │   │   └── utils.ts            # General utilities
│   │   ├── pages/             # Page components
│   │   │   ├── dashboard.tsx        # Main dashboard
│   │   │   ├── login.tsx           # Login page
│   │   │   └── not-found.tsx       # 404 page
│   │   ├── App.tsx            # Main application component
│   │   ├── index.css          # Global styles
│   │   └── main.tsx           # Application entry point
│   └── index.html             # HTML template
├── server/                    # Backend Express.js Application
│   ├── db.ts                  # Database connection (Neon PostgreSQL)
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API routes and business logic
│   ├── storage.ts             # Data access layer
│   └── vite.ts                # Vite middleware for development
├── shared/                    # Shared TypeScript definitions
│   └── schema.ts              # Database schema and types
├── .env                       # Environment variables
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── vite.config.ts             # Vite build configuration
```

### Data Flow
1. **Frontend** → API calls → **Backend Routes** → **Storage Layer** → **Database**
2. **AI Integration**: Backend routes integrate with Groq API for AI responses
3. **Real-time Updates**: React Query manages state and caching
4. **Type Safety**: Shared schema ensures type consistency across frontend and backend

## Script Information

### Package.json Scripts

#### Development Scripts
- **`npm run dev`**: Starts the development server with hot reloading
  - Runs both frontend (Vite) and backend (Express) concurrently
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:5000`

- **`npm run build`**: Builds the application for production
  - Compiles TypeScript to JavaScript
  - Bundles frontend assets
  - Optimizes for deployment

- **`npm run start`**: Starts the production server
  - Serves built application from `dist/` directory

#### Database Scripts
- **`npm run db:generate`**: Generates database migration files
- **`npm run db:migrate`**: Applies database migrations
- **`npm run db:studio`**: Opens Drizzle Studio for database management

## API Routes Detailed Documentation

### Authentication Routes

#### POST `/api/auth/login`
**Purpose**: Authenticate sales Advisors
**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```
**Implementation Details**:
- Validates username and password against stored user data
- Returns user profile without sensitive information
- In production, should implement proper session management/JWT tokens

### Customer Management Routes

#### GET `/api/customers`
**Purpose**: Retrieve all customers
**Response**: Array of customer objects
**Implementation**: 
- Calls `storage.getCustomers()` method
- Returns paginated customer list
- Includes demographics, policies, and contact information

#### GET `/api/customers/search?q={query}`
**Purpose**: Search customers by name, email, or phone
**Query Parameters**:
- `q`: Search query string
**Implementation**:
- Uses `storage.searchCustomers(query)` method
- Performs case-insensitive search across multiple fields
- Returns filtered customer list

#### GET `/api/customers/:id`
**Purpose**: Get specific customer details
**Path Parameters**:
- `id`: Customer unique identifier
**Implementation**:
- Fetches complete customer profile including:
  - Demographics and contact information
  - Existing policies (JSON parsed)
  - Financial goals and health conditions
  - Risk appetite and preferences

### Policy Management Routes

#### GET `/api/policies`
**Purpose**: Retrieve all Aditya Birla policies
**Response**: Array of policy objects with full details
**Implementation**:
- Returns complete policy catalog
- Includes eligibility criteria, coverage amounts, premiums
- Tax benefits and rider information

#### GET `/api/policies/type/:type`
**Purpose**: Get policies by specific type (Life, Health, Term, etc.)
**Path Parameters**:
- `type`: Policy type (Life/Health/Term/Retirement/Child/ULIP)
**Implementation**:
- Filters policies by type
- Returns type-specific policy information

#### GET `/api/competitor-policies`
**Purpose**: Retrieve competitor policy information for comparison
**Implementation**:
- Fetches third-party policy data
- Includes features, pros/cons, claim settlement ratios
- Used for competitive analysis

### Chat & AI Routes

#### POST `/api/chat/session`
**Purpose**: Create new chat session
**Request Body**:
```json
{
  "user_id": "string",
  "customer_id": "string" // optional
}
```
**Response**:
```json
{
  "id": "string",
  "user_id": "string",
  "customer_id": "string",
  "created_at": "ISO_DATE",
  "is_active": true
}
```
**Implementation**:
- Creates chat session with unique ID using nanoid
- Links session to user and optionally to customer
- Tracks session state for conversation context

#### PUT `/api/chat/session/:id`
**Purpose**: Update existing chat session
**Request Body**:
```json
{
  "customer_id": "string",
  "is_active": boolean
}
```
**Implementation**:
- Updates session customer association
- Can activate/deactivate sessions
- Maintains conversation context

#### POST `/api/chat/message`
**Purpose**: Process AI chat messages and get recommendations
**Request Body**:
```json
{
  "message": "string",
  "customer_id": "string", // optional
  "chat_session_id": "string",
  "user_id": "string"
}
```

**Implementation Flow**:
1. **Customer Context Building**: If customer_id provided:
   - Fetches customer profile from database
   - Parses JSON fields (existing_policies, financial_goals, health_conditions)
   - Builds comprehensive customer context string

2. **AI System Prompt Configuration**:
   - Defines ABHi assistant personality and capabilities
   - Includes Aditya Birla policy advantages:
     - 98.2% claim settlement ratio
     - 6,500+ cashless hospitals
     - Superior benefits and features
   - Sets up competitive positioning

3. **Groq API Integration**:
   - Calls Groq LLM API with system prompt and user message
   - Uses llama3-8b-8192 model
   - Handles API failures gracefully

4. **Fallback Response System**: When API unavailable:
   - Pattern matching for common queries
   - Returns pre-defined responses for:
     - Health insurance inquiries
     - Term insurance questions
     - Premium calculations
     - Competitive comparisons

5. **Interaction Logging**:
   - Stores conversation in interaction_logs table
   - Links to chat session and customer
   - Tracks recommendations and conversion potential

#### POST `/api/chat/recommend-policy`
**Purpose**: Generate AI-powered policy recommendations
**Request Body**:
```json
{
  "customer": "Customer_Object",
  "context": "string",
  "hideCustomerName": boolean
}
```

**Implementation**:
- Analyzes customer demographics, income, risk profile
- Generates mock recommendations based on profile
- Always hides customer names in responses (privacy protection)
- Returns structured recommendations with:
  - Policy names and types
  - Coverage amounts and premiums
  - Key benefits and suitability scores
  - Reasoning for recommendations

## Environment Variables

### Required Variables
- **DATABASE_URL**: PostgreSQL connection string (Neon database)
- **GROQ_API_KEY**: API key for Groq LLM service
- **NODE_ENV**: Environment mode (development/production)

### Optional Variables
- **PORT**: Server port (default: 5000)
- **SESSION_SECRET**: Secret for session encryption
- **LOG_LEVEL**: Logging verbosity

## Database Schema

### Core Tables
1. **customers**: Customer profiles and demographics
2. **policies**: Aditya Birla policy catalog
3. **competitor_policies**: Third-party policy data
4. **chat_sessions**: Conversation sessions
5. **interaction_logs**: Chat history and recommendations
6. **users**: Sales Advisors accounts

### Key Relationships
- Chat sessions link users to customers
- Interaction logs track conversation history
- Customer policies stored as JSON for flexibility

## Technology Stack

### Frontend
- **React 18**: UI framework with hooks
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Pre-built accessible components
- **React Query**: Data fetching and state management
- **Vite**: Fast development and build tool

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **TypeScript**: Server-side type safety
- **Drizzle ORM**: Type-safe database operations
- **Neon PostgreSQL**: Serverless database

### AI Integration
- **Groq API**: Fast LLM inference
- **Llama 3 8B**: Language model for recommendations

## Getting Started

1. **Clone Repository**
   ```bash
   git clone [repository-url]
   cd abhi-insurance-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Configure database and API keys

4. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

6. **Access Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## Deployment

The application is optimized for Replit deployment:
- Environment variables configured through Replit Secrets
- Port 5000 configured for web access
- Build process optimized for production
- Database connection via Neon serverless PostgreSQL

## Security Considerations

- All customer names removed from AI responses for privacy
- Input validation on all API endpoints
- SQL injection protection via ORM
- XSS prevention through React's built-in protection
- CORS configuration for cross-origin requests

## Performance Optimizations

- React Query caching for API responses
- Lazy loading of components
- Database indexing on frequently queried fields
- Optimized bundle sizes with Vite
- Efficient re-rendering with React hooks
