const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// 인기 영화 목록
router.get('/popular', async (req, res) => {
  try {
    const { page = 1 } = req.query;

    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'ko-KR',
        page
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('인기 영화 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '영화 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 최고 평점 영화 목록
router.get('/top-rated', async (req, res) => {
  try {
    const { page = 1 } = req.query;

    const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'ko-KR',
        page
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('최고 평점 영화 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '영화 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 영화 상세 정보
router.get('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;

    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'ko-KR',
        append_to_response: 'videos,credits'
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('영화 상세 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '영화 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// 영화 검색
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: '검색어를 입력해주세요.'
      });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'ko-KR',
        query,
        page
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('영화 검색 에러:', error);
    res.status(500).json({
      success: false,
      message: '영화 검색 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
