const express = require('express');
const mysql = require('mysql');
const app = express();
const cors = require('cors');


app.use(cors()); // เปิดใช้งาน CORS

// สร้างการเชื่อมต่อกับฐานข้อมูล MySQL
const db = mysql.createConnection({
  host: 'mysql',  // ใช้ชื่อ 'mysql' ที่ตรงกับ docker-compose.yml
  user: 'user',
  password: 'mydatabasepassword',
  database: 'mydatabase',
  port: 3306
});


// เชื่อมต่อกับ MySQL
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// สร้าง API ที่ดึงข้อมูลจาก MySQL
app.get('/api/queue', (req, res) => {
  const sql = 'SELECT * FROM db_visit_info';
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result); // ส่งข้อมูลกลับไปเป็น JSON
  });
});

// รันเซิร์ฟเวอร์ที่พอร์ต 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
