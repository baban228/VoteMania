import React, { useState } from 'react';
import FriendSelector from './FriendSelector';

function CreateVotingForm({ friends, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '', // Новое поле
    // selectedFriends: [],
    // location: ''
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
    if (!formData.deadline) {
      newErrors.deadline = 'Укажите дату и время окончания';
    }

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
    <form className="create-voting-form" style={{
      maxWidth: '600px',
      margin: '0 auto',
      background: 'var(--card-bg)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow)',
      padding: '40px 32px',
      minWidth: '320px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '22px',
    }} onSubmit={handleSubmit}>
      <div className="mb-3" style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <label htmlFor="title" className="form-label" style={{fontWeight: 600, color: 'var(--primary-dark)'}}>Название голосования *</label>
        <input
          type="text"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Введите название голосования"
          style={{border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px', fontSize: '1.08rem', background: '#f8fafc'}}
        />
        {errors.title && <div className="invalid-feedback" style={{color: '#e53e3e'}}>{errors.title}</div>}
      </div>

      <div className="mb-3" style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <label htmlFor="description" className="form-label" style={{fontWeight: 600, color: 'var(--primary-dark)'}}>Описание</label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          placeholder="Опишите суть голосования"
          style={{resize: 'vertical', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px', fontSize: '1.08rem', background: '#f8fafc'}}
        ></textarea>
      </div>

      {/* Новое поле: дата и время окончания */}
      <div className="mb-3" style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <label htmlFor="deadline" className="form-label" style={{fontWeight: 600, color: 'var(--primary-dark)'}}>Дата и время окончания *</label>
        <input
          type="datetime-local"
          className={`form-control ${errors.deadline ? 'is-invalid' : ''}`}
          id="deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          style={{border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px', fontSize: '1.08rem', background: '#f8fafc'}}
        />
        {errors.deadline && <div className="invalid-feedback" style={{color: '#e53e3e'}}>{errors.deadline}</div>}
      </div>

      <div className="d-flex justify-content-between" style={{gap: 12, marginTop: 12}}>
        <button
          type="button"
          className="btn btn-outline-secondary"
          style={{minWidth: 120, borderRadius: 'var(--radius)', fontWeight: 500}}
          onClick={() => window.history.back()}
        >
          Отмена
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          style={{minWidth: 180, borderRadius: 'var(--radius)', fontWeight: 600, background: 'var(--primary)', border: 'none'}}
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