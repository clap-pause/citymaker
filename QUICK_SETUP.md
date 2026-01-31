# ⚡ 빠른 설정 가이드

현재 받으신 MongoDB 연결 문자열을 바로 설정하는 방법입니다.

---

## 📋 받으신 연결 문자열

```
mongodb+srv://nittygritty2003i_db_user:<db_password>@cluster0.sbashft.mongodb.net/?appName=Cluster0
```

---

## 🎯 3단계로 완료하기

### 1단계: 비밀번호 확인

**방법 A: MongoDB Atlas에서 확인**
1. [MongoDB Atlas](https://cloud.mongodb.com/) 로그인
2. 왼쪽 메뉴 **"Security"** → **"Database Access"** 클릭
3. 사용자 목록에서 `nittygritty2003i_db_user` 찾기
4. 비밀번호를 확인하세요

**방법 B: 비밀번호를 모르는 경우**
1. 사용자 옆 **"..."** 메뉴 클릭
2. **"Edit"** 클릭
3. 새 비밀번호 설정 (반드시 복사해두세요!)
4. **"Update User"** 클릭

---

### 2단계: 연결 문자열 완성

받으신 연결 문자열을 다음과 같이 수정하세요:

**원본:**
```
mongodb+srv://nittygritty2003i_db_user:<db_password>@cluster0.sbashft.mongodb.net/?appName=Cluster0
```

**수정 후 (예시):**
```
mongodb+srv://nittygritty2003i_db_user:MyPassword123@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority
```

**변경 사항:**
1. `<db_password>` → 실제 비밀번호로 교체
2. `/city-calculator` 추가 (데이터베이스 이름)
3. `?appName=Cluster0` → `?retryWrites=true&w=majority` (Node.js 권장 옵션)

---

### 3단계: 로컬에 설정

#### Windows PowerShell 사용 (권장)

```powershell
# server 폴더로 이동
cd server

# .env 파일 생성 (비밀번호 부분을 실제 비밀번호로 교체하세요!)
@"
MONGODB_URI=mongodb+srv://nittygritty2003i_db_user:여기에비밀번호입력@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority
PORT=3000
"@ | Out-File -FilePath .env -Encoding utf8
```

#### Windows CMD 사용

```cmd
cd server
echo MONGODB_URI=mongodb+srv://nittygritty2003i_db_user:여기에비밀번호입력@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true^&w=majority > .env
echo PORT=3000 >> .env
```

#### 텍스트 에디터 사용 (가장 쉬운 방법)

1. `server` 폴더로 이동
2. 새 파일 생성: `.env` (파일명 앞에 점 포함, 확장자 없음)
3. 다음 내용 입력 (비밀번호 부분을 실제 비밀번호로 교체):

```
MONGODB_URI=mongodb+srv://nittygritty2003i_db_user:여기에비밀번호입력@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority
PORT=3000
```

4. 저장

---

## ⚠️ 비밀번호에 특수문자가 있는 경우

비밀번호에 `@`, `#`, `%`, `&` 등이 있으면 URL 인코딩이 필요합니다.

**예시:**
- 비밀번호: `MyPass@123#`
- 인코딩: `MyPass%40123%23`
- 연결 문자열: `mongodb+srv://nittygritty2003i_db_user:MyPass%40123%23@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority`

**온라인 인코더:** [URLEncoder.org](https://www.urlencoder.org/)

---

## ✅ 연결 테스트

### 1. 서버 실행

```bash
cd server
npm start
```

### 2. 성공 메시지 확인

다음과 같은 메시지가 보이면 성공입니다:
```
✅ MongoDB 연결 성공
🚀 서버가 포트 3000에서 실행 중입니다
📍 Health check: http://localhost:3000/api/health
```

### 3. 브라우저에서 확인

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

**원인:** 비밀번호가 잘못됨

**해결:**
1. Database Access에서 비밀번호 다시 확인
2. 비밀번호에 특수문자가 있으면 URL 인코딩 적용
3. `.env` 파일의 비밀번호 부분 다시 확인

### 오류: "MongoServerSelectionError"

**원인:** 네트워크 접근 설정이 안 됨

**해결:**
1. MongoDB Atlas → "Network Access" 메뉴
2. "Add IP Address" 클릭
3. "Allow Access from Anywhere" 선택
4. "Confirm" 클릭

### 오류: "Invalid connection string"

**원인:** 연결 문자열 형식 오류

**해결:**
1. 연결 문자열에 모든 부분이 포함되어 있는지 확인
2. `/city-calculator`가 포함되어 있는지 확인
3. 특수문자 URL 인코딩 확인

---

## 📋 완료 체크리스트

- [ ] MongoDB Atlas에서 비밀번호 확인 완료
- [ ] 연결 문자열에서 `<db_password>`를 실제 비밀번호로 교체 완료
- [ ] 비밀번호 특수문자 URL 인코딩 완료 (필요한 경우)
- [ ] 연결 문자열 끝에 `/city-calculator` 추가 완료
- [ ] `server/.env` 파일에 연결 문자열 저장 완료
- [ ] 서버 실행 시 "MongoDB 연결 성공" 메시지 확인 완료

---

## 🚀 다음 단계

연결이 성공했다면 프론트엔드도 실행하세요:

```bash
# 터미널 2에서
npm run dev
```

브라우저에서 `http://localhost:5173` 접속하여 앱을 사용하세요!
