const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const usersRoutes = require('./routes/users');
const reviewsRoutes = require('./routes/reviews');
const moviesRoutes = require('./routes/movies');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱

// 라우터 설정
app.use('/api/users', usersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/movies', moviesRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Cinema 21 API Server',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      reviews: '/api/reviews',
      movies: '/api/movies'
    }
  });
});

// 404 에러 핸들링
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청하신 리소스를 찾을 수 없습니다.'
  });
});

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결 테스트
    await testConnection();

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`API 문서: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer();
