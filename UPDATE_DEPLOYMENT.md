# 🔄 배포 업데이트 가이드

배포된 사이트에 변경사항을 반영하는 방법입니다.

---

## 🚀 빠른 업데이트 (자동 배포)

GitHub에 푸시하면 Railway와 Vercel이 자동으로 재배포합니다!

### 1단계: 변경사항 확인

```powershell
# 현재 변경사항 확인
git status
```

### 2단계: 변경사항 커밋

```powershell
# 모든 변경사항 추가
git add .

# 커밋 메시지 작성
git commit -m "업데이트: 변경 내용 설명"
```

예시:
```powershell
git commit -m "업데이트: 맵 배치 모드 레이아웃 개선"
git commit -m "수정: 지표 표시 가운데 정렬"
git commit -m "개선: 스크롤 최소화"
```

### 3단계: GitHub에 푸시

```powershell
git push origin main
```

### 4단계: 자동 재배포 대기

- **Railway (백엔드)**: 약 2-3분 소요
- **Vercel (프론트엔드)**: 약 1-2분 소요

---

## 📊 배포 상태 확인

### Railway (백엔드)

1. [Railway 대시보드](https://railway.app) 접속
2. 프로젝트 선택
3. "Deployments" 탭에서 진행 상황 확인
4. ✅ "Active" 상태가 되면 배포 완료

### Vercel (프론트엔드)

1. [Vercel 대시보드](https://vercel.com) 접속
2. 프로젝트 선택
3. "Deployments" 탭에서 진행 상황 확인
4. ✅ "Ready" 상태가 되면 배포 완료

---

## 🔧 수동 재배포 (필요한 경우)

### Railway 수동 재배포

1. Railway 대시보드 → 프로젝트
2. "Deployments" 탭
3. 최신 배포 옆 "..." 메뉴 클릭
4. "Redeploy" 선택

### Vercel 수동 재배포

1. Vercel 대시보드 → 프로젝트
2. "Deployments" 탭
3. 최신 배포 옆 "..." 메뉴 클릭
4. "Redeploy" 선택

---

## ⚙️ 환경 변수 업데이트

### Railway (백엔드)

1. Railway 대시보드 → 프로젝트
2. "Variables" 탭 클릭
3. 변수 수정 또는 추가
4. 자동으로 재배포됨

### Vercel (프론트엔드)

1. Vercel 대시보드 → 프로젝트
2. "Settings" → "Environment Variables"
3. 변수 수정 또는 추가
4. "Save" 클릭
5. "Deployments" 탭에서 "Redeploy" 클릭

---

## 🔍 업데이트 확인 방법

### 1. 브라우저 캐시 클리어

업데이트가 반영되지 않으면 브라우저 캐시를 지워보세요:

**Chrome/Edge:**
- `Ctrl + Shift + Delete` → 캐시 삭제
- 또는 `Ctrl + F5` (강력 새로고침)

**Firefox:**
- `Ctrl + Shift + Delete` → 캐시 삭제
- 또는 `Ctrl + F5`

### 2. 시크릿 모드에서 확인

시크릿 모드(Incognito)에서 접속하여 변경사항 확인

### 3. 배포 로그 확인

- Railway: 대시보드 → "Deployments" → 로그 확인
- Vercel: 대시보드 → "Deployments" → 로그 확인

---

## 📝 업데이트 체크리스트

- [ ] 로컬에서 코드 수정 완료
- [ ] 로컬에서 테스트 완료 (`npm run dev`)
- [ ] 변경사항 커밋 (`git commit`)
- [ ] GitHub에 푸시 (`git push`)
- [ ] Railway 배포 상태 확인
- [ ] Vercel 배포 상태 확인
- [ ] 배포된 사이트에서 변경사항 확인

---

## ⚠️ 주의사항

1. **환경 변수 변경 시**: 재배포가 필요할 수 있습니다
2. **빌드 오류**: 로컬에서 `npm run build` 테스트 권장
3. **API 연결**: 백엔드 재배포 후 프론트엔드도 재배포 필요할 수 있음

---

## 🆘 문제 해결

### 배포가 실패하는 경우

1. **로컬 빌드 테스트:**
   ```powershell
   npm run build
   ```

2. **로그 확인:**
   - Railway: 대시보드 → "Deployments" → 로그
   - Vercel: 대시보드 → "Deployments" → 로그

3. **환경 변수 확인:**
   - Railway: `MONGODB_URI`, `PORT`
   - Vercel: `VITE_API_URL`

### 변경사항이 반영되지 않는 경우

1. 브라우저 캐시 클리어
2. 시크릿 모드에서 확인
3. 배포 완료 대기 (2-3분)
4. 배포 로그에서 오류 확인

---

## 💡 팁

- **작은 변경사항**: 바로 푸시해도 됩니다
- **큰 변경사항**: 로컬에서 충분히 테스트 후 푸시
- **커밋 메시지**: 명확하게 작성하면 나중에 추적하기 쉬움

---

**업데이트가 완료되면 배포된 사이트에서 변경사항을 확인하세요!** 🎉
