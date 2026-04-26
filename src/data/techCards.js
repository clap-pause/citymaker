// 기술(버프/찬스) 카드 정의
// - coinCost: 기술 코인 비용 (총 10개 코인 내에서 구매, 최대 2개 선택)
// - effects: 계산 로직에서 해석되는 효과 집합
const COIN_BY_EFFECT_COUNT = {
  2: 4,
  3: 5,
  4: 6,
};

const countEffects = (effects) => {
  const ef = effects || {};
  const keys = [
    'taxIncomeMultiplier',
    'constructionCostMultiplier',
    'jobsMultiplier',
    'carbonMultiplier',
    'livabilityBonus',
  ];
  return keys.reduce((n, k) => {
    const v = ef[k];
    if (typeof v !== 'number') return n;
    if (k.endsWith('Multiplier')) return n + (v !== 1 ? 1 : 0);
    return n + (v !== 0 ? 1 : 0);
  }, 0);
};

const normalizeTechCard = (card) => {
  const effectCount = countEffects(card.effects);
  const normalizedCount = effectCount <= 2 ? 2 : effectCount >= 4 ? 4 : 3;
  return {
    ...card,
    coinCost: COIN_BY_EFFECT_COUNT[normalizedCount],
  };
};

const RAW_TECH_CARDS = [
  {
    id: 'carbon_monitoring',
    name: '🌿 탄소 모니터링 시스템',
    coinCost: 4,
    tags: ['#환경', '#IT', '#데이터'],
    description:
      '도시 곳곳의 공기 측정 장치가 이산화탄소, 미세먼지, 온도, 습도 등을 측정하고 화면에서 확인할 수 있게 해주는 기술입니다.',
    considerations: [
      '측정만으로 탄소 배출이 크게 줄어들지는 않습니다.',
      '장비의 정확도와 데이터 관리가 중요합니다.',
    ],
    impacts: [
      { label: '환경 지수', trend: 'up' },
      { label: '탄소 배출 지수', trend: 'same' },
      { label: '건설 비용', trend: 'down' },
      { label: '세금 수입', trend: 'same' },
      { label: '살고 싶은 도시 점수', trend: 'up' },
    ],
    // 코인 4 → 효과 2개
    effects: {
      constructionCostMultiplier: 0.99,
      // 측정/센서 구축·운영으로 단기 탄소는 소폭 증가(운영 부담)
      carbonMultiplier: 1.01,
    },
  },
  {
    id: 'smart_water_cycle',
    name: '💧 스마트 물 순환 시스템',
    coinCost: 5,
    tags: ['#환경', '#IT', '#데이터'],
    description:
      '빗물, 하천수, 생활용수 사용량을 데이터로 관리해 물을 다시 활용하는 기술입니다. 공원 관리, 도로 청소, 조경용수 등에 사용할 수 있습니다.',
    considerations: [
      '비가 적은 시기에는 활용 효과가 줄어들 수 있습니다.',
      '저장·정화 장치 관리가 필요합니다.',
    ],
    impacts: [
      { label: '환경 지수', trend: 'up' },
      { label: '탄소 배출 지수', trend: 'down' },
      { label: '건설 비용', trend: 'down' },
      { label: '세금 수입', trend: 'same' },
      { label: '살고 싶은 도시 점수', trend: 'up' },
    ],
    // 코인 5 → 효과 3개
    effects: {
      livabilityBonus: 1,
      carbonMultiplier: 0.98,
      // 인프라 설치/유지로 건설·운영 부담이 소폭 증가
      constructionCostMultiplier: 1.005,
    },
  },
  {
    id: 'smart_power_management',
    name: '⚡ 스마트 전력 관리',
    coinCost: 6,
    tags: ['#환경', '#IT', '#IoT', '#에너지'],
    description:
      '건물과 시설의 전기 사용량을 실시간으로 확인하고, 조명/냉난방/공공시설 전력 사용을 자동으로 관리해 에너지 낭비를 줄입니다.',
    considerations: [
      '처음 설치할 때 장비와 시스템 비용이 큽니다.',
      '자동 조절 시스템의 안정성이 중요합니다.',
    ],
    impacts: [
      { label: '탄소 배출 지수', trend: 'down' },
      { label: '환경 지수', trend: 'up' },
      { label: '건설 비용', trend: 'down2' },
      { label: '세금 수입', trend: 'same' },
      { label: '살고 싶은 도시 점수', trend: 'up' },
    ],
    // 코인 6 → 효과 4개
    effects: {
      carbonMultiplier: 0.98,
      constructionCostMultiplier: 0.995,
      // 자동화/통합 운영으로 고장/다운타임 리스크(세수 소폭↓)
      taxIncomeMultiplier: 0.995,
      jobsMultiplier: 1.01,
    },
  },
  {
    id: 'eco_plastics',
    name: '🧪 친환경 플라스틱',
    coinCost: 5,
    tags: ['#환경', '#소재', '#지속가능'],
    description:
      '옥수수 전분, 사탕수수, 미생물 유래 성분 등을 활용해 만드는 플라스틱 소재입니다. 쓰레기와 오염 문제를 줄이는 데 도움이 됩니다.',
    considerations: [
      '일반 플라스틱보다 생산 비용이 높을 수 있습니다.',
      '모든 친환경 플라스틱이 자연에서 바로 분해되는 것은 아니어서 처리 방식이 중요합니다.',
    ],
    impacts: [
      { label: '환경 지수', trend: 'up2' },
      { label: '탄소 배출 지수', trend: 'down' },
      { label: '건설 비용', trend: 'same' },
      { label: '세금 수입', trend: 'down' },
      { label: '살고 싶은 도시 점수', trend: 'up' },
    ],
    // 코인 5 → 효과 3개 (세금↓, 탄소↓, 살기↑)
    effects: {
      taxIncomeMultiplier: 0.995,
      carbonMultiplier: 0.98,
      livabilityBonus: 1,
    },
  },
  {
    id: 'eco_building_materials',
    name: '🧱 친환경 건축 소재',
    coinCost: 4,
    tags: ['#환경', '#건축', '#소재'],
    description:
      '저탄소 콘크리트, 재활용 단열재, 친환경 페인트 같은 소재로 보수/개선을 진행해 탄소와 유해 물질을 줄입니다.',
    considerations: [
      '기존 재료보다 비싸거나, 내구성과 안전성을 검토해야 할 수 있습니다.',
      '효과가 즉시 보이기보다 시간이 지나며 나타날 수 있습니다.',
    ],
    impacts: [
      { label: '탄소 배출 지수', trend: 'down' },
      { label: '환경 지수', trend: 'up' },
      { label: '건설 비용', trend: 'down' },
      { label: '세금 수입', trend: 'same' },
      { label: '살고 싶은 도시 점수', trend: 'up' },
    ],
    // 코인 4 → 효과 2개
    effects: {
      carbonMultiplier: 0.98,
      // 친환경 자재 프리미엄으로 세수/경제활동(=세금) 소폭 감소 (과도 페널티 완화)
      taxIncomeMultiplier: 0.998,
    },
  },
  {
    id: 'smart_transport',
    name: '⚙️ 스마트 교통 시스템',
    coinCost: 6,
    tags: ['#AI', '#IT', '#교통', '#환경'],
    description:
      '도로의 카메라/감지기/신호 제어 장치가 교통량을 분석해 신호 시간을 조절합니다. 정체와 공회전을 줄일 수 있습니다.',
    considerations: [
      '차량 흐름이 좋아질 수 있지만, 보행자 대기 시간이 길어질 수 있습니다.',
      '장치/데이터 오류가 생기면 교통 흐름이 불안정해질 수 있습니다.',
    ],
    impacts: [
      { label: '탄소 배출 지수', trend: 'down' },
      { label: '환경 지수', trend: 'up' },
      { label: '건설 비용', trend: 'down' },
      { label: '세금 수입', trend: 'up' },
      { label: '살고 싶은 도시 점수', trend: 'mix' },
    ],
    // 코인 6 → 효과 4개
    effects: {
      carbonMultiplier: 0.98,
      taxIncomeMultiplier: 1.01,
      livabilityBonus: 1,
      // 센서/신호 인프라 구축비 부담
      constructionCostMultiplier: 1.01,
    },
  },
  {
    id: 'energy_storage',
    name: '🔋 에너지 저장 시스템',
    coinCost: 6,
    tags: ['#환경', '#에너지', '#인프라'],
    description:
      '태양광/풍력으로 만든 전기를 배터리에 저장했다가 필요한 시간에 사용하는 기술입니다. 피크 시간대 보충이 가능합니다.',
    considerations: [
      '배터리 수명과 유지 관리 비용이 발생합니다.',
      '폐배터리 처리도 함께 고려해야 합니다.',
    ],
    impacts: [
      { label: '탄소 배출 지수', trend: 'down' },
      { label: '환경 지수', trend: 'up' },
      { label: '건설 비용', trend: 'down' },
      { label: '세금 수입', trend: 'down' },
      { label: '살고 싶은 도시 점수', trend: 'up' },
    ],
    // 코인 6 → 효과 4개 (세금↓ 포함)
    effects: {
      taxIncomeMultiplier: 0.995,
      livabilityBonus: 1,
      carbonMultiplier: 0.98,
      // 대규모 저장 설비 구축비/교체비 부담
      constructionCostMultiplier: 1.005,
    },
  },
  {
    id: 'digital_twin_city',
    name: '🧠 디지털 트윈 도시',
    coinCost: 4,
    tags: ['#IT', '#데이터', '#시뮬레이션'],
    description:
      '도시의 건물, 도로, 인구, 에너지 사용량 등을 가상 도시로 만들어 분석합니다. 실제 변경 전 결과를 미리 비교할 수 있습니다.',
    considerations: [
      '직접 탄소를 줄이거나 일자리를 늘리는 기술은 아닙니다.',
      '입력 데이터가 부정확하면 분석 결과도 실제와 달라질 수 있습니다.',
    ],
    impacts: [
      { label: '환경 지수', trend: 'same' },
      { label: '탄소 배출 지수', trend: 'same' },
      { label: '건설 비용', trend: 'down' },
      { label: '세금 수입', trend: 'same' },
      { label: '살고 싶은 도시 점수', trend: 'same' },
    ],
    // 코인 4 → 효과 2개
    effects: {
      constructionCostMultiplier: 0.99,
      // 데이터/모델링 중심으로 단기 고용 감소(외주·자동화)
      jobsMultiplier: 0.99,
    },
  },
];

export const TECH_CARDS = RAW_TECH_CARDS.map(normalizeTechCard);

export const TECH_CARD_BY_ID = TECH_CARDS.reduce((acc, card) => {
  acc[card.id] = card;
  return acc;
}, {});

