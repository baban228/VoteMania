import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

function getMainColorFromGradient(gradient) {
  const match = gradient.match(/#([0-9a-fA-F]{6})/);
  return match ? `#${match[1]}` : '#fff';
}
function isColorLight(hex) {
  if (!hex.startsWith('#') || hex.length !== 7) return true;
  const r = parseInt(hex.substr(1,2),16);
  const g = parseInt(hex.substr(3,2),16);
  const b = parseInt(hex.substr(5,2),16);
  return (r*0.299 + g*0.587 + b*0.114) > 180;
}

function VotingPageDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [voting, setVoting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [links, setLinks] = useState([]);
  const [linkInput, setLinkInput] = useState('');
  const [currentLink, setCurrentLink] = useState(0);

  useEffect(() => {
    fetch(`/voting/api/votings/${id}/`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => {
        setVoting(data.voting || null);
        setLinks(data.voting && data.voting.links ? data.voting.links : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.toString());
        setLoading(false);
      });
  }, [id]);

  const gradient = location.state?.gradient || 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)';
  const mainColor = useMemo(() => getMainColorFromGradient(gradient), [gradient]);
  const isLight = useMemo(() => isColorLight(mainColor), [mainColor]);
  const textColor = isLight ? '#222' : '#fff';
  const textShadow = isLight ? '0 2px 8px rgba(255,255,255,0.25)' : '0 2px 8px rgba(0,0,0,0.25)';

  const [now, setNow] = useState(Date.now());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  let timeLeft = null;
  if (voting && voting.deadline) {
    const deadline = new Date(voting.deadline).getTime();
    const diff = deadline - now;
    if (diff > 0) {
      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      timeLeft = `${hours > 0 ? hours + 'ч ' : ''}${minutes}м ${seconds}с`;
    } else {
      timeLeft = 'Завершено';
    }
  }

  const handleAddLink = (e) => {
    e.preventDefault();
    if (linkInput.trim()) {
      setLinks(prev => {
        const newLinks = [...prev, { url: linkInput.trim() }];
        setCurrentLink(newLinks.length - 1);
        return newLinks;
      });
      setLinkInput('');
    }
  };

  const handlePrev = () => setCurrentLink((prev) => (prev > 0 ? prev - 1 : links.length - 1));
  const handleNext = () => setCurrentLink((prev) => (prev < links.length - 1 ? prev + 1 : 0));

  const getPlaceName = (url) => url ? `Место ${links.findIndex(l => l.url === url) + 1}` : '';
  const getPlacePhoto = (url) => url ? 'https://via.placeholder.com/120x80?text=Фото' : '';

  if (loading) return <div style={{padding: 32}}>Загрузка...</div>;
  if (error) return <div style={{padding: 32, color: 'red'}}>Ошибка: {error}</div>;
  if (!voting) return <div style={{padding: 32}}>Голосование не найдено</div>;

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: gradient,
        transition: 'background 0.7s cubic-bezier(.4,0,.2,1)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        color: textColor,
        textShadow,
      }}
    >
      <div style={{
        display: 'flex',
        gap: 32,
        minHeight: '60vh',
        padding: '48px 16px',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        zIndex: 1,
        boxSizing: 'border-box',
      }}>
        {/* Левая колонка: ссылки */}
        <div style={{minWidth: 180, maxWidth: 220, flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: 18}}>
          <h4 style={{marginBottom: 8, color: textColor, textShadow}}>Ссылки</h4>
          <form onSubmit={handleAddLink} style={{display: 'flex', gap: 6, marginBottom: 0}}>
            <input
              type="url"
              placeholder="Вставьте ссылку на место"
              value={linkInput}
              onChange={e => setLinkInput(e.target.value)}
              style={{flex: 1, borderRadius: 8, border: '1.5px solid #e2e8f0', padding: 8, fontSize: 15, background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.15)', color: textColor}}
            />
            <button type="submit" style={{borderRadius: 8, background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.22)', color: textColor, border: isLight ? '1.5px solid #ddd' : '1.5px solid #fff', fontWeight: 600, fontSize: 18, boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.10)' : '0 2px 8px rgba(255,255,255,0.10)', textShadow}}>+</button>
          </form>
          {links.length > 0 && (
            <div style={{marginTop: 18, background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.18)', borderRadius: 10, boxShadow: '0 2px 8px rgba(100,116,139,0.06)', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 8}}>
              <div style={{fontWeight: 600, color: textColor, fontSize: 15, marginBottom: 4, textShadow}}>Добавленные места:</div>
              {links.map((l, i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, background: currentLink === i ? (isLight ? 'var(--accent)' : 'rgba(255,255,255,0.18)') : (isLight ? '#f8fafc' : 'rgba(0,0,0,0.10)'), borderRadius: 6, padding: '4px 8px', cursor: 'pointer', transition: 'background 0.2s'}} onClick={() => setCurrentLink(i)}>
                  <span style={{fontWeight: 500, color: currentLink === i ? '#fff' : textColor, fontSize: 14, textShadow}}>{getPlaceName(l.url)}</span>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" style={{marginLeft: 'auto', color: currentLink === i ? '#fff' : textColor, fontSize: 13, textDecoration: 'underline', textShadow}}>Открыть</a>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Центр: прямоугольник */}
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0}}>
          <div style={{
            width: '100%',
            maxWidth: 340,
            height: 270,
            background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.22)',
            borderRadius: 22,
            boxShadow: '0 4px 24px rgba(100,116,139,0.10)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: textColor,
            fontSize: 22,
            position: 'relative',
            padding: 24,
            transition: 'background 0.3s',
            backdropFilter: 'blur(2px)',
            boxSizing: 'border-box',
            textShadow,
          }}>
            {links.length > 0 ? (
              <>
                <div style={{fontWeight: 700, fontSize: 22, color: textColor, marginBottom: 10, textAlign: 'center', letterSpacing: 0.5, textShadow}}>{getPlaceName(links[currentLink]?.url)}</div>
                <img src={getPlacePhoto(links[currentLink]?.url)} alt="Фото места" style={{width: 160, height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 16, background: '#e2e8f0', boxShadow: '0 2px 8px rgba(100,116,139,0.10)'}} />
                <div style={{display: 'flex', gap: 22, marginBottom: 10}}>
                  <button style={{background: isLight ? '#38a169' : 'rgba(56,161,105,0.85)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 600, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(56,161,105,0.10)', textShadow}}>За</button>
                  <button style={{background: isLight ? '#e53e3e' : 'rgba(229,62,62,0.85)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 600, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(229,62,62,0.10)', textShadow}}>Против</button>
                </div>
                {links.length > 1 && (
                  <>
                    <button onClick={handlePrev} style={{position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: isLight ? '#fff' : 'rgba(0,0,0,0.22)', border: '1.5px solid #e2e8f0', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(100,116,139,0.10)', color: textColor, textShadow}}>&lt;</button>
                    <button onClick={handleNext} style={{position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: isLight ? '#fff' : 'rgba(0,0,0,0.22)', border: '1.5px solid #e2e8f0', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(100,116,139,0.10)', color: textColor, textShadow}}>&gt;</button>
                  </>
                )}
              </>
            ) : (
              <span style={{color: '#cbd5e1', fontSize: 18, textShadow}}>Добавьте ссылку на место</span>
            )}
          </div>
        </div>
        {/* Правая колонка: участники */}
        <div style={{minWidth: 160, maxWidth: 200, flex: '0 0 180px', display: 'flex', flexDirection: 'column', gap: 18}}>
          <h4 style={{marginBottom: 8, color: textColor, textShadow}}>Участники</h4>
          <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
            {mockFriends.map(f => (
              <li key={f.id} style={{margin: '8px 0', display: 'flex', alignItems: 'center', gap: 8}}>
                <div style={{width: 28, height: 28, borderRadius: '50%', background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: textColor, textShadow}}>
                  {f.username[0]}
                </div>
                <span style={{fontSize: 15, color: textColor, textShadow}}>{f.username}</span>
              </li>
            ))}
          </ul>
          <button
            style={{borderRadius: 8, background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.22)', color: textColor, border: isLight ? '1.5px solid #ddd' : '1.5px solid #fff', padding: '8px 0', fontWeight: 600, marginTop: 8, fontSize: 15, textShadow}}
            onClick={() => setShowAddFriends(true)}
          >
            + Добавить друзей
          </button>
          {showAddFriends && (
            <div style={{marginTop: 10, background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.18)', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, boxShadow: '0 2px 8px rgba(100,116,139,0.08)', color: textColor, textShadow}}>Форма добавления друзей (заглушка)</div>
          )}
        </div>
      </div>
      {/* Таймер вынесен вниз страницы */}
      {voting.deadline && (
        <div style={{
          width: '100%',
          maxWidth: 1200,
          margin: '32px auto 0 auto',
          textAlign: 'center',
          fontSize: '1.18rem',
          fontWeight: 600,
          color: textColor,
          textShadow,
          background: isLight ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
          borderRadius: 14,
          padding: '16px 0',
          boxShadow: '0 2px 8px rgba(100,116,139,0.08)',
        }}>
          {timeLeft ? `До окончания голосования: ${timeLeft}` : ''}
        </div>
      )}
    </div>
  );
}

// Моковые участники для отображения справа (оставим как было)
const mockFriends = [
  { id: 1, username: 'Иван' },
  { id: 2, username: 'Мария' },
  { id: 3, username: 'Петр' },
];

export default VotingPageDetail;
