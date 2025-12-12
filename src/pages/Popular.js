import React, { useEffect, useState } from 'react';
import { movieAPI } from '../services/api';
import MovieCard from '../components/MovieCard';

const Popular = () => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        movieAPI.getPopular(1).then(res => {
            setMovies(res.data.data.results || []);
        });
    }, []);

    return (
        <div className="container">
            <h2>인기 영화</h2>
            <div className="movies-grid">
                {movies.map(m => (
                    <MovieCard key={m.id} movie={m} />
                ))}
            </div>
        </div>
    );
};

export default Popular;
