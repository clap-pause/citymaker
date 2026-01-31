# 🌐 외부 접속 설정 가이드

로컬에서 실행 중인 서버를 외부에서 접속할 수 있게 만드는 방법입니다.

---

## 🎯 방법 선택

### 방법 1: ngrok 사용 (빠른 설정, 무료) ⭐ 권장
- **장점**: 5분 내 설정 가능, 무료
- **단점**: 무료 버전은 링크가 매번 변경됨, 세션당 2시간 제한

### 방법 2: 실제 배포 (영구적, 무료)
- **장점**: 영구적인 링크, 안정적
- **단점**: 설정 시간이 더 걸림 (약 30분)

---

## 🚀 방법 1: ngrok 사용 (빠른 설정)

### 1단계: ngrok 설치

**Windows:**
1. [ngrok 다운로드](https://ngrok.com/download) 접속
2. Windows용 다운로드
3. 압축 해제 후 `ngrok.exe`를 프로젝트 폴더나 PATH에 추가

**또는 Chocolatey 사용:**
```powershell
choco install ngrok
```

**또는 Scoop 사용:**
```powershell
scoop install ngrok
```

### 2단계: ngrok 계정 생성 (무료)

1. [ngrok.com](https://ngrok.com/) 접속
2. "Sign up" 클릭하여 무료 계정 생성
3. 이메일 인증 완료
4. 대시보드에서 **authtoken** 복사

### 3단계: ngrok 인증

```powershell
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 4단계: 프론트엔드 터널 생성

**새 터미널에서:**
```powershell
ngrok http 5173
```

**출력 예시:**
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:5173
```

이 `https://abc123.ngrok-free.app` 링크를 외부에서 사용할 수 있습니다!

### 5단계: 백엔드 터널 생성 (별도 터미널)

**또 다른 새 터미널에서:**
```powershell
ngrok http 3000
```

**출력 예시:**
```
Forwarding  https://xyz789.ngrok-free.app -> http://localhost:3000
```

### 6단계: 프론트엔드 환경 변수 업데이트

프론트엔드가 백엔드 ngrok 링크를 사용하도록 설정:

```powershell
# 루트 폴더에서
@"
VITE_API_URL=https://xyz789.ngrok-free.app/api
"@ | Out-File -FilePath .env -Encoding utf8 -Force
```

**⚠️ 중요:** `xyz789.ngrok-free.app`를 실제 백엔드 ngrok 링크로 교체하세요!

### 7단계: 프론트엔드 재시작

프론트엔드 개발 서버를 재시작하세요 (Ctrl+C 후 `npm run dev`)

---

## 📋 전체 실행 순서

**터미널 1: 백엔드 서버**
```powershell
cd server
npm start
```

**터미널 2: 프론트엔드 서버**
```powershell
npm run dev
```

**터미널 3: 프론트엔드 ngrok 터널**
```powershell
ngrok http 5173
```

**터미널 4: 백엔드 ngrok 터널**
```powershell
ngrok http 3000
```

**터미널 5: 환경 변수 업데이트 (한 번만)**
```powershell
# 백엔드 ngrok 링크를 .env에 설정
@"
VITE_API_URL=https://백엔드-ngrok-링크/api
"@ | Out-File -FilePath .env -Encoding utf8 -Force
```

---

## ⚠️ ngrok 무료 버전 제한사항

1. **링크 변경**: ngrok을 재시작하면 링크가 변경됩니다
2. **세션 제한**: 무료 버전은 세션당 2시간 제한
3. **동시 연결**: 무료 버전은 1개 터널만 가능 (유료는 여러 개)

**해결책:**
- ngrok을 계속 실행 상태로 유지
- 또는 실제 배포 (방법 2) 사용

---

## 🌍 방법 2: 실제 배포 (영구적 링크)

영구적인 링크를 원한다면 실제 배포를 진행하세요.

### 빠른 배포 순서

1. **MongoDB Atlas**: 이미 설정 완료 ✅
2. **백엔드 배포**: Railway 또는 Render
3. **프론트엔드 배포**: Vercel

자세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

---

## 🔧 문제 해결

### ngrok이 작동하지 않는 경우

1. **인증 토큰 확인:**
   ```powershell
   ngrok config check
   ```

2. **방화벽 확인**: Windows 방화벽이 ngrok을 차단하지 않는지 확인

3. **포트 확인**: 5173, 3000 포트가 사용 중인지 확인

### CORS 오류

백엔드 서버의 CORS 설정이 ngrok 도메인을 허용하도록 설정되어 있는지 확인:

`server/server.js`에서:
```javascript
app.use(cors()); // 모든 도메인 허용 (개발용)
```

---

## 📱 모바일에서 테스트

ngrok 링크를 모바일 브라우저에서 열면 모바일에서도 테스트할 수 있습니다!

---

## ✅ 체크리스트

- [ ] ngrok 설치 완료
- [ ] ngrok 계정 생성 및 인증 완료
- [ ] 프론트엔드 ngrok 터널 실행 (포트 5173)
- [ ] 백엔드 ngrok 터널 실행 (포트 3000)
- [ ] 프론트엔드 .env 파일에 백엔드 ngrok 링크 설정
- [ ] 프론트엔드 재시작
- [ ] 외부에서 프론트엔드 ngrok 링크 접속 테스트

---

**추천:** 빠른 테스트는 ngrok, 영구적 사용은 실제 배포를 권장합니다!
