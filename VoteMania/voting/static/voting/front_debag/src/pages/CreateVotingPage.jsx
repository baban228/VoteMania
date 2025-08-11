import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FriendSelector from '../components/FriendSelector';
import CreateVotingForm from '../components/CreateVotingForm';

// TODO: В будущем заменить на реальные данные из API
// Моковые данные друзей для демонстрации
const mockFriends = [
  // { id: 1, username: "Александр Петров", avatar: "/path/to/avatar1.jpg" },
  // { id: 2, username: "Мария Иванова", avatar: "/path/to/avatar2.jpg" },
  // { id: 3, username: "Дмитрий Сидоров", avatar: "/path/to/avatar3.jpg" }
];

function CreateVotingPage() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Заменить на реальный API вызов
    // fetchFriends()
    //   .then(data => {
    //     setFriends(data);
    //     setLoading(false);
    //   })
    //   .catch(err => {
    //     setError(err.message);
    //     setLoading(false);
    //   });

    // Пока используем моковые данные
    setTimeout(() => {
      setFriends(mockFriends);
      setLoading(false);
    }, 500); // Имитация загрузки
  }, []);

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('/voting/api/votings/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline,
          participants: formData.selectedFriends || [],
        }),
      });
      if (!response.ok) throw new Error('Ошибка создания голосования');
      navigate('/');
    } catch (err) {
      alert(err.message || 'Ошибка');
    }
  };

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
    <div className="container py-4" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh'}}>
      <div className="d-flex justify-content-between align-items-center mb-4" style={{width: '100%', maxWidth: 700}}>
        <h1 className="h3 fw-bold">Создать голосование</h1>
        <Link to="/" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-1"></i> Назад
        </Link>
      </div>
      <div style={{width: '100%', maxWidth: 700, display: 'flex', justifyContent: 'center'}}>
        <div style={{width: '100%'}}>
          <div className="card" style={{padding: 0, boxShadow: 'var(--shadow)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: '100%'}}>
            <div className="card-body" style={{padding: 0}}>
              <CreateVotingForm
                friends={friends}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateVotingPage;