@echo off
echo Building Insurance Sales Advisor for Production...
echo.

echo Step 1: Building client application...
npx vite build
if %errorlevel% neq 0 (
    echo Build failed! Check the error above.
    pause
    exit /b 1
)

echo.
echo Step 2: Building server...
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
if %errorlevel% neq 0 (
    echo Server build failed! Check the error above.
    pause
    exit /b 1
)

echo.
echo Step 3: Starting production server...
echo NOTE: Application will be available at http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

set NODE_ENV=production
node dist/index.js

echo.
echo Server stopped. Press any key to exit.
pause >nul