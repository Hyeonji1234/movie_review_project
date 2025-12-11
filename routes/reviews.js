const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { authenticateToken } = require('../middleware/auth');

// 리뷰 작성 (인증 필요)
router.post('/', authenticateToken, async (req, res) => {
  try {
      const { movie_id, rating, comment, spoiler, tags } = req.body;
    const user_id = req.user_id; // JWT 미들웨어에서 추출

    // 입력 검증
    if (!movie_id || !rating) {
      return res.status(400).json({
        success: false,
        message: '영화 ID와 별점은 필수입니다.'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: '별점은 1~5 사이의 값이어야 합니다.'
      });
    }

    // 리뷰 생성
      const review = await Review.create(movie_id, user_id, rating, comment, spoiler, tags); 

    res.status(201).json({
      success: true,
      message: '리뷰가 작성되었습니다.',
      data: review
    });
  } catch (error) {
    console.error('리뷰 작성 에러:', error);
    res.status(500).json({
      success: false,
      message: '리뷰 작성 중 오류가 발생했습니다.'
    });
  }
});

// 특정 영화의 리뷰 조회
router.get('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;

    const reviews = await Review.findByMovieId(movieId);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('리뷰 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '리뷰 조회 중 오류가 발생했습니다.'
    });
  }
});

// 리뷰 삭제 (인증 필요)
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user_id = req.user_id;

    const deleted = await Review.delete(reviewId, user_id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없거나 삭제 권한이 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '리뷰가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('리뷰 삭제 에러:', error);
    res.status(500).json({
      success: false,
      message: '리뷰 삭제 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;