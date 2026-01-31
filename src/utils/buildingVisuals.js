// 건물 시각적 표현 유틸리티

/**
 * 건물 타입별 색상 및 스타일 반환
 */
export function getBuildingStyle(building, rotation = 0) {
  const baseColors = {
    // 상업 공간
    convenienceStore: { bg: '#FFE5B4', border: '#FFA500', pattern: 'dots' },
    supermarket: { bg: '#FFD700', border: '#FF8C00', pattern: 'stripes' },
    largeMart: { bg: '#FF6347', border: '#DC143C', pattern: 'grid' },
    
    // 오피스 공간
    smallOffice: { bg: '#87CEEB', border: '#4682B4', pattern: 'diagonal' },
    mediumOffice: { bg: '#6495ED', border: '#4169E1', pattern: 'diagonal' },
    largeOffice: { bg: '#4169E1', border: '#0000CD', pattern: 'diagonal' },
    
    // 주거 공간
    villaOfficetel: { bg: '#98FB98', border: '#32CD32', pattern: 'bricks' },
    house: { bg: '#90EE90', border: '#228B22', pattern: 'bricks' },
    apartment: { bg: '#7CFC00', border: '#00FF00', pattern: 'bricks' },
    
    // 오픈 스페이스
    park: { bg: '#90EE90', border: '#228B22', pattern: 'grass' },
    culturalCenter: { bg: '#DDA0DD', border: '#9370DB', pattern: 'waves' },
    sportsFacility: { bg: '#F0E68C', border: '#DAA520', pattern: 'lines' },
    
    // 기타
    logisticsCenter: { bg: '#D3D3D3', border: '#808080', pattern: 'grid' },
    recyclingResearch: { bg: '#AFEEEE', border: '#48D1CC', pattern: 'circles' },
  };

  return baseColors[building.id] || { bg: '#E0E0E0', border: '#999', pattern: 'solid' };
}

/**
 * 건물 패턴 스타일 생성
 */
export function getBuildingPatternStyle(building, rotation = 0) {
  const style = getBuildingStyle(building, rotation);
  const patterns = {
    dots: {
      backgroundImage: `radial-gradient(circle, ${style.border} 1px, transparent 1px)`,
      backgroundSize: '6px 6px',
    },
    stripes: {
      backgroundImage: `repeating-linear-gradient(45deg, ${style.bg}, ${style.bg} 4px, ${style.border} 4px, ${style.border} 8px)`,
    },
    grid: {
      backgroundImage: `
        linear-gradient(${style.border} 1px, transparent 1px),
        linear-gradient(90deg, ${style.border} 1px, transparent 1px)
      `,
      backgroundSize: '8px 8px',
    },
    diagonal: {
      backgroundImage: `repeating-linear-gradient(45deg, ${style.bg}, ${style.bg} 3px, ${style.border} 3px, ${style.border} 6px)`,
    },
    bricks: {
      backgroundImage: `
        linear-gradient(${style.border} 1px, transparent 1px),
        linear-gradient(90deg, ${style.border} 1px, transparent 1px)
      `,
      backgroundSize: '10px 10px',
      backgroundPosition: '0 0, 5px 5px',
    },
    grass: {
      backgroundImage: `radial-gradient(ellipse at center, ${style.bg} 30%, ${style.border} 70%)`,
      backgroundSize: '8px 8px',
    },
    waves: {
      backgroundImage: `repeating-linear-gradient(0deg, ${style.bg}, ${style.bg} 2px, ${style.border} 2px, ${style.border} 4px)`,
    },
    lines: {
      backgroundImage: `repeating-linear-gradient(90deg, ${style.bg}, ${style.bg} 2px, ${style.border} 2px, ${style.border} 4px)`,
    },
    circles: {
      backgroundImage: `radial-gradient(circle at center, ${style.bg} 40%, ${style.border} 100%)`,
      backgroundSize: '12px 12px',
    },
    solid: {
      backgroundColor: style.bg,
    },
  };

  return {
    backgroundColor: style.bg,
    borderColor: style.border,
    ...patterns[style.pattern],
  };
}
