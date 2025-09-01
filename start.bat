@echo off
echo WBS 애플리케이션을 시작합니다...
echo.

echo Django와 React를 시작합니다...
echo.

REM Django 백엔드 시작 (새 창에서)
echo Django 백엔드를 시작합니다...
start "Django Backend" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && python -m pip install --upgrade pip setuptools wheel && pip install -r requirements.txt && python manage.py migrate && python manage.py runserver"

REM 잠시 대기
timeout /t 5 /nobreak >nul

REM React 프론트엔드 시작 (새 창에서)
echo React 프론트엔드를 시작합니다...
start "React Frontend" cmd /k "cd frontend && npm install && npm start"

echo.
echo 애플리케이션이 시작되었습니다!
echo - Django 백엔드: http://localhost:8000
echo - React 프론트엔드: http://localhost:3000
echo - Django 관리자: http://localhost:8000/admin
echo.
echo Ngrok으로 외부 접근을 원한다면:
echo ngrok http 8000
echo.
pause
