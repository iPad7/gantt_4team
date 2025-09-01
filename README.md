# WBS (Work Breakdown Structure) 애플리케이션

팀원 4명이서 8주 짜리 프로젝트를 관리할 수 있는 WBS 애플리케이션입니다.

## 주요 기능

- **Gantt 차트**: 프로젝트 일정을 시각적으로 관리
- **계층적 작업 관리**: 상위 업무와 하위 업무를 FK로 연결
- **사용자 관리**: 관리자가 팀원 계정 생성 및 관리
- **작업 진행률 추적**: 각 작업의 상태와 진행률 모니터링
- **주말 제외**: 업무일만 표시하여 정확한 일정 관리

## 기술 스택

- **Backend**: Django 4.2.7 + Django REST Framework
- **Frontend**: React 18
- **Database**: PostgreSQL 15 (Docker)
- **API**: RESTful API
- **인증**: Django 세션 기반 인증

## 프로젝트 구조

```
wbs/
├── backend/                 # Django 백엔드
│   ├── wbs_project/        # Django 프로젝트 설정
│   ├── wbs_app/           # 메인 애플리케이션
│   ├── requirements.txt    # Python 의존성
│   └── manage.py          # Django 관리 명령어
├── frontend/               # React 프론트엔드
│   ├── src/               # 소스 코드
│   ├── public/            # 정적 파일
│   └── package.json       # Node.js 의존성
├── database/               # 데이터베이스 관련 파일
├── docker-compose.yml      # PostgreSQL Docker 설정
├── start-db.bat           # 데이터베이스 시작 (Windows)
├── stop-db.bat            # 데이터베이스 중지 (Windows)
└── start.bat              # 전체 애플리케이션 시작 (Windows)
```

## 설치 및 실행

### 1. 사전 요구사항

- Python 3.8+
- Node.js 16+
- Docker Desktop
- Git

### 2. 데이터베이스 시작

```bash
# PostgreSQL 데이터베이스 시작
start-db.bat

# 또는 수동으로 Docker 실행
docker-compose up -d
```

### 3. 애플리케이션 시작

```bash
# 전체 애플리케이션 시작 (Django + React)
start.bat
```

### 4. 수동 실행 (선택사항)

#### 백엔드 실행
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```

### 5. 초기 설정

1. Django 관리자 페이지 접속: http://localhost:8000/admin
2. 슈퍼유저 생성:
   ```bash
   cd backend
   python manage.py createsuperuser
   ```
3. 팀원 계정 생성 (관리자 페이지에서)

## 사용법

### 로그인
- 관리자가 생성한 ID와 비밀번호로 로그인

### 대시보드
- 프로젝트 전체 진행률 확인
- 팀원별 작업 현황 파악

### Gantt 차트
- 7월 23일(수) ~ 9월 15일(월) 기간 표시
- 주말 제외한 업무일만 표시
- 상위/하위 작업 계층 구조 시각화

### 작업 관리
- 작업 생성, 수정, 삭제
- 상위 작업과 하위 작업 연결
- 작업 진행률 및 상태 관리

### 사용자 관리 (관리자 전용)
- 팀원 계정 생성 및 관리
- 권한 설정

## API 엔드포인트

- `POST /api/auth/login/` - 로그인
- `POST /api/auth/logout/` - 로그아웃
- `GET /api/dashboard/` - 대시보드 데이터
- `GET /api/gantt-chart/` - Gantt 차트 데이터
- `GET /api/tasks/` - 작업 목록
- `POST /api/tasks/` - 작업 생성
- `PUT /api/tasks/{id}/` - 작업 수정
- `DELETE /api/tasks/{id}/` - 작업 삭제

## 데이터베이스 정보

- **호스트**: localhost
- **포트**: 5432
- **데이터베이스**: wbs_db
- **사용자**: wbs_user
- **비밀번호**: wbs_password

## Ngrok 설정

외부 접근을 위해 Ngrok 사용:

```bash
ngrok http 8000
```

## 문제 해결

### Docker 관련
- Docker Desktop이 실행 중인지 확인
- `docker-compose up -d` 명령어로 데이터베이스 상태 확인

### 데이터베이스 연결 오류
- PostgreSQL 컨테이너가 실행 중인지 확인
- 포트 5432가 사용 가능한지 확인

### 의존성 설치 오류
- Python 가상환경이 활성화되었는지 확인
- Node.js 버전이 16+인지 확인

## 라이선스

이 프로젝트는 교육 및 개인 사용 목적으로 제작되었습니다.
