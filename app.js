
require('dotenv').config()

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

// Route to serve the fananalytics page
app.get('/fananalytics', (req, res) => {
    res.render('pages/fananalytics');
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

// API route to get genre data
app.get('/api/genres', async (req, res) => {
    console.log('API /api/genres called');
    try {
        // Connect to the database
        await sql.connect(dbConfig);
        console.log('Connected to the database');
        
        // Query to get genre data
        const result = await sql.query(`
            SELECT TOP 5 
                genre,
                averageRating
            FROM [dbo].[MovieGenreRating]
            ORDER BY averageRating DESC
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
        const result = await request.query(`
            SELECT 
                m.id, 
                m.name, 
                m.tagline, 
                m.description, 
                m.minute, 
                m.rating AS averageRating, 
                YEAR(m.date) AS releaseYear, 
                r.ReleaseType, 
                p.PosterLink,
                STRING_AGG(g.Genre, ', ') AS genres
            FROM Movies m
            LEFT JOIN releases r ON m.id = r.MovieID
            LEFT JOIN movie_posters p ON m.id = p.MovieID
            LEFT JOIN MovieGenres g ON m.id = g.MovieID
            WHERE m.id = @movieId
            GROUP BY m.id, m.name, m.tagline, m.description, m.minute, m.rating, m.date, r.ReleaseType, p.PosterLink
        `);
        console.log('Query executed successfully');
        
        // Render the detailed movie page
        res.render('pages/movie-detail', { movie: result.recordset[0] });
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
