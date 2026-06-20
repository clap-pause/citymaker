/**
 * 1000개 랜덤 도시 시나리오 채점 시뮬레이션
 * 실행: node scripts/simulate-1000.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  METRIC_KEYS,
  METRIC_MAX,
  RFP_MINIMUMS,
  RFP_PENALTY,
  SCORING_RUBRIC,
  createRandomScenario,
  evaluateScenario,
  summarizeResults,
} from '../src/utils/teamScoring.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const COUNT = 1000;
const SEED = 42;

function mulberry32(seed) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rowToCsv(fields) {
  return fields.map((f) => {
    const s = String(f ?? '');
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',');
}

function flattenRow(id, metrics, scoring) {
  const b = scoring.breakdown;
  return {
    id,
    jobs: metrics.totalJobs,
    profit: (metrics.profit / 1e8).toFixed(1),
    carbon: metrics.carbonIndex.toFixed(1),
    livability: metrics.livabilityScore,
    affordable: metrics.affordableHousingRatio.toFixed(1),
    openSpace: metrics.openSpaceRatio.toFixed(1),
    jobsScore: b.totalJobs.score,
    profitScore: b.profit.score,
    carbonScore: b.carbonIndex.score,
    livabilityScore: b.livabilityScore.score,
    affordableScore: b.affordableHousingRatio.score,
    rawTotal: scoring.rawMetricTotal,
    rfpPenalty: scoring.rfp.penalty,
    rfpPassed: scoring.rfp.passed,
    rfpFailIds: scoring.rfp.failIds,
    rfpFails: scoring.rfp.failIds.join('|'),
    metricTotal: scoring.metricTotal,
    breakdown: b,
  };
}

function buildCsv(rows) {
  const header = [
    'id', '일자리', '이윤(억)', '탄소', '거주성', '저렴한집(%)', '오픈(%)',
    '일자리점', '이윤점', '탄소점', '거주성점', '저렴한집점',
    '구간합', 'RFP감점', 'RFP통과', 'RFP미달', '지표합',
  ];
  const lines = [rowToCsv(header)];
  for (const r of rows) {
    lines.push(rowToCsv([
      r.id, r.jobs, r.profit, r.carbon, r.livability, r.affordable, r.openSpace,
      r.jobsScore, r.profitScore, r.carbonScore, r.livabilityScore, r.affordableScore,
      r.rawTotal, r.rfpPenalty, r.rfpPassed ? 1 : 0, r.rfpFails, r.metricTotal,
    ]));
  }
  return lines.join('\n');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tableHtml(headers, rows, className = '') {
  const th = headers.map((h) => `<th>${esc(h)}</th>`).join('');
  const tr = rows.map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<table class="${className}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

function buildHtml(summary, topRows, scoreDistRows, rfpRows, bandRows) {
  const rubricSections = METRIC_KEYS.map((key) => {
    const rub = SCORING_RUBRIC[key];
    const rows = rub.bands.map((b) => [esc(b.range), `<strong>${b.score}점</strong>`, esc(b.grade)]);
    return `<section><h3>${esc(rub.label)} <span class="badge">최대 ${METRIC_MAX}점</span></h3>${tableHtml(['구간', '점수', '등급'], rows, 'rubric')}</section>`;
  }).join('');

  const rfpTable = tableHtml(
    ['항목', 'RFP 최소 기준', '미달 시'],
    RFP_MINIMUMS.map((r) => [esc(r.label), esc(r.threshold), `<span class="penalty">−${RFP_PENALTY}점</span>`]),
    'rfp'
  );

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>도시 계산기 팀 채점표</title>
  <style>
    :root { --bg:#f8f9fb; --card:#fff; --text:#1a1a2e; --muted:#5c6370; --line:#e2e5eb; --accent:#2563eb; --penalty:#dc2626; --pass:#059669; }
    * { box-sizing:border-box; }
    body { font-family:"Pretendard","Apple SD Gothic Neo","Malgun Gothic",sans-serif; background:var(--bg); color:var(--text); margin:0; line-height:1.5; }
    .wrap { max-width:1100px; margin:0 auto; padding:32px 20px 64px; }
    h1 { font-size:1.6rem; margin:0 0 8px; }
    .sub { color:var(--muted); margin-bottom:28px; }
    h2 { font-size:1.15rem; margin:36px 0 12px; padding-bottom:8px; border-bottom:2px solid var(--line); }
    h3 { font-size:1rem; margin:20px 0 10px; }
    section { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:16px 18px; margin-bottom:14px; }
    table { width:100%; border-collapse:collapse; font-size:0.88rem; }
    th, td { border:1px solid var(--line); padding:8px 10px; text-align:center; }
    th { background:#eef1f6; font-weight:600; }
    td:first-child, th:first-child { text-align:left; }
    .overview td:last-child { font-weight:700; color:var(--accent); }
    .penalty { color:var(--penalty); font-weight:700; }
    .pass { color:var(--pass); font-weight:600; }
    .badge { font-size:0.75rem; background:#eef2ff; color:var(--accent); padding:2px 8px; border-radius:999px; font-weight:600; }
    .stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:10px; margin-bottom:12px; }
    .stat { background:#f3f4f6; border-radius:8px; padding:12px; text-align:center; }
    .stat .val { font-size:1.4rem; font-weight:700; color:var(--accent); }
    .stat .lbl { font-size:0.75rem; color:var(--muted); }
    .note { font-size:0.82rem; color:var(--muted); margin-top:8px; }
  </style>
</head>
<body>
<div class="wrap">
  <h1>도시 계산기 — 팀 채점표</h1>
  <p class="sub">지표 50점 + 발표 가산 0~10 · ${COUNT}회 랜덤 시뮬 (seed=${SEED})</p>

  <h2>① 점수 구조</h2>
  <section>${tableHtml(['구분', '배점', '설명'], [
    ['지표 점수', '<strong>50점</strong>', '5지표×10점 − RFP 감점'],
    ['발표 가산', '<strong>+0~10</strong>', '심사위원 수동'],
    ['합계', '<strong>최대 60</strong>', '순위 기준'],
  ], 'overview')}</section>

  <h2>② RFP 최소 기준</h2>
  <section>${rfpTable}<p class="note">RFP 전항목 충족: <strong class="pass">${summary.rfpPassRate}%</strong></p></section>

  <h2>③ 지표별 구간 점수</h2>
  ${rubricSections}

  <h2>④ ${COUNT}회 시뮬 요약</h2>
  <section>
    <div class="stat-grid">
      <div class="stat"><div class="val">${summary.metricTotal.min}~${summary.metricTotal.max}</div><div class="lbl">지표 범위</div></div>
      <div class="stat"><div class="val">${summary.metricTotal.avg}</div><div class="lbl">평균</div></div>
      <div class="stat"><div class="val">${summary.metricTotal.p50}</div><div class="lbl">중앙값</div></div>
      <div class="stat"><div class="val">${summary.metricTotal.p25}/${summary.metricTotal.p75}</div><div class="lbl">p25/p75</div></div>
    </div>
    <h3>점수 분포</h3>${tableHtml(['구간', '건수', '비율'], scoreDistRows)}
    <h3>RFP 미달 빈도</h3>${tableHtml(['항목', '미달', '비율'], rfpRows)}
    <h3>지표별 점수 분포</h3>${tableHtml(['지표', '0', '2', '4', '6', '8', '10'], bandRows)}
  </section>

  <h2>⑤ 상위 30 시나리오</h2>
  <section>${tableHtml(['#','ID','일자리','이윤','탄소','거주성','저렴한집','구간합','RFP감','지표','RFP'], topRows)}</section>

  <h2>⑥ 현장 채점 양식</h2>
  <section>${tableHtml(['팀','일자리','이윤','탄소','거주성','저렴한집','구간합','RFP감','지표','발표+','합계','순위'], [['','','','','','','','','','','','']])}</section>
</div>
</body>
</html>`;
}

function main() {
  const rng = mulberry32(SEED);
  const flatRows = [];

  for (let i = 1; i <= COUNT; i++) {
    const scenario = createRandomScenario(`S${String(i).padStart(4, '0')}`, rng);
    const { metrics, scoring } = evaluateScenario(scenario, rng);
    flatRows.push(flattenRow(scenario.id, metrics, scoring));
  }

  const summary = summarizeResults(flatRows);
  const sorted = [...flatRows].sort((a, b) => b.metricTotal - a.metricTotal);

  const dataDir = path.join(ROOT, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'simulation-1000-results.csv'), buildCsv(flatRows), 'utf8');
  fs.writeFileSync(path.join(dataDir, 'simulation-1000-summary.json'), JSON.stringify(summary, null, 2), 'utf8');

  const scoreDistRows = Object.entries(summary.scoreDist)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .filter(([, c]) => c > 0)
    .map(([bucket, c]) => [`${bucket}~${Number(bucket) + 1}`, String(c), `${(c / COUNT * 100).toFixed(1)}%`]);

  const rfpRows = RFP_MINIMUMS.map((r) => {
    const c = summary.rfpFailCounts[r.id] || 0;
    return [esc(r.label), String(c), `${(c / COUNT * 100).toFixed(1)}%`];
  });

  const bandRows = METRIC_KEYS.map((key) => {
    const bc = summary.bandCounts[key];
    return [esc(SCORING_RUBRIC[key].shortLabel), ...[0, 2, 4, 6, 8, 10].map((s) => String(bc[s] || 0))];
  });

  const topRows = sorted.slice(0, 30).map((r, i) => [
    String(i + 1), esc(r.id), String(r.jobs), `${r.profit}억`, r.carbon, String(r.livability), `${r.affordable}%`,
    String(r.rawTotal), r.rfpPenalty ? `−${r.rfpPenalty}` : '0', `<strong>${r.metricTotal}</strong>`,
    r.rfpPassed ? '<span class="pass">통과</span>' : esc(r.rfpFails),
  ]);

  fs.writeFileSync(path.join(ROOT, '팀_채점표.html'), buildHtml(summary, topRows, scoreDistRows, rfpRows, bandRows), 'utf8');

  console.log(`${COUNT}건 완료 → data/simulation-1000-results.csv, 팀_채점표.html`);
  console.log(`지표: ${summary.metricTotal.min}~${summary.metricTotal.max} (avg ${summary.metricTotal.avg}, med ${summary.metricTotal.p50})`);
  console.log(`RFP 충족: ${summary.rfpPassRate}%`);
}

main();
