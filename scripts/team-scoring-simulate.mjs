/**
 * 팀 채점 시뮬레이션 (통합版)
 * - 지표 50점 만점 + RFP 미달 시 항목당 -3점
 * - 발표 가산점 0~10 (별도)
 * - 기술 카드: 팀이 선택한 경우 반영 (ON/OFF 분리 없음)
 *
 * 실행: node scripts/team-scoring-simulate.mjs
 */
import { calculateMetrics } from '../src/utils/calculations.js';
import { TECH_CARDS } from '../src/data/techCards.js';
import { BUILDINGS_BY_CATEGORY, BUILDINGS } from '../src/data/buildings.js';
import { BLOCKS } from '../src/data/blocks.js';

const TOTAL_TILES = 196;
const METRIC_MAX = 10;
const METRIC_KEYS = ['totalJobs', 'profit', 'carbonIndex', 'livabilityScore', 'affordableHousingRatio'];
const RFP_PENALTY = 3;

// ── RFP 최소 기준 (1개라도 미달 → 해당 항목 -3점) ──
const RFP_MINIMUMS = [
  {
    id: 'jobs',
    label: '일자리',
    check: (m) => m.totalJobs >= 1300,
    failText: '일자리 1,300개 미만',
    display: (m) => `${m.totalJobs}개`,
  },
  {
    id: 'affordable',
    label: '저렴한 집',
    check: (m) => m.affordableHousingRatio >= 10,
    failText: '저렴한 집 10% 미만',
    display: (m) => `${m.affordableHousingRatio.toFixed(1)}%`,
  },
  {
    id: 'openSpace',
    label: '오픈스페이스',
    check: (m) => m.openSpaceRatio >= 10,
    failText: '오픈스페이스 10% 미만',
    display: (m) => `${m.openSpaceRatio.toFixed(1)}%`,
  },
  {
    id: 'carbon',
    label: '탄소',
    check: (m) => m.carbonIndex <= 35,
    failText: '탄소 배출 지수 35 초과',
    display: (m) => `${m.carbonIndex.toFixed(1)}점`,
  },
  {
    id: 'livability',
    label: '거주성',
    check: (m) => m.livabilityScore >= 70,
    failText: '살고 싶은 도시 지수 70 미만',
    display: (m) => `${m.livabilityScore}점`,
  },
  {
    id: 'profit',
    label: '이윤',
    check: (m) => m.profit >= 0,
    failText: '이윤 적자',
    display: (m) => `${(m.profit / 1e8).toFixed(1)}억`,
  },
];

// ── 지표별 구간 점수 (각 10점 만점, 합 50점) ──
const SCORING_RUBRIC = {
  totalJobs: {
    label: '일자리 수',
    unit: '개',
    bands: [
      { min: 2800, score: 10, grade: 'S' },
      { min: 2200, score: 8, grade: 'A' },
      { min: 1700, score: 6, grade: 'B' },
      { min: 1300, score: 4, grade: 'C' },
      { min: 1000, score: 2, grade: 'D' },
      { min: -Infinity, score: 0, grade: 'F' },
    ],
  },
  profit: {
    label: '이윤 (10년)',
    unit: '억원',
    toScoreValue: (v) => v / 1e8,
    bands: [
      { min: 100, score: 10, grade: 'S' },
      { min: 60, score: 8, grade: 'A' },
      { min: 30, score: 6, grade: 'B' },
      { min: 10, score: 4, grade: 'C' },
      { min: 0, score: 2, grade: 'D' },
      { min: -Infinity, score: 0, grade: 'F (적자)' },
    ],
    toDisplay: (v) => (v / 1e8).toFixed(1),
  },
  carbonIndex: {
    label: '탄소 배출 지수',
    unit: '점 (↓좋음)',
    lowerIsBetter: true,
    bands: [
      { max: 8, score: 10, grade: 'S' },
      { max: 15, score: 8, grade: 'A' },
      { max: 22, score: 6, grade: 'B' },
      { max: 30, score: 4, grade: 'C' },
      { max: 35, score: 2, grade: 'D' },
      { max: Infinity, score: 0, grade: 'F' },
    ],
    toDisplay: (v) => v.toFixed(1),
  },
  livabilityScore: {
    label: '살고 싶은 도시 지수',
    unit: '점',
    bands: [
      { min: 95, score: 10, grade: 'S' },
      { min: 88, score: 8, grade: 'A' },
      { min: 80, score: 6, grade: 'B' },
      { min: 75, score: 4, grade: 'C' },
      { min: 70, score: 2, grade: 'D' },
      { min: -Infinity, score: 0, grade: 'F' },
    ],
  },
  affordableHousingRatio: {
    label: '저렴한 집 비율',
    unit: '%',
    bands: [
      { min: 45, score: 10, grade: 'S' },
      { min: 35, score: 8, grade: 'A' },
      { min: 25, score: 6, grade: 'B' },
      { min: 15, score: 4, grade: 'C' },
      { min: 10, score: 2, grade: 'D' },
      { min: -Infinity, score: 0, grade: 'F' },
    ],
    toDisplay: (v) => v.toFixed(1),
  },
};

