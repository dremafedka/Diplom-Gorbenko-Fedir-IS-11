import React from 'react';
import { API_BASE_URL } from '../../../services/api';
import './CoachDashboards.css';

export default function ReviewsSection({ reviews, avgRating, reviewCount }) {
  const defaultAvatar = `${API_BASE_URL}/avatars/default.png`;

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric'
    });
  }

  return (
    <section className="reviews-section">
      <h2>Ваш рейтинг: {avgRating} ★ ({reviewCount} відгуків)</h2>

      {reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map(r => {
            const avatarSrc = r.athlete_avatar_url
              ? (r.athlete_avatar_url.startsWith('http')
                  ? r.athlete_avatar_url
                  : `${API_BASE_URL}${r.athlete_avatar_url}`)
              : defaultAvatar;

            return (
              <div key={r.id} className="review-card">
                <div className="review-card-header">
                  <div className="review-user-info">
                    <img
                      src={avatarSrc}
                      alt="Аватар спортсмена"
                      className="reviewer-avatar-small"
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                    <span className="review-username">
                      {r.athlete_name || 'Анонім'}
                    </span>
                  </div>
                  <div className="review-meta">
                    <span className="review-rating">
                      {'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}
                    </span>
                    <small className="review-date">
                      {formatDate(r.created_at)}
                    </small>
                  </div>
                </div>
                <div className="review-text">{r.comment}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <p><em>Немає відгуків</em></p>
      )}
    </section>
  );
}
