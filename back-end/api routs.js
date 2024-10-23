const connection = require('./db');

// ตัวอย่างการ query
connection.query('SELECT * FROM db_visit_info', (err, results, fields) => {
  if (err) throw err;
  console.log('Data from db_visit_info:', results);
});
