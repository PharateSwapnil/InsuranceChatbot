@echo off
echo Starting Insurance Sales Advisor Application...
echo.
echo Setting up environment for Windows...
set NODE_ENV=development

echo Starting server on localhost:5000...
echo.
echo NOTE: If you see "Terminate batch job (Y/N)?", type N and press Enter
echo Wait for "serving on port 5000" message, then open http://localhost:5000
echo.

npx tsx server/index.ts

echo.
echo Server stopped. Press any key to exit.
pause >nul