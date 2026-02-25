import React, { useState, useMemo } from 'react';
import BlockEditor from './components/BlockEditor';
import MetricsDisplay from './components/MetricsDisplay';
import MapView from './components/MapView';
import { BLOCKS } from './data/blocks';
import { calculateMetrics } from './utils/calculations';
import './App.css';

function App() {
  // 뷰 모드: 'blocks' 또는 'map'
  const [viewMode, setViewMode] = useState('blocks');
  
  // 블록별 건물 배치 상태 { blockId: [{ buildingId, count }] }
  const [blockBuildings, setBlockBuildings] = useState({});
  
  // 전체 저렴한 주거 비율 (0-1)
  const [affordableRatio, setAffordableRatio] = useState(0);
  
  // 환경 기술 투자 비용
  const [environmentInvestment, setEnvironmentInvestment] = useState(0);

  // 지표 계산
  const metrics = useMemo(() => {
    return calculateMetrics(blockBuildings, affordableRatio, environmentInvestment);
  }, [blockBuildings, affordableRatio, environmentInvestment]);

  const handleBuildingsChange = (blockId, buildings) => {
    setBlockBuildings(prev => ({
      ...prev,
      [blockId]: buildings,
    }));
  };

  // 맵 뷰에서 전체 건물 배치 변경
  const handleMapBuildingsChange = (newBlockBuildings) => {
    setBlockBuildings(newBlockBuildings);
  };


  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>🏙️ 도시 개발 시뮬레이터</h1>
            <p>각 블록에 건물을 배치하고 도시의 지표를 확인하세요</p>
          </div>
        </div>
        <div className="view-mode-selector">
          <button 
            className={viewMode === 'blocks' ? 'active' : ''}
            onClick={() => setViewMode('blocks')}
          >
            📋 블록 편집 모드
          </button>
          <button 
            className={viewMode === 'map' ? 'active' : ''}
            onClick={() => setViewMode('map')}
          >
            🗺️ 맵 배치 모드
          </button>
        </div>
      </header>

      {viewMode === 'blocks' ? (
        <div className="app-content">
          <div className="left-panel">
            <MetricsDisplay
              metrics={metrics}
              affordableRatio={affordableRatio}
              onAffordableRatioChange={setAffordableRatio}
              environmentInvestment={environmentInvestment}
              onEnvironmentInvestmentChange={setEnvironmentInvestment}
            />
          </div>

          <div className="right-panel">
            <h2 className="blocks-title">블록별 건물 배치</h2>
            {BLOCKS.map(block => (
              <BlockEditor
                key={block.id}
                block={block}
                buildings={blockBuildings[block.id] || []}
                onBuildingsChange={(buildings) => handleBuildingsChange(block.id, buildings)}
              />
            ))}
          </div>
        </div>
      ) : (
        <MapView
          blockBuildings={blockBuildings}
          onBuildingsChange={handleMapBuildingsChange}
          affordableRatio={affordableRatio}
          onAffordableRatioChange={setAffordableRatio}
          environmentInvestment={environmentInvestment}
          onEnvironmentInvestmentChange={setEnvironmentInvestment}
        />
      )}
    </div>
  );
}

export default App;
