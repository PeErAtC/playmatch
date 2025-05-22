import { useState, useEffect } from 'react';
import '../styles/globals.css'; // ถ้าคุณมีไฟล์ global CSS อยู่แล้ว

export default function MyApp({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(false);

  // โหลดสถานะ dark mode จาก localStorage เมื่อโหลดหน้า
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // ฟังก์ชันสลับโหมด
  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
      setDarkMode(true);
    }
  };

  return (
    <Component
      {...pageProps}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    />
  );
}
