import React, { useState } from 'react';
import FriendSelector from './FriendSelector';

function CreateVotingForm({ friends, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    // selectedFriends: [], // Для выбора участников
    // deadline: '', // Дата окончания
    // location: '' // Ссылка на Яндекс.Карты
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFriendsChange = (selectedFriends) => {
    setFormData(prev => ({
      ...prev,
      selectedFriends
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название голосования обязательно';
    }

    // Можно добавить другие проверки:
    // if (!formData.deadline) {
    //   newErrors.deadline = 'Укажите дату окончания';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      setIsSubmitting(true);
      onSubmit(formData)
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="title" className="form-label">Название голосования *</label>
        <input
          type="text"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Введите название голосования"
        />
        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="description" className="form-label">Описание</label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          placeholder="Опишите суть голосования"
        ></textarea>
      </div>

      {/* Выбор друзей (если нужно) */}
      {/* 
      <div className="mb-3">
        <label className="form-label">Пригласить друзей</label>
        <FriendSelector
          friends={friends}
          selectedFriends={formData.selectedFriends || []}
          onChange={handleFriendsChange}
        />
      </div>
      */}

      {/* Дата окончания (если нужно) */}
      {/* 
      <div className="mb-3">
        <label htmlFor="deadline" className="form-label">Дата окончания</label>
        <input
          type="datetime-local"
          className={`form-control ${errors.deadline ? 'is-invalid' : ''}`}
          id="deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
        />
        {errors.deadline && <div className="invalid-feedback">{errors.deadline}</div>}
      </div>
      */}

      {/* Ссылка на Яндекс.Карты (если нужно) */}
      {/* 
      <div className="mb-3">
        <label htmlFor="location" className="form-label">Место встречи (ссылка на Яндекс.Карты)</label>
        <input
          type="url"
          className="form-control"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="https://yandex.ru/maps/..."
        />
        <div className="form-text">Вставьте ссылку на место встречи из Яндекс.Карт</div>
      </div>
      */}

      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => window.history.back()}
        >
          Отмена
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Создание...
            </>
          ) : (
            <>
              <i className="fas fa-plus-circle me-2"></i>Создать голосование
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default CreateVotingForm;