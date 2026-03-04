import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MAP_LAYOUT } from '../data/mapLayout';
import { BUILDINGS } from '../data/buildings';
import { getBuildingTiles } from '../utils/buildingShapes';

// 나무 컴포넌트 (다양한 크기)
function Tree({ x, z, size = 1 }) {
  const trunkHeight = 0.12 * size;
  const trunkRadius = 0.025 * size;
  const crownHeight = 0.15 * size;
  const crownRadius = 0.12 * size;
  
  return (
    <group position={[x, 0, z]}>
      {/* 나무 줄기 */}
      <mesh position={[0, trunkHeight / 2, 0]}>
        <cylinderGeometry args={[trunkRadius, trunkRadius, trunkHeight, 8]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      {/* 나무 잎 (원뿔) - 풀숲 계열 색상 */}
      <mesh position={[0, trunkHeight + crownHeight / 2, 0]}>
        <coneGeometry args={[crownRadius, crownHeight, 8]} />
        <meshStandardMaterial color="#3d6b1f" />
      </mesh>
    </group>
  );
}

// 벤치 컴포넌트
function Bench({ x, z, rotation = 0 }) {
  return (
    <group position={[x, 0.05, z]} rotation={[0, rotation, 0]}>
      {/* 벤치 등받이 */}
      <mesh position={[0, 0.15, -0.15]}>
        <boxGeometry args={[0.3, 0.1, 0.02]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* 벤치 좌석 */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.15]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* 벤치 다리 (앞) */}
      <mesh position={[-0.12, 0.05, 0.06]}>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      <mesh position={[0.12, 0.05, 0.06]}>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      {/* 벤치 다리 (뒤) */}
      <mesh position={[-0.12, 0.05, -0.06]}>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      <mesh position={[0.12, 0.05, -0.06]}>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
    </group>
  );
}

// 공원 모델링 (나무, 벤치, 잔디)
function ParkModel({ width, depth }) {
  const treeCount = Math.max(3, Math.floor((width * depth) / 1.5));
  const benchCount = Math.max(1, Math.floor((width * depth) / 4));
  
  const trees = [];
  const benches = [];
  
  // 나무 배치 (격자 패턴)
  const treeSpacing = Math.max(width, depth) / (Math.floor(Math.sqrt(treeCount)) + 1);
  for (let i = 0; i < treeCount; i++) {
    const row = Math.floor(i / Math.ceil(Math.sqrt(treeCount)));
    const col = i % Math.ceil(Math.sqrt(treeCount));
    const x = (col - (Math.ceil(Math.sqrt(treeCount)) - 1) / 2) * treeSpacing * 0.6;
    const z = (row - (Math.floor(treeCount / Math.ceil(Math.sqrt(treeCount))) - 1) / 2) * treeSpacing * 0.6;
    // 나무 크기 다양화 (0.8 ~ 1.2)
    const size = 0.8 + (i % 3) * 0.2;
    trees.push({ x, z, size });
  }
  
  // 벤치 배치 (나무 사이 공간에)
  const benchSpacing = Math.max(width, depth) / (Math.floor(Math.sqrt(benchCount)) + 1);
  for (let i = 0; i < benchCount; i++) {
    const row = Math.floor(i / Math.ceil(Math.sqrt(benchCount)));
    const col = i % Math.ceil(Math.sqrt(benchCount));
    const x = (col - (Math.ceil(Math.sqrt(benchCount)) - 1) / 2) * benchSpacing * 0.7;
    const z = (row - (Math.floor(benchCount / Math.ceil(Math.sqrt(benchCount))) - 1) / 2) * benchSpacing * 0.7;
    // 벤치 회전 (0, 90, 180, 270도)
    const rotation = (i % 4) * (Math.PI / 2);
    benches.push({ x, z, rotation });
  }

  return (
    <group>
      {/* 잔디 바닥 (풀숲 계열) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>
      
      {/* 나무들 */}
      {trees.map((tree, i) => (
        <Tree key={`tree-${i}`} x={tree.x} z={tree.z} size={tree.size} />
      ))}
      
      {/* 벤치들 */}
      {benches.map((bench, i) => (
        <Bench key={`bench-${i}`} x={bench.x} z={bench.z} rotation={bench.rotation} />
      ))}
    </group>
  );
}

