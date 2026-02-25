# 🔧 Vercel 환경 변수 설정 가이드

## 문제 해결

`vercel.json` 파일에서 Secret 참조를 제거했습니다. 이제 Vercel 대시보드에서 직접 환경 변수를 설정하세요.

---

## ✅ 올바른 설정 방법

### 1. Vercel 대시보드에서 환경 변수 설정

1. Vercel 대시보드 → 프로젝트 선택
2. "Settings" 탭 클릭
3. "Environment Variables" 섹션으로 이동
4. "Add New" 클릭

### 2. 환경 변수 추가

**변수 설정:**
- **Name**: `VITE_API_URL`
- **Value**: `https://web-production-4d833.up.railway.app/api`
- **Environment**: 
  - ✅ Production
  - ✅ Preview
  - ✅ Development
  (모두 선택)

5. "Save" 클릭

### 3. 재배포

환경 변수를 추가한 후:
1. "Deployments" 탭으로 이동
2. 최신 배포 옆 "..." 메뉴 클릭
3. "Redeploy" 클릭
4. 또는 GitHub에 푸시하여 자동 재배포

---

## ⚠️ 주의사항

- `vercel.json`의 `env` 섹션은 제거했습니다
- 환경 변수는 Vercel 대시보드에서만 설정하세요
- 환경 변수 변경 후에는 재배포가 필요합니다

---

## 🔍 확인 방법

배포 후 브라우저 개발자 도구(F12) → Console에서:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

다음과 같이 표시되어야 합니다:
```
https://web-production-4d833.up.railway.app/api
```

---

이제 Vercel 대시보드에서 환경 변수를 설정하고 재배포하세요!
