import React, { useMemo, useState } from 'react';
import './MetricsDisplay.css';
import { TECH_CARDS } from '../data/techCards';

export default function MetricsDisplay({
  metrics,
  affordableRatio,
  onAffordableRatioChange,
  environmentInvestment,
  onEnvironmentInvestmentChange,
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
  const [expandedSelected, setExpandedSelected] = useState(() => new Set());
  const [flippedModal, setFlippedModal] = useState(() => new Set());

  const normalizedSelected = useMemo(() => {
    const raw = Array.isArray(selectedTechCardIds) ? selectedTechCardIds.filter(Boolean) : [];
    // 혹시 중복/오염 데이터가 들어와도 "최대 2개" 규칙이 안정적으로 적용되게 정규화
    const unique = [];
    for (const id of raw) {
      if (!unique.includes(id)) unique.push(id);
      if (unique.length >= 2) break;
    }
    return unique;
  }, [selectedTechCardIds]);
  const selectedSet = useMemo(() => new Set(normalizedSelected), [normalizedSelected]);
  const selectedCards = useMemo(
    () => normalizedSelected.map((id) => TECH_CARDS.find((c) => c.id === id)).filter(Boolean),
    [normalizedSelected]
  );

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

  function normalizedCoinCost(card) {
    const v = Number(card?.coinCost);
    // 요구사항: 코인은 4/5/6으로만 운영
    if (v === 4 || v === 5 || v === 6) return v;
    // 예외 데이터가 들어오면 UI 상에서는 가장 가까운 값으로 보정
    if (!Number.isFinite(v)) return 4;
    if (v <= 4) return 4;
    if (v >= 6) return 6;
    return 5;
  }

  const budget = 10; // 기술 코인: 항상 10개 고정
  // 최대 2개 선택 제한만 사용 (UI에는 노출하지 않음)

  const getSelectedCostTotal = (ids) => {
    const arr = Array.isArray(ids) ? ids : [];
    let sum = 0;
    for (const id of arr) {
      const c = TECH_CARDS.find((x) => x.id === id);
      if (!c) continue;
      sum += normalizedCoinCost(c);
    }
    return sum;
  };

  // 선택/비활성화 판정이 "가끔 굳어 보이는" 문제를 막기 위해
  // 코인 합산은 memo 없이 매 렌더에서 즉시 계산한다.
  const selectedCostTotal = getSelectedCostTotal(normalizedSelected);

  const toggleTechCard = (cardId) => {
    if (!techCardsEnabled) return;
    if (typeof onSelectedTechCardIdsChange !== 'function') return;
    const card = TECH_CARDS.find((c) => c.id === cardId);
    if (!card) return;

    // setState 함수형 업데이트를 써서 "빠르게 연속 클릭"해도 2개 선택이 안정적으로 유지되게 함
    onSelectedTechCardIdsChange((prev) => {
      const current = Array.isArray(prev) ? prev.filter(Boolean).slice(0, 2) : [];
      const currentSet = new Set(current);

      // 이미 선택됨 → 해제
      if (currentSet.has(cardId)) {
        return current.filter((id) => id !== cardId);
      }

      // 신규 선택 제약: 최대 2개
      if (current.length >= 2) return current;

      const currentCost = getSelectedCostTotal(current);
      const nextCost = currentCost + normalizedCoinCost(card);
      if (nextCost > budget) return current;

      return [...current, cardId];
    });
  };

  const toggleExpanded = (where, id) => {
    const setter = where === 'modal' ? setExpandedModal : setExpandedSelected;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFlipModal = (id) => {
    setFlippedModal((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getTechThemeVars = (id) => {
    // 참고 이미지처럼 카드별 강한 그라데이션 테마
    switch (id) {
      case 'carbon_monitoring':
        return { '--t1': '#16a34a', '--t2': '#22c55e', '--t3': '#064e3b' };
      case 'smart_water_cycle':
        return { '--t1': '#06b6d4', '--t2': '#3b82f6', '--t3': '#0f172a' };
      case 'smart_power_management':
        return { '--t1': '#f59e0b', '--t2': '#f97316', '--t3': '#7c2d12' };
      case 'eco_plastics':
        return { '--t1': '#ec4899', '--t2': '#fb7185', '--t3': '#881337' };
      case 'eco_building_materials':
        return { '--t1': '#8b5cf6', '--t2': '#6366f1', '--t3': '#312e81' };
      case 'smart_transport':
        return { '--t1': '#0ea5e9', '--t2': '#2563eb', '--t3': '#0f172a' };
      case 'energy_storage':
        return { '--t1': '#ef4444', '--t2': '#f97316', '--t3': '#7f1d1d' };
      case 'digital_twin_city':
        return { '--t1': '#111827', '--t2': '#334155', '--t3': '#0b1220' };
      default:
        return { '--t1': '#6366f1', '--t2': '#ec4899', '--t3': '#0f172a' };
    }
  };

  const trendLabel = (trend) => {
    switch (trend) {
      case 'up': return '↑';
      case 'up2': return '↑↑';
      case 'down': return '↓';
      case 'down2': return '↓↓';
      case 'same': return '→';
      case 'mix': return '↑ / ↓';
      default: return '→';
    }
  };

  const canBuy = (card) => {
    if (!techCardsEnabled) return false;
    if (selectedSet.has(card.id)) return true; // 해제 가능
    if (normalizedSelected.length >= 2) return false;
    const nextCost = getSelectedCostTotal(normalizedSelected) + normalizedCoinCost(card);
    return nextCost <= budget;
  };

  return (
    <div className="metrics-display">
      <h2>도시 개발 지표</h2>

      {/* 전체 설정 */}
      <div className="global-settings">
        <div className="settings-section-title">정책 설정</div>
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
            <span>환경 기술 정책 투자 비용: {(environmentInvestment / 100000000).toFixed(1)}억원</span>
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
          <div className="settings-section-title">기술 카드</div>
          {!techCardsEnabled && (
            <div className="tech-disabled-hint">
              현재 기술 카드 기능이 비활성화되어 있어요.
            </div>
          )}

          {normalizedSelected.length > 0 && (
            <div className="tech-selected-cards">
              {selectedCards.map((c) => {
                const effects = formatEffects(c.effects);
                const coin = normalizedCoinCost(c);
                const tags = Array.isArray(c.tags) ? c.tags : [];
                return (
                  <div key={c.id} className="tech-selected-card" style={getTechThemeVars(c.id)}>
                    <div className="tech-selected-card-top">
                      <div className="tech-selected-card-title">{c.name}</div>
                      <div className={`tech-selected-card-cost coin-${coin}`}>코인 {coin}</div>
                    </div>
                    {tags.length > 0 && (
                      <div className="tech-selected-tags">
                        {tags.slice(0, 2).map((t) => (
                          <span key={`${c.id}-${t}`} className="tech-selected-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="tech-selected-card-effects">
                      {effects.length ? effects.join(' · ') : '효과 없음'}
                    </div>
                    <button
                      type="button"
                      className="tech-selected-card-remove"
                      onClick={() => toggleTechCard(c.id)}
                      disabled={!techCardsEnabled}
                    >
                      선택 취소
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="button"
            className="tech-open-btn"
            onClick={() => setIsTechModalOpen(true)}
            disabled={!techCardsEnabled}
          >
            기술 추가하기
          </button>
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
                  최대 2개 · 코인 10개
                </div>
              </div>
              <button type="button" className="tech-modal-close" onClick={() => setIsTechModalOpen(false)}>
                닫기
              </button>
            </div>

            <div className="tech-card-grid modal">
              {TECH_CARDS.map((card) => {
                const isSelected = selectedSet.has(card.id);
                const buyable = canBuy(card);
                const disabled = !buyable;
                const effects = formatEffects(card.effects);
                const coin = normalizedCoinCost(card);
                const tags = Array.isArray(card.tags) ? card.tags : [];
                const considerations = Array.isArray(card.considerations) ? card.considerations : [];
                const impacts = Array.isArray(card.impacts) ? card.impacts : [];
                const isFlipped = flippedModal.has(card.id);
                return (
                  <div
                    key={card.id}
                    className={`tech-flip ${isSelected ? 'selected' : ''} ${disabled && !isSelected ? 'disabled' : ''} ${isFlipped ? 'flipped' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleFlipModal(card.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleFlipModal(card.id);
                      }
                    }}
                    title="클릭하면 카드가 뒤집혀요"
                    style={getTechThemeVars(card.id)}
                  >
                    <div className="tech-flip-inner">
                      {/* FRONT */}
                      <div className="tech-face tech-front">
                        <div className="tech-face-art tech-face-art-front" aria-hidden="true">
                          <div className="tech-front-illus">
                            <div className="tech-front-illus-ring" />
                            <div className="tech-front-illus-card" />
                            <div className="tech-front-illus-dot d1" />
                            <div className="tech-front-illus-dot d2" />
                            <div className="tech-front-illus-dot d3" />
                          </div>
                        </div>
                        <div className="tech-front-content">
                          <div className="tech-front-badges">
                            <div className={`tech-card-cost coin-${coin}`}>코인 {coin}</div>
                            {tags.slice(0, 2).map((t) => (
                              <span key={`${card.id}-tag-${t}`} className="tech-front-tag">
                                {t}
                              </span>
                            ))}
                          </div>

                          <div className="tech-front-title">{card.name}</div>
                        </div>
                      </div>

                      {/* BACK */}
                      <div className="tech-face tech-back">
                        <div className="tech-back-content">
                          <div className="tech-front-badges">
                            <div className={`tech-card-cost coin-${coin}`}>코인 {coin}</div>
                            {tags.slice(0, 2).map((t) => (
                              <span key={`${card.id}-btag-${t}`} className="tech-front-tag">
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className="tech-front-title">{card.name}</div>
                          <div className="tech-front-sub">{card.description}</div>
                          <div className="tech-front-effects">
                            특성/효과: {effects.length ? effects.join(' · ') : '효과 없음'}
                          </div>

                        <button
                            type="button"
                            className={`tech-select-btn ${isSelected ? 'remove' : 'buy'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTechCard(card.id);
                            }}
                            disabled={disabled && !isSelected}
                          >
                          {isSelected ? '선택 취소' : '선택'}
                          </button>
                        </div>
                      </div>
                    </div>
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
