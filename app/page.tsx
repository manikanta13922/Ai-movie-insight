"use client"

import { useState } from "react";

export default function Home() {

  const [movieId, setMovieId] = useState("");
  const [movie, setMovie] = useState<Record<string, any> | null>(null);
  const [sentiment, setSentiment] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);

  const searchMovie = async () => {

    if(!movieId){
      alert("Enter IMDb ID");
      return;
    }

    setLoading(true);

    const movieRes = await fetch(`/api/movie?id=${movieId}`);
    const movieData = await movieRes.json();
    setMovie(movieData);

    const reviewRes = await fetch(`/api/reviews?id=${movieId}`);
    const reviews = await reviewRes.json();

    const sentimentRes = await fetch("/api/sentiment",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({reviews})
    });

    const sentimentData = await sentimentRes.json();
    setSentiment(sentimentData);

    setLoading(false);
  };

  return (

    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-10">

      <h1 className="text-4xl font-bold mb-8 text-black">
        AI Movie Insight Builder
      </h1>

      <div className="flex gap-3 mb-10">

        <input
          className="border border-gray-400 p-3 rounded w-64 text-black"
          placeholder="Enter IMDb ID (tt0133093)"
          value={movieId}
          onChange={(e)=>setMovieId(e.target.value)}
        />

        <button
          onClick={searchMovie}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded"
        >
          Search
        </button>

      </div>

      {loading && <p className="text-black">Loading movie data...</p>}

      {movie && (

        <div className="bg-white shadow-lg rounded p-6 max-w-xl text-black">

          <h2 className="text-2xl font-bold mb-4">
            {movie.Title}
          </h2>

          <img
            src={movie.Poster !== "N/A" ? movie.Poster : "/no-poster.png"}
            alt="movie poster"
            width={200}
            height={300}
            className="mb-4 rounded"
          />

          <p><b>Year:</b> {movie.Year}</p>
          <p><b>IMDb Rating:</b> {movie.imdbRating}</p>
          <p><b>Cast:</b> {movie.Actors}</p>

          <p className="mt-4">
            <b>Plot:</b> {movie.Plot}
          </p>

        </div>

      )}

      {sentiment && (

        <div className="mt-8 bg-white shadow-lg rounded p-6 max-w-xl text-black">

          <h3 className="text-xl font-bold mb-4">
            Audience Sentiment
          </h3>

          <p><b>Overall Sentiment:</b> {sentiment.sentiment}</p>
          <p><b>Positive Mentions:</b> {sentiment.positive}</p>
          <p><b>Negative Mentions:</b> {sentiment.negative}</p>

        </div>

      )}

    </div>
  );
}