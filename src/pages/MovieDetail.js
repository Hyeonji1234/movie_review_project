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
    const [spoiler, setSpoiler] = useState(false); //스포일러 블러처리 추가
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedTrailer, setSelectedTrailer] = useState(null);
    const [trailers, setTrailers] = useState([]);
    // ⭐ 스포일러 태그 상태 + 옵션 추가
    const [tags, setTags] = useState([]);
    const TAG_OPTIONS = [
        '결말', '반전', '죽음', '빌런정체', '쿠키영상',
        '액션', '감동', '연출', '잔인함', 'OST'
    ];
    // ⭐ 필터/정렬 상태 추가
    const [filterType, setFilterType] = useState('all');   // all | spoiler | normal
    const [sortType, setSortType] = useState('latest');    // latest | oldest | high | low
    // ⭐ 추가 (태그 필터 상태)
    const [selectedTag, setSelectedTag] = useState(null);

    useEffect(() => {
        console.log("=== 리뷰 데이터 확인 ===");
        console.log(reviews);
    }, [reviews]);

    useEffect(() => {
        fetchMovieData().then(() => {
            console.log("📌 서버에서 불러온 리뷰 데이터:", reviews);
        });
    }, [movieId]);


    const fetchMovieData = async () => {
        try {
            setLoading(true);
            const [movieResponse, reviewsResponse] = await Promise.all([
                movieAPI.getMovieDetails(movieId),
                reviewAPI.getReviewsByMovie(movieId),
            ]);

            const movieData = movieResponse.data.data;
            setMovie(movieData);
            setReviews(reviewsResponse.data.data);

            // 예고편 목록 추출 (YouTube 예고편만)
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

    const handleDeleteReview = async (reviewId, reviewUserId) => {
        // 1. 현재 로그인된 사용자와 리뷰 작성자가 같은지 확인
        // (useAuth에서 가져온 user 객체에 user_id가 있다고 가정)
        if (!user || user.user_id !== reviewUserId) {
            alert('본인이 작성한 리뷰만 삭제할 수 있습니다.');
            return;
        }

        // 2. 사용자에게 삭제 여부 재확인
        if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
            return;
        }

        try {
            // 3. 백엔드 API 호출 (reviewAPI에 deleteReview가 구현되어 있다고 가정)
            await reviewAPI.deleteReview(reviewId);

            alert('리뷰가 삭제되었습니다.');

            // 4. 리뷰 목록 갱신
            fetchMovieData();
        } catch (err) {
            alert('리뷰 삭제에 실패했습니다.');
            console.error(err);
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
                // ⭐ 태그 추가 (백엔드 컬럼 필요: tags VARCHAR)
                tags: tags.join(',')
            });
            console.log("📌 서버로 전송한 태그:", tags);
            console.log("📌 서버로 전송한 태그:", tags.join(','));

            alert('리뷰가 작성되었습니다!');
            setComment('');
            setRating(5);
            setSpoiler(false); // 선택이 너무 남아있으면 헷갈릴 수 있어서 초기화 (원하면 빼도 됨)
            setTags([]);       // ⭐ 태그 초기화
            fetchMovieData();
        } catch (err) {
            alert('리뷰 작성에 실패했습니다.');
            console.error(err);
        } finally {
            setSubmitting(false);
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

    // ⭐ 필터/정렬 적용된 배열 생성 (렌더 직전에)
    const filteredReviews = reviews
        .filter((review) => {
            if (filterType === 'spoiler') return review.spoiler;
            if (filterType === 'normal') return !review.spoiler;
            return true; // all
        })
        .filter(r => {
            if (!selectedTag) return true;
            if (!r.tags) return false;
            
            // 🔥 태그 문자열을 배열로 변환 후 비교 (공백 제거)
            const tagList = r.tags.split(',').map(t => t.trim());
            return tagList.includes(selectedTag);
        })
        .sort((a, b) => {
            if (sortType === 'latest') {
                return new Date(b.created_at) - new Date(a.created_at);
            }
            if (sortType === 'oldest') {
                return new Date(a.created_at) - new Date(b.created_at);
            }
            if (sortType === 'high') {
                return b.rating - a.rating;
            }
            if (sortType === 'low') {
                return a.rating - b.rating;
            }
            return 0;
        });

    return (
        <div className="movie-detail-page">
            {/* 영화 배경 */}
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
                            <span className="movie-rating">⭐ {movie.vote_average.toFixed(1)}</span>
                            <span className="movie-date">{movie.release_date}</span>
                            <span className="movie-runtime">{movie.runtime}분</span>
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

                {/* 예고편 섹션 */}
                {trailers.length > 0 && selectedTrailer && (
                    <div className="movie-trailer-section">
                        <div className="trailer-header">
                            <h2>
                                <span className="trailer-icon">🎬</span>
                                예고편
                            </h2>
                            {trailers.length > 1 && (
                                <div className="trailer-selector">
                                    <label>예고편 선택:</label>
                                    <div className="trailer-options">
                                        {trailers.map((trailer, index) => (
                                            <button
                                                key={trailer.key}
                                                className={`trailer-option-btn ${selectedTrailer.key === trailer.key ? 'active' : ''
                                                    }`}
                                                onClick={() => setSelectedTrailer(trailer)}
                                            >
                                                <span className="option-number">{index + 1}</span>
                                                <span className="option-name">
                                                    {trailer.name.length > 30
                                                        ? `${trailer.name.substring(0, 30)}...`
                                                        : trailer.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="trailer-info">
                            <h3 className="trailer-title">{selectedTrailer.name}</h3>
                            <div className="trailer-meta">
                                <span className="trailer-type">{selectedTrailer.type}</span>
                                <span className="trailer-quality">
                                    {selectedTrailer.size}p
                                </span>
                                <span className="trailer-date">
                                    {new Date(selectedTrailer.published_at).toLocaleDateString(
                                        'ko-KR'
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="trailer-container">
                            <div className="video-wrapper">
                                <iframe
                                    width="100%"
                                    height="500"
                                    src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&mute=1&rel=0`}
                                    title={selectedTrailer.name}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="trailer-badge">
                                <span>YouTube</span>
                            </div>
                        </div>
                    </div>
                )}
                {/* 리뷰 섹션 */}
                <div className="reviews-section">
                    <h2>리뷰 ({reviews.length})</h2>

                    {isAuthenticated && (
                        <form className="review-form" onSubmit={handleSubmitReview}>
                            <h3>리뷰 작성</h3>
                            <div className="rating-input">
                                <label>별점:</label>
                                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                                    <option value="1">⭐ 1점</option>
                                    <option value="2">⭐⭐ 2점</option>
                                    <option value="3">⭐⭐⭐ 3점</option>
                                    <option value="4">⭐⭐⭐⭐ 4점</option>
                                    <option value="5">⭐⭐⭐⭐⭐ 5점</option>
                                </select>
                            </div>
                            <textarea
                                className="comment-input"
                                placeholder="영화 리뷰를 작성해주세요..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="4"
                            ></textarea>
                            <div className="spoiler-checkbox">
                                <input
                                    type="checkbox"
                                    id="spoilerCheck"
                                    checked={spoiler}
                                    onChange={(e) => setSpoiler(e.target.checked)}
                                />
                                <label htmlFor="spoilerCheck">스포일러 포함</label>
                            </div>

                            {/* ⭐ 스포일러일 때만 태그 선택 UI 표시 */}
                            {spoiler && (
                                <div className="tag-selector">
                                    <p className="tag-selector-title">스포일러 유형 선택 (복수 선택 가능)</p>
                                    <div className="tag-selector-list">
                                        {TAG_OPTIONS.map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                className={tags.includes(tag) ? "tag-chip tag-chip-active" : "tag-chip"}
                                                onClick={() => {
                                                    setTags(prev =>
                                                        prev.includes(tag)
                                                            ? prev.filter(t => t !== tag)
                                                            : [...prev, tag]
                                                    );
                                                    console.log("🟡 현재 선택된 리뷰 태그:", [...tags, tag]);
                                                }}
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="submit-button" disabled={submitting}>
                                {submitting ? '제출 중...' : '리뷰 작성'}
                            </button>
                        </form>
                    )}

                    {/* ⭐ 필터/정렬 UI 추가 */}
                    <div className="review-controls">
                        <div className="filter-buttons">
                            <button
                                type="button"
                                className={filterType === 'all' ? 'on' : ''}
                                onClick={() => setFilterType('all')}
                            >
                                전체
                            </button>
                            <button
                                type="button"
                                className={filterType === 'spoiler' ? 'on' : ''}
                                onClick={() => setFilterType('spoiler')}
                            >
                                스포일러
                            </button>
                            <button
                                type="button"
                                className={filterType === 'normal' ? 'on' : ''}
                                onClick={() => setFilterType('normal')}
                            >
                                일반
                            </button>
                        </div>

                        <div className="review-sort-group">
                            <select
                                value={sortType}
                                onChange={(e) => setSortType(e.target.value)}
                                className="sort-select"
                            >
                                <option value="latest">최신순</option>
                                <option value="oldest">오래된순</option>
                                <option value="high">별점 높은순</option>
                                <option value="low">별점 낮은순</option>
                            </select>
                        </div>
                    </div>
                    {/* ⭐ 태그 필터 추가 UI */}
                    <div className="review-tag-filter">
                        <span>태그 필터:</span>
                        <div className="filter-tag-list">
                            <button
                                className={selectedTag === null ? "tag-filter active" : "tag-filter"}
                                onClick={() => {
                                    setSelectedTag(null);
                                    console.log("🟢 필터 초기화");
                                }}
                            >전체</button>

                            {TAG_OPTIONS.map(tag => (
                                <button
                                    key={tag}
                                    className={selectedTag === tag ? "tag-filter active" : "tag-filter"}
                                    onClick={() => {
                                        setSelectedTag(tag);
                                        console.log("🟢 선택된 필터 태그:", tag);
                                    }}
                                >#{tag}</button>
                            ))}
                        </div>
                    </div>
                    <div className="reviews-list">
                        {filteredReviews.length === 0 ? (
                            <p className="no-reviews">
                                아직 조건에 맞는 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
                            </p>
                        ) : (
                            filteredReviews.map((review) => (
                                <div
                                    key={review.review_id}
                                    className={`review-item ${review.spoiler && !review.open ? 'spoiler-blur' : ''
                                        }`}
                                    onClick={() => {
                                        /* 🔥 첫 클릭만으로 스포일러 해제 */
                                        if (review.spoiler && !review.open) {
                                            const updated = reviews.map((r) =>
                                                r.review_id === review.review_id ? { ...r, open: true } : r
                                            );
                                            setReviews(updated);
                                        }
                                    }}
                                >
                                    <div className="review-header">
                                        <span className="review-author">{review.username}</span>
                                        <span className="review-rating">
                                            {'⭐'.repeat(review.rating)} {review.rating}점
                                        </span>

                                        {/* 🔥 삭제 누를 때 리뷰 열림 방지 */}
                                        {isAuthenticated && user?.user_id === review.user_id && (
                                            <button
                                                className="delete-review-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // ❗ 리뷰 열림 방지
                                                    handleDeleteReview(review.review_id, review.user_id);
                                                }}
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>

                                    {/* ⭐ 저장된 태그 표시 (백엔드에서 tags 문자열이 올 경우) */}
                                    {review.tags && (
                                        <div className="review-tags">
                                            {review.tags
                                                .split(',')
                                                .filter((t) => t.trim() !== '')
                                                .map((t) => (
                                                    <span key={t} className="review-tag-chip">
                                                        #{t}
                                                    </span>
                                                ))}
                                        </div>
                                    )}

                                    {/* 🔥 스포일러 미해제 시 안내문만 표시 */}
                                    {review.spoiler && !review.open ? (
                                        <p className="locked-review">스포일러 리뷰 – 클릭하여 열기</p>
                                    ) : (
                                        <p className="review-comment">{review.comment}</p>
                                    )}

                                    <span className="review-date">
                                        {new Date(review.created_at).toLocaleDateString('ko-KR')}
                                    </span>
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
