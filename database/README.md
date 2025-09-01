# PostgreSQL 데이터베이스 설정

## 1. PostgreSQL 설치

### Windows
1. [PostgreSQL 공식 웹사이트](https://www.postgresql.org/download/windows/)에서 다운로드
2. 설치 시 비밀번호를 기억해두세요
3. 기본 포트는 5432입니다

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 2. 데이터베이스 생성

PostgreSQL에 접속하여 데이터베이스와 사용자를 생성합니다:

```sql
-- PostgreSQL에 접속
psql -U postgres

-- 데이터베이스 생성
CREATE DATABASE wbs_db;

-- 사용자 생성
CREATE USER wbs_user WITH PASSWORD 'wbs_password';

-- 사용자에게 데이터베이스 권한 부여
GRANT ALL PRIVILEGES ON DATABASE wbs_db TO wbs_user;

-- 데이터베이스에 접속
\c wbs_db

-- 스키마 권한 부여
GRANT ALL ON SCHEMA public TO wbs_user;

-- 종료
\q
```

## 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가합니다:

```env
DB_NAME=wbs_db
DB_USER=wbs_user
DB_PASSWORD=wbs_password
DB_HOST=localhost
DB_PORT=5432
```

## 4. Django 마이그레이션

백엔드 디렉토리에서 다음 명령을 실행합니다:

```bash
cd backend

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# 가상환경 활성화 (macOS/Linux)
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 마이그레이션 실행
python manage.py makemigrations
python manage.py migrate

# 슈퍼유저 생성
python manage.py createsuperuser
```

## 5. 초기 데이터 설정

관리자 계정으로 로그인하여 다음 작업을 수행합니다:

1. Django 관리자 페이지 (`/admin/`)에 접속
2. 사용자 계정 생성 (팀원 4명)
3. 프로젝트 작업 생성

## 6. 연결 테스트

데이터베이스 연결을 테스트하려면:

```bash
python manage.py dbshell
```

연결이 성공하면 PostgreSQL 프롬프트가 표시됩니다.

## 7. 문제 해결

### 연결 오류
- PostgreSQL 서비스가 실행 중인지 확인
- 포트 번호가 올바른지 확인
- 방화벽 설정 확인

### 권한 오류
- 사용자에게 적절한 권한이 부여되었는지 확인
- 데이터베이스 소유권 확인

### 포트 충돌
- 다른 서비스가 5432 포트를 사용하고 있는지 확인
- 필요시 다른 포트 사용
