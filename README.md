# 🏙️ 도시 개발 시뮬레이터

도시 블록에 건물을 배치하고 다양한 지표를 실시간으로 확인할 수 있는 시뮬레이터입니다.

## ✨ 주요 기능

- 📋 **블록 편집 모드**: 각 블록별로 건물을 선택하고 배치
- 🗺️ **맵 배치 모드**: 2D 맵에서 건물을 드래그 앤 드롭으로 배치
- 📊 **실시간 지표 계산**: 
  - 일자리 수
  - 세금 수입 (10년간)
  - 건설 비용
  - 순이익
  - 공간 유형별 비율
  - 녹지 공간 비율
  - 탄소 배출 지수
  - 저렴한 주거 비율
  - 살고 싶은 도시 지수 (0-100점)
- 💾 **자동 저장**: 변경사항 자동 저장 (2초 지연)
- 🌐 **온라인/오프라인 지원**: 서버 연결 실패 시 로컬 스토리지 사용

## 🚀 빠른 시작

### 로컬 개발 환경 설정

1. **저장소 클론**
```bash
git clone <repository-url>
cd city-calculator
```

2. **의존성 설치**
```bash
# 프론트엔드
npm install

# 백엔드
cd server
npm install
```

3. **환경 변수 설정**

프론트엔드 (루트 폴더):
```bash
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

백엔드 (server 폴더):
```bash
echo "MONGODB_URI=your-mongodb-connection-string" > .env
echo "PORT=3000" >> .env
```

4. **서버 실행**

터미널 1 (백엔드):
```bash
cd server
npm start
```

터미널 2 (프론트엔드):
```bash
npm run dev
```

5. **브라우저에서 접속**
```
http://localhost:5173
```

## 📦 배포

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

### MongoDB Atlas 설정 (필수)

MongoDB Atlas 설정이 처음이시라면 [MONGODB_SETUP.md](./MONGODB_SETUP.md) 빠른 가이드를 먼저 확인하세요.

### 간단 요약

1. **MongoDB Atlas** 설정 (무료 티어) - [상세 가이드](./MONGODB_SETUP.md)
2. **백엔드 배포**: Railway 또는 Render (무료 티어)
3. **프론트엔드 배포**: Vercel (무료 티어)

## 🏗️ 프로젝트 구조

```
city-calculator/
├── src/                    # 프론트엔드 소스 코드
│   ├── components/        # React 컴포넌트
│   ├── data/              # 건물, 블록 데이터
│   ├── utils/             # 유틸리티 함수
│   └── App.jsx            # 메인 앱 컴포넌트
├── server/                # 백엔드 서버
│   ├── server.js          # Express 서버
│   └── package.json       # 서버 의존성
├── DEPLOYMENT.md          # 배포 가이드
└── package.json           # 프론트엔드 의존성
```

## 🛠️ 기술 스택

### 프론트엔드
- React 18
- Vite
- CSS3

### 백엔드
- Node.js
- Express
- MongoDB (MongoDB Atlas)

### 배포
- Vercel (프론트엔드)
- Railway / Render (백엔드)
- MongoDB Atlas (데이터베이스)

## 📊 건물 카테고리

- **상업 공간**: 편의점, 슈퍼마켓, 대형 마트
- **오피스 공간**: 소형 사무실, 중형 오피스, 대형 오피스
- **주거 공간**: 빌라 오피스텔, 주택, 아파트
- **오픈 스페이스**: 공원, 문화 복지 센터, 체육 시설
- **기타**: 물류 센터, 자원 재활용 연구 단지

## 📈 지표 계산 방식

자세한 지표 계산 방식은 다음 파일을 참조하세요:
- `건물별_지표_영향.csv`: 각 건물의 지표 영향
- `설정별_지표_영향.csv`: 설정값의 지표 영향
- `살고_싶은_도시_지수_계산방식.csv`: 살고 싶은 도시 지수 계산 방식

## 🔧 개발

### 빌드
```bash
npm run build
```

### 프리뷰
```bash
npm run preview
```

## 📝 라이선스

MIT License

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!
