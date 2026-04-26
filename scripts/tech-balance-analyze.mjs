import { calculateMetrics } from '../src/utils/calculations.js';
import { TECH_CARDS } from '../src/data/techCards.js';
import { BUILDINGS_BY_CATEGORY, BUILDINGS } from '../src/data/buildings.js';
import { BLOCKS } from '../src/data/blocks.js';

// 앱 계산 로직(`src/utils/calculations.js`)은 totalSize를 196으로 고정해서 사용한다.
// 분석도 동일한 기준(196)으로 맞춰야 카드 효과 비교가 정확해진다.
const TOTAL_TILES = 196;

const METRICS = [
  { key: 'profit', better: 'up' },
  { key: 'totalJobs', better: 'up' },
  { key: 'totalTaxIncome', better: 'up' },
  { key: 'totalConstructionCost', better: 'down' },
  { key: 'carbonIndex', better: 'down' },
  { key: 'livabilityScore', better: 'up' },
];

function round(n, p = 4) {
  const m = 10 ** p;
  return Math.round(n * m) / m;
}

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function pctDelta(base, next) {
  const denom = Math.max(1, Math.abs(base));
  return (next - base) / denom;
}

function normalizeDelta(metricKey, base, next) {
  const spec = METRICS.find((m) => m.key === metricKey);
  const d = pctDelta(base, next);
  const signed = spec?.better === 'down' ? -d : d;
  // outlier로 분석이 깨지지 않게 캡을 둠 (±50%)
  return clamp(signed, -0.5, 0.5);
}

function selectBuildingId(category) {
  // 시나리오 편향을 줄이려면 대표 건물 1개를 고정하지 않는 게 좋지만,
  // 분석 스크립트 1차 버전에서는 카테고리별 중간급을 선택해 일관성을 확보한다.
  const ids = BUILDINGS_BY_CATEGORY[category] || [];
  if (!ids.length) throw new Error(`No buildings for category: ${category}`);
  if (category === 'commercial') return 'supermarket';
  if (category === 'office') return 'mediumOffice';
  if (category === 'residential') return 'apartment';
  if (category === 'openSpace') return 'park';
  if (category === 'other') return 'logisticsCenter';
  return ids[0];
}

function allocateCountsByTiles(tileBudgetByCategory) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const [category, tiles] of Object.entries(tileBudgetByCategory)) {
    const id = selectBuildingId(category);
    const size = BUILDINGS[id].size || 1;
    const count = Math.max(0, Math.floor(tiles / size));
    counts[id] = (counts[id] || 0) + count;
  }
  return counts;
}

function distributeToBlocks(buildingCounts) {
  /** @type {Record<string, Array<{buildingId: string, count: number}>>} */
  const blockBuildings = {};
  const blocks = BLOCKS.map((b) => ({ id: b.id, left: b.totalSize || 0 }));

  const entries = Object.entries(buildingCounts).filter(([, c]) => c > 0);
  for (const [buildingId, count] of entries) {
    const size = BUILDINGS[buildingId]?.size || 1;
    let remaining = count;
    for (const b of blocks) {
      if (remaining <= 0) break;
      const maxFit = Math.floor(b.left / size);
      if (maxFit <= 0) continue;
      const put = Math.min(maxFit, remaining);
      if (!blockBuildings[b.id]) blockBuildings[b.id] = [];
      blockBuildings[b.id].push({ buildingId, count: put });
      b.left -= put * size;
      remaining -= put;
    }
    if (remaining > 0) {
      // 전체 도시 타일(196)을 넘기면 남는 건 버림 (분석 목적상 OK)
    }
  }
  return blockBuildings;
}

function makeScenario(name, ratios) {
  const tileBudgetByCategory = Object.fromEntries(
    Object.entries(ratios).map(([cat, r]) => [cat, Math.round(TOTAL_TILES * r)])
  );
  const counts = allocateCountsByTiles(tileBudgetByCategory);
  const blockBuildings = distributeToBlocks(counts);
  return { name, blockBuildings };
}

const SCENARIOS = [
  makeScenario('balanced', {
    residential: 0.26,
    office: 0.20,
    commercial: 0.14,
    openSpace: 0.26,
    other: 0.14,
  }),
  makeScenario('residential_heavy', {
    residential: 0.42,
    office: 0.14,
    commercial: 0.10,
    openSpace: 0.24,
    other: 0.10,
  }),
  makeScenario('office_commercial_heavy', {
    residential: 0.18,
    office: 0.32,
    commercial: 0.22,
    openSpace: 0.18,
    other: 0.10,
  }),
  makeScenario('green_heavy', {
    residential: 0.20,
    office: 0.16,
    commercial: 0.10,
    openSpace: 0.44,
    other: 0.10,
  }),
  makeScenario('industry_heavy', {
    residential: 0.18,
    office: 0.14,
    commercial: 0.10,
    openSpace: 0.18,
    other: 0.40,
  }),
];

const BASE_PARAMS = {
  affordableRatio: 0.2,
  environmentInvestment: 0,
};

function scoreFromDeltas(deltas) {
  const vals = METRICS.map((m) => deltas[m.key]);
  const sum = vals.reduce((a, b) => a + b, 0);
  return sum / vals.length;
}

