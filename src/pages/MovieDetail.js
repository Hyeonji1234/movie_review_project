import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { movieAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MovieDetail.css';

const MovieDetail = () => {
    const { movieId } = useParams();
    const { isAuthenticated, user } = useAuth();

    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [spoiler, setSpoiler] = useState(false);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [trailers, setTrailers] = useState([]);
    const [selectedTrailer, setSelectedTrailer] = useState(null);

    // 태그 관련
    const [tags, setTags] = useState([]);
    const TAG_OPTIONS = [
        '결말', '반전', '죽음', '빌런정체', '쿠키영상',
        '액션', '감동', '연출', '잔인함', 'OST'
    ];

    // 리뷰 필터/정렬
    const [filterType, setFilterType] = useState('all');   // all | spoiler | normal
    const [sortType, setSortType] = useState('latest');    // latest | oldest | high | low
    const [selectedTag, setSelectedTag] = useState(null);

    useEffect(() => {
        fetchMovieData();
    }, [movieId]);

    const fetchMovieData = async () => {
        try {
            setLoading(true);

            const [movieResponse, reviewsResponse] = await Promise.all([
                movieAPI.getMovieDetails(movieId),
                reviewAPI.getReviewsByMovie(movieId),
            ]);

            // ✅ TMDB 응답 구조 수정 (중요)
            const movieData = movieResponse.data;
            setMovie(movieData);

            // ✅ 리뷰 API는 기존 구조 유지
            setReviews(reviewsResponse.data.data);

            // 예고편 추출 (YouTube Trailer만)
            if (movieData.videos?.results) {
                const youtubeTrailers = movieData.videos.results.filter(
                    (video) => video.site === 'YouTube' && video.type === 'Trailer'
                );
                setTrailers(youtubeTrailers);
                if (youtubeTrailers.length > 0) {
                    setSelectedTrailer(youtubeTrailers[0]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert('리뷰를 작성하려면 로그인이 필요합니다.');
            return;
        }

        try {
            setSubmitting(true);
            await reviewAPI.createReview({
                movie_id: parseInt(movieId),
                rating,
                comment,
                spoiler,
                tags: tags.join(',')
            });

            alert('리뷰가 작성되었습니다!');
            setRating(5);
            setComment('');
            setSpoiler(false);
            setTags([]);
            fetchMovieData();
        } catch (err) {
            alert('리뷰 작성에 실패했습니다.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId, reviewUserId) => {
        if (!user || user.user_id !== reviewUserId) {
            alert('본인이 작성한 리뷰만 삭제할 수 있습니다.');
            return;
        }

        if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return;

        try {
            await reviewAPI.deleteReview(reviewId);
            alert('리뷰가 삭제되었습니다.');
            fetchMovieData();
        } catch (err) {
            alert('리뷰 삭제에 실패했습니다.');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>영화 정보를 불러오는 중...</p>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="error-container">
                <p>영화 정보를 찾을 수 없습니다.</p>
            </div>
        );
    }

    const imageBaseUrl = 'https://image.tmdb.org/t/p/original';

    // 필터/정렬 적용
    const filteredReviews = reviews
        .filter((review) => {
            if (filterType === 'spoiler') return review.spoiler;
            if (filterType === 'normal') return !review.spoiler;
            return true;
        })
        .filter((review) => {
            if (!selectedTag) return true;
            if (!review.tags) return false;
            const tagList = review.tags.split(',').map(t => t.trim());
            return tagList.includes(selectedTag);
        })
        .sort((a, b) => {
            if (sortType === 'latest') return new Date(b.created_at) - new Date(a.created_at);
            if (sortType === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            if (sortType === 'high') return b.rating - a.rating;
            if (sortType === 'low') return a.rating - b.rating;
            return 0;
        });

    return (
        <div className="movie-detail-page">
            {/* 배경 */}
            <div
                className="movie-backdrop"
                style={{
                    backgroundImage: movie.backdrop_path
                        ? `url(${imageBaseUrl}${movie.backdrop_path})`
                        : 'none',
                }}
            >
                <div className="movie-backdrop-overlay"></div>
            </div>

            <div className="container">
                {/* 영화 정보 */}
                <div className="movie-detail-content">
                    <div className="movie-poster">
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                        />
                    </div>

                    <div className="movie-info">
                        <h1 className="movie-title">{movie.title}</h1>
                        <p className="movie-tagline">{movie.tagline}</p>

                        <div className="movie-meta">
                            <span>⭐ {movie.vote_average.toFixed(1)}</span>
                            <span>{movie.release_date}</span>
                            <span>{movie.runtime}분</span>
                        </div>

                        <div className="movie-genres">
                            {movie.genres?.map((genre) => (
                                <span key={genre.id} className="genre-tag">
                                    {genre.name}
                                </span>
                            ))}
                        </div>

                        <div className="movie-overview">
                            <h2>줄거리</h2>
                            <p>{movie.overview || '줄거리 정보가 없습니다.'}</p>
                        </div>
                    </div>
                </div>

                {/* 예고편 */}
                {selectedTrailer && (
                    <div className="movie-trailer-section">
                        <iframe
                            width="100%"
                            height="500"
                            src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&mute=1&rel=0`}
                            title={selectedTrailer.name}
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}

                {/* 리뷰 */}
                <div className="reviews-section">
                    <h2>리뷰 ({reviews.length})</h2>

                    {isAuthenticated && (
                        <form className="review-form" onSubmit={handleSubmitReview}>
                            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                                {[1, 2, 3, 4, 5].map(n => (
                                    <option key={n} value={n}>{'⭐'.repeat(n)} {n}점</option>
                                ))}
                            </select>

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="리뷰를 작성해주세요"
                            />

                            <label>
                                <input
                                    type="checkbox"
                                    checked={spoiler}
                                    onChange={(e) => setSpoiler(e.target.checked)}
                                />
                                스포일러 포함
                            </label>

                            {spoiler && (
                                <div className="tag-selector">
                                    {TAG_OPTIONS.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            className={tags.includes(tag) ? 'tag-chip tag-chip-active' : 'tag-chip'}
                                            onClick={() =>
                                                setTags(prev =>
                                                    prev.includes(tag)
                                                        ? prev.filter(t => t !== tag)
                                                        : [...prev, tag]
                                                )
                                            }
                                        >
                                            #{tag}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button type="submit" disabled={submitting}>
                                {submitting ? '제출 중...' : '리뷰 작성'}
                            </button>
                        </form>
                    )}

                    <div className="reviews-list">
                        {filteredReviews.length === 0 ? (
                            <p>리뷰가 없습니다.</p>
                        ) : (
                            filteredReviews.map((review) => (
                                <div key={review.review_id} className="review-item">
                                    <div className="review-header">
                                        <span>{review.username}</span>
                                        <span>{'⭐'.repeat(review.rating)} {review.rating}점</span>

                                        {isAuthenticated && user?.user_id === review.user_id && (
                                            <button
                                                onClick={() =>
                                                    handleDeleteReview(review.review_id, review.user_id)
                                                }
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>

                                    <p>{review.comment}</p>
                                    <span>{new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
