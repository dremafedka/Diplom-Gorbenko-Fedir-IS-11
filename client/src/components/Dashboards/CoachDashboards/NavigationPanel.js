import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from '../../Common/Modal';
import './NavigationPanel.css';

export default function NavigationPanel({ activeTab, onTabChange }) {
  const history = useHistory();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('userId');
    history.push('/');
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <nav className="navigation-panel">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'my-trainings' ? 'active' : ''}`}
            onClick={() => onTabChange('my-trainings')}
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

          <button
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => onTabChange('reviews')}
          >
            Ваш рейтинг
          </button>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogoutClick}
          title="Вийти з акаунту"
        >
          <svg viewBox="0 0 24 24">
            <path d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3H10v2h10v14H10v2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
      </nav>

      {showLogoutConfirm && (
        <Modal
          modalType="confirm"
          onClose={handleCancelLogout}
          message={
            <div style={{ textAlign: 'center', padding: '1em' }}>
              <p>Ви впевнені, що хочете вийти з акаунту?</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1em' }}>
                <button className="submit-btn" onClick={handleConfirmLogout}>
                  Так
                </button>
                <button className="cancel-btn" onClick={handleCancelLogout}>
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
