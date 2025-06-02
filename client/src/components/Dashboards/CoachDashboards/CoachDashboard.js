import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import NavigationPanel from './NavigationPanel';
import MyTrainingSection from './MyTrainingSection';
import HistorySection from './HistorySection';
import CreateTrainingSection from './CreateTrainingSection';
import ProfileSection from './ProfileSection';
import ReviewsSection from './ReviewsSection';
import Modal from '../../Common/Modal';
import {
  createTraining,
  getCoachTrainings,
  getTrainingParticipants,
  updateTraining,
  deleteTraining,
  getCoachProfile,
  getAthleteProfile,
  updateCoachProfile,
  changeCoachPassword,
  uploadCoachAvatar,
  getCoachReviews,
  API_BASE_URL
} from '../../../services/api';
import './CoachDashboards.css';

const sportLogos = {
  "Футбол":        require('../../../assets/logos/football.jpg'),
  "Баскетбол":     require('../../../assets/logos/basketball.jpg'),
  "Бадмінтон":     require('../../../assets/logos/badminton.jpg'),
  "Волейбол":      require('../../../assets/logos/volleyball.jpg'),
  "Бейсбол":       require('../../../assets/logos/baseball.jpg'),
  "Регбі":         require('../../../assets/logos/rugby.jpg'),
  "Хокей":         require('../../../assets/logos/hockey.jpg'),
  "Карате":        require('../../../assets/logos/karate.jpg'),
  "Бокс":          require('../../../assets/logos/boxing.jpg'),
  "Ушу":           require('../../../assets/logos/wushu.jpg'),
  "Джиу-джитсу":   require('../../../assets/logos/jiu_jitsu.jpg'),
  "ММА":           require('../../../assets/logos/mma.jpg'),
  "Біг":           require('../../../assets/logos/running.jpg'),
  "Стрибки":       require('../../../assets/logos/jumping.jpg'),
  "Метання":       require('../../../assets/logos/throwing.jpg'),
  "Плавання":      require('../../../assets/logos/swimming.jpg'),
  "Вітрильний спорт":  require('../../../assets/logos/sailing.jpg'),
  "Каноїзм":           require('../../../assets/logos/canoeing.jpg'),
  "Скейбординг":       require('../../../assets/logos/skateboarding.jpg'),
  "Сноубординг":       require('../../../assets/logos/snowboarding.jpg'),
  "Альпінізм":         require('../../../assets/logos/climbing.jpg'),
  "Фітнес":            require('../../../assets/logos/fitness.jpg'),
  "Силові тренування": require('../../../assets/logos/strength_training.jpg'),
  "Йога":              require('../../../assets/logos/yoga.jpg')
};

const sportCategories = {
  "Ігри з м'ячем":           ["Футбол","Баскетбол","Бадмінтон","Волейбол","Бейсбол","Регбі","Хокей"],
  "Бойові мистецтва":        ["Карате","Бокс","Ушу","Джиу-джитсу","ММА"],
  "Легка атлетика":          ["Біг","Стрибки","Метання"],
  "Водні види спорту":       ["Плавання","Вітрильний спорт","Каноїзм"],
  "Екстремальні види спорту":["Скейбординг","Сноубординг","Альпінізм"],
  "Фітнес та тренажерний зал":["Фітнес","Силові тренування","Йога"]
};

const defaultAvatar = `${API_BASE_URL}/avatars/default.png`;

