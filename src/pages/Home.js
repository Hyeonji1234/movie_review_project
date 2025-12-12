import React, { useEffect, useState } from 'react';
import { movieAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const res = await movieAPI.getPopular(1);

                // 🔥 응답 구조 방어적으로 처리
                const results =
                    res?.data?.data?.results ||
                    res?.data?.results ||
                    [];

                setMovies(results);
            } catch (err) {
                console.error('인기 영화 로딩 실패', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPopular();
    }, []);

    if (loading) {
        return <p style={{ color: '#fff' }}>로딩 중...</p>;
    }

    return (
        <div className="container">
            <h2 style={{ color: '#fff' }}>인기 영화</h2>

            {movies.length === 0 ? (
                <p style={{ color: '#aaa' }}>영화가 없습니다.</p>
            ) : (
                <div className="movies-grid">
                    {movies.map(movie => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
