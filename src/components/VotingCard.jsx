import React from 'react';
import { Link } from 'react-router-dom';

function VotingCard({ voting }) {
  // Определяем статус для бейджа
  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <span className="badge bg-secondary">Завершено</span>;
    }
    return <span className="badge badge-custom">Активно</span>;
  };

  return (
    <div className="voting-card">
      {voting.imageUrl && (
        <img
          src={voting.imageUrl}
          alt={voting.title}
          className="voting-image w-100"
        />
      )}
      <div className="voting-content">
        <h4 className="voting-title">{voting.title}</h4>
        <div className="voting-meta">
          <span><i className="fas fa-users me-1"></i> {voting.participantsCount} участника</span>
          {voting.daysLeft !== undefined && (
            <span><i className="fas fa-clock me-1"></i> {voting.daysLeft} дня осталось</span>
          )}
        </div>
        <p>{voting.description}</p>
        <div className="d-flex justify-content-between align-items-center">
          {getStatusBadge(voting.status)}
          <div>
            <button className="btn btn-sm btn-outline-custom me-2">
              <i className="fas fa-share me-1"></i> Поделиться
            </button>
            {voting.status === 'completed' ? (
              <button className="btn btn-sm btn-primary-custom">
                <i className="fas fa-chart-bar me-1"></i> Результаты
              </button>
            ) : (
              <Link to={`/vote/${voting.id}`} className="btn btn-sm btn-primary-custom">
                <i className="fas fa-vote-yea me-1"></i> Голосовать
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VotingCard;