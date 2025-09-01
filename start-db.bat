@echo off
echo PostgreSQL 데이터베이스를 Docker로 시작합니다...
echo.

REM Docker가 실행 중인지 확인
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker가 실행되지 않았습니다. Docker Desktop을 먼저 실행해주세요.
    pause
    exit /b 1
)

echo Docker Compose로 PostgreSQL을 시작합니다...
docker-compose up -d

echo.
echo PostgreSQL이 시작되었습니다!
echo 데이터베이스 정보:
echo - 호스트: localhost
echo - 포트: 5432
echo - 데이터베이스: wbs_db
echo - 사용자: wbs_user
echo - 비밀번호: wbs_password
echo.
echo 데이터베이스를 중지하려면 'stop-db.bat'을 실행하세요.
echo.
pause
