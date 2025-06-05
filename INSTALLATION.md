
# Installation Guide - ABHi Assistant

## Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

## Step-by-Step Installation

### 1. Install Node.js and npm

1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version for your operating system
3. Run the installer and follow the setup wizard
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### 2. Install Project Dependencies

```bash
# Install all dependencies from package.json
npm install
```

This will install all the required packages listed in `package.json` including:
- Express.js (backend framework)
- React (frontend framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Vite (build tool)
- And many other dependencies

### 3. Environment Setup

1. Copy the `.env` file and configure it (see Environment Configuration section below)
2. The application uses SQLite in-memory database by default (no additional setup needed)

### 4. Running the Application

For **Windows**:
```bash
npm run dev:windows
```

For **Unix/Linux/Mac**:
```bash
npm run dev
```

### 5. Access the Application

- Open your browser and go to: `http://localhost:5000`
- The application serves both frontend and backend on port 5000

## Development Scripts

- `npm run dev` - Start development server (Unix/Linux/Mac)
- `npm run dev:windows` - Start development server (Windows)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking

## Troubleshooting

### Common Issues:

1. **Port 5000 already in use**:
   ```bash
   # Kill process using port 5000 (Windows)
   netstat -ano | findstr :5000
   taskkill /PID <PID_NUMBER> /F
   
   # Kill process using port 5000 (Unix/Linux/Mac)
   lsof -ti:5000 | xargs kill -9
   ```

2. **Node modules issues**:
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript errors**:
   ```bash
   # Run type checking
   npm run check
   ```

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── .env            # Environment variables
├── package.json    # Dependencies and scripts
└── README.md       # Project documentation
```

## Next Steps

1. Configure your `.env` file (see Environment Configuration)
2. Start the development server
3. Navigate to the login page and use credentials: `sales.adv001` / `abhi2024`
4. Explore the insurance chatbot functionality
