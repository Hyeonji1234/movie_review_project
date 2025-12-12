import React, { useState, useEffect } from 'react';
import { movieAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import './Home.css';

const Popular = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            setLoading(true);

            const response = await movieAPI.getTopRated();

            // ✅ 백엔드가 {success,data}든, TMDB raw든 둘 다 대응
            const payload = response.data?.data ?? response.data;
            const results = payload?.results;

            if (!Array.isArray(results)) {
                throw new Error('Invalid /movies/top-rated response: results is not an array');
            }

            setMovies(results);
        } catch (err) {
            setError('영화 목록을 불러오는데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>영화 목록을 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="container">
                <h1 className="page-title">최고 평점 영화</h1>
                <div className="movies-grid">
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Popular;
