import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const STORAGE_KEY = 'votemania_votings';

const mockFriends = [
  { id: 1, username: 'Александр', avatar: '' },
  { id: 2, username: 'Мария', avatar: '' },
  { id: 3, username: 'Дмитрий', avatar: '' },
];

function VotingPageDetail() {
  const { id } = useParams();
  const [showAddFriends, setShowAddFriends] = useState(false);
  // Получаем голосование по id
  const stored = localStorage.getItem(STORAGE_KEY);
  const votings = stored ? JSON.parse(stored) : [];
  const voting = votings.find(v => String(v.id) === String(id));
  const [links, setLinks] = useState([]);
  const [linkInput, setLinkInput] = useState('');
  const [friends, setFriends] = useState(mockFriends);

  if (!voting) return <div style={{padding: 32}}>Голосование не найдено</div>;

  const handleAddLink = (e) => {
    e.preventDefault();
    if (linkInput.trim()) {
      setLinks([...links, linkInput.trim()]);
      setLinkInput('');
    }
  };

  return (
    <div style={{display: 'flex', gap: 32, minHeight: '60vh', padding: '32px 0'}}>
      {/* Левая колонка: ссылки */}
      <div style={{minWidth: 180, maxWidth: 220, flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: 18}}>
        <h4 style={{marginBottom: 8, color: 'var(--primary-dark)'}}>Ссылки</h4>
        <form onSubmit={handleAddLink} style={{display: 'flex', gap: 6}}>
          <input
            type="url"
            placeholder="Вставьте ссылку"
            value={linkInput}
            onChange={e => setLinkInput(e.target.value)}
            style={{flex: 1, borderRadius: 8, border: '1px solid #e2e8f0', padding: 6, fontSize: 14}}
          />
          <button type="submit" style={{borderRadius: 8, background: 'var(--primary)', color: '#fff', border: 'none', padding: '6px 12px', fontWeight: 600}}>+</button>
        </form>
        <ul style={{margin: 0, padding: 0, listStyle: 'none', fontSize: 14}}>
          {links.map((l, i) => (
            <li key={i} style={{margin: '6px 0', wordBreak: 'break-all'}}>
              <a href={l} target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary)'}}>{l}</a>
            </li>
          ))}
        </ul>
      </div>
      {/* Центр: прямоугольник */}
      <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 320, height: 220, background: '#f8fafc', borderRadius: 18, boxShadow: '0 2px 12px rgba(100,116,139,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 22}}>
          {/* Здесь будет содержимое голосования */}
          Прямоугольник
        </div>
      </div>
      {/* Правая колонка: участники */}
      <div style={{minWidth: 160, maxWidth: 200, flex: '0 0 180px', display: 'flex', flexDirection: 'column', gap: 18}}>
        <h4 style={{marginBottom: 8, color: 'var(--primary-dark)'}}>Участники</h4>
        <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
          {friends.map(f => (
            <li key={f.id} style={{margin: '8px 0', display: 'flex', alignItems: 'center', gap: 8}}>
              <div style={{width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748b'}}>
                {f.username[0]}
              </div>
              <span style={{fontSize: 15}}>{f.username}</span>
            </li>
          ))}
        </ul>
        <button
          style={{borderRadius: 8, background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 0', fontWeight: 600, marginTop: 8, fontSize: 15}}
          onClick={() => setShowAddFriends(true)}
        >
          + Добавить друзей
        </button>
        {showAddFriends && (
          <div style={{marginTop: 10, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, boxShadow: '0 2px 8px rgba(100,116,139,0.08)'}}>Форма добавления друзей (заглушка)</div>
        )}
      </div>
    </div>
  );
}

export default VotingPageDetail;
