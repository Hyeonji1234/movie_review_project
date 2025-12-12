import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

// 🎬 영화 API
export const movieAPI = {
    getPopular: (page = 1) =>
        api.get(`/movies/popular?page=${page}`),
    getTopRated: (page = 1) =>
        api.get(`/movies/top-rated?page=${page}`),
    search: (query, page = 1) =>
        api.get(`/movies/search?query=${query}&page=${page}`),
    getDetail: (id) =>
        api.get(`/movies/${id}`),
};

// 📝 리뷰 API
export const reviewAPI = {
    getReviews: (movieId) =>
        api.get(`/reviews/${movieId}`),
    addReview: (data) =>
        api.post(`/reviews`, data),
};

// 👤 유저 API
export const userAPI = {
    login: (data) =>
        api.post(`/users/login`, data),
    register: (data) =>
        api.post(`/users/register`, data),
};

export default api;
