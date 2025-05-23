import { useState, useEffect } from 'react';
import Sidebar from './components/sidebar';
import NavbarHome from './components/navbarhome';

const Match = () => {
  const [matches, setMatches] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');

  // modal control states
  const [startMatchModalOpen, setStartMatchModalOpen] = useState(false);
  const [pairPlayersModalOpen, setPairPlayersModalOpen] = useState(false);

  // ผู้เล่นสถานะ Enabled
  const [enabledPlayers, setEnabledPlayers] = useState([]);
  const [searchPlayer, setSearchPlayer] = useState('');

  // สำหรับเริ่มจัดก๊วน: selectedPlayers (object key=id)
  const [selectedPlayers, setSelectedPlayers] = useState({});

  // สำหรับจับคู่: selectedPairs (array คู่ละ 2 คน)
  const [selectedPairs, setSelectedPairs] = useState([]);

  useEffect(() => {
    if (searchDate) {
      fetchMatches();
      fetchEnabledPlayers();
    }
  }, [searchDate]);

  const fetchMatches = async () => {
    try {
      const res = await fetch(`/api/getMatches?date=${searchDate}`);
      const data = await res.json();
      if (res.ok) {
        setMatches(data.matches || []);
      } else {
        setMsg('ไม่สามารถโหลดแมตช์ได้');
      }
    } catch (error) {
      console.error(error);
      setMsg('เกิดข้อผิดพลาดในการโหลดแมตช์');
    }
  };

  const fetchEnabledPlayers = async () => {
    try {
      const res = await fetch('/api/getEnabledPlayers');
      const data = await res.json();
      if (res.ok) {
        setEnabledPlayers(data.players || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // -- เริ่มจัดก๊วน functions --
  const toggleSelectPlayer = (player) => {
    setSelectedPlayers(prev => {
      const newSelected = { ...prev };
      if (newSelected[player.id]) {
        delete newSelected[player.id];
      } else {
        newSelected[player.id] = player;
      }
      return newSelected;
    });
  };

  const openStartMatchModal = () => {
    setStartMatchModalOpen(true);
    setSearchPlayer('');
    setSelectedPlayers({});
    fetchEnabledPlayers();
  };
  const closeStartMatchModal = () => {
    setStartMatchModalOpen(false);
    setSearchPlayer('');
    setSelectedPlayers({});
  };

  const confirmStartMatch = async () => {
    try {
      const selectedIds = Object.keys(selectedPlayers);
      if (selectedIds.length === 0) {
        setMsg('กรุณาเลือกผู้เล่นอย่างน้อย 1 คน');
        return;
      }
      const res = await fetch('/api/startMatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: searchDate, playerIds: selectedIds }),
      });
      if (res.ok) {
        setMsg('เริ่มจัดก๊วนเรียบร้อย');
        fetchMatches();
        closeStartMatchModal();
      } else {
        setMsg('เริ่มจัดก๊วนไม่สำเร็จ');
      }
    } catch {
      setMsg('เกิดข้อผิดพลาด');
    }
  };

  // -- จับคู่ผู้เล่น functions --

  // ค้นหา กรองรายชื่อผู้เล่น
  const filteredPlayers = enabledPlayers.filter(p =>
    p.name.toLowerCase().includes(searchPlayer.toLowerCase())
  );

  // ฟังก์ชันเพิ่ม-ลบผู้เล่นจับคู่
  // ต้องจับคู่ทีละ 2 คน: ถ้าเลือกครบ 2 คน จะเพิ่มเป็นคู่ใหม่
  // ถ้าคลิกเลือกคนที่จับคู่แล้ว จะเอาคู่นั้นออกด้วย
  const toggleSelectPairPlayer = (player) => {
    // เช็คว่าผู้เล่นนี้อยู่ในคู่ไหน
    const pairIndex = selectedPairs.findIndex(pair => pair.some(p => p.id === player.id));

    if (pairIndex !== -1) {
      // ลบคู่ที่มีผู้เล่นนี้ออก
      const newPairs = [...selectedPairs];
      newPairs.splice(pairIndex, 1);
      setSelectedPairs(newPairs);
    } else {
      // ถ้าคู่ล่าสุดยังไม่เต็ม 2 คน ให้เพิ่มคนนี้เข้าไป
      if (selectedPairs.length === 0 || selectedPairs[selectedPairs.length - 1].length === 2) {
        // สร้างคู่ใหม่ 1 คน
        setSelectedPairs([...selectedPairs, [player]]);
      } else {
        // เพิ่มคนที่ 2 ให้คู่ล่าสุด
        const newPairs = [...selectedPairs];
        newPairs[newPairs.length - 1].push(player);
        setSelectedPairs(newPairs);
      }
    }
  };

  // ฟังก์ชันเช็คว่า player ถูกจับคู่แล้ว
  const isPlayerPaired = (player) => {
    return selectedPairs.some(pair => pair.some(p => p.id === player.id));
  };

  const openPairPlayersModal = () => {
    setPairPlayersModalOpen(true);
    setSearchPlayer('');
    setSelectedPairs([]);
    fetchEnabledPlayers();
  };
  const closePairPlayersModal = () => {
    setPairPlayersModalOpen(false);
    setSelectedPairs([]);
  };

  const confirmPairPlayers = async () => {
    // ตรวจสอบว่าทุกคู่มีครบ 2 คน
    for (const pair of selectedPairs) {
      if (pair.length !== 2) {
        setMsg('จับคู่แต่ละคู่ต้องมี 2 ผู้เล่น');
        return;
      }
    }

    try {
      const pairsToSend = selectedPairs.map(pair => ({
        player1Id: pair[0].id,
        player2Id: pair[1].id,
      }));

      const res = await fetch('/api/createMatchesFromPairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs: pairsToSend, date: searchDate }),
      });
      if (res.ok) {
        setMsg('จับคู่และสร้างแมตช์สำเร็จ');
        fetchMatches();
        closePairPlayersModal();
      } else {
        setMsg('จับคู่ไม่สำเร็จ');
      }
    } catch {
      setMsg('เกิดข้อผิดพลาด');
    }
  };

  return (
    <>
      <Sidebar />
      <NavbarHome />

      <main className="main-content">
        <div className="header">
          <h2>Match</h2>
          <hr />
        </div>

        <div className="controls main-controls">
          <div className="left-controls">
            <label>
              เลือกวันที่:
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                style={{ marginLeft: 10, marginRight: 20 }}
              />
            </label>
            <label>
              หัวเรื่อง:
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="กรอกหัวเรื่อง"
                style={{ marginLeft: 10 }}
              />
            </label>
          </div>

          <div className="right-controls">
            <button onClick={openStartMatchModal} className="btn-green">
              เริ่มจัดก๊วน
            </button>
            <button onClick={openPairPlayersModal} className="btn-grey" style={{ marginLeft: 10 }}>
              จับคู่ผู้เล่น
            </button>
          </div>
        </div>

        {msg && <p style={{ color: 'red' }}>{msg}</p>}

        <div className="table-container">
          <table className="match-table">
            <thead>
              <tr>
                <th>Match ID</th>
                <th>court</th>
                <th>A1</th>
                <th>A2</th>
                <th>B1</th>
                <th>B2</th>
                <th>ลูกที่ใช้/เกม</th>
                <th>ผลการแข่งขัน</th>
                <th>score</th>
                <th>status</th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center' }}>
                    ไม่มีข้อมูลแมตช์
                  </td>
                </tr>
              ) : (
                matches.map((m) => (
                  <tr key={m.matchId}>
                    <td>{m.matchId}</td>
                    <td><span className="circle">{m.court}</span></td>
                    <td><span className="circle">{m.A1}</span></td>
                    <td><span className="circle">{m.A2}</span></td>
                    <td><span className="circle">{m.B1}</span></td>
                    <td><span className="circle">{m.B2}</span></td>
                    <td className={m.ballPerGameHighlight ? 'highlight' : ''}>{m.ballPerGame}</td>
                    <td>{m.result}</td>
                    <td className={m.scoreHighlight ? 'highlight' : ''}>{m.score}</td>
                    <td>
                      <span className={`status-tag ${m.status === 'จบเกม' ? 'green' : m.status === 'เล่นอยู่' ? 'yellow' : ''}`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal เริ่มจัดก๊วน */}
      {startMatchModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>เริ่มจัดก๊วน</h3>

            <input
              type="text"
              placeholder="ค้นหาชื่อผู้เล่น..."
              value={searchPlayer}
              onChange={(e) => setSearchPlayer(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
            />

            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px', borderRadius: '6px' }}>
              {filteredPlayers.length === 0 && <p>ไม่พบผู้เล่น</p>}
              {filteredPlayers.map(p => {
                const isSelected = !!selectedPlayers[p.id];
                return (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      backgroundColor: isSelected ? '#c8e6c9' : 'transparent',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      marginBottom: '4px'
                    }}
                  >
                    <span>{p.name} (ระดับ: {p.level})</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectPlayer(p)}
                    />
                  </label>
                );
              })}
            </div>

            {Object.keys(selectedPlayers).length > 0 && (
              <>
                <h4 style={{ marginTop: '16px' }}>ผู้เล่นที่เลือก:</h4>
                <ul style={{ maxHeight: '100px', overflowY: 'auto', paddingLeft: '20px' }}>
                  {Object.values(selectedPlayers).map(p => (
                    <li key={p.id}>{p.name} (ระดับ: {p.level})</li>
                  ))}
                </ul>
              </>
            )}

            <div className="form-buttons" style={{ marginTop: '16px' }}>
              <button onClick={confirmStartMatch} className="btn-green">
                ยืนยันเริ่มจัดก๊วน
              </button>
              <button onClick={closeStartMatchModal} className="btn-red" style={{ marginLeft: '12px' }}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal จับคู่ผู้เล่น */}
      {pairPlayersModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ width: '450px' }}>
            <h3>จับคู่ผู้เล่น</h3>

            <input
              type="text"
              placeholder="ค้นหาชื่อผู้เล่น..."
              value={searchPlayer}
              onChange={(e) => setSearchPlayer(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ccc' }}
            />

            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '8px', borderRadius: '6px' }}>
              {filteredPlayers.length === 0 && <p>ไม่พบผู้เล่น</p>}
              {filteredPlayers.map(p => {
                const isSelected = isPlayerPaired(p);
                return (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      backgroundColor: isSelected ? '#c8e6c9' : 'transparent',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      marginBottom: '4px'
                    }}
                  >
                    <span>{p.name} (ระดับ: {p.level})</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectPairPlayer(p)}
                    />
                  </label>
                );
              })}
            </div>

            {selectedPairs.length > 0 && (
              <>
                <h4 style={{ marginTop: '16px' }}>คู่ที่เลือก:</h4>
                <ul style={{ maxHeight: '120px', overflowY: 'auto', paddingLeft: '20px' }}>
                  {selectedPairs.map((pair, idx) => (
                    <li key={idx}>
                      คู่ที่ {idx + 1}: {pair[0].name} &amp; {pair[1] ? pair[1].name : <em>รอจับคู่</em>}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="form-buttons" style={{ marginTop: '16px' }}>
              <button onClick={confirmPairPlayers} className="btn-green" disabled={selectedPairs.some(pair => pair.length !== 2)}>
                ยืนยันจับคู่และสร้างแมตช์
              </button>
              <button onClick={closePairPlayersModal} className="btn-red" style={{ marginLeft: '12px' }}>
                ยกเลิก
              </button>
            </div>
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
        .controls.main-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .controls.main-controls .left-controls,
        .controls.main-controls .right-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .circle {
          display: inline-block;
          width: 28px;
          height: 28px;
          line-height: 28px;
          border-radius: 50%;
          background-color: #b0b0b0;
          color: #fff;
          font-weight: 600;
          text-align: center;
          user-select: none;
        }
        .highlight {
          background-color: #ffff80;
          font-weight: 700;
        }
        .status-tag {
          padding: 4px 10px;
          border-radius: 20px;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          user-select: none;
        }
        .status-tag.green {
          background-color: #4caf50;
        }
        .status-tag.yellow {
          background-color: #fbc02d;
          color: #333;
        }
        .btn-green {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 10px 16px;
          font-size: 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .btn-green:hover {
          background-color: #45a049;
        }
        .btn-grey {
          background-color: #9e9e9e;
          color: white;
          border: none;
          padding: 10px 16px;
          font-size: 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .btn-grey:hover {
          background-color: #7e7e7e;
        }
        .btn-red {
          background-color: #f44336;
          color: white;
          border: none;
          padding: 10px 16px;
          font-size: 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .btn-red:hover {
          background-color: #d32f2f;
        }
        input[type='text'],
        input[type='number'],
        input[type='date'] {
          flex: 1;
          padding: 10px 14px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          outline: none;
          min-width: 150px;
          margin-bottom: 12px;
        }
        .table-container {
          width: 100%;
          overflow-x: auto;
        }
        table.match-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          color: #222;
          min-width: 900px;
          background-color: #2c3e50;
        }
        table.match-table th,
        table.match-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: center;
          background-color: #34495e;
          color: white;
        }
        table.match-table tbody tr:hover {
          background-color: #f5f5f5;
          color: black;
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
          z-index: 100;
        }
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          max-height: 80vh;
          overflow-y: auto;
        }
        .form-buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 12px;
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

export default Match;
