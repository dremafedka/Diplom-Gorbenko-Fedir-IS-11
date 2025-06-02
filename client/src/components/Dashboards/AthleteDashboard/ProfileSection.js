import React from 'react';
import Modal from '../../Common/Modal';
import './AthleteDashboard.css';
import { API_BASE_URL } from '../../../services/api';

const DEFAULT_AVATAR = `${API_BASE_URL}/avatars/default.png`;

export default function ProfileSection({
  profile,
  editMode,
  nameInput, ageInput, phoneInput, descriptionInput, favoriteSports,
  allSections,
  onToggleEditMode, onChangeField, toggleSport, onSaveProfile, onCancelEdit,
  avatarPreview, avatarFile, onAvatarFileChange, onAvatarUpload,
  showProfileSuccess, onCloseProfileSuccess,
  showPassMode, onTogglePasswordMode, oldPass, newPass, confirmPass,
  onChangePassword, onCancelPassword, passError, passSuccess, showAvatarSuccess,
  onCloseAvatarSuccess, onClosePassSuccess
}) {
  return (
    <section className="profile-section">
      <div className="profile-container">
        <div className="profile-avatar-column">
          <img
            src={avatarPreview||DEFAULT_AVATAR}
            className="profile-avatar-large"
            onError={e=>e.currentTarget.src=DEFAULT_AVATAR}
            alt="Аватар"
          />
          {editMode && (
            <>
              <input type="file" accept="image/*" onChange={onAvatarFileChange}/>
              <button className="btn-primary" disabled={!avatarFile} onClick={onAvatarUpload}>
                Завантажити фото
              </button>
            </>
          )}
        </div>
        <div className="profile-info-column">
          {editMode ? (
            <>
              <label>Ім'я:</label>
              <input name="nameInput" value={nameInput} onChange={onChangeField}/>

              <label>Вік:</label>
              <input type="number" name="ageInput" min="18" value={ageInput} onChange={onChangeField}/>

              <label>Телефон:</label>
              <input name="phoneInput" value={phoneInput} onChange={onChangeField}/>

              <label>Про себе:</label>
              <textarea name="descriptionInput" value={descriptionInput} onChange={onChangeField}/>

              <label>Улюблені спорт:</label>
              <div className="favorite-sports-list">
                {allSections.map(s=>(
                  <label key={s} className="sport-checkbox">
                    <input
                      type="checkbox"
                      checked={favoriteSports.includes(s)}
                      onChange={()=>toggleSport(s)}
                    />{s}
                  </label>
                ))}
              </div>

              <p className="error-message">{profile.error}</p>

              <div className="profile-actions">
                <button className="btn-primary" onClick={onSaveProfile}>Зберегти</button>
                <button className="btn-secondary" onClick={onCancelEdit}>Відмінити</button>
              </div>
            </>
          ) : (
            <>
              <h2>{profile.name}</h2>
              <p><strong>Вік:</strong> {profile.age}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Телефон:</strong> {profile.phone || <em>—</em>}</p>
              <p><strong>Про себе:</strong> {profile.description || <em>—</em>}</p>
              <p><strong>Улюблені спорт:</strong>{' '}
                {favoriteSports.length?favoriteSports.join(', '):<em>—</em>}
              </p>
              <div className="profile-actions">
                <button className="btn-primary" onClick={onToggleEditMode}>Редагувати</button>
                <button className="btn-secondary" onClick={onTogglePasswordMode}>Змінити пароль</button>
              </div>
            </>
          )}

          {showPassMode && (
            <div className="password-form">
              <label>Старий пароль:</label>
              <input type="password" name="oldPass" value={oldPass} onChange={onChangeField}/>
              <label>Новий:</label>
              <input type="password" name="newPass" value={newPass} onChange={onChangeField}/>
              <label>Підтвердити:</label>
              <input type="password" name="confirmPass" value={confirmPass} onChange={onChangeField}/>
              {passError && <p className="error-message">{passError}</p>}
              <div className="profile-actions">
                <button className="btn-primary" onClick={onChangePassword}>Змінити</button>
                <button className="btn-secondary" onClick={onCancelPassword}>Відмінити</button>
              </div>
            </div>
          )}

          {passSuccess && <Modal message="Пароль успішно змінено!" onClose={onClosePassSuccess}/>}
          {showAvatarSuccess && (
            <Modal
              modalType="success"
              message="Нове фото успішно завантажено!"
              onClose={onCloseAvatarSuccess}
            />
          )}
          {showProfileSuccess && <Modal message="Профіль успішно оновлено!" onClose={onCloseProfileSuccess}/>}
        </div>
      </div>
    </section>
  );
}
