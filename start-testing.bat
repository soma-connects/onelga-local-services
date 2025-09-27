@echo off
echo ===========================================
echo Onelga Local Services - Testing Setup
echo ===========================================
echo.

echo 1. Setting up Backend...
cd backend

echo Installing backend dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)

echo Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to generate Prisma client
    pause
    exit /b 1
)

echo Setting up database...
call npx prisma migrate dev --name init
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to set up database
    pause
    exit /b 1
)

echo.
echo ✅ Backend setup complete!
echo.
echo 2. Setting up Frontend...
cd ../frontend

echo Installing frontend dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Frontend setup complete!
echo.
echo ===========================================
echo Setup Complete! 
echo ===========================================
echo.
echo To test your application:
echo.
echo 1. Start Backend Server:
echo    cd backend
echo    npm run dev
echo.
echo 2. In a new command prompt, start Frontend:
echo    cd frontend  
echo    npm start
echo.
echo 3. Test the API with:
echo    cd backend
echo    node test-api.js
echo.
echo 4. Open browser: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
