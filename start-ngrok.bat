@echo off
echo Ngrok 터널링을 시작합니다...
echo.

echo Django 백엔드 터널링 (포트 8000)...
start "Ngrok Backend" cmd /k "ngrok http 8000"

echo.
echo React 프론트엔드 터널링 (포트 3000)...
start "Ngrok Frontend" cmd /k "ngrok http 3000"

echo.
echo Ngrok 터널이 시작되었습니다!
echo - Django 백엔드: https://[random].ngrok.io -> http://localhost:8000
echo - React 프론트엔드: https://[random].ngrok.io -> http://localhost:3000
echo.
echo 각 터미널에서 제공되는 공개 URL을 확인하세요.
echo.
pause
