# ⚡ 빠른 외부 접속 설정 (5분)

로컬 서버를 외부에서 접속할 수 있게 만드는 가장 빠른 방법입니다.

---

## 🎯 ngrok 사용 (가장 빠름)

### 1단계: ngrok 다운로드 및 설치

**옵션 A: 직접 다운로드**
1. [ngrok.com/download](https://ngrok.com/download) 접속
2. Windows 다운로드
3. 압축 해제 후 `ngrok.exe`를 프로젝트 폴더에 복사

**옵션 B: Chocolatey 사용**
```powershell
choco install ngrok
```

### 2단계: ngrok 계정 생성 (무료, 1분)

1. [ngrok.com](https://ngrok.com/) 접속
2. "Sign up" 클릭
3. 이메일로 가입 (Google/GitHub 로그인 가능)
4. 대시보드에서 **authtoken** 복사

### 3단계: ngrok 인증

```powershell
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### 4단계: 프론트엔드 터널 실행

**새 PowerShell 터미널 열기:**
```powershell
# ngrok.exe가 있는 폴더로 이동하거나 전체 경로 사용
ngrok http 5173
```

**출력:**
```
Forwarding  https://abc123-def456.ngrok-free.app -> http://localhost:5173
```

이 `https://abc123-def456.ngrok-free.app` 링크를 외부에서 사용하세요!

### 5단계: 백엔드 터널 실행

**또 다른 새 PowerShell 터널:**
```powershell
ngrok http 3000
```

**출력:**
```
Forwarding  https://xyz789-abc123.ngrok-free.app -> http://localhost:3000
```

### 6단계: 프론트엔드 환경 변수 업데이트

백엔드 ngrok 링크를 프론트엔드에 설정:

```powershell
# 프로젝트 루트 폴더에서
@"
VITE_API_URL=https://xyz789-abc123.ngrok-free.app/api
"@ | Out-File -FilePath .env -Encoding utf8 -Force
```

**⚠️ 중요:** `xyz789-abc123.ngrok-free.app`를 실제 백엔드 ngrok 링크로 교체!

### 7단계: 프론트엔드 재시작

프론트엔드 개발 서버를 재시작하세요:
1. 프론트엔드 터미널에서 `Ctrl+C`로 중지
2. `npm run dev` 다시 실행

---

## 📋 전체 실행 순서 (5개 터미널)

**터미널 1: 백엔드 서버**
```powershell
cd server
npm start
```

**터미널 2: 프론트엔드 서버**
```powershell
npm run dev
```

**터미널 3: 프론트엔드 ngrok**
```powershell
ngrok http 5173
```

**터미널 4: 백엔드 ngrok**
```powershell
ngrok http 3000
```

**터미널 5: 환경 변수 설정 (한 번만)**
```powershell
# 백엔드 ngrok 링크 확인 후 설정
@"
VITE_API_URL=https://백엔드-ngrok-링크/api
"@ | Out-File -FilePath .env -Encoding utf8 -Force
```

---

## 🌐 외부 접속 링크

설정이 완료되면:
- **프론트엔드 링크**: 터미널 3에서 표시된 ngrok 링크
- 예: `https://abc123-def456.ngrok-free.app`

이 링크를 다른 사람에게 공유하거나 모바일에서 접속할 수 있습니다!

---

## ⚠️ 주의사항

1. **링크 변경**: ngrok을 재시작하면 링크가 변경됩니다
2. **세션 제한**: 무료 버전은 2시간 후 자동 종료
3. **ngrok 유지**: ngrok 터미널을 닫으면 외부 접속이 불가능합니다

---

## 🔄 영구적인 링크가 필요하다면

실제 배포를 진행하세요:
- **백엔드**: Railway 또는 Render (무료)
- **프론트엔드**: Vercel (무료)

자세한 내용은 [DEPLOYMENT.md](./DEPLOYMENT.md) 참조
