import { BUILDINGS } from '../data/buildings.js';
import { TECH_CARD_BY_ID } from '../data/techCards.js';

/**
 * 블록별 건물 배치와 설정을 기반으로 지표를 계산합니다.
 * @param {Object} blockBuildings - 블록별 건물 배치 정보 { blockId: [{ buildingId, count, isAffordable }] }
 * @param {number} affordableRatio - 전체 저렴한 주거 비율 (0-1)
 * @param {number} environmentInvestment - 환경 기술 투자 비용
 * @param {string[]} selectedTechCardIds - 선택(구매)한 기술 카드 ID 목록 (최대 2개 권장)
 * @returns {Object} 계산된 지표들
 */
export function calculateMetrics(
  blockBuildings,
  affordableRatio = 0,
  environmentInvestment = 0,
  selectedTechCardIds = []
) {
  let totalJobs = 0;
  let totalTaxIncome = 0;
  let totalConstructionCost = 0;
  let totalCarbonEmission = 0;
  let totalCommercialSpace = 0;
  let totalOfficeSpace = 0;
  let totalOpenSpace = 0;
  let totalResidentialSpace = 0;
  let totalOtherSpace = 0;
  let totalAffordableHousing = 0;
  let totalHousing = 0;
  let totalSize = 0;
  let totalUsedSize = 0;

  // 각 블록별로 계산
  Object.keys(blockBuildings).forEach(blockId => {
    const buildings = blockBuildings[blockId] || [];

    buildings.forEach(({ buildingId, count }) => {
      const building = BUILDINGS[buildingId];
      if (!building) return;

      const buildingCount = count || 0;
      const totalBuildingSize = building.size * buildingCount;

      totalJobs += building.jobs * buildingCount;
      
      // 주거 건물의 경우 저렴한 집 비율에 따라 세금 수입 감소
      if (building.category === 'residential' && building.canBeAffordable) {
        // 저렴한 집은 세금이 50% 감소 (정책 지원)
        const affordableSize = totalBuildingSize * affordableRatio;
        const normalSize = totalBuildingSize - affordableSize;
        totalTaxIncome += building.taxIncome * normalSize / building.size;
        totalTaxIncome += building.taxIncome * 0.5 * affordableSize / building.size; // 저렴한 집은 50% 세금
      } else {
        totalTaxIncome += building.taxIncome * buildingCount;
      }
      
      totalConstructionCost += building.constructionCost * buildingCount;
      totalCarbonEmission += building.carbonEmission * buildingCount;
      totalUsedSize += totalBuildingSize;

      // 공간 유형별 계산
      if (building.category === 'commercial') {
        totalCommercialSpace += totalBuildingSize;
      } else if (building.category === 'office') {
        totalOfficeSpace += totalBuildingSize;
      } else if (building.category === 'openSpace') {
        totalOpenSpace += totalBuildingSize;
      } else if (building.category === 'residential') {
        totalResidentialSpace += totalBuildingSize;
        totalHousing += totalBuildingSize;
        
        // 저렴한 주거 비율 적용
        if (building.canBeAffordable) {
          totalAffordableHousing += totalBuildingSize * affordableRatio;
        }
      } else if (building.category === 'other') {
        totalOtherSpace += totalBuildingSize;
      }
    });
  });

  // 전체 도시 크기 계산 (모든 블록 합계)
  totalSize = 16 + 16 + 24 + 48 + 36 + 56; // 196칸

  // 공간 유형별 비율 계산
  const commercialSpaceRatio = totalSize > 0 ? (totalCommercialSpace / totalSize) * 100 : 0;
  const officeSpaceRatio = totalSize > 0 ? (totalOfficeSpace / totalSize) * 100 : 0;
  const openSpaceRatio = totalSize > 0 ? (totalOpenSpace / totalSize) * 100 : 0;
  const residentialSpaceRatio = totalSize > 0 ? (totalResidentialSpace / totalSize) * 100 : 0;
  const otherSpaceRatio = totalSize > 0 ? (totalOtherSpace / totalSize) * 100 : 0;

  // 녹지 공간 비율 (오픈 스페이스 중 공원 비율)
  const greenSpaceRatio = totalSize > 0 ? (totalOpenSpace / totalSize) * 100 : 0;

  // 저렴한 집 비율
  const affordableHousingRatio = totalHousing > 0 
    ? (totalAffordableHousing / totalHousing) * 100 
    : 0;

  // 환경 투자에 따른 탄소 배출 감소 (투자 1억원당 2% 감소, 최대 10% 감소)
  // 비선형 효과: 투자액이 많을수록 더 큰 효과
  const investmentInBillions = environmentInvestment / 100000000; // 억원 단위
  const carbonReduction = Math.min(investmentInBillions * 2, 10); // 1억원당 2% 감소, 최대 10% 감소
  const adjustedCarbonEmission = totalCarbonEmission * (1 - carbonReduction / 100);

  // ---- 기술 카드(버프) 적용 ----
  // 최대 2개만 반영 (UI에서 제한하지만, 데이터 무결성도 보장)
  const normalizedSelectedTechIds = Array.isArray(selectedTechCardIds)
    ? selectedTechCardIds.filter(Boolean).slice(0, 2)
    : [];

  let techCostTotal = 0;
  let techJobsMultiplier = 1;
  let techTaxIncomeMultiplier = 1;
  let techConstructionCostMultiplier = 1;
  let techCarbonMultiplier = 1;
  let techLivabilityBonus = 0;

  normalizedSelectedTechIds.forEach((id) => {
    const card = TECH_CARD_BY_ID[id];
    if (!card) return;
    techCostTotal += Number(card.cost) || 0;
    const ef = card.effects || {};
    if (typeof ef.jobsMultiplier === 'number') techJobsMultiplier *= ef.jobsMultiplier;
    if (typeof ef.taxIncomeMultiplier === 'number') techTaxIncomeMultiplier *= ef.taxIncomeMultiplier;
    if (typeof ef.constructionCostMultiplier === 'number') techConstructionCostMultiplier *= ef.constructionCostMultiplier;
    if (typeof ef.carbonMultiplier === 'number') techCarbonMultiplier *= ef.carbonMultiplier;
    if (typeof ef.livabilityBonus === 'number') techLivabilityBonus += ef.livabilityBonus;
  });

  const adjustedJobs = totalJobs * techJobsMultiplier;
  const adjustedTaxIncome = totalTaxIncome * techTaxIncomeMultiplier;
  const adjustedConstructionCost = totalConstructionCost * techConstructionCostMultiplier;
  const adjustedCarbonAfterEnvAndTech = adjustedCarbonEmission * techCarbonMultiplier;

  // 탄소 배출 "지표"를 이해하기 쉽게 0~100 지수로 변환합니다. (낮을수록 좋음)
  // - 기본 아이디어: (투자 반영된) 순 탄소 배출량을 "사용된 칸 수"로 나눈 뒤, 임계값으로 정규화
  // - 탄소가 음수(흡수)면 0점(최고), 칸당 200톤 이상이면 100점(최악)
  const usedTilesForCarbon = Math.max(1, totalUsedSize);
  const carbonPerTile = adjustedCarbonAfterEnvAndTech / usedTilesForCarbon;
  const carbonIndex = Math.max(0, Math.min(100, (carbonPerTile / 200) * 100));

  // 이윤 계산
  const profit = adjustedTaxIncome - adjustedConstructionCost - environmentInvestment - techCostTotal;

  // 살고 싶은 도시 지수 계산 (0-100)
  // 녹지 비율, 저렴한 주거 비율, 탄소 배출, 일자리 수 등을 종합
  const livabilityScore = calculateLivabilityScore({
    greenSpaceRatio,
    affordableHousingRatio,
    carbonIndex,
    totalJobs: adjustedJobs,
    openSpaceRatio,
  });

  const finalLivabilityScore = Math.max(0, Math.min(100, livabilityScore + techLivabilityBonus));

  return {
    // 건물 개발 시 지표
    totalJobs: Math.round(adjustedJobs),
    totalTaxIncome: Math.round(adjustedTaxIncome),
    totalConstructionCost: Math.round(adjustedConstructionCost),
    profit: Math.round(profit),
    
    // 공간 유형별 비율
    commercialSpaceRatio: Math.round(commercialSpaceRatio * 10) / 10,
    officeSpaceRatio: Math.round(officeSpaceRatio * 10) / 10,
    openSpaceRatio: Math.round(openSpaceRatio * 10) / 10,
    residentialSpaceRatio: Math.round(residentialSpaceRatio * 10) / 10,
    otherSpaceRatio: Math.round(otherSpaceRatio * 10) / 10,
    
    // 도시 전체 지표
    greenSpaceRatio: Math.round(greenSpaceRatio * 10) / 10,
    carbonIndex: Math.round(carbonIndex * 10) / 10,
    carbonPerTile: Math.round(carbonPerTile * 100) / 100,
    netCarbon: Math.round(adjustedCarbonAfterEnvAndTech * 10) / 10,
    affordableHousingRatio: Math.round(affordableHousingRatio * 10) / 10,
    livabilityScore: Math.round(finalLivabilityScore),
    
    // 추가 정보
    totalSize,
    totalUsedSize,
    totalResidentialSpace,
    totalCommercialSpace,
    totalOfficeSpace,
    totalOpenSpace,
    totalOtherSpace,

    // 기술 카드 정보
    selectedTechCardIds: normalizedSelectedTechIds,
    techCostTotal: Math.round(techCostTotal),
    techLivabilityBonus: Math.round(techLivabilityBonus),
  };
}

