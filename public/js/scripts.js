// filepath: /C:/Users/kavin/movie-analysis-app/public/js/scripts.js
document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display movies
    fetchMovies();

    // Handle search form submission
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const searchInput = document.getElementById('search-input').value;
        window.location.href = `/search?q=${encodeURIComponent(searchInput)}`;
    });
});

async function fetchMovies() {
    try {
        const response = await fetch('/api/movies');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const movies = await response.json();
        displayMovies(movies);
    } catch (error) {
        console.error('Failed to fetch movies:', error);
    }
}

function displayMovies(movies) {
    const moviesList = document.getElementById('movies-list');
    moviesList.innerHTML = ''; // Clear any existing content
    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.className = 'movie-item';
        movieItem.innerHTML = `
            <a href="/movies/${movie.id}">
                <img src="${movie.PosterLink}" alt="${movie.name} Poster" class="movie-poster">
                <h2>${movie.name}</h2>
                <p>Rating: ${movie.rating}</p>
            </a>
        `;
        moviesList.appendChild(movieItem);
    });
}