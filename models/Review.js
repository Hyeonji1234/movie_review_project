const { pool } = require('../config/database');

(async () => {
    try {
        await pool.execute(`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS tags VARCHAR(255) NULL
    `);
        console.log("📌 tags 컬럼 자동 확인/생성 완료");
    } catch (err) {
        console.error("⚠ tags 컬럼 생성 체크 오류:", err);
    }
})();

class Review {
  // 리뷰 작성
  static async create(movie_id, user_id, rating, comment, spoiler, tags) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO reviews (movie_id, user_id, rating, comment, spoiler, tags) VALUES (?, ?, ?, ?, ?, ?)',
          [movie_id, user_id, rating, comment, spoiler, tags]
      );

      return {
        review_id: result.insertId,
        movie_id,
        user_id,
        rating,
        comment,
        spoiler,
        tags
      };
    } catch (error) {
      throw error;
    }
  }

  // 특정 영화의 리뷰 조회 (사용자 정보 포함)
  static async findByMovieId(movie_id) {
    try {
      const [rows] = await pool.execute(
        `SELECT
          r.review_id,
          r.movie_id,
          r.user_id,
          r.rating,
          r.comment,
          r.spoiler,
          r.created_at,
          r.tags,
          u.username,
          u.email
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.user_id
        WHERE r.movie_id = ?
        ORDER BY r.created_at DESC`,
        [movie_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // 특정 사용자의 리뷰 조회
  static async findByUserId(user_id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC',
        [user_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // 리뷰 삭제
  static async delete(review_id, user_id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM reviews WHERE review_id = ? AND user_id = ?',
        [review_id, user_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Review;