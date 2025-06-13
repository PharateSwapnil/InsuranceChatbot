
# Environment Variables Configuration Guide

## Overview

The `.env` file contains sensitive configuration data for your application. Never commit this file to version control.

## Environment Variables Explained

### 1. GROQ_API_KEY
**Purpose**: Powers the AI chatbot functionality
**How to get it**:
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_`)

```env
GROQ_API_KEY="gsk_your_actual_api_key_here"
VITE_GROQ_API_KEY="gsk_your_actual_api_key_here"
```

### 2. JWT_SECRET
**Purpose**: Secures user sessions and authentication tokens
**How to generate**:

Option 1 - Use Node.js:
```javascript
// Run this in Node.js console
require('crypto').randomBytes(64).toString('hex')
```

Option 2 - Use online generator:
- Visit any JWT secret generator
- Generate a 64-character random string

```env
JWT_SECRET="your_64_character_random_string_here_make_it_very_secure_and_long"
```

### 3. DATABASE_URL
**Purpose**: Database connection string

**For SQLite (Default - Recommended for development)**:
```env
DATABASE_URL="sqlite:./database.db"
```

**For PostgreSQL (Production)**:
```env
DATABASE_URL="postgresql://username:password@hostname:port/database_name"
```

**For MySQL**:
```env
DATABASE_URL="mysql://username:password@hostname:port/database_name"
```

### 4. Email Configuration (SMTP)
**Purpose**: Send notifications, password resets, etc.

**For Gmail**:
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your.email@gmail.com"
SMTP_PASS="your_app_password_here"
```

**For Outlook/Hotmail**:
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_USER="your.email@outlook.com"
SMTP_PASS="your_password_here"
```

### 5. Session Configuration
**Purpose**: Secure session management

```env
SESSION_SECRET="another_random_64_character_string_for_sessions_security"
```

### 6. Application Configuration

```env
NODE_ENV="development"
PORT=5000
LOG_LEVEL="info"
```

### 7. Rate Limiting
**Purpose**: Prevent API abuse

```env
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## Complete .env Template

```env
# Groq API Configuration (Required for AI functionality)
GROQ_API_KEY="gsk_your_groq_api_key_here"
VITE_GROQ_API_KEY="gsk_your_groq_api_key_here"

# Application Configuration
NODE_ENV="development"
PORT=5000
LOG_LEVEL="info"

# Database Configuration
DATABASE_URL="sqlite:./database.db"

# Security Configuration (Generate random strings)
JWT_SECRET="your_jwt_secret_64_characters_long_random_string_here"
SESSION_SECRET="your_session_secret_64_characters_long_random_string_here"

# Email Configuration (Optional - for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your.email@gmail.com"
SMTP_PASS="your_app_password_here"

# API Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## Where These Variables Are Used

### In the Application:

1. **GROQ_API_KEY**: 
   - `client/src/lib/chat-service.ts` - AI chat functionality
   - Server-side AI processing

2. **JWT_SECRET**: 
   - `server/routes.ts` - User authentication
   - Session token generation

3. **DATABASE_URL**: 
   - `server/storage.ts` - Database connection
   - `server/db.ts` - Database initialization

4. **Email Config**: 
   - Email notifications (when implemented)
   - Password reset functionality

5. **SESSION_SECRET**: 
   - Express session middleware
   - Cookie encryption

## Testing Your Configuration

### 1. Test Database Connection:
```bash
npm run check
```

### 2. Test Application Startup:
```bash
npm run dev:windows  # Windows
# or
npm run dev          # Unix/Linux/Mac
```

### 3. Test AI Functionality:
1. Start the application
2. Login with: `sales.adv001` / `abhi2024`
3. Try the chat interface
4. If GROQ_API_KEY is correct, you'll get AI responses

### 4. Check Logs:
Monitor the console output for any configuration errors.

## Security Best Practices

1. **Never commit `.env` to version control**
2. **Use different keys for development and production**
3. **Rotate keys regularly**
4. **Use environment-specific configurations**
5. **Keep backup of your keys in a secure location**

## Troubleshooting

### Common Issues:

1. **"GROQ_API_KEY not found"**:
   - Verify the key is correctly set in `.env`
   - Check for typos in the key
   - Ensure no extra spaces

2. **Database connection errors**:
   - Check DATABASE_URL format
   - Ensure SQLite file permissions
   - Verify database file path

3. **Session/Auth issues**:
   - Regenerate JWT_SECRET and SESSION_SECRET
   - Clear browser cookies
   - Restart the application
