const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // 회원가입
  static async create(email, password, username) {
    try {
      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.execute(
        'INSERT INTO users (email, password, username) VALUES (?, ?, ?)',
        [email, hashedPassword, username]
      );

      return { user_id: result.insertId, email, username };
    } catch (error) {
      throw error;
    }
  }

  // 이메일로 사용자 찾기
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // ID로 사용자 찾기
  static async findById(user_id) {
    try {
      const [rows] = await pool.execute(
        'SELECT user_id, email, username, created_at FROM users WHERE user_id = ?',
        [user_id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 비밀번호 검증
  static async verifyPassword(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
  }
}

module.exports = User;
