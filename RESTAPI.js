// Import the Express module and MySQL
const express = require('express');
const db = require('./crowdfunding_db'); // Import the MySQL connection from crowdfunding_db.js

// Create an instance for Express
const app = express();

// Set the port
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());


// GET method 

app.get('/api/fundraisers', (req, res) => {
    const query = `
        SELECT FUNDRAISER.FUNDRAISER_ID AS id, FUNDRAISER.ORGANIZER AS organizer,
        FUNDRAISER.CAPTION AS caption, FUNDRAISER.TARGET_FUNDING AS target_funding,
        FUNDRAISER.CURRENT_FUNDING AS current_funding, FUNDRAISER.CITY AS city,
        CATEGORY.NAME AS category
        FROM FUNDRAISER
        JOIN CATEGORY ON FUNDRAISER.CATEGORY_ID = CATEGORY.CATEGORY_ID
        WHERE FUNDRAISER.ACTIVE = TRUE`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error happens during fetch fundraisers: ' + err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        
        res.json(results);
    });
});

// GET method to retrieve all categories

app.get('/api/categories', (req, res) => {
    const query = 'SELECT * FROM CATEGORY';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error happens during fetch categories: ' + err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        // Send the results as a JSON response
        res.json(results);
    });
});

// GET method to retrieve active fundraisers based on search criteria

app.get('/api/search', (req, res) => {
    const { organizer, city, category, target_funding, current_funding } = req.query;

    let query = `
        SELECT FUNDRAISER.FUNDRAISER_ID AS id, FUNDRAISER.ORGANIZER AS organizer,
        FUNDRAISER.CAPTION AS caption, FUNDRAISER.TARGET_FUNDING AS target_funding,
        FUNDRAISER.CURRENT_FUNDING AS current_funding, FUNDRAISER.CITY AS city,
        CATEGORY.NAME AS category
        FROM FUNDRAISER
        JOIN CATEGORY ON FUNDRAISER.CATEGORY_ID = CATEGORY.CATEGORY_ID
        WHERE FUNDRAISER.ACTIVE = TRUE`;

    // Adding filters
    if (organizer) {
        query += ` AND FUNDRAISER.ORGANIZER LIKE '%${organizer}%'`;
    }
    if (city) {
        query += ` AND FUNDRAISER.CITY LIKE '%${city}%'`;
    }
    if (category) {
        query += ` AND CATEGORY.NAME LIKE '%${category}%'`;
    }
    if (target_funding) {
        query += ` AND FUNDRAISER.TARGET_FUNDING >= ${target_funding}`;
    }
    if (current_funding) {
        query += ` AND FUNDRAISER.CURRENT_FUNDING >= ${current_funding}`;
    }

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error happens during search fundraisers: ' + err);
            res.status(500).json({ error: 'Error happens during search fundraisers' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ message: 'No fundraisers found matching the criteria' });
        } else {
            res.json(results);
        }
    });
});


//GET method to retrieve the details of a fundraiser by ID

app.get('/api/fundraiser/:id', (req, res) => {
    const fundraiserId = req.params.id;

    const query = `
        SELECT FUNDRAISER.FUNDRAISER_ID AS id, FUNDRAISER.ORGANIZER AS organizer,
        FUNDRAISER.CAPTION AS caption, FUNDRAISER.TARGET_FUNDING AS target_funding,
        FUNDRAISER.CURRENT_FUNDING AS current_funding, FUNDRAISER.CITY AS city,
        CATEGORY.NAME AS category
        FROM FUNDRAISER
        JOIN CATEGORY ON FUNDRAISER.CATEGORY_ID = CATEGORY.CATEGORY_ID
        WHERE FUNDRAISER.FUNDRAISER_ID = ?`;

    db.query(query, [fundraiserId], (err, results) => {
        if (err) {
            console.error('Error happens during fetch fundraiser details: ' + err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ message: 'Fundraiser not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
