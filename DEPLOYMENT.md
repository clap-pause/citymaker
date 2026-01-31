# 🚀 배포 가이드

이 가이드는 도시 개발 시뮬레이터를 무료로 배포하는 방법을 설명합니다.

## 📋 사전 준비

1. **GitHub 계정** (무료)
2. **MongoDB Atlas 계정** (무료 티어: 512MB)
3. **Vercel 계정** (프론트엔드 배포, 무료)
4. **Railway 또는 Render 계정** (백엔드 배포, 무료)

---

## 1️⃣ MongoDB Atlas 설정 (상세 가이드)

MongoDB Atlas는 클라우드 기반 MongoDB 서비스로, 무료 티어로 512MB의 저장공간을 제공합니다.

---

### 1.1 계정 생성 및 클러스터 생성

#### 단계별 상세 설명

**1단계: MongoDB Atlas 웹사이트 접속**
- 브라우저에서 [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) 접속
- 우측 상단의 "Try Free" 또는 "Sign Up" 버튼 클릭

**2단계: 계정 생성**
- **이메일 주소 입력**: 실제 사용하는 이메일 주소 입력 (인증 필요)
- **비밀번호 설정**: 강력한 비밀번호 설정 (최소 8자, 대소문자, 숫자, 특수문자 포함 권장)
- **이름 입력**: First Name, Last Name 입력
- **회사명 입력**: (선택사항) 개인 사용 시 "Personal" 또는 "N/A" 입력 가능
- **약관 동의**: Terms of Service와 Privacy Policy 체크박스 선택
- **"Create your Atlas account"** 버튼 클릭

**3단계: 이메일 인증**
- 입력한 이메일로 인증 메일이 발송됨
- 이메일의 "Verify your email address" 링크 클릭
- 인증 완료 후 자동으로 Atlas 대시보드로 이동

**4단계: 조직 및 프로젝트 설정**
- **Organization Name**: 조직 이름 입력 (예: "My Projects" 또는 "Personal")
- **Project Name**: 프로젝트 이름 입력 (예: "City Calculator")
- **"Create Project"** 버튼 클릭

**5단계: 클러스터 생성**
- **"Build a Database"** 버튼 클릭 (또는 "Create" → "Database")
- **배포 옵션 선택**:
  - **"M0" (Free Shared)"** 선택 (무료 티어)
  - 또는 "M2" 또는 "M5" (유료 플랜) 선택 가능
- **클라우드 제공자 및 지역 선택**:
  - **Provider**: AWS, Google Cloud, Azure 중 선택 (AWS 권장)
  - **Region**: 가장 가까운 지역 선택
    - 한국 사용자: `Asia Pacific (Seoul) ap-northeast-2` 또는 `Asia Pacific (Tokyo) ap-northeast-1`
    - 미국 사용자: `US East (N. Virginia) us-east-1`
    - 유럽 사용자: `Europe (Frankfurt) eu-central-1`
- **클러스터 이름 설정**:
  - 기본값: `Cluster0` (그대로 사용 가능)
  - 또는 원하는 이름 입력 (예: `city-calculator-cluster`)
- **"Create Cluster"** 버튼 클릭
- ⏳ **클러스터 생성 대기**: 약 3-5분 소요 (진행 상황 표시됨)

**완료 확인**
- 클러스터가 생성되면 "Your cluster is being created" 메시지가 사라지고 클러스터 목록에 표시됨
- 상태가 "Creating"에서 "Idle"로 변경되면 완료

---

### 1.2 데이터베이스 사용자 생성

데이터베이스에 접근하기 위한 사용자 계정을 생성합니다.

#### 단계별 상세 설명

**1단계: Database Access 메뉴로 이동**
- 왼쪽 사이드바에서 **"Security"** 섹션의 **"Database Access"** 클릭
- 또는 상단 메뉴에서 **"Database Access"** 클릭

**2단계: 새 사용자 추가**
- **"Add New Database User"** 버튼 클릭 (우측 상단)

**3단계: 인증 방법 선택**
- **"Password"** 탭 선택 (기본값)
- 또는 "Certificate" 또는 "AWS IAM" 선택 가능 (고급 옵션)

