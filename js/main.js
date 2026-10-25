// MSc Computer Science
// Web Technologies - Assessment 2 - Movie Database Application
// main.js
// https://www.w3schools.com/js/
// https://www.w3schools.com/js/js_htmldom_eventlistener.asp
// https://www.w3schools.com/jsref/met_document_getelementbyid.asp
// https://www.w3schools.com/js/js_object_constructors.asp

document.documentElement.classList.add('js');

const navToggle = document.querySelector('.navigation-toggle');
const siteNav = document.querySelector('#site-navigation');

navToggle.addEventListener('click', () => {
	const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
	navToggle.setAttribute('aria-expanded', String(!isOpen));
	siteNav.classList.toggle('is-open');
});

// Find form, only run if form is subsequently found. Has to tie in with CSS to find correct selector.
const suggestForm = document.querySelector('#suggest-form');

if (suggestForm) {

// Grab other elements that will be required, similar to that of the above.	
	const reason = document.querySelector('#reason');
	const reasonCount = document.querySelector('#reason-count');
	const confirmation = document.querySelector('#confirmation');

// Character counter. Measures how many characters are typed into the box to set a feasible max length for the characters entered.
	reason.addEventListener('input', () => {
		reasonCount.textContent = `${reason.value.length} Of 300 Characters`;
	});

// Submission is caught so that page isn't reloaded but shows the results without requiring a full reload of the page.
	suggestForm.addEventListener('submit', (event) => {
		event.preventDefault();
// Confirm all details within the fields and show any errors that are present.
		const fields = suggestForm.querySelectorAll('input, select, textarea');
		let formIsValid = true;

		fields.forEach((field) => {
			const isValid = field.checkValidity();
			const errorBox= document.querySelector(`#${field.id}-error`);
			if (errorBox) {
				errorBox.textContent = field.validationMessage;
			}
			field.setAttribute('aria-invalid', !isValid);
			if (!isValid) {
				formIsValid = false;
			}
		});
// Stop of invalid. Otherwise run through and allow to complete displaying message.		
			if (!formIsValid) {
				return;
			}

			const name = document.querySelector('#name').value;
			suggestForm.hidden = true;
			confirmation.hidden = false;
// Acknowledgement of the form being submitted and correctly containing the information required.
			confirmation.textContent = `Thanks ${name}, We've Received Your Suggestion!`;
	});
}

// Fill the genre dropdown with information pulled.
const genreSelect = document.querySelector('#genre');

if (genreSelect) {
	getGenres()
		.then((genres) => {
			genres.forEach((genre) => {
				const option = document.createElement('option');
				option.value = genre.id;
				option.textContent = genre.name;
				genreSelect.append(option);
			});
		})
}

// Build Movie Card from the information that has been incoming from the APIs. Error check that in if there is no movie poster supplied it will not try to load one.
function createMovieCard(movie) {
	const item = document.createElement('li');
	item.className = 'movie-card';

	const link = document.createElement('a');
	link.href = `details.html?id=${movie.id}`;

	if (movie.poster_path) {
		const poster= document.createElement('img');
		poster.src = TMDB_IMAGES + movie.poster_path;
		poster.alt = '';
// Poster loading in lazy means the page will be quicker by only loading image once it is ready to scroll into view
// https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading
		poster.loading = 'lazy';
		link.append(poster);
	}
// So that either the link of the poster will both take user into the page. Increasing overall accessibility.
	const heading = document.createElement('h3');
	heading.textContent = movie.title;
	link.append(heading);
	const info = document.createElement('p');
// If there is a 4 digit release date it will show this. If there is no release date it will show Year Unknown.
	const year = movie.release_date ? movie.release_date.slice(0, 4) : 'Year Unknown';
// toFixed rounds result to one decimal place
	info.textContent = `${year} · Rating ${movie.vote_average.toFixed(1)}/10`;
// Adds link to list item and then return to called function
	item.append(link, info);
	return item;
}

// Set up the form ready to perform search function.
const searchForm = document.querySelector('#search-form');

