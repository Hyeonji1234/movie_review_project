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
    }, []);

    useEffect(() => {
        if (page > 1) fetchMoreMovies();
    }, [page]);

    const fetchInitialMovies = async () => {
        try {
            setLoading(true);
            const res = await movieAPI.getPopular(1);
            const results = res.data?.results || [];

            setHeroMovies(results.slice(0, 5));
            setMovies(results);
            setHasMore(1 < res.data.total_pages);
        } catch (err) {
            console.error(err);
            setError('영화 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreMovies = async () => {
        try {
            setLoadingMore(true);
            const res = await movieAPI.getPopular(page);
            const results = res.data?.results || [];

            setMovies((prev) => [...prev, ...results]);
            setHasMore(page < res.data.total_pages);
        } catch (err) {
            console.error(err);
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