**4단계: 사용자 정보 입력**
- **Username**: 사용자 이름 입력
  - 예: `city-calculator-user` 또는 `admin`
  - ⚠️ **주의**: 이 사용자명은 나중에 연결 문자열에 사용됨
- **Password**: 비밀번호 설정
  - **"Autogenerate Secure Password"** 클릭하여 자동 생성 권장
  - 또는 직접 입력 (강력한 비밀번호 권장)
  - ⚠️ **중요**: 비밀번호를 반드시 복사해두세요! (나중에 다시 볼 수 없음)
- **"Show Password"** 체크박스로 비밀번호 확인

**5단계: 사용자 권한 설정**
- **"Built-in Role"** 선택 (기본값)
- **"Atlas admin"** 선택 (모든 권한)
  - 또는 더 제한적인 권한 선택 가능:
    - `readWrite`: 읽기/쓰기 권한
    - `read`: 읽기 전용 권한
- ⚠️ **보안 참고**: 프로덕션 환경에서는 최소 권한 원칙 적용 권장

**6단계: 사용자 생성 완료**
- **"Add User"** 버튼 클릭
- 사용자 생성 완료 메시지 확인
- 사용자 목록에 새로 생성된 사용자 표시됨

**⚠️ 중요 사항**
- 생성된 사용자명과 비밀번호를 안전한 곳에 저장하세요
- 비밀번호는 나중에 다시 확인할 수 없으므로 잃어버리면 새 사용자를 생성해야 합니다

---

### 1.3 네트워크 접근 설정

MongoDB Atlas는 기본적으로 모든 IP 주소에서의 접근을 차단합니다. 애플리케이션이 데이터베이스에 연결하려면 IP 주소를 허용 목록에 추가해야 합니다.

#### 단계별 상세 설명

**1단계: Network Access 메뉴로 이동**
- 왼쪽 사이드바에서 **"Security"** 섹션의 **"Network Access"** 클릭
- 또는 상단 메뉴에서 **"Network Access"** 클릭

**2단계: IP 주소 추가**
- **"Add IP Address"** 버튼 클릭 (우측 상단)

**3단계: 접근 허용 방법 선택**

**옵션 A: 모든 IP 주소 허용 (개발/테스트용 권장)**
- **"Allow Access from Anywhere"** 버튼 클릭
- 자동으로 `0.0.0.0/0` 입력됨
- ⚠️ **보안 주의**: 프로덕션 환경에서는 특정 IP만 허용하는 것을 권장합니다

**옵션 B: 현재 IP 주소만 허용 (로컬 개발용)**
- **"Add Current IP Address"** 버튼 클릭
- 현재 브라우저의 IP 주소가 자동으로 입력됨
- ⚠️ **주의**: IP 주소가 변경되면 (예: 다른 네트워크 사용) 다시 추가해야 합니다

**옵션 C: 특정 IP 주소 입력**
- **"IP Access List"**에 IP 주소 또는 CIDR 블록 입력
  - 예: `192.168.1.100` (단일 IP)
  - 예: `192.168.1.0/24` (서브넷)
- **"Comment"** (선택사항): 이 IP의 용도 설명 (예: "Office Network")

**4단계: 확인 및 저장**
- **"Confirm"** 버튼 클릭
- IP 주소가 목록에 추가됨
- 상태가 "Active"로 표시되면 완료

**⚠️ 중요 사항**
- IP 주소 추가 후 즉시 적용됩니다 (대기 시간 없음)
- 여러 IP 주소를 추가할 수 있습니다
- IP 주소를 삭제하려면 목록에서 해당 항목의 "..." 메뉴 → "Delete" 클릭

**로컬 개발 시 주의사항**
- 집에서 개발: 현재 IP 주소 추가
- 회사에서 개발: 회사 IP 주소 추가
- 여러 곳에서 개발: "Allow Access from Anywhere" 사용 (보안 주의)

---

### 1.4 연결 문자열 가져오기

애플리케이션에서 MongoDB에 연결하기 위한 연결 문자열을 가져옵니다.

#### 단계별 상세 설명

**1단계: Database 메뉴로 이동**
- 왼쪽 사이드바에서 **"Deployments"** 섹션의 **"Database"** 클릭
- 또는 상단 메뉴에서 **"Database"** 클릭
- 생성한 클러스터가 목록에 표시됨

