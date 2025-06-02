import React from 'react';
import './CoachDashboards.css';

export default function ProfileSection({
  profile,
  editMode,
  nameInput,
  ageInput,
  phoneInput,
  description,
  favoriteSports,
  allSections,
  profileError,
  showPassMode,
  oldPass,
  newPass,
  confirmPass,
  passError,
  onToggleEditMode,
  onChangeField,
  onToggleSport,
  onSaveProfile,
  onCancelEdit,
  onUploadAvatar,
  onTogglePasswordMode,
  onChangePassword,
  onCancelPassword,
  avatarPreview,
  onAvatarFileChange,
  avatarFile
}) {
  return (
    <div className="profile-section">
      <div className="profile-container">
        <div className="profile-avatar-column">
          <img src={avatarPreview} alt="Аватар тренера" className="profile-avatar-large" />
          {editMode && (
            <>
              <input type="file" accept="image/*" onChange={onAvatarFileChange} />
              <button
                className="btn-secondary"
                disabled={!avatarFile}
                onClick={onUploadAvatar}
              >
                Завантажити фото
              </button>
            </>
          )}
        </div>
        <div className="profile-info-column">
          {editMode ? (
            <>
              <label>Ім’я:</label>
              <input name="nameInput" value={nameInput} onChange={onChangeField} />

              <label>Вік:</label>
              <input
                type="number"
                name="ageInput"
                min="18"
                value={ageInput}
                onChange={onChangeField}
              />

              <label>Телефон:</label>
              <input name="phoneInput" value={phoneInput} onChange={onChangeField} />

              <label>Опис:</label>
              <textarea name="description" value={description} onChange={onChangeField} />

              <label>Улюблені види спорту:</label>
              <div className="favorite-sports-list">
                {allSections.map(s => (
                  <label key={s} className="sport-checkbox">
                    <input
                      type="checkbox"
                      checked={favoriteSports.includes(s)}
                      onChange={() => onToggleSport(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>

              {profileError && <p className="error-message">{profileError}</p>}

              <div className="profile-actions">
                <button className="btn-primary" onClick={onSaveProfile}>
                  Зберегти
                </button>
                <button className="btn-secondary" onClick={onCancelEdit}>
                  Відмінити
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>{profile.name}</h2>
              <p><strong>Вік:</strong> {profile.age}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Телефон:</strong> {profile.phone || '—'}</p>
              <p><strong>Опис:</strong> {profile.description || '—'}</p>
              <p><strong>Улюблені види спорту:</strong> {favoriteSports.join(', ') || '—'}</p>
              <div className="profile-actions">
                <button className="btn-primary" onClick={onToggleEditMode}>
                  Редагувати
                </button>
                <button className="btn-secondary" onClick={onTogglePasswordMode}>
                  Змінити пароль
                </button>
              </div>
            </>
          )}

          {showPassMode && (
            <div className="password-form">
              <label>Старий пароль:</label>
              <input
                type="password"
                name="oldPass"
                value={oldPass}
                onChange={onChangeField}
              />

              <label>Новий пароль:</label>
              <input
                type="password"
                name="newPass"
                value={newPass}
                onChange={onChangeField}
              />

              <label>Підтвердіть новий пароль:</label>
              <input
                type="password"
                name="confirmPass"
                value={confirmPass}
                onChange={onChangeField}
              />

              {passError && <p className="error-message">{passError}</p>}

              <div className="profile-actions">
                <button className="btn-primary" onClick={onChangePassword}>
                  Змінити пароль
                </button>
                <button className="btn-secondary" onClick={onCancelPassword}>
                  Відмінити
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
