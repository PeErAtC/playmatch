// pages/api/getUsers.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',  // ใส่รหัสผ่านถ้ามี
  database: 'playmatch_db',
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const [rows] = await pool.query('SELECT * FROM group_members');
    
    // ส่งข้อมูลผู้ใช้กลับไปยัง client
    return res.status(200).json({ users: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
}
