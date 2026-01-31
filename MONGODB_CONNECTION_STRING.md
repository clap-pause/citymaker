# 🔗 MongoDB 연결 문자열 설정 가이드

현재 받으신 연결 문자열을 Node.js 프로젝트에 맞게 설정하는 방법입니다.

---

## 📋 현재 연결 문자열

MongoDB Atlas에서 받으신 연결 문자열:
```
mongodb+srv://nittygritty2003i_db_user:<db_password>@cluster0.sbashft.mongodb.net/?appName=Cluster0
```

---

## ✅ Node.js용으로 변환하기

### 1단계: 비밀번호 확인

1. MongoDB Atlas 대시보드 접속
2. 왼쪽 메뉴 **"Security"** → **"Database Access"** 클릭
3. 사용자 `nittygritty2003i_db_user` 찾기
4. 비밀번호를 확인하세요 (비밀번호를 잊으셨다면 새로 생성해야 합니다)

### 2단계: 연결 문자열 수정

받으신 연결 문자열에서:
- `<db_password>` 부분을 실제 비밀번호로 교체
- 데이터베이스 이름 추가 (`/city-calculator`)

**최종 형식:**
```
mongodb+srv://nittygritty2003i_db_user:실제비밀번호@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority
```

---

## ⚠️ 비밀번호에 특수문자가 있는 경우

비밀번호에 다음 특수문자가 있으면 URL 인코딩이 필요합니다:

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
- 연결 문자열: `mongodb+srv://nittygritty2003i_db_user:MyPass%40123%23@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority`

**온라인 인코더 사용:**
- [URLEncoder.org](https://www.urlencoder.org/)에서 비밀번호만 인코딩하세요

---

## 📝 로컬 환경에 설정하기

### Windows (CMD)

```cmd
cd server
echo MONGODB_URI=mongodb+srv://nittygritty2003i_db_user:비밀번호@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true^&w=majority > .env
echo PORT=3000 >> .env
```

### Windows (PowerShell)

```powershell
cd server
@"
MONGODB_URI=mongodb+srv://nittygritty2003i_db_user:비밀번호@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority
PORT=3000
"@ | Out-File -FilePath .env -Encoding utf8
```

### Mac/Linux

```bash
cd server
cat > .env << EOF
MONGODB_URI=mongodb+srv://nittygritty2003i_db_user:비밀번호@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority
PORT=3000
EOF
```

**⚠️ 중요:** `비밀번호` 부분을 실제 비밀번호로 교체하세요!

---

## 🧪 연결 테스트

### 1단계: 서버 실행

```bash
cd server
npm start
```

### 2단계: 성공 메시지 확인

다음과 같은 메시지가 보이면 성공입니다:
```
✅ MongoDB 연결 성공
🚀 서버가 포트 3000에서 실행 중입니다
📍 Health check: http://localhost:3000/api/health
```

### 3단계: 브라우저에서 확인

브라우저에서 `http://localhost:3000/api/health` 접속

**성공 응답:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

---

## ❌ 문제 해결

### 오류: "Authentication failed"

**원인:** 비밀번호가 잘못되었거나 URL 인코딩이 필요함

**해결:**
1. Database Access에서 비밀번호 확인
2. 비밀번호에 특수문자가 있으면 URL 인코딩 적용
3. 연결 문자열에서 비밀번호 부분만 다시 확인

### 오류: "MongoServerSelectionError"

**원인:** 네트워크 접근 설정이 안 됨

**해결:**
1. MongoDB Atlas → "Network Access" 메뉴로 이동
2. "Add IP Address" 클릭
3. "Allow Access from Anywhere" 선택
4. "Confirm" 클릭

### 오류: "Invalid connection string"

**원인:** 연결 문자열 형식 오류

**해결:**
1. 연결 문자열에 모든 부분이 포함되어 있는지 확인:
   - `mongodb+srv://` (프로토콜)
   - `사용자명:비밀번호@` (인증 정보)
   - `cluster0.sbashft.mongodb.net` (호스트)
   - `/city-calculator` (데이터베이스 이름)
   - `?retryWrites=true&w=majority` (옵션)
2. 특수문자 URL 인코딩 확인

---

## 📋 체크리스트

설정이 완료되었는지 확인하세요:

- [ ] MongoDB Atlas에서 비밀번호 확인 완료
- [ ] 연결 문자열에서 `<db_password>`를 실제 비밀번호로 교체 완료
- [ ] 비밀번호 특수문자 URL 인코딩 완료 (필요한 경우)
- [ ] 연결 문자열 끝에 `/city-calculator` 추가 완료
- [ ] `server/.env` 파일에 연결 문자열 저장 완료
- [ ] 서버 실행 시 "MongoDB 연결 성공" 메시지 확인 완료
- [ ] `http://localhost:3000/api/health` 접속 시 정상 응답 확인 완료

---

## 🔒 보안 주의사항

- ⚠️ **절대 GitHub에 `.env` 파일을 커밋하지 마세요!**
- ⚠️ **연결 문자열에 비밀번호가 포함되어 있으므로 안전하게 보관하세요**
- ⚠️ **`.gitignore` 파일에 `.env`가 포함되어 있는지 확인하세요**

---

완료되면 프론트엔드도 실행해서 전체 시스템을 테스트하세요!

```bash
# 터미널 2에서
npm run dev
```

브라우저에서 `http://localhost:5173` 접속하여 앱이 정상 작동하는지 확인하세요.
