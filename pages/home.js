import { useState, useEffect } from 'react';
import Sidebar from './components/sidebar';
import NavbarHome from './components/navbarhome';

const Home = () => {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [lineId, setLineId] = useState('');
  const [handed, setHanded] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [experience, setExperience] = useState('');
  const [status, setStatus] = useState('');
  const [msg, setMsg] = useState('');
  const [users, setUsers] = useState([]); // เพิ่ม state สำหรับเก็บข้อมูลผู้ใช้

  // ดึงข้อมูลผู้ใช้เมื่อเปิดหน้า
  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/getUsers'); // ใช้ API ดึงข้อมูล
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users); // เก็บข้อมูลผู้ใช้ใน state
      }
    };
    fetchUsers();
  }, []); // รันเมื่อหน้าแรกเปิด

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setName('');
    setLevel('');
    setLineId('');
    setHanded('');
    setPhone('');
    setAge('');
    setExperience('');
    setStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    const newUser = {
      name,
      level,
      lineId,
      handed,
      phone,
      age,
      experience,
      status,
    };

    const res = await fetch('/api/addMember', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });

    const data = await res.json();

    if (res.ok) {
      setMsg('User added successfully!');
      closeModal();
      // ดึงข้อมูลผู้ใช้ใหม่หลังจากเพิ่มผู้ใช้
      const updatedUsers = await fetch('/api/getUsers');
      const usersData = await updatedUsers.json();
      setUsers(usersData.users);
    } else {
      setMsg(data.message || 'Error adding user');
    }
  };

  return (
    <>
      <Sidebar />
      <NavbarHome />

      <main className="main-content">
        <div className="header">
          <h2>Users</h2>
          <hr />
        </div>

        <div className="controls">
          <input
            type="text"
            placeholder="ค้นหาผู้ใช้"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="add-user-btn" onClick={openModal}>+ เพิ่มผู้ใช้</button>
        </div>

        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>ชื่อ</th>
                <th>ระดับ</th>
                <th>LINE ID</th>
                <th>มือที่ถนัด</th>
                <th>เบอร์ติดต่อ</th>
                <th>อายุ</th>
                <th>ประสบการณ์</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(user => user.name.toLowerCase().includes(search.toLowerCase())).map((user) => (
                <tr key={user.id}>
                  <td><input type="checkbox" /></td>
                  <td>{user.name}</td>
                  <td>{user.level}</td>
                  <td>{user.lineId}</td>
                  <td>{user.handed}</td>
                  <td>{user.phone}</td>
                  <td>{user.age}</td>
                  <td>{user.experience}</td>
                  <td>{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>เพิ่มผู้ใช้</h3>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <input type="text" placeholder="ชื่อ" value={name} onChange={(e) => setName(e.target.value)} />
                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="">เลือกระดับ</option>
                  <option value="BG">BG</option>
                  <option value="S-">S-</option>
                  <option value="S">S</option>
                  <option value="N-">N-</option>
                  <option value="N">N</option>
                  <option value="P-">P-</option>
                  <option value="P">P</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div className="form-group">
                <input type="text" placeholder="LINE ID" value={lineId} onChange={(e) => setLineId(e.target.value)} />
                <select value={handed} onChange={(e) => setHanded(e.target.value)}>
                  <option value="">เลือกมือที่ถนัด</option>
                  <option value="ขวา">ขวา</option>
                  <option value="ซ้าย">ซ้าย</option>
                </select>
              </div>
              <div className="form-group">
                <input type="text" placeholder="เบอร์ติดต่อ" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <input type="number" placeholder="อายุ" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div className="form-group">
                <input type="text" placeholder="ประสบการณ์" value={experience} onChange={(e) => setExperience(e.target.value)} />
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">เลือกสถานะ</option>
                  <option value="มา">มา</option>
                  <option value="ไม่มา">ไม่มา</option>
                </select>
              </div>
              <div className="form-buttons">
                <button type="submit">เพิ่มผู้ใช้</button>
                <button type="button" onClick={closeModal}>ปิด</button>
              </div>
            </form>
            {msg && <p>{msg}</p>}
          </div>
        </div>
      )}

      <style jsx>{`
        .main-content {
          padding: 80px 20px 20px 10px;
          background-color: #fff;
          min-height: auto;
          font-family: Arial, sans-serif;
          transition: margin-left 0.3s ease;
          margin-left: 130px;
        }

        .header h2 {
          margin: 0 0 8px 0;
          font-weight: 600;
          font-size: 1.5rem;
          color: #333;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        input[type='text'], input[type='number'], select {
          flex: 1;
          padding: 10px 14px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          outline: none;
          min-width: 200px;
          margin-bottom: 12px;
        }

        .add-user-btn {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 10px 16px;
          font-size: 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .add-user-btn:hover {
          background-color: #45a049;
        }

        .table-container {
          width: 100%;
          overflow-x: auto;
        }

        table.user-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          color: #222;
          min-width: 800px;
          background-color: #fff; /* ทำให้พื้นหลังของตารางเป็นสีขาว */
        }

        table.user-table th,
        table.user-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: center;
        }

        /* กำหนดพื้นหลังของแถวข้อมูลเป็นสีขาว */
        table.user-table tbody tr {
          background-color: #fff;
        }

        /* กำหนดสีของตัวอักษรในแถวข้อมูลให้เป็นสีดำ */
        table.user-table tbody td {
          color: #333; /* ตัวหนังสือสีดำ */
        }

        table.user-table th {
          background-color: #2c3e50; /* สีพื้นหลังสำหรับ header */
          color: white;
        }

        table.user-table tbody tr:hover {
          background-color: #f5f5f5; /* เมื่อมีการ hover แถว ให้เปลี่ยนพื้นหลัง */
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 500px;
        }

        .form-group {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .form-group input {
          flex: 1;
        }

        .form-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .form-buttons button {
          padding: 10px 16px;
          border: none;
          font-size: 1rem;
          border-radius: 6px;
          cursor: pointer;
        }

        .form-buttons button[type="button"] {
          background-color: #f44336;
          color: white;
        }

        .form-buttons button[type="submit"] {
          background-color: #4caf50;
          color: white;
        }

        .form-buttons button:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .form-group {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default Home;
