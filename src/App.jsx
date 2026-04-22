import React, { useState, useMemo, useEffect, useRef } from 'react';
import BlockEditor from './components/BlockEditor';
import MetricsDisplay from './components/MetricsDisplay';
import MapView from './components/MapView';
import { BLOCKS } from './data/blocks';
import { calculateMetrics } from './utils/calculations';
import { getOrCreateSession, saveCityData, loadCityData, verifyAccessCode } from './utils/api';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseFirestore, hasFirebaseWebConfig } from './utils/firebaseClient';
import './App.css';

function App() {
  // 접속 코드 인증 상태
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [accessError, setAccessError] = useState('');
  const authExpiryTimerRef = useRef(null);

  const AUTH_STORAGE_KEY = 'cityAccessAuth_v1';
  const AUTH_TTL_MS = 4 * 60 * 60 * 1000; // 4시간

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

  // 기술 카드(버프) 예산/선택 (전역)
  const [techBudget, setTechBudget] = useState(10); // 기술 코인 10개
  const [selectedTechCardIds, setSelectedTechCardIds] = useState([]);
  const [techCardsEnabled, setTechCardsEnabled] = useState(true);

  // 자동 저장 타이머
  const saveTimerRef = useRef(null);

  // 지표 계산
  const metrics = useMemo(() => {
    return calculateMetrics(
      blockBuildings,
      blockAffordableRatio,
      blockEnvironmentInvestment,
      techCardsEnabled ? selectedTechCardIds : []
    );
  }, [blockBuildings, blockAffordableRatio, blockEnvironmentInvestment, selectedTechCardIds, techCardsEnabled]);

  // 초기 세션 로드
  useEffect(() => {
    if (!isAuthorized) return;

    async function initializeSession() {
      try {
        // 기술 카드 기능 플래그 (Firestore)
        if (hasFirebaseWebConfig()) {
          try {
            const db = getFirebaseFirestore();
            if (db) {
              // Firestore 문서: pw/pin_num (필드: tech_trig)
              // tech_trig === true → 기술 카드 활성화, false → 비활성화
              const snap = await getDoc(doc(db, 'pw', 'pin_num'));
              const enabled = snap.exists() ? Boolean(snap.data()?.tech_trig) : true;
              setTechCardsEnabled(enabled);
            }
          } catch {
            // 플래그 조회 실패 시 기본 활성화
            setTechCardsEnabled(true);
          }
        }

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

            // 기술 카드 상태 복원
            if (cityData.techBudget !== undefined) {
              // 구버전(현금 단위 예산) 호환: 10억/100억 같은 값이 들어있으면 코인 10으로 마이그레이션
              const v = Number(cityData.techBudget);
              if (Number.isFinite(v) && v > 100) {
                setTechBudget(10);
              } else {
                setTechBudget(cityData.techBudget);
              }
            }
            if (Array.isArray(cityData.selectedTechCardIds)) {
              setSelectedTechCardIds(cityData.selectedTechCardIds);
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
  }, [isAuthorized]);

  // 기술 카드 기능이 비활성화되면 선택 초기화 (효과 반영도 차단)
  useEffect(() => {
    if (!techCardsEnabled) {
      setSelectedTechCardIds([]);
    }
  }, [techCardsEnabled]);

  // 자동 저장 (변경 후 2초 대기)
  useEffect(() => {
    if (!isAuthorized) return;

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

          // 기술 카드
          techBudget,
          selectedTechCardIds,
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
  }, [sessionId, blockBuildings, tileBuildings, blockAffordableRatio, blockEnvironmentInvestment, mapAffordableRatio, mapEnvironmentInvestment, techBudget, selectedTechCardIds, isLoading, isAuthorized]);

  // 저장된 인증(1시간) 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const authorizedUntil = Number(parsed?.authorizedUntil);
      if (!authorizedUntil || Number.isNaN(authorizedUntil)) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }
      if (Date.now() < authorizedUntil) {
        setIsAuthorized(true);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  // 인증 만료 타이머 (1시간 지나면 다시 PIN 입력)
  useEffect(() => {
    if (authExpiryTimerRef.current) {
      clearTimeout(authExpiryTimerRef.current);
      authExpiryTimerRef.current = null;
    }

    if (!isAuthorized) return;

    let authorizedUntil = null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const v = Number(parsed?.authorizedUntil);
        if (v && !Number.isNaN(v)) authorizedUntil = v;
      }
    } catch {
      // ignore
    }

    if (!authorizedUntil) {
      // 혹시 저장이 없으면 즉시 만료 처리
      setIsAuthorized(false);
      return;
    }

    const msLeft = authorizedUntil - Date.now();
    if (msLeft <= 0) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setIsAuthorized(false);
      return;
    }

    authExpiryTimerRef.current = setTimeout(() => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setIsAuthorized(false);
    }, msLeft);

    return () => {
      if (authExpiryTimerRef.current) {
        clearTimeout(authExpiryTimerRef.current);
        authExpiryTimerRef.current = null;
      }
    };
  }, [isAuthorized]);

  const handleAccessSubmit = (e) => {
    e.preventDefault();
    const trimmed = accessCodeInput.trim();
    if (!trimmed) {
      setAccessError('코드를 입력해주세요.');
      return;
    }

    (async () => {
      try {
        setAccessError('');
        const result = await verifyAccessCode(trimmed);
        if (result.ok) {
          // 1시간 동안 재입력 없이 통과 (기기/브라우저 로컬 저장)
          const authorizedUntil = Date.now() + AUTH_TTL_MS;
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify({
              authorizedUntil,
              lastRotatedAt: result.lastRotatedAt || null,
            })
          );
          setIsAuthorized(true);
          setAccessError('');
        } else {
          setAccessError('코드가 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('접속 코드 검증 오류:', err);
        setAccessError('코드가 올바르지 않거나(또는) 서버에 연결할 수 없습니다. 백엔드 없이 쓰려면 Vercel에 VITE_ACCESS_PIN을 설정하세요.');
      }
    })();
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

  // 맵 뷰에서 타일별 건물 배치 변경
  const handleTileBuildingsChange = (newTileBuildings) => {
    setTileBuildings(newTileBuildings);
  };

  // 접속 코드 입력 화면
  if (!isAuthorized) {
    return (
      <div className="app access-gate">
        <div className="access-panel">
          <h1>도시 개발 시뮬레이터</h1>
          <p>접속 코드를 입력하면 시뮬레이터를 사용할 수 있습니다.</p>
          <form onSubmit={handleAccessSubmit} className="access-form">
            <input
              type="password"
              className="access-input"
              placeholder="접속 코드"
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
            />
            {accessError && <div className="access-error">{accessError}</div>}
            <button type="submit" className="access-button">
              입장하기
            </button>
          </form>
        </div>
      </div>
    );
  }

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
              techBudget={techBudget}
              onTechBudgetChange={setTechBudget}
              selectedTechCardIds={selectedTechCardIds}
              onSelectedTechCardIdsChange={setSelectedTechCardIds}
              techCardsEnabled={techCardsEnabled}
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
          techBudget={techBudget}
          onTechBudgetChange={setTechBudget}
          selectedTechCardIds={selectedTechCardIds}
          onSelectedTechCardIdsChange={setSelectedTechCardIds}
          techCardsEnabled={techCardsEnabled}
        />
      )}
    </div>
  );
}

export default App;