/**
 * 살고 싶은 도시 지수 계산 (구간별 점수 체계)
 * 기본 50점 + 각 지표 최대 10점씩 = 총 100점
 */
function calculateLivabilityScore({ greenSpaceRatio, affordableHousingRatio, carbonIndex, totalJobs, openSpaceRatio }) {
  let score = 50; // 기본 점수

  // 1. 녹지 공간 비율 점수 (최대 +10점)
  if (greenSpaceRatio < 3) {
    score -= 5; // 3% 미만: -5점
  } else if (greenSpaceRatio < 5) {
    score += 0; // 3-5%: 0점
  } else if (greenSpaceRatio < 8) {
    score += 3; // 5-8%: +3점
  } else if (greenSpaceRatio < 12) {
    score += 6; // 8-12%: +6점
  } else {
    score += 10; // 12% 이상: +10점
  }

  // 2. 저렴한 주거 비율 점수 (최대 +10점)
  if (affordableHousingRatio < 10) {
    score -= 5; // 10% 미만: -5점
  } else if (affordableHousingRatio < 20) {
    score += 0; // 10-20%: 0점
  } else if (affordableHousingRatio < 30) {
    score += 3; // 20-30%: +3점
  } else if (affordableHousingRatio < 40) {
    score += 6; // 30-40%: +6점
  } else {
    score += 10; // 40% 이상: +10점
  }

  // 3. 탄소 배출 지수 점수 (낮을수록 좋음, 최대 +10점)
  if (carbonIndex >= 80) {
    score -= 5; // 80 이상: -5점
  } else if (carbonIndex >= 60) {
    score -= 2; // 60-80: -2점
  } else if (carbonIndex >= 40) {
    score += 0; // 40-60: 0점
  } else if (carbonIndex >= 25) {
    score += 3; // 25-40: +3점
  } else if (carbonIndex >= 15) {
    score += 6; // 15-25: +6점
  } else {
    score += 10; // 15 미만: +10점
  }

  // 4. 일자리 수 점수 (최대 +10점)
  if (totalJobs < 50) {
    score -= 5; // 50개 미만: -5점
  } else if (totalJobs < 100) {
    score += 0; // 50-100개: 0점
  } else if (totalJobs < 150) {
    score += 3; // 100-150개: +3점
  } else if (totalJobs < 250) {
    score += 6; // 150-250개: +6점
  } else {
    score += 10; // 250개 이상: +10점
  }

  // 5. 오픈 스페이스 비율 점수 (최대 +10점)
  if (openSpaceRatio < 5) {
    score -= 3; // 5% 미만: -3점
  } else if (openSpaceRatio < 10) {
    score += 0; // 5-10%: 0점
  } else if (openSpaceRatio < 15) {
    score += 3; // 10-15%: +3점
  } else if (openSpaceRatio < 20) {
    score += 6; // 15-20%: +6점
  } else {
    score += 10; // 20% 이상: +10점
  }

  return Math.max(0, Math.min(100, score));
}
