import React from 'react';
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

  const normalizedSelected = Array.isArray(selectedTechCardIds) ? selectedTechCardIds.filter(Boolean).slice(0, 2) : [];
  const selectedSet = new Set(normalizedSelected);
  const selectedCards = normalizedSelected.map((id) => TECH_CARDS.find((c) => c.id === id)).filter(Boolean);
  const selectedCostTotal = selectedCards.reduce((sum, c) => sum + (Number(c.cost) || 0), 0);
  const budget = Number(techBudget) || 0;
  const remainingBudget = Math.max(0, budget - selectedCostTotal);
  const remainingSlots = Math.max(0, 2 - normalizedSelected.length);

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
    const nextCost = selectedCostTotal + (Number(card.cost) || 0);
    if (nextCost > budget) return;

    onSelectedTechCardIdsChange([...normalizedSelected, cardId]);
  };

  const canBuy = (card) => {
    if (selectedSet.has(card.id)) return true; // 해제 가능
    if (normalizedSelected.length >= 2) return false;
    const nextCost = selectedCostTotal + (Number(card.cost) || 0);
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
                기술 도입 예산: {(budget / 100000000).toFixed(1)}억원
                <span className="tech-budget-sub">
                  (남은 예산 {(remainingBudget / 100000000).toFixed(1)}억원 · 남은 슬롯 {remainingSlots}개)
                </span>
              </span>
              <input
                type="range"
                min="0"
                max="20000000000"
                step="500000000"
                value={budget}
                onChange={(e) => {
                  if (typeof onTechBudgetChange !== 'function') return;
                  onTechBudgetChange(parseInt(e.target.value));
                }}
              />
            </label>
          </div>

          <div className="tech-card-grid">
            {TECH_CARDS.map((card) => {
              const isSelected = selectedSet.has(card.id);
              const buyable = canBuy(card);
              const disabled = !buyable;
              return (
                <div key={card.id} className={`tech-card ${isSelected ? 'selected' : ''}`}>
                  <div className="tech-card-top">
                    <div className="tech-card-title">{card.name}</div>
                    <div className="tech-card-cost">{(card.cost / 100000000).toFixed(0)}억원</div>
                  </div>
                  <div className="tech-card-desc">{card.description}</div>
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
                          : (selectedCostTotal + (Number(card.cost) || 0) > budget)
                            ? '예산이 부족해요'
                            : '구매'
                    }
                  >
                    {isSelected ? '해제' : '구매'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
            {typeof metrics.techCostTotal === 'number' && metrics.techCostTotal > 0 && (
              <div className="livability-text">
                기술 도입 비용 {(metrics.techCostTotal / 100000000).toFixed(1)}억원 반영됨
              </div>
            )}
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
