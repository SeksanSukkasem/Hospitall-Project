require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); // To parse JSON bodies

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASS || 'mydatabasepassword',
  database: process.env.DB_NAME || 'mydatabase',
  port: process.env.DB_PORT || 3306,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// API route to fetch queue data
app.get('/api/queue', (req, res) => {
  const sql = 'SELECT * FROM db_visit_info';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching queue data:', err);
      return res.status(500).send('Error fetching queue data');
    }
    res.json(result);
  });
});

app.post('/api/update-table-status', (req, res) => {
  const { table_id, status } = req.body;
  db.query('UPDATE TableStatus SET status = ?, last_updated = NOW() WHERE table_id = ?', [status, table_id], (err, result) => {
    if (err) {
      console.error('Database update error:', err);
      return res.status(500).send('Error updating table status');
    }
    res.send('Table status updated successfully');
  });
});


app.post('/api/update-table-status-from-visit', (req, res) => {
  const querySelectVisit = 'SELECT * FROM db_visit_info WHERE Status = "รอ"'; // Select patients who are waiting

  db.query(querySelectVisit, (err, visitResults) => {
    if (err) {
      console.error('Error selecting visit info:', err);
      return res.status(500).send('Error selecting visit info');
    }

    // Loop through the patients and update the TableStatus
    visitResults.forEach((visit) => {
      const tableId = `โต๊ะ${visit.id}`; // Example of generating table ID
      const queryUpdateTable = 'UPDATE TableStatus SET status = "ไม่ว่าง", last_updated = NOW() WHERE table_id = ?';

      db.query(queryUpdateTable, [tableId], (updateErr) => {
        if (updateErr) {
          console.error(`Error updating table status for table ${tableId}:`, updateErr);
        }
      });
    });

    res.send('Table status updated based on visit info');
  });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
