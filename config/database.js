const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway MySQL 환경 변수 기반 설정
const dbConfig = {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// DB 연결 테스트
const testConnection = async () => {
    try {
        const conn = await pool.getConnection();
        console.log('🚀 Railway MySQL 연결 성공');
        conn.release();
    } catch (error) {
        console.error('❌ Railway MySQL 연결 실패:', error);
        process.exit(1);
    }
};

module.exports = { pool, testConnection };
