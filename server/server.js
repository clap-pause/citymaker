import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import admin from 'firebase-admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

// MongoDB 연결
let db;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/city-calculator';

async function connectDB() {
  try {
    // MongoDB URI가 기본값이고 'your-connection-string'인 경우 스킵
    if (MONGODB_URI.includes('your-connection-string') || MONGODB_URI.includes('localhost:27017')) {
      console.log('⚠️  MongoDB 연결 문자열이 설정되지 않았습니다.');
      console.log('📝 MongoDB Atlas를 사용하려면 server/.env 파일에 MONGODB_URI를 설정하세요.');
      console.log('💡 현재는 메모리 모드로 실행됩니다 (서버 재시작 시 데이터 손실)');
      db = null;
      return;
    }
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('city-calculator');
    console.log('✅ MongoDB 연결 성공');
    
    // 인덱스 생성 (성능 최적화)
    await db.collection('cities').createIndex({ sessionId: 1 });
    await db.collection('cities').createIndex({ createdAt: -1 });
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error.message);
    console.log('💡 현재는 메모리 모드로 실행됩니다 (서버 재시작 시 데이터 손실)');
    console.log('📝 MongoDB Atlas를 사용하려면 server/.env 파일에 올바른 MONGODB_URI를 설정하세요.');
    db = null;
  }
}

// 메모리 기반 임시 저장소 (MongoDB 없을 때 사용)
const memoryStore = new Map();

// ---- Firebase(Cloud Firestore) 기반 접속 코드 ----
let firestore = null;
let cachedAccessPin = null;
let cachedAccessPinUpdatedAt = null;
let unsubscribeAccessCodeListener = null;

function hasFirebaseEnv() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

function initFirebase() {
  if (!hasFirebaseEnv()) {
    console.log('⚠️  Firebase 환경 변수가 없어 접속 코드가 서버 메모리 모드로 동작합니다.');
    console.log('   (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY)');
    return;
  }

  if (admin.apps?.length) {
    // 이미 초기화됨
    firestore = admin.firestore();
    return;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

  firestore = admin.firestore();
  console.log('✅ Firebase Admin 초기화 성공 (Firestore)');
}

async function fetchAccessPinFromFirestore() {
  if (!firestore) return null;
  // Firestore 경로: pw/pin_num (필드: pin_num)
  const docRef = firestore.collection('pw').doc('pin_num');
  const snap = await docRef.get();
  if (!snap.exists) return null;
  const data = snap.data() || {};
  const pinNum = data.pin_num;
  const pin = pinNum === undefined || pinNum === null ? null : String(pinNum);
  const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt instanceof Date ? data.updatedAt : null);
  return { pin, updatedAt };
}

function startAccessCodeListener() {
  if (!firestore) return;
  // Firestore 경로: pw/pin_num (필드: pin_num)
  const docRef = firestore.collection('pw').doc('pin_num');

  if (unsubscribeAccessCodeListener) {
    try { unsubscribeAccessCodeListener(); } catch {}
    unsubscribeAccessCodeListener = null;
  }

  unsubscribeAccessCodeListener = docRef.onSnapshot(async (snap) => {
    if (!snap.exists) {
      console.log('⚠️  Firestore pw/pin_num 문서가 없습니다. pin_num 필드를 만들어주세요.');
      return;
    }
    const data = snap.data() || {};
    const nextPinNum = data.pin_num;
    const nextPin = nextPinNum === undefined || nextPinNum === null ? null : String(nextPinNum);
    const nextUpdatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : null;

    if (!nextPin) {
      console.log('⚠️  Firestore pw/pin_num.pin_num 가 비어있습니다.');
      return;
    }

    const changed = nextPin !== cachedAccessPin;
    cachedAccessPin = nextPin;
    cachedAccessPinUpdatedAt = nextUpdatedAt || new Date();

    if (changed) {
      console.log('🔐 접속 PIN이 Firestore에서 변경됨');
    }
  }, (err) => {
    console.error('❌ Firestore 접속 코드 리스너 오류:', err.message);
  });
}

// 세션 ID 생성 또는 가져오기
app.post('/api/session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (sessionId) {
      // 기존 세션 확인
      if (db) {
        const city = await db.collection('cities').findOne({ sessionId });
        if (city) {
          return res.json({ sessionId, exists: true });
        }
      } else {
        // 메모리 모드
        if (memoryStore.has(sessionId)) {
          return res.json({ sessionId, exists: true, offline: true });
        }
      }
    }
    
    // 새 세션 생성
    const newSessionId = uuidv4();
    res.json({ sessionId: newSessionId, exists: false });
  } catch (error) {
    console.error('세션 생성 오류:', error);
    res.status(500).json({ error: '세션 생성 실패' });
  }
});

