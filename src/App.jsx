import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VotingPage from './pages/VotingPage';
import CreateVotingPage from './pages/CreateVotingPage';
import VotingPageDetail from './pages/VotingPageDetail';

function App() {
  return (
    <Router>
      <div className="app fade-in">
        <header style={{background: 'rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(127,156,245,0.04)', padding: '18px 0 8px 0', marginBottom: 24, position: 'sticky', top: 0, zIndex: 10}}>
          <div className="container" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Link to="/" style={{fontWeight: 700, fontSize: '1.5rem', color: 'var(--primary-dark)', letterSpacing: '0.5px', textDecoration: 'none'}}>VoteMania</Link>
            <nav style={{display: 'flex', gap: 18}}>
              <Link to="/" className="button btn-outline-custom" style={{padding: '6px 18px', fontSize: '1rem'}}>Голосования</Link>
              <Link to="/create" className="button btn-primary-custom" style={{padding: '6px 18px', fontSize: '1rem'}}>Создать</Link>
            </nav>
          </div>
        </header>
        <main className="container" style={{flex: 1}}>
          <Routes>
            <Route path="/" element={<VotingPage />} />
            <Route path="/create" element={<CreateVotingPage />} />
            <Route path="/vote/:id" element={<VotingPageDetail />} />
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