// 아파트 모델링 (여러 층)
function ApartmentModel({ width, depth, height }) {
  const floors = Math.floor(height / 0.3);
  
  return (
    <group>
      {/* 건물 본체 */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#ffe66d" />
      </mesh>
      {/* 창문들 */}
      {Array.from({ length: floors }).map((_, floor) => {
        const floorY = -height / 2 + (floor + 0.5) * (height / floors);
        return (
          <group key={floor}>
            {/* 앞면 창문 */}
            {Array.from({ length: Math.floor(width / 0.3) }).map((_, i) => (
              <mesh
                key={`front-${i}`}
                position={[-width / 2 + (i + 0.5) * 0.3, floorY, depth / 2 + 0.01]}
              >
                <planeGeometry args={[0.2, 0.2]} />
                <meshStandardMaterial color="#87ceeb" />
              </mesh>
            ))}
            {/* 뒷면 창문 */}
            {Array.from({ length: Math.floor(width / 0.3) }).map((_, i) => (
              <mesh
                key={`back-${i}`}
                position={[-width / 2 + (i + 0.5) * 0.3, floorY, -depth / 2 - 0.01]}
                rotation={[0, Math.PI, 0]}
              >
                <planeGeometry args={[0.2, 0.2]} />
                <meshStandardMaterial color="#87ceeb" />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

// 상업 시설 모델링 (상점 형태)
function CommercialModel({ width, depth, height, buildingId }) {
  const isLarge = buildingId === 'largeMart';
  
  if (isLarge) {
    // 대형 마트: 창문이 많은 현대적인 디자인
    const windowCols = Math.floor(width / 0.4);
    const windowRows = Math.floor(height / 0.3);
    
    return (
      <group>
        {/* 건물 본체 */}
        <mesh>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
        
        {/* 대형 간판 */}
        <mesh position={[0, height / 2 + 0.12, depth / 2 + 0.01]}>
          <planeGeometry args={[width * 0.9, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* 앞면 창문들 (많은 창문) */}
        {Array.from({ length: windowRows }).map((_, row) => {
          const rowY = -height / 2 + (row + 0.5) * (height / windowRows);
          return (
            <group key={`row-${row}`}>
              {Array.from({ length: windowCols }).map((_, col) => {
                const colX = -width / 2 + (col + 0.5) * (width / windowCols);
                return (
                  <mesh
                    key={`window-${row}-${col}`}
                    position={[colX, rowY, depth / 2 + 0.01]}
                  >
                    <planeGeometry args={[width / windowCols * 0.7, height / windowRows * 0.7]} />
                    <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
                  </mesh>
                );
              })}
            </group>
          );
        })}
        
        {/* 측면 창문들 */}
        {Array.from({ length: windowRows }).map((_, row) => {
          const rowY = -height / 2 + (row + 0.5) * (height / windowRows);
          return (
            <group key={`side-row-${row}`}>
              {/* 왼쪽 측면 */}
              {Array.from({ length: Math.floor(depth / 0.4) }).map((_, col) => {
                const colZ = -depth / 2 + (col + 0.5) * (depth / Math.floor(depth / 0.4));
                return (
                  <mesh
                    key={`left-window-${row}-${col}`}
                    position={[-width / 2 - 0.01, rowY, colZ]}
                    rotation={[0, Math.PI / 2, 0]}
                  >
                    <planeGeometry args={[depth / Math.floor(depth / 0.4) * 0.7, height / windowRows * 0.7]} />
                    <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
                  </mesh>
                );
              })}
              {/* 오른쪽 측면 */}
              {Array.from({ length: Math.floor(depth / 0.4) }).map((_, col) => {
                const colZ = -depth / 2 + (col + 0.5) * (depth / Math.floor(depth / 0.4));
                return (
                  <mesh
                    key={`right-window-${row}-${col}`}
                    position={[width / 2 + 0.01, rowY, colZ]}
                    rotation={[0, -Math.PI / 2, 0]}
                  >
                    <planeGeometry args={[depth / Math.floor(depth / 0.4) * 0.7, height / windowRows * 0.7]} />
                    <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
                  </mesh>
                );
              })}
            </group>
          );
        })}
        
        {/* 입구들 (여러 개) */}
        {Array.from({ length: Math.min(3, Math.floor(width / 0.8)) }).map((_, i) => {
          const entranceX = -width / 2 + (i + 0.5) * (width / (Math.floor(width / 0.8) + 1));
          return (
            <mesh key={`entrance-${i}`} position={[entranceX, 0.25, depth / 2 + 0.01]}>
              <boxGeometry args={[0.4, 0.5, 0.05]} />
              <meshStandardMaterial color="#8b4513" />
            </mesh>
          );
        })}
      </group>
    );
  }
  
  // 일반 상업 시설 (편의점, 슈퍼마켓)
  return (
    <group>
      {/* 건물 본체 */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      {/* 간판 */}
      <mesh position={[0, height / 2 + 0.1, depth / 2 + 0.01]}>
        <planeGeometry args={[width * 0.8, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* 입구 */}
      <mesh position={[0, 0.2, depth / 2 + 0.01]}>
        <boxGeometry args={[0.3, 0.4, 0.05]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  );
}

// 오피스 모델링 (사무실 건물) - 크기별 차별화
function OfficeModel({ width, depth, height, buildingId }) {
  const floors = Math.floor(height / 0.25);
  
  if (buildingId === 'smallOffice') {
    // 소형 사무실: 낮고 단순한 디자인
    return (
      <group>
        {/* 건물 본체 */}
        <mesh>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#4ecdc4" />
        </mesh>
        {/* 작은 창문들 */}
        {Array.from({ length: Math.floor(width / 0.3) }).map((_, i) => {
          const windowX = -width / 2 + (i + 0.5) * 0.3;
          return (
            <group key={`window-${i}`}>
              {/* 앞면 창문 */}
              <mesh position={[windowX, height * 0.2, depth / 2 + 0.01]}>
                <planeGeometry args={[0.2, 0.25]} />
                <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} />
              </mesh>
              {/* 뒷면 창문 */}
              <mesh position={[windowX, height * 0.2, -depth / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.2, 0.25]} />
                <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} />
              </mesh>
            </group>
          );
        })}
        {/* 입구 */}
        <mesh position={[0, 0.15, depth / 2 + 0.01]}>
          <boxGeometry args={[0.25, 0.3, 0.05]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </group>
    );
  } else if (buildingId === 'mediumOffice') {
    // 중형 오피스: 중간 높이, 현대적인 디자인
    return (
      <group>
        {/* 건물 본체 */}
        <mesh>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#4ecdc4" />
        </mesh>
        {/* 층별 유리창 (중간 크기) */}
        {Array.from({ length: floors }).map((_, floor) => {
          const floorY = -height / 2 + (floor + 0.5) * (height / floors);
          return (
            <group key={`floor-${floor}`}>
              {/* 앞면 유리창 */}
              <mesh position={[0, floorY, depth / 2 + 0.01]}>
                <planeGeometry args={[width * 0.85, height / floors * 0.75]} />
                <meshStandardMaterial color="#87ceeb" transparent opacity={0.65} />
              </mesh>
              {/* 뒷면 유리창 */}
              <mesh position={[0, floorY, -depth / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[width * 0.85, height / floors * 0.75]} />
                <meshStandardMaterial color="#87ceeb" transparent opacity={0.65} />
              </mesh>
            </group>
          );
        })}
        {/* 입구 */}
        <mesh position={[0, 0.25, depth / 2 + 0.01]}>
          <boxGeometry args={[0.35, 0.5, 0.05]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        {/* 지붕 장식 */}
        <mesh position={[0, height / 2 + 0.05, 0]}>
          <boxGeometry args={[width * 0.95, 0.1, depth * 0.95]} />
          <meshStandardMaterial color="#3ba89a" />
        </mesh>
      </group>
    );
  } else {
    // 대형 오피스: 높고 고급스러운 디자인
    return (
      <group>
        {/* 건물 본체 */}
        <mesh>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#4ecdc4" />
        </mesh>
        {/* 층별 큰 유리창 */}
        {Array.from({ length: floors }).map((_, floor) => {
          const floorY = -height / 2 + (floor + 0.5) * (height / floors);
          return (
            <group key={`floor-${floor}`}>
              {/* 앞면 큰 유리창 */}
              <mesh position={[0, floorY, depth / 2 + 0.01]}>
                <planeGeometry args={[width * 0.9, height / floors * 0.85]} />
                <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
              </mesh>
              {/* 뒷면 큰 유리창 */}
              <mesh position={[0, floorY, -depth / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[width * 0.9, height / floors * 0.85]} />
                <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
              </mesh>
              {/* 측면 유리창 */}
              {Array.from({ length: Math.floor(depth / 0.5) }).map((_, i) => {
                const sideZ = -depth / 2 + (i + 0.5) * (depth / Math.floor(depth / 0.5));
                return (
                  <group key={`side-${i}`}>
                    <mesh
                      position={[-width / 2 - 0.01, floorY, sideZ]}
                      rotation={[0, Math.PI / 2, 0]}
                    >
                      <planeGeometry args={[depth / Math.floor(depth / 0.5) * 0.8, height / floors * 0.85]} />
                      <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
                    </mesh>
                    <mesh
                      position={[width / 2 + 0.01, floorY, sideZ]}
                      rotation={[0, -Math.PI / 2, 0]}
                    >
                      <planeGeometry args={[depth / Math.floor(depth / 0.5) * 0.8, height / floors * 0.85]} />
                      <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
                    </mesh>
                  </group>
                );
              })}
            </group>
          );
        })}
        {/* 입구 (큰 입구) */}
        <mesh position={[0, 0.3, depth / 2 + 0.01]}>
          <boxGeometry args={[0.5, 0.6, 0.05]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </group>
    );
  }
}

// 주택 모델링 (주택 형태)
function HouseModel({ width, depth, height }) {
  // 지붕 크기를 건물 영역 내에 완전히 포함되도록 제한
  // 대각선 길이를 고려하여 더 작은 쪽의 0.45배로 제한
  const roofRadius = Math.min(width, depth) * 0.45;
  
  return (
    <group>
      {/* 집 본체 */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#ffe66d" />
      </mesh>
      {/* 지붕 */}
      <mesh position={[0, height / 2 + 0.2, 0]}>
        <coneGeometry args={[roofRadius, 0.3, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* 문 */}
      <mesh position={[0, 0.15, depth / 2 + 0.01]}>
        <boxGeometry args={[0.2, 0.3, 0.05]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* 창문 */}
      <mesh position={[-width * 0.3, height * 0.3, depth / 2 + 0.01]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>
      <mesh position={[width * 0.3, height * 0.3, depth / 2 + 0.01]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshStandardMaterial color="#87ceeb" />
      </mesh>
    </group>
  );
}

// 문화 복지 센터 모델링
function CulturalCenterModel({ width, depth, height }) {
  // 지붕 크기를 건물 영역 내에 완전히 포함되도록 제한
  const roofWidth = width * 0.85;
  const roofDepth = depth * 0.85;
  
  return (
    <group>
      {/* 건물 본체 */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#95e1d3" />
      </mesh>
      {/* 지붕 장식 */}
      <mesh position={[0, height / 2 + 0.1, 0]}>
        <boxGeometry args={[roofWidth, 0.1, roofDepth]} />
        <meshStandardMaterial color="#7fb8a8" />
      </mesh>
      {/* 입구 */}
      <mesh position={[0, 0.25, depth / 2 + 0.01]}>
        <boxGeometry args={[0.4, 0.5, 0.05]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );
}

// 체육 시설 모델링
function SportsFacilityModel({ width, depth, height }) {
  // 지붕 크기를 건물 영역 내에 완전히 포함되도록 제한
  // 더 작은 쪽의 0.45배로 제한
  const roofRadius = Math.min(width, depth) * 0.45;
  
  return (
    <group>
      {/* 건물 본체 */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#95e1d3" />
      </mesh>
      {/* 지붕 (체육관 형태) */}
      <mesh position={[0, height / 2 + 0.15, 0]}>
        <cylinderGeometry args={[roofRadius, roofRadius, 0.2, 16]} />
        <meshStandardMaterial color="#7fb8a8" />
      </mesh>
    </group>
  );
}

// 물류 센터 모델링
function LogisticsCenterModel({ width, depth, height }) {
  return (
    <group>
      {/* 건물 본체 */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#a8a8a8" />
      </mesh>
      {/* 창고 문 */}
      {Array.from({ length: Math.floor(width / 0.8) }).map((_, i) => (
        <mesh
          key={i}
          position={[-width / 2 + (i + 0.5) * 0.8, height * 0.3, depth / 2 + 0.01]}
        >
          <boxGeometry args={[0.6, height * 0.6, 0.05]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      ))}
    </group>
  );
}

// 재활용 연구 단지 모델링
function RecyclingResearchModel({ width, depth, height }) {
  return (
    <group>
      {/* 건물 본체 */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#a8a8a8" />
      </mesh>
      {/* 태양광 패널 (지붕) */}
      <mesh position={[0, height / 2 + 0.05, 0]} rotation={[-Math.PI / 6, 0, 0]}>
        <planeGeometry args={[width * 0.8, depth * 0.8]} />
        <meshStandardMaterial color="#1a5490" />
      </mesh>
    </group>
  );
}

// 건물 3D 모델 컴포넌트
function Building3D({ building, position, rotation = 0, blockOffset = [0, 0] }) {
  const buildingData = BUILDINGS[building.buildingId];
  if (!buildingData) return null;

  // 건물 크기에 따른 높이 결정
  const getHeight = (size, category, buildingId) => {
    if (category === 'openSpace') {
      // 공원은 매우 낮게 (풀/나무 높이)
      if (buildingId === 'park') {
        return 0.25; // 공원은 나무 높이만큼
      }
      return 0.6; // 다른 오픈 스페이스
    }
    if (buildingId === 'apartment') {
      // 아파트는 높게
      if (size <= 4) return 2.2;
      return 2.8;
    }
    if (buildingId === 'house' || buildingId === 'villaOfficetel') {
      // 주택은 중간 높이
      return 1.2;
    }
    // 사무실 건물 높이 차별화
    if (buildingId === 'smallOffice') {
      return 0.9; // 소형 사무실: 낮게
    }
    if (buildingId === 'mediumOffice') {
      return 1.8; // 중형 오피스: 중간 높이
    }
    if (buildingId === 'largeOffice') {
      return 2.5; // 대형 오피스: 높게
    }
    // 상업 시설 높이
    if (buildingId === 'largeMart') {
      return 1.5; // 대형 마트: 중간 높이
    }
    if (size <= 1) return 0.7;
    if (size <= 2) return 1.1;
    if (size <= 4) return 1.6;
    if (size <= 6) return 2.1;
    return 2.6;
  };

  const height = getHeight(buildingData.size, buildingData.category, buildingData.id);

  // position은 블록 내부의 시작 타일 좌표 (0부터 시작)
  // blockOffset은 블록의 전체 맵 상 위치

  // L / L5 모양 여부 (타일 단위 렌더링)
  const needsTileBasedRendering = buildingData.shape === 'L' || buildingData.shape === 'L5';

  // ---- 타일/중심/폭·깊이 계산 ----
  let tiles;       // 타일별 좌표 (렌더용)
  let width;       // 건물 폭 (타일 수)
  let depth;       // 건물 깊이 (타일 수)
  let centerX;     // 건물 중심 X (전체 맵 좌표)
  let centerY;     // 건물 중심 Z (전체 맵 좌표)

  if (needsTileBasedRendering) {
    // L / L5: 2D와 동일하게 회전된 타일 배열을 그대로 사용
    tiles = getBuildingTiles(buildingData, rotation, position[0], position[2]);
    const bounds = {
      minX: Math.min(...tiles.map(t => t.x)),
      maxX: Math.max(...tiles.map(t => t.x)),
      minY: Math.min(...tiles.map(t => t.y)),
      maxY: Math.max(...tiles.map(t => t.y)),
    };
    width = bounds.maxX - bounds.minX + 1;
    depth = bounds.maxY - bounds.minY + 1;
    centerX = blockOffset[0] + (bounds.minX + bounds.maxX + 1) / 2;
    centerY = blockOffset[1] + (bounds.minY + bounds.maxY + 1) / 2;
  } else {
    // 그 외(직사각형/일자/정사각형 등)는:
    // - 폭/깊이: 0도 기준 타일 배열로 계산 (기하학 회전만 적용)
    // - 중심 위치: 실제 회전된 타일 배열로 계산 (2D 배치와 일치)

    // 0도 기준 타일 (폭/깊이용)
    const tiles0 = getBuildingTiles(buildingData, 0, position[0], position[2]);
    const bounds0 = {
      minX: Math.min(...tiles0.map(t => t.x)),
      maxX: Math.max(...tiles0.map(t => t.x)),
      minY: Math.min(...tiles0.map(t => t.y)),
      maxY: Math.max(...tiles0.map(t => t.y)),
    };
    width = bounds0.maxX - bounds0.minX + 1;
    depth = bounds0.maxY - bounds0.minY + 1;

    // 실제 회전된 타일 (중심 위치용)
    tiles = getBuildingTiles(buildingData, rotation, position[0], position[2]);
    const boundsRot = {
      minX: Math.min(...tiles.map(t => t.x)),
      maxX: Math.max(...tiles.map(t => t.x)),
      minY: Math.min(...tiles.map(t => t.y)),
      maxY: Math.max(...tiles.map(t => t.y)),
    };
    centerX = blockOffset[0] + (boundsRot.minX + boundsRot.maxX + 1) / 2;
    centerY = blockOffset[1] + (boundsRot.minY + boundsRot.maxY + 1) / 2;
  }
  
  // 타일별 렌더링 (L자, L5 모양 건물용)
  const renderTileBasedModel = () => {
    const getColor = (category) => {
      switch (category) {
        case 'commercial': return '#ff6b6b';
        case 'office': return '#4ecdc4';
        case 'residential': return '#ffe66d';
        case 'openSpace': return '#95e1d3';
        case 'other': return '#a8a8a8';
        default: return '#cccccc';
      }
    };
    
    // 각 타일을 개별 박스로 렌더링
    // 타일 위치는 이미 회전이 적용된 상태이므로, 절대 위치를 사용
    return (
      <group>
      {tiles.map((tile, index) => {
          // 타일의 절대 위치 (전체 맵 좌표 기준)
          const tileX = blockOffset[0] + tile.x + 0.5;
          const tileZ = blockOffset[1] + tile.y + 0.5;
          
          // 사무실인 경우 창문 추가
          const isOffice = buildingData.category === 'office';
          const isSmallOffice = buildingData.id === 'smallOffice';
          const isMediumOffice = buildingData.id === 'mediumOffice';
          const isLargeOffice = buildingData.id === 'largeOffice';
          
          return (
            <group key={`tile-${index}`} position={[tileX, height / 2, tileZ]}>
              {/* 건물 본체 */}
              <mesh>
                <boxGeometry args={[1, height, 1]} />
                <meshStandardMaterial color={getColor(buildingData.category)} />
              </mesh>
              
              {/* 사무실 창문 */}
              {isOffice && (
                <>
                  {/* 앞면 창문 */}
                  <mesh position={[0, 0, 0.51]}>
                    <planeGeometry args={[0.7, height * 0.6]} />
                    <meshStandardMaterial color="#87ceeb" transparent opacity={isSmallOffice ? 0.5 : isMediumOffice ? 0.65 : 0.7} />
                  </mesh>
                  {/* 뒷면 창문 */}
                  <mesh position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[0.7, height * 0.6]} />
                    <meshStandardMaterial color="#87ceeb" transparent opacity={isSmallOffice ? 0.5 : isMediumOffice ? 0.65 : 0.7} />
                  </mesh>
                  {/* 측면 창문 (대형 오피스만) */}
                  {isLargeOffice && (
                    <>
                      <mesh position={[-0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                        <planeGeometry args={[0.7, height * 0.6]} />
                        <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
                      </mesh>
                      <mesh position={[0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                        <planeGeometry args={[0.7, height * 0.6]} />
                        <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
                      </mesh>
                    </>
                  )}
                </>
              )}
              
              {/* 문화 복지 센터 입구 (첫 번째 타일만) */}
              {buildingData.id === 'culturalCenter' && index === 0 && (
                <mesh position={[0, 0.25, 0.51]}>
                  <boxGeometry args={[0.4, 0.5, 0.05]} />
                  <meshStandardMaterial color="#654321" />
                </mesh>
              )}
            </group>
          );
        })}
        
        {/* 사무실 지붕 장식 (중형만, 대형은 제외) */}
        {buildingData.category === 'office' && buildingData.id === 'mediumOffice' && (
          <mesh position={[centerX, height / 2 + 0.05, centerY]}>
            <boxGeometry args={[width * 0.95, 0.1, depth * 0.95]} />
            <meshStandardMaterial color="#3ba89a" />
          </mesh>
        )}
      </group>
    );
  };

  // 카테고리별 모델 렌더링
  const renderBuildingModel = () => {
    const baseRotation = (rotation * Math.PI) / 180;
    
    // L자 모양이나 L5 모양은 타일별 렌더링 사용
    if (needsTileBasedRendering) {
      return null; // renderTileBasedModel에서 처리
    }
    
    if (buildingData.category === 'openSpace' && buildingData.id === 'park') {
      // 공원: 나무와 잔디
      return (
        <group rotation={[0, baseRotation, 0]}>
          <ParkModel width={width} depth={depth} />
        </group>
      );
    } else if (buildingData.category === 'openSpace' && buildingData.id === 'culturalCenter') {
      // 문화 복지 센터
      return (
        <group rotation={[0, baseRotation, 0]}>
          <CulturalCenterModel width={width} depth={depth} height={height} />
        </group>
      );
    } else if (buildingData.category === 'openSpace' && buildingData.id === 'sportsFacility') {
      // 체육 시설
      return (
        <group rotation={[0, baseRotation, 0]}>
          <SportsFacilityModel width={width} depth={depth} height={height} />
        </group>
      );
    } else if (buildingData.category === 'residential' && buildingData.id === 'apartment') {
      // 아파트: 여러 층 건물
      return (
        <group rotation={[0, baseRotation, 0]}>
          <ApartmentModel width={width} depth={depth} height={height} />
        </group>
      );
    } else if (buildingData.category === 'residential') {
      // 주택: 주택 형태
      return (
        <group rotation={[0, baseRotation, 0]}>
          <HouseModel width={width} depth={depth} height={height} />
        </group>
      );
    } else if (buildingData.category === 'commercial') {
      // 상업 시설: 상점 형태
      return (
        <group rotation={[0, baseRotation, 0]}>
          <CommercialModel width={width} depth={depth} height={height} buildingId={buildingData.id} />
        </group>
      );
    } else if (buildingData.category === 'office') {
      // 오피스: 사무실 건물
      return (
        <group rotation={[0, baseRotation, 0]}>
          <OfficeModel width={width} depth={depth} height={height} buildingId={buildingData.id} />
        </group>
      );
    } else if (buildingData.category === 'other' && buildingData.id === 'logisticsCenter') {
      // 물류 센터
      return (
        <group rotation={[0, baseRotation, 0]}>
          <LogisticsCenterModel width={width} depth={depth} height={height} />
        </group>
      );
    } else if (buildingData.category === 'other' && buildingData.id === 'recyclingResearch') {
      // 재활용 연구 단지
      return (
        <group rotation={[0, baseRotation, 0]}>
          <RecyclingResearchModel width={width} depth={depth} height={height} />
        </group>
      );
    } else {
      // 기타: 기본 박스 (기존 색상 유지)
      const getColor = (category) => {
        switch (category) {
          case 'commercial': return '#ff6b6b';
          case 'office': return '#4ecdc4';
          case 'residential': return '#ffe66d';
          case 'openSpace': return '#2d5016'; // 풀숲 계열
          case 'other': return '#a8a8a8';
          default: return '#cccccc';
        }
      };
      return (
        <mesh rotation={[0, baseRotation, 0]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={getColor(buildingData.category)} />
        </mesh>
      );
    }
  };

  // L자 모양이나 L5 모양은 타일별 렌더링 사용
  if (needsTileBasedRendering) {
    return (
      <>
        {renderTileBasedModel()}
        {/* 건물 이름 표시 */}
        <Text
          position={[centerX, height + 0.3, centerY]}
          fontSize={0.3}
          color="black"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="white"
        >
          {buildingData.name}
        </Text>
      </>
    );
  }
  
  return (
    <group position={[centerX, height / 2, centerY]}>
      {renderBuildingModel()}
      {/* 건물 이름 표시 */}
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="white"
      >
        {buildingData.name}
      </Text>
    </group>
  );
}

// 블록 컴포넌트
function Block3D({ block, tileBuildings }) {
  const blockX = block.x;
  const blockY = block.y;

  // 블록의 건물들 렌더링
  const buildings = useMemo(() => {
    const buildingList = [];
    const processedInstances = new Set();

    for (const [tileKey, tileData] of Object.entries(tileBuildings)) {
      if (!tileData || !tileData.buildingId) continue;
      
      const [blockId, x, y] = tileKey.split('-');
      if (blockId !== block.id) continue;
      
      // 같은 인스턴스는 한 번만 렌더링
      if (tileData.instanceId && processedInstances.has(tileData.instanceId)) {
        continue;
      }
      
      if (tileData.instanceId) {
        processedInstances.add(tileData.instanceId);
      }

      // 건물의 시작 타일 찾기
      let startX = parseInt(x);
      let startY = parseInt(y);
      
      // 같은 인스턴스의 모든 타일 중 최소 좌표 찾기
      if (tileData.instanceId) {
        for (const [checkKey, checkData] of Object.entries(tileBuildings)) {
          if (checkData?.instanceId === tileData.instanceId) {
            const [checkBlockId, checkX, checkY] = checkKey.split('-');
            if (checkBlockId === block.id) {
              startX = Math.min(startX, parseInt(checkX));
              startY = Math.min(startY, parseInt(checkY));
            }
          }
        }
      }

      buildingList.push({
        building: tileData,
        position: [startX, 0, startY],
        rotation: tileData.rotation || 0,
      });
    }

    return buildingList;
  }, [block.id, tileBuildings]);

  return (
    <group>
      {/* 블록 바닥 */}
      <mesh
        position={[blockX + block.width / 2, 0, blockY + block.height / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[block.width, block.height]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* 블록별 그리드 */}
      <group position={[blockX + block.width / 2, 0.01, blockY + block.height / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <Grid
          args={[block.width, block.height]}
          cellSize={1}
          cellThickness={0.3}
          cellColor="#d0d0d0"
          sectionSize={1}
          sectionThickness={0.5}
          sectionColor="#999999"
          fadeDistance={25}
          fadeStrength={0.5}
        />
      </group>

      {/* 블록 경계선 (사각형) */}
      <lineSegments position={[blockX + block.width / 2, 0.02, blockY + block.height / 2]}>
        <edgesGeometry
          attach="geometry"
          args={[new THREE.PlaneGeometry(block.width, block.height)]}
        />
        <lineBasicMaterial attach="material" color="#888888" linewidth={2} />
      </lineSegments>

      {/* 건물들 렌더링 */}
      {buildings.map((item, index) => (
        <Building3D
          key={`${block.id}-${index}-${item.building.instanceId || index}`}
          building={item.building}
          position={item.position}
          rotation={item.rotation}
          blockOffset={[blockX, blockY]}
        />
      ))}

      {/* 기존 건물들 (블록 5: 경찰서, 블록 6: 학교) */}
      {block.existingBuildings.map((eb, index) => {
        const existingHeight = 1.2;
        const centerX = blockX + eb.x + eb.width / 2;
        const centerZ = blockY + eb.y + eb.height / 2;

        // 블록 5: 경찰서
        if (block.id === 'block5') {
          return (
            <group key={`existing-${block.id}-${index}`} position={[centerX, existingHeight / 2, centerZ]}>
              {/* 본관 */}
              <mesh>
                <boxGeometry args={[eb.width, existingHeight, eb.height]} />
                <meshStandardMaterial color="#1d4ed8" />
              </mesh>
              {/* 지붕 띠 */}
              <mesh position={[0, existingHeight / 2 + 0.1, 0]}>
                <boxGeometry args={[eb.width * 0.9, 0.2, eb.height * 0.9]} />
                <meshStandardMaterial color="#e5e7eb" />
              </mesh>
              {/* 입구 */}
              <mesh position={[0, -existingHeight / 2 + 0.4, eb.height / 2 + 0.02]}>
                <boxGeometry args={[0.6, 0.8, 0.1]} />
                <meshStandardMaterial color="#111827" />
              </mesh>
              {/* 경찰서 텍스트 */}
              <Text
                position={[0, existingHeight / 2 + 0.6, 0]}
                fontSize={0.6}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.08}
                outlineColor="#0f172a"
              >
                경찰서
              </Text>
            </group>
          );
        }

        // 블록 6: 학교
        if (block.id === 'block6') {
          return (
            <group key={`existing-${block.id}-${index}`} position={[centerX, existingHeight / 2, centerZ]}>
              {/* 본관 */}
              <mesh>
                <boxGeometry args={[eb.width, existingHeight, eb.height]} />
                <meshStandardMaterial color="#facc15" />
              </mesh>
              {/* 지붕 */}
              <mesh position={[0, existingHeight / 2 + 0.2, 0]}>
                <boxGeometry args={[eb.width * 0.9, 0.3, eb.height * 0.9]} />
                <meshStandardMaterial color="#f97316" />
              </mesh>
              {/* 운동장 느낌의 앞마당 (낮은 플랫폼) */}
              <mesh position={[0, -existingHeight / 2 + 0.05, 0]}>
                <boxGeometry args={[eb.width * 1.2, 0.1, eb.height * 1.2]} />
                <meshStandardMaterial color="#bbf7d0" />
              </mesh>
              {/* 학교 텍스트 */}
              <Text
                position={[0, existingHeight / 2 + 0.6, 0]}
                fontSize={0.6}
                color="#111827"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.06}
                outlineColor="#ffffff"
              >
                학교
              </Text>
            </group>
          );
        }

        // 기타 기존 건물 (현재는 없음) - 기본 박스
        return (
          <mesh
            key={`existing-${block.id}-${index}`}
            position={[
              blockX + eb.x + eb.width / 2,
              existingHeight / 2,
              blockY + eb.y + eb.height / 2,
            ]}
          >
            <boxGeometry args={[eb.width, existingHeight, eb.height]} />
            <meshStandardMaterial color="#b3d9ff" />
          </mesh>
        );
      })}

      {/* 블록 이름 표시 (블록 영역 아래쪽, x-y 평면에 평행) */}
      <group position={[blockX + block.width / 2, 0.02, blockY - 0.3]}>
        {/* 배경 (x-y 평면에 평행) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[block.width * 0.7, 0.3]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.7} />
        </mesh>
        {/* 텍스트 (x-y 평면에 평행하게) */}
        <Text
          position={[0, 0.01, 0]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {block.name}
        </Text>
      </group>
    </group>
  );
}

// 도로 렌더링
function Road3D({ x, y, width, height, isMainRoad = false }) {
  return (
    <group>
      {/* 도로 바닥 */}
      <mesh
        position={[x + width / 2, -0.008, y + height / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={isMainRoad ? "#555555" : "#666666"} />
      </mesh>
      {/* 도로 중앙선 (주요 도로만) */}
      {isMainRoad && width > 1 && (
        <mesh
          position={[x + width / 2, -0.007, y + height / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.1, height]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
      )}
    </group>
  );
}

export default function MapView3D({ tileBuildings }) {
  // 도로 위치 계산 (블록 사이의 도로만)
  const roads = useMemo(() => {
    const roadList = [];
    const { blocks, mapWidth, mapHeight } = MAP_LAYOUT;
    const roadMap = new Set();

    // 전체 맵 바닥 (배경)
    roadList.push({ x: 0, y: 0, width: mapWidth, height: mapHeight, isMainRoad: false });

    // 블록 사이의 도로 계산
    blocks.forEach((block, index) => {
      // 블록 위쪽 도로
      if (block.y > 0) {
        const roadKey = `${block.x}-${block.y - 1}-${block.width}-1`;
        if (!roadMap.has(roadKey)) {
          roadMap.add(roadKey);
          roadList.push({
            x: block.x,
            y: block.y - 1,
            width: block.width,
            height: 1,
            isMainRoad: true,
          });
        }
      }
      
      // 블록 아래쪽 도로
      const belowY = block.y + block.height;
      if (belowY < mapHeight) {
        const roadKey = `${block.x}-${belowY}-${block.width}-1`;
        if (!roadMap.has(roadKey)) {
          roadMap.add(roadKey);
          roadList.push({
            x: block.x,
            y: belowY,
            width: block.width,
            height: 1,
            isMainRoad: true,
          });
        }
      }
      
      // 블록 왼쪽 도로
      if (block.x > 0) {
        const roadKey = `${block.x - 1}-${block.y}-1-${block.height}`;
        if (!roadMap.has(roadKey)) {
          roadMap.add(roadKey);
          roadList.push({
            x: block.x - 1,
            y: block.y,
            width: 1,
            height: block.height,
            isMainRoad: true,
          });
        }
      }
      
      // 블록 오른쪽 도로
      const rightX = block.x + block.width;
      if (rightX < mapWidth) {
        const roadKey = `${rightX}-${block.y}-1-${block.height}`;
        if (!roadMap.has(roadKey)) {
          roadMap.add(roadKey);
          roadList.push({
            x: rightX,
            y: block.y,
            width: 1,
            height: block.height,
            isMainRoad: true,
          });
        }
      }
    });

    return roadList;
  }, []);

  // 블록 4와 블록 5 사이 중심 계산
  // 블록 4: x=4, width=8, y=7, height=6
  // 블록 5: x=14, width=6, y=7, height=6
  // 블록 4와 5 사이 중심: X = (4+8 + 14) / 2 = 13, Y = 7 + 6/2 = 10
  const block4Right = MAP_LAYOUT.blocks[3].x + MAP_LAYOUT.blocks[3].width; // 블록 4의 오른쪽 끝
  const block5Left = MAP_LAYOUT.blocks[4].x; // 블록 5의 왼쪽 끝
  const centerX = (block4Right + block5Left) / 2; // 블록 4와 5 사이 중심 X
  const centerY = MAP_LAYOUT.blocks[3].y + MAP_LAYOUT.blocks[3].height / 2; // 블록 4와 5의 중심 Y (같은 y 위치)

  return (
    <div style={{ width: '100%', height: '100%', background: '#e5e7eb' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[centerX + 5, 20, centerY + 5]} fov={50} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[centerX + 5, 20, centerY + 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[centerX - 5, 10, centerY - 5]} intensity={0.5} />

        {/* 전체 맵 배경 그리드 (옅게, 중심 기준) */}
        <group position={[MAP_LAYOUT.mapWidth / 2, -0.015, MAP_LAYOUT.mapHeight / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <Grid
            args={[MAP_LAYOUT.mapWidth, MAP_LAYOUT.mapHeight]}
            cellSize={1}
            cellColor="#e0e0e0"
            sectionColor="#d0d0d0"
            cellThickness={0.2}
            sectionThickness={0.3}
            fadeDistance={30}
            fadeStrength={1}
          />
        </group>

        {/* 도로들 */}
        {roads.map((road, index) => (
          <Road3D key={`road-${index}`} {...road} />
        ))}

        {/* 블록들 */}
        {MAP_LAYOUT.blocks.map(block => (
          <Block3D
            key={block.id}
            block={block}
            tileBuildings={tileBuildings}
          />
        ))}

        {/* 카메라 컨트롤 (블록 4와 5 사이 중심 기준) */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          target={[centerX, 0, centerY]}
        />
      </Canvas>
    </div>
  );
}
