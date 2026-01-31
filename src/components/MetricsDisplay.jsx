import React from 'react';
import './MetricsDisplay.css';

export default function MetricsDisplay({ metrics, affordableRatio, onAffordableRatioChange, environmentInvestment, onEnvironmentInvestmentChange }) {
  const getLivabilityColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    if (score >= 40) return '#e67e22';
    return '#e74c3c';
  };

  const getLivabilityText = (score) => {
    if (score >= 80) return '매우 살기 좋은 도시';
    if (score >= 60) return '살기 좋은 도시';
    if (score >= 40) return '보통인 도시';
    return '개선이 필요한 도시';
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
            <div className="livability-text" style={{ color: 'rgba(255,255,255,0.9)' }}>
              칸당 {metrics.carbonPerTile.toFixed(1)}톤 CO2 (순배출 {metrics.netCarbon.toFixed(1)}톤 CO2)
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">저렴한 집 비율</div>
            <div className="metric-value">{metrics.affordableHousingRatio}%</div>
          </div>
          <div className="metric-card livability-card">
            <div className="metric-label">살고 싶은 도시 지수</div>
            <div 
              className="metric-value livability-score"
              style={{ color: getLivabilityColor(metrics.livabilityScore) }}
            >
              {metrics.livabilityScore}점
            </div>
            <div className="livability-text" style={{ color: getLivabilityColor(metrics.livabilityScore) }}>
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
