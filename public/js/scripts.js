document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display movies
    fetchMovies();
});

async function fetchMovies() {
    try {
        const response = await fetch('/api/movies');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const movies = await response.json();
        console.log('Fetched movies:', movies); // Log fetched movies

        const moviesList = document.getElementById('movies-list');
        moviesList.innerHTML = ''; // Clear any existing content
        movies.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.className = 'movie-item';
            movieItem.innerHTML = `
                <img src="${movie.PosterLink}" alt="${movie.name} Poster" class="movie-poster">
                <h2>${movie.name}</h2>
                <p>Rating: ${movie.rating}</p>
            `;
            moviesList.appendChild(movieItem);
        });
    } catch (error) {
        console.error('Failed to fetch movies:', error);
    }
}