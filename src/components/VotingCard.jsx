import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Более насыщенные градиенты
function getRandomGradient(seed) {
  const gradients = [
    'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fcb69f 0%, #ff6e7f 100%)',
    'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
    'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    'linear-gradient(135deg, #fd6e6a 0%, #ffc600 100%)',
    'linear-gradient(135deg, #00c3ff 0%, #ffff1c 100%)',
    'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)',
    'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
    'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % gradients.length;
  return gradients[Math.abs(hash) % gradients.length];
}

// Получить основной цвет из градиента (первый цвет)
function getMainColorFromGradient(gradient) {
  const match = gradient.match(/#([0-9a-fA-F]{6})/);
  return match ? `#${match[1]}` : '#fff';
}
// Определить, светлый ли цвет (для выбора цвета текста)
function isColorLight(hex) {
  if (!hex.startsWith('#') || hex.length !== 7) return true;
  const r = parseInt(hex.substr(1,2),16);
  const g = parseInt(hex.substr(3,2),16);
  const b = parseInt(hex.substr(5,2),16);
  // Яркость по формуле WCAG
  return (r*0.299 + g*0.587 + b*0.114) > 180;
}

function VotingCard({ voting, onDelete }) {
  const [open, setOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const navigate = useNavigate();
  const shortTitle =
    voting.title.length > 8
      ? voting.title.slice(0, 8) + '…'
      : voting.title;

  // Мемоизация градиента для стабильности цвета
  const gradient = useMemo(() => getRandomGradient(String(voting.id || voting.title)), [voting.id, voting.title]);
  const mainColor = useMemo(() => getMainColorFromGradient(gradient), [gradient]);
  const isLight = useMemo(() => isColorLight(mainColor), [mainColor]);
  const textColor = isLight ? '#222' : '#fff';
  const textShadow = isLight ? '0 2px 8px rgba(255,255,255,0.25)' : '0 2px 8px rgba(0,0,0,0.25)';

  // Таймер до окончания голосования
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  let timeLeft = null;
  let isFinished = false;
  if (voting.deadline) {
    const deadline = new Date(voting.deadline).getTime();
    const diff = deadline - now;
    if (diff > 0) {
      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      timeLeft = `${hours > 0 ? hours + 'ч ' : ''}${minutes}м ${seconds}с`;
    } else {
      timeLeft = 'Завершено';
      isFinished = true;
    }
  }

  const handleView = (e) => {
    e.stopPropagation();
    setOpen(false);
    // Передаём градиент через state для модального окна
    navigate(`/vote/${voting.id}`, { state: { gradient } });
  };

  return (
    <>
      <div
        className="voting-card voting-card-square fade-in"
        tabIndex={0}
        onClick={() => !isFinished && setOpen(true)}
        style={{
          outline: open ? '2px solid var(--primary)' : 'none',
          background: gradient,
          color: textColor,
          boxShadow: '0 4px 24px rgba(100,116,139,0.10)',
          border: 'none',
          textShadow,
          transition: 'color 0.2s, text-shadow 0.2s, filter 0.2s',
          filter: isFinished ? 'grayscale(0.25) brightness(1.15) opacity(0.55)' : 'none',
          position: 'relative',
          cursor: isFinished ? 'not-allowed' : 'pointer',
        }}
      >
        {/* Кнопка удаления */}
        <button
          onClick={e => { e.stopPropagation(); setShowDelete(true); }}
          title="Удалить голосование"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: isFinished ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.85)',
            color: '#e53e3e',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            fontSize: 18,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            zIndex: 10,
            display: 'block',
            transition: 'background 0.2s',
            outline: 'none',
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: isFinished ? '#e53e3e' : 'transparent',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:'block',margin:'0 auto'}}>
            <circle cx="8" cy="8" r="7" stroke="#e53e3e" strokeWidth="2" fill="none"/>
            <line x1="5" y1="5" x2="11" y2="11" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round"/>
            <line x1="11" y1="5" x2="5" y2="11" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="voting-card-title" style={{color: textColor, textShadow, textDecoration: isFinished ? 'line-through' : 'none', position: 'relative'}}>
          {shortTitle}
          {isFinished && (
            <span style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: 0,
              borderTop: '2.5px solid #e53e3e',
              zIndex: 2,
              pointerEvents: 'none',
              opacity: 0.7,
            }}></span>
          )}
        </div>
        {isFinished && (
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#e53e3e',
            letterSpacing: 1,
            textShadow: '0 2px 8px #fff',
            pointerEvents: 'none',
            zIndex: 3,
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 8,
            padding: '2px 8px',
            margin: '0 auto',
            width: 'fit-content',
          }}>не актуально</div>
        )}
        {voting.deadline && (
          <div style={{fontSize: '1.02rem', fontWeight: 500, marginTop: 6, color: textColor, textShadow, textAlign: 'center'}}>
            {timeLeft ? `До окончания: ${timeLeft}` : ''}
          </div>
        )}
      </div>
      {open && (
        <div className="voting-modal-overlay" onClick={() => setOpen(false)}>
          <div
            className="voting-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: gradient,
              color: textColor,
              boxShadow: '0 8px 40px rgba(30,41,59,0.18)',
              textShadow,
              transition: 'color 0.2s, text-shadow 0.2s',
            }}
          >
            <button
              className="voting-modal-close"
              onClick={() => setOpen(false)}
              title="Закрыть"
              style={{color: isLight ? '#222' : '#fff', textShadow}}
            >
              ×
            </button>
            <div className="voting-modal-title" style={{color: textColor, textShadow}}>{voting.title}</div>
            {voting.deadline && (
              <div style={{fontSize: '1.08rem', fontWeight: 500, marginBottom: 8, color: textColor, textShadow, textAlign: 'center'}}>
                {timeLeft ? `До окончания: ${timeLeft}` : ''}
              </div>
            )}
            <div className="voting-modal-desc" style={{color: isLight ? '#222' : '#f8fafc', textShadow}}>
              {voting.description || 'Нет описания'}
            </div>
            <button
              className="btn btn-primary"
              style={{
                marginTop: 16,
                minWidth: 120,
                background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.22)',
                color: isLight ? '#222' : '#fff',
                border: isLight ? '1.5px solid #ddd' : '1.5px solid #fff',
                boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.10)' : '0 2px 8px rgba(255,255,255,0.10)',
                fontWeight: 700,
                textShadow,
                transition: 'background 0.2s, color 0.2s, border 0.2s',
              }}
              onClick={handleView}
            >
              Просмотр
            </button>
          </div>
        </div>
      )}
      {/* Модальное окно подтверждения удаления */}
      {showDelete && (
        <div className="voting-modal-overlay" onClick={() => setShowDelete(false)}>
          <div
            className="voting-modal"
            onClick={e => e.stopPropagation()}
            style={{maxWidth: 340, textAlign: 'center', padding: 32}}
          >
            <div style={{fontWeight: 700, fontSize: 20, marginBottom: 18}}>Вы точно хотите удалить?</div>
            <div style={{display: 'flex', gap: 18, justifyContent: 'center'}}>
              <button
                className="btn btn-primary"
                style={{background: '#e53e3e', color: '#fff', minWidth: 90, borderRadius: 8, fontWeight: 600}}
                onClick={() => { setShowDelete(false); onDelete && onDelete(voting.id); }}
              >Удалить</button>
              <button
                className="btn btn-outline-secondary"
                style={{minWidth: 90, borderRadius: 8, fontWeight: 500}}
                onClick={() => setShowDelete(false)}
              >Отмена</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VotingCard;