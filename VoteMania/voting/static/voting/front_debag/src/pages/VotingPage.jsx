import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VotingCard from '../components/VotingCard';

const STORAGE_KEY = 'votemania_votings';

function VotingPage() {
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Получаем голосования из localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    const loaded = stored ? JSON.parse(stored) : [];
    // Сортировка: сначала активные, потом завершённые
    const now = Date.now();
    const active = [];
    const finished = [];
    for (const v of loaded) {
      if (v.deadline) {
        const deadline = new Date(v.deadline).getTime();
        if (deadline > now) {
          active.push(v);
        } else {
          finished.push(v);
        }
      } else {
        active.push(v);
      }
    }
    setVotings([...active, ...finished]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          Ошибка загрузки: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold">Мои голосования</h1>
      </div>
      {votings.length > 0 ? (
        <div className="row">
          {votings.map(voting => (
            <div className="col-md-6 mb-4" key={voting.id}>
              <VotingCard voting={voting} onDelete={id => {
                const updated = votings.filter(v => v.id !== id);
                setVotings(updated);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
              }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-poll fa-3x text-muted"></i>
          </div>
          <h3 className="mb-3">У вас пока нет голосований</h3>
          <p className="text-muted mb-4">Создайте свое первое голосование, чтобы начать принимать решения вместе с друзьями.</p>
          <Link to="/create" className="btn btn-primary btn-lg">
            <i className="fas fa-plus-circle me-2"></i>Создать голосование
          </Link>
        </div>
      )}
    </div>
  );
}

export default VotingPage;