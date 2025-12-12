import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { movieAPI } from '../services/api';
import YouTube from 'react-youtube';
import './MovieDetail.css';

const TAG_OPTIONS = [
    '결말', '반전', '죽음', '빌런정체', '쿠키영상',
    '액션', '감동', '연출', '잔인함', 'OST'
];

function MovieDetail() {
    const { movieId } = useParams();

    const [movie, setMovie] = useState(null);
    const [videos, setVideos] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [tags, setTags] = useState([]);

    /* ================= 영화 정보 ================= */
    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const res = await movieAPI.getMovieDetail(movieId);
                setMovie(res.data);
            } catch (e) {
                console.error('영화 정보 로딩 실패', e);
            }
        };
        fetchMovie();
    }, [movieId]);

    /* ================= 트레일러 ================= */
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await movieAPI.getMovieVideos(movieId);
                setVideos(res.data.results || []);
            } catch (e) {
                console.error('트레일러 로딩 실패', e);
            }
        };
        fetchVideos();
    }, [movieId]);

    /* ================= 태그 토글 ================= */
    const toggleTag = (tag) => {
        setTags((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
        );
    };

    /* ================= 렌더 가드 ================= */
    if (!movie) return <div className="loading">로딩 중...</div>;

    const trailer = videos.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer'
    );

    return (
        <div className="movie-detail-container">
            {/* 배경 */}
            {movie.backdrop_path && (
                <div
                    className="backdrop"
                    style={{
                        backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                    }}
                />
            )}

            <div className="movie-detail-content">
                {/* 포스터 */}
                {movie.poster_path && (
                    <img
                        className="poster"
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                    />
                )}

                {/* 영화 정보 */}
                <div className="info">
                    <h1>{movie.title}</h1>

                    {movie.tagline && (
                        <p className="tagline">{movie.tagline}</p>
                    )}

                    {movie.overview && (
                        <>
                            <h3>줄거리</h3>
                            <p>{movie.overview}</p>
                        </>
                    )}

                    <div className="meta">
                        {movie.release_date && <span>개봉일: {movie.release_date}</span>}
                        {movie.runtime && <span>러닝타임: {movie.runtime}분</span>}
                        {movie.vote_average !== undefined && (
                            <span>평점 ⭐ {movie.vote_average}</span>
                        )}
                    </div>

                    {/* 장르 */}
                    {movie.genres?.length > 0 && (
                        <div className="genres">
                            {movie.genres.map((g) => (
                                <span key={g.id} className="genre">
                                    {g.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 트레일러 */}
            {trailer && (
                <div className="trailer">
                    <h2>공식 트레일러</h2>
                    <YouTube videoId={trailer.key} />
                </div>
            )}

            {/* ================= 리뷰 작성 ================= */}
            <div className="review-section">
                <h2>리뷰 작성</h2>

                {/* 별점 */}
                <div className="rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <span
                            key={n}
                            className={n <= rating ? 'star active' : 'star'}
                            onClick={() => setRating(n)}
                        >
                            ★
                        </span>
                    ))}
                </div>

                {/* 태그 */}
                <div className="tag-box">
                    {TAG_OPTIONS.map((tag) => (
                        <button
                            key={tag}
                            className={tags.includes(tag) ? 'tag selected' : 'tag'}
                            onClick={() => toggleTag(tag)}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>

                {/* 코멘트 */}
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="리뷰를 작성하세요"
                />

                <button className="submit">등록</button>
            </div>
        </div>
    );
}

export default MovieDetail;
