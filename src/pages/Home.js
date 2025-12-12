import React, { useState, useEffect, useCallback, useRef } from 'react';
import { movieAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import HeroSlider from '../components/HeroSlider';
import './Home.css';

const Home = () => {
    const [heroMovies, setHeroMovies] = useState([]);
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef(null);

    // ✅ TMDB 응답이 랩핑되어도/안되어도 안전하게 파싱
    const getTmdbPayload = (response) => response?.data?.data ?? response?.data ?? {};
    const getResultsArray = (payload) => (Array.isArray(payload?.results) ? payload.results : []);
    const getTotalPages = (payload) => Number(payload?.total_pages ?? 1);

    const lastMovieElementRef = useCallback(
        (node) => {
            if (loadingMore) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage((prev) => prev + 1);
                }
            });

            if (node) observer.current.observe(node);
        },
        [loadingMore, hasMore]
    );

    useEffect(() => {
        fetchInitialMovies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 추가 페이지 로딩
    useEffect(() => {
        if (page > 1) {
            fetchMoreMovies();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const fetchInitialMovies = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await movieAPI.getPopular(1);

            const payload = getTmdbPayload(response);
            const results = getResultsArray(payload);
            const totalPages = getTotalPages(payload);

            // 히어로 섹션용으로 상위 5개 영화 사용
            setHeroMovies(results.slice(0, 5));
            setMovies(results);

            setHasMore(1 < totalPages);
        } catch (err) {
            console.error('초기 영화 로딩 실패:', err);
            setError('영화 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreMovies = async () => {
        try {
            setLoadingMore(true);

            const response = await movieAPI.getPopular(page);

            const payload = getTmdbPayload(response);
            const results = getResultsArray(payload);
            const totalPages = getTotalPages(payload);

            setMovies((prevMovies) => [...prevMovies, ...results]);
            setHasMore(page < totalPages);
        } catch (err) {
            console.error('추가 영화 로딩 실패:', err);
        } finally {
            setLoadingMore(false);
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
            <HeroSlider movies={heroMovies} />

            <div className="container">
                <h2 className="page-title">인기 영화</h2>

                <div className="movies-grid">
                    {movies.map((movie, index) => {
                        if (movies.length === index + 1) {
                            return (
                                <div ref={lastMovieElementRef} key={movie.id}>
                                    <MovieCard movie={movie} />
                                </div>
                            );
                        }
                        return <MovieCard key={movie.id} movie={movie} />;
                    })}
                </div>

                {loadingMore && (
                    <div className="loading-more">
                        <div className="loading-spinner-small"></div>
                        <p>추가 영화를 불러오는 중...</p>
                    </div>
                )}

                {!hasMore && movies.length > 0 && (
                    <div className="end-message">
                        <p>모든 영화를 불러왔습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
