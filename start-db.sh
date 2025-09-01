#!/bin/bash

echo "PostgreSQL 데이터베이스를 Docker로 시작합니다..."
echo

# Docker가 실행 중인지 확인
if ! docker info > /dev/null 2>&1; then
    echo "Docker가 실행되지 않았습니다. Docker Desktop을 먼저 실행해주세요."
    exit 1
fi

echo "Docker Compose로 PostgreSQL을 시작합니다..."
docker-compose up -d

echo
echo "PostgreSQL이 시작되었습니다!"
echo "데이터베이스 정보:"
echo "- 호스트: localhost"
echo "- 포트: 5432"
echo "- 데이터베이스: wbs_db"
echo "- 사용자: wbs_user"
echo "- 비밀번호: wbs_password"
echo
echo "데이터베이스를 중지하려면 './stop-db.sh'을 실행하세요."
echo
