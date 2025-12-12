import axios from 'axios';

// axios 인스턴스는 반드시 한 번만 선언
const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_BASE_URL}/api`,
});

/* =========================
   영화 API
========================= */
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

/* =========================
   유저 API
========================= */
export const userAPI = {
    login: (data) =>
        api.post('/users/login', data),

    register: (data) =>
        api.post('/users/register', data),

    getProfile: () =>
        api.get('/users/profile'),
};

// 기본 axios 인스턴스 export
export default api;
