# Firebase 접속 코드(수동 변경) 설정

이 프로젝트는 서버에서 `Cloud Firestore`의 문서 값을 읽어서 접속 코드를 검증할 수 있습니다.

## 1) Firestore에 접속 PIN 문서 만들기

- 컬렉션: `pw`
- 문서 ID: `pin_num`
- 필드:
  - `pin_num` (string 또는 number): 현재 접속 PIN (로그인 비밀번호)
  - `updatedAt` (timestamp): 변경 시각 (선택)

예시:

```json
{
  "pin_num": "citytest1234",
  "updatedAt": "<Firestore Timestamp>"
}
```

## 2) 서버 환경변수 추가 (`server/.env`)

Firebase Admin SDK 서비스 계정(서버용) 정보를 환경변수로 넣어야 합니다.

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

`FIREBASE_PRIVATE_KEY`는 줄바꿈이 `\n` 형태로 들어가도 됩니다. 서버에서 자동으로 실제 줄바꿈으로 변환합니다.
# 🔧 .env 파일 설정 가이드

## 현재 상황

포트 3000을 사용하던 프로세스를 종료했습니다. 이제 MongoDB 연결 문자열을 설정해야 합니다.

## 설정 방법

### 1. server 폴더로 이동

```powershell
cd "C:\Users\nitty\OneDrive\바탕 화면\CLAP\city calculator\server"
```

### 2. .env 파일 생성/수정

**방법 A: PowerShell 명령어 사용**

```powershell
# 비밀번호 부분을 실제 비밀번호로 교체하세요!
@"
MONGODB_URI=mongodb+srv://nittygritty2003i_db_user:여기에비밀번호입력@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority
PORT=3000
"@ | Out-File -FilePath .env -Encoding utf8 -Force
```

**방법 B: 텍스트 에디터 사용 (권장)**

1. `server` 폴더로 이동
2. `.env` 파일 열기 (없으면 새로 생성)
3. 다음 내용 입력 (비밀번호 부분을 실제 비밀번호로 교체):

```
MONGODB_URI=mongodb+srv://nittygritty2003i_db_user:여기에비밀번호입력@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority
PORT=3000
```

4. 저장

## ⚠️ 중요 사항

1. **비밀번호 확인**: MongoDB Atlas → "Database Access"에서 `nittygritty2003i_db_user`의 비밀번호 확인
2. **비밀번호 교체**: `여기에비밀번호입력` 부분을 실제 비밀번호로 교체
3. **특수문자 처리**: 비밀번호에 `@`, `#`, `%`, `&` 등이 있으면 URL 인코딩 필요
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`
   - `&` → `%26`

## ✅ 설정 확인

.env 파일이 올바르게 설정되었는지 확인:

```powershell
Get-Content .env
```

다음과 같이 표시되어야 합니다:
```
MONGODB_URI=mongodb+srv://nittygritty2003i_db_user:실제비밀번호@cluster0.sbashft.mongodb.net/city-calculator?retryWrites=true&w=majority
PORT=3000
```

## 🚀 서버 실행

설정이 완료되면 서버를 실행하세요:

```powershell
npm start
```

성공 메시지:
```
✅ MongoDB 연결 성공
🚀 서버가 포트 3000에서 실행 중입니다
```
