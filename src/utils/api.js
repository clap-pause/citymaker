import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseFirestore, hasFirebaseWebConfig } from './firebaseClient';

// API 기본 URL (환경에 따라 변경)
// - 백엔드 없이 쓰려면 VITE_API_URL을 설정하지 마세요(완전 오프라인 모드).
// - 끝의 "/" 는 제거해서 `//access-code/verify` 같은 실수를 방지
const RAW_API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = RAW_API_BASE_URL ? String(RAW_API_BASE_URL).replace(/\/+$/, '') : '';
const HAS_API = Boolean(API_BASE_URL);
const OFFLINE_ACCESS_PIN = String(import.meta.env.VITE_ACCESS_PIN || '');

// 세션 ID 가져오기 또는 생성
export async function getOrCreateSession(existingSessionId = null) {
  if (!HAS_API) {
    let sessionId = existingSessionId || localStorage.getItem('citySessionId');
    if (!sessionId) {
      sessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('citySessionId', sessionId);
    }
    return { sessionId, exists: Boolean(existingSessionId), offline: true };
  }
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
  if (!HAS_API) {
    const localData = {
      sessionId,
      ...data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`cityData_${sessionId}`, JSON.stringify(localData));
    return { success: true, message: '로컬에 저장되었습니다 (오프라인 모드)', offline: true };
  }
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
  if (!HAS_API) {
    const localData = localStorage.getItem(`cityData_${sessionId}`);
    if (localData) {
      const parsed = JSON.parse(localData);
      return { ...parsed, offline: true };
    }
    throw new Error('도시 데이터를 찾을 수 없습니다');
  }
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
  if (!HAS_API) {
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
  if (!HAS_API) return false;
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

// 접속 코드 검증
export async function verifyAccessCode(code) {
  const trimmed = String(code ?? '').trim();

  // 0) 오프라인 고정 PIN (Vercel only 등)
  if (OFFLINE_ACCESS_PIN && trimmed === OFFLINE_ACCESS_PIN.trim()) {
    return { ok: true, offline: true, lastRotatedAt: null };
  }

  // 1) 백엔드가 없더라도, Firestore에서 PIN을 직접 조회해서 검증할 수 있음 (Firebase Web SDK)
  //    - Firestore 경로: pw/pin_num (필드: pin_num)
  //    - Firestore Rules에서 이 문서 read가 허용되어야 함
  if (!HAS_API && hasFirebaseWebConfig()) {
    const db = getFirebaseFirestore();
    if (db) {
      const snap = await getDoc(doc(db, 'pw', 'pin_num'));
      const data = snap.exists() ? snap.data() : null;
      const pin = data?.pin_num === undefined || data?.pin_num === null ? null : String(data.pin_num).trim();
      const updatedAt = data?.updatedAt?.toDate ? data.updatedAt.toDate() : null;
      if (pin && trimmed === pin) {
        return { ok: true, offline: true, lastRotatedAt: updatedAt };
      }
      // pin이 없거나 불일치면 아래에서 백엔드(있으면) 시도하거나 실패 처리
      if (!HAS_API) {
        return { ok: false, offline: true, lastRotatedAt: updatedAt };
      }
    }
  }

  // 오프라인 모드에서 PIN이 없으면(또는 불일치면) 실패 처리
  if (!HAS_API) {
    return { ok: false, offline: true, lastRotatedAt: null };
  }

  // 1) 서버 검증 시도
  try {
    const response = await fetch(`${API_BASE_URL}/access-code/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: trimmed }),
    });

    if (!response.ok) {
      // 서버가 에러 응답을 준 경우에도, 배포 환경(백엔드 없음)에서는 로컬 PIN로 폴백 가능
      throw new Error(`접속 코드 검증 실패 (status ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    // 2) 백엔드가 없을 때를 위한 오프라인 PIN 검증 (Vercel만 배포 시)
    if (OFFLINE_ACCESS_PIN && trimmed === OFFLINE_ACCESS_PIN.trim()) {
      return { ok: true, offline: true, lastRotatedAt: null };
    }
    throw error;
  }
}

// 현재 접속 코드 정보 조회 (원하면 UI에서 사용할 수 있음)
export async function getCurrentAccessCodeInfo() {
  if (!HAS_API) {
    throw new Error('백엔드가 없어 접속 코드 정보를 조회할 수 없습니다.');
  }
  const response = await fetch(`${API_BASE_URL}/access-code/current`);
  if (!response.ok) {
    throw new Error('접속 코드 정보 조회 실패');
  }
  return await response.json();
}
