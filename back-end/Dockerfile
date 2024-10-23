# Dockerfile สำหรับ Backend
FROM node:16

# กำหนด working directory
WORKDIR /usr/src/app

# คัดลอกไฟล์ package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# ติดตั้ง mysql module ที่หายไป
RUN npm install mysql

# คัดลอกโค้ดทั้งหมดเข้าไปใน container
COPY . .

# เปิด port 5000
EXPOSE 5000

# คำสั่งเริ่มต้นแอปพลิเคชัน
CMD ["npm", "start"]
