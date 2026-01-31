// 건물 모양 정의 및 회전 처리

/**
 * ㄱ자 모형 (3칸)의 타일 위치를 반환 (회전 각도에 따라)
 * @param {number} rotation - 회전 각도 (0, 90, 180, 270)
 * @returns {Array} [{x, y}] 형태의 타일 위치 배열
 */
export function getLShapeTiles(rotation = 0) {
  // 기본 ㄱ자 모형 (2x2에서 우측 하단이 비어있음)
  // [x, x]
  // [x,  ]
  const baseTiles = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  // 회전에 따라 변환
  switch (rotation) {
    case 0: // 기본
      return baseTiles;
    case 90: // 시계방향 90도
      // [x, x]
      // [ , x]
      return [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ];
    case 180: // 180도
      // [ , x]
      // [x, x]
      return [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ];
    case 270: // 270도
      // [x,  ]
      // [x, x]
      return [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ];
    default:
      return baseTiles;
  }
}

/**
 * 타일 좌표들을 바운딩 박스 기준으로 회전
 * - 0도: 그대로
 * - 90도: (x, y) -> (h-1-y, x)
 * - 180도: (x, y) -> (w-1-x, h-1-y)
 * - 270도: (x, y) -> (y, w-1-x)
 */
function rotateTiles(tiles, width, height, rotation = 0) {
  const rot = ((rotation % 360) + 360) % 360;
  if (rot === 0) return tiles;
  if (rot === 90) return tiles.map(({ x, y }) => ({ x: height - 1 - y, y: x }));
  if (rot === 180) return tiles.map(({ x, y }) => ({ x: width - 1 - x, y: height - 1 - y }));
  if (rot === 270) return tiles.map(({ x, y }) => ({ x: y, y: width - 1 - x }));
  return tiles;
}

function getTilesBounds(tiles) {
  let maxX = 0;
  let maxY = 0;
  for (const t of tiles) {
    if (t.x > maxX) maxX = t.x;
    if (t.y > maxY) maxY = t.y;
  }
  return { width: maxX + 1, height: maxY + 1 };
}

/**
 * 5칸 모형 (요청 형태): 2x2 + 왼쪽 아래로 1칸 추가
 * 기본(0도):
 * XX
 * XX
 * X
 * @param {number} rotation - 회전 각도 (0, 90, 180, 270)
 * @returns {Array} [{x, y}] 형태의 타일 위치 배열
 */
export function getLargeLShapeTiles(rotation = 0) {
  const baseTiles = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 0, y: 2 },
  ];
  return rotateTiles(baseTiles, 2, 3, rotation);
}

/**
 * 일자 모형 (2칸)의 타일 위치를 반환 (회전 각도에 따라)
 * @param {number} rotation - 회전 각도 (0, 90, 180, 270)
 * @returns {Array} [{x, y}] 형태의 타일 위치 배열
 */
export function getLine2Tiles(rotation = 0) {
  // 기본: 가로 일자 (2x1)
  // [x, x]
  const baseTiles = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ];

  // 회전에 따라 변환
  if (rotation === 90 || rotation === 270) {
    // 세로 일자 (1x2)
    return [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
    ];
  }
  // 0도 또는 180도는 가로 일자
  return baseTiles;
}

/**
 * 직사각형 모형 (6칸: 2x3)의 타일 위치를 반환 (회전 각도에 따라)
 * @param {number} rotation - 회전 각도 (0, 90, 180, 270)
 * @returns {Array} [{x, y}] 형태의 타일 위치 배열
 */
export function getRectangle6Tiles(rotation = 0) {
  // 기본: 2x3 (가로로 긴 직사각형)
  // [x, x]
  // [x, x]
  // [x, x]
  const baseTiles = [];
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 2; x++) {
      baseTiles.push({ x, y });
    }
  }

  // 회전에 따라 변환
  if (rotation === 90 || rotation === 270) {
    // 3x2 (세로로 긴 직사각형)
    const rotatedTiles = [];
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 3; x++) {
        rotatedTiles.push({ x, y });
      }
    }
    return rotatedTiles;
  }
  // 0도 또는 180도는 2x3
  return baseTiles;
}

