import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import NavigationPanel from './NavigationPanel';
import AvailableTrainingsSection from './AvailableTrainingsSection';
import YourTrainingsSection from './YourTrainingsSection';
import HistorySection         from './HistorySection';
import ProfileSection from './ProfileSection';
import Modal from '../../Common/Modal';
import {
  API_BASE_URL,
  getTrainings,
  getAthleteTrainings,
  getAthleteProfile,
  getRecommendations,
  getCoachProfile,
  getCoachReviews,
  submitReview,
  updateReview,
  deleteReview,
  signupForTraining,
  cancelEnrollment,
  changeAthletePassword,
  updateAthleteProfile,
  uploadAthleteAvatar,
  getTrainingParticipants
} from '../../../services/api';
import './AthleteDashboard.css';

import footballLogo         from '../../../assets/logos/football.jpg';
import basketballLogo       from '../../../assets/logos/basketball.jpg';
import badmintonLogo        from '../../../assets/logos/badminton.jpg';
import volleyballLogo       from '../../../assets/logos/volleyball.jpg';
import baseballLogo         from '../../../assets/logos/baseball.jpg';
import rugbyLogo            from '../../../assets/logos/rugby.jpg';
import hockeyLogo           from '../../../assets/logos/hockey.jpg';
import karateLogo           from '../../../assets/logos/karate.jpg';
import boxingLogo           from '../../../assets/logos/boxing.jpg';
import wushuLogo            from '../../../assets/logos/wushu.jpg';
import jiuJitsuLogo         from '../../../assets/logos/jiu_jitsu.jpg';
import mmaLogo              from '../../../assets/logos/mma.jpg';
import runningLogo          from '../../../assets/logos/running.jpg';
import jumpingLogo          from '../../../assets/logos/jumping.jpg';
import throwingLogo         from '../../../assets/logos/throwing.jpg';
import swimmingLogo         from '../../../assets/logos/swimming.jpg';
import sailingLogo          from '../../../assets/logos/sailing.jpg';
import canoeingLogo         from '../../../assets/logos/canoeing.jpg';
import skateboardingLogo    from '../../../assets/logos/skateboarding.jpg';
import snowboardingLogo     from '../../../assets/logos/snowboarding.jpg';
import climbingLogo         from '../../../assets/logos/climbing.jpg';
import fitnessLogo          from '../../../assets/logos/fitness.jpg';
import strengthTrainingLogo from '../../../assets/logos/strength_training.jpg';
import yogaLogo             from '../../../assets/logos/yoga.jpg';

const sportLogos = {
  "Футбол": footballLogo,
  "Баскетбол": basketballLogo,
  "Бадмінтон": badmintonLogo,
  "Волейбол": volleyballLogo,
  "Бейсбол": baseballLogo,
  "Регбі": rugbyLogo,
  "Хокей": hockeyLogo,
  "Карате": karateLogo,
  "Бокс": boxingLogo,
  "Ушу": wushuLogo,
  "Джиу-джитсу": jiuJitsuLogo,
  "ММА": mmaLogo,
  "Біг": runningLogo,
  "Стрибки": jumpingLogo,
  "Метання": throwingLogo,
  "Плавання": swimmingLogo,
  "Вітрильний спорт": sailingLogo,
  "Каноїзм": canoeingLogo,
  "Скейбординг": skateboardingLogo,
  "Сноубординг": snowboardingLogo,
  "Альпінізм": climbingLogo,
  "Фітнес": fitnessLogo,
  "Силові тренування": strengthTrainingLogo,
  "Йога": yogaLogo
};

const sportCategories = {
  "Ігри з м'ячем": ["Футбол","Баскетбол","Бадмінтон","Волейбол","Бейсбол","Регбі","Хокей"],
  "Бойові мистецтва": ["Карате","Бокс","Ушу","Джиу-джитсу","ММА"],
  "Легка атлетика": ["Біг","Стрибки","Метання"],
  "Водні види спорту": ["Плавання","Вітрильний спорт","Каноїзм"],
  "Екстремальні види спорту": ["Скейбординг","Сноубординг","Альпінізм"],
  "Фітнес та тренажерний зал": ["Фітнес","Силові тренування","Йога"]
};

