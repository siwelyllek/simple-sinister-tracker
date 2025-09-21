@echo off
echo 🔄 Rebuilding Simple & Sinister Tracker with new workout type features...
echo.

REM Stop and remove existing containers
echo Stopping existing containers...
docker-compose down

REM Remove the existing database volume to start fresh
echo Removing existing database volume (to ensure clean schema)...
docker volume rm simple-sinister-tracker_workoutdata >nul 2>&1 || echo Volume didn't exist, creating fresh...

REM Rebuild and start containers
echo Rebuilding containers...
docker-compose up --build -d

echo.
echo ✅ Rebuild complete!
echo.
echo 🌐 Your app should be available at:
echo    Frontend: http://localhost:3122
echo    Backend:  http://localhost:8225
echo.
echo 📝 New features included:
echo    - Persistent kg/lbs toggle
echo    - EMOM and Standard workout type tracking
echo    - Clean database with new schema
echo.
echo 🚀 You can now start tracking workouts with the new features!
pause