function evaluateCardOnScenario(cardIds, scenario) {
  const base = calculateMetrics(
    scenario.blockBuildings,
    BASE_PARAMS.affordableRatio,
    BASE_PARAMS.environmentInvestment,
    []
  );
  const next = calculateMetrics(
    scenario.blockBuildings,
    BASE_PARAMS.affordableRatio,
    BASE_PARAMS.environmentInvestment,
    cardIds
  );

  /** @type {Record<string, number>} */
  const deltas = {};
  for (const m of METRICS) {
    deltas[m.key] = normalizeDelta(m.key, base[m.key], next[m.key]);
  }
  return {
    base,
    next,
    deltas,
    score: scoreFromDeltas(deltas),
  };
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);
}

function evaluateCard(cardId) {
  const perScenario = SCENARIOS.map((s) => ({
    scenario: s.name,
    ...evaluateCardOnScenario([cardId], s),
  }));
  const score = avg(perScenario.map((x) => x.score));
  /** @type {Record<string, number>} */
  const deltasAvg = {};
  for (const m of METRICS) {
    deltasAvg[m.key] = avg(perScenario.map((x) => x.deltas[m.key]));
  }
  return { cardId, score, deltasAvg, perScenario };
}

function evaluatePair(a, b) {
  const perScenario = SCENARIOS.map((s) => ({
    scenario: s.name,
    ...evaluateCardOnScenario([a, b], s),
  }));
  const score = avg(perScenario.map((x) => x.score));
  return { a, b, score, perScenario };
}

function coinCostById(id) {
  const c = TECH_CARDS.find((x) => x.id === id);
  return Number(c?.coinCost) || 0;
}

function printCardResults(results) {
  const rows = results
    .map((r) => {
      const c = TECH_CARDS.find((x) => x.id === r.cardId);
      return {
        coin: coinCostById(r.cardId),
        id: r.cardId,
        name: c?.name || r.cardId,
        score: round(r.score, 4),
        profit: round(r.deltasAvg.profit, 4),
        jobs: round(r.deltasAvg.totalJobs, 4),
        tax: round(r.deltasAvg.totalTaxIncome, 4),
        cost: round(r.deltasAvg.totalConstructionCost, 4),
        carbon: round(r.deltasAvg.carbonIndex, 4),
        liv: round(r.deltasAvg.livabilityScore, 4),
      };
    })
    .sort((a, b) => b.score - a.score);

  const byCoin = new Map();
  for (const row of rows) {
    const k = row.coin;
    if (!byCoin.has(k)) byCoin.set(k, []);
    byCoin.get(k).push(row);
  }

  for (const coin of [4, 5, 6]) {
    const list = byCoin.get(coin) || [];
    console.log(`\n=== COIN ${coin} (n=${list.length}) ===`);
    for (const r of list) {
      console.log(
        `${r.score >= 0 ? '+' : ''}${r.score}\t${r.name} (${r.id})  | Δprofit ${r.profit}, Δjobs ${r.jobs}, Δtax ${r.tax}, Δcost ${r.cost}, Δcarbon ${r.carbon}, Δliv ${r.liv}`
      );
    }
    if (list.length >= 2) {
      const scores = list.map((x) => x.score);
      const mean = avg(scores);
      const variance = avg(scores.map((s) => (s - mean) ** 2));
      const std = Math.sqrt(variance);
      const max = Math.max(...scores);
      const min = Math.min(...scores);
      console.log(
        `coin${coin} summary: mean=${round(mean, 4)} std=${round(std, 4)} range=${round(min, 4)}..${round(max, 4)}`
      );
    }
  }
}

function printSynergy(cardResults, pairResults) {
  const scoreById = new Map(cardResults.map((r) => [r.cardId, r.score]));
  const rows = pairResults
    .map((p) => {
      const synergy = p.score - (scoreById.get(p.a) || 0) - (scoreById.get(p.b) || 0);
      return {
        a: p.a,
        b: p.b,
        coin: coinCostById(p.a) + coinCostById(p.b),
        score: p.score,
        synergy,
      };
    })
    .sort((x, y) => y.synergy - x.synergy);

  console.log('\n=== TOP SYNERGY (coinSum<=10) ===');
  for (const r of rows.slice(0, 10)) {
    const aName = TECH_CARDS.find((c) => c.id === r.a)?.name || r.a;
    const bName = TECH_CARDS.find((c) => c.id === r.b)?.name || r.b;
    console.log(
      `synergy ${round(r.synergy, 4)} | pairScore ${round(r.score, 4)} | coin ${r.coin} | ${aName} + ${bName}`
    );
  }
}

function main() {
  console.log(`Scenarios: ${SCENARIOS.map((s) => s.name).join(', ')}`);
  console.log(`Total tiles: ${TOTAL_TILES}, affordableRatio=${BASE_PARAMS.affordableRatio}, envInvestment=${BASE_PARAMS.environmentInvestment}`);

  const cardResults = TECH_CARDS.map((c) => evaluateCard(c.id));
  printCardResults(cardResults);

  const ids = TECH_CARDS.map((c) => c.id);
  /** @type {Array<{a:string,b:string,score:number,perScenario:any[]}>} */
  const pairResults = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i];
      const b = ids[j];
      const coinSum = coinCostById(a) + coinCostById(b);
      if (coinSum > 10) continue;
      pairResults.push(evaluatePair(a, b));
    }
  }
  printSynergy(cardResults, pairResults);
}

main();