**2단계: Connect 버튼 클릭**
- 클러스터 목록에서 생성한 클러스터의 **"Connect"** 버튼 클릭
- 연결 방법 선택 창이 나타남

**3단계: 연결 방법 선택**
- **"Connect your application"** 옵션 클릭
  - 다른 옵션들:
    - "Connect with MongoDB Compass": GUI 도구로 연결
    - "Connect with MongoDB Shell": 명령줄로 연결
    - "Connect with VS Code": VS Code 확장으로 연결

**4단계: 드라이버 및 버전 선택**
- **Driver**: 드롭다운에서 **"Node.js"** 선택
- **Version**: **"5.5 or later"** 선택 (또는 최신 버전)
- 연결 문자열이 표시됨:
  ```
  mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```

**5단계: 연결 문자열 복사**
- 표시된 연결 문자열을 클릭하여 전체 선택
- **Ctrl+C** (Windows) 또는 **Cmd+C** (Mac)로 복사
- 또는 **"Copy"** 버튼 클릭

**6단계: 연결 문자열 수정 (중요!)**
- 복사한 연결 문자열에서 `<username>`과 `<password>`를 실제 값으로 교체:
  ```
  mongodb+srv://city-calculator-user:your-password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- ⚠️ **주의**: 
  - `<username>`을 1.2에서 생성한 사용자명으로 교체
  - `<password>`를 1.2에서 생성한 비밀번호로 교체
  - 비밀번호에 특수문자(`@`, `#`, `%` 등)가 있으면 URL 인코딩 필요
    - 예: `@` → `%40`, `#` → `%23`, `%` → `%25`

**7단계: 데이터베이스 이름 추가**
- 연결 문자열 끝에 데이터베이스 이름 추가:
  ```
  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/city-calculator?retryWrites=true&w=majority
  ```
- `/city-calculator` 부분이 데이터베이스 이름입니다
- 데이터베이스가 없으면 자동으로 생성됩니다

**최종 연결 문자열 예시**
```
mongodb+srv://city-calculator-user:MySecurePass123!@cluster0.abc123.mongodb.net/city-calculator?retryWrites=true&w=majority
```

**⚠️ 중요 사항**
- 연결 문자열에 비밀번호가 포함되어 있으므로 안전하게 보관하세요
- GitHub 등 공개 저장소에 커밋하지 마세요
- `.env` 파일에 저장하고 `.gitignore`에 포함되어 있는지 확인하세요

---

### 1.5 로컬 개발 환경에 연결 문자열 설정

로컬에서 개발할 때 연결 문자열을 설정하는 방법입니다.

#### Windows (CMD/PowerShell)

**방법 1: echo 명령어 사용**
```cmd
cd server
echo MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/city-calculator?retryWrites=true^&w=majority > .env
echo PORT=3000 >> .env
```

**방법 2: 텍스트 에디터 사용**
1. `server` 폴더로 이동
2. 새 파일 생성: `.env` (파일명 앞에 점 포함)
3. 다음 내용 입력:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/city-calculator?retryWrites=true&w=majority
   PORT=3000
   ```
4. 저장

**방법 3: PowerShell 사용 (특수문자 처리)**
```powershell
cd server
@"
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/city-calculator?retryWrites=true&w=majority
PORT=3000
"@ | Out-File -FilePath .env -Encoding utf8
```

#### Mac/Linux

```bash
cd server
cat > .env << EOF
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/city-calculator?retryWrites=true&w=majority
PORT=3000
EOF
```

#### 비밀번호에 특수문자가 있는 경우

비밀번호에 `@`, `#`, `%`, `&` 등의 특수문자가 있으면 URL 인코딩이 필요합니다:

| 문자 | 인코딩 |
|------|--------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |
| `:` | `%3A` |

**예시:**
- 원본 비밀번호: `MyPass@123#`
- 인코딩된 비밀번호: `MyPass%40123%23`
- 연결 문자열: `mongodb+srv://user:MyPass%40123%23@cluster0.xxxxx.mongodb.net/...`

