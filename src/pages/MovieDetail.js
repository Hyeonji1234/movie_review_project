import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { movieAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MovieDetail.css';

const TAG_OPTIONS = [
    '결말', '반전', '죽음', '빌런정체', '쿠키영상',
    '액션', '감동', '연출', '잔인함', 'OST'
];

const MovieDetail = () => {
    const { movieId } = useParams();
    const { isAuthenticated, user } = useAuth();

    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [trailers, setTrailers] = useState([]);
    const [selectedTrailer, setSelectedTrailer] = useState(null);

    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [spoiler, setSpoiler] = useState(false);
    const [tags, setTags] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [movieId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [movieRes, reviewRes] = await Promise.all([
                movieAPI.getMovieDetails(movieId),
                reviewAPI.getReviewsByMovie(movieId),
            ]);

            const movieData = movieRes.data.data;
            setMovie(movieData);
            setReviews(reviewRes.data.data || []);

            if (movieData?.videos?.results) {
                const yt = movieData.videos.results.filter(
                    v => v.site === 'YouTube' && v.type === 'Trailer'
                );
                setTrailers(yt);
                if (yt.length > 0) setSelectedTrailer(yt[0]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return alert('로그인 필요');

        await reviewAPI.createReview({
            movie_id: Number(movieId),
            rating,
            comment,
            spoiler,
            tags: tags.join(',')
        });

        setComment('');
        setRating(5);
        setSpoiler(false);
        setTags([]);
        fetchData();
    };

    if (loading) return <p className="loading">로딩 중...</p>;
    if (!movie) return <p>영화 없음</p>;

    return (
        <div className="movie-detail-page">
            <h1>{movie.title}</h1>

            <p>{movie.overview}</p>

            {/* 🎬 예고편 */}
            {selectedTrailer && (
                <iframe
                    width="100%"
                    height="450"
                    src={`https://www.youtube.com/embed/${selectedTrailer.key}`}
                    title="trailer"
                    allowFullScreen
                />
            )}

            {/* 📝 리뷰 작성 */}
            {isAuthenticated && (
                <form onSubmit={submitReview}>
                    <select value={rating} onChange={e => setRating(+e.target.value)}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}점</option>
                        ))}
                    </select>

                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="리뷰 작성"
                    />

                    <label>
                        <input
                            type="checkbox"
                            checked={spoiler}
                            onChange={e => setSpoiler(e.target.checked)}
                        />
                        스포일러
                    </label>

                    {spoiler && (
                        <div className="tag-box">
                            {TAG_OPTIONS.map(tag => (
                                <button
                                    type="button"
                                    key={tag}
                                    className={tags.includes(tag) ? 'on' : ''}
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

                    <button type="submit">등록</button>
                </form>
            )}

            {/* 📋 리뷰 목록 */}
            <div className="reviews">
                {reviews.map(r => (
                    <div key={r.review_id} className="review">
                        <strong>{r.username}</strong>
                        <span> ⭐{r.rating}</span>
                        {r.tags && (
                            <div className="tags">
                                {r.tags.split(',').map(t => (
                                    <span key={t}>#{t}</span>
                                ))}
                            </div>
                        )}
                        <p>{r.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MovieDetail;
