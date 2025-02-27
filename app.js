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

// API route to get movies data
app.get('/api/movies', async (req, res) => {
    console.log('API /api/movies called');
    try {
        // Connect to the database
        await sql.connect(dbConfig);
        console.log('Connected to the database');
        
        // Optimized query
        const result = await sql.query(`
            SELECT TOP 10 
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

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});