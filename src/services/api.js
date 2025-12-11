import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 사용자 API
export const userAPI = {
  signup: (data) => api.post('/users/signup', data),
  login: (data) => api.post('/users/login', data),
};

// 영화 API
export const movieAPI = {
  getPopular: (page = 1) => api.get('/movies/popular', { params: { page } }),
  getTopRated: (page = 1) => api.get('/movies/top-rated', { params: { page } }),
  getMovieDetails: (movieId) => api.get(`/movies/${movieId}`),
  searchMovies: (query, page = 1) => api.get('/movies/search', { params: { query, page } }),
};

// 리뷰 API
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getReviewsByMovie: (movieId) => api.get(`/reviews/${movieId}`),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

export default api;
