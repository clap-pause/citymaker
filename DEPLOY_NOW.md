# 🚀 지금 바로 배포하기

실제 배포를 진행하고, 배포 후에도 코드 수정이 가능하도록 설정합니다.

---

## ✅ 배포 후 수정 가능 여부

**네, 가능합니다!** 
- GitHub에 코드를 푸시하면 자동으로 재배포됩니다
- 코드 수정 → GitHub 푸시 → 자동 재배포 (약 2-3분)

---

## 📋 사전 준비 체크리스트

- [x] MongoDB Atlas 설정 완료 ✅
- [ ] GitHub 계정 (무료)
- [ ] GitHub 저장소 생성
- [ ] Railway 계정 (백엔드 배포, 무료)
- [ ] Vercel 계정 (프론트엔드 배포, 무료)

---

## 1️⃣ GitHub 저장소 설정

### 1.1 GitHub 저장소 생성

1. [GitHub.com](https://github.com) 로그인
2. 우측 상단 "+" → "New repository" 클릭
3. 저장소 설정:
   - **Repository name**: `city-calculator` (또는 원하는 이름)
   - **Description**: "도시 개발 시뮬레이터"
   - **Visibility**: Public 또는 Private 선택
   - **Initialize this repository with**: 체크박스 모두 해제
4. "Create repository" 클릭

### 1.2 로컬 프로젝트를 GitHub에 푸시

**Git이 설치되어 있지 않은 경우:**
1. [Git 다운로드](https://git-scm.com/download/win)
2. 설치 후 PowerShell 재시작

**PowerShell에서 실행:**

```powershell
# 프로젝트 루트 폴더에서

# Git 초기화 (아직 안 했다면)
git init

# .gitignore 확인 (이미 있음)
# .env 파일이 커밋되지 않도록 확인

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: City Calculator"

# GitHub 저장소 연결 (YOUR_USERNAME과 REPO_NAME을 실제 값으로 교체)
git remote add origin https://github.com/YOUR_USERNAME/city-calculator.git

# 브랜치 이름을 main으로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

**⚠️ 중요:** 
- `.env` 파일은 `.gitignore`에 포함되어 있어 자동으로 제외됩니다
- 환경 변수는 배포 플랫폼에서 직접 설정합니다

---

## 2️⃣ 백엔드 배포 (Railway)

### 2.1 Railway 계정 생성

1. [Railway.app](https://railway.app) 접속
2. "Start a New Project" 클릭
3. "Login with GitHub" 클릭하여 GitHub로 로그인

### 2.2 프로젝트 배포

1. "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. GitHub 저장소 선택 (`city-calculator`)
4. "Deploy Now" 클릭

### 2.3 환경 변수 설정

1. 프로젝트 대시보드에서 "Variables" 탭 클릭
2. "New Variable" 클릭하여 다음 추가:

**변수 1:**
- **Key**: `MONGODB_URI`
- **Value**: `mongodb+srv://nittygritty2003i_db_user:비밀번호@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority`
  - ⚠️ 비밀번호를 실제 비밀번호로 교체하세요!

**변수 2:**
- **Key**: `PORT`
- **Value**: `3000`

3. "Add" 클릭

### 2.4 서비스 설정 (중요!)

1. 프로젝트 대시보드에서 서비스 클릭
2. "Settings" 탭 클릭
3. "Root Directory" 설정:
   - **Root Directory**: `server`
4. "Deploy Command" 확인:
   - 자동으로 `npm install` 후 `npm start` 실행됨
5. 저장

### 2.5 도메인 생성

1. "Settings" 탭에서 "Generate Domain" 클릭
2. 생성된 도메인 복사 (예: `city-calculator-api.railway.app`)
3. 이 도메인을 메모해두세요! (프론트엔드 설정에 필요)

---

## 3️⃣ 프론트엔드 배포 (Vercel)

### 3.1 Vercel 계정 생성

1. [Vercel.com](https://vercel.com) 접속
2. "Sign Up" 클릭
3. "Continue with GitHub" 클릭하여 GitHub로 로그인

### 3.2 프로젝트 배포

1. 대시보드에서 "Add New Project" 클릭
2. GitHub 저장소 선택 (`city-calculator`)
3. 프로젝트 설정:
   - **Framework Preset**: Vite (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동)
   - **Output Directory**: `dist` (자동)
4. "Environment Variables" 섹션으로 스크롤

### 3.3 환경 변수 설정

1. "Environment Variables" 섹션에서:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://city-calculator-api.railway.app/api`
     - ⚠️ Railway에서 생성한 백엔드 도메인으로 교체하세요!
2. "Add" 클릭

### 3.4 배포 실행

1. "Deploy" 버튼 클릭
2. 배포 완료 대기 (약 2-3분)
3. 배포 완료 후 생성된 도메인 확인 (예: `city-calculator.vercel.app`)

---

## ✅ 배포 완료!

이제 다음 링크로 접속할 수 있습니다:
- **프론트엔드**: `https://city-calculator.vercel.app`
- **백엔드 API**: `https://city-calculator-api.railway.app/api`

---

## 🔄 코드 수정 후 재배포

### 수정 방법

1. **로컬에서 코드 수정**
2. **변경사항 커밋 및 푸시:**

```powershell
git add .
git commit -m "설명: 변경 내용"
git push origin main
```

3. **자동 재배포:**
   - Railway: GitHub 푸시 시 자동으로 재배포 (약 2-3분)
   - Vercel: GitHub 푸시 시 자동으로 재배포 (약 1-2분)

### 재배포 확인

- **Railway**: 대시보드에서 "Deployments" 탭에서 진행 상황 확인
- **Vercel**: 대시보드에서 배포 상태 확인

---

## 🔧 환경 변수 수정

### Railway (백엔드)

1. Railway 대시보드 → 프로젝트 → "Variables" 탭
2. 변수 수정 또는 추가
3. 자동으로 재배포됨

### Vercel (프론트엔드)

1. Vercel 대시보드 → 프로젝트 → "Settings" → "Environment Variables"
2. 변수 수정 또는 추가
3. "Redeploy" 클릭하여 재배포

---

## 📝 MongoDB Atlas 네트워크 설정

배포된 서버의 IP 주소를 MongoDB Atlas에 추가해야 할 수 있습니다.

### Railway IP 확인

1. Railway 대시보드 → 프로젝트 → "Settings" → "Networking"
2. IP 주소 확인 (없는 경우 "Allow Access from Anywhere" 사용)

### MongoDB Atlas 설정

1. MongoDB Atlas → "Network Access"
2. "Add IP Address" 클릭
3. Railway IP 추가 또는 "Allow Access from Anywhere" 선택

---

## ❌ 문제 해결

### 배포 실패

**Railway:**
- 로그 확인: 대시보드 → "Deployments" → 로그 확인
- 환경 변수 확인: `MONGODB_URI`가 올바른지 확인
- Root Directory 확인: `server`로 설정되어 있는지 확인

**Vercel:**
- 로그 확인: 대시보드 → "Deployments" → 로그 확인
- 환경 변수 확인: `VITE_API_URL`이 올바른지 확인
- Build 오류: 로컬에서 `npm run build` 테스트

### API 연결 실패

1. 백엔드 도메인이 올바른지 확인
2. CORS 설정 확인 (`server/server.js`에서 `app.use(cors())` 확인)
3. MongoDB Atlas 네트워크 접근 설정 확인

---

## 🎯 다음 단계

1. GitHub 저장소 생성 및 코드 푸시
2. Railway로 백엔드 배포
3. Vercel로 프론트엔드 배포
4. 배포된 링크로 접속 테스트
5. 코드 수정 → 푸시 → 자동 재배포 확인

---

**추가 도움이 필요하면 알려주세요!**
