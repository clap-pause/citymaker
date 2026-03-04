import React, { useState, useMemo, useEffect, useRef } from 'react';
import BlockEditor from './components/BlockEditor';
import MetricsDisplay from './components/MetricsDisplay';
import MapView from './components/MapView';
import { BLOCKS } from './data/blocks';
import { MAP_LAYOUT } from './data/mapLayout';
import { calculateMetrics } from './utils/calculations';
import { getOrCreateSession, saveCityData, loadCityData } from './utils/api';
import './App.css';

function App() {
  // 뷰 모드: 'blocks' 또는 'map'
  const [viewMode, setViewMode] = useState('map'); // 기본값을 'map'으로 변경
  
  // 세션 ID
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  
  // 블록별 건물 배치 상태 { blockId: [{ buildingId, count }] }
  const [blockBuildings, setBlockBuildings] = useState({});
  
  // 타일별 건물 배치 상태 { "blockId-x-y": { buildingId, rotation, instanceId } }
  // 위치 정보를 유지하기 위해 별도로 관리
  const [tileBuildings, setTileBuildings] = useState({});
  
  // 블록 편집 모드용 저렴한 주거 비율 / 환경 투자
  const [blockAffordableRatio, setBlockAffordableRatio] = useState(0);
  const [blockEnvironmentInvestment, setBlockEnvironmentInvestment] = useState(0);

  // 맵 배치 모드용 저렴한 주거 비율 / 환경 투자
  const [mapAffordableRatio, setMapAffordableRatio] = useState(0);
  const [mapEnvironmentInvestment, setMapEnvironmentInvestment] = useState(0);

  // 자동 저장 타이머
  const saveTimerRef = useRef(null);

  // 지표 계산
  const metrics = useMemo(() => {
    return calculateMetrics(blockBuildings, blockAffordableRatio, blockEnvironmentInvestment);
  }, [blockBuildings, blockAffordableRatio, blockEnvironmentInvestment]);

  // 초기 세션 로드
  useEffect(() => {
    async function initializeSession() {
      try {
        const savedSessionId = localStorage.getItem('citySessionId');
        const session = await getOrCreateSession(savedSessionId);
        setSessionId(session.sessionId);
        setIsOffline(session.offline || false);
        
        if (session.exists || session.offline) {
          // 기존 데이터 로드
          try {
            const cityData = await loadCityData(session.sessionId);
            if (cityData.blockBuildings) {
              setBlockBuildings(cityData.blockBuildings);
            }
            if (cityData.tileBuildings) {
              setTileBuildings(cityData.tileBuildings);
            }
            // 블록/맵 모드별 저렴한 주거 비율 및 환경 투자 복원
            if (cityData.blockAffordableRatio !== undefined) {
              setBlockAffordableRatio(cityData.blockAffordableRatio);
            } else if (cityData.affordableRatio !== undefined) {
              // 구 버전 호환: 단일 값이 있으면 블록/맵 모두에 초기값으로 사용
              setBlockAffordableRatio(cityData.affordableRatio);
              setMapAffordableRatio(cityData.affordableRatio);
            }

            if (cityData.mapAffordableRatio !== undefined) {
              setMapAffordableRatio(cityData.mapAffordableRatio);
            }

            if (cityData.blockEnvironmentInvestment !== undefined) {
              setBlockEnvironmentInvestment(cityData.blockEnvironmentInvestment);
            } else if (cityData.environmentInvestment !== undefined) {
              setBlockEnvironmentInvestment(cityData.environmentInvestment);
              setMapEnvironmentInvestment(cityData.environmentInvestment);
            }

            if (cityData.mapEnvironmentInvestment !== undefined) {
              setMapEnvironmentInvestment(cityData.mapEnvironmentInvestment);
            }
            if (cityData.offline) {
              setIsOffline(true);
            }
          } catch (error) {
            console.log('기존 데이터 로드 실패, 새로 시작합니다');
          }
        }
        
        localStorage.setItem('citySessionId', session.sessionId);
      } catch (error) {
        console.error('세션 초기화 오류:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeSession();
  }, []);

  // 자동 저장 (변경 후 2초 대기)
  useEffect(() => {
    if (!sessionId || isLoading) return;
    
    // 기존 타이머 취소
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    // 새 타이머 설정
    saveTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatus('저장 중...');
        const result = await saveCityData(sessionId, {
          blockBuildings,
          tileBuildings,
          // 모드별 지표 값 저장
          blockAffordableRatio,
          blockEnvironmentInvestment,
          mapAffordableRatio,
          mapEnvironmentInvestment,
          // 구 버전 호환을 위해 블록 편집 모드 값을 기본값으로도 저장
          affordableRatio: blockAffordableRatio,
          environmentInvestment: blockEnvironmentInvestment,
        });
        
        if (result.offline) {
          setIsOffline(true);
          setSaveStatus('로컬 저장됨');
        } else {
          setIsOffline(false);
          setSaveStatus('저장됨');
        }
        
        // 3초 후 상태 메시지 제거
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (error) {
        console.error('자동 저장 오류:', error);
        setSaveStatus('저장 실패');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    }, 2000);
    
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [sessionId, blockBuildings, tileBuildings, blockAffordableRatio, blockEnvironmentInvestment, mapAffordableRatio, mapEnvironmentInvestment, isLoading]);

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

  // 맵 뷰에서 타일별 건물 배치 변경
  const handleTileBuildingsChange = (newTileBuildings) => {
    setTileBuildings(newTileBuildings);
  };

  if (isLoading) {
    return (
      <div className="app">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>로딩 중...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>🏙️ 도시 개발 시뮬레이터</h1>
            <p>각 블록에 건물을 배치하고 도시의 지표를 확인하세요</p>
          </div>
          {saveStatus && (
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px',
              fontSize: '12px',
              color: isOffline ? '#ea580c' : '#16a34a',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              {saveStatus}
              {isOffline && ' (오프라인)'}
            </div>
          )}
        </div>
        <div className="view-mode-selector">
          <button 
            className={viewMode === 'map' ? 'active' : ''}
            onClick={() => setViewMode('map')}
          >
            🗺️ 맵 배치 모드
          </button>
          <button 
            className={viewMode === 'blocks' ? 'active' : ''}
            onClick={() => setViewMode('blocks')}
          >
            📋 블록 편집 모드
          </button>
        </div>
      </header>

      {viewMode === 'blocks' ? (
        <div className="app-content">
          <div className="left-panel">
            <MetricsDisplay
              metrics={metrics}
              affordableRatio={blockAffordableRatio}
              onAffordableRatioChange={setBlockAffordableRatio}
              environmentInvestment={blockEnvironmentInvestment}
              onEnvironmentInvestmentChange={setBlockEnvironmentInvestment}
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
          tileBuildings={tileBuildings}
          onTileBuildingsChange={handleTileBuildingsChange}
          affordableRatio={mapAffordableRatio}
          onAffordableRatioChange={setMapAffordableRatio}
          environmentInvestment={mapEnvironmentInvestment}
          onEnvironmentInvestmentChange={setMapEnvironmentInvestment}
        />
      )}
    </div>
  );
}

export default App;
