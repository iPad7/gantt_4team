# WBS: 4Team

팀원 5명이서 **2025년 7월 23일 ~ 2025년 9월 15일** 기간의 프로젝트를 관리하기 위한 Work Breakdown Structure 애플리케이션입니다.

## 주요 기능

- **대시보드**: 프로젝트 전체 진행 상황 및 팀원별 작업 현황 요약
- **계층적 작업 관리**: 상위/하위 작업을 드롭다운으로 관리하고, 하위 작업 기간에 따라 상위 작업 기간 자동 업데이트
- **Gantt 차트**: 프로젝트 전체 일정을 간트 차트로 시각화하고, 주말 제외 업무일 기준 표시
- **다중 담당자 지정**: 하나의 작업에 여러 명의 담당자 지정 가능
- **사용자 관리**: 관리자/일반 사용자 권한 분리

## 기술 스택

- **Backend**: Django 4.2.7 + Django REST Framework
- **Frontend**: React 18
- **Database**: PostgreSQL 15 (Docker)
- **API**: RESTful API
- **인증**: Django 세션 기반 인증

---

## 프로젝트 실행 가이드

이 가이드는 Git, Python, Node.js, Docker Desktop, Ngrok이 설치되어 있다고 가정합니다.

### 1. 사전 준비 (최초 1회)

새로운 PC에서 가장 먼저 해야 할 필수 설치 및 설정입니다.

1.  **Git, Python, Node.js(npm 포함), Docker Desktop 설치**: 각 공식 홈페이지에서 다운로드하여 설치합니다.
2.  **Ngrok 설정**:
    -   Ngrok 계정에 로그인하여 Authtoken을 복사합니다.
    -   터미널을 열고 아래 명령어를 실행하여 Authtoken을 PC에 저장합니다.
      ```bash
      ngrok config add-authtoken <복사한_Authtoken_붙여넣기>
      ```

### 2. 프로젝트 클론 및 의존성 설치

1.  **프로젝트 클론**: Git 저장소에서 프로젝트를 내려받습니다.
    ```bash
    git clone <GitHub_저장소_URL>
    cd <프로젝트_폴더명>
    ```

2.  **백엔드 의존성 설치**:
    -   백엔드용 가상환경을 생성하고 활성화합니다.
      ```bash
      # 가상환경 생성
      python -m venv backend/venv

      # 가상환경 활성화 (Windows)
      backend\venv\Scripts\activate
      ```
    -   `requirements.txt`에 명시된 Python 패키지들을 설치합니다.
      ```bash
      pip install -r backend/requirements.txt
      ```

3.  **프론트엔드 의존성 설치**:
    -   `frontend` 디렉토리로 이동하여 `npm` 패키지들을 설치합니다.
      ```bash
      cd frontend
      npm install
      cd ..  # 다시 루트 디렉토리로 이동
      ```

### 3. 애플리케이션 실행

이제 모든 구성 요소를 순서대로 실행합니다. **각 단계는 별도의 터미널 창에서 실행해야 합니다.**

1.  **터미널 1: 데이터베이스 서버 실행**
    -   프로젝트 루트 디렉토리에서 Docker Compose를 사용하여 PostgreSQL 데이터베이스를 백그라운드에서 실행합니다.
      ```bash
      docker-compose up -d
      ```

2.  **터미널 2: 백엔드 서버 실행**
    -   백엔드 가상환경을 활성화합니다.
      ```bash
      backend\venv\Scripts\activate
      ```
    -   데이터베이스 스키마를 최신 상태로 마이그레이션합니다.
      ```bash
      python backend/manage.py migrate
      ```
    -   **(최초 실행 시)** 관리자 계정을 생성합니다.
      ```bash
      python backend/manage.py createsuperuser
      ```
    -   Django 개발 서버를 실행합니다. (기본 포트: 8000)
      ```bash
      python backend/manage.py runserver
      ```

3.  **터미널 3: 프론트엔드 서버 실행**
    -   `frontend` 디렉토리로 이동합니다.
      ```bash
      cd frontend
      ```
    -   React 개발 서버를 실행합니다. (기본 포트: 3000)
      ```bash
      npm start
      ```

4.  **(선택) 터미널 4: Ngrok 실행**
    -   외부 접속이 필요한 경우, 프로젝트 루트 디렉토리에서 아래 명령어를 실행하여 Ngrok 터널을 시작합니다.
      ```bash
      ngrok start --config ngrok.yml --all
      ```

### 요약 (TL;DR)

의존성 설치가 모두 끝난 후, 평소에 프로젝트를 실행할 때는 아래 4개의 터미널을 켜면 됩니다.

-   **터미널 1 (루트):** `docker-compose up`
-   **터미널 2 (루트):** `backend\venv\Scripts\activate` 실행 후 `python backend/manage.py runserver`
-   **터미널 3 (루트):** `cd frontend` 실행 후 `npm start`
-   **터미널 4 (루트, 필요시):** `ngrok start --config ngrok.yml --all`

이제 `http://localhost:3000` 또는 Ngrok으로 발급된 URL로 접속하여 애플리케이션을 사용할 수 있습니다.

---

## API 엔드포인트

-   `POST /api/auth/login/` - 로그인
-   `DELETE /api/auth/logout/` - 로그아웃
-   `GET /api/auth/status/` - 로그인 상태 확인
-   `GET /api/dashboard/` - 대시보드 데이터
-   `GET /api/timeline/` - 간트 차트 데이터
-   `GET, POST /api/tasks/` - 작업 목록 조회, 생성
-   `GET, PUT, DELETE /api/tasks/{id}/` - 특정 작업 조회, 수정, 삭제
-   `GET /api/users/` - 사용자 목록 조회

## 데이터베이스 정보 (docker-compose.yml)

-   **Host**: localhost
-   **Port**: 5432
-   **Database**: wbs_db
-   **User**: wbs_user
-   **Password**: wbs_password
