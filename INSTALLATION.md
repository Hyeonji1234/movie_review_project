# 설치 가이드

## 필수 프로그램 설치

### 1. Node.js 설치
- 공식 사이트: https://nodejs.org/
- LTS 버전(v18 이상) 다운로드 및 설치
- 설치 확인: 터미널에서 `node -v` 및 `npm -v` 실행

### 2. MariaDB 설치
- 공식 사이트: https://mariadb.org/download/
- MariaDB 10.5 이상 버전 다운로드 및 설치
- 설치 중 root 비밀번호 설정 (기억해두세요!)
- 설치 확인: 터미널에서 `mysql -V` 실행

### 3. HeidiSQL 설치 (선택사항, DB 관리 도구)
- 공식 사이트: https://www.heidisql.com/download.php
- 설치 후 MariaDB에 연결하여 GUI로 데이터베이스 관리 가능

---

## 프로젝트 설정

### Step 1: 데이터베이스 설정

#### 방법 1: 명령줄 사용
```bash
# MariaDB에 root로 접속
mysql -u root -p
# (비밀번호 입력)

# cinema_db 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS cinema_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 데이터베이스 사용
USE cinema_db;

# 테이블 생성 (initDatabase.sql 파일 실행)
# Windows
SOURCE C:/Users/addmin/Desktop/나의쓸모/cinema-project/backend/config/initDatabase.sql;

# 또는 직접 SQL 실행 (아래 내용 복사/붙여넣기)
```

#### 방법 2: HeidiSQL 사용
1. HeidiSQL 실행
2. 새 연결 생성 (root 계정 사용)
3. '쿼리' 탭에서 `backend/config/initDatabase.sql` 파일 열기
4. 'F9' 키 또는 실행 버튼 클릭

---

### Step 2: 백엔드 설정

```bash
# cinema-project/backend 폴더로 이동
cd cinema-project/backend

# 패키지 설치
npm install

# .env 파일 생성
copy .env.example .env
```

`.env` 파일을 메모장으로 열고 다음 내용 수정:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=여기에_MariaDB_비밀번호_입력
DB_NAME=cinema_db
DB_PORT=3306

PORT=5000

JWT_SECRET=my_super_secret_jwt_key_12345

TMDB_API_KEY=여기에_TMDb_API_키_입력
```

#### TMDb API 키 발급 방법:
1. https://www.themoviedb.org/ 접속
2. 회원가입 (무료)
3. 설정 → API → API 키 요청
4. 발급받은 키를 `.env` 파일에 입력

---

### Step 3: 프론트엔드 설정

새 터미널을 열고:

```bash
# cinema-project/frontend 폴더로 이동
cd cinema-project/frontend

# 패키지 설치
npm install
```

---

## 실행 방법

### 백엔드 실행 (터미널 1)
```bash
cd cinema-project/backend
npm start

# 또는 개발 모드 (파일 변경 시 자동 재시작)
npm run dev
```

서버가 실행되면: `http://localhost:5000`

### 프론트엔드 실행 (터미널 2)
```bash
cd cinema-project/frontend
npm start
```

브라우저가 자동으로 열리며: `http://localhost:3000`

---

## 설치할 npm 패키지 상세 목록

### 백엔드 (backend)

#### 기본 패키지
```bash
npm install express             # 웹 프레임워크
npm install mysql2              # MariaDB 연결
npm install cors                # CORS 처리
npm install dotenv              # 환경변수 관리
npm install bcrypt              # 비밀번호 암호화
npm install jsonwebtoken        # JWT 인증
npm install axios               # HTTP 클라이언트 (TMDb API)
```

#### 개발 패키지
```bash
npm install --save-dev nodemon  # 자동 서버 재시작
```

#### 한 줄로 전체 설치
```bash
npm install express mysql2 cors dotenv bcrypt jsonwebtoken axios
npm install --save-dev nodemon
```

---

### 프론트엔드 (frontend)

#### 기본 패키지 (package.json에 이미 포함됨)
```bash
npm install react               # React 라이브러리
npm install react-dom           # React DOM
npm install react-router-dom    # 라우팅
npm install axios               # HTTP 클라이언트
npm install react-scripts       # Create React App 스크립트
```

#### 한 줄로 전체 설치
```bash
npm install
# (package.json의 모든 의존성 자동 설치)
```

---

## 문제 해결

### Q: npm install 시 오류 발생
**A:** Node.js를 최신 LTS 버전으로 업데이트하세요.

### Q: MariaDB 연결 오류
**A:**
1. MariaDB 서비스가 실행 중인지 확인
2. `.env` 파일의 DB_PASSWORD가 정확한지 확인
3. Windows: 서비스(services.msc)에서 MariaDB 실행 확인

### Q: 포트 충돌 (EADDRINUSE)
**A:**
- 백엔드: `.env`에서 PORT 변경
- 프론트엔드: 다른 포트 사용 여부 묻는 메시지에 'Y' 입력

### Q: TMDb API 오류
**A:** TMDb API 키가 올바르게 설정되었는지 확인

### Q: JWT 오류
**A:** `.env` 파일에 JWT_SECRET이 설정되어 있는지 확인

---

## 프로젝트 확인 체크리스트

- [ ] Node.js 설치 완료
- [ ] MariaDB 설치 및 실행 확인
- [ ] cinema_db 데이터베이스 생성 완료
- [ ] users, reviews 테이블 생성 완료
- [ ] backend/.env 파일 설정 완료
- [ ] TMDb API 키 발급 및 설정 완료
- [ ] 백엔드 패키지 설치 (`npm install`)
- [ ] 프론트엔드 패키지 설치 (`npm install`)
- [ ] 백엔드 서버 실행 성공 (포트 5000)
- [ ] 프론트엔드 앱 실행 성공 (포트 3000)
- [ ] 브라우저에서 영화 목록 표시 확인

---

## 추가 도움말

- 상세한 사용법은 `README.md` 참조
- API 엔드포인트 테스트: Postman 사용 권장
- 개발 시 Chrome DevTools (F12) 활용

프로젝트 설정 중 문제가 발생하면 에러 메시지를 확인하고,
위의 문제 해결 섹션을 참고하세요.
