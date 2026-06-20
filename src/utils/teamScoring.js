import { calculateMetrics } from './calculations.js';
import { TECH_CARDS } from '../data/techCards.js';
import { BUILDINGS_BY_CATEGORY, BUILDINGS } from '../data/buildings.js';
import { BLOCKS } from '../data/blocks.js';

export const TOTAL_TILES = 196;
export const METRIC_MAX = 10;
export const METRIC_KEYS = ['totalJobs', 'profit', 'carbonIndex', 'livabilityScore', 'affordableHousingRatio'];
export const RFP_PENALTY = 3;

export const RFP_MINIMUMS = [
  { id: 'jobs', label: '일자리', threshold: '≥ 1,300개', check: (m) => m.totalJobs >= 1300, failText: '일자리 1,300개 미만' },
  { id: 'affordable', label: '저렴한 집', threshold: '≥ 10%', check: (m) => m.affordableHousingRatio >= 10, failText: '저렴한 집 10% 미만' },
  { id: 'openSpace', label: '오픈스페이스', threshold: '≥ 10%', check: (m) => m.openSpaceRatio >= 10, failText: '오픈스페이스 10% 미만' },
  { id: 'carbon', label: '탄소 배출 지수', threshold: '≤ 35', check: (m) => m.carbonIndex <= 35, failText: '탄소 배출 지수 35 초과' },
  { id: 'livability', label: '살고 싶은 도시', threshold: '≥ 70점', check: (m) => m.livabilityScore >= 70, failText: '살고 싶은 도시 지수 70 미만' },
  { id: 'profit', label: '이윤', threshold: '≥ 0 (흑자)', check: (m) => m.profit >= 0, failText: '이윤 적자' },
];

export const SCORING_RUBRIC = {
  totalJobs: {
    label: '일자리 수',
    shortLabel: '일자리',
    unit: '개',
    bands: [
      { range: '2,800개 이상', min: 2800, score: 10, grade: 'S' },
      { range: '2,200 ~ 2,799', min: 2200, score: 8, grade: 'A' },
      { range: '1,700 ~ 2,199', min: 1700, score: 6, grade: 'B' },
      { range: '1,300 ~ 1,699', min: 1300, score: 4, grade: 'C' },
      { range: '1,000 ~ 1,299', min: 1000, score: 2, grade: 'D' },
      { range: '1,000 미만', min: -Infinity, score: 0, grade: 'F' },
    ],
  },
  profit: {
    label: '이윤 (10년)',
    shortLabel: '이윤',
    unit: '억원',
    toScoreValue: (v) => v / 1e8,
    bands: [
      { range: '100억 이상', min: 100, score: 10, grade: 'S' },
      { range: '60 ~ 99억', min: 60, score: 8, grade: 'A' },
      { range: '30 ~ 59억', min: 30, score: 6, grade: 'B' },
      { range: '10 ~ 29억', min: 10, score: 4, grade: 'C' },
      { range: '0 ~ 9억', min: 0, score: 2, grade: 'D' },
      { range: '적자', min: -Infinity, score: 0, grade: 'F' },
    ],
    toDisplay: (v) => (v / 1e8).toFixed(1),
  },
  carbonIndex: {
    label: '탄소 배출 지수',
    shortLabel: '탄소',
    unit: '점 (↓좋음)',
    lowerIsBetter: true,
    bands: [
      { range: '8 이하', max: 8, score: 10, grade: 'S' },
      { range: '8 ~ 15', max: 15, score: 8, grade: 'A' },
      { range: '15 ~ 22', max: 22, score: 6, grade: 'B' },
      { range: '22 ~ 30', max: 30, score: 4, grade: 'C' },
      { range: '30 ~ 35', max: 35, score: 2, grade: 'D' },
      { range: '35 초과', max: Infinity, score: 0, grade: 'F' },
    ],
    toDisplay: (v) => v.toFixed(1),
  },
  livabilityScore: {
    label: '살고 싶은 도시 지수',
    shortLabel: '거주성',
    unit: '점',
    bands: [
      { range: '95점 이상', min: 95, score: 10, grade: 'S' },
      { range: '88 ~ 94', min: 88, score: 8, grade: 'A' },
      { range: '80 ~ 87', min: 80, score: 6, grade: 'B' },
      { range: '75 ~ 79', min: 75, score: 4, grade: 'C' },
      { range: '70 ~ 74', min: 70, score: 2, grade: 'D' },
      { range: '70 미만', min: -Infinity, score: 0, grade: 'F' },
    ],
  },
  affordableHousingRatio: {
    label: '저렴한 집 비율',
    shortLabel: '저렴한집',
    unit: '%',
    bands: [
      { range: '45% 이상', min: 45, score: 10, grade: 'S' },
      { range: '35 ~ 44%', min: 35, score: 8, grade: 'A' },
      { range: '25 ~ 34%', min: 25, score: 6, grade: 'B' },
      { range: '15 ~ 24%', min: 15, score: 4, grade: 'C' },
      { range: '10 ~ 14%', min: 10, score: 2, grade: 'D' },
      { range: '10% 미만', min: -Infinity, score: 0, grade: 'F' },
    ],
    toDisplay: (v) => v.toFixed(1),
  },
};