const DEFAULT_AVATAR = `${API_BASE_URL}/avatars/default.png`;

export default function AthleteDashboard() {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('available');
  const [allTrainings, setAllTrainings]               = useState([]);
  const [registeredTrainings, setRegisteredTrainings] = useState([]);
  const [recommendations, setRecommendations]         = useState([]);
  const [profile, setProfile]                         = useState(null);
  const [error, setError]                             = useState('');
  const [modalMessage, setModalMessage]                = useState('');
  const [showModal, setShowModal]                      = useState(false);
  const [showCancelConfirm, setShowCancelConfirm]      = useState(false);
  const [toCancel, setToCancel]                        = useState(null);
  const [coachProfile, setCoachProfile]                = useState(null);
  const [showCoachModal, setShowCoachModal]            = useState(false);
  const [coachError, setCoachError]                    = useState('');
  const [reviews, setReviews]                          = useState([]);
  const [avgRating, setAvgRating]                      = useState(null);
  const [reviewCount, setReviewCount]                  = useState(0);
  const [newRating, setNewRating]                      = useState(5);
  const [newComment, setNewComment]                    = useState('');
  const [editingReviewId, setEditingReviewId]          = useState(null);
  const [editProfileMode, setEditProfileMode]          = useState(false);
  const [nameInput, setNameInput]                      = useState('');
  const [ageInput, setAgeInput]                        = useState('');
  const [phoneInput, setPhoneInput]                    = useState('');
  const [descriptionInput, setDescriptionInput]        = useState('');
  const [favoriteSports, setFavoriteSports]            = useState([]);
  const [avatarFile, setAvatarFile]                    = useState(null);
  const [avatarPreview, setAvatarPreview]              = useState('');
  const [profileError, setProfileError]                = useState('');
  const [showProfileSuccess, setShowProfileSuccess]    = useState(false);
  const [showPassMode, setShowPassMode]                = useState(false);
  const [oldPass, setOldPass]                          = useState('');
  const [newPass, setNewPass]                          = useState('');
  const [confirmPass, setConfirmPass]                  = useState('');
  const [passError, setPassError]                      = useState('');
  const [passSuccess, setPassSuccess]                  = useState(false);
  const [showAvatarSuccess, setShowAvatarSuccess] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSection, setFilterSection]   = useState('');
  const [sortOption, setSortOption]         = useState('date_asc');
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [participants, setParticipants]         = useState([]);

  useEffect(() => {
    const athleteId = localStorage.getItem('userId');
    if (!athleteId) {
      setError('Будь ласка, увійдіть як спортсмен');
      return;
    }

    Promise.all([
      getTrainings(),
      getAthleteTrainings(athleteId),
      getAthleteProfile(athleteId),
      getRecommendations(athleteId)
    ])
      .then(([allRes, regRes, profRes, recRes]) => {
        setAllTrainings(allRes.trainings);
        setRegisteredTrainings(regRes.trainings);
        const prof = profRes.profile;
        setProfile(prof);
        setNameInput(prof.name);
        setAgeInput(prof.age);
        setPhoneInput(prof.phone || '');
        setDescriptionInput(prof.description || '');
        setFavoriteSports(prof.favorite_sports || []);
        setAvatarPreview(
          prof.avatar_url
            ? `${prof.avatar_url}?t=${Date.now()}`
            : DEFAULT_AVATAR
        );

        const enriched = recRes.recommendations.map(r => {
          const full = allRes.trainings.find(t => t._id === r.id);
          return full ? { ...full, ...r } : { ...r };
        });
        setRecommendations(enriched);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  const fetchAllTrainings = async () => {
    try {
      const { trainings } = await getTrainings();
      setAllTrainings(trainings);
    } catch (err) {
      setError(err.message);
    }
  };
  const fetchRegisteredTrainings = async () => {
    const athleteId = localStorage.getItem('userId');
    try {
      const { trainings } = await getAthleteTrainings(athleteId);
      setRegisteredTrainings(trainings);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = iso =>
    new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatTime = iso =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleFilterCategory = cat => {
    setFilterCategory(cat);
    setFilterSection('');
  };
  const handleFilterSection = sec => setFilterSection(sec);
  const handleSortOption = opt => setSortOption(opt);

  const handleSignup = async trainingId => {
    setError('');
    const athleteId = localStorage.getItem('userId');
    try {
      const res = await signupForTraining(trainingId, athleteId);
      setModalMessage(res.message);
      setShowModal(true);
      fetchAllTrainings();
      fetchRegisteredTrainings();
      setRecommendations(prev => prev.filter(r => r._id !== trainingId));
    } catch (err) {
      setError(err.message);
    }
  };
  const openCancelConfirm = training => {
    setToCancel(training);
    setShowCancelConfirm(true);
  };
  const handleCancelEnrollment = async () => {
    const athleteId = localStorage.getItem('userId');
    try {
      await cancelEnrollment(toCancel._id, athleteId);
      setModalMessage('Запис успішно скасовано.');
      setShowModal(true);
      setShowCancelConfirm(false);
      fetchAllTrainings();
      fetchRegisteredTrainings();
    } catch (err) {
      setError(err.message);
      setShowCancelConfirm(false);
    }
  };

  const handleRefreshRecommendations = async () => {
    try {
      const athleteId = localStorage.getItem('userId');
      const { recommendations: recs } = await getRecommendations(athleteId);
      const enriched = recs.map(r => {
        const full = allTrainings.find(t => t._id === r.id);
        return full ? { ...full, ...r } : { ...r };
      });
      setRecommendations(enriched);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewDetails = async training => {
    setSelectedTraining(training);
    try {
      const { participants } = await getTrainingParticipants(training._id);
      setParticipants(participants);
      setShowModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCoachClick = async coachId => {
    setCoachError('');
    try {
      const { profile: coach } = await getCoachProfile(coachId);
      setCoachProfile(coach);
      const { reviews: raw, average_rating, count } = await getCoachReviews(coachId);
      const withAvatars = await Promise.all(
        raw.map(async r => {
          if (!r.athlete_id) return { ...r, athlete_avatar_url: DEFAULT_AVATAR };
          try {
            const { profile: ath } = await getAthleteProfile(r.athlete_id);
            const url = ath.avatar_url
              ? (ath.avatar_url.startsWith('http') ? ath.avatar_url : `${API_BASE_URL}${ath.avatar_url}`)
              : DEFAULT_AVATAR;
            return { ...r, athlete_avatar_url: `${url}?t=${Date.now()}` };
          } catch {
            return { ...r, athlete_avatar_url: DEFAULT_AVATAR };
          }
        })
      );
      setReviews(withAvatars);
      setAvgRating(average_rating);
      setReviewCount(count);
      setNewRating(5);
      setNewComment('');
      setEditingReviewId(null);
      setShowCoachModal(true);
    } catch (err) {
      setCoachError(err.message);
    }
  };

  const handleSubmitReview = async () => {
    const athleteId = localStorage.getItem('userId');
    if (!newComment.trim()) {
      setCoachError('Коментар не може бути порожнім');
      return;
    }
    if (!athleteId) {
      setCoachError('Увійдіть, щоб залишити відгук');
      return;
    }
    try {
      if (editingReviewId) {
        await updateReview(editingReviewId, {
          athlete_id: athleteId,
          rating: newRating,
          comment: newComment
        });
      } else {
        await submitReview({
          coach_id: coachProfile.user_id,
          athlete_id: athleteId,
          rating: newRating,
          comment: newComment
        });
      }

      const { reviews: raw, average_rating, count } = await getCoachReviews(coachProfile.user_id);
      const withAvatars = await Promise.all(
        raw.map(async r => {
          if (!r.athlete_id) return { ...r, athlete_avatar_url: DEFAULT_AVATAR };
          try {
            const { profile: ath } = await getAthleteProfile(r.athlete_id);
            const url = ath.avatar_url
              ? (ath.avatar_url.startsWith('http') ? ath.avatar_url : `${API_BASE_URL}${ath.avatar_url}`)
              : DEFAULT_AVATAR;
            return { ...r, athlete_avatar_url: `${url}?t=${Date.now()}` };
          } catch {
            return { ...r, athlete_avatar_url: DEFAULT_AVATAR };
          }
        })
      );
      setReviews(withAvatars);
      setAvgRating(average_rating);
      setReviewCount(count);
      setEditingReviewId(null);
      setNewRating(5);
      setNewComment('');
    } catch (err) {
      setCoachError(err.message);
    }
  };
  const handleDeleteReview = async id => {
    setCoachError('');
    const athleteId = localStorage.getItem('userId');
    try {
      await deleteReview(id, athleteId);
      const { reviews: raw, average_rating, count } = await getCoachReviews(coachProfile.user_id);
      const withAvatars = await Promise.all(
        raw.map(async r => {
          if (!r.athlete_id) return { ...r, athlete_avatar_url: DEFAULT_AVATAR };
          try {
            const { profile: ath } = await getAthleteProfile(r.athlete_id);
            const url = ath.avatar_url
              ? (ath.avatar_url.startsWith('http') ? ath.avatar_url : `${API_BASE_URL}${ath.avatar_url}`)
              : DEFAULT_AVATAR;
            return { ...r, athlete_avatar_url: `${url}?t=${Date.now()}` };
          } catch {
            return { ...r, athlete_avatar_url: DEFAULT_AVATAR };
          }
        })
      );
      setReviews(withAvatars);
      setAvgRating(average_rating);
      setReviewCount(count);
      setEditingReviewId(null);
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      setCoachError(err.message);
    }
  };
  const startEditReview = r => {
    setCoachError('');
    setEditingReviewId(r.id);
    setNewRating(r.rating);
    setNewComment(r.comment);
  };

  const handleProfileFieldChange = e => {
    const { name, value } = e.target;
    switch (name) {
      case 'nameInput': setNameInput(value); break;
      case 'ageInput': setAgeInput(value); break;
      case 'phoneInput': setPhoneInput(value); break;
      case 'descriptionInput': setDescriptionInput(value); break;
      case 'oldPass': setOldPass(value); break;
      case 'newPass': setNewPass(value); break;
      case 'confirmPass': setConfirmPass(value); break;
      default: break;
    }
  };
  const toggleSport = sport => {
    setFavoriteSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    if (!nameInput.trim()) {
      setProfileError('Поле "Ім\'я" обов\'язкове');
      return;
    }
    const ageNum = parseInt(ageInput, 10);
    if (isNaN(ageNum) || ageNum < 18) {
      setProfileError('Вік має бути ≥ 18');
      return;
    }
    try {
      const { profile: updated } = await updateAthleteProfile({
        user_id: profile.user_id,
        name: nameInput.trim(),
        age: ageNum,
        phone: phoneInput,
        description: descriptionInput,
        favorite_sports: favoriteSports
      });
      setProfile(updated);
      setShowProfileSuccess(true);
      setEditProfileMode(false);
    } catch (err) {
      setProfileError(err.message);
    }
  };
  const cancelEditProfile = () => {
    setEditProfileMode(false);
    setProfileError('');
    setNameInput(profile.name);
    setAgeInput(profile.age);
    setPhoneInput(profile.phone || '');
    setDescriptionInput(profile.description || '');
    setFavoriteSports(profile.favorite_sports || []);
  };

  const handleAvatarFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setProfileError('');
    try {
      const { avatar_url } = await uploadAthleteAvatar(profile.user_id, avatarFile);
      const fullUrl = avatar_url.startsWith('http') ? avatar_url : `${API_BASE_URL}${avatar_url}`;
      setAvatarPreview(`${fullUrl}?t=${Date.now()}`);
      setProfile(prev => ({ ...prev, avatar_url: fullUrl }));
      setAvatarFile(null);
      setShowAvatarSuccess(true);
    } catch (err) {
      setProfileError(err.message);
    }
  };

  const handleChangePassword = async () => {
    setPassError('');
    if (newPass !== confirmPass) {
      setPassError('Паролі не співпадають');
      return;
    }
    try {
      await changeAthletePassword({
        user_id: profile.user_id,
        old_password: oldPass,
        new_password: newPass,
        confirm_password: confirmPass
      });
      setPassSuccess(true);
      setShowPassMode(false);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      setPassError(err.message);
    }
  };

  const closePassSuccess = () => setPassSuccess(false);
  const now = new Date();
  const upcomingRegistered = registeredTrainings.filter(
    t => new Date(t.start_time) > now
  );
  const historyTrainings = registeredTrainings.filter(
    t => new Date(t.start_time) <= now
  );

  return (
    <div className="dashboard-container">
      {error && <p className="error-message">{error}</p>}

      <NavigationPanel activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'available' && (
          <AvailableTrainingsSection
         allTrainings={allTrainings}
         registeredTrainings={registeredTrainings}
         recommendations={recommendations}
         filterCategory={filterCategory}
         filterSection={filterSection}
         sortOption={sortOption}
         onFilterCategory={setFilterCategory}
         onFilterSection={setFilterSection}
         onSortOption={setSortOption}
         onResetFilters={() => {
           setFilterCategory('');
           setFilterSection('');
           setSortOption('date_asc');
         }}
         sportCategories={sportCategories}
         sportLogos={sportLogos}
         onSignup={handleSignup}
         onViewCoach={handleCoachClick}
         onRefreshRecs={handleRefreshRecommendations}
        />
      )}

      {activeTab === 'registered' && (
        <YourTrainingsSection
          registeredTrainings={upcomingRegistered}
          sportLogos={sportLogos}
          onViewDetails={handleViewDetails}
          onCancel={openCancelConfirm}
          onViewCoach={handleCoachClick}
        />
      )}

      {activeTab === 'history' && (
        <HistorySection
          historyTrainings={historyTrainings}
          sportLogos={sportLogos}
          onViewDetails={handleViewDetails}
          onViewCoach={handleCoachClick}
        />
      )}

      {activeTab === 'profile' && profile && (
        <ProfileSection
          profile={profile}
          editMode={editProfileMode}
          nameInput={nameInput}
          ageInput={ageInput}
          phoneInput={phoneInput}
          descriptionInput={descriptionInput}
          favoriteSports={favoriteSports}
          allSections={Object.values(sportCategories).flat()}
          onToggleEditMode={() => setEditProfileMode(true)}
          onChangeField={handleProfileFieldChange}
          toggleSport={toggleSport}
          onSaveProfile={handleSaveProfile}
          onCancelEdit={cancelEditProfile}
          avatarPreview={avatarPreview}
          avatarFile={avatarFile}
          onAvatarFileChange={handleAvatarFileChange}
          onAvatarUpload={handleAvatarUpload}
          showProfileSuccess={showProfileSuccess}
          onCloseProfileSuccess={() => setShowProfileSuccess(false)}
          showPassMode={showPassMode}
          onTogglePasswordMode={() => setShowPassMode(true)}
          oldPass={oldPass}
          newPass={newPass}
          confirmPass={confirmPass}
          onChangePassword={handleChangePassword}
          onCancelPassword={() => setShowPassMode(false)}
          passError={passError}
          passSuccess={passSuccess}
          showAvatarSuccess={showAvatarSuccess}
          onCloseAvatarSuccess={() => setShowAvatarSuccess(false)}
          onClosePassSuccess={closePassSuccess}
        />
      )}

      {showModal && !selectedTraining && (
        <Modal modalType="success" message={modalMessage} onClose={() => setShowModal(false)} />
      )}

      {showModal && selectedTraining && (
        <Modal
          modalType="info"
          onClose={() => { setShowModal(false); setSelectedTraining(null); }}
          className="training-detail-modal"
          message={
            <div className="training-detail-modal">
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
                    <p><strong>Дата:</strong> {formatDate(selectedTraining.start_time)}</p>
                    <p><strong>Час:</strong> {`${formatTime(selectedTraining.start_time)} – ${formatTime(selectedTraining.end_time)}`}</p>
                    <p><strong>Ціна:</strong> {selectedTraining.price} {selectedTraining.currency}</p>
                    <p><strong>Тренер:</strong>{' '}
                      <span className="coach-name-link" onClick={() => handleCoachClick(selectedTraining.coach_id)}>
                        {selectedTraining.coach_name}
                      </span>
                    </p>
                    <p><strong>Учасників:</strong> {participants.length}</p>
                  </div>
                </div>
              </div>
              <div className="modal-right">
                <h3 className="block-title">Учасники</h3>
                <div className="participants-list">
                  {participants.length > 0 ? participants.map(p => (
                    <div key={p.user_id} className="participant-item">
                      <img
                        src={p.avatar_url || DEFAULT_AVATAR}
                        alt={p.name}
                        className="participant-avatar"
                        onError={e => { e.currentTarget.src = DEFAULT_AVATAR; }}
                      />
                      <div className="participant-details">
                        <p className="participant-name">{p.name}</p>
                        <p className="participant-age">Вік: {p.age}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="no-participants"><em>Ніхто не записався.</em></p>
                  )}
                </div>
              </div>
            </div>
          }
        />
      )}

      {showCancelConfirm && (
        <Modal
          modalType="confirm"
          onClose={() => setShowCancelConfirm(false)}
          message={
            <div className="cancel-modal">
              <p>Ви впевнені, що хочете скасувати запис?</p>
              <div className="cancel-modal-buttons">
                <button className="confirm-btn" onClick={handleCancelEnrollment}>Так</button>
                <button className="cancel-btn" onClick={() => setShowCancelConfirm(false)}>Ні</button>
              </div>
            </div>
          }
        />
      )}

      {showCoachModal && coachProfile && (
        <Modal
          modalType="info"
          onClose={() => setShowCoachModal(false)}
          className="coach-detail-modal"
          message={
            <div className="coach-details-container">
              <div className="coach-info-block">
                <img
                  src={coachProfile.avatar_url || DEFAULT_AVATAR}
                  alt={coachProfile.name}
                  className="coach-avatar-large"
                />
                <h3 className="coach-name">{coachProfile.name}</h3>
                <p><strong>Вік:</strong> {coachProfile.age}</p>
                <p><strong>Email:</strong> {coachProfile.email}</p>
                <p><strong>Телефон:</strong> {coachProfile.phone || '—'}</p>
                <p><strong>Опис:</strong> {coachProfile.description || <em>—</em>}</p>
                <p><strong>Улюблені спорт:</strong> {(coachProfile.favorite_sports||[]).join(', ') || <em>—</em>}</p>
                <div className="reviews-summary-block">
                  <p><strong>Середня оцінка:</strong> {avgRating ?? '—'}</p>
                  <p><strong>Відгуків:</strong> {reviewCount}</p>
                </div>
                {coachError && <p className="error-message">{coachError}</p>}
              </div>
              <div className="coach-reviews-block">
                <h4>Відгуки</h4>
                <div className="reviews-list-scroll">
                  {reviews.length > 0 ? reviews.map(r => (
                    <div key={r.id} className="review-card">
                      <div className="review-card-header">
                        <div className="review-user-info">
                          <img
                            src={r.athlete_avatar_url || DEFAULT_AVATAR}
                            alt="Avatar"
                            className="reviewer-avatar-small"
                          />
                          <span className="review-username">{r.athlete_name || 'Анонім'}</span>
                        </div>
                        <div className="review-meta">
                          <span className="review-rating">{'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</span>
                          <small className="review-date">
                            {new Date(r.created_at).toLocaleDateString('uk-UA', { day:'2-digit', month:'2-digit', year:'numeric' })}
                          </small>
                        </div>
                      </div>
                      <p className="review-text">{r.comment}</p>
                      {r.athlete_id === localStorage.getItem('userId') && (
                        <div className="review-actions">
                          <button onClick={() => startEditReview(r)}>Редагувати</button>
                          <button onClick={() => handleDeleteReview(r.id)}>Видалити</button>
                        </div>
                      )}
                    </div>
                  )) : (
                    <p className="no-reviews"><em>Немає відгуків</em></p>
                  )}
                </div>
                <div className="submit-review">
                  <h4>{editingReviewId ? 'Редагувати відгук' : 'Залишити відгук'}</h4>
                  {coachError && <p className="error-message">{coachError}</p>}
                  <label>Оцінка:</label>
                  <select value={newRating} onChange={e => setNewRating(+e.target.value)}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
                  </select>
                  <label>Коментар:</label>
                  <textarea
                    className="review-textarea"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Ваш відгук..."
                  />
                  <button
                    className="submit-review-btn"
                    disabled={!newComment.trim()}
                    onClick={handleSubmitReview}
                  >{editingReviewId ? 'Оновити відгук' : 'Відправити відгук'}</button>
                </div>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
