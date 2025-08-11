// src/components/FriendSelector.jsx
import React, { useState } from 'react';

function FriendSelector({ friends, selectedFriends, onChange }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleFriendToggle = (friendId) => {
    const newSelected = selectedFriends.includes(friendId)
      ? selectedFriends.filter(id => id !== friendId)
      : [...selectedFriends, friendId];
    
    onChange(newSelected);
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-2">
        <input
          type="text"
          className="form-control"
          placeholder="Поиск друзей..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="friend-selector-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {filteredFriends.length > 0 ? (
          filteredFriends.map(friend => (
            <div key={friend.id} className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id={`friend-${friend.id}`}
                checked={selectedFriends.includes(friend.id)}
                onChange={() => handleFriendToggle(friend.id)}
              />
              <label className="form-check-label d-flex align-items-center" htmlFor={`friend-${friend.id}`}>
                {friend.avatar ? (
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className="rounded-circle me-2"
                    style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                    <i className="fas fa-user text-white"></i>
                  </div>
                )}
                {friend.username}
              </label>
            </div>
          ))
        ) : (
          <p className="text-muted">Друзья не найдены</p>
        )}
      </div>
      
      {selectedFriends.length > 0 && (
        <div className="mt-2">
          <small className="text-muted">
            Выбрано: {selectedFriends.length} {selectedFriends.length === 1 ? 'друг' : 'друзей'}
          </small>
        </div>
      )}
    </div>
  );
}

export default FriendSelector;