// ── 시나리오 생성 ──
function selectBuildingId(category) {
  if (category === 'commercial') return 'supermarket';
  if (category === 'office') return 'mediumOffice';
  if (category === 'residential') return 'apartment';
  if (category === 'openSpace') return 'park';
  if (category === 'other') return 'logisticsCenter';
  return BUILDINGS_BY_CATEGORY[category]?.[0];
}

function makeBlockBuildings(ratios) {
  const counts = {};
  for (const [cat, r] of Object.entries(ratios)) {
    const id = selectBuildingId(cat);
    const size = BUILDINGS[id].size || 1;
    counts[id] = Math.floor(Math.round(TOTAL_TILES * r) / size);
  }
  const blockBuildings = {};
  const blocks = BLOCKS.map((b) => ({ id: b.id, left: b.totalSize || 0 }));
  for (const [buildingId, count] of Object.entries(counts).filter(([, c]) => c > 0)) {
    const size = BUILDINGS[buildingId]?.size || 1;
    let remaining = count;
    for (const b of blocks) {
      if (remaining <= 0) break;
      const put = Math.min(Math.floor(b.left / size), remaining);
      if (put <= 0) continue;
      if (!blockBuildings[b.id]) blockBuildings[b.id] = [];
      blockBuildings[b.id].push({ buildingId, count: put });
      b.left -= put * size;
      remaining -= put;
    }
  }
  return blockBuildings;
}

const TEAM_PRESETS = [
  {
    id: 'A', label: 'A팀 · 경제·일자리 극대화',
    desc: '물류·오피스 집중, 저렴한 주거 5%',
    ratios: { residential: 0.14, office: 0.28, commercial: 0.18, openSpace: 0.10, other: 0.30 },
    affordableRatio: 0.05, environmentInvestment: 0, techIds: [], presentationBonus: 7,
  },
  {
    id: 'B', label: 'B팀 · 친환경·녹지 도시',
    desc: '공원 중심, 환경투자 2억, 저렴한 주거 30%',
    ratios: { residential: 0.18, office: 0.12, commercial: 0.08, openSpace: 0.46, other: 0.16 },
    affordableRatio: 0.30, environmentInvestment: 200000000,
    techIds: ['eco_building_materials', 'smart_water_cycle'], presentationBonus: 9,
  },
  {
    id: 'C', label: 'C팀 · 균형형',
    desc: '균형 배치, 저렴한 주거 20%, 환경투자 1억',
    ratios: { residential: 0.26, office: 0.20, commercial: 0.14, openSpace: 0.26, other: 0.14 },
    affordableRatio: 0.20, environmentInvestment: 100000000,
    techIds: ['smart_transport', 'eco_plastics'], presentationBonus: 8,
  },
  {
    id: 'D', label: 'D팀 · 사회적 형평·주거 중심',
    desc: '저렴한 주거 50%, 공원 확대',
    ratios: { residential: 0.40, office: 0.12, commercial: 0.10, openSpace: 0.28, other: 0.10 },
    affordableRatio: 0.50, environmentInvestment: 50000000, techIds: [], presentationBonus: 8,
  },
  {
    id: 'E', label: 'E팀 · 상업·오피스 허브',
    desc: '오피스·상업 집중, 저렴한 주거 15%',
    ratios: { residential: 0.16, office: 0.34, commercial: 0.24, openSpace: 0.14, other: 0.12 },
    affordableRatio: 0.15, environmentInvestment: 0,
    techIds: ['smart_power_management', 'digital_twin_city'], presentationBonus: 6,
  },
  {
    id: 'F', label: 'F팀 · 균형+기술',
    desc: '균형 + 기술 2장, 환경투자 1.5억',
    ratios: { residential: 0.24, office: 0.18, commercial: 0.12, openSpace: 0.30, other: 0.16 },
    affordableRatio: 0.25, environmentInvestment: 150000000,
    techIds: ['smart_transport', 'smart_water_cycle'], presentationBonus: 9,
  },
  {
    id: 'G', label: 'G팀 · 산업·물류 특화',
    desc: '물류센터 대량',
    ratios: { residential: 0.12, office: 0.14, commercial: 0.10, openSpace: 0.12, other: 0.52 },
    affordableRatio: 0.10, environmentInvestment: 0,
    techIds: ['carbon_monitoring'], presentationBonus: 5,
  },
  {
    id: 'H', label: 'H팀 · 저렴한 주거·환경 극대',
    desc: '저렴한 주거 60%, 환경투자 2억',
    ratios: { residential: 0.32, office: 0.10, commercial: 0.08, openSpace: 0.42, other: 0.08 },
    affordableRatio: 0.60, environmentInvestment: 200000000,
    techIds: ['eco_plastics', 'energy_storage'], presentationBonus: 7,
  },
];

