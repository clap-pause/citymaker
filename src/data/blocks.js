// 블록 데이터 정의
export const BLOCKS = [
  {
    id: 'block1',
    name: '블록 1',
    totalSize: 16,
    usedSize: 0,
    availableSize: 16,
  },
  {
    id: 'block2',
    name: '블록 2',
    totalSize: 16,
    usedSize: 0,
    availableSize: 16,
  },
  {
    id: 'block3',
    name: '블록 3',
    totalSize: 24,
    usedSize: 0,
    availableSize: 24,
  },
  {
    id: 'block4',
    name: '블록 4',
    totalSize: 48,
    usedSize: 0,
    availableSize: 48,
  },
  {
    id: 'block5',
    name: '블록 5',
    totalSize: 36,
    usedSize: 4, // 기존 건물 4칸
    availableSize: 32,
  },
  {
    id: 'block6',
    name: '블록 6',
    totalSize: 64, // 16 * 4 = 64
    usedSize: 8, // 기존 건물 8칸
    availableSize: 56,
  },
];