const CATEGORIES = ['residential', 'office', 'commercial', 'openSpace', 'other'];
const DEFAULT_BUILDING = {
  commercial: 'supermarket',
  office: 'mediumOffice',
  residential: 'apartment',
  openSpace: 'park',
  other: 'logisticsCenter',
};

export function pickBuildingId(category, rng = Math.random) {
  const ids = BUILDINGS_BY_CATEGORY[category] || [];
  if (!ids.length) return DEFAULT_BUILDING[category];
  if (rng() < 0.7) return DEFAULT_BUILDING[category];
  return ids[Math.floor(rng() * ids.length)];
}

export function makeBlockBuildings(ratios, rng = Math.random) {
  const counts = {};
  for (const cat of CATEGORIES) {
    const r = ratios[cat] || 0;
    const id = pickBuildingId(cat, rng);
    const size = BUILDINGS[id].size || 1;
    counts[id] = (counts[id] || 0) + Math.floor(Math.round(TOTAL_TILES * r) / size);
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

export function randomRatios(rng = Math.random) {
  const weights = CATEGORIES.map(() => rng() + 0.08);
  const sum = weights.reduce((a, b) => a + b, 0);
  return Object.fromEntries(CATEGORIES.map((c, i) => [c, weights[i] / sum]));
}

export function randomAffordableRatio(rng = Math.random) {
  return Math.round(rng() * 20) / 20;
}

export function randomEnvInvestment(rng = Math.random) {
  const steps = [0, 0.5, 1, 1.5, 2];
  return steps[Math.floor(rng() * steps.length)] * 100000000;
}

export function randomTechIds(rng = Math.random) {
  const roll = rng();
  if (roll < 0.35) return [];
  const shuffled = [...TECH_CARDS].sort(() => rng() - 0.5);
  if (roll < 0.65) return [shuffled[0].id];
  for (let i = 0; i < shuffled.length; i++) {
    for (let j = i + 1; j < shuffled.length; j++) {
      if ((shuffled[i].coinCost || 0) + (shuffled[j].coinCost || 0) <= 10) {
        return [shuffled[i].id, shuffled[j].id];
      }
    }
  }
  return [shuffled[0].id];
}

export function createRandomScenario(id, rng = Math.random) {
  return {
    id,
    ratios: randomRatios(rng),
    affordableRatio: randomAffordableRatio(rng),
    environmentInvestment: randomEnvInvestment(rng),
    techIds: randomTechIds(rng),
  };
}

export function evaluateScenario(scenario, rng = Math.random) {
  const metrics = calculateMetrics(
    makeBlockBuildings(scenario.ratios, rng),
    scenario.affordableRatio,
    scenario.environmentInvestment,
    scenario.techIds || []
  );
  return { metrics, scoring: scoreTeam(metrics) };
}

export function scoreBand(key, rawValue) {
  const rub = SCORING_RUBRIC[key];
  const v = rub.toScoreValue ? rub.toScoreValue(rawValue) : rawValue;
  const display = rub.toDisplay ? rub.toDisplay(rawValue) : String(rawValue);
  if (rub.lowerIsBetter) {
    for (const b of rub.bands) {
      if (v <= b.max) return { score: b.score, grade: b.grade, display, range: b.range };
    }
  } else {
    for (const b of rub.bands) {
      if (v >= b.min) return { score: b.score, grade: b.grade, display, range: b.range };
    }
  }
  return { score: 0, grade: '?', display, range: '?' };
}

export function checkRfp(metrics) {
  const failures = [];
  for (const rfp of RFP_MINIMUMS) {
    if (!rfp.check(metrics)) failures.push(rfp);
  }
  return {
    failures,
    penalty: failures.length * RFP_PENALTY,
    passed: failures.length === 0,
    failIds: failures.map((f) => f.id),
  };
}

export function scoreTeam(metrics, presentationBonus = 0) {
  const breakdown = {};
  let rawMetricTotal = 0;
  for (const key of METRIC_KEYS) {
    const band = scoreBand(key, metrics[key]);
    breakdown[key] = { ...band, value: metrics[key] };
    rawMetricTotal += band.score;
  }
  const rfp = checkRfp(metrics);
  const metricTotal = Math.max(0, Math.min(50, rawMetricTotal - rfp.penalty));
  return {
    breakdown,
    rawMetricTotal,
    rfp,
    metricTotal,
    presentationBonus,
    grandTotal: metricTotal + presentationBonus,
  };
}

export function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

export function summarizeResults(rows) {
  const metricTotals = rows.map((r) => r.metricTotal).sort((a, b) => a - b);
  const rawTotals = rows.map((r) => r.rawTotal ?? r.rawMetricTotal ?? 0).sort((a, b) => a - b);
  const rfpPass = rows.filter((r) => r.rfpPassed).length;

  const scoreDist = {};
  for (let s = 0; s <= 50; s += 2) scoreDist[s] = 0;
  for (const r of rows) {
    const bucket = Math.floor(r.metricTotal / 2) * 2;
    scoreDist[bucket] = (scoreDist[bucket] || 0) + 1;
  }

  const rfpFailCounts = Object.fromEntries(RFP_MINIMUMS.map((r) => [r.id, 0]));
  for (const r of rows) {
    for (const id of r.rfpFailIds) rfpFailCounts[id] += 1;
  }

  const bandCounts = {};
  for (const key of METRIC_KEYS) {
    bandCounts[key] = Object.fromEntries([0, 2, 4, 6, 8, 10].map((s) => [s, 0]));
    for (const r of rows) {
      const s = r.breakdown[key]?.score ?? 0;
      bandCounts[key][s] = (bandCounts[key][s] || 0) + 1;
    }
  }

  return {
    count: rows.length,
    metricTotal: {
      min: metricTotals[0],
      max: metricTotals[metricTotals.length - 1],
      avg: Math.round((metricTotals.reduce((a, b) => a + b, 0) / rows.length) * 10) / 10,
      p25: percentile(metricTotals, 25),
      p50: percentile(metricTotals, 50),
      p75: percentile(metricTotals, 75),
    },
    rawMetricTotal: {
      min: rawTotals[0],
      max: rawTotals[rawTotals.length - 1],
      avg: Math.round((rawTotals.reduce((a, b) => a + b, 0) / rows.length) * 10) / 10,
    },
    rfpPassRate: Math.round((rfpPass / rows.length) * 1000) / 10,
    rfpFailCounts,
    scoreDist,
    bandCounts,
  };
}
