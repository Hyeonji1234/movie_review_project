import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSlider.css';

const HeroSlider = ({ movies }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const slideIntervalRef = useRef(null);

  const SLIDE_DURATION = 8000; // 8초
  const PROGRESS_UPDATE_INTERVAL = 50; // 50ms마다 업데이트

  // 프로그레스 바 업데이트
  useEffect(() => {
    if (movies.length === 0) return;

    setProgress(0);

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (SLIDE_DURATION / PROGRESS_UPDATE_INTERVAL));
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, PROGRESS_UPDATE_INTERVAL);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex, movies.length]);

  // 자동 슬라이드
  useEffect(() => {
    if (movies.length === 0) return;

    slideIntervalRef.current = setInterval(() => {
      handleSlideChange('next');
    }, SLIDE_DURATION);

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [currentIndex, movies.length]);

  // 예고편 불러오기
  const loadTrailer = async (movieId) => {
    try {
      const API_KEY = '10923b261ba94d897ac6b81148314a3f';
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}&language=ko-KR`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setTrailerKey(data.results[0].key);
      }
    } catch (error) {
      console.error('예고편 로딩 실패:', error);
    }
  };

  useEffect(() => {
    if (movies[currentIndex]) {
      loadTrailer(movies[currentIndex].id);
    }
  }, [currentIndex, movies]);

  const handleSlideChange = (direction) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setProgress(0);

    setTimeout(() => {
      if (direction === 'next') {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
      } else if (direction === 'prev') {
        setCurrentIndex((prevIndex) =>
          prevIndex === 0 ? movies.length - 1 : prevIndex - 1
        );
      }
      setTrailerKey(null);
      setIsTransitioning(false);
    }, 700); // 애니메이션 시간
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;

    setIsTransitioning(true);
    setProgress(0);

    setTimeout(() => {
      setCurrentIndex(index);
      setTrailerKey(null);
      setIsTransitioning(false);
    }, 700);
  };

  const goToPrevious = () => {
    handleSlideChange('prev');
  };

  const goToNext = () => {
    handleSlideChange('next');
  };

  const handleSlideClick = () => {
    if (movies[currentIndex]) {
      navigate(`/movie/${movies[currentIndex].id}`);
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="hero-slider">
      <div className="hero-slides-container">
        {movies.map((movie, index) => {
          const isActive = index === currentIndex;
          const isPrev = index === (currentIndex - 1 + movies.length) % movies.length;
          const isNext = index === (currentIndex + 1) % movies.length;

          let slideClass = 'hero-slide';
          if (isActive) slideClass += ' active';
          if (isPrev) slideClass += ' prev';
          if (isNext) slideClass += ' next';

          return (
            <div
              key={movie.id}
              className={slideClass}
              onClick={isActive ? handleSlideClick : undefined}
              style={{ cursor: isActive ? 'pointer' : 'default' }}
            >
              <div className="hero-background">
                {isActive && trailerKey ? (
                  <iframe
                    className="hero-video"
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}`}
                    title="Movie Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                      alt={movie.title}
                      className="hero-image"
                    />
                    <div className="hero-overlay"></div>
                  </>
                )}
              </div>

              {isActive && (
                <div className="hero-content">
                  <h1 className="hero-title">{movie.title}</h1>
                  <p className="hero-overview">{movie.overview}</p>
                  <div className="hero-info">
                    <span className="hero-rating">⭐ {movie.vote_average.toFixed(1)}</span>
                    <span className="hero-release">
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 네비게이션 버튼 */}
      <button
        className="hero-nav-btn hero-prev"
        onClick={(e) => {
          e.stopPropagation();
          goToPrevious();
        }}
      >
        ‹
      </button>
      <button
        className="hero-nav-btn hero-next"
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
      >
        ›
      </button>

      {/* 프로그레스 바 */}
      <div className="hero-progress-container">
        {movies.map((_, index) => (
          <div
            key={index}
            className={`hero-progress-bar ${index === currentIndex ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
          >
            <div
              className="hero-progress-fill"
              style={{
                width: index === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
