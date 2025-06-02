import React, { useState, useMemo } from 'react';
import './AthleteDashboard.css';
import { API_BASE_URL } from '../../../services/api';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const DEFAULT_AVATAR = `${API_BASE_URL}/avatars/default.png`;
const USD_TO_UAH = 42.8;
const EUR_TO_UAH = 47.5;
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

export default function HistorySection({
  historyTrainings,
  sportLogos,
  onViewDetails,
  onViewCoach
}) {
  const [activeTab, setActiveTab] = useState('history');
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

  const sorted = useMemo(
    () => [...historyTrainings].sort(
      (a, b) => new Date(b.end_time) - new Date(a.end_time)
    ),
    [historyTrainings]
  );

  const totalCount = sorted.length;

  const totalDurationMs = sorted.reduce(
    (sum, t) => sum + (new Date(t.end_time) - new Date(t.start_time)),
    0
  );
  const hours = Math.floor(totalDurationMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));
  const totalDuration = `${hours} год ${minutes} хв`;

  const rates = { USD: USD_TO_UAH, EUR: EUR_TO_UAH, UAH: 1 };
  const totalCost = sorted.reduce(
    (sum, t) => sum + (t.price || 0) * (rates[t.currency] || 1),
    0
  );

  const topSections = useMemo(() => {
    const counts = {};
    sorted.forEach(t => {
      counts[t.section] = (counts[t.section] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([section, count]) => ({ section, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [sorted]);

  const categoryData = useMemo(() => {
    const counts = {};
    sorted.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.entries(counts).map(([category, value]) => ({ category, value }));
  }, [sorted]);

  const topCoaches = useMemo(() => {
    const counts = {};
    const names = {};
    sorted.forEach(t => {
      counts[t.coach_id] = (counts[t.coach_id] || 0) + 1;
      names[t.coach_id] = t.coach_name;
    });
    return Object.entries(counts)
      .map(([coach_id, count]) => ({
        coach_id,
        coach_name: names[coach_id],
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [sorted]);

  return (
    <div className="history-trainings-section">

      <div className="ats-tabs">
        <span
          className={`ats-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Історія тренувань
        </span>
        <span
          className={`ats-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Ваша статистика
        </span>
      </div>

      {activeTab === 'history' && (
        <>
          {sorted.length === 0 ? (
            <div className="no-trainings-hint">
              <p className="no-trainings-text">
                Ви ще не пройшли жодного тренування, перейдіть до розділу&nbsp;
                <strong>“Пошук тренувань”</strong>&nbsp;
                та оберіть те, що Вам сподобається!
              </p>
            </div>
          ) : (
            <div className="cards-grid">
              {sorted.map(t => {
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
                        className="action-btn view-btn"
                        onClick={() => onViewDetails(t)}
                      >
                        Переглянути
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'stats' && (
        <div className="history-stats-section">

          <div className="stats-grid">
            <div className="stat-card">
              <h4>Загальна кількість тренувань</h4>
              <p>{totalCount}</p>
            </div>
            <div className="stat-card">
              <h4>Загальний час тренувань</h4>
              <p>{totalDuration}</p>
            </div>
            <div className="stat-card">
              <h4>Витрачені кошти (UAH)</h4>
              <p>{totalCost.toFixed(2)}</p>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h4 className="chart-title">Топ-3 відвідувані секції</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topSections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="section" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h4 className="chart-title">Розподіл відвідувань за категоріями</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    {categoryData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h4 className="chart-title">Улюблені тренери</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topCoaches}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="coach_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
