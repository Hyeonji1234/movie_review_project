const mysql = require('mysql2/promise');
require('dotenv').config();

// MariaDB 연결 설정
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'cinema_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Connection Pool 생성
const pool = mysql.createPool(dbConfig);

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MariaDB 연결 성공');
    connection.release();
  } catch (error) {
    console.error('MariaDB 연결 실패:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
