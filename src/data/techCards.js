// 기술(버프/찬스) 카드 정의
// - coinCost: 기술 코인 비용 (총 10개 코인 내에서 구매, 최대 2개 선택)
// - effects: 계산 로직에서 해석되는 효과 집합
export const TECH_CARDS = [
  {
    id: 'carbon_monitoring',
    name: '🌿 탄소 모니터링 시스템',
    coinCost: 4,
    description: '도시의 탄소 배출을 실시간으로 확인',
    coreEffect: '환경 (탄소 감소, 지속가능성)',
    effects: {
      carbonMultiplier: 0.92,
      livabilityBonus: 1,
    },
  },
  {
    id: 'smart_energy_water',
    name: '💧 스마트 에너지·수자원 관리',
    coinCost: 6,
    description: '건물과 도시의 에너지·물 사용 자동 관리',
    coreEffect: '환경 + 경제 (절약, 효율)',
    effects: {
      constructionCostMultiplier: 0.97,
      taxIncomeMultiplier: 1.01,
      carbonMultiplier: 0.94,
      livabilityBonus: 1,
    },
  },
  {
    id: 'traffic_optimization',
    name: '🚦 교통 흐름 최적화 시스템',
    coinCost: 5,
    description: '교통량에 따라 신호 자동 조절',
    coreEffect: '환경 + 경제 (혼잡 감소, 시간 절약)',
    effects: {
      jobsMultiplier: 1.02,
      taxIncomeMultiplier: 1.02,
      carbonMultiplier: 0.97,
      livabilityBonus: 1,
    },
  },
  {
    id: 'smart_public_services',
    name: '🏘️ 스마트 공공 서비스 플랫폼',
    coinCost: 5,
    description: '복지, 행정 서비스를 디지털로 제공',
    coreEffect: '사회 형평성 (접근성 향상)',
    effects: {
      livabilityBonus: 4,
    },
  },
  {
    id: 'public_wifi',
    name: '📶 공공 와이파이·디지털 인프라',
    coinCost: 4,
    description: '누구나 무료로 인터넷 사용 가능',
    coreEffect: '형평성 + 브랜딩 (디지털 격차 해소)',
    effects: {
      taxIncomeMultiplier: 1.01,
      livabilityBonus: 2,
    },
  },
  {
    id: 'circular_resources',
    name: '🗑️ 자원 순환 관리 시스템',
    coinCost: 6,
    description: '쓰레기·재활용을 효율적으로 관리',
    coreEffect: '환경 + 경제 (자원 절약)',
    effects: {
      carbonMultiplier: 0.92,
      constructionCostMultiplier: 0.98,
      livabilityBonus: 1,
    },
  },
  {
    id: 'data_city_ops',
    name: '🧠 데이터 기반 도시 운영',
    coinCost: 5,
    description: '데이터를 활용해 정책·시설 운영 최적화',
    coreEffect: '경제 + 효율성',
    effects: {
      constructionCostMultiplier: 0.99,
      taxIncomeMultiplier: 1.03,
      jobsMultiplier: 1.01,
      livabilityBonus: 2,
    },
  },
  {
    id: 'citizen_participation',
    name: '📱 시민 참여 플랫폼',
    coinCost: 6,
    description: '시민이 의견을 제안하고 투표하는 시스템',
    coreEffect: '형평성 + 브랜딩 (참여형 도시 이미지)',
    effects: {
      taxIncomeMultiplier: 1.01,
      livabilityBonus: 3,
    },
  },
];

export const TECH_CARD_BY_ID = TECH_CARDS.reduce((acc, card) => {
  acc[card.id] = card;
  return acc;
}, {});

