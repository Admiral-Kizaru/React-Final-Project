import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';

const API_KEY = 'c0976ee6';

// --- HOMEPAGE ---
const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('Marvel');

  // useCallback prevents the "missing dependency" warning in useEffect
  const fetchMovies = useCallback(async (query) => {
    if (!query) return;
    setLoading(true);

    try {
      const res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
      const data = await res.json();

      if (data.Response === "True") {
        setMovies(data.Search);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Runs once on initial load
  useEffect(() => { 
    fetchMovies('Marvel'); 
  }, [fetchMovies]);

  return (
    <div className="container">
      <header className="hero">
        <h1>Explore Cinema</h1>
        <form onSubmit={(e) => { e.preventDefault(); fetchMovies(searchTerm); }} className="controls">
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="search-input" 
            placeholder="Search movies..."
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </header>

      <div className="results-grid">
        {loading ? (
          <p>Loading movies...</p>
        ) : movies.length > 0 ? (
          movies.map(movie => (
            <Link to={`/movie/${movie.imdbID}`} key={movie.imdbID} className="card">
              <img 
                src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placeholder.com'} 
                alt={movie.Title} 
              />
              <div className="card-content">
                <h3>{movie.Title}</h3>
                <p>{movie.Year}</p>
              </div>
            </Link>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

// --- MOVIE DETAILS ---
const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setApiError("");
      try {
        const response = await fetch(`https://www.omdbapi.com/?i=${id}&plot=full&apikey=${API_KEY}`);
        const data = await response.json();
        
        if (data.Response === "True") {
          setMovie(data);
        } else {
          setApiError(data.Error);
          setMovie(null);
        }
      } catch (err) {
        setApiError("Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  if (loading) return <div className="container center-text"><h2>Loading Details...</h2></div>;
  
  if (apiError || !movie) return (
    <div className="container center-text">
      <h2>⚠️ {apiError || "Movie not found!"}</h2>
      <button className="btn-primary" onClick={() => navigate('/')}>Back to Search</button>
    </div>
  );

  return (
    <div className="container movie-details-page">
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{marginBottom: '20px'}}>← Back</button>
      <div className="details-layout" style={{ display: 'flex', gap: '40px' }}>
        <div className="details-poster-wrapper">
          <img 
            src={movie.Poster !== 'N/A' ? movie.Poster : 'https://placeholder.com'} 
            alt={movie.Title} 
            style={{ width: '300px', borderRadius: '12px' }}
          />
        </div>
        <div className="details-info">
          <h1>{movie.Title} ({movie.Year})</h1>
          <div className="meta-tags" style={{margin: '10px 0', color: '#2563eb', fontWeight: 'bold'}}>
            <span>{movie.Rated}</span> | <span>{movie.Runtime}</span> | <span>{movie.Genre}</span>
          </div>
          <p className="rating">⭐ <strong>{movie.imdbRating}</strong> / 10</p>
          
          <div className="ratings-box" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', margin: '20px 0', color: '#1e293b' }}>
            {movie.Ratings && movie.Ratings.map((r, i) => (
              <p key={i}><strong>{r.Source}:</strong> {r.Value}</p>
            ))}
          </div>

          <h3>Plot</h3>
          <p className="plot-text" style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{movie.Plot}</p>
          <div className="cast-crew" style={{ marginTop: '20px' }}>
            <p><strong>Director:</strong> {movie.Director}</p>
            <p><strong>Actors:</strong> {movie.Actors}</p>
            <p><strong>Box Office:</strong> {movie.BoxOffice || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APP ENTRY ---
const App = () => (
  <Router>
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo">MOVIEHUB</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </div>
  </Router>
);

export default App;
