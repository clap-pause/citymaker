// 기술(버프/찬스) 카드 정의
// - cost: 원 단위 (예: 1억원 = 100,000,000)
// - effects: 계산 로직에서 해석되는 효과 집합
export const TECH_CARDS = [
  {
    id: 'smart_buildings',
    name: '스마트 빌딩 도입',
    cost: 4000000000, // 40억원
    description: '에너지 관리/자동제어로 운영 효율을 높입니다. 건설·운영 전반 비용이 줄어듭니다.',
    effects: {
      constructionCostMultiplier: 0.97,
      taxIncomeMultiplier: 1.01,
      carbonMultiplier: 0.97,
      livabilityBonus: 1,
    },
  },
  {
    id: 'smart_grid',
    name: '스마트 그리드(전력망) 최적화',
    cost: 5000000000, // 50억원
    description: '피크 부하를 줄이고 전력 손실을 최소화합니다. 탄소/운영 비용이 완화됩니다.',
    effects: {
      carbonMultiplier: 0.93,
      taxIncomeMultiplier: 1.01,
      livabilityBonus: 1,
    },
  },
  {
    id: 'transit_optimization',
    name: '대중교통·동선 최적화',
    cost: 3500000000, // 35억원
    description: '접근성이 좋아져 경제 활동이 늘고, 이동 배출이 줄어듭니다.',
    effects: {
      jobsMultiplier: 1.03,
      taxIncomeMultiplier: 1.02,
      carbonMultiplier: 0.98,
      livabilityBonus: 2,
    },
  },
  {
    id: 'urban_greens',
    name: '도시 녹지 네트워크',
    cost: 3000000000, // 30억원
    description: '열섬 완화와 휴식 공간 접근성을 높여 도시 체감 품질을 끌어올립니다.',
    effects: {
      carbonMultiplier: 0.96,
      livabilityBonus: 4,
    },
  },
  {
    id: 'commercial_activation',
    name: '상권 활성화 프로그램',
    cost: 4500000000, // 45억원
    description: '상업/서비스 매출 기반이 좋아져 세수(10년)가 증가합니다.',
    effects: {
      taxIncomeMultiplier: 1.05,
      livabilityBonus: 1,
    },
  },
  {
    id: 'startup_ecosystem',
    name: '스타트업·혁신 생태계',
    cost: 5500000000, // 55억원
    description: '고부가 일자리와 파생 산업을 유도해 고용과 세수가 증가합니다.',
    effects: {
      jobsMultiplier: 1.06,
      taxIncomeMultiplier: 1.03,
      livabilityBonus: 1,
    },
  },
  {
    id: 'resilience_infra',
    name: '재난 대응 인프라 고도화',
    cost: 2500000000, // 25억원
    description: '안전/복원력이 개선되어 도시 선호도가 올라갑니다.',
    effects: {
      livabilityBonus: 3,
    },
  },
  {
    id: 'circular_economy',
    name: '순환자원 시스템',
    cost: 6000000000, // 60억원
    description: '자원 재사용과 폐기물 감축으로 탄소를 낮추고 비용 구조를 개선합니다.',
    effects: {
      carbonMultiplier: 0.92,
      constructionCostMultiplier: 0.98,
      livabilityBonus: 1,
    },
  },
];

export const TECH_CARD_BY_ID = TECH_CARDS.reduce((acc, card) => {
  acc[card.id] = card;
  return acc;
}, {});

