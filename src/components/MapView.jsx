import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MAP_LAYOUT } from '../data/mapLayout';
import { BUILDINGS, BUILDINGS_BY_CATEGORY } from '../data/buildings';
import { calculateMetrics } from '../utils/calculations';
import { getBuildingTiles, getBuildingBounds } from '../utils/buildingShapes';
import { getBuildingPatternStyle } from '../utils/buildingVisuals';
import MetricsDisplay from './MetricsDisplay';
import MapView3D from './MapView3D';
import './MapView.css';

export default function MapView({ 
  tileBuildings: externalTileBuildings,
  onTileBuildingsChange,
  affordableRatio,
  onAffordableRatioChange,
  environmentInvestment,
  onEnvironmentInvestmentChange,
  techBudget,
  onTechBudgetChange,
  selectedTechCardIds,
  onSelectedTechCardIdsChange,
}) {
  const [viewMode3D, setViewMode3D] = useState(false); // 2D/3D 뷰 전환
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingRotation, setBuildingRotation] = useState(0); // 회전 각도 (0, 90, 180, 270)
  const [hoveredTile, setHoveredTile] = useState(null);
  const [draggingBuilding, setDraggingBuilding] = useState(null); // 팔레트에서 드래그 중인 buildingId
  const [draggingInstance, setDraggingInstance] = useState(null); // 맵에 배치된 건물(인스턴스) 드래그
  const [dragStartPos, setDragStartPos] = useState(null);
  const mapContainerRef = useRef(null);
  const instanceSeqRef = useRef(1);
  const removedInstanceRef = useRef(null); // { instanceId, tilesSnapshot }

  // 타일별 건물 배치 상태 { "blockId-x-y": { buildingId, rotation, instanceId } }
  // 외부에서 전달된 tileBuildings가 있으면 사용, 없으면 로컬 상태 사용
  const [localTileBuildings, setLocalTileBuildings] = useState({});
  const tileBuildings = externalTileBuildings !== undefined ? externalTileBuildings : localTileBuildings;
  
  const setTileBuildings = (newTiles) => {
    if (externalTileBuildings !== undefined) {
      // 외부에서 관리하는 경우
      onTileBuildingsChange(newTiles);
    } else {
      // 로컬에서 관리하는 경우
      setLocalTileBuildings(newTiles);
    }
  };

  // blockBuildings 동기화 제거 - 맵 배치 모드는 독립적으로 동작

  // R 키로 회전 (드래그 중/선택 중)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key?.toLowerCase() === 'r') {
        setBuildingRotation((prev) => (prev + 90) % 360);
      }
      if (e.key === 'Escape') {
        // 이동 중인 인스턴스 취소(원복)
        if (removedInstanceRef.current?.tilesSnapshot) {
          setTileBuildings(removedInstanceRef.current.tilesSnapshot);
          removedInstanceRef.current = null;
        }
        setDraggingInstance(null);
        setDraggingBuilding(null);
        setHoveredTile(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // 건물의 실제 타일 위치 가져오기 (회전 및 모양 고려)
  const getBuildingTilePositions = (building, rotation, startX, startY) => {
    return getBuildingTiles(building, rotation, startX, startY);
  };

  // 건물 배치 가능 여부 확인
  const canPlaceBuildingAt = (block, startX, startY, building, rotation, tiles = tileBuildings) => {
    const positions = getBuildingTilePositions(building, rotation, startX, startY);
    const bounds = getBuildingBounds(building, rotation);

    // 블록 범위 확인 (바운딩 박스 기준 1차 체크)
    if (startX + bounds.width > block.width || startY + bounds.height > block.height) {
      return false;
    }

    // 각 타일 위치에 대해 실제로 블록 내부/겹침 여부 2차 체크
    for (const pos of positions) {
      // 블록 경계를 벗어나는 타일이 하나라도 있으면 배치 불가
      if (pos.x < 0 || pos.y < 0 || pos.x >= block.width || pos.y >= block.height) {
        return false;
      }

      const tileKey = `${block.id}-${pos.x}-${pos.y}`;
      
      // 이미 건물이 있는지
      if (tiles[tileKey]) {
        return false;
      }
      
      // 기존 건물 영역인지
      const hasExisting = block.existingBuildings.some(eb => 
        pos.x >= eb.x && pos.x < eb.x + eb.width &&
        pos.y >= eb.y && pos.y < eb.y + eb.height
      );
      if (hasExisting) {
        return false;
      }
    }
    
    return true;
  };

  // blockBuildings 동기화 제거 - 맵 배치 모드는 독립적으로 동작

  // 타일 클릭 핸들러
  const handleTileClick = (block, tileX, tileY) => {
    if (!selectedBuilding) return;
    
    const building = BUILDINGS[selectedBuilding];
    if (!building) return;
    
    const canPlace = canPlaceBuildingAt(block, tileX, tileY, building, buildingRotation);
    if (!canPlace) return;
    
    // 건물 배치
    const newTileBuildings = { ...tileBuildings };
    const instanceId = `i${Date.now()}_${instanceSeqRef.current++}`;
    const positions = getBuildingTilePositions(building, buildingRotation, tileX, tileY);
    
    positions.forEach(pos => {
      const tileKey = `${block.id}-${pos.x}-${pos.y}`;
      newTileBuildings[tileKey] = { buildingId: selectedBuilding, rotation: buildingRotation, instanceId };
    });
    
    setTileBuildings(newTileBuildings);
  };

  // 드래그 시작
  const handleDragStart = (e, buildingId) => {
    e.preventDefault();
    setDraggingBuilding(buildingId);
    setDraggingInstance(null);
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStartPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // 드래그 중
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!draggingBuilding) return;
    
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 마우스 위치를 타일 좌표로 변환
    const tileX = Math.floor(x / MAP_LAYOUT.tileSize);
    const tileY = Math.floor(y / MAP_LAYOUT.tileSize);
    
    // 어떤 블록에 있는지 확인
    const block = MAP_LAYOUT.blocks.find(b => {
      const blockLeft = b.x * MAP_LAYOUT.tileSize;
      const blockTop = b.y * MAP_LAYOUT.tileSize;
      const blockRight = blockLeft + b.width * MAP_LAYOUT.tileSize;
      const blockBottom = blockTop + b.height * MAP_LAYOUT.tileSize;
      
      return x >= blockLeft && x < blockRight && y >= blockTop && y < blockBottom;
    });
    
    if (block) {
      const relativeX = tileX - block.x;
      const relativeY = tileY - block.y;
      
      if (relativeX >= 0 && relativeX < block.width && relativeY >= 0 && relativeY < block.height) {
        setHoveredTile({ blockId: block.id, x: relativeX, y: relativeY });
      }
    }
  };

  // 드래그 종료
  const handleDrop = (e) => {
    e.preventDefault();
    const droppingBuildingId = draggingInstance?.buildingId || draggingBuilding;
    if (!droppingBuildingId || !hoveredTile) {
      setDraggingBuilding(null);
      setDraggingInstance(null);
      setHoveredTile(null);
      return;
    }
    
    const building = BUILDINGS[droppingBuildingId];
    if (!building) {
      setDraggingBuilding(null);
      setDraggingInstance(null);
      return;
    }
    
    const block = MAP_LAYOUT.blocks.find(b => b.id === hoveredTile.blockId);
    if (!block) {
      setDraggingBuilding(null);
      setDraggingInstance(null);
      return;
    }
    
    const rotationToUse = draggingInstance?.rotation ?? buildingRotation;
    const canPlace = canPlaceBuildingAt(block, hoveredTile.x, hoveredTile.y, building, rotationToUse);
    if (canPlace) {
      const newTileBuildings = { ...tileBuildings };
      const instanceId = draggingInstance?.instanceId || `i${Date.now()}_${instanceSeqRef.current++}`;
      const positions = getBuildingTilePositions(building, rotationToUse, hoveredTile.x, hoveredTile.y);
      
      positions.forEach(pos => {
        const tileKey = `${block.id}-${pos.x}-${pos.y}`;
        newTileBuildings[tileKey] = { buildingId: droppingBuildingId, rotation: rotationToUse, instanceId };
      });
      
      setTileBuildings(newTileBuildings);
    }
    
    setDraggingBuilding(null);
    setDraggingInstance(null);
    removedInstanceRef.current = null;
    setHoveredTile(null);
  };

  // 회전 버튼 클릭
  const handleRotate = (e) => {
    e.stopPropagation();
    setBuildingRotation((prev) => (prev + 90) % 360);
  };


  // 타일 삭제 (우클릭)
  const handleTileRightClick = (e, block, tileX, tileY) => {
    e.preventDefault();
    const tileKey = `${block.id}-${tileX}-${tileY}`;
    const tileData = tileBuildings[tileKey];
    
    if (tileData) {
      const building = BUILDINGS[tileData.buildingId];
      if (building) {
        // 같은 건물의 모든 타일 찾아서 삭제
        const newTileBuildings = { ...tileBuildings };

        // instanceId 기준으로 삭제
        const instanceId = tileData.instanceId;
        for (let y = 0; y < block.height; y++) {
          for (let x = 0; x < block.width; x++) {
            const key = `${block.id}-${x}-${y}`;
            if (newTileBuildings[key]?.instanceId === instanceId) {
              delete newTileBuildings[key];
            }
          }
        }
        
        setTileBuildings(newTileBuildings);
      }
    }
  };

  // 지표 계산
  const metrics = useMemo(() => {
    const convertedBuildings = {};
    
    MAP_LAYOUT.blocks.forEach(block => {
      const instanceGroups = {};
      
      for (let y = 0; y < block.height; y++) {
        for (let x = 0; x < block.width; x++) {
          const tileKey = `${block.id}-${x}-${y}`;
          const tileData = tileBuildings[tileKey];
          
          if (tileData) {
            const { buildingId, instanceId } = tileData;
            if (!instanceGroups[instanceId]) {
              instanceGroups[instanceId] = buildingId;
            }
          }
        }
      }
      
      const buildings = [];
      const counts = {};
      Object.values(instanceGroups).forEach((buildingId) => {
        counts[buildingId] = (counts[buildingId] || 0) + 1;
      });
      Object.entries(counts).forEach(([buildingId, count]) => buildings.push({ buildingId, count }));
      
      if (buildings.length > 0) {
        convertedBuildings[block.id] = buildings;
      }
    });
    
    return calculateMetrics(convertedBuildings, affordableRatio, environmentInvestment, selectedTechCardIds);
  }, [tileBuildings, affordableRatio, environmentInvestment, selectedTechCardIds]);

  // 호버 시 미리보기 타일 계산
  const getPreviewTiles = (block, tileX, tileY) => {
    if (!selectedBuilding && !draggingBuilding) return [];
    
    const buildingId = selectedBuilding || draggingBuilding;
    const building = BUILDINGS[buildingId];
    if (!building) return [];
    
    return getBuildingTilePositions(building, buildingRotation, tileX, tileY);
  };

  // 배치된 건물(인스턴스)을 드래그 시작 (라벨 있는 시작 타일에서만)
  const startDragExistingInstance = (block, tileX, tileY) => {
    const key = `${block.id}-${tileX}-${tileY}`;
    const td = tileBuildings[key];
    if (!td?.instanceId) return;

    // 해당 인스턴스 타일을 모두 제거(임시)하고, 드래그 대상으로 세팅
    const snapshot = { ...tileBuildings };
    const newTiles = { ...tileBuildings };
    for (let y = 0; y < block.height; y++) {
      for (let x = 0; x < block.width; x++) {
        const k = `${block.id}-${x}-${y}`;
        if (newTiles[k]?.instanceId === td.instanceId) {
          delete newTiles[k];
        }
      }
    }
    removedInstanceRef.current = { instanceId: td.instanceId, tilesSnapshot: snapshot };
    setTileBuildings(newTiles);
    setDraggingInstance({ instanceId: td.instanceId, buildingId: td.buildingId, rotation: td.rotation });
    setDraggingBuilding(null);
    setSelectedBuilding(td.buildingId);
    setBuildingRotation(td.rotation);
    setHoveredTile({ blockId: block.id, x: tileX, y: tileY });
  };

  // 3D 뷰 모드일 때
  if (viewMode3D) {
    return (
      <div className="map-view-container">
        <div className="map-sidebar">
          <div className="building-selector">
            <h3>3D 뷰</h3>
            <button
              onClick={() => setViewMode3D(false)}
              className="view-toggle-btn"
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '15px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: '600',
              }}
            >
              📐 2D 뷰로 전환
            </button>
            <div className="help-text" style={{ fontSize: '0.85em', color: '#4b5563', marginBottom: '10px', padding: '8px', background: '#f3f4f6', borderRadius: '6px' }}>
              💡 마우스로 드래그하여 카메라를 회전하고, 휠로 확대/축소할 수 있습니다
            </div>
          </div>
        </div>
        <div className="map-content-wrapper" style={{ marginRight: 0 }}>
          <div className="map-main" style={{ width: '100%', height: '100%', margin: 0, padding: 0 }}>
            <MapView3D tileBuildings={tileBuildings} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-view-container">
      <div className="map-sidebar">
        <div className="building-selector">
          <h3>건물 선택</h3>
          <button
            onClick={() => setViewMode3D(true)}
            className="view-toggle-btn"
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '15px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1em',
              fontWeight: '600',
            }}
          >
            🏗️ 3D 뷰로 전환
          </button>
          <div className="help-text" style={{ fontSize: '0.85em', color: '#4b5563', marginBottom: '10px', padding: '8px', background: '#f3f4f6', borderRadius: '6px' }}>
            💡 팁: 건물을 우클릭하면 제거됩니다
          </div>
          {selectedBuilding && (
            <div className="rotation-control">
              <button onClick={handleRotate} className="rotate-btn">
                🔄 회전 ({buildingRotation}°)
              </button>
            </div>
          )}
          {Object.entries(BUILDINGS_BY_CATEGORY).map(([category, buildingIds]) => (
            <div key={category} className="building-category-section">
              <h4>
                {category === 'commercial' && '상업 공간'}
                {category === 'office' && '오피스 공간'}
                {category === 'residential' && '주거 공간'}
                {category === 'openSpace' && '오픈 스페이스'}
                {category === 'other' && '기타 시설'}
              </h4>
              <div className="building-list">
                {buildingIds.map(buildingId => {
                  const building = BUILDINGS[buildingId];
                  return (
                    <div
                      key={buildingId}
                      className={`building-item ${selectedBuilding === buildingId ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedBuilding(buildingId);
                        setBuildingRotation(0);
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, buildingId)}
                    >
                      <div className="building-name">{building.name}</div>
                      <div className="building-size">{building.size}칸 {building.shape === 'L' ? '(ㄱ자)' : ''}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="map-content-wrapper">
        <div 
          className="map-main"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          ref={mapContainerRef}
        >
          <div 
            className="map-container"
            style={{
              '--map-width': MAP_LAYOUT.mapWidth,
              '--map-height': MAP_LAYOUT.mapHeight,
            }}
          >
            {MAP_LAYOUT.blocks.map(block => (
              <div
                key={block.id}
                className="map-block"
                style={{
                  left: `${block.x * MAP_LAYOUT.tileSize}px`,
                  top: `${block.y * MAP_LAYOUT.tileSize}px`,
                  gridTemplateColumns: `repeat(${block.width}, ${MAP_LAYOUT.tileSize}px)`,
                  gridTemplateRows: `repeat(${block.height}, ${MAP_LAYOUT.tileSize}px)`,
                }}
              >
                <div className="block-label">{block.name}</div>
                {Array.from({ length: block.height }).map((_, y) =>
                  Array.from({ length: block.width }).map((_, x) => {
                    const tileKey = `${block.id}-${x}-${y}`;
                    const tileData = tileBuildings[tileKey];
                    const building = tileData ? BUILDINGS[tileData.buildingId] : null;
                    
                    // 기존 건물 영역인지 확인
                    const isExisting = block.existingBuildings.some(eb => 
                      x >= eb.x && x < eb.x + eb.width &&
                      y >= eb.y && y < eb.y + eb.height
                    );
                    
                    // 건물의 시작 타일인지 확인 (이 타일이 건물의 최소 좌표인지)
                    let isBuildingStart = false;
                    if (tileData) {
                      // 이 건물의 모든 타일 중 가장 작은 좌표 찾기
                      let minX = x, minY = y;
                      for (let checkY = 0; checkY < block.height; checkY++) {
                        for (let checkX = 0; checkX < block.width; checkX++) {
                          const checkKey = `${block.id}-${checkX}-${checkY}`;
                          const checkData = tileBuildings[checkKey];
                          if (checkData?.instanceId && checkData.instanceId === tileData.instanceId) {
                            if (checkX < minX || (checkX === minX && checkY < minY)) {
                              minX = checkX;
                              minY = checkY;
                            }
                          }
                        }
                      }
                      isBuildingStart = (x === minX && y === minY);
                    }
                    
                    const isHovered = hoveredTile?.blockId === block.id && 
                      hoveredTile?.x === x && hoveredTile?.y === y;
                    
                    // 드래그 중이거나 선택된 건물이 있을 때 프리뷰 계산
                    const previewBuilding = selectedBuilding || draggingBuilding || draggingInstance?.buildingId;
                    const previewRotation = draggingInstance?.rotation ?? buildingRotation;
                    
                    // 프리뷰 타일 계산 (호버된 타일을 기준으로 건물 전체 모양 계산)
                    let previewTiles = [];
                    let isPreview = false;
                    let isPreviewStart = false;
                    let canPlacePreview = false;
                    
                    if (previewBuilding && hoveredTile?.blockId === block.id) {
                      // 호버된 타일을 기준으로 건물의 모든 타일 위치 계산
                      previewTiles = getBuildingTilePositions(
                        BUILDINGS[previewBuilding], 
                        previewRotation, 
                        hoveredTile.x, 
                        hoveredTile.y
                      );
                      isPreview = previewTiles.some(pt => pt.x === x && pt.y === y);
                      
                      // 프리뷰의 시작 타일인지 확인
                      if (isPreview && previewTiles.length > 0) {
                        const firstTile = previewTiles[0];
                        isPreviewStart = (x === firstTile.x && y === firstTile.y);
                      }
                      
                      if (isPreview) {
                        canPlacePreview = canPlaceBuildingAt(
                          block, 
                          hoveredTile.x, 
                          hoveredTile.y, 
                          BUILDINGS[previewBuilding], 
                          previewRotation
                        );
                      }
                    }

                    // 기존 건물(경찰서/학교)용 클래스 및 라벨
                    let existingClass = '';
                    let existingOverlayLabel = null;
                    if (isExisting) {
                      if (block.id === 'block5') {
                        existingClass = 'existing-police';
                        // 블록 5의 기존 건물은 좌측 상단 2x2 → 그 중 (0,0)에만 라벨
                        if (x === 0 && y === 0) {
                          existingOverlayLabel = '경찰서';
                        }
                      } else if (block.id === 'block6') {
                        existingClass = 'existing-school';
                        // 블록 6의 기존 건물은 우측 상단 4x2 (x=12~15, y=0~1) → (12,0)에 라벨
                        if (x === 12 && y === 0) {
                          existingOverlayLabel = '학교';
                        }
                      }
                    }

                    // 건물 스타일 적용
                    let buildingStyle = {};
                    if (building && tileData) {
                      const patternStyle = getBuildingPatternStyle(building, tileData.rotation || 0);
                      buildingStyle = {
                        ...patternStyle,
                        border: `2px solid ${patternStyle.borderColor}`,
                      };
                    }

                    // 미리보기 스타일
                    let previewStyle = {};
                    if (isPreview && previewBuilding) {
                      const previewBuildingData = BUILDINGS[previewBuilding];
                      const patternStyle = getBuildingPatternStyle(previewBuildingData, previewRotation);
                      previewStyle = {
                        ...patternStyle,
                        opacity: canPlacePreview ? 0.85 : 0.5,
                        border: canPlacePreview 
                          ? `3px dashed ${patternStyle.borderColor}` 
                          : `3px dashed #dc2626`,
                        boxShadow: canPlacePreview 
                          ? `0 0 10px ${patternStyle.borderColor}, inset 0 0 5px rgba(255,255,255,0.3)` 
                          : '0 0 10px rgba(220, 38, 38, 0.5)',
                        zIndex: 100,
                        transform: 'scale(1.02)',
                      };
                    }

                    // 스타일 병합 (미리보기가 있으면 미리보기 스타일 우선)
                    const finalStyle = isPreview && Object.keys(previewStyle).length > 0 
                      ? previewStyle 
                      : buildingStyle;

                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`map-tile ${isExisting ? (existingClass || 'existing') : ''} ${building ? 'has-building' : ''} ${isPreview ? (canPlacePreview ? 'preview-valid' : 'preview-invalid') : ''}`}
                        style={finalStyle}
                        onClick={() => handleTileClick(block, x, y)}
                        onContextMenu={(e) => handleTileRightClick(e, block, x, y)}
                        onMouseDown={(e) => {
                          // 배치된 건물의 시작 타일을 잡고 드래그해서 이동
                          if (e.button === 0 && isBuildingStart && building && tileData?.instanceId) {
                            e.preventDefault();
                            startDragExistingInstance(block, x, y);
                          }
                        }}
                        onMouseEnter={() => setHoveredTile({ blockId: block.id, x, y })}
                        onMouseLeave={() => setHoveredTile(null)}
                        title={building ? `${building.name} (${building.size}칸) - 우클릭으로 제거` : isExisting ? (block.id === 'block5' ? '경찰서 (기존 건물)' : block.id === 'block6' ? '학교 (기존 건물)' : '기존 건물') : '빈 공간'}
                      >
                        {isBuildingStart && building && (
                          <div className="building-label">
                            {building.name}
                          </div>
                        )}
                        {/* 블록 5/6 기존 건물에 라벨 표시 */}
                        {!building && existingOverlayLabel && (
                          <div className="building-label existing-label">
                            {existingOverlayLabel}
                          </div>
                        )}
                        {/* 프리뷰 시작 타일에도 라벨 표시 (객체처럼 보이게) */}
                        {!building && isPreviewStart && previewBuilding && (
                          <div className="building-label preview-label">
                            {BUILDINGS[previewBuilding]?.name}
                            {previewRotation !== 0 && ` (${previewRotation}°)`}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="map-metrics">
          <MetricsDisplay
            metrics={metrics}
            affordableRatio={affordableRatio}
            onAffordableRatioChange={onAffordableRatioChange}
            environmentInvestment={environmentInvestment}
            onEnvironmentInvestmentChange={onEnvironmentInvestmentChange}
            techBudget={techBudget}
            onTechBudgetChange={onTechBudgetChange}
            selectedTechCardIds={selectedTechCardIds}
            onSelectedTechCardIdsChange={onSelectedTechCardIdsChange}
          />
        </div>
      </div>
    </div>
  );
}
