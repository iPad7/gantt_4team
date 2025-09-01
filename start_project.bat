@echo off
echo WBS 프로젝트 시작 중...
echo.

echo 1. 백엔드 서버 시작...
cd backend
start "Django Backend" cmd /k "python manage.py runserver"
cd ..

echo 2. 프론트엔드 서버 시작...
cd frontend
start "React Frontend" cmd /k "npm start"
cd ..

echo.
echo 프로젝트가 시작되었습니다!
echo.
echo 백엔드: http://localhost:8000
echo 프론트엔드: http://localhost:3000
echo Django 관리자: http://localhost:8000/admin
echo.
echo Ngrok 터널링을 위해 새 터미널에서 다음 명령을 실행하세요:
echo ngrok http 8000
echo ngrok http 3000
echo.
pause