export default function CoachDashboard() {
  const history = useHistory();
  const handleLogout = () => {
    localStorage.removeItem('userId');
    history.push('/');
  };

  const [activeTab, setActiveTab] = useState('my-trainings');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    setShowCreateForm(false);
  }, [activeTab]);

  const [trainingData, setTrainingData] = useState({
    date: '', start_time: '', end_time: '',
    price: '', spots: '', currency: 'UAH',
    category: '', section: ''
  });
  const [errors, setErrors] = useState({});
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [trainings, setTrainings] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [athleteProfile, setAthleteProfile] = useState(null);
  const [showAthleteModal, setShowAthleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    date:'', start_time:'', end_time:'',
    price:'', spots:'', currency:'',
    category:'', section:''
  });

   const now = new Date();
  const pastTrainings = React.useMemo(
   () => trainings.filter(t => new Date(t.end_time) < now)
       .sort((a,b)=> new Date(b.start_time)-new Date(a.start_time)),
   [trainings]
  );

  const [profile, setProfile] = useState(null);
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [description, setDescription] = useState('');
  const [favoriteSports, setFavoriteSports] = useState([]);
  const [profileError, setProfileError] = useState('');
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [showAvatarSuccess, setShowAvatarSuccess] = useState(false);
  const [showPassMode, setShowPassMode] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const reviewSectionRef = useRef(null);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [showErrorModal, setShowErrorModal]     = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const allSections = Object.values(sportCategories).flat();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrainings();
    fetchProfileAndReviews();
  }, []);

  async function fetchTrainings() {
    setIsLoading(true);
    const coachId = localStorage.getItem('userId');
    if (!coachId) {
      setIsLoading(false);
      return;
    }
    try {
      const { trainings } = await getCoachTrainings(coachId);
      setTrainings(trainings.map(t => ({
        ...t,
        spots: typeof t.spots === 'string'
          ? parseInt(t.spots, 10)
          : t.spots
      })));
    } catch (err) {
      console.error('Помилка завантаження тренувань:', err);
    } finally {
      setIsLoading(false);
    }
  }
  async function fetchProfileAndReviews() {
    const coachId = localStorage.getItem('userId');
    if (!coachId) return;
    try {
      const { profile } = await getCoachProfile(coachId);
      setProfile(profile);
      setNameInput(profile.name);
      setAgeInput(profile.age);
      setPhoneInput(profile.phone || '');
      setDescription(profile.description || '');
      setFavoriteSports(profile.favorite_sports || []);
      setAvatarPreview(
        profile.avatar_url
          ? `${profile.avatar_url}?t=${Date.now()}`
          : defaultAvatar
      );
      const { reviews, average_rating, count } = await getCoachReviews(coachId);
      const withAvatars = await Promise.all(
        reviews.map(async r => {
          if (!r.athlete_id) return { ...r, athlete_avatar_url: null };
          try {
            const { profile: athlete } = await getAthleteProfile(r.athlete_id);
            return { ...r, athlete_avatar_url: athlete.avatar_url || null };
          } catch {
            return { ...r, athlete_avatar_url: null };
          }
        })
      );
      setReviews(withAvatars);
      setAvgRating(average_rating);
      setReviewCount(count);
    } catch (err) {
      console.error('Помилка завантаження профілю/відгуків:', err);
    }
  }

  function getMinTime() {
    return trainingData.date === today
      ? new Date().toTimeString().slice(0, 5)
      : '00:00';
  }

  function getEditMinTime() {
  const todayStr = new Date().toISOString().split('T')[0];
  return editData.date === todayStr
    ? new Date().toTimeString().slice(0, 5)
    : '00:00';
}

  function handleChange(e) {
    setTrainingData({ ...trainingData, [e.target.name]: e.target.value });
  }
  function handleCategoryChange(e) {
    setTrainingData({ ...trainingData, category: e.target.value, section: '' });
  }
  async function handleSubmit(e) {
  e.preventDefault();
  setShowErrorModal(false);
  setErrors({});

  const coachId = localStorage.getItem('userId');
  if (!coachId) {
    setErrorModalMessage('Будь ласка, увійдіть повторно.');
    setShowErrorModal(true);
    return;
  }

  if (!trainingData.date || !trainingData.start_time || !trainingData.end_time) {
    setErrorModalMessage('Оберіть дату та час.');
    setShowErrorModal(true);
    return;
  }
  if (!trainingData.category || !trainingData.section) {
    setErrorModalMessage('Оберіть категорію та секцію.');
    setShowErrorModal(true);
    return;
  }
  if (trainingData.start_time >= trainingData.end_time) {
    setErrorModalMessage('Час завершення має бути пізніше початку.');
    setShowErrorModal(true);
    return;
  }
  if (parseFloat(trainingData.price) < 0) {
    setErrorModalMessage('Ціна не може бути від’ємною.');
    setShowErrorModal(true);
    return;
  }

  const startDT = new Date(`${trainingData.date}T${trainingData.start_time}`);
  if (startDT < new Date()) {
    setErrorModalMessage('Не можна створювати тренування у минулому.');
    setShowErrorModal(true);
    return;
  }

  const payload = {
    coach_id: coachId,
    coach_name: profile.name,
    start_time: `${trainingData.date}T${trainingData.start_time}`,
    end_time:   `${trainingData.date}T${trainingData.end_time}`,
    price:      parseFloat(trainingData.price),
    spots:      parseInt(trainingData.spots, 10),
    currency:   trainingData.currency,
    category:   trainingData.category,
    section:    trainingData.section,
  };

  try {
    await createTraining(payload);
    setModalMessage('Тренування успішно створено!');
    setShowModal(true);
    setTrainingData({
      date: '', start_time: '', end_time: '',
      price: '', spots: '', currency: 'UAH',
      category: '', section: ''
    });
    fetchTrainings();
    setShowCreateForm(false);

  } catch (err) {
    let msg = err.message || 'Невідома помилка при створенні тренування.';
    if (msg.toLowerCase().includes('conflict')) {
      msg = 'Дане тренування накладається за часом на вже існуюче – оберіть інший проміжок.';
    }
    setErrorModalMessage(msg);
    setShowErrorModal(true);
  }
}

  async function handleViewParticipants(training) {
    const freeSeats = typeof training.spots === 'string'
      ? parseInt(training.spots, 10)
      : training.spots;
    setSelectedTraining({ ...training, spots: freeSeats });
    try {
      const { participants: fromServer } = await getTrainingParticipants(training._id);
      setParticipants(fromServer);
      setShowParticipantsModal(true);
      setEditMode(false);
    } catch (err) {
      console.error('Помилка завантаження учасників:', err);
    }
  }

  async function handleViewAthlete(athleteId) {
  try {
    const { profile } = await getAthleteProfile(athleteId);
    setAthleteProfile(profile);
    setShowAthleteModal(true);
  } catch (err) {
    console.error('Не вдалося завантажити дані спортсмена:', err);
  }
  }

  function handleDeleteClick(training) {
    setTrainingToDelete(training);
    setShowDeleteConfirm(true);
  }
  async function confirmDelete() {
    try {
      await deleteTraining(trainingToDelete._id);
      setModalMessage('Тренування успішно видалено.');
      setShowModal(true);
      fetchTrainings();
    } catch (err) {
      setModalMessage(`Помилка: ${err.message}`);
      setShowModal(true);
    } finally {
      setShowDeleteConfirm(false);
      setTrainingToDelete(null);
    }
  }
  function cancelDelete() {
    setShowDeleteConfirm(false);
    setTrainingToDelete(null);
  }
  function handleEdit() {
    const t = selectedTraining;
    const signed = t.participants?.length || 0;
    const freeSeats = parseInt(t.spots, 10);
    const totalCapacity = signed + freeSeats;
    setEditData({
      date: new Date(t.start_time).toISOString().split('T')[0],
      start_time: new Date(t.start_time).toTimeString().slice(0,5),
      end_time: new Date(t.end_time).toTimeString().slice(0,5),
      price: t.price,
      currency: t.currency,
      category: t.category,
      section: t.section,
      spots: totalCapacity.toString()
    });
    setEditMode(true);
  }
  function handleEditChange(e) {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  }
  async function handleEditSubmit(e) {
  e.preventDefault();
  setErrors({});

  const signed = selectedTraining.participants?.length || 0;
  const totalCapacity = parseInt(editData.spots, 10);

  if (!editData.date || !editData.start_time || !editData.end_time) {
    setErrors({ edit: 'Оберіть дату та час.' });
    return;
  }
  if (editData.start_time >= editData.end_time) {
    setErrors({ edit: 'Час завершення має бути пізніше часу початку.' });
    return;
  }
  const newStart = new Date(`${editData.date}T${editData.start_time}`);
  if (newStart < new Date()) {
    setErrors({ edit: 'Не можна створювати тренування у минулому часі.' });
    return;
  }
  if (isNaN(totalCapacity)) {
    setErrors({ edit: 'Кількість місць має бути числом.' });
    return;
  }
  if (totalCapacity < signed) {
    setErrors({ edit: `Загальна кількість (${totalCapacity}) менша за вже записані (${signed}).` });
    return;
  }

  const payload = {
    start_time: `${editData.date}T${editData.start_time}`,
    end_time:   `${editData.date}T${editData.end_time}`,
    price:      parseFloat(editData.price),
    currency:   editData.currency,
    category:   editData.category,
    section:    editData.section,
    spots:      totalCapacity
  };

  try {
    await updateTraining(selectedTraining._id, payload);
    setModalMessage('Тренування успішно оновлено!');
    setShowModal(true);
    setEditMode(false);
    fetchTrainings();
    setShowParticipantsModal(false);
  } catch (err) {
    console.error('handleEditSubmit error →', err);
    const status = err.response?.status;
    const detail = err.response?.data?.detail?.toLowerCase() || '';

    if (
      status === 400 &&
      detail.includes('накладається за часом')
    ) {
      setErrors({
        edit: 'Дане тренування накладається за часом на вже існуюче – оберіть інший проміжок.'
      });
      return;
    }

    const fallback = err.response?.data?.detail || err.message || 'Невідома помилка при оновленні';
    setErrors({ edit: fallback });
  }
}

  function cancelEdit() {
    setEditMode(false);
  }

  function closeParticipantsModal() {
  setShowParticipantsModal(false);
  setSelectedTraining(null);
  setEditMode(false);
  }

  function closeAthleteModal() {
  setShowAthleteModal(false);
  setAthleteProfile(null);
  }

  function handleProfileFieldChange(e) {
    const { name, value } = e.target;
    if (name === 'nameInput') setNameInput(value);
    if (name === 'ageInput') setAgeInput(value);
    if (name === 'phoneInput') setPhoneInput(value);
    if (name === 'description') setDescription(value);
    if (name === 'oldPass') setOldPass(value);
    if (name === 'newPass') setNewPass(value);
    if (name === 'confirmPass') setConfirmPass(value);
  }
  function toggleSport(sport) {
    setFavoriteSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  }
  async function handleSaveProfile() {
    setProfileError('');
    if (!nameInput.trim()) {
      setProfileError('Поле "Ім\'я" обов\'язкове');
      return;
    }
    const ageNum = parseInt(ageInput, 10);
    if (isNaN(ageNum)) {
      setProfileError('Поле "Вік" обов\'язкове');
      return;
    }
    if (ageNum < 18) {
      setProfileError('Вік не може бути менше 18 років');
      return;
    }
    try {
      await updateCoachProfile({
        user_id: profile.user_id,
        name: nameInput.trim(),
        age: ageNum,
        phone: phoneInput,
        description,
        favorite_sports: favoriteSports
      });
      setShowProfileSuccess(true);
      setEditProfileMode(false);
      fetchProfileAndReviews();
    } catch (err) {
      setProfileError(err.message);
    }
  }
  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }
  async function handleUploadAvatar() {
    if (!avatarFile) return;
    try {
      const { avatar_url } = await uploadCoachAvatar(profile.user_id, avatarFile);
      setAvatarPreview(avatar_url);
      fetchProfileAndReviews();
      setAvatarFile(null);
      setShowAvatarSuccess(true);
    } catch (err) {
      console.error('Помилка завантаження аватара:', err);
    }
  }
  async function handleChangePassword() {
    setPassError('');
    try {
      await changeCoachPassword({
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
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric'
    });
  }
  function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString([], {
      hour:   '2-digit',
      minute: '2-digit'
    });
  }

  return (
      <div className={`dashboard-container${showCreateForm ? ' shifted' : ''}`}>

      <NavigationPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

        {activeTab === 'my-trainings' && (
        <MyTrainingSection
          trainings={trainings.filter(t => new Date(t.end_time) > now)}
          isLoading={isLoading}
          showCreateForm={showCreateForm}
          toggleCreateForm={() => setShowCreateForm(v => !v)}
          trainingData={trainingData}
          errors={errors}
          onChangeField={handleChange}
          onChangeCategory={handleCategoryChange}
          onSubmit={handleSubmit}
          sportCategories={sportCategories}
          today={today}
          getMinTime={getMinTime}
          getEditMinTime={getEditMinTime}
          errorsEdit={errors.edit}
          onView={handleViewParticipants}
          onDelete={handleDeleteClick}
          sportLogos={sportLogos}
          selectedTraining={selectedTraining}
          participants={participants}
          showParticipantsModal={showParticipantsModal}
          editMode={editMode}
          editData={editData}
          handleEdit={handleEdit}
          handleEditChange={handleEditChange}
          handleEditSubmit={handleEditSubmit}
          cancelEdit={cancelEdit}
          closeParticipantsModal={closeParticipantsModal}
          onViewAthlete={handleViewAthlete}
          showAthleteModal={showAthleteModal}
          athleteProfile={athleteProfile}
          closeAthleteModal={closeAthleteModal}
        />
      )}

     {activeTab === 'history' && (
       <HistorySection
         trainings={pastTrainings}
         sportLogos={sportLogos}
       />
     )}

      {activeTab === 'profile' && profile && (
        <ProfileSection
          profile={profile}
          editMode={editProfileMode}
          nameInput={nameInput}
          ageInput={ageInput}
          phoneInput={phoneInput}
          description={description}
          favoriteSports={favoriteSports}
          allSections={allSections}
          profileError={profileError}
          showPassMode={showPassMode}
          oldPass={oldPass}
          newPass={newPass}
          confirmPass={confirmPass}
          passError={passError}
          onToggleEditMode={() => setEditProfileMode(true)}
          onChangeField={handleProfileFieldChange}
          onToggleSport={toggleSport}
          onSaveProfile={handleSaveProfile}
          onCancelEdit={() => setEditProfileMode(false)}
          onUploadAvatar={handleUploadAvatar}
          onTogglePasswordMode={() => setShowPassMode(true)}
          onChangePassword={handleChangePassword}
          onCancelPassword={() => setShowPassMode(false)}
          avatarPreview={avatarPreview}
          onAvatarFileChange={handleAvatarChange}
          avatarFile={avatarFile}
          reviews={reviews}
          avgRating={avgRating}
          reviewCount={reviewCount}
        />
      )}

      {activeTab === 'reviews' && (
        <ReviewsSection
          reviews={reviews}
          avgRating={avgRating}
          reviewCount={reviewCount}
        />
      )}

      {showDeleteConfirm && trainingToDelete && (
        <Modal
          modalType="confirm"
          onClose={cancelDelete}
          message={
            <div style={{ textAlign: 'center' }}>
              <p>
                Ви впевнені, що хочете видалити тренування<br/>
                <strong>{trainingToDelete.section}</strong> від {formatDate(trainingToDelete.start_time)}?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button className="submit-btn" onClick={confirmDelete}>Так</button>
                <button className="cancel-btn" onClick={cancelDelete}>Ні</button>
              </div>
            </div>
          }
        />
      )}

      {showModal && (
        <Modal modalType="success" message={modalMessage} onClose={() => setShowModal(false)} />
      )}
      {showAvatarSuccess && (
        <Modal modalType="success" message="Фото успішно завантажено!" onClose={() => setShowAvatarSuccess(false)} />
      )}
      {passSuccess && (
        <Modal modalType="success" message="Пароль успішно змінено!" onClose={() => setPassSuccess(false)} />
      )}
      {showProfileSuccess && (
        <Modal modalType="success" message="Профіль успішно оновлено!" onClose={() => setShowProfileSuccess(false)} />
      )}

        {showErrorModal && (
        <Modal
          modalType="error"
          className="error-modal"
          message={errorModalMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
}
