import React, { useState, useMemo, useEffect, useRef } from 'react';
import BlockEditor from './components/BlockEditor';
import MetricsDisplay from './components/MetricsDisplay';
import MapView from './components/MapView';
import { BLOCKS } from './data/blocks';
import { calculateMetrics } from './utils/calculations';
import { getOrCreateSession, saveCityData, loadCityData } from './utils/api';
import './App.css';

function App() {
  // 뷰 모드: 'blocks' 또는 'map'
  const [viewMode, setViewMode] = useState('blocks');
  
  // 세션 ID
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  
  // 블록별 건물 배치 상태 { blockId: [{ buildingId, count }] }
  const [blockBuildings, setBlockBuildings] = useState({});
  
  // 전체 저렴한 주거 비율 (0-1)
  const [affordableRatio, setAffordableRatio] = useState(0);
  
  // 환경 기술 투자 비용
  const [environmentInvestment, setEnvironmentInvestment] = useState(0);
  
  // 자동 저장 타이머
  const saveTimerRef = useRef(null);

  // 지표 계산
  const metrics = useMemo(() => {
    return calculateMetrics(blockBuildings, affordableRatio, environmentInvestment);
  }, [blockBuildings, affordableRatio, environmentInvestment]);

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
            if (cityData.affordableRatio !== undefined) {
              setAffordableRatio(cityData.affordableRatio);
            }
            if (cityData.environmentInvestment !== undefined) {
              setEnvironmentInvestment(cityData.environmentInvestment);
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
          affordableRatio,
          environmentInvestment,
        });
        
        if (result.offline) {
          setIsOffline(true);
          setSaveStatus('로컬 저장됨 (오프라인)');
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
  }, [sessionId, blockBuildings, affordableRatio, environmentInvestment, isLoading]);

  // 수동 저장
  const handleManualSave = async () => {
    if (!sessionId) return;
    
    try {
      setSaveStatus('저장 중...');
      const result = await saveCityData(sessionId, {
        blockBuildings,
        affordableRatio,
        environmentInvestment,
      });
      
      if (result.offline) {
        setIsOffline(true);
        setSaveStatus('로컬 저장됨 (오프라인)');
      } else {
        setIsOffline(false);
        setSaveStatus('저장 완료!');
      }
      
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('저장 오류:', error);
      setSaveStatus('저장 실패');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h1>🏙️ 도시 개발 시뮬레이터</h1>
            <p>각 블록에 건물을 배치하고 도시의 지표를 확인하세요</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <button 
              onClick={handleManualSave}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              💾 저장
            </button>
            {saveStatus && (
              <span style={{ fontSize: '12px', color: isOffline ? '#ff9800' : '#4CAF50' }}>
                {saveStatus}
              </span>
            )}
            {isOffline && (
              <span style={{ fontSize: '11px', color: '#ff9800' }}>
                ⚠️ 오프라인 모드
              </span>
            )}
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
