import React, { useState } from 'react';
import './AthleteDashboard.css';
import { API_BASE_URL } from '../../../services/api';

const DEFAULT_AVATAR = `${API_BASE_URL}/avatars/default.png`;

export default function AvailableTrainingsSection({
  allTrainings,
  registeredTrainings,
  recommendations,
  filterCategory,
  filterSection,
  sortOption,
  onFilterCategory,
  onFilterSection,
  onSortOption,
  onResetFilters,
  sportCategories,
  sportLogos,
  onSignup,
  onViewCoach,
  onRefreshRecs
}) {

  const [activeTab, setActiveTab] = useState('available');
  const now = new Date();
  const registeredIds = new Set(registeredTrainings.map(t => t._id));

  let available = allTrainings
    .filter(t => !registeredIds.has(t._id))
    .filter(t => t.spots > 0)
    .filter(t => new Date(t.start_time) > now);

  if (filterCategory) {
    available = available.filter(t => t.category === filterCategory);
  }
  if (filterSection) {
    available = available.filter(t => t.section === filterSection);
  }

  available.sort((a, b) => {
    switch (sortOption) {
      case 'date_asc':
        return new Date(a.start_time) - new Date(b.start_time);
      case 'date_desc':
        return new Date(b.start_time) - new Date(a.start_time);
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const recs = recommendations
    .filter(t => !registeredIds.has(t.id))
    .filter(t => t.spots > 0)
    .filter(t => new Date(t.start_time) > now);

  const formatDate = isoString =>
    new Date(isoString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  const formatTime = isoString =>
    new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <div className="available-trainings-section">
      <div className="ats-tabs">
        <span
          className={`ats-tab ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Доступні тренування
        </span>

        <span
          className={`ats-tab ${activeTab === 'recommended' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommended')}
        >
          Рекомендації
        </span>
      </div>

      {activeTab === 'available' && (
        <>
          <div className="filter-form">
            <div className="filter-row">
              <label htmlFor="category-filter">Категорія:</label>
              <select
                id="category-filter"
                value={filterCategory}
                onChange={e => onFilterCategory(e.target.value)}
              >
                <option value="">— Всі категорії —</option>
                {Object.keys(sportCategories).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-row">
              <label htmlFor="section-filter">Секція:</label>
              <select
                id="section-filter"
                value={filterSection}
                disabled={!filterCategory}
                onChange={e => onFilterSection(e.target.value)}
              >
                <option value="">— Всі секції —</option>
                {filterCategory &&
                  sportCategories[filterCategory].map(section => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
              </select>
            </div>
            <div className="filter-row">
              <label htmlFor="sort-filter">Сортування:</label>
              <select
                id="sort-filter"
                value={sortOption}
                onChange={e => onSortOption(e.target.value)}
              >
                <option value="date_asc">Дата ↑</option>
                <option value="date_desc">Дата ↓</option>
                <option value="price_asc">Ціна ↑</option>
                <option value="price_desc">Ціна ↓</option>
              </select>
            </div>
            <button
              type="button"
              className="reset-filter-btn"
              onClick={onResetFilters}
            >
              Скинути фільтри
            </button>
          </div>

          {available.length === 0 ? (
            <p>Немає доступних тренувань.</p>
          ) : (
            <div className="cards-grid">
              {available.map(training => (
                <div key={training._id} className="training-card">
                  <div className="card-header">
                    <span className="card-date">
                      {formatDate(training.start_time)}
                    </span>
                    <span className="card-time">
                      {formatTime(training.start_time)} –{' '}
                      {formatTime(training.end_time)}
                    </span>
                  </div>
                  <div className="card-body">
                    {sportLogos[training.section] && (
                      <img
                        src={sportLogos[training.section]}
                        alt={training.section}
                        className="card-logo"
                      />
                    )}
                    <p>
                      <strong>Секція:</strong> {training.section}
                    </p>
                    <p className="trainer-line">
                      <strong>Тренер:</strong>{' '}
                      <img
                        src={training.avatar_url || DEFAULT_AVATAR}
                        alt="Avatar тренера"
                        className="coach-avatar-small"
                        onError={e => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                      />{' '}
                      <span
                        className="coach-name-link"
                        onClick={() => onViewCoach(training.coach_id)}
                      >
                        {training.coach_name}
                      </span>
                    </p>
                    <p>
                      <strong>Вартість:</strong> {training.price}{' '}
                      {training.currency}
                    </p>
                    <p>
                      <strong>Місць:</strong> {training.spots}
                    </p>
                  </div>
                  <div className="card-footer">
                    <button
                      className="signup-btn"
                      disabled={training.spots === 0}
                      onClick={() => onSignup(training._id)}
                    >
                      Записатись
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'recommended' && (
        <>
          <p className="recommended-description">
            Тут зібрані тренування, найбільш підходящі саме Вам — на основі Ваших уподобань та особистих даних.
          </p>

          {recs.length === 0 ? (
            <p className="no-recommendations">Немає рекомендацій.</p>
          ) : (
            <div className="cards-grid">
              {recs.map(training => (
                <div key={training.id} className="training-card">
                  <div className="card-header">
                    <span className="card-date">
                      {formatDate(training.start_time)}
                    </span>
                    <span className="card-time">
                      {formatTime(training.start_time)} –{' '}
                      {formatTime(training.end_time)}
                    </span>
                  </div>
                  <div className="card-body">
                    {sportLogos[training.section] && (
                      <img
                        src={sportLogos[training.section]}
                        alt={training.section}
                        className="card-logo"
                      />
                    )}
                    <p>
                      <strong>Секція:</strong> {training.section}
                    </p>
                    <p className="trainer-line">
                      <strong>Тренер:</strong>{' '}
                      <img
                        src={training.avatar_url || DEFAULT_AVATAR}
                        alt="Avatar тренера"
                        className="coach-avatar-small"
                        onError={e => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATAR;
                        }}
                      />{' '}
                      <span
                        className="coach-name-link"
                        onClick={() => onViewCoach(training.coach_id)}
                      >
                        {training.coach_name}
                      </span>
                    </p>
                    <p>
                      <strong>Вартість:</strong> {training.price}{' '}
                      {training.currency}
                    </p>
                    <p>
                      <strong>Місць:</strong> {training.spots}
                    </p>
                  </div>
                  <div className="card-footer">
                    <button
                      className="signup-btn"
                      disabled={training.spots === 0}
                      onClick={() => onSignup(training.id)}
                    >
                      Записатись
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="recommend-btn-wrapper">
            <button
              type="button"
              className="recommend-btn"
              onClick={onRefreshRecs}
            >
              Оновити рекомендації
            </button>
          </div>
        </>
      )}
    </div>
  );
}
