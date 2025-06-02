import React, { useState, useEffect } from 'react';
import Modal from '../../Common/Modal';
import { format, parseISO } from 'date-fns';
import {
  getTrainingParticipants,
  getAthleteProfile,
  API_BASE_URL
} from '../../../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import './CoachDashboards.css';

const USD_TO_UAH = 41.8;
const EUR_TO_UAH = 47.5;
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];
const defaultAvatar = `${API_BASE_URL}/avatars/default.png`;

export default function HistorySection({ trainings, sportLogos }) {
  const [activeTab, setActiveTab] = useState('history');
  const [participantsMap, setParticipantsMap] = useState({});
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [showAthleteModal, setShowAthleteModal] = useState(false);

  useEffect(() => {
    async function fetchAllParticipants() {
      const map = {};
      await Promise.all(
        trainings.map(async t => {
          try {
            const { participants } = await getTrainingParticipants(t._id);
            map[t._id] = participants;
          } catch {
            map[t._id] = [];
          }
        })
      );
      setParticipantsMap(map);
    }
    if (trainings.length > 0) {
      fetchAllParticipants();
    }
  }, [trainings]);

  function toUAH(amount, currency) {
    if (currency === 'USD') return amount * USD_TO_UAH;
    if (currency === 'EUR') return amount * EUR_TO_UAH;
    return amount;
  }

  const totalTrainings = trainings.length;
  const totalVisits = trainings.reduce(
    (sum, t) => sum + (participantsMap[t._id]?.length || 0),
    0
  );
  const avgAttendance = totalTrainings
    ? (totalVisits / totalTrainings).toFixed(1)
    : 0;
  const avgFillRate = totalTrainings
    ? (
        trainings.reduce((sum, t) => {
          const p = participantsMap[t._id]?.length || 0;
          const capacity = p + (parseInt(t.spots, 10) || 0);
          return sum + (capacity > 0 ? p / capacity : 0);
        }, 0) /
        totalTrainings *
        100
      ).toFixed(1)
    : 0;
  const totalRevenueUAH = trainings.reduce((sum, t) => {
    const p = participantsMap[t._id]?.length || 0;
    return sum + toUAH(p * (t.price || 0), t.currency);
  }, 0);
  const avgRevenueUAH = totalTrainings
    ? (totalRevenueUAH / totalTrainings).toFixed(2)
    : '0.00';

  const sectionCounts = {};
  trainings.forEach(t => {
    sectionCounts[t.section] =
      (sectionCounts[t.section] || 0) + (participantsMap[t._id]?.length || 0);
  });
  const top3Sections = Object.entries(sectionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([section, count]) => ({ section, count }));

  const attendanceByDayMap = {};
  trainings.forEach(t => {
    const day = format(parseISO(t.start_time), 'yyyy-MM-dd');
    attendanceByDayMap[day] =
      (attendanceByDayMap[day] || 0) + (participantsMap[t._id]?.length || 0);
  });
  const attendanceByDay = Object.entries(attendanceByDayMap)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, count]) => ({
      date: format(parseISO(date), 'dd.MM.yyyy'),
      count
    }));

  const revenueBySectionMap = {};
  trainings.forEach(t => {
    const p = participantsMap[t._id]?.length || 0;
    const rev = toUAH(p * (t.price || 0), t.currency);
    revenueBySectionMap[t.section] =
      (revenueBySectionMap[t.section] || 0) + rev;
  });
  const revenueBySection = Object.entries(revenueBySectionMap).map(
    ([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) })
  );


  function openTrainingModal(t) {
    setSelectedTraining(t);
    setShowTrainingModal(true);
  }

  function closeTrainingModal() {
    setShowTrainingModal(false);
    setSelectedTraining(null);
  }

  async function openAthleteModal(user_id) {
    try {
      const { profile } = await getAthleteProfile(user_id);
      setSelectedAthlete(profile);
      setShowAthleteModal(true);
    } catch (err) {
      console.error('Не вдалося завантажити профіль спортсмена:', err);
    }
  }
  function closeAthleteModal() {
    setShowAthleteModal(false);
    setSelectedAthlete(null);
  }

  return (
    <div className="history-section">
      <div className="ats-tabs">
        <span
          className={`ats-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Проведені тренування
        </span>
        <span
          className={`ats-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Статистика відвідуваності та доходу
        </span>
      </div>

      {activeTab === 'history' && (
        <div className="cards-grid">
          {trainings.map(t => {
            const date = format(parseISO(t.start_time), 'dd.MM.yyyy');
            const time = `${format(parseISO(t.start_time), 'HH:mm')}–${format(
              parseISO(t.end_time),
              'HH:mm'
            )}`;
            return (
              <div key={t._id} className="training-card">
                <div className="card-header">
                  <span className="card-date">{date}</span>
                  <span className="card-time">{time}</span>
                </div>
                <div className="card-body">
                  {sportLogos[t.section] && (
                    <img
                      src={sportLogos[t.section]}
                      alt={t.section}
                      className="card-logo"
                    />
                  )}
                  <p className="section-name">{t.section}</p>
                  <p className="participants-count">
                    Учасників: {participantsMap[t._id]?.length || 0}
                  </p>
                </div>
                <div className="card-footer">
                  <button
                    className="view-btn"
                    onClick={() => openTrainingModal(t)}
                  >
                    Переглянути
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'stats' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Загальна кількість тренувань</h3>
              <p>{totalTrainings}</p>
            </div>
            <div className="stat-card">
              <h3>Загальна кількість відвідувань</h3>
              <p>{totalVisits}</p>
            </div>
            <div className="stat-card">
              <h3>Середня відвідуваність</h3>
              <p>{avgAttendance}</p>
            </div>
            <div className="stat-card">
              <h3>Середня заповненість (%)</h3>
              <p>{avgFillRate}%</p>
            </div>
            <div className="stat-card">
              <h3>Загальний дохід (UAH)</h3>
              <p>{totalRevenueUAH.toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <h3>Середній дохід за тренування (UAH)</h3>
              <p>{avgRevenueUAH}</p>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Динаміка відвідуваності по днях</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={attendanceByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Топ-3 популярні секції</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={top3Sections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="section" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Розподіл доходу по секціях</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={revenueBySection}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    label
                  >
                    {revenueBySection.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {showTrainingModal && selectedTraining && (
        <Modal
          modalType="info"
          className="participants-modal"
          onClose={closeTrainingModal}
          message={
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
                    <p>
                      <strong>Секція:</strong> {selectedTraining.section}
                    </p>
                    <p>
                      <strong>Дата:</strong>{' '}
                      {format(parseISO(selectedTraining.start_time), 'dd.MM.yyyy')}
                    </p>
                    <p>
                      <strong>Час:</strong>{' '}
                      {format(parseISO(selectedTraining.start_time), 'HH:mm')} –{' '}
                      {format(parseISO(selectedTraining.end_time), 'HH:mm')}
                    </p>
                    <p>
                      Записано:{' '}
                      {participantsMap[selectedTraining._id]?.length || 0} /{' '}
                      {(participantsMap[selectedTraining._id]?.length || 0) +
                        parseInt(selectedTraining.spots, 10)}
                    </p>
                  </div>
                </div>
                <h3 className="block-title">
                  Фінансовий аналіз ({selectedTraining.currency})
                </h3>
                <ul className="financial-list">
                  <li>
                    <strong>Ціна:</strong> {selectedTraining.price}{' '}
                    {selectedTraining.currency}
                  </li>
                  <li>
                    <strong>Макс. прибуток:</strong>{' '}
                    {(
                      (participantsMap[selectedTraining._id]?.length || 0) +
                      parseInt(selectedTraining.spots, 10)
                    ) *
                      selectedTraining.price}{' '}
                    {selectedTraining.currency}
                  </li>
                  <li>
                    <strong>Заповненість:</strong>{' '}
                    {Math.round(
                      ((participantsMap[selectedTraining._id]?.length || 0) /
                        ((participantsMap[selectedTraining._id]?.length || 0) +
                          parseInt(selectedTraining.spots, 10))) *
                        100
                    )}
                    %
                  </li>
                  <li>
                    <strong>Очікуваний прибуток:</strong>{' '}
                    {(
                      (participantsMap[selectedTraining._id]?.length || 0) *
                      selectedTraining.price
                    ).toFixed(2)}{' '}
                    {selectedTraining.currency}
                  </li>
                </ul>
              </div>
              <div className="modal-right">
                <h3 className="block-title">Учасники</h3>
                <div className="participants-list">
                  {(participantsMap[selectedTraining._id] || []).length > 0 ? (
                    participantsMap[selectedTraining._id].map((p, idx) => (
                      <div key={idx} className="participant-item">
                        <img
                          src={p.avatar_url || defaultAvatar}
                          alt={p.name}
                          className="participant-avatar"
                          onError={e => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = defaultAvatar;
                          }}
                        />
                        <div className="participant-details">
                          <button
                            className="link-button"
                            onClick={() => openAthleteModal(p.user_id)}
                          >
                            {p.name}
                          </button>
                          <p className="participant-age">Вік: {p.age}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-participants">
                      <em>Ніхто не записався.</em>
                    </p>
                  )}
                </div>
              </div>
            </div>
          }
        />
      )}

      {showAthleteModal && selectedAthlete && (
        <Modal
          modalType="info"
          className="athlete-detail-modal"
          onClose={closeAthleteModal}
          message={
            <div className="athlete-modal-container">
              <div className="profile-avatar-column">
                <img
                  src={selectedAthlete.avatar_url || defaultAvatar}
                  alt={selectedAthlete.name}
                  className="profile-avatar-large"
                  onError={e => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
              </div>
              <div className="profile-info-column">
                <h2 className="athlete-name">{selectedAthlete.name}</h2>
                <p className="info-row">
                  <strong>Вік:</strong> {selectedAthlete.age}
                </p>
                <p className="info-row">
                  <strong>Телефон:</strong> {selectedAthlete.phone || '—'}
                </p>
                {selectedAthlete.description && (
                  <div className="athlete-section">
                    <h3>Про себе</h3>
                    <p>{selectedAthlete.description}</p>
                  </div>
                )}
                {selectedAthlete.favorite_sports?.length > 0 && (
                  <div className="athlete-section">
                    <h3>Улюблені види спорту</h3>
                    <p>{selectedAthlete.favorite_sports.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