function scoreBand(key, rawValue) {
  const rub = SCORING_RUBRIC[key];
  const v = rub.toScoreValue ? rub.toScoreValue(rawValue) : rawValue;
  const display = rub.toDisplay ? rub.toDisplay(rawValue) : String(rawValue);
  if (rub.lowerIsBetter) {
    for (const b of rub.bands) {
      if (v <= b.max) return { score: b.score, grade: b.grade, display };
    }
  } else {
    for (const b of rub.bands) {
      if (v >= b.min) return { score: b.score, grade: b.grade, display };
    }
  }
  return { score: 0, grade: '?', display };
}

function checkRfp(metrics) {
  const failures = [];
  for (const rfp of RFP_MINIMUMS) {
    if (!rfp.check(metrics)) {
      failures.push({ ...rfp, value: rfp.display(metrics) });
    }
  }
  return {
    failures,
    penalty: failures.length * RFP_PENALTY,
    passed: failures.length === 0,
  };
}

function scoreTeam(metrics, presentationBonus) {
  const breakdown = {};
  let rawMetricTotal = 0;
  for (const key of METRIC_KEYS) {
    const band = scoreBand(key, metrics[key]);
    breakdown[key] = { ...band, value: metrics[key] };
    rawMetricTotal += band.score;
  }
  const rfp = checkRfp(metrics);
  const metricTotal = Math.max(0, Math.min(50, rawMetricTotal - rfp.penalty));
  const grandTotal = metricTotal + presentationBonus;
  return {
    breakdown,
    rawMetricTotal,
    rfp,
    metricTotal,
    presentationBonus,
    grandTotal,
  };
}

function runTeam(preset) {
  const metrics = calculateMetrics(
    makeBlockBuildings(preset.ratios),
    preset.affordableRatio,
    preset.environmentInvestment,
    preset.techIds || []
  );
  return { metrics, scoring: scoreTeam(metrics, preset.presentationBonus) };
}

function fmtTech(ids) {
  if (!ids?.length) return '(없음)';
  return ids.map((id) => TECH_CARDS.find((c) => c.id === id)?.name?.replace(/^[^\s]+\s/, '') || id).join(' + ');
}

function printResults(results) {
  const sorted = [...results].sort((a, b) => b.scoring.grandTotal - a.scoring.grandTotal);

  console.log('\n순위 | 팀 | 구간합 | RFP감 | 지표 | 발표+ | **합계** | RFP미달');
  console.log('-'.repeat(85));
  for (const [i, r] of sorted.entries()) {
    const s = r.scoring;
    const fails = s.rfp.failures.map((f) => f.id).join(',') || '-';
    console.log(
      `${String(i + 1).padStart(2)}   | ${r.preset.id}  | ${String(s.rawMetricTotal).padStart(5)}   | ${String(-s.rfp.penalty).padStart(5)}   | ${String(s.metricTotal).padStart(4)} | ${String(s.presentationBonus).padStart(5)} | ${String(s.grandTotal).padStart(6)}   | ${fails}`
    );
  }

  console.log('\n── 팀별 상세 ──');
  for (const r of sorted) {
    const s = r.scoring;
    const m = r.metrics;
    console.log(`\n[${r.preset.label}] ${r.preset.desc}`);
    console.log(`  기술: ${fmtTech(r.preset.techIds)}`);
    for (const key of METRIC_KEYS) {
      const rub = SCORING_RUBRIC[key];
      const b = s.breakdown[key];
      console.log(`  ${rub.label}: ${b.display}${rub.unit} → ${b.score}/${METRIC_MAX} (${b.grade})`);
    }
    console.log(`  구간 합계: ${s.rawMetricTotal}/50`);
    if (s.rfp.failures.length) {
      console.log(`  RFP 미달 (${s.rfp.failures.length}건 × -3):`);
      for (const f of s.rfp.failures) console.log(`    · ${f.failText} (현재 ${f.value})`);
      console.log(`  RFP 감점: -${s.rfp.penalty}`);
    } else {
      console.log('  RFP: 전 항목 충족');
    }
    console.log(`  **지표 ${s.metricTotal}/50 + 발표 가산 ${s.presentationBonus}/10 = ${s.grandTotal}/60**`);
    console.log(`  (이윤 ${(m.profit / 1e8).toFixed(1)}억 | 일자리 ${m.totalJobs} | 탄소 ${m.carbonIndex} | 거주성 ${m.livabilityScore} | 저렴한집 ${m.affordableHousingRatio}% | 오픈 ${m.openSpaceRatio}%)`);
  }
  return sorted;
}

function main() {
  console.log('도시 계산기 — 통합 채점 시뮬레이션');
  console.log('지표 50점 (구간점수 - RFP감점) + 발표 가산 0~10 = 최대 60점\n');

  const results = TEAM_PRESETS.map((p) => ({ preset: p, ...runTeam(p) }));
  const ranked = printResults(results);

  console.log('\n\n── RFP 최소 기준 ──');
  for (const r of RFP_MINIMUMS) console.log(`  · ${r.failText.replace(' 미만', '').replace(' 초과', '').replace(' 적자', ' ≥ 0')}`);

  console.log('\n── 1등 ──');
  const w = ranked[0];
  console.log(`${w.preset.label}: 지표 ${w.scoring.metricTotal} + 발표 ${w.scoring.presentationBonus} = **${w.scoring.grandTotal}점**`);
}

main();
