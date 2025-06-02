import React from 'react';
import './CoachDashboards.css';

export default function CreateTrainingSection({
  trainingData,
  errors,
  onChangeField,
  onChangeCategory,
  onSubmit,
  sportCategories,
  today,
  getMinTime
}) {
  return (
    <div className="form-wrapper">
      <h2>Створити тренування</h2>
      <p>Заповніть форму, щоб додати нове тренування.</p>
      <form onSubmit={onSubmit} className="create-training-form">
        <div className="form-row">
          <label htmlFor="date">Дата:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={trainingData.date}
            onChange={onChangeField}
            min={today}
            required
          />
        </div>

        <div className="form-row time-group">
          <div className="time-field">
            <label htmlFor="start_time">Початок:</label>
            <input
              type="time"
              id="start_time"
              name="start_time"
              value={trainingData.start_time}
              onChange={onChangeField}
              min={getMinTime()}
              required
            />
          </div>
          <div className="time-field">
            <label htmlFor="end_time">Кінець:</label>
            <input
              type="time"
              id="end_time"
              name="end_time"
              value={trainingData.end_time}
              onChange={onChangeField}
              min={trainingData.start_time}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="category">Категорія:</label>
          <select
            id="category"
            name="category"
            value={trainingData.category}
            onChange={onChangeCategory}
            required
          >
            <option value="">-- Виберіть категорію --</option>
            {Object.keys(sportCategories).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="section">Секція:</label>
          <select
            id="section"
            name="section"
            value={trainingData.section}
            onChange={onChangeField}
            disabled={!trainingData.category}
            required
          >
            <option value="">-- Виберіть секцію --</option>
            {trainingData.category &&
              sportCategories[trainingData.category].map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))
            }
          </select>
        </div>

        <div className="form-row price-currency-group">
          <div className="price-group">
            <label htmlFor="price">Ціна:</label>
            <input
              type="number"
              id="price"
              name="price"
              step="0.01"
              min="0"
              value={trainingData.price}
              onChange={onChangeField}
              required
            />
          </div>
          <div className="currency-group">
            <label htmlFor="currency">Валюта:</label>
            <select
              id="currency"
              name="currency"
              value={trainingData.currency}
              onChange={onChangeField}
              required
            >
              <option value="UAH">UAH</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="spots">Місць:</label>
          <input
            type="number"
            id="spots"
            name="spots"
            min="0"
            value={trainingData.spots}
            onChange={onChangeField}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Створити
        </button>
      </form>
    </div>
  );
}
