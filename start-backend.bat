@echo off
echo Starting Subscription Management Backend...
echo.

cd backend

echo Installing dependencies...
call npm install

echo.
echo Starting development server...
call npm run dev

pause