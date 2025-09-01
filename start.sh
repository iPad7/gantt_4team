#!/bin/bash

echo "WBS 애플리케이션을 시작합니다..."
echo

# Docker가 실행 중인지 확인
if ! docker info > /dev/null 2>&1; then
    echo "Docker가 실행되지 않았습니다. Docker Desktop을 먼저 실행해주세요."
    exit 1
fi

# PostgreSQL 컨테이너가 실행 중인지 확인
if ! docker ps | grep -q "wbs_postgres"; then
    echo "PostgreSQL 데이터베이스를 먼저 시작합니다..."
    echo "'./start-db.sh'을 실행하여 데이터베이스를 시작한 후 다시 시도해주세요."
    exit 1
fi

echo "데이터베이스가 실행 중입니다. Django와 React를 시작합니다..."
echo

# Django 백엔드 시작 (백그라운드에서)
echo "Django 백엔드를 시작합니다..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver > ../django.log 2>&1 &
DJANGO_PID=$!
cd ..

echo "Django 백엔드가 시작되었습니다. (PID: $DJANGO_PID)"
echo "로그 확인: tail -f django.log"

# 잠시 대기
sleep 5

# React 프론트엔드 시작 (백그라운드에서)
echo "React 프론트엔드를 시작합니다..."
cd frontend
npm install
npm start > ../react.log 2>&1 &
REACT_PID=$!
cd ..

echo "React 프론트엔드가 시작되었습니다. (PID: $REACT_PID)"
echo "로그 확인: tail -f react.log"

echo
echo "애플리케이션이 시작되었습니다!"
echo "- Django 백엔드: http://localhost:8000 (PID: $DJANGO_PID)"
echo "- React 프론트엔드: http://localhost:3000 (PID: $REACT_PID)"
echo "- Django 관리자: http://localhost:8000/admin"
echo
echo "Ngrok으로 외부 접근을 원한다면:"
echo "ngrok http 8000"
echo
echo "애플리케이션을 중지하려면:"
echo "kill $DJANGO_PID $REACT_PID"
echo
echo "로그 확인:"
echo "tail -f django.log react.log"
