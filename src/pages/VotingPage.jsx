import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VotingCard from '../components/VotingCard';

// TODO: В будущем заменить на реальные данные из API
// Моковые данные для демонстрации
const mockVotings = [
  // {
  //   id: 1,
  //   title: "Лучший фильм 2025 года",
  //   description: "Голосование за лучший фильм этого года. Участвуют все новинки кинопроката.",
  //   participantsCount: 42,
  //   daysLeft: 3,
  //   status: "active", // или "completed"
  //   imageUrl: "/images/voting1.jpg" // Путь к изображению
  // },
  // {
  //   id: 2,
  //   title: "Куда поехать на выходные?",
  //   description: "Выбираем место для поездки на ближайшие выходные.",
  //   participantsCount: 18,
  //   daysLeft: 1,
  //   status: "active",
  //   imageUrl: "/images/voting2.jpg"
  // }
];

function VotingPage() {
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Заменить на реальный API вызов
    // fetchVotings()
    //   .then(data => {
    //     setVotings(data);
    //     setLoading(false);
    //   })
    //   .catch(err => {
    //     setError(err.message);
    //     setLoading(false);
    //   });

    // Пока используем моковые данные
    setTimeout(() => {
      setVotings(mockVotings);
      setLoading(false);
    }, 500); // Имитация загрузки
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
        <Link to="/create" className="btn btn-primary">
          <i className="fas fa-plus-circle me-2"></i>Создать новое голосование
        </Link>
      </div>

      {votings.length > 0 ? (
        <div className="row">
          {votings.map(voting => (
            <div className="col-md-6 mb-4" key={voting.id}>
              <VotingCard voting={voting} />
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