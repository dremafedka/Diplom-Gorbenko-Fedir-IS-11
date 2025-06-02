import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from '../../../components/Common/Modal';
import './NavigationPanel.css';

export default function NavigationPanel({ activeTab, onTabChange }) {
  const history = useHistory();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    localStorage.removeItem('userId');
    history.push('/');
  };

  return (
    <>
      <nav className="navigation-panel">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => onTabChange('available')}
          >
            Пошук тренувань
          </button>
          <button
            className={`tab ${activeTab === 'registered' ? 'active' : ''}`}
            onClick={() => onTabChange('registered')}
          >
            Ваші тренування
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => onTabChange('history')}
          >
            Історія тренувань
          </button>
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => onTabChange('profile')}
          >
            Ваш профіль
          </button>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Вийти">
          <svg viewBox="0 0 24 24">
            <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3H10v2h10v14H10v2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          </svg>
        </button>
      </nav>

      {showLogoutConfirm && (
        <Modal
          modalType="confirm"
          onClose={() => setShowLogoutConfirm(false)}
          message={
            <div style={{ textAlign: 'center' }}>
              <p>Ви впевнені, що хочете вийти з акаунту?</p>
              <div style={{ display: 'flex', gap: '1em', justifyContent: 'center' }}>
                <button className="submit-btn" onClick={confirmLogout}>
                  Так
                </button>
                <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>
                  Ні
                </button>
              </div>
            </div>
          }
        />
      )}
    </>
  );
}
