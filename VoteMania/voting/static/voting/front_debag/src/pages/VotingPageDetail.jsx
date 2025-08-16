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

function VotingPageDetail({ user }) {
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
  const [friends, setFriends] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState(null);
  const [friendSearch, setFriendSearch] = useState('');
  // Состояние для отслеживания голосов пользователя
  const [userVotes, setUserVotes] = useState({});
  // Состояние для общих результатов голосования
  const [voteResults, setVoteResults] = useState({});

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
        
        // Загружаем результаты голосования
        loadVoteResults();
      })
      .catch(err => {
        setError(err.toString());
        setLoading(false);
      });
  }, [id]);

  // Загрузка друзей
  useEffect(() => {
    setFriendsLoading(true);
    fetch(`/voting/api/votings/${id}/friends/`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => {
        setParticipants(data.participants || []);
        setFriends(data.friends || []);
        setFriendsLoading(false);
      })
      .catch(err => {
        setFriendsError(err.toString());
        setFriendsLoading(false);
      });
  }, [id, showAddFriends]);

  // Загрузка результатов голосования
  const loadVoteResults = async () => {
    try {
      const response = await fetch(`/voting/api/votings/${id}/votes/`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setVoteResults(data.results || {});
        setUserVotes(data.user_votes || {});
      }
    } catch (err) {
      console.error('Ошибка загрузки результатов голосования:', err);
    }
  };

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

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (linkInput.trim()) {
      try {
        const response = await fetch(`/voting/api/votings/${id}/links/`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ url: linkInput.trim() })
        });
        
        if (response.ok) {
          const data = await response.json();
          setLinks(prev => {
            const newLinks = [...prev, { url: linkInput.trim(), id: data.link_id }];
            setCurrentLink(newLinks.length - 1);
            return newLinks;
          });
          setLinkInput('');
        } else {
          const data = await response.json();
          alert(data.error || 'Ошибка добавления ссылки');
        }
      } catch (err) {
        alert('Ошибка добавления ссылки: ' + err.message);
      }
    }
  };

  const handlePrev = () => setCurrentLink((prev) => (prev > 0 ? prev - 1 : links.length - 1));
  const handleNext = () => setCurrentLink((prev) => (prev < links.length - 1 ? prev + 1 : 0));

  const getPlaceName = (index) => {
    return `Место ${index + 1}`;
  };

  // Функция для голосования
  const handleVote = async (linkIndex, voteType) => {
    const linkId = links[linkIndex]?.id;
    if (!linkId) return;

    try {
      const response = await fetch(`/voting/api/votings/${id}/vote/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          link_id: linkId, 
          vote: voteType // 'for' или 'against'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Обновляем результаты голосования
        setVoteResults(prev => ({
          ...prev,
          [linkId]: data.results
        }));
        
        // Обновляем голос пользователя
        setUserVotes(prev => ({
          ...prev,
          [linkId]: voteType
        }));
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка голосования');
      }
    } catch (err) {
      alert('Ошибка голосования: ' + err.message);
    }
  };

  // Добавить друга в участники
  const handleInviteFriend = async (userId) => {
    try {
      const res = await fetch(`/voting/api/votings/${id}/friends/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
        setFriends(friends => friends.map(f => f.id === userId ? { ...f, is_participant: true } : f));
      } else {
        const data = await res.json();
        alert(data.error || 'Ошибка добавления');
      }
    } catch (e) {
      alert('Ошибка добавления: ' + e.message);
    }
  };

  // Удалить друга из участников
  const handleRemoveFriend = async (userId) => {
    try {
      const res = await fetch(`/voting/api/votings/${id}/friends/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
        setFriends(friends => friends.map(f => f.id === userId ? { ...f, is_participant: false } : f));
      } else {
        const data = await res.json();
        alert(data.error || 'Ошибка удаления');
      }
    } catch (e) {
      alert('Ошибка удаления: ' + e.message);
    }
  };

  if (loading) return <div style={{padding: 32}}>Загрузка...</div>;
  if (error) return <div style={{padding: 32, color: 'red'}}>Ошибка: {error}</div>;
  if (!voting) return <div style={{padding: 32}}>Голосование не найдено</div>;

  // Получаем id создателя
  const creatorId = friends.find(f => f.is_creator)?.id;
  const isCreator = user && creatorId && user.id === creatorId;

  // Получаем результаты для текущего места
  const currentLinkId = links[currentLink]?.id;
  const currentResults = currentLinkId ? voteResults[currentLinkId] || { for: 0, against: 0 } : { for: 0, against: 0 };
  const userVote = currentLinkId ? userVotes[currentLinkId] : null;

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
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
              {links.map((l, i) => {
                const linkResults = l.id ? voteResults[l.id] || { for: 0, against: 0 } : { for: 0, against: 0 };
                const totalVotes = linkResults.for + linkResults.against;
                
                return (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, background: currentLink === i ? (isLight ? 'var(--accent)' : 'rgba(255,255,255,0.18)') : (isLight ? '#f8fafc' : 'rgba(0,0,0,0.10)'), borderRadius: 6, padding: '4px 8px', cursor: 'pointer', transition: 'background 0.2s'}} onClick={() => setCurrentLink(i)}>
                    <span style={{fontWeight: 500, color: currentLink === i ? '#fff' : textColor, fontSize: 14, textShadow}}>{getPlaceName(i)}</span>
                    {totalVotes > 0 && (
                      <span style={{fontSize: 12, color: isLight ? '#666' : '#ccc', marginLeft: 'auto'}}>
                        {linkResults.for} / {linkResults.against}
                      </span>
                    )}
                    <a href={l.url} target="_blank" rel="noopener noreferrer" style={{color: currentLink === i ? '#fff' : textColor, fontSize: 13, textDecoration: 'underline', textShadow}}>Открыть</a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Центр: прямоугольник */}
        <div style={{flex: '1 1 0', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0}}>
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
                <div style={{fontWeight: 700, fontSize: 22, color: textColor, marginBottom: 10, textAlign: 'center', letterSpacing: 0.5, textShadow}}>
                  {getPlaceName(currentLink)}
                </div>
                <div style={{marginBottom: 16, textAlign: 'center'}}>
                  <a 
                    href={links[currentLink]?.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      background: isLight ? '#3182ce' : 'rgba(49, 130, 206, 0.85)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 20px',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(49, 130, 206, 0.2)',
                      textDecoration: 'none',
                    }}
                  >
                    Открыть ссылку
                  </a>
                </div>
                <div style={{display: 'flex', gap: 22, marginBottom: 10, alignItems: 'center'}}>
                  <div style={{textAlign: 'center'}}>
                    <button 
                      onClick={() => handleVote(currentLink, 'for')}
                      disabled={userVote === 'for'}
                      style={{
                        background: userVote === 'for' ? (isLight ? 'rgba(56,161,105,0.3)' : 'rgba(56,161,105,0.3)') : (isLight ? '#38a169' : 'rgba(56,161,105,0.85)'),
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 10, 
                        padding: '10px 28px', 
                        fontWeight: 600, 
                        fontSize: 18, 
                        cursor: userVote === 'for' ? 'default' : 'pointer', 
                        boxShadow: '0 2px 8px rgba(56,161,105,0.10)', 
                        textShadow,
                        opacity: userVote === 'for' ? 0.7 : 1,
                        transform: userVote === 'for' ? 'scale(0.95)' : 'scale(1)',
                        transition: 'all 0.2s'
                      }}
                    >
                      За
                    </button>
                    <div style={{fontSize: 14, fontWeight: 600, marginTop: 4, color: textColor}}>
                      {currentResults.for}
                    </div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <button 
                      onClick={() => handleVote(currentLink, 'against')}
                      disabled={userVote === 'against'}
                      style={{
                        background: userVote === 'against' ? (isLight ? 'rgba(229,62,62,0.3)' : 'rgba(229,62,62,0.3)') : (isLight ? '#e53e3e' : 'rgba(229,62,62,0.85)'),
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 10, 
                        padding: '10px 28px', 
                        fontWeight: 600, 
                        fontSize: 18, 
                        cursor: userVote === 'against' ? 'default' : 'pointer', 
                        boxShadow: '0 2px 8px rgba(229,62,62,0.10)', 
                        textShadow,
                        opacity: userVote === 'against' ? 0.7 : 1,
                        transform: userVote === 'against' ? 'scale(0.95)' : 'scale(1)',
                        transition: 'all 0.2s'
                      }}
                    >
                      Против
                    </button>
                    <div style={{fontSize: 14, fontWeight: 600, marginTop: 4, color: textColor}}>
                      {currentResults.against}
                    </div>
                  </div>
                </div>
                {links.length > 1 && (
                  <div>
                    <button onClick={handlePrev} style={{position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: isLight ? '#fff' : 'rgba(0,0,0,0.22)', border: '1.5px solid #e2e8f0', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(100,116,139,0.10)', color: textColor, textShadow}}>`{'<'}`</button>
                    <button onClick={handleNext} style={{position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: isLight ? '#fff' : 'rgba(0,0,0,0.22)', border: '1.5px solid #e2e8f0', borderRadius: '50%', width: 36, height: 36, fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px rgba(100,116,139,0.10)', color: textColor, textShadow}}>`{'>'}`</button>
                  </div>
                )}
              </>
            ) : (
              <span style={{color: '#cbd5e1', fontSize: 18, textShadow}}>Добавьте ссылку на место</span>
            )}
          </div>
        </div>
        {/* Правая колонка: участники */}
        <div style={{minWidth: 160, maxWidth: 200, flex: '0 0 180px', display: 'flex', flexDirection: 'column', gap: 18, marginLeft: 'auto'}}>
          <h4 style={{marginBottom: 8, color: textColor, textShadow}}>Участники</h4>
          {friendsLoading ? (
            <div>Загрузка...</div>
          ) : friendsError ? (
            <div style={{color: 'red'}}>Ошибка: {friendsError}</div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              {participants.map(f => (
                <div key={f.id} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.08)', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', transition: 'background 0.3s', minWidth: 0}}>
                  <div style={{width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0}}>
                    {f.avatar ? (
                      <img src={f.avatar} alt={f.username} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: textColor, textShadow}}>
                        {f.username[0]}
                      </div>
                    )}
                  </div>
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                    <span style={{fontSize: 16, fontWeight: 500, color: textColor, textShadow}}>{f.username}</span>
                    {f.is_creator && (
                      <span style={{fontSize: 14, color: isLight ? '#4a5568' : '#cbd5e0', fontWeight: 500}}>Создатель</span>
                    )}
                  </div>
                  {isCreator && !f.is_creator && (
                    <button
                      onClick={() => handleRemoveFriend(f.id)}
                      style={{padding: '6px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: '#fff0f0', color: '#e53e3e', border: '1.5px solid #e53e3e', cursor: 'pointer', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: 8}}
                    >Удалить</button>
                  )}
                </div>
              ))}
            </div>
          )}
          <button
            style={{borderRadius: 8, background: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.22)', color: textColor, border: isLight ? '1.5px solid #ddd' : '1.5px solid #fff', padding: '8px 0', fontWeight: 600, marginTop: 8, fontSize: 15, textShadow}}
            onClick={() => setShowAddFriends(true)}
          >
            + Добавить друзей
          </button>
          {showAddFriends && (
            <div style={{
              position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} onClick={() => setShowAddFriends(false)}>
              <div style={{minWidth: 320, maxWidth: 400, background: isLight ? '#fff' : '#222', borderRadius: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', padding: 24, color: textColor, textShadow, position: 'relative'}} onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowAddFriends(false)} style={{position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer'}}>×</button>
                <h3 style={{marginTop: 0, marginBottom: 18}}>Друзья</h3>
                <input
                  type="text"
                  placeholder="Поиск по имени..."
                  value={friendSearch}
                  onChange={e => setFriendSearch(e.target.value)}
                  style={{width: '100%', marginBottom: 14, padding: 8, borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 15}}
                />
                <ul style={{margin: 0, padding: 0, listStyle: 'none', maxHeight: 260, overflowY: 'auto'}}>
                  {friends.filter(f => f.username.toLowerCase().startsWith(friendSearch.toLowerCase())).map(f => (
                    <li key={f.id} style={{margin: '10px 0', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'nowrap', minWidth: 0}}>
                      <div style={{width: 32, height: 32, borderRadius: '50%', background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: textColor, textShadow}}>
                        {f.avatar ? <img src={f.avatar} alt={f.username} style={{width: 28, height: 28, borderRadius: '50%'}} /> : f.username[0]}
                      </div>
                      <span style={{fontSize: 16, color: textColor, textShadow, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}>{f.username}</span>
                      {f.is_participant ? (
                        isCreator && !f.is_creator ? (
                          <button style={{marginLeft: 8, borderRadius: 8, background: '#fff0f0', color: '#e53e3e', border: '1.5px solid #e53e3e', padding: '4px 12px', fontWeight: 600, fontSize: 14, cursor: 'pointer', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} onClick={() => handleRemoveFriend(f.id)}>Удалить</button>
                        ) : null
                      ) : f.is_invited ? (
                        <span style={{marginLeft: 'auto', color: '#f6ad55', fontWeight: 600, fontSize: 14}}>Приглашение отправлено</span>
                      ) : (
                        <button style={{marginLeft: 'auto', borderRadius: 8, background: '#e6fffa', color: '#38a169', border: '1.5px solid #38a169', padding: '4px 12px', fontWeight: 600, fontSize: 14, cursor: 'pointer', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} onClick={() => handleInviteFriend(f.id)}>Пригласить</button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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

export default VotingPageDetail;