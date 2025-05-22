import { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';

const NavbarHome = () => {
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    // สมมติ fetch ชื่อทีม
    fetch('/api/team')
      .then(res => res.json())
      .then(data => setTeamName(data.name || 'Name Team'))
      .catch(() => setTeamName('Name Team'));
  }, []);

  return (
    <>
      <nav className="navbar">
        {/* ฝั่งซ้ายไว้ว่าง หรือใส่โลโก้หรืออะไรได้ */}
        <div className="navbar-left"></div>

        {/* ฝั่งขวาเอา Name Team กับ User icon มาอยู่ด้วยกัน */}
        <div className="navbar-right">
          <span className="team-name">{teamName}</span>
          <FaUserCircle size={24} title="User" />
        </div>
      </nav>

      <style jsx>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 50px;
          padding: 0 16px;
          background-color: #f5f7fa;
          border-bottom: 1px solid #ddd;
          font-family: Arial, sans-serif;
        }

        .navbar-left {
          /* เว้นที่ไว้ซ้าย ถ้าไม่ใช้เอาออกได้ */
          flex: 1;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 8px; /* ระยะห่างระหว่างชื่อทีมกับไอคอน */
          cursor: pointer;
          color: #555;
        }

        .navbar-right:hover {
          color: #000;
        }

        .team-name {
          font-weight: 600;
          font-size: 1rem;
          color: #222;
          background: #eee;
          padding: 6px 12px;
          border-radius: 4px;
          user-select: none;
        }
      `}</style>
    </>
  );
};

export default NavbarHome;