if (searchForm) {
	const resultsList = document.querySelector('#results-list');
	const resultsStatus = document.querySelector('#results-status');
// On submit, read what the user has chosen, page stopped from full reload, sanity check for accidental spaces, conversion of input to a number.
// TMDB saves genre ID's as a number rather than "number" so cross checking later needs to match exactly to pull results.
// Shows searching status message when running.
	searchForm.addEventListener('submit', (event) => {
		event.preventDefault();
		const title = document.querySelector('#title').value.trim();
		const genreId = Number(document.querySelector('#genre').value);
		const sortBy = document.querySelector('input[name="sort"]:checked').value;
		resultsStatus.textContent = 'Searching...';
		resultsList.innerHTML = '';
// Fetch results, filter them to ensure correct and then sort them. All from API related infomrmation.
		searchMovies(title)
			.then((movies) => {
				if (genreId) {
// .filter is important due to this deciding if the genre ID's keep the chosen one included from the search results.
					movies = movies.filter((movie) => movie.genre_ids.includes(genreId));
				}
// Filters for sorting the results when they arrive back from TMDB
				if (sortBy === 'rating') {
					movies.sort((a, b) => b.vote_average - a.vote_average);
				} else {
					movies.sort((a, b) => a.title.localeCompare(b.title));
				}
// Shows results once search is complete. If not complete, show a message informing user there has been none found.
				if (movies.length === 0) {
					resultsStatus.textContent = `No Movies Found For "${title}".`;
					return;
				}
				resultsStatus.textContent = `${movies.length} found for "${title}".`;
				movies.forEach((movie) => resultsList.append(createMovieCard(movie)));
			})
// Error catch, if there is an error rather than nothing happening a status message is displayed so the user understands what is happening.
		.catch((error) => {
			console.error(error);
			resultsStatus.textContent = 'Sorry, Something Went Wrong. Please Try Again!';
		});
	});
}

// OMDB related information processing
// Function shows OMDB related information once it has been requested for specific item.
function showOmdbInfo(imdbId) {
// Takes an IMDB related ID
	getOmdbMovie(imdbId)
	.then((omdb) => {
// Asks OMDB for the information of that film via it's ID such as Director, Rated and Awards. OMDB is specific and takes these with Capitals rather than lowercase.
		document.querySelector('#omdb-director').textContent = omdb.Director;
		document.querySelector('#omdb-rated').textContent = omdb.Rated;
		document.querySelector('#omdb-awards').textContent = omdb.Awards;
// Pulls different rating scores. OMDB pulls from a variety such as Rotten Tomatoes etc.
		omdb.Ratings.forEach((rating) => {
			const item = document.createElement('li');
// Creates an item of the value and the provider of the value.
			item.textContent = `${rating.Source}: ${rating.Value}`;
			document.querySelector('#omdb-ratings').append(item);
		});
	})
// Error catch. If OMDB section fails or does not receive the expected information from OMDB. Section is hidden rather than appearing blank with no value.
		.catch((error) => {
			console.error(error);
			document.querySelector('#omdb-info').hidden = true;
		});
}

// Only runs in the details page!
const movieTitle = document.querySelector('#movie-title');

if (movieTitle) {
// Read and record the MovieID from the URL being passed.
	const id = new URLSearchParams(window.location.search).get('id');

// If there is no MovieID, show a message that there has been No Movie Selected rather than a blank page or something that is incorrect.
	if (!id) {
		movieTitle.textContent = 'No Movie Selected';
	} else {
// Fills the page with the information that has been received. This is an accumulation of the Movie Information from both TMDB and OMDB.
		getMovieDetails(id)
		.then((movie) => {
			movieTitle.textContent = movie.title;
			document.title = `${movie.title} | Movie Database` ;
			document.querySelector('#movie-year').textContent =
// Similar to previous, take the four digits or report back that the date is unknown.
				movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown';
			document.querySelector('#movie-genre').textContent =
// Endpoint returns details as objects, break these down into separate items or names, then uses join to make the list into one string.
				movie.genres.map((genre) => genre.name).join(', ');
			document.querySelector('#movie-rating').textContent =
// Rounds returned rating to one decimal place.
				`${(movie.vote_average ?? 0).toFixed(1)}/10`;
			document.querySelector('#movie-plot').textContent =
// If there is no plot or it is empty, return below text rather than returning anything that will be incorrect for the user.
				movie.overview || 'No Plot Summary Available!';
			if (movie.poster_path) {
// Add the movie poster
				const poster = document.createElement('img');
				poster.src = TMDB_IMAGES + movie.poster_path;
				poster.alt = `Poster For ${movie.title}`;
				document.querySelector('#movie-poster').append(poster);
			}
// Attempt to fetch the required information from OMDB for Director, Ratings etc.
			if (movie.imdb_id) {
				showOmdbInfo(movie.imdb_id);
			} else {
				document.querySelector('#omdb-info').hidden = true;
		}
		})
// If errors are returned, return error message as displayed.
		.catch((error) => {
			console.error(error);
			movieTitle.textContent = 'Sorry, This Movies Details Could Not Be Loaded!';
		});
	}
}





