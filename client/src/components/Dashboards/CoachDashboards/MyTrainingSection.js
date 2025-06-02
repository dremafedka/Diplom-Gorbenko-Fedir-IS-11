import React from 'react';
import CreateTrainingSection from './CreateTrainingSection';
import Modal from '../../Common/Modal';
import { format } from 'date-fns';
import './CoachDashboards.css';

export default function MyTrainingSection({
  trainings,
  isLoading,
  showCreateForm,
  toggleCreateForm,
  trainingData,
  errors,
  onChangeField,
  onChangeCategory,
  onSubmit,
  sportCategories,
  today,
  getMinTime,
  getEditMinTime,
  onView,
  onDelete,
  sportLogos,
  selectedTraining,
  participants,
  showParticipantsModal,
  editMode,
  editData,
  handleEdit,
  handleEditChange,
  handleEditSubmit,
  errorsEdit,
  cancelEdit,
  closeParticipantsModal,
  onViewAthlete,
  showAthleteModal,
  athleteProfile,
  closeAthleteModal,
}) {

  const sortedTrainings = React.useMemo(() => {
    return [...trainings].sort((a, b) =>
      new Date(a.start_time) - new Date(b.start_time)
    );
  }, [trainings]);

  return (
    <>
      <button
        className="fab"
        onClick={toggleCreateForm}
        aria-label="Створити тренування"
      >
        +
      </button>

      {!isLoading && sortedTrainings.length === 0 && (
        <div className="no-trainings-hint">
          <p className="no-trainings-text">
            У Вас ще немає жодних створених тренувань!<br/>
            Спробуйте натиснути кнопку <button className="hint-plus">+</button> для того, щоб налаштувати тренування!
          </p>
        </div>
      )}

      <div className={`create-sidebar${showCreateForm ? ' open' : ''}`}>
        <button
          className="sidebar-close-btn"
          onClick={toggleCreateForm}
          aria-label="Закрити"
        >
          ×
        </button>
        <CreateTrainingSection
          trainingData={trainingData}
          errors={errors}
          onChangeField={onChangeField}
          onChangeCategory={onChangeCategory}
          onSubmit={onSubmit}
          sportCategories={sportCategories}
          today={today}
          getMinTime={getMinTime}
        />
      </div>

      {sortedTrainings.length > 0 && (
        <div className="cards-grid">
          {sortedTrainings.map(t => {
            const date = format(new Date(t.start_time), 'dd.MM.yyyy');
            const time = `${format(new Date(t.start_time), 'HH:mm')} – ${format(new Date(t.end_time), 'HH:mm')}`;
            const signed = t.participants?.length || 0;
            const total = signed + parseInt(t.spots, 10);
            const logo = sportLogos[t.section];

            return (
              <div key={t._id} className="training-card">
                <div className="card-header">
                  <span className="card-date">{date}</span>
                  <span className="card-time">{time}</span>
                </div>
                <div className="card-body">
                  {logo && <img src={logo} alt={t.section} className="card-logo" />}
                  <p className="section-name">{t.section}</p>
                  <p className="participants-count">
                    Учасників: {signed} із {total}
                  </p>
                </div>
                <div className="card-footer">
                  <button className="view-btn" onClick={() => onView(t)}>
                    Переглянути
                  </button>
                  <button className="delete-btn" onClick={() => onDelete(t)}>
                    Видалити
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showParticipantsModal && selectedTraining && (
        <Modal
          modalType={editMode ? 'edit' : 'info'}
          onClose={closeParticipantsModal}
          className="participants-modal"
          message={
            editMode ? (
              <div>
                <header className="edit-modal__header">
                  <h2 className="edit-modal__title">Редагувати тренування</h2>
                </header>
                <form onSubmit={handleEditSubmit} className="edit-modal__body">
                  <div className="field-group">
                    <label htmlFor="editDate">Дата</label>
                    <input
                      type="date"
                      id="editDate"
                      name="date"
                      value={editData.date}
                      onChange={handleEditChange}
                      required
                      min={today}
                    />
                  </div>
                  <div className="field-row">
                    <div className="field-group">
                      <label htmlFor="editStart">Початок</label>
                      <input
                        type="time"
                        id="editStart"
                        name="start_time"
                        value={editData.start_time}
                        onChange={handleEditChange}
                        min={getEditMinTime()}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label htmlFor="editEnd">Кінець</label>
                      <input
                        type="time"
                        id="editEnd"
                        name="end_time"
                        value={editData.end_time}
                        onChange={handleEditChange}
                        required
                        min={editData.start_time}
                      />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-group">
                      <label htmlFor="editPrice">Ціна</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        id="editPrice"
                        name="price"
                        value={editData.price}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label htmlFor="editCurrency">Валюта</label>
                      <select
                        id="editCurrency"
                        name="currency"
                        value={editData.currency}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="UAH">UAH</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-group">
                      <label htmlFor="editCategory">Категорія</label>
                      <select
                        id="editCategory"
                        name="category"
                        value={editData.category}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">-- Виберіть категорію --</option>
                        {Object.keys(sportCategories).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field-group">
                      <label htmlFor="editSection">Секція</label>
                      <select
                        id="editSection"
                        name="section"
                        value={editData.section}
                        onChange={handleEditChange}
                        disabled={!editData.category}
                        required
                      >
                        <option value="">-- Виберіть секцію --</option>
                        {editData.category && sportCategories[editData.category].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="field-group">
                    <label htmlFor="editSpots">Місць</label>
                    <input
                      type="number"
                      min="0"
                      id="editSpots"
                      name="spots"
                      value={editData.spots}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                  {errorsEdit && <p className="error-message">{errorsEdit}</p>}
                  <footer className="edit-modal__footer">
                    <button type="button" className="btn-cancel" onClick={cancelEdit}>
                      Відмінити
                    </button>
                    <button type="submit" className="btn-save">
                      Зберегти
                    </button>
                  </footer>
                </form>
              </div>
            ) : (
              <div className="training-participants-modal">
                <div className="modal-left">
                  <h3 className="block-title">Загальна інформація</h3>
                  <div className="general-info">
                    {sportLogos[selectedTraining.section] && (
                      <img
                        src={sportLogos[selectedTraining.section]}
                        alt={selectedTraining.section}
                        className="section-logo-lg"
                      />
                    )}
                    <div className="general-info-text">
                      <p><strong>Секція:</strong> {selectedTraining.section}</p>
                      <p><strong>Дата:</strong> {format(new Date(selectedTraining.start_time), 'dd.MM.yyyy')}</p>
                      <p><strong>Час:</strong> {format(new Date(selectedTraining.start_time), 'HH:mm')} – {format(new Date(selectedTraining.end_time), 'HH:mm')}</p>
                      <p>Записано: {participants.length} / {participants.length + parseInt(selectedTraining.spots, 10)}</p>
                    </div>
                  </div>
                  <h3 className="block-title">Фінансовий аналіз</h3>
                  <ul className="financial-list">
                    <li><strong>Ціна:</strong> {selectedTraining.price} {selectedTraining.currency}</li>
                    <li><strong>Макс. прибуток:</strong> {((participants.length + parseInt(selectedTraining.spots,10)) * selectedTraining.price).toFixed(2)} {selectedTraining.currency}</li>
                    <li><strong>Заповненість:</strong> {Math.round((participants.length / (participants.length + parseInt(selectedTraining.spots,10))) * 100)}%</li>
                    <li><strong>Очікуваний прибуток:</strong> {(participants.length * selectedTraining.price).toFixed(2)} {selectedTraining.currency}</li>
                  </ul>
                </div>
                <div className="modal-right">
                  <h3 className="block-title">Учасники</h3>
                  <div className="participants-list">
                    {participants.length > 0 ? participants.map((p, idx) => (
                      <div key={idx} className="participant-item">
                        <img
                          src={p.avatar_url}
                          alt={p.name}
                          className="participant-avatar"
                          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAvatar; }}
                        />
                        <div className="participant-details">
                          <button className="link-button" onClick={() => onViewAthlete(p.user_id)}>
                            {p.name}
                          </button>
                          <p className="participant-age">Вік: {p.age}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="no-participants"><em>Ніхто не записався.</em></p>
                    )}
                  </div>
                  <div className="participants-actions">
                    <button className="modal-edit-btn" onClick={handleEdit}>Редагувати</button>
                  </div>
                </div>
              </div>
            )
          }
        />
      )}

      {showAthleteModal && athleteProfile && (
        <Modal
          modalType="info"
          className="athlete-detail-modal"
          onClose={closeAthleteModal}
          message={
            <div className="athlete-modal-container">
              <div className="profile-avatar-column">
                <img
                  src={athleteProfile.avatar_url || defaultAvatar}
                  alt={athleteProfile.name}
                  className="profile-avatar-large"
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = defaultAvatar; }}
                />
              </div>
              <div className="profile-info-column">
                <h2 className="athlete-name">{athleteProfile.name}</h2>
                <p className="info-row"><strong>Вік:</strong> {athleteProfile.age}</p>
                <p className="info-row"><strong>Телефон:</strong> {athleteProfile.phone || '—'}</p>
                {athleteProfile.description && (
                  <div className="athlete-section">
                    <h3>Про себе</h3>
                    <p>{athleteProfile.description}</p>
                  </div>
                )}
                {athleteProfile.favorite_sports?.length > 0 && (
                  <div className="athlete-section">
                    <h3>Улюблені види спорту</h3>
                    <p>{athleteProfile.favorite_sports.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          }
        />
      )}
    </>
  );
}
