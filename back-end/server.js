require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the db connection

const app = express();
app.use(cors());
app.use(express.json());

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

// API route to fetch table statuses
app.get('/api/table-statuses', (req, res) => {
  const sql = 'SELECT * FROM TableStatus';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching table statuses:', err);
      return res.status(500).send('Error fetching table statuses');
    }
    res.json(result);
  });
});
app.get('/api/visitqueue', (req, res) => {
  const sql = 'SELECT * FROM visitqueue'; // Modify as needed
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching data from visitqueue:', err);
      return res.status(500).send('Error fetching data from visitqueue');
    }
    res.json(result);
  });
});
app.post('/api/update-service', (req, res) => {
  const { table_id, status, Q_no } = req.body;

  const sql = 'UPDATE TableStatus SET status = ?, last_updated = NOW() WHERE table_id = ?';
  db.query(sql, [status, table_id], (err, result) => {
      if (err) {
          console.error('Error updating table status:', err);
          return res.status(500).send('Error updating table status');
      }

      console.log(`Updated table ${table_id} to status: ${status}`);
      
      // Update VisitQueue with the service information if needed
      const updateQueueSql = 'UPDATE visitQueue SET table_id = ?, visit_status = "กำลังเข้ารับบริการ" WHERE Q_no = ?';
      db.query(updateQueueSql, [table_id, Q_no], (err, result) => {
          if (err) {
              console.error('Error updating queue data:', err);
              return res.status(500).send('Error updating queue data');
          }

          res.send('Table status and queue data updated successfully');
      });
  });
});
app.post('/api/move-to-visitQueue', (req, res) => {
  const sqlSelect = 'SELECT * FROM db_visit_info ORDER BY id ASC';
  
  db.query(sqlSelect, (err, results) => {
    if (err) {
      console.error('Error fetching data from db_visit_info:', err);
      return res.status(500).send('Error fetching data from db_visit_info');
    }

    results.forEach((record, index) => {
      const sqlInsert = 'INSERT INTO visitQueue (Q_no, user_name, visit_date, table_id, visit_status) VALUES (?, ?, ?, NULL, "รอการเข้ารับบริการ")';
      db.query(sqlInsert, [record.Q_no, record.user_name, record.visit_date], (err, result) => {
        if (err) {
          console.error('Error inserting data into visitQueue:', err);
          return res.status(500).send('Error inserting data into visitQueue');
        }

        if (index === results.length - 1) {
          res.send('Data moved to visitQueue successfully');
        }
      });
    });
  });
});

app.post('/api/assign-to-table', (req, res) => {
  const { table_id, Q_no } = req.body;
  if (!table_id || !Q_no) {
    return res.status(400).send('Missing table_id or Q_no');
  }

  const updateTableSql = 'UPDATE TableStatus SET status = "occupied", last_updated = NOW() WHERE table_id = ?';
  db.query(updateTableSql, [table_id], (err, result) => {
    if (err) {
      console.error('Error updating table status:', err);
      return res.status(500).send('Error updating table status');
    }

    const moveQueueSql = `
      INSERT INTO visitQueue (Q_no, table_id, visit_status, visit_date)
      SELECT Q_no, ?, 'กำลังเข้ารับบริการ', NOW() 
      FROM db_visit_info 
      WHERE Q_no = ?
    `;
    db.query(moveQueueSql, [table_id, Q_no], (err, result) => {
      if (err) {
        console.error('Error moving queue data:', err);
        alert('Error: ' + err.message);
        console.log('Assigning Q_no:', Q_no, 'to table:', table_id);

        return res.status(500).send('Error moving queue data: ' + err.message);
      }

      res.send('Queue assigned to table and data moved successfully');
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
