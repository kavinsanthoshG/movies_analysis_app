const express = require('express');
const app = express();
const path = require('path');
const sql = require('mssql');
const dbConfig = require('./dbConfig');

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/movies', (req, res) => {
    res.render('pages/movies');
});
// filepath: /C:/Users/kavin/movie-analysis-app/app.js
app.get('/api/search', async (req, res) => {
    const searchQuery = req.query.q;
    console.log(`API /api/search called with query: ${searchQuery}`);
    try {
        // Connect to the database
        await sql.connect(dbConfig);
        console.log('Connected to the database');
        
        // Query to search movies
        const request = new sql.Request();
        request.input('searchQuery', sql.VarChar, `%${searchQuery}%`);
        const result = await request.query(`
            SELECT 
            TOP 1
                m.id
            FROM Movies m
            WHERE m.name LIKE @searchQuery
        `);
        console.log('Search query executed successfully');
        
        // Send the result as JSON
        res.json(result.recordset);
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).send('Internal Server Error');
    }
});

// filepath: /C:/Users/kavin/movie-analysis-app/app.js
// filepath: /C:/Users/kavin/movie-analysis-app/app.js
app.get('/search', async (req, res) => {
    const searchQuery = req.query.q;
    console.log(`Search route called with query: ${searchQuery}`);
    try {
        // Construct the full URL for the fetch call
        const apiUrl = `${req.protocol}://${req.get('host')}/api/search?q=${encodeURIComponent(searchQuery)}`;
        
        // Fetch the related movie ID
        const response = await fetch(apiUrl);
        const movieIds = await response.json();
        
        if (movieIds.length === 0) {
            // No related movies found, redirect to "no movie" page
            res.redirect('/no-movie');
        } else {
            // Redirect to the first related movie's detail page
            const movieId = movieIds[0].id;
            res.redirect(`/movies/${movieId}`);
        }
    } catch (err) {
        console.error('Failed to fetch search results:', err);
        res.status(500).send('Internal Server Error');
    }
});
// API route to get movies data
app.get('/api/movies', async (req, res) => {
    console.log('API /api/movies called');
    try {
        // Connect to the database
        await sql.connect(dbConfig);
        console.log('Connected to the database');
        
        // Optimized query
        const result = await sql.query(`
            SELECT TOP 100
                m.id, 
                m.name, 
                m.rating, 
                p.PosterLink 
            FROM Movies m
            LEFT JOIN movie_posters p ON m.id = p.MovieID
        `);
        console.log('Query executed successfully');
        
        // Send the result as JSON
        res.json(result.recordset);
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to get detailed movie data
app.get('/movies/:id', async (req, res) => {
    const movieId = req.params.id;
    console.log(`API /movies/${movieId} called`);
    try {
        // Connect to the database
        await sql.connect(dbConfig);
        console.log('Connected to the database');
        
        // Query to get detailed movie data
        const request = new sql.Request();
        request.input('movieId', sql.Int, movieId);
        const movieResult = await request.query(`
            SELECT 
                m.name, 
                m.tagline, 
                m.description, 
                m.minute, 
                m.rating AS averageRating, 
                YEAR(m.date) AS releaseYear, 
                r.ReleaseType, 
                p.PosterLink
            FROM Movies m
            LEFT JOIN releases r ON m.id = r.MovieID
            LEFT JOIN movie_posters p ON m.id = p.MovieID
            WHERE m.id = @movieId
        `);
        console.log('Movie query executed successfully');
        
        // Query to get genres
        const genreResult = await request.query(`
            SELECT 
                STRING_AGG(g.Genre, ', ') AS genres
            FROM Movies m
            LEFT JOIN MovieGenres g ON m.id = g.MovieID
            WHERE m.id = @movieId
            GROUP BY m.name, m.tagline, m.description, m.minute, m.rating, m.date
        `);
        console.log('Genre query executed successfully');
        
        // Combine results
        const movie = movieResult.recordset[0];
        movie.genres = genreResult.recordset[0].genres;
        
        // Render the detailed movie page
        res.render('pages/movie-detail', { movie });
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/no-movie', (req, res) => {
    res.render('pages/no-movie');
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});