import React, { useMemo, useState } from 'react';
import './MetricsDisplay.css';
import { TECH_CARDS } from '../data/techCards';

export default function MetricsDisplay({
  metrics,
  affordableRatio,
  onAffordableRatioChange,
  environmentInvestment,
  onEnvironmentInvestmentChange,
  techBudget,
  onTechBudgetChange,
  selectedTechCardIds,
  onSelectedTechCardIdsChange,
  techCardsEnabled = true,
}) {
  /* 앱 액센트(진한 회색)와 통일된 단계별 색상 */
  const getLivabilityColor = (score) => {
    if (score >= 80) return '#111827';
    if (score >= 60) return '#374151';
    if (score >= 40) return '#6b7280';
    return '#9ca3af';
  };

  const getLivabilityText = (score) => {
    if (score >= 80) return '매우 살기 좋은 도시';
    if (score >= 60) return '살기 좋은 도시';
    if (score >= 40) return '보통인 도시';
    return '개선이 필요한 도시';
  };

  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isTechSummaryOpen, setIsTechSummaryOpen] = useState(true);

  const normalizedSelected = useMemo(
    () => (Array.isArray(selectedTechCardIds) ? selectedTechCardIds.filter(Boolean).slice(0, 2) : []),
    [selectedTechCardIds]
  );
  const selectedSet = useMemo(() => new Set(normalizedSelected), [normalizedSelected]);
  const selectedCards = useMemo(
    () => normalizedSelected.map((id) => TECH_CARDS.find((c) => c.id === id)).filter(Boolean),
    [normalizedSelected]
  );
  const selectedCostTotal = useMemo(
    () => selectedCards.reduce((sum, c) => sum + (Number(c.coinCost) || 0), 0),
    [selectedCards]
  );

  const budget = Number.isFinite(Number(techBudget)) ? Number(techBudget) : 0;
  const remainingBudget = Math.max(0, budget - selectedCostTotal);
  const remainingSlots = Math.max(0, 2 - normalizedSelected.length);

  const formatEffects = (effects) => {
    const ef = effects || {};
    const lines = [];
    const pct = (mult) => {
      const v = Math.round((mult - 1) * 100);
      return `${v >= 0 ? '+' : ''}${v}%`;
    };
    if (typeof ef.taxIncomeMultiplier === 'number' && ef.taxIncomeMultiplier !== 1) {
      lines.push(`세금 수입 ${pct(ef.taxIncomeMultiplier)}`);
    }
    if (typeof ef.constructionCostMultiplier === 'number' && ef.constructionCostMultiplier !== 1) {
      lines.push(`건설 비용 ${pct(ef.constructionCostMultiplier)}`);
    }
    if (typeof ef.jobsMultiplier === 'number' && ef.jobsMultiplier !== 1) {
      lines.push(`일자리 ${pct(ef.jobsMultiplier)}`);
    }
    if (typeof ef.carbonMultiplier === 'number' && ef.carbonMultiplier !== 1) {
      lines.push(`탄소 배출 ${pct(ef.carbonMultiplier)}`);
    }
    if (typeof ef.livabilityBonus === 'number' && ef.livabilityBonus !== 0) {
      lines.push(`살고 싶은 도시 지수 +${ef.livabilityBonus}점`);
    }
    return lines;
  };

  const normalizedCoinCost = (card) => {
    const v = Number(card?.coinCost);
    // 요구사항: 코인은 4/5/6으로만 운영
    if (v === 4 || v === 5 || v === 6) return v;
    // 예외 데이터가 들어오면 UI 상에서는 가장 가까운 값으로 보정
    if (!Number.isFinite(v)) return 4;
    if (v <= 4) return 4;
    if (v >= 6) return 6;
    return 5;
  };

  const toggleTechCard = (cardId) => {
    if (typeof onSelectedTechCardIdsChange !== 'function') return;
    const card = TECH_CARDS.find((c) => c.id === cardId);
    if (!card) return;

    // 이미 선택됨 → 해제
    if (selectedSet.has(cardId)) {
      onSelectedTechCardIdsChange(normalizedSelected.filter((id) => id !== cardId));
      return;
    }

    // 신규 구매 제약: 최대 2개, 예산 내
    if (normalizedSelected.length >= 2) return;
    const nextCost = selectedCostTotal + normalizedCoinCost(card);
    if (nextCost > budget) return;

    onSelectedTechCardIdsChange([...normalizedSelected, cardId]);
  };

  const canBuy = (card) => {
    if (selectedSet.has(card.id)) return true; // 해제 가능
    if (normalizedSelected.length >= 2) return false;
    const nextCost = selectedCostTotal + normalizedCoinCost(card);
    return nextCost <= budget;
  };

  return (
    <div className="metrics-display">
      <h2>도시 개발 지표</h2>

      {/* 전체 설정 */}
      <div className="global-settings">
        <div className="investment-setting">
          <label>
            <span>저렴한 주거 비율: {Math.round(affordableRatio * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={affordableRatio}
              onChange={(e) => onAffordableRatioChange(parseFloat(e.target.value))}
            />
          </label>
        </div>
        <div className="investment-setting">
          <label>
            <span>환경 기술 투자 비용: {(environmentInvestment / 100000000).toFixed(1)}억원</span>
            <input
              type="range"
              min="0"
              max="200000000"
              step="10000000"
              value={environmentInvestment}
              onChange={(e) => onEnvironmentInvestmentChange(parseInt(e.target.value))}
            />
          </label>
        </div>

        {/* 기술 카드 */}
        <div className="tech-settings">
          <div className="investment-setting">
            <label>
              <span>
                기술 코인: {budget}개
                <span className="tech-budget-sub">
                  (남은 코인 {remainingBudget}개 · 남은 슬롯 {remainingSlots}개)
                </span>
              </span>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={budget}
                onChange={(e) => {
                  if (typeof onTechBudgetChange !== 'function') return;
                  onTechBudgetChange(parseInt(e.target.value));
                }}
              />
            </label>
          </div>

          <button
            type="button"
            className="tech-open-btn"
            onClick={() => setIsTechModalOpen(true)}
            disabled={!techCardsEnabled}
          >
            기술 추가하기 ({normalizedSelected.length}/2)
          </button>

          {!techCardsEnabled && (
            <div className="tech-disabled-hint">
              현재 기술 카드 기능이 비활성화되어 있어요. (Firestore `pw/pin_num.tech_trig=true`로 바꾸면 활성화)
            </div>
          )}

          {normalizedSelected.length > 0 && (
            <div className="tech-selected-summary">
              {selectedCards.map((c) => {
                const effects = formatEffects(c.effects);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="tech-chip"
                    onClick={() => toggleTechCard(c.id)}
                    title={`${effects.join(' · ') || '효과 없음'}\n(클릭하면 해제)`}
                  >
                    {c.name} · 코인 {c.coinCost} ✕
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 기술 선택 모달 */}
      {isTechModalOpen && (
        <div
          className="tech-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsTechModalOpen(false);
          }}
        >
          <div className="tech-modal" role="dialog" aria-modal="true">
            <div className="tech-modal-header">
              <div>
                <div className="tech-modal-title">기술 카드 선택</div>
                <div className="tech-modal-sub">
                  최대 2개 · 코인 {budget}개 (남은 {remainingBudget}개)
                </div>
              </div>
              <div className="tech-modal-header-actions">
                <button
                  type="button"
                  className="tech-modal-toggle"
                  onClick={() => setIsTechSummaryOpen((v) => !v)}
                >
                  {isTechSummaryOpen ? '요약 접기' : '요약 펼치기'}
                </button>
                <button type="button" className="tech-modal-close" onClick={() => setIsTechModalOpen(false)}>
                  닫기
                </button>
              </div>
            </div>

            {isTechSummaryOpen && (
              <div className="tech-summary">
                <div className="tech-summary-head">
                  <div className="tech-summary-title">요약뷰</div>
                  <div className="tech-summary-hint">코인(4/5/6) · 효과 비교</div>
                </div>
                <div className="tech-summary-list">
                  {TECH_CARDS
                    .slice()
                    .sort((a, b) => normalizedCoinCost(a) - normalizedCoinCost(b) || a.name.localeCompare(b.name))
                    .map((card) => {
                      const isSelected = selectedSet.has(card.id);
                      const effects = formatEffects(card.effects);
                      const coin = normalizedCoinCost(card);
                      return (
                        <div key={`summary-${card.id}`} className={`tech-summary-row ${isSelected ? 'selected' : ''}`}>
                          <div className="tech-summary-left">
                            <div className="tech-summary-name">{card.name}</div>
                            <div className="tech-summary-meta">코인 {coin}</div>
                          </div>
                          <div className="tech-summary-right">
                            {effects.length ? effects.join(' · ') : '효과 없음'}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="tech-card-grid modal">
              {TECH_CARDS.map((card) => {
                const isSelected = selectedSet.has(card.id);
                const buyable = canBuy(card);
                const disabled = !buyable;
                const effects = formatEffects(card.effects);
                const coin = normalizedCoinCost(card);
                const coreEffect = card.coreEffect ? String(card.coreEffect) : '';
                return (
                  <div key={card.id} className={`tech-card ${isSelected ? 'selected' : ''} ${disabled && !isSelected ? 'disabled' : ''}`}>
                    <div className="tech-card-top">
                      <div className="tech-card-title">{card.name}</div>
                      <div className="tech-card-cost">코인 {coin}</div>
                    </div>
                    <div className="tech-card-desc">{card.description}</div>
                    {coreEffect && <div className="tech-core-effect">{coreEffect}</div>}
                    {effects.length > 0 && (
                      <ul className="tech-effects">
                        {effects.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      className={`tech-card-action ${isSelected ? 'remove' : 'buy'}`}
                      onClick={() => toggleTechCard(card.id)}
                      disabled={disabled && !isSelected}
                      title={
                        isSelected
                          ? '해제'
                          : normalizedSelected.length >= 2
                            ? '최대 2개까지 구매할 수 있어요'
                            : (selectedCostTotal + coin > budget)
                              ? '코인이 부족해요'
                              : '구매'
                      }
                    >
                      {isSelected ? '해제' : '구매'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="tech-modal-footer">
              <button type="button" className="tech-modal-done" onClick={() => setIsTechModalOpen(false)}>
                선택 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 건물 개발 시 지표 */}
      <div className="metrics-section">
        <h3>건물 개발 시 지표</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">일자리 수</div>
            <div className="metric-value">{metrics.totalJobs.toLocaleString()}개</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">세금 수입 (10년간)</div>
            <div className="metric-value">{(metrics.totalTaxIncome / 100000000).toFixed(2)}억원</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">건설 비용</div>
            <div className="metric-value">{(metrics.totalConstructionCost / 100000000).toFixed(2)}억원</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">이윤</div>
            <div className={`metric-value ${metrics.profit >= 0 ? 'positive' : 'negative'}`}>
              {(metrics.profit / 100000000).toFixed(2)}억원
            </div>
          </div>
        </div>
      </div>

      {/* 공간 유형별 비율 */}
      <div className="metrics-section">
        <h3>공간 유형별 비율</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">상업 공간</div>
            <div className="metric-value">{metrics.commercialSpaceRatio}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">오피스 공간</div>
            <div className="metric-value">{metrics.officeSpaceRatio}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">주거 공간</div>
            <div className="metric-value">{metrics.residentialSpaceRatio}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">오픈 스페이스</div>
            <div className="metric-value">{metrics.openSpaceRatio}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">기타 시설</div>
            <div className="metric-value">{metrics.otherSpaceRatio}%</div>
          </div>
        </div>
      </div>

      {/* 도시 전체 지표 */}
      <div className="metrics-section">
        <h3>도시 전체 지표</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">녹지 공간 비율</div>
            <div className="metric-value">{metrics.greenSpaceRatio}%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">탄소 배출 지수 (낮을수록 좋음)</div>
            <div className={`metric-value ${metrics.carbonIndex <= 20 ? 'positive' : ''}`}>
              {metrics.carbonIndex.toFixed(1)}
            </div>
            <div className="livability-text">
              칸당 {metrics.carbonPerTile.toFixed(1)}톤 CO2 (순배출 {metrics.netCarbon.toFixed(1)}톤 CO2)
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">저렴한 집 비율</div>
            <div className="metric-value">{metrics.affordableHousingRatio}%</div>
          </div>
          <div className="metric-card livability-card">
            <div className="metric-label">살고 싶은 도시 지수</div>
            <div className="metric-value livability-score">
              {metrics.livabilityScore}점
            </div>
            <div className="livability-text">
              {getLivabilityText(metrics.livabilityScore)}
            </div>
          </div>
        </div>
      </div>

      {/* 추가 정보 */}
      <div className="metrics-section">
        <h3>추가 정보</h3>
        <div className="info-grid">
          <div className="info-item">
            <span>전체 도시 크기:</span>
            <span>{metrics.totalSize}칸</span>
          </div>
          <div className="info-item">
            <span>사용된 공간:</span>
            <span>{metrics.totalUsedSize}칸</span>
          </div>
          <div className="info-item">
            <span>주거 공간:</span>
            <span>{metrics.totalResidentialSpace}칸</span>
          </div>
          <div className="info-item">
            <span>상업 공간:</span>
            <span>{metrics.totalCommercialSpace}칸</span>
          </div>
          <div className="info-item">
            <span>오피스 공간:</span>
            <span>{metrics.totalOfficeSpace}칸</span>
          </div>
          <div className="info-item">
            <span>오픈 스페이스:</span>
            <span>{metrics.totalOpenSpace}칸</span>
          </div>
          <div className="info-item">
            <span>기타 시설:</span>
            <span>{metrics.totalOtherSpace}칸</span>
          </div>
        </div>
      </div>
    </div>
  );
}
