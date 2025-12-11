import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const cardRef = useRef(null);

  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  // Intersection Observer로 스크롤 애니메이션
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // 마우스 오버 시작 - 5초 카운트다운
  const handleMouseEnter = () => {
    setIsHovering(true);
    setCountdown(5);

    // 1초마다 카운트다운
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 5초 후 페이지 이동
    timerRef.current = setTimeout(() => {
      navigate(`/movie/${movie.id}`);
    }, 5000);
  };

  // 마우스 아웃 - 타이머 취소
  const handleMouseLeave = () => {
    setIsHovering(false);
    setCountdown(null);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // 클릭 시 즉시 이동
  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div
      ref={cardRef}
      className={`movie-card ${isVisible ? 'visible' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="movie-card-image">
        <img
          src={
            movie.poster_path
              ? `${imageBaseUrl}${movie.poster_path}`
              : '/placeholder-movie.png'
          }
          alt={movie.title}
          loading="lazy"
        />

        {isHovering && countdown !== null && (
          <div className="movie-card-overlay">
            <div className="countdown-circle">
              <span className="countdown-number">{countdown}</span>
            </div>
            <p className="countdown-text">초 후 상세 페이지로 이동</p>
          </div>
        )}
      </div>

      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="movie-card-meta">
          <span className="movie-card-rating">⭐ {movie.vote_average.toFixed(1)}</span>
          <span className="movie-card-date">
            {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
