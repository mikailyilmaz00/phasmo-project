const express = require('express');
const fs = require('fs'); // File system module to read files
const app = express();
const cors = require ('cors');
const { type } = require('os');
const port = 3000;
const bodyParser = require('body-parser');
const phas = require('./phas.database.js');

// middleware
app.use(cors({
    origin: 'http://127.0.0.1:5500', // match frontend URL
}));
app.use(express.json());
app.use(bodyParser.json());
// connecting node to mysql / opening database

const mysql = require('mysql2');
const { error } = require('console');
const database = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Mauroicardi1905',
    database: 'phasmo_db'
});

// connecting to db
database.connect((err) => {
    if (err) {
    console.log('Error connecting to MySQL database');
    return;
}
console.log('Connected to MySQL database.');
});

// get all ghosts from mysql

app.get('/api/ghosts', (req, res) => {
    database.query('SELECT * FROM ghosts', (err, results) => {
        if (err) {
            console.error('Error fetching ghosts:', err);
            return res.status(500).json({ error: 'Database error'});
        }
        res.json(results);
    });
});

// Route to get all ghosts from JSON file
app.get('/api/equipment', (req, res) => {
    const query = 'SELECT * FROM equipment';

    database.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results); // sending data to user
    });  
});




app.use(express.json()); // middleware to parse JSON bodies

app.post('/api/ghosts', (req, res) => {
  console.log('It is ready', phas.phas);

      // Step 3: Preparing the data for insertion
      const values = phas.phas.map(phas => [
          phas.name,
          phas.strengths,
          phas.weaknesses,
          phas.evidences,
      ]);
console.log(values[0]);

    // step 4 - executing the insert query

    // Define the values array properly as an array of arrays

  // Insert query with parameterized placeholders
  const query = 'INSERT INTO ghosts (name, strengths, weaknesses, evidences) VALUES ?';
  
  database.query(query, [values], (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Data inserted successfully:', result);
    }
  });
  
        
})


// 2nd apppost to fetch from frond-end

app.post('/api/monsterghost', (req, res) => {
    const { name } = req.body; // this extract the name from the request
    const query = 'INSERT INTO ghosts (name) VALUES (?)'; //defining sql insert query

// executing the query
database.query(query, [name], (err, result) => {
    if (err) {
        console.error('Error inserting ghost:', err);
        return res.status(500).json({ error: 'Database error' });
    }
        console.log('Ghost inserted succesfully', result);
        res.status(201).json({ message: 'Ghost inserted succesfully', id: result.insertId})
    });
});

// 3rd post 
app.post('/api/equipment', (req, res) => {
    const { name, maxLimit, description } = req.body; // this extract the name from the request

    // checking if all values are being retrieved correctly

    if (!name || !maxLimit || !description) {
        return res.status(400).json({ error: 'All fileds must be filled'}); // exiting if any fields are missing
    }
    const query = 'INSERT INTO equipment (name, maxLimit, description) VALUES (?, ?, ?)'; //defining sql insert query

// executing the query
database.query(query, [name, maxLimit, description], (err, result) => {
    if (err) {
        console.error('Error inserting equipment:', err);
        return res.status(500).json({ error: 'Database error' });
    }
        console.log('equipment inserted succesfully', result);
        res.status(201).json({ message: 'Equipment inserted succesfully', id: result.insertId})
    });
});

// app.put for updating ghosts etc.

app.put('/api/ghosts', (req, res) => {
    const { id, name, strengths, weaknesses, evidences } = req.body;
    database.query('UPDATE ghosts SET name = ?, strengths = ?, weaknesses = ?, evidences = ? WHERE id = ?',
        [name, strengths, weaknesses, evidences, id], (err, result) => {
            if (err) {
                console.error('Error updating data:', err);
                return res.status(500).send('Database error');
        }
        res.status(200).json({ message: 'Ghost updated succesfully', result});
    
});
});




// error handling route
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

// start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    
});


