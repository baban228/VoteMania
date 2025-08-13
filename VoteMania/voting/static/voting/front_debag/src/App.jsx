import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VotingPage from './pages/VotingPage';
import CreateVotingPage from './pages/CreateVotingPage';
import VotingPageDetail from './pages/VotingPageDetail';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/user/api/current/', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data);
      });
  }, []);

  return (
    <Router basename="/voting">
      <div className="app fade-in">
        <header style={{background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(127,156,245,0.04)', padding: '18px 0 8px 0', marginBottom: 24, position: 'sticky', top: 0, zIndex: 10}}>
          <div className="container" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            {/* Левая часть: кнопка Главная */}
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <a href="/" className="button btn-outline-custom" style={{padding: '6px 18px', fontSize: '1rem', fontWeight: 600}}>Главная</a>
              <a href="/" style={{fontWeight: 700, fontSize: '1.5rem', color: 'var(--primary-dark)', letterSpacing: '0.5px', textDecoration: 'none', marginLeft: 12}}>VoteMania</a>
            </div>
            {/* Центр: навигация */}
            <nav style={{display: 'flex', gap: 18}}>
              <Link to="/" className="button btn-outline-custom" style={{padding: '6px 18px', fontSize: '1rem'}}>Голосования</Link>
              <Link to="/create" className="button btn-primary-custom" style={{padding: '6px 18px', fontSize: '1rem'}}>Создать</Link>
            </nav>
            {/* Правая часть: аватарка с ником */}
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <a href="/user/" className="profile-btn">
                <img
                  src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.username || 'User') + "&background=6C63FF&color=fff&rounded=true&size=36"}
                  alt="avatar"
                  className="profile-btn-avatar"
                />
                <span>{user?.username || 'UserName'}</span>
              </a>
            </div>
          </div>
        </header>
        <main className="container" style={{flex: 1}}>
          <Routes>
            <Route path="/" element={<VotingPage user={user} />} />
            <Route path="/create" element={<CreateVotingPage />} />
            <Route path="/vote/:id" element={<VotingPageDetail user={user} />} />
          </Routes>
        </main>
        <Link to="/create" className="fab-create" title="Создать голосование">
          <span>+</span>
        </Link>
        <footer style={{textAlign: 'center', color: '#a0aec0', fontSize: '0.98rem', padding: '18px 0 8px 0'}}>
          © {new Date().getFullYear()} VoteMania. Все права защищены.
        </footer>
      </div>
    </Router>
  );
}

export default App;