import React from 'react';
import { BUILDINGS, BUILDINGS_BY_CATEGORY } from '../data/buildings.js';
import './BlockEditor.css';

export default function BlockEditor({ block, buildings, onBuildingsChange }) {
  const usedSize = buildings.reduce((sum, { buildingId, count }) => {
    const building = BUILDINGS[buildingId];
    return sum + (building ? building.size * count : 0);
  }, 0);
  
  const remainingSize = block.availableSize - usedSize;

  const handleBuildingCountChange = (buildingId, delta) => {
    const currentBuilding = buildings.find(b => b.buildingId === buildingId);
    const currentCount = currentBuilding ? currentBuilding.count : 0;
    const newCount = Math.max(0, currentCount + delta);
    
    const building = BUILDINGS[buildingId];
    if (building && newCount * building.size > remainingSize + (currentCount * building.size)) {
      return; // 공간 부족
    }

    const updatedBuildings = buildings.filter(b => b.buildingId !== buildingId);
    if (newCount > 0) {
      updatedBuildings.push({ buildingId, count: newCount });
    }
    onBuildingsChange(updatedBuildings);
  };

  const getBuildingCount = (buildingId) => {
    const building = buildings.find(b => b.buildingId === buildingId);
    return building ? building.count : 0;
  };

  return (
    <div className="block-editor">
      <div className="block-header">
        <h3>{block.name}</h3>
        <div className="block-size-info">
          <span>사용 가능: {block.availableSize}칸</span>
          <span className={remainingSize < 0 ? 'error' : ''}>
            남은 공간: {remainingSize}칸
          </span>
        </div>
      </div>

      <div className="buildings-list">
        {Object.entries(BUILDINGS_BY_CATEGORY).map(([category, buildingIds]) => (
          <div key={category} className="building-category">
            <h4 className="category-title">
              {category === 'commercial' && '상업 공간'}
              {category === 'office' && '오피스 공간'}
              {category === 'residential' && '주거 공간'}
              {category === 'openSpace' && '오픈 스페이스'}
              {category === 'other' && '기타 시설'}
            </h4>
            <div className="buildings-grid">
              {buildingIds.map(buildingId => {
                const building = BUILDINGS[buildingId];
                const count = getBuildingCount(buildingId);
                const totalSize = building.size * count;
                const canAdd = remainingSize >= building.size;

                return (
                  <div key={buildingId} className="building-item">
                    <div className="building-info">
                      <span className="building-name">{building.name}</span>
                      <span className="building-size">{building.size}칸</span>
                    </div>
                    <div className="building-controls">
                      <button
                        onClick={() => handleBuildingCountChange(buildingId, -1)}
                        disabled={count === 0}
                        className="btn-count"
                      >
                        -
                      </button>
                      <span className="building-count">{count}</span>
                      <button
                        onClick={() => handleBuildingCountChange(buildingId, 1)}
                        disabled={!canAdd}
                        className="btn-count"
                      >
                        +
                      </button>
                    </div>
                    {count > 0 && (
                      <div className="building-total">
                        총 {totalSize}칸 사용
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
