# 📚 MongoDB Atlas 빠른 설정 가이드

이 문서는 MongoDB Atlas를 처음 사용하는 분들을 위한 단계별 가이드입니다.

## 🎯 목표

MongoDB Atlas 무료 계정을 생성하고, 연결 문자열을 얻어서 로컬 개발 환경에 설정하는 것입니다.

---

## ⚡ 빠른 시작 (5분)

### 1. 계정 생성
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 접속
2. "Try Free" 클릭
3. 이메일, 비밀번호 입력 후 계정 생성
4. 이메일 인증 완료

### 2. 클러스터 생성
1. "Build a Database" 클릭
2. "Free" (M0) 선택
3. 지역 선택 (가장 가까운 곳)
4. "Create Cluster" 클릭
5. 3-5분 대기

### 3. 사용자 생성
1. 왼쪽 메뉴 "Database Access" 클릭
2. "Add New Database User" 클릭
3. 사용자명 입력 (예: `city-user`)
4. 비밀번호 생성 (복사해두세요!)
5. "Atlas admin" 선택
6. "Add User" 클릭

### 4. 네트워크 접근 설정
1. 왼쪽 메뉴 "Network Access" 클릭
2. "Add IP Address" 클릭
3. "Allow Access from Anywhere" 클릭
4. "Confirm" 클릭

### 5. 연결 문자열 가져오기
1. 왼쪽 메뉴 "Database" 클릭
2. "Connect" 버튼 클릭
3. "Connect your application" 선택
4. Driver: "Node.js", Version: "5.5 or later"
5. 연결 문자열 복사
6. `<username>`과 `<password>`를 실제 값으로 교체
7. 끝에 `/city-calculator` 추가

### 6. 로컬에 설정
```bash
cd server
echo MONGODB_URI=복사한-연결-문자열 > .env
echo PORT=3000 >> .env
```

---

## 📝 상세 가이드

더 자세한 설명이 필요하면 [DEPLOYMENT.md](./DEPLOYMENT.md)의 "1️⃣ MongoDB Atlas 설정" 섹션을 참조하세요.

---

## ❓ 자주 묻는 질문

**Q: 무료 티어의 제한은?**
- 저장공간: 512MB
- 최대 연결 수: 500개
- 충분히 사용 가능합니다!

**Q: 비밀번호를 잊어버렸어요**
- Database Access에서 사용자를 삭제하고 새로 생성하세요

**Q: 연결이 안 돼요**
- Network Access에서 IP 주소가 추가되었는지 확인
- 연결 문자열의 사용자명/비밀번호가 올바른지 확인
- 비밀번호 특수문자 URL 인코딩 확인

**Q: 비밀번호에 특수문자가 있어요**
- URL 인코딩이 필요합니다:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - `&` → `%26`

---

## 🔗 유용한 링크

- [MongoDB Atlas 공식 문서](https://docs.atlas.mongodb.com/)
- [연결 문자열 가이드](https://docs.mongodb.com/manual/reference/connection-string/)
- [URL 인코더](https://www.urlencoder.org/)

---

## ✅ 체크리스트

설정이 완료되었는지 확인하세요:

- [ ] MongoDB Atlas 계정 생성 완료
- [ ] 클러스터 생성 완료 (상태: Idle)
- [ ] 데이터베이스 사용자 생성 완료
- [ ] 네트워크 접근 설정 완료 (IP 주소 추가)
- [ ] 연결 문자열 복사 및 수정 완료
- [ ] 로컬 `.env` 파일에 연결 문자열 설정 완료
- [ ] 서버 실행 시 "MongoDB 연결 성공" 메시지 확인

---

완료되면 [DEPLOYMENT.md](./DEPLOYMENT.md)의 다음 단계로 진행하세요!
