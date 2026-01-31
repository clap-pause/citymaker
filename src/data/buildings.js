// 건물 데이터 정의
export const BUILDINGS = {
  // 상업 공간
  convenienceStore: {
    id: 'convenienceStore',
    name: '편의점',
    category: 'commercial',
    size: 1,
    jobs: 4,
    taxIncome: 300000000, // 10년간 3억원 (연간 3000만원 × 10)
    constructionCost: 200000000, // 2억원
    carbonEmission: 50, // 연간 50톤 CO2
  },
  supermarket: {
    id: 'supermarket',
    name: '슈퍼마켓',
    category: 'commercial',
    size: 2,
    shape: 'line2', // 일자 모형 (2x1)
    jobs: 10,
    taxIncome: 500000000, // 10년간 5억원 (연간 5000만원 × 10)
    constructionCost: 350000000, // 3.5억원
    carbonEmission: 100, // 연간 100톤 CO2
  },
  largeMart: {
    id: 'largeMart',
    name: '대형 마트',
    category: 'commercial',
    size: 8,
    shape: 'rect8', // 직사각형 모형 (2x4)
    jobs: 30,
    taxIncome: 1200000000, // 10년간 12억원 (연간 1.2억원 × 10)
    constructionCost: 800000000, // 8억원
    carbonEmission: 300, // 연간 300톤 CO2
  },
  
  // 오피스 공간
  smallOffice: {
    id: 'smallOffice',
    name: '소형 사무실',
    category: 'office',
    size: 3,
    shape: 'L', // ㄱ자 모형
    jobs: 40,
    taxIncome: 500000000, // 10년간 5억원 (연간 5000만원 × 10)
    constructionCost: 300000000, // 3억원
    carbonEmission: 150, // 연간 150톤 CO2
  },
  mediumOffice: {
    id: 'mediumOffice',
    name: '중형 오피스',
    category: 'office',
    size: 4,
    jobs: 80,
    taxIncome: 1000000000, // 10년간 10억원 (연간 1억원 × 10)
    constructionCost: 500000000, // 5억원
    carbonEmission: 250, // 연간 250톤 CO2
  },
  largeOffice: {
    id: 'largeOffice',
    name: '대형 오피스',
    category: 'office',
    size: 5,
    shape: 'L5', // L자 모형 (2x2 + 1칸)
    jobs: 160,
    taxIncome: 2000000000, // 10년간 20억원 (연간 2억원 × 10)
    constructionCost: 1000000000, // 10억원
    carbonEmission: 400, // 연간 400톤 CO2
  },
  
  // 주거 공간 (일반적으로 흑자, 저렴한 집 비율 적용 시 적자 가능)
  villaOfficetel: {
    id: 'villaOfficetel',
    name: '빌라 오피스텔',
    category: 'residential',
    size: 4,
    jobs: 0,
    taxIncome: 400000000, // 10년간 4억원 (연간 4000만원 × 10) - 일반 주거 기준 흑자
    constructionCost: 300000000, // 3억원
    carbonEmission: 120, // 연간 120톤 CO2
    canBeAffordable: true,
    // 저렴한 집 비율 50% 시: 2억(일반) + 2억×0.5(저렴) = 3억 → 적자
  },
  house: {
    id: 'house',
    name: '주택',
    category: 'residential',
    size: 2,
    shape: 'line2', // 일자 모형 (2x1)
    jobs: 0,
    taxIncome: 200000000, // 10년간 2억원 (연간 2000만원 × 10) - 일반 주거 기준 흑자
    constructionCost: 150000000, // 1.5억원
    carbonEmission: 80, // 연간 80톤 CO2
    canBeAffordable: true,
    // 저렴한 집 비율 50% 시: 1억(일반) + 1억×0.5(저렴) = 1.5억 → 손익분기
  },
  apartment: {
    id: 'apartment',
    name: '아파트',
    category: 'residential',
    size: 4,
    jobs: 0,
    taxIncome: 600000000, // 10년간 6억원 (연간 6000만원 × 10) - 일반 주거 기준 흑자
    constructionCost: 500000000, // 5억원
    carbonEmission: 200, // 연간 200톤 CO2
    canBeAffordable: true,
    // 저렴한 집 비율 50% 시: 3억(일반) + 3억×0.5(저렴) = 4.5억 → 적자
  },
  
  // 오픈 스페이스
  park: {
    id: 'park',
    name: '공원',
    category: 'openSpace',
    size: 1,
    jobs: 4,
    taxIncome: 0,
    constructionCost: 30000000, // 3천만원
    carbonEmission: -50, // 연간 50톤 CO2 흡수
  },
  culturalCenter: {
    id: 'culturalCenter',
    name: '문화 복지 센터',
    category: 'openSpace',
    size: 3,
    shape: 'L', // ㄱ자 모형
    jobs: 20,
    taxIncome: 50000000, // 10년간 5000만원 (연간 500만원 × 10)
    constructionCost: 150000000, // 1.5억원 (건설 비용 조정)
    carbonEmission: 80, // 연간 80톤 CO2
  },
  sportsFacility: {
    id: 'sportsFacility',
    name: '체육 시설',
    category: 'openSpace',
    size: 2,
    shape: 'line2', // 일자 모형 (2x1)
    jobs: 16,
    taxIncome: 100000000, // 10년간 1억원 (연간 1000만원 × 10)
    constructionCost: 120000000, // 1.2억원 (건설 비용 조정)
    carbonEmission: 100, // 연간 100톤 CO2
  },
  
  // 기타
  logisticsCenter: {
    id: 'logisticsCenter',
    name: '물류 센터',
    category: 'other',
    size: 8,
    shape: 'rect8', // 직사각형 모형 (2x4)
    jobs: 240,
    taxIncome: 1800000000, // 10년간 18억원 (연간 1.8억원 × 10)
    constructionCost: 1000000000, // 10억원 (건설 비용 조정)
    carbonEmission: 800, // 연간 800톤 CO2
  },
  recyclingResearch: {
    id: 'recyclingResearch',
    name: '자원 재활용 연구 단지',
    category: 'other',
    size: 6,
    shape: 'rect6', // 직사각형 모형 (2x3)
    jobs: 100,
    taxIncome: 800000000, // 10년간 8억원 (연간 8000만원 × 10)
    constructionCost: 1000000000, // 10억원 (건설 비용 조정)
    carbonEmission: -200, // 연간 200톤 CO2 흡수
  },
};

// 건물 카테고리별 그룹화
export const BUILDINGS_BY_CATEGORY = {
  commercial: ['convenienceStore', 'supermarket', 'largeMart'],
  office: ['smallOffice', 'mediumOffice', 'largeOffice'],
  residential: ['villaOfficetel', 'house', 'apartment'],
  openSpace: ['park', 'culturalCenter', 'sportsFacility'],
  other: ['logisticsCenter', 'recyclingResearch'],
};
