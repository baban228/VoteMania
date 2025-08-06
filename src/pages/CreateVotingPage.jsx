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
    // TODO: Заменить на реальный API вызов
    // try {
    //   const response = await fetch('/api/votings/', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       // Добавьте токен авторизации, если требуется
    //       // 'Authorization': `Bearer ${token}`
    //     },
    //     body: JSON.stringify(formData)
    //   });
    //
    //   if (response.ok) {
    //     const newVoting = await response.json();
    //     // Перенаправляем на страницу созданного голосования или на список
    //     navigate(`/vote/${newVoting.id}`); // или navigate('/');
    //   } else {
    //     // Обработка ошибок
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || 'Ошибка при создании голосования');
    //   }
    // } catch (err) {
    //   setError(err.message);
    // }

    // Для демонстрации просто покажем alert и перейдем на главную
    alert('Голосование создано! (Демонстрация)');
    navigate('/');
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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold">Создать голосование</h1>
        <Link to="/" className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-1"></i> Назад
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
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