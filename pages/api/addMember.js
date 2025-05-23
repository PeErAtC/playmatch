import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',  // รหัสผ่าน (ถ้ามี)
  database: 'playmatch_db',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, level, lineId, handed, phone, age, experience, status } = req.body;

  if (!name || !level || !lineId || !handed || !phone || !age || !experience || !status) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [rows] = await pool.query(
      'INSERT INTO group_members (admin_username, name, level, lineId, handed, phone, age, experience, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['admin_username', name, level, lineId, handed, phone, age, experience, status]
    );

    return res.status(201).json({ message: 'User added successfully', userId: rows.insertId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
