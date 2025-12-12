import axios from 'axios';

// ✅ axios 인스턴스는 단 하나만
const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_BASE_URL}/api`,
});

// ===== 영화 API =====
export const movieAPI = {
    getPopular: (page = 1) =>
        api.get('/movies/popular', { params: { page } }),

    getTopRated: (page = 1) =>
        api.get('/movies/top-rated', { params: { page } }),

    searchMovies: (query, page = 1) =>
        api.get('/movies/search', { params: { query, page } }),

    getMovieDetails: (id) =>
        api.get(`/movies/${id}`),
};

// 기본 axios 인스턴스 export
export default api;
