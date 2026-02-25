# ✅ Railway 백엔드 배포 완료!

Railway에서 백엔드 도메인이 생성되었습니다:
**`web-production-4d833.up.railway.app`**

---

## 🔍 확인 사항

### 1. 백엔드 API 테스트

브라우저에서 다음 주소로 접속하여 테스트하세요:
```
https://web-production-4d833.up.railway.app/api/health
```

**성공 응답:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

### 2. Railway 환경 변수 확인

Railway 대시보드에서:
1. 프로젝트 → "Variables" 탭 확인
2. 다음 변수가 설정되어 있는지 확인:
   - `MONGODB_URI`: MongoDB 연결 문자열
   - `PORT`: `3000` (또는 Railway가 자동 설정)

---

## 🚀 다음 단계: 프론트엔드 배포 (Vercel)

### 1단계: Vercel 계정 생성

1. [Vercel.com](https://vercel.com) 접속
2. "Sign Up" 클릭
3. "Continue with GitHub" 클릭하여 GitHub로 로그인

### 2단계: 프로젝트 배포

1. Vercel 대시보드에서 "Add New Project" 클릭
2. GitHub 저장소 선택 (`city-maker`)
3. 프로젝트 설정:
   - **Framework Preset**: Vite (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동)
   - **Output Directory**: `dist` (자동)

### 3단계: 환경 변수 설정 (중요!)

1. "Environment Variables" 섹션으로 스크롤
2. "Add" 클릭하여 다음 변수 추가:

**변수 설정:**
- **Key**: `VITE_API_URL`
- **Value**: `https://web-production-4d833.up.railway.app/api`
- **Environment**: Production, Preview, Development 모두 선택

3. "Add" 클릭

### 4단계: 배포 실행

1. "Deploy" 버튼 클릭
2. 배포 완료 대기 (약 2-3분)
3. 배포 완료 후 생성된 도메인 확인 (예: `city-maker.vercel.app`)

---

## ✅ 배포 완료 후

### 접속 링크

- **프론트엔드**: `https://city-maker.vercel.app` (Vercel에서 생성된 도메인)
- **백엔드 API**: `https://web-production-4d833.up.railway.app/api`

### 테스트

1. 프론트엔드 링크로 접속
2. 건물 배치 기능 테스트
3. 자동 저장 기능 테스트
4. 브라우저 개발자 도구(F12) → Network 탭에서 API 요청 확인

---

## 🔄 코드 수정 후 재배포

### 로컬에서 수정

```powershell
# 코드 수정 후
git add .
git commit -m "변경 내용 설명"
git push origin main
```

### 자동 재배포

- **Railway**: GitHub 푸시 시 자동 재배포 (약 2-3분)
- **Vercel**: GitHub 푸시 시 자동 재배포 (약 1-2분)

---

## 🔧 문제 해결

### 백엔드가 응답하지 않는 경우

1. **Railway 대시보드 확인:**
   - "Deployments" 탭에서 배포 상태 확인
   - 로그 확인하여 오류 메시지 확인

2. **환경 변수 확인:**
   - `MONGODB_URI`가 올바른지 확인
   - MongoDB Atlas 네트워크 접근 설정 확인

3. **도메인 확인:**
   - `https://web-production-4d833.up.railway.app/api/health` 접속 테스트

### 프론트엔드가 백엔드에 연결되지 않는 경우

1. **환경 변수 확인:**
   - Vercel → 프로젝트 → Settings → Environment Variables
   - `VITE_API_URL`이 `https://web-production-4d833.up.railway.app/api`로 설정되어 있는지 확인

2. **CORS 확인:**
   - `server/server.js`에서 `app.use(cors())`가 설정되어 있는지 확인

3. **재배포:**
   - Vercel에서 "Redeploy" 클릭

---

## 📝 체크리스트

- [x] Railway 백엔드 배포 완료
- [x] 백엔드 도메인 확인: `web-production-4d833.up.railway.app`
- [ ] 백엔드 API 테스트 (`/api/health`)
- [ ] Vercel 계정 생성
- [ ] Vercel로 프론트엔드 배포
- [ ] 환경 변수 설정 (`VITE_API_URL`)
- [ ] 전체 시스템 테스트

---

**다음 단계: Vercel로 프론트엔드 배포를 진행하세요!**