// 접속 코드 검증
app.post('/api/access-code/verify', async (req, res) => {
  try {
    const { code } = req.body || {};

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ ok: false, error: '코드가 필요합니다.' });
    }

    // Firestore 우선 (pin_num)
    let serverPin = cachedAccessPin;
    let updatedAt = cachedAccessPinUpdatedAt;

    if (firestore && !serverPin) {
      const fetched = await fetchAccessPinFromFirestore();
      if (fetched?.pin) {
        serverPin = fetched.pin;
        updatedAt = fetched.updatedAt || null;
        cachedAccessPin = serverPin;
        cachedAccessPinUpdatedAt = updatedAt || new Date();
      }
    }

    // Firebase 미설정인 경우: 서버 메모리 코드(수동 설정 전에는 접속 불가)
    if (!serverPin) {
      return res.status(503).json({
        ok: false,
        error: '접속 PIN이 설정되지 않았습니다. (Firestore pw/pin_num.pin_num 필요)',
      });
    }

    const trimmed = code.trim();
    const valid = trimmed === String(serverPin);

    return res.json({
      ok: valid,
      lastRotatedAt: updatedAt,
    });
  } catch (error) {
    console.error('접속 코드 검증 오류:', error);
    res.status(500).json({ ok: false, error: '접속 코드 검증 실패' });
  }
});

// (선택) 현재 접속 코드 정보 조회 - 관리용
app.get('/api/access-code/current', (req, res) => {
  if (!cachedAccessPin) {
    return res.status(404).json({ error: '접속 코드가 아직 생성되지 않았습니다.' });
  }
  res.json({
    pin_num: cachedAccessPin,
    lastRotatedAt: cachedAccessPinUpdatedAt,
  });
});

// 도시 데이터 저장
app.post('/api/cities', async (req, res) => {
  try {
    const { sessionId, blockBuildings, tileBuildings, affordableRatio, environmentInvestment, cityName } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: '세션 ID가 필요합니다' });
    }
    
    const cityData = {
      sessionId,
      cityName: cityName || `도시_${new Date().toISOString().slice(0, 10)}`,
      blockBuildings: blockBuildings || {},
      tileBuildings: tileBuildings || {}, // 위치 정보 포함
      affordableRatio: affordableRatio || 0,
      environmentInvestment: environmentInvestment || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (db) {
      // MongoDB 사용
      const result = await db.collection('cities').updateOne(
        { sessionId },
        { $set: cityData },
        { upsert: true }
      );
      
      res.json({ 
        success: true, 
        message: '도시 데이터가 저장되었습니다',
        id: result.upsertedId || sessionId
      });
    } else {
      // 메모리 모드
      memoryStore.set(sessionId, cityData);
      res.json({ 
        success: true, 
        message: '도시 데이터가 저장되었습니다 (메모리 모드)',
        id: sessionId,
        offline: true
      });
    }
  } catch (error) {
    console.error('도시 저장 오류:', error);
    res.status(500).json({ error: '도시 저장 실패' });
  }
});

// 도시 데이터 로드
app.get('/api/cities/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    let city;
    
    if (db) {
      city = await db.collection('cities').findOne({ sessionId });
    } else {
      // 메모리 모드
      city = memoryStore.get(sessionId);
    }
    
    if (!city) {
      return res.status(404).json({ error: '도시 데이터를 찾을 수 없습니다' });
    }
    
    res.json({
      sessionId: city.sessionId,
      cityName: city.cityName,
      blockBuildings: city.blockBuildings,
      tileBuildings: city.tileBuildings || {}, // 위치 정보 포함
      affordableRatio: city.affordableRatio,
      environmentInvestment: city.environmentInvestment,
      createdAt: city.createdAt,
      updatedAt: city.updatedAt,
      offline: !db,
    });
  } catch (error) {
    console.error('도시 로드 오류:', error);
    res.status(500).json({ error: '도시 로드 실패' });
  }
});

// 도시 목록 조회 (최근 20개)
app.get('/api/cities', async (req, res) => {
  try {
    if (db) {
      const cities = await db.collection('cities')
        .find({}, { projection: { sessionId: 1, cityName: 1, createdAt: 1, updatedAt: 1 } })
        .sort({ updatedAt: -1 })
        .limit(20)
        .toArray();
      
      res.json(cities);
    } else {
      // 메모리 모드
      const cities = Array.from(memoryStore.values())
        .map(city => ({
          sessionId: city.sessionId,
          cityName: city.cityName,
          createdAt: city.createdAt,
          updatedAt: city.updatedAt,
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 20);
      
      res.json(cities);
    }
  } catch (error) {
    console.error('도시 목록 조회 오류:', error);
    res.status(500).json({ error: '도시 목록 조회 실패' });
  }
});

// 도시 삭제
app.delete('/api/cities/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (db) {
      const result = await db.collection('cities').deleteOne({ sessionId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: '도시 데이터를 찾을 수 없습니다' });
      }
    } else {
      // 메모리 모드
      if (!memoryStore.has(sessionId)) {
        return res.status(404).json({ error: '도시 데이터를 찾을 수 없습니다' });
      }
      memoryStore.delete(sessionId);
    }
    
    res.json({ success: true, message: '도시 데이터가 삭제되었습니다' });
  } catch (error) {
    console.error('도시 삭제 오류:', error);
    res.status(500).json({ error: '도시 삭제 실패' });
  }
});

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected'
  });
});

// 서버 시작
async function startServer() {
  // Firebase 초기화 (접속 코드 검증에 사용)
  initFirebase();
  startAccessCodeListener();

  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    if (!db) {
      console.log(`⚠️  주의: MongoDB가 연결되지 않아 메모리 모드로 실행 중입니다.`);
      console.log(`   서버를 재시작하면 모든 데이터가 사라집니다.`);
    }
  });
}

startServer().catch(console.error);
