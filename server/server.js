import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

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

// 도시 데이터 저장
app.post('/api/cities', async (req, res) => {
  try {
    const { sessionId, blockBuildings, affordableRatio, environmentInvestment, cityName } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: '세션 ID가 필요합니다' });
    }
    
    const cityData = {
      sessionId,
      cityName: cityName || `도시_${new Date().toISOString().slice(0, 10)}`,
      blockBuildings: blockBuildings || {},
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
