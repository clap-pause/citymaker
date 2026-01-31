// API 기본 URL (환경에 따라 변경)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 세션 ID 가져오기 또는 생성
export async function getOrCreateSession(existingSessionId = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: existingSessionId }),
    });
    
    if (!response.ok) {
      throw new Error('세션 생성 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('세션 생성 오류:', error);
    // 오프라인 모드: 로컬 스토리지에서 세션 ID 가져오기 또는 생성
    let sessionId = existingSessionId || localStorage.getItem('citySessionId');
    if (!sessionId) {
      sessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('citySessionId', sessionId);
    }
    return { sessionId, exists: false, offline: true };
  }
}

// 도시 데이터 저장
export async function saveCityData(sessionId, data) {
  try {
    const response = await fetch(`${API_BASE_URL}/cities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        ...data,
      }),
    });
    
    if (!response.ok) {
      throw new Error('도시 데이터 저장 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('도시 저장 오류:', error);
    // 오프라인 모드: 로컬 스토리지에 저장
    try {
      const localData = {
        sessionId,
        ...data,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`cityData_${sessionId}`, JSON.stringify(localData));
      return { success: true, message: '로컬에 저장되었습니다 (오프라인 모드)', offline: true };
    } catch (localError) {
      console.error('로컬 저장 오류:', localError);
      throw error;
    }
  }
}

// 도시 데이터 로드
export async function loadCityData(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/cities/${sessionId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // 오프라인 모드: 로컬 스토리지에서 로드
        const localData = localStorage.getItem(`cityData_${sessionId}`);
        if (localData) {
          const parsed = JSON.parse(localData);
          return {
            ...parsed,
            offline: true,
          };
        }
        throw new Error('도시 데이터를 찾을 수 없습니다');
      }
      throw new Error('도시 데이터 로드 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('도시 로드 오류:', error);
    // 오프라인 모드 시도
    const localData = localStorage.getItem(`cityData_${sessionId}`);
    if (localData) {
      const parsed = JSON.parse(localData);
      return {
        ...parsed,
        offline: true,
      };
    }
    throw error;
  }
}

// 도시 목록 조회
export async function getCityList() {
  try {
    const response = await fetch(`${API_BASE_URL}/cities`);
    
    if (!response.ok) {
      throw new Error('도시 목록 조회 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('도시 목록 조회 오류:', error);
    // 오프라인 모드: 로컬 스토리지에서 목록 생성
    const localCities = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cityData_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          localCities.push({
            sessionId: data.sessionId,
            cityName: data.cityName || '로컬 도시',
            createdAt: data.savedAt || new Date().toISOString(),
            updatedAt: data.savedAt || new Date().toISOString(),
          });
        } catch (e) {
          // 무시
        }
      }
    }
    return localCities;
  }
}

// 헬스 체크
export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    return false;
  }
}