**온라인 URL 인코더 사용:**
- [URLEncoder.org](https://www.urlencoder.org/)에서 비밀번호를 인코딩할 수 있습니다

#### 연결 테스트

`.env` 파일을 생성한 후 서버를 실행하여 연결을 테스트합니다:

```bash
cd server
npm start
```

**성공 메시지:**
```
✅ MongoDB 연결 성공
🚀 서버가 포트 3000에서 실행 중입니다
```

**실패 메시지 (해결 방법):**
- `MongoServerSelectionError`: 네트워크 접근 설정 확인 (1.3 단계)
- `Authentication failed`: 사용자명/비밀번호 확인 (1.2 단계)
- `Connection timeout`: 방화벽 또는 네트워크 문제 확인

---

### 1.6 연결 문자열 확인 및 문제 해결

#### 연결 문자열 형식 확인

올바른 연결 문자열 형식:
```
mongodb+srv://[username]:[password]@[cluster-host]/[database-name]?[options]
```

**각 부분 설명:**
- `mongodb+srv://`: MongoDB Atlas 연결 프로토콜
- `[username]`: 데이터베이스 사용자명 (1.2에서 생성)
- `[password]`: 데이터베이스 비밀번호 (1.2에서 생성, URL 인코딩 필요할 수 있음)
- `[cluster-host]`: 클러스터 호스트명 (예: `cluster0.abc123.mongodb.net`)
- `[database-name]`: 데이터베이스 이름 (예: `city-calculator`)
- `[options]`: 연결 옵션 (예: `retryWrites=true&w=majority`)

#### 일반적인 오류 및 해결 방법

**오류 1: "MongoServerSelectionError: connect ECONNREFUSED"**
- **원인**: 네트워크 접근 설정이 안 됨
- **해결**: 1.3 단계에서 IP 주소 추가 확인

**오류 2: "Authentication failed"**
- **원인**: 사용자명 또는 비밀번호가 잘못됨
- **해결**: 
  - 1.2 단계에서 생성한 사용자명/비밀번호 확인
  - 비밀번호 특수문자 URL 인코딩 확인
  - Database Access에서 사용자 재생성

**오류 3: "Connection timeout"**
- **원인**: 방화벽 또는 네트워크 문제
- **해결**: 
  - 네트워크 접근 설정에서 "Allow Access from Anywhere" 확인
  - 회사/학교 네트워크인 경우 IT 관리자에게 문의

**오류 4: "Invalid connection string"**
- **원인**: 연결 문자열 형식 오류
- **해결**: 
  - 연결 문자열에 모든 부분이 포함되어 있는지 확인
  - 데이터베이스 이름(`/city-calculator`)이 포함되어 있는지 확인
  - 특수문자 URL 인코딩 확인

#### MongoDB Atlas 대시보드에서 연결 확인

1. **Database** 메뉴 → 클러스터 선택
2. **"Metrics"** 탭에서 연결 수 확인
3. **"Logs"** 탭에서 연결 로그 확인
4. 서버 실행 시 연결이 표시되어야 함

---

### 1.7 추가 보안 설정 (선택사항)

프로덕션 환경을 위한 추가 보안 설정입니다.

#### IP 주소 제한 (권장)

1. **Network Access** 메뉴로 이동
2. 기존 `0.0.0.0/0` 항목 삭제
3. 실제 서버 IP 주소만 추가:
   - Railway/Render 배포 시: 해당 서비스의 IP 주소 확인
   - 또는 서비스 제공 업체의 IP 범위 추가

#### 사용자 권한 최소화

1. **Database Access** 메뉴로 이동
2. 새 사용자 생성 시:
   - `readWrite` 권한만 부여 (필요한 경우)
   - 특정 데이터베이스에만 권한 부여

#### 연결 문자열 암호화

- 환경 변수에 저장 (`.env` 파일)
- GitHub Secrets 사용 (배포 시)
- 절대 코드에 하드코딩하지 않기

---

## 2️⃣ 백엔드 배포 (Railway 또는 Render)

### 옵션 A: Railway 사용 (권장)

#### 2.1 Railway 계정 생성

1. [Railway](https://railway.app) 접속
2. GitHub로 로그인

#### 2.2 프로젝트 배포

1. "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. GitHub 저장소 선택
4. "Deploy Now" 클릭

#### 2.3 환경 변수 설정

1. 프로젝트 대시보드에서 "Variables" 탭 클릭
2. 다음 환경 변수 추가:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/city-calculator?retryWrites=true&w=majority
   PORT=3000
   ```
3. MongoDB Atlas에서 복사한 연결 문자열을 `MONGODB_URI`에 입력

#### 2.4 도메인 설정

1. "Settings" 탭 클릭
2. "Generate Domain" 클릭
3. 생성된 도메인 복사 (예: `city-calculator-api.railway.app`)

---

### 옵션 B: Render 사용

#### 2.1 Render 계정 생성

1. [Render](https://render.com) 접속
2. GitHub로 로그인

#### 2.2 프로젝트 배포

1. "New +" → "Web Service" 클릭
2. GitHub 저장소 연결
3. 설정:
   - **Name**: `city-calculator-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

#### 2.3 환경 변수 설정

1. "Environment" 섹션에서 환경 변수 추가:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/city-calculator?retryWrites=true&w=majority
   NODE_ENV=production
   PORT=10000
   ```

#### 2.4 도메인 확인

1. 배포 완료 후 자동 생성된 도메인 확인 (예: `city-calculator-api.onrender.com`)

---

## 3️⃣ 프론트엔드 배포 (Vercel)

### 3.1 Vercel 계정 생성

1. [Vercel](https://vercel.com) 접속
2. GitHub로 로그인

### 3.2 프로젝트 배포

1. "Add New Project" 클릭
2. GitHub 저장소 선택
3. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 환경 변수 설정

1. "Environment Variables" 섹션으로 이동
2. 다음 환경 변수 추가:
   ```
   VITE_API_URL=https://your-backend-domain.railway.app/api
   ```
   - Railway 사용 시: `https://your-project.railway.app/api`
   - Render 사용 시: `https://your-project.onrender.com/api`

### 3.4 배포 완료

1. "Deploy" 클릭
2. 배포 완료 후 생성된 도메인 확인 (예: `city-calculator.vercel.app`)

---

## 4️⃣ 로컬 개발 환경 설정

로컬에서 개발하고 테스트하는 방법입니다.

---

### 4.1 백엔드 로컬 실행

#### 단계별 설정

**1단계: 프로젝트 폴더로 이동**
```bash
cd "C:\Users\nitty\OneDrive\바탕 화면\CLAP\city calculator"
```

**2단계: 서버 의존성 설치**
```bash
cd server
npm install
```

**3단계: MongoDB 연결 문자열 설정**

**Windows (CMD)에서:**
```cmd
cd server
echo MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/city-calculator?retryWrites=true^&w=majority > .env
echo PORT=3000 >> .env
```

**Windows (PowerShell)에서:**
```powershell
cd server
@"
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/city-calculator?retryWrites=true&w=majority
PORT=3000
"@ | Out-File -FilePath .env -Encoding utf8
```

**Mac/Linux에서:**
```bash
cd server
cat > .env << EOF
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/city-calculator?retryWrites=true&w=majority
PORT=3000
EOF
```

**⚠️ 중요:**
- `username`과 `password`를 실제 값으로 교체하세요
- 비밀번호에 특수문자가 있으면 URL 인코딩이 필요할 수 있습니다 (1.5 참조)

**4단계: .env 파일 확인**
- `server/.env` 파일이 생성되었는지 확인
- 파일 내용이 올바른지 확인:
  ```
  MONGODB_URI=mongodb+srv://...
  PORT=3000
  ```

**5단계: 서버 실행**
```bash
npm start
```

**성공 메시지:**
```
✅ MongoDB 연결 성공
🚀 서버가 포트 3000에서 실행 중입니다
📍 Health check: http://localhost:3000/api/health
```

**실패 시 확인 사항:**
- MongoDB Atlas 네트워크 접근 설정 확인 (1.3)
- 연결 문자열 형식 확인 (1.4)
- 사용자명/비밀번호 확인 (1.2)

**6단계: 서버 테스트**
- 브라우저에서 `http://localhost:3000/api/health` 접속
- 다음 응답이 보이면 성공:
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "database": "connected"
  }
  ```

---

### 4.2 프론트엔드 로컬 실행

#### 단계별 설정

**1단계: 루트 폴더로 이동**
```bash
cd "C:\Users\nitty\OneDrive\바탕 화면\CLAP\city calculator"
```

**2단계: 프론트엔드 의존성 설치**
```bash
npm install
```

**3단계: 환경 변수 설정**

**Windows (CMD)에서:**
```cmd
echo VITE_API_URL=http://localhost:3000/api > .env
```

**Windows (PowerShell)에서:**
```powershell
@"
VITE_API_URL=http://localhost:3000/api
"@ | Out-File -FilePath .env -Encoding utf8
```

**Mac/Linux에서:**
```bash
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

**⚠️ 중요:**
- 백엔드 서버가 `http://localhost:3000`에서 실행 중이어야 합니다
- 다른 포트를 사용하는 경우 포트 번호를 변경하세요

**4단계: 개발 서버 실행**
```bash
npm run dev
```

**성공 메시지:**
```
VITE v5.4.21  ready in 3615 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**5단계: 브라우저에서 확인**
- 브라우저에서 `http://localhost:5173` 접속
- 도시 개발 시뮬레이터가 정상적으로 로드되는지 확인

---

### 4.3 전체 시스템 테스트

#### 테스트 체크리스트

**백엔드 테스트:**
- [ ] 서버가 정상적으로 시작됨
- [ ] MongoDB 연결 성공 메시지 확인
- [ ] `http://localhost:3000/api/health` 접속 시 정상 응답
- [ ] `http://localhost:3000/api/session` POST 요청 시 세션 ID 반환

**프론트엔드 테스트:**
- [ ] 개발 서버가 정상적으로 시작됨
- [ ] 브라우저에서 앱이 정상적으로 로드됨
- [ ] 건물 배치 기능 작동
- [ ] 지표 계산 기능 작동
- [ ] 자동 저장 기능 작동 (콘솔에서 확인)

**통합 테스트:**
- [ ] 프론트엔드에서 건물 배치 후 저장 버튼 클릭
- [ ] 브라우저 새로고침 후 데이터가 유지되는지 확인
- [ ] 브라우저 개발자 도구(F12) → Network 탭에서 API 요청 확인

#### API 테스트 (선택사항)

**Postman 또는 curl 사용:**

**세션 생성:**
```bash
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d "{}"
```

**도시 데이터 저장:**
```bash
curl -X POST http://localhost:3000/api/cities \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "your-session-id",
    "blockBuildings": {},
    "affordableRatio": 0,
    "environmentInvestment": 0
  }'
```

**도시 데이터 로드:**
```bash
curl http://localhost:3000/api/cities/your-session-id
```

---

### 4.4 문제 해결

#### 백엔드 문제

**문제: "MongoDB 연결 실패"**
- **해결 1**: `.env` 파일이 `server` 폴더에 있는지 확인
- **해결 2**: 연결 문자열 형식 확인 (1.4 참조)
- **해결 3**: MongoDB Atlas 네트워크 접근 설정 확인 (1.3)
- **해결 4**: 사용자명/비밀번호 확인 (1.2)

**문제: "포트 3000이 이미 사용 중"**
- **해결**: 다른 포트 사용
  ```cmd
  echo PORT=3001 >> server/.env
  ```
  그리고 프론트엔드 `.env`도 수정:
  ```cmd
  echo VITE_API_URL=http://localhost:3001/api > .env
  ```

**문제: "Cannot find module"**
- **해결**: 의존성 재설치
  ```bash
  cd server
  rm -rf node_modules
  npm install
  ```

#### 프론트엔드 문제

**문제: "API 요청 실패"**
- **해결 1**: 백엔드 서버가 실행 중인지 확인
- **해결 2**: `.env` 파일의 `VITE_API_URL` 확인
- **해결 3**: 브라우저 개발자 도구 → Console에서 오류 메시지 확인
- **해결 4**: CORS 오류인 경우 `server/server.js`의 CORS 설정 확인

**문제: "환경 변수가 적용되지 않음"**
- **해결 1**: 개발 서버 재시작 (Vite는 환경 변수 변경 시 재시작 필요)
- **해결 2**: `.env` 파일이 루트 폴더에 있는지 확인
- **해결 3**: 환경 변수 이름이 `VITE_`로 시작하는지 확인

**문제: "빌드 오류"**
- **해결 1**: Node.js 버전 확인 (v18 이상 권장)
- **해결 2**: 의존성 재설치
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

---

### 4.5 개발 팁

#### 동시 실행 (두 터미널)

**터미널 1 (백엔드):**
```bash
cd server
npm start
```

**터미널 2 (프론트엔드):**
```bash
npm run dev
```

#### 자동 재시작

**백엔드 자동 재시작 (개발 모드):**
```bash
cd server
npm run dev
```

**프론트엔드:** Vite는 기본적으로 자동 재시작됩니다.

#### 로그 확인

**백엔드 로그:**
- 터미널에서 직접 확인
- MongoDB 연결 상태, API 요청 등 표시

**프론트엔드 로그:**
- 브라우저 개발자 도구(F12) → Console
- Network 탭에서 API 요청 확인

#### 디버깅

**MongoDB 연결 테스트:**
```bash
# server 폴더에서
node -e "require('dotenv').config(); const {MongoClient} = require('mongodb'); MongoClient.connect(process.env.MONGODB_URI).then(() => console.log('연결 성공')).catch(e => console.error('연결 실패:', e))"
```

**환경 변수 확인:**
```bash
# Windows
type server\.env
type .env

# Mac/Linux
cat server/.env
cat .env
```

---

## 5️⃣ 트러블슈팅

### 백엔드 연결 오류

- MongoDB Atlas의 네트워크 접근 설정 확인
- 연결 문자열에 데이터베이스 이름 포함 확인
- 환경 변수 `MONGODB_URI` 확인

### CORS 오류

- `server/server.js`의 CORS 설정 확인
- 프론트엔드 도메인이 허용 목록에 있는지 확인

### 환경 변수 미적용

- Vercel/Railway/Render에서 환경 변수 재설정
- 배포 재시작

---

## 6️⃣ 성능 최적화

### 500명 동시 접속 대응

1. **MongoDB Atlas**: 무료 티어는 충분 (512MB, 최대 연결 수 제한 있음)
2. **Railway**: 무료 티어는 시간 제한 있음 (월 500시간)
3. **Render**: 무료 티어는 15분 비활성 시 슬리핑 (첫 요청 시 깨어남)
4. **Vercel**: 무료 티어로 충분 (대역폭 제한 있음)

### 권장 사항

- **소규모 사용 (100명 이하)**: 현재 설정으로 충분
- **중규모 사용 (100-500명)**: 
  - Railway Pro 플랜 고려 (월 $5)
  - 또는 Render 무료 티어 + MongoDB Atlas 무료 티어
- **대규모 사용 (500명 이상)**: 
  - MongoDB Atlas 유료 플랜 고려
  - 백엔드 서버 확장 (Railway Pro 또는 Render Pro)

---

## 7️⃣ 보안 고려사항

1. **MongoDB Atlas**: 
   - 네트워크 접근을 특정 IP로 제한 권장
   - 강력한 비밀번호 사용

2. **환경 변수**: 
   - GitHub에 `.env` 파일 커밋하지 않기
   - `.gitignore`에 `.env` 포함 확인

3. **API 보안**: 
   - 필요 시 인증 추가 (JWT 등)
   - Rate limiting 추가 고려

---

## 8️⃣ 모니터링

### Railway
- 대시보드에서 로그 확인
- 메트릭 모니터링

### Render
- 대시보드에서 로그 확인
- 알림 설정 가능

### Vercel
- Analytics 사용 가능 (무료 티어)
- 로그 확인 가능

---

## ✅ 완료 체크리스트

- [ ] MongoDB Atlas 클러스터 생성 및 연결 문자열 획득
- [ ] 백엔드 배포 (Railway 또는 Render)
- [ ] 백엔드 환경 변수 설정
- [ ] 백엔드 도메인 확인
- [ ] 프론트엔드 배포 (Vercel)
- [ ] 프론트엔드 환경 변수 설정 (API URL)
- [ ] 전체 시스템 테스트
- [ ] 도메인 연결 (선택사항)

---

## 📞 지원

문제가 발생하면:
1. 로그 확인 (Railway/Render/Vercel 대시보드)
2. MongoDB Atlas 연결 상태 확인
3. 환경 변수 확인
4. GitHub Issues에 문제 보고
