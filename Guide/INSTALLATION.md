# Installation Guide - Insurance Sales Advisor AI Assistant

## Prerequisites
- Node.js v18+ installed
- npm package manager
- Git (for cloning repository)

## Platform-Specific Installation

### Windows Installation

#### Method 1: Development Mode (Recommended for Local Testing)
```bash
# 1. Navigate to project directory
cd C:\path\to\InsuranceChatAI

# 2. Install dependencies
npm install

# 3. Create required directories
mkdir data

# 4. Start development server
npm run dev:windows
```
**Note**: When prompted "Terminate batch job (Y/N)?", type `N` and press Enter. Wait for "serving on port 5000" message, then open `http://localhost:5000` in your browser.

#### Method 2: Automated Windows Development
```bash
# Run the automated script
start-windows.bat
```

#### Method 3: Windows Production Mode
```bash
# 1. Install dependencies
npm install

# 2. Build client application (builds to dist/public)
npx vite build

# 3. Build server
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# 4. Start production server
npm run start:windows
```

#### Method 4: Automated Windows Production
```bash
# Run the automated production script
windows-production.bat
```

### Linux/macOS Installation

#### Development Mode
```bash
# 1. Navigate to project directory
cd /path/to/InsuranceChatAI

# 2. Install dependencies
npm install

# 3. Create required directories
mkdir -p data

# 4. Start development server
npm run dev
```

#### Production Mode
```bash
# 1. Install dependencies
npm install

# 2. Build applications
npm run build

# 3. Start production server
npm start
```

## Cloud Deployment

### Option 1: Replit Deployment (Recommended)
1. Import project to Replit
2. Set environment variables in Replit Secrets:
   - `GROQ_API_KEY`: Your Groq API key
3. Click "Run" button
4. Access via provided Replit URL

### Option 2: Railway Deployment
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Deploy project
railway up

# 4. Set environment variables
railway variables set GROQ_API_KEY=your_groq_api_key
```

### Option 3: Vercel Deployment
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy project
vercel

# 3. Set environment variables in Vercel dashboard
# Add GROQ_API_KEY in environment variables section
```

### Option 4: Heroku Deployment
```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Create Heroku app
heroku create your-insurance-app

# 3. Set environment variables
heroku config:set GROQ_API_KEY=your_groq_api_key

# 4. Deploy
git push heroku main
```

### Option 5: Docker Deployment
```dockerfile
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
# Build and run Docker container
docker build -t insurance-ai .
docker run -p 5000:5000 -e GROQ_API_KEY=your_key insurance-ai
```

## Environment Configuration

### Required Environment Variables
Create `.env` file in project root:
```env
# AI Configuration
GROQ_API_KEY=your_groq_api_key_here

# Database (SQLite - automatically configured)
# No additional configuration needed

# Server Configuration (automatically set)
NODE_ENV=development
PORT=5000
```

### Optional Environment Variables
```env
# For PostgreSQL (if switching from SQLite)
DATABASE_URL=postgresql://username:password@localhost:5432/insurance_db

# Custom port (default: 5000)
PORT=3000
```

## Database Setup

### SQLite (Default - No Setup Required)
- Database file created automatically at `data/insurance.db`
- Includes 100+ sample customers and policies
- No additional configuration needed

### PostgreSQL (Optional Migration)
If you want to use PostgreSQL instead of SQLite:
```bash
# 1. Install PostgreSQL
# 2. Create database
createdb insurance_db

# 3. Update .env file with DATABASE_URL
# 4. Run migrations
npm run db:push
```

## Verification & Testing

### Access Application
Open browser and navigate to: `http://localhost:5000`

### Login Credentials
- **POSP Sales Rep**: sales.rep001 / abhi2024
- **IRDAI Agent**: agent.001 / agent2024
- **Corporate Broker**: broker.001 / broker2024
- **Group Insurance**: group.001 / group2024

### Test Features
1. **Authentication**: Login with any credentials above
2. **Profile**: Click profile button (top-right) to view certification limits
3. **Customer Search**: Search from 100+ available customers
4. **AI Chat**: Select customer and test chat responses
5. **Underwriting Validation**: Try "Customer wants 5 cr health insurance"

## File Structure After Installation

### Development Mode
```
InsuranceChatAI/
├── client/
│   ├── src/              # React source code
│   └── index.html        # Development template
├── server/
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Database operations
├── data/
│   └── insurance.db      # SQLite database (auto-created)
└── shared/
    └── schema.ts         # Database schema
```

### Production Mode
```
InsuranceChatAI/
├── dist/
│   ├── public/           # Built web application
│   │   ├── index.html    # Production web app
│   │   └── assets/       # CSS, JS, images
│   └── index.js          # Built server
├── data/
│   └── insurance.db      # SQLite database
└── ...
```

## Troubleshooting

### Windows Issues
```bash
# Port already in use
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Build directory issues
rmdir /s dist\public
mkdir dist\public
npx vite build

# Database reset
del data\insurance.db
npm run dev:windows
```

### Linux/macOS Issues
```bash
# Port already in use
lsof -ti:5000 | xargs kill -9

# Permission issues
sudo chown -R $USER:$USER .
chmod +x *.bat

# Database reset
rm data/insurance.db
npm run dev
```

### Common Issues

#### "Server Hanging" After "serving on port 5000"
**Solution**: This is normal Windows behavior. The server IS running. Open `http://localhost:5000` in your browser - the application should load correctly.

#### Build Path Issues
**Solution**: The default vite build creates files in `dist/public`. Use the correct commands:
```bash
# For development
npm run dev:windows

# For production
npx vite build
npm run start:windows
```

#### API Connection Errors
**Solution**: Ensure `GROQ_API_KEY` is set in your environment variables. The application requires this for AI chat functionality.

### Cloud Deployment Issues
- Ensure `GROQ_API_KEY` is set in environment variables
- Check platform-specific port configuration
- Verify Node.js version compatibility (v18+)
- Review platform logs for specific error messages

## Performance Optimization

### Production Optimizations
```bash
# Enable gzip compression
npm install compression

# Optimize build
npm run build -- --minify

# Use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name insurance-ai
```

### Database Optimizations
- SQLite WAL mode enabled by default
- Automatic vacuum and optimization
- Indexed customer search queries

## Security Considerations

### API Key Management
- Never commit `.env` files to version control
- Use platform-specific secret management
- Rotate API keys regularly

### Network Security
- Application binds to `localhost` on Windows for security
- Use reverse proxy (nginx) for production deployments
- Enable HTTPS in production environments

## Quick Start Summary

### Windows (1-minute setup)
```bash
npm install
npm run dev:windows
# Type N when prompted, wait for "serving on port 5000"
# Open http://localhost:5000
# Login: sales.rep001 / abhi2024
```

### Linux/macOS (1-minute setup)
```bash
npm install
npm run dev
# Open http://localhost:5000
# Login: sales.rep001 / abhi2024
```

Your Insurance Sales Advisor AI Assistant is now ready for deployment across all platforms with comprehensive feature testing capabilities.