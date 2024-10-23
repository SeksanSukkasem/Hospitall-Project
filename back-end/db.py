import mysql.connector

connection = mysql.connector.connect(
    host='localhost',
    user='root',
    password='rootpassword',
    database='mydatabase'
)

cursor = connection.cursor()

# ตัวอย่างการ query
cursor.execute("SELECT * FROM db_visit_info")

# รับผลลัพธ์
results = cursor.fetchall()

for row in results:
    print(row)

cursor.close()
connection.close()
