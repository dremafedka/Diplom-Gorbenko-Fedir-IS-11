import React from 'react';
import './AthleteDashboard.css';
import { API_BASE_URL } from '../../../services/api';

const DEFAULT_AVATAR = `${API_BASE_URL}/avatars/default.png`;

export default function YourTrainingsSection({
  registeredTrainings,
  sportLogos,
  onViewDetails,
  onCancel,
  onViewCoach
}) {
  const now = new Date();
  const future = registeredTrainings.filter(
    t => new Date(t.start_time) > now
  );

  if (future.length === 0) {
    return (
      <div className="no-trainings-hint">
        <p className="no-trainings-text">
          У вас немає назначених тренувань, перейдіть до розділу&nbsp;
          <strong>“Пошук тренувань”</strong>&nbsp;
          та оберіть те, що Вам сподобається!
        </p>
      </div>
    );
  }

  const fmtDate = iso =>
    new Date(iso).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  const fmtTime = iso =>
    new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <div className="registered-trainings-section">
      <div className="cards-grid">
        {future.map(t => {
          const avatarSrc = t.avatar_url
            ? (t.avatar_url.startsWith('http')
                ? t.avatar_url
                : `${API_BASE_URL}${t.avatar_url}`)
            : DEFAULT_AVATAR;

          return (
            <div key={t._id} className="training-card">
              <div className="card-header">
                <span className="card-date">{fmtDate(t.start_time)}</span>
                <span className="card-time">
                  {fmtTime(t.start_time)} – {fmtTime(t.end_time)}
                </span>
              </div>
              <div className="card-body">
                {sportLogos[t.section] && (
                  <img
                    src={sportLogos[t.section]}
                    alt={t.section}
                    className="card-logo"
                  />
                )}
                <p><strong>Секція:</strong> {t.section}</p>
                <p className="trainer-line">
                  <strong>Тренер:</strong>{' '}
                  <img
                    src={avatarSrc}
                    alt="Avatar тренера"
                    className="coach-avatar-small"
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                  />{' '}
                  <span
                    className="coach-name-link"
                    onClick={() => onViewCoach(t.coach_id)}
                  >
                    {t.coach_name}
                  </span>
                </p>
              </div>
              <div className="card-footer">
                <button
                  className="view-btn"
                  onClick={() => onViewDetails(t)}
                >
                  Переглянути
                </button>
                <button
                  className="delete-btn"
                  onClick={() => onCancel(t)}
                >
                  Скасувати
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
