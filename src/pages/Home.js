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

  const observer = useRef();
  const lastMovieElementRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore]
  );

  // 초기 로딩: 히어로 섹션과 첫 페이지
  useEffect(() => {
    fetchInitialMovies();
  }, []);

  // 추가 페이지 로딩
  useEffect(() => {
    if (page > 1) {
      fetchMoreMovies();
    }
  }, [page]);

  const fetchInitialMovies = async () => {
    try {
      setLoading(true);
      const response = await movieAPI.getPopular(1);
      const results = response.data.data.results;

      // 히어로 섹션용으로 상위 5개 영화 사용
      setHeroMovies(results.slice(0, 5));
      // 나머지 영화들을 목록에 표시
      setMovies(results);
      setHasMore(response.data.data.total_pages > 1);
    } catch (err) {
      setError('영화 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreMovies = async () => {
    try {
      setLoadingMore(true);
      const response = await movieAPI.getPopular(page);
      const results = response.data.data.results;

      setMovies((prevMovies) => [...prevMovies, ...results]);
      setHasMore(page < response.data.data.total_pages);
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
      {/* 히어로 슬라이더 섹션 */}
      <HeroSlider movies={heroMovies} />

      {/* 영화 목록 섹션 */}
      <div className="container">
        <h2 className="page-title">인기 영화</h2>
        <div className="movies-grid">
          {movies.map((movie, index) => {
            // 마지막 영화 카드에 ref 추가 (무한 스크롤 트리거)
            if (movies.length === index + 1) {
              return (
                <div ref={lastMovieElementRef} key={movie.id}>
                  <MovieCard movie={movie} />
                </div>
              );
            } else {
              return <MovieCard key={movie.id} movie={movie} />;
            }
          })}
        </div>

        {/* 로딩 인디케이터 */}
        {loadingMore && (
          <div className="loading-more">
            <div className="loading-spinner-small"></div>
            <p>추가 영화를 불러오는 중...</p>
          </div>
        )}

        {/* 더 이상 로딩할 영화가 없을 때 */}
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
