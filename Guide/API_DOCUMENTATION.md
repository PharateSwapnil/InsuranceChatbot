# API Documentation

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication
The application uses session-based authentication with cookies.

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "username": "sales.rep001",
  "password": "abhi2024"
}
```

**Response:**
```json
{
  "user": {
    "id": "FHcKInMqnIZXqCISjkP4B",
    "username": "sales.rep001",
    "name": "Rajesh Kumar",
    "email": "rajesh.kumar@adityabirla.com",
    "role": "POSP"
  }
}
```

## User Management

### Get User Profile
**GET** `/api/users/:id/profile`

**Response:**
```json
{
  "user": {
    "id": "FHcKInMqnIZXqCISjkP4B",
    "username": "sales.rep001",
    "name": "Rajesh Kumar",
    "email": "rajesh.kumar@adityabirla.com",
    "role": "POSP"
  },
  "exemptions": [
    {
      "id": "exemp_001",
      "product_type": "Health Insurance",
      "exemption_limit": 200000,
      "certification_type": "POSP"
    }
  ]
}
```

## Customer Management

### Search Customers
**GET** `/api/customers/search?q={query}`

**Parameters:**
- `q` (string): Search query (name, phone, email)

**Response:**
```json
[
  {
    "id": "cust-001",
    "name": "Priya Sharma",
    "age": 32,
    "profession": "Software Engineer",
    "city": "Bangalore",
    "income_bracket": "₹8-12 Lakhs"
  }
]
```

### Get Customer Details
**GET** `/api/customers/:id`

**Response:**
```json
{
  "id": "cust-001",
  "name": "Priya Sharma",
  "age": 32,
  "gender": "Female",
  "marital_status": "Married",
  "profession": "Software Engineer",
  "income_bracket": "₹8-12 Lakhs",
  "city": "Bangalore",
  "dependents_count": 2,
  "risk_appetite": "Moderate",
  "existing_policies": "[{\"provider\":\"HDFC ERGO\",\"type\":\"Health\"}]",
  "financial_goals": "[\"Child Education\",\"Retirement\"]",
  "health_conditions": "{\"diabetes\":false,\"hypertension\":true}"
}
```

## Chat System

### Create Chat Session
**POST** `/api/chat/session`

**Request Body:**
```json
{
  "user_id": "FHcKInMqnIZXqCISjkP4B",
  "customer_id": "cust-001"
}
```

**Response:**
```json
{
  "id": "sess_001",
  "user_id": "FHcKInMqnIZXqCISjkP4B",
  "customer_id": "cust-001",
  "created_at": "2024-06-05T10:30:00Z",
  "is_active": 1
}
```

### Send Message
**POST** `/api/chat/message`

**Request Body:**
```json
{
  "message": "Customer wants health insurance for family",
  "chat_session_id": "sess_001",
  "customer_id": "cust-001",
  "user_id": "FHcKInMqnIZXqCISjkP4B"
}
```

**Response:**
```json
{
  "response": "Rajesh Kumar, based on Priya Sharma's profile, I recommend presenting these Aditya Birla Health Insurance options..."
}
```

## Policy Management

### Get All Policies
**GET** `/api/policies`

**Response:**
```json
[
  {
    "id": "pol-001",
    "name": "Activ Health Enhanced",
    "type": "Health Insurance",
    "description": "Comprehensive health coverage...",
    "coverage_amount": "₹3L to ₹1Cr",
    "premium_range": "₹8,500 - ₹45,000/year",
    "key_features": "[\"No room rent capping\",\"Global coverage\"]",
    "claim_settlement_ratio": 98.2
  }
]
```

### Get Policies by Type
**GET** `/api/policies/type/:type`

**Parameters:**
- `type` (string): Policy type (e.g., "Health Insurance", "Term Insurance")

### Get Competitor Policies
**GET** `/api/competitor-policies`

**Response:**
```json
[
  {
    "id": "comp-001",
    "provider": "HDFC ERGO",
    "name": "My Health Suraksha",
    "type": "Health Insurance",
    "coverage_amount": "₹1L to ₹50L",
    "premium_range": "₹6,000 - ₹35,000/year",
    "claim_settlement_ratio": 95.1
  }
]
```

## Policy Recommendations

### Get Recommendations
**POST** `/api/recommendations`

**Request Body:**
```json
{
  "customer_id": "cust-001",
  "policy_type": "Health Insurance"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "policy_name": "Activ Health Enhanced",
      "policy_type": "Health Insurance",
      "coverage_amount": "₹5 Lakhs",
      "premium_estimate": "₹12,500/year",
      "key_benefits": ["No room rent capping", "Global coverage"],
      "suitability_score": 85,
      "reasoning": "Perfect for young family with moderate income..."
    }
  ]
}
```

## Error Responses

### Standard Error Format
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Common Error Codes
- `401` - Unauthorized (invalid credentials or session expired)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `400` - Bad Request (invalid request data)
- `500` - Internal Server Error

## Rate Limiting
- No rate limiting implemented in development
- Production deployment should implement appropriate rate limiting

## CORS Policy
- Development: All origins allowed
- Production: Configure specific domains

## Security Headers
- Session cookies are HTTP-only
- CSRF protection recommended for production
- SSL/TLS required for production deployment