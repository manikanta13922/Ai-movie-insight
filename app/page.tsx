"use client";

import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Movie {
  Title: string;
  Poster: string;
  Year: string;
  imdbRating: string;
  Actors: string;
  Plot: string;
  Genre: string;
  Director: string;
  Runtime: string;
  Awards?: string;
}

interface Sentiment {
  sentiment: string;
  summary: string;
  positive: number;
  negative: number;
  neutral?: number;
}

// ─────────────────────────────────────────────
// Inline global styles with keyframe animations
// ─────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --gold: #c9a84c;
      --gold-dim: #9a7930;
      --red: #e63946;
      --bg: #0a0a0f;
      --surface: rgba(255,255,255,0.04);
      --border: rgba(201,168,76,0.18);
      --text: #e8e0d0;
      --muted: rgba(232,224,208,0.45);
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* ── Grain overlay ── */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
      opacity: 0.6;
    }

    /* ── Keyframes ── */
    @keyframes fadeUp   { from { opacity:0; transform:translateY(32px);  } to { opacity:1; transform:translateY(0);  } }
    @keyframes fadeIn   { from { opacity:0; }                              to { opacity:1; }                            }
    @keyframes shimmer  { 0%,100% { opacity:0.4; } 50% { opacity:1; }     }
    @keyframes spin     { to { transform: rotate(360deg); }                }
    @keyframes pulse    { 0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4); } 70% { box-shadow: 0 0 0 12px rgba(201,168,76,0); } }
    @keyframes fillBar  { from { width: 0; } to { width: var(--fill); }    }
    @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
    @keyframes float    { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-18px) rotate(2deg); } }
    @keyframes glow     { 0%,100% { text-shadow: 0 0 20px rgba(201,168,76,0.3); } 50% { text-shadow: 0 0 60px rgba(201,168,76,0.8), 0 0 120px rgba(201,168,76,0.3); } }
    @keyframes starDrift {
      0%   { transform: translate(0, 0) scale(1);      opacity: 0;   }
      10%  { opacity: 1; }
      90%  { opacity: 0.6; }
      100% { transform: translate(var(--dx), var(--dy)) scale(0.3); opacity: 0; }
    }
    @keyframes cardReveal {
      from { opacity:0; transform: perspective(800px) rotateX(8deg) translateY(40px); }
      to   { opacity:1; transform: perspective(800px) rotateX(0deg)  translateY(0);   }
    }
    @keyframes borderGlow {
      0%,100% { border-color: rgba(201,168,76,0.2); }
      50%     { border-color: rgba(201,168,76,0.7); box-shadow: 0 0 24px rgba(201,168,76,0.2); }
    }

    /* ── Utility ── */
    .fade-up   { animation: fadeUp   0.7s cubic-bezier(.16,1,.3,1) both; }
    .fade-in   { animation: fadeIn   0.6s ease both; }
    .float-anim { animation: float   6s ease-in-out infinite; }
    .glow-text { animation: glow     3s ease-in-out infinite; }

    /* ── Stars canvas ── */
    #stars-canvas {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
    }

    /* ── Scanline ── */
    .scanline {
      position: fixed; left:0; right:0; height:2px;
      background: linear-gradient(90deg, transparent, rgba(201,168,76,0.08), transparent);
      animation: scanline 8s linear infinite;
      pointer-events: none; z-index: 1;
    }

    /* ── Layout ── */
    .page {
      position: relative; z-index: 2;
      min-height: 100vh;
      display: flex; flex-direction: column; align-items: center;
      padding: 0 1.5rem 6rem;
    }

    /* ── Header ── */
    .header {
      width: 100%; max-width: 900px;
      padding: 3.5rem 0 2rem;
      text-align: center;
      animation: fadeUp 0.8s cubic-bezier(.16,1,.3,1) both;
    }
    .header-badge {
      display: inline-block;
      font-size: 0.7rem; letter-spacing: 0.25em; text-transform: uppercase;
      color: var(--gold); border: 1px solid var(--border);
      padding: 0.3rem 1.2rem; border-radius: 999px; margin-bottom: 1.4rem;
      animation: borderGlow 3s ease-in-out infinite;
    }
    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.4rem, 6vw, 4rem);
      font-weight: 700; line-height: 1.1;
      background: linear-gradient(135deg, #e8e0d0 0%, #c9a84c 50%, #e8e0d0 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .header p {
      margin-top: 0.8rem; color: var(--muted); font-size: 1rem; font-weight: 300;
    }

    /* ── Search box ── */
    .search-wrap {
      width: 100%; max-width: 560px;
      display: flex; gap: 0.7rem;
      margin: 2.2rem 0 0;
      animation: fadeUp 0.9s 0.1s cubic-bezier(.16,1,.3,1) both;
    }
    .search-input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.9rem 1.2rem;
      color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 0.97rem;
      outline: none; transition: all 0.3s ease;
      backdrop-filter: blur(12px);
    }
    .search-input::placeholder { color: rgba(232,224,208,0.3); }
    .search-input:focus {
      border-color: var(--gold);
      box-shadow: 0 0 0 3px rgba(201,168,76,0.15), 0 0 30px rgba(201,168,76,0.08);
      background: rgba(255,255,255,0.07);
    }
    .search-btn {
      background: linear-gradient(135deg, #c9a84c, #9a7930);
      border: none; border-radius: 12px;
      padding: 0.9rem 1.8rem;
      color: #0a0a0f; font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      letter-spacing: 0.05em;
      transition: all 0.25s ease;
      white-space: nowrap;
      position: relative; overflow: hidden;
    }
    .search-btn::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent);
      opacity: 0; transition: opacity 0.2s;
    }
    .search-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(201,168,76,0.35); }
    .search-btn:hover::after { opacity: 1; }
    .search-btn:active { transform: translateY(0) scale(0.97); }
    .search-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* ── Error ── */
    .error-msg {
      margin-top: 1rem;
      color: #e63946; font-size: 0.88rem;
      animation: fadeIn 0.4s ease;
      background: rgba(230,57,70,0.08);
      border: 1px solid rgba(230,57,70,0.25);
      border-radius: 8px; padding: 0.6rem 1rem;
    }

    /* ── Loader ── */
    .loader-wrap {
      margin-top: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1.2rem;
      animation: fadeIn 0.4s ease;
    }
    .loader-ring {
      width: 52px; height: 52px;
      border: 2px solid rgba(201,168,76,0.15);
      border-top-color: var(--gold);
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    .loader-text { color: var(--muted); font-size: 0.88rem; letter-spacing: 0.1em; text-transform: uppercase; animation: shimmer 1.6s ease-in-out infinite; }

    /* ── Cards grid ── */
    .results-grid {
      width: 100%; max-width: 900px;
      margin-top: 3rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      animation: cardReveal 0.7s 0.1s cubic-bezier(.16,1,.3,1) both;
    }
    @media (max-width: 650px) { .results-grid { grid-template-columns: 1fr; } }

    /* ── Movie card ── */
    .movie-card {
      grid-column: 1 / -1;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 2rem;
      display: flex; gap: 2rem;
      backdrop-filter: blur(20px);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative; overflow: hidden;
    }
    .movie-card::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(201,168,76,0.06) 0%, transparent 60%);
      pointer-events: none;
    }
    .movie-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.25);
    }
    .poster-wrap {
      flex-shrink: 0; position: relative;
    }
    .poster-img {
      width: 140px; height: 210px;
      object-fit: cover; border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6);
      animation: float 8s ease-in-out infinite;
      display: block;
    }
    .poster-glow {
      position: absolute; bottom: -10px; left: 50%;
      transform: translateX(-50%);
      width: 100px; height: 20px;
      background: rgba(201,168,76,0.25);
      filter: blur(15px); border-radius: 50%;
    }
    .movie-info { flex: 1; min-width: 0; }
    .movie-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.4rem, 3vw, 1.9rem);
      font-weight: 700; line-height: 1.2; margin-bottom: 0.5rem;
    }
    .movie-meta {
      display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;
    }
    .badge {
      font-size: 0.75rem; padding: 0.25rem 0.75rem;
      border-radius: 999px; border: 1px solid;
      font-weight: 500; letter-spacing: 0.04em;
    }
    .badge-gold  { border-color: rgba(201,168,76,0.4); color: var(--gold); background: rgba(201,168,76,0.08); }
    .badge-white { border-color: rgba(255,255,255,0.15); color: var(--muted); background: rgba(255,255,255,0.04); }

    .rating-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
    .stars { color: var(--gold); letter-spacing: 2px; font-size: 0.9rem; }
    .rating-num { font-size: 1.1rem; font-weight: 600; color: var(--gold); }
    .rating-max { color: var(--muted); font-size: 0.8rem; }

    .info-row { margin-bottom: 0.45rem; font-size: 0.88rem; color: var(--muted); }
    .info-row strong { color: var(--text); font-weight: 500; }

    .plot-text { margin-top: 0.8rem; font-size: 0.9rem; line-height: 1.65; color: rgba(232,224,208,0.7); font-style: italic; }

    /* ── Sentiment card ── */
    .sentiment-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px; padding: 1.8rem;
      backdrop-filter: blur(20px);
      position: relative; overflow: hidden;
      transition: transform 0.3s ease;
    }
    .sentiment-card:hover { transform: translateY(-3px); }
    .sentiment-card::after {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
      opacity: 0.6;
    }
    .card-label {
      font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--gold); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;
    }
    .card-label::before { content: ''; display: block; width: 20px; height: 1px; background: var(--gold); }

    .sentiment-badge {
      display: inline-flex; align-items: center; gap: 0.4rem;
      font-size: 1.1rem; font-weight: 600; margin-bottom: 1.2rem;
      padding: 0.4rem 1rem; border-radius: 8px;
    }
    .sent-positive { background: rgba(52,211,153,0.12); color: #34d399; }
    .sent-negative { background: rgba(230,57,70,0.12);  color: #e63946; }
    .sent-mixed    { background: rgba(251,191,36,0.12); color: #fbbf24; }

    .bar-label { font-size: 0.78rem; color: var(--muted); margin-bottom: 0.35rem; display: flex; justify-content: space-between; }
    .bar-track {
      height: 8px; border-radius: 999px;
      background: rgba(255,255,255,0.07); margin-bottom: 1rem; overflow: hidden;
    }
    .bar-fill {
      height: 100%; border-radius: 999px;
      animation: fillBar 1.4s cubic-bezier(.16,1,.3,1) both;
    }
    .bar-pos { background: linear-gradient(90deg, #34d399, #10b981); box-shadow: 0 0 12px rgba(52,211,153,0.4); }
    .bar-neg { background: linear-gradient(90deg, #e63946, #c1121f); box-shadow: 0 0 12px rgba(230,57,70,0.4); }
    .bar-neu { background: linear-gradient(90deg, #c9a84c, #9a7930); box-shadow: 0 0 12px rgba(201,168,76,0.4); }

    .summary-text { font-size: 0.88rem; line-height: 1.7; color: rgba(232,224,208,0.65); margin-top: 0.5rem; }

    /* ── Details card ── */
    .details-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px; padding: 1.8rem;
      backdrop-filter: blur(20px);
      transition: transform 0.3s ease;
    }
    .details-card:hover { transform: translateY(-3px); }
    .detail-item {
      display: flex; flex-direction: column; gap: 0.2rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .detail-item:last-child { border-bottom: none; }
    .detail-key { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--gold); }
    .detail-val { font-size: 0.9rem; color: var(--text); }

    /* ── Responsive poster ── */
    @media (max-width: 500px) {
      .movie-card { flex-direction: column; }
      .poster-img { width: 100%; height: 220px; }
    }
  `}</style>
);

// ─────────────────────────────────────────────
// Star particle canvas
// ─────────────────────────────────────────────
const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const STARS = 120;
    const stars = Array.from({ length: STARS }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.003 + 0.001,
      drift: (Math.random() - 0.5) * 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.a += s.speed;
        if (s.a > 1) s.a = 0;
        s.x += s.drift;
        if (s.x > canvas.width) s.x = 0;
        if (s.x < 0) s.x = canvas.width;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${s.a * 0.6})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas id="stars-canvas" ref={canvasRef} />;
};

// ─────────────────────────────────────────────
// Rating stars helper
// ─────────────────────────────────────────────
const ratingToStars = (rating: string) => {
  const n = parseFloat(rating) / 2; // 0-5
  const full = Math.floor(n);
  const half = n - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "☆" : "") + "✦".repeat(empty);
};

const sentimentClass = (s: string) => {
  const l = s.toLowerCase();
  if (l.includes("positive")) return "sent-positive";
  if (l.includes("negative")) return "sent-negative";
  return "sent-mixed";
};
const sentimentEmoji = (s: string) => {
  const l = s.toLowerCase();
  if (l.includes("positive")) return "🎉";
  if (l.includes("negative")) return "💔";
  return "🎭";
};

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function Home() {
  const [movieId, setMovieId] = useState("");
  const [movie, setMovie] = useState<Movie | null>(null);
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState(""); // "movie" | "reviews" | "sentiment"

  const validate = (id: string) => {
    if (!id.trim()) return "Please enter an IMDb ID.";
    if (!/^tt\d{7,8}$/.test(id.trim())) return 'IMDb IDs look like "tt0133093". Please check yours.';
    return "";
  };

  const searchMovie = async () => {
    const err = validate(movieId.trim());
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    setMovie(null);
    setSentiment(null);

    try {
      // Step 1: movie metadata
      setPhase("Fetching movie data…");
      const movieRes = await fetch(`/api/movie?id=${movieId.trim()}`);
      const movieData = await movieRes.json();
      if (movieData.Response === "False") {
        setError("Movie not found. Double-check the IMDb ID.");
        setLoading(false);
        return;
      }
      setMovie(movieData);

      // Step 2: reviews
      setPhase("Scraping audience reviews…");
      const reviewRes = await fetch(`/api/reviews?id=${movieId.trim()}`);
      const reviews = await reviewRes.json();

      // Step 3: AI sentiment
      setPhase("Running AI sentiment analysis…");
      const sentRes = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews }),
      });
      const sentData = await sentRes.json();
      setSentiment(sentData);
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
    setPhase("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") searchMovie();
  };

  // derive percentages for bars (positive + negative are 0-10 scores → × 10 = %)
  const posPercent = sentiment ? Math.min(sentiment.positive * 10, 100) : 0;
  const negPercent = sentiment ? Math.min(sentiment.negative * 10, 100) : 0;
  const neuPercent = sentiment ? Math.max(0, 100 - posPercent - negPercent) : 0;

  return (
    <>
      <GlobalStyles />
      <StarField />
      <div className="scanline" />

      <main className="page">
        {/* ── Header ── */}
        <header className="header">
          <span className="header-badge">✦ AI-Powered Insights</span>
          <h1 className="glow-text">Movie Insight Builder</h1>
          <p>Enter an IMDb ID and let AI reveal the soul of the film.</p>

          {/* Search */}
          <div className="search-wrap">
            <input
              className="search-input"
              placeholder="e.g. tt0133093  (The Matrix)"
              value={movieId}
              onChange={(e) => { setMovieId(e.target.value); setError(""); }}
              onKeyDown={handleKey}
              aria-label="IMDb movie ID"
            />
            <button
              className="search-btn"
              onClick={searchMovie}
              disabled={loading}
            >
              {loading ? "Analyzing…" : "Analyze ✦"}
            </button>
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}
        </header>

        {/* ── Loader ── */}
        {loading && (
          <div className="loader-wrap">
            <div className="loader-ring" />
            <span className="loader-text">{phase}</span>
          </div>
        )}

        {/* ── Results ── */}
        {movie && (
          <section className="results-grid" aria-live="polite">

            {/* Movie card */}
            <div className="movie-card">
              <div className="poster-wrap">
                <img
                  className="poster-img"
                  src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder.png"}
                  alt={`${movie.Title} poster`}
                  width={140}
                  height={210}
                />
                <div className="poster-glow" />
              </div>

              <div className="movie-info">
                <h2 className="movie-title">{movie.Title}</h2>

                <div className="movie-meta">
                  {movie.Genre?.split(",").map((g) => (
                    <span key={g} className="badge badge-gold">{g.trim()}</span>
                  ))}
                  <span className="badge badge-white">{movie.Year}</span>
                  {movie.Runtime && <span className="badge badge-white">{movie.Runtime}</span>}
                </div>

                <div className="rating-row">
                  <span className="stars">{ratingToStars(movie.imdbRating)}</span>
                  <span className="rating-num">{movie.imdbRating}</span>
                  <span className="rating-max">/ 10</span>
                </div>

                <p className="info-row"><strong>Director:</strong> {movie.Director}</p>
                <p className="info-row"><strong>Cast:</strong> {movie.Actors}</p>
                {movie.Awards && movie.Awards !== "N/A" && (
                  <p className="info-row"><strong>Awards:</strong> {movie.Awards}</p>
                )}

                <p className="plot-text">"{movie.Plot}"</p>
              </div>
            </div>

            {/* Sentiment card */}
            {sentiment && (
              <div className="sentiment-card">
                <p className="card-label">Audience Sentiment</p>

                <div className={`sentiment-badge ${sentimentClass(sentiment.sentiment)}`}>
                  {sentimentEmoji(sentiment.sentiment)} {sentiment.sentiment}
                </div>

                {/* Bars */}
                <p className="bar-label"><span>Positive</span><span>{posPercent.toFixed(0)}%</span></p>
                <div className="bar-track">
                  <div className="bar-fill bar-pos" style={{ "--fill": `${posPercent}%` } as React.CSSProperties} />
                </div>

                <p className="bar-label"><span>Negative</span><span>{negPercent.toFixed(0)}%</span></p>
                <div className="bar-track">
                  <div className="bar-fill bar-neg" style={{ "--fill": `${negPercent}%` } as React.CSSProperties} />
                </div>

                <p className="bar-label"><span>Neutral</span><span>{neuPercent.toFixed(0)}%</span></p>
                <div className="bar-track">
                  <div className="bar-fill bar-neu" style={{ "--fill": `${neuPercent}%` } as React.CSSProperties} />
                </div>

                {sentiment.summary && (
                  <p className="summary-text">{sentiment.summary}</p>
                )}
              </div>
            )}

            {/* Details card */}
            {sentiment && (
              <div className="details-card">
                <p className="card-label">Film Details</p>
                {[
                  { k: "Director",  v: movie.Director },
                  { k: "Runtime",   v: movie.Runtime  },
                  { k: "Year",      v: movie.Year     },
                  { k: "IMDb Rating", v: `${movie.imdbRating} / 10` },
                  { k: "Cast",      v: movie.Actors   },
                ].map(({ k, v }) => v && v !== "N/A" && (
                  <div key={k} className="detail-item">
                    <span className="detail-key">{k}</span>
                    <span className="detail-val">{v}</span>
                  </div>
                ))}
              </div>
            )}

          </section>
        )}
      </main>
    </>
  );
}
