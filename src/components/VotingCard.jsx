import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function VotingCard({ voting }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const shortTitle =
    voting.title.length > 8
      ? voting.title.slice(0, 8) + '…'
      : voting.title;

  const handleView = (e) => {
    e.stopPropagation();
    setOpen(false);
    navigate(`/vote/${voting.id}`);
  };

  return (
    <>
      <div
        className="voting-card voting-card-square fade-in"
        tabIndex={0}
        onClick={() => setOpen(true)}
        style={{ outline: open ? '2px solid var(--primary)' : 'none' }}
      >
        <div className="voting-card-title">{shortTitle}</div>
      </div>
      {open && (
        <div className="voting-modal-overlay" onClick={() => setOpen(false)}>
          <div className="voting-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="voting-modal-close"
              onClick={() => setOpen(false)}
              title="Закрыть"
            >
              ×
            </button>
            <div className="voting-modal-title">{voting.title}</div>
            <div className="voting-modal-desc">
              {voting.description || 'Нет описания'}
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 16, minWidth: 120 }}
              onClick={handleView}
            >
              Просмотр
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default VotingCard;