// 맵 레이아웃 정의
// 블록 배치:
// 행 1: 블록 1(4x4) 도로 블록 2(4x4) 도로 블록 3(6x4)
// 행 2: 블록 4(8x6) 도로 블록 5(6x6)
// 행 3: 블록 6(15x4) - 우측 상단에 4x2 기존 건물
// 정렬 규칙:
// - 블록 1의 왼쪽 선 = 블록 6의 왼쪽 선 (x=2)
// - 블록 3의 오른쪽 선 = 블록 6의 오른쪽 선 (x=18)
// - 블록 4의 왼쪽 선 = 블록 1의 왼쪽 선 (x=2)
// - 블록 5의 오른쪽 선 = 블록 3의 오른쪽 선 (x=18)
// 전체를 가운데 정렬하고 주위에 여백(도로) 추가
export const MAP_LAYOUT = {
  // 전체 맵 크기와 블록 배치
  blocks: [
    {
      id: 'block1',
      name: '블록 1',
      x: 4, // 왼쪽 여백 2칸에서 오른쪽으로 2칸 이동
      y: 2, // 위쪽 여백 2칸
      width: 4,
      height: 4,
      totalSize: 16,
      existingBuildings: [],
    },
    {
      id: 'block2',
      name: '블록 2',
      x: 9, // 블록 1과 간격 (도로 1칸)
      // 블록 1의 오른쪽 끝: x=4 + 4 = 8
      // 블록 2의 왼쪽: x=9 (도로 1칸)
      y: 2,
      width: 4,
      height: 4,
      totalSize: 16,
      existingBuildings: [],
    },
    {
      id: 'block3',
      name: '블록 3',
      x: 14, // 블록 2와 간격 (도로 1칸)
      // 블록 2의 오른쪽 끝: x=9 + 4 = 13
      // 블록 3의 왼쪽: x=14 (도로 1칸)
      // 블록 3의 오른쪽 끝: x=14 + 6 = 20
      y: 2,
      width: 6,
      height: 4,
      totalSize: 24,
      existingBuildings: [],
    },
    {
      id: 'block4',
      name: '블록 4',
      x: 4, // 블록 1, 블록 6과 같은 왼쪽 선
      y: 7, // 첫 번째 행 아래 (도로 1칸)
      width: 8,
      height: 6,
      totalSize: 48,
      existingBuildings: [],
    },
    {
      id: 'block5',
      name: '블록 5',
      x: 14, // 블록 3, 블록 6과 같은 오른쪽 선을 맞추기 위해
      // 블록 5의 오른쪽 끝: x=14 + 6 = 20 (블록 3, 블록 6과 같은 열)
      y: 7,
      width: 6,
      height: 6,
      totalSize: 36,
      existingBuildings: [
        // 좌측 상단 2x2 영역 (기존 건물)
        { x: 0, y: 0, width: 2, height: 2 }
      ],
    },
    {
      id: 'block6',
      name: '블록 6',
      x: 4, // 블록 1의 왼쪽 선과 같은 열
      y: 14, // 두 번째 행 아래 (도로 1칸)
      width: 16, // 블록 3의 오른쪽 끝(20)과 맞추기 위해 16으로 조정
      height: 4,
      totalSize: 64, // 16 * 4 = 64
      existingBuildings: [
        // 우측 상단 4x2 영역 (기존 건물)
        { x: 12, y: 0, width: 4, height: 2 } // x 좌표 조정 (16-4=12)
      ],
    },
  ],
  // 전체 맵 크기 (타일 단위)
  // 블록 1, 4, 6의 왼쪽 끝: x=4
  // 블록 3, 5, 6의 오른쪽 끝: x=20, 오른쪽 여백 2칸 = 22
  // 블록 6의 아래쪽 끝: y=14 + 4 = 18, 아래쪽 여백 2칸 = 20
  mapWidth: 22,
  mapHeight: 20,
  // 타일 크기 (픽셀)
  tileSize: 30,
  // 여백 (타일 단위)
  padding: 2,
};