/**
 * 직사각형 모형 (8칸: 2x4)의 타일 위치를 반환 (회전 각도에 따라)
 * @param {number} rotation - 회전 각도 (0, 90, 180, 270)
 * @returns {Array} [{x, y}] 형태의 타일 위치 배열
 */
export function getRectangle8Tiles(rotation = 0) {
  // 기본: 2x4 (가로로 긴 직사각형)
  // [x, x]
  // [x, x]
  // [x, x]
  // [x, x]
  const baseTiles = [];
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 2; x++) {
      baseTiles.push({ x, y });
    }
  }

  // 회전에 따라 변환
  if (rotation === 90 || rotation === 270) {
    // 4x2 (세로로 긴 직사각형)
    const rotatedTiles = [];
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 4; x++) {
        rotatedTiles.push({ x, y });
      }
    }
    return rotatedTiles;
  }
  // 0도 또는 180도는 2x4
  return baseTiles;
}

/**
 * 건물의 실제 타일 위치를 반환 (모양과 회전 고려)
 * @param {Object} building - 건물 데이터
 * @param {number} rotation - 회전 각도
 * @param {number} startX - 시작 x 좌표
 * @param {number} startY - 시작 y 좌표
 * @returns {Array} [{x, y}] 형태의 타일 위치 배열
 */
export function getBuildingTiles(building, rotation = 0, startX = 0, startY = 0) {
  let tiles = [];
  
  if (building.shape === 'L') {
    // ㄱ자 모형 (3칸)
    tiles = getLShapeTiles(rotation);
  } else if (building.shape === 'L5') {
    // L자 모형 (5칸: 2x2 + 1칸)
    tiles = getLargeLShapeTiles(rotation);
  } else if (building.shape === 'line2') {
    // 일자 모형 (2칸)
    tiles = getLine2Tiles(rotation);
  } else if (building.shape === 'rect6') {
    // 직사각형 모형 (6칸: 2x3)
    tiles = getRectangle6Tiles(rotation);
  } else if (building.shape === 'rect8') {
    // 직사각형 모형 (8칸: 2x4)
    tiles = getRectangle8Tiles(rotation);
  } else if (building.size === 4) {
    // 4칸: 2x2 정사각형
    tiles = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];
  } else if (building.size === 1) {
    // 1칸
    tiles = [{ x: 0, y: 0 }];
  } else {
    // 기본: 정사각형 (사용되지 않을 것으로 예상)
    const size = building.size;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        tiles.push({ x, y });
      }
    }
  }
  
  // 시작 좌표로 변환
  return tiles.map(tile => ({
    x: startX + tile.x,
    y: startY + tile.y,
  }));
}

/**
 * 건물의 바운딩 박스 크기 반환 (회전 고려)
 */
export function getBuildingBounds(building, rotation = 0) {
  if (building.shape === 'L') {
    // ㄱ자 모형 (3칸)은 항상 2x2
    return { width: 2, height: 2 };
  } else if (building.shape === 'L5') {
    // 5칸 모형 (2x3에서 우하단 1칸이 빈 형태)
    const tiles = getLargeLShapeTiles(rotation);
    return getTilesBounds(tiles);
  } else if (building.shape === 'line2') {
    // 일자 모형 (2칸)
    if (rotation === 90 || rotation === 270) {
      return { width: 1, height: 2 };
    }
    return { width: 2, height: 1 };
  } else if (building.shape === 'rect6') {
    // 직사각형 모형 (6칸: 2x3)
    if (rotation === 90 || rotation === 270) {
      return { width: 3, height: 2 };
    }
    return { width: 2, height: 3 };
  } else if (building.shape === 'rect8') {
    // 직사각형 모형 (8칸: 2x4)
    if (rotation === 90 || rotation === 270) {
      return { width: 4, height: 2 };
    }
    return { width: 2, height: 4 };
  } else if (building.size === 4) {
    // 4칸: 2x2
    return { width: 2, height: 2 };
  } else if (building.size === 1) {
    // 1칸
    return { width: 1, height: 1 };
  } else {
    // 기본: 정사각형
    return { width: building.size, height: building.size };
  }
}
