// MSc Computer Science - Joshua Coates
// Web Technologies - Assessment 2 - Movie Database Application
// api.js
// Docs: https://developer.themoviedb.org/docs
// Docs: https://www.omdbapi.com/

// API Key for TMDB Links
const TMDB_KEY = 'de42ff170898f1f4637a906491e30d13';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGES = 'https://image.tmdb.org/t/p/w342';

// First function for pulling in from TMDB. Also with error catch if there is nothing that is returned. Mainly for API Key exchange and search parameters.
// Key is referenced similar to a variable rather than constantly having the key referenced. Set once and forget so can be called in multiple functions.

async function tmdbRequest(path, params = {}) {
	const url = new URL(TMDB_BASE + path);
	url.searchParams.set('api_key', TMDB_KEY);
	url.searchParams.set('language', 'en-GB');
	for (const key in params) {
		url.searchParams.set(key, params[key]);
	}
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`TMDB Request Failed: ${response.status}`);
	}
	return response.json();
}

// Function for getting the list of genres from TMDB
async function getGenres() {
	const data = await tmdbRequest('/genre/movie/list');
	return data.genres;
}

// Function for movie search using title. Keeping adult titles out.
async function searchMovies(title) {
	const data = await tmdbRequest('/search/movie', { query: title, include_adult: 'false' });
	return data.results;
}

// Function for move details and ID once search has been completed.
async function getMovieDetails(id) {
	return tmdbRequest(`/movie/${id}`);
}

// OMDB Key for OMDB Related Rating Information
const OMDB_KEY = 'ba7c8af9';

// Function for searching OMDB database using Imdb ID and the associated OMDB API key. Error catch built in for if search if not successful.
// Key is referenced similar to a variable rather than constantly having the key referenced. Set once and forget so can be called in multiple functions.
async function getOmdbMovie(imdbId) {
	const response = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_KEY}`);
	const data = await response.json();
	if (data.Response === 'False') {
		throw new Error(data.Error);
	}
	return data;
}
