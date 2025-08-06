import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VotingPage from './pages/VotingPage';
import CreateVotingPage from './pages/CreateVotingPage';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<VotingPage />} />
          <Route path="/create" element={<CreateVotingPage />} />
          {/* Можно добавить маршрут для редактирования голосования, если нужно */}
          {/* <Route path="/edit/:id" element={<CreateVotingPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;