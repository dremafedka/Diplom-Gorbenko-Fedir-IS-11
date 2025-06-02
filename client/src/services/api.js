export const API_BASE_URL = 'http://localhost:8000';

async function checkResponse(res, defaultMsg) {
  if (!res.ok) {
    let errorText = defaultMsg;
    try {
      const errorData = await res.json();
      const detail = errorData.detail;
      const stripPrefix = text => text.replace(/^[^,]+,\s*/i, '');

      if (Array.isArray(detail)) {
        errorText = detail
          .map(err => stripPrefix(err.msg))
          .join('; ');
      } else if (typeof detail === 'string') {
        errorText = stripPrefix(detail);
      }
    } catch {
    }
    throw new Error(errorText);
  }
  return res.json();
}

export const registerUser = payload =>
  fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(res => checkResponse(res, 'Помилка при реєстрації'));

export const loginUser = credentials =>
  fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }).then(res => checkResponse(res, 'Помилка авторизації'));

export const getTrainings = async () => {
  const res = await fetch(`${API_BASE_URL}/trainings`);
  return checkResponse(res, 'Помилка отримання тренувань');
};

export const getAthleteTrainings = async athleteId => {
  const res = await fetch(
    `${API_BASE_URL}/athlete/trainings?athlete_id=${encodeURIComponent(athleteId)}`
  );
  return checkResponse(res, 'Помилка отримання тренувань спортсмена');
};

export const signupForTraining = (trainingId, athleteId) =>
  fetch(`${API_BASE_URL}/trainings/${trainingId}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ athlete_id: athleteId })
  }).then(res => checkResponse(res, 'Помилка запису на тренування'));

export const cancelEnrollment = (trainingId, athleteId) =>
  fetch(`${API_BASE_URL}/trainings/${trainingId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ athlete_id: athleteId })
  }).then(res => checkResponse(res, 'Помилка скасування запису'));

export const createTraining = async trainingData => {
  const res = await fetch(`${API_BASE_URL}/create-training`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trainingData)
  });
  return checkResponse(res, 'Помилка створення тренування');
};

export const getCoachTrainings = async coachId => {
  const res = await fetch(
    `${API_BASE_URL}/coach/trainings?coach_id=${encodeURIComponent(coachId)}`
  );
  return checkResponse(res, 'Помилка отримання тренувань тренера');
};

export const getTrainingParticipants = async trainingId => {
  const res = await fetch(`${API_BASE_URL}/trainings/${trainingId}/participants`);
  return checkResponse(res, 'Помилка отримання учасників тренування');
};

export const updateTraining = async (trainingId, updateData) => {
  const res = await fetch(`${API_BASE_URL}/trainings/${trainingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  return checkResponse(res, 'Помилка оновлення тренування');
};

export const deleteTraining = async trainingId => {
  const res = await fetch(
    `${API_BASE_URL}/trainings/${encodeURIComponent(trainingId)}`,
    { method: 'DELETE' }
  );
  return checkResponse(res, 'Помилка видалення тренування');
};

export const getCoachProfile = async coachId => {
  const res = await fetch(
    `${API_BASE_URL}/coach/profile?coach_id=${encodeURIComponent(coachId)}`
  );
  const data = await checkResponse(res, 'Помилка завантаження профілю');
  if (data.profile.avatar_url) {
    data.profile.avatar_url = `${API_BASE_URL}${data.profile.avatar_url}`;
  }
  return data;
};

export const updateCoachProfile = async payload => {
  const res = await fetch(`${API_BASE_URL}/coach/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await checkResponse(res, 'Помилка оновлення профілю');
  if (data.profile.avatar_url) {
    data.profile.avatar_url = `${API_BASE_URL}${data.profile.avatar_url}`;
  }
  return data;
};

export const changeCoachPassword = async payload => {
  const res = await fetch(`${API_BASE_URL}/coach/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return checkResponse(res, 'Помилка зміни пароля');
};

export const uploadCoachAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(
    `${API_BASE_URL}/coach/avatar?user_id=${encodeURIComponent(userId)}`,
    { method: 'POST', body: formData }
  );
  const data = await checkResponse(res, 'Помилка завантаження аватарки');
  return { avatar_url: `${API_BASE_URL}${data.avatar_url}` };
};

export const getCoachReviews = async coachId => {
  const res = await fetch(`${API_BASE_URL}/coach/${coachId}/reviews`);
  return checkResponse(res, 'Помилка завантаження відгуків');
};

export const submitReview = async review => {
  const res = await fetch(`${API_BASE_URL}/coach/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      coach_id: review.coach_id,
      athlete_id: review.athlete_id,
      rating: review.rating,
      comment: review.comment || ""
    })
  });
  return checkResponse(res, 'Помилка відправки відгуку');
};

export const updateReview = async (reviewId, review) => {
  const res = await fetch(`${API_BASE_URL}/coach/review/${reviewId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rating: review.rating,
      comment: review.comment || ""
    })
  });
  return checkResponse(res, 'Помилка оновлення відгуку');
};

export const deleteReview = async (reviewId, athleteId) => {
  const res = await fetch(
    `${API_BASE_URL}/coach/review/${reviewId}?athlete_id=${encodeURIComponent(athleteId)}`,
    { method: 'DELETE' }
  );
  return checkResponse(res, 'Помилка видалення відгуку');
};

export const getAthleteProfile = async athleteId => {
  const res = await fetch(
    `${API_BASE_URL}/athlete/profile?athlete_id=${encodeURIComponent(athleteId)}`
  );
  const data = await checkResponse(res, 'Помилка завантаження профілю');
  if (data.profile.avatar_url) {
    data.profile.avatar_url = `${API_BASE_URL}${data.profile.avatar_url}?t=${Date.now()}`;
  }
  return data;
};

export const updateAthleteProfile = async payload => {
  const res = await fetch(`${API_BASE_URL}/athlete/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await checkResponse(res, 'Помилка оновлення профілю');
  if (data.profile.avatar_url) {
    data.profile.avatar_url = `${API_BASE_URL}${data.profile.avatar_url}`;
  }
  return data;
};

export const changeAthletePassword = async payload => {
  const res = await fetch(`${API_BASE_URL}/athlete/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return checkResponse(res, 'Помилка зміни пароля');
};

export const uploadAthleteAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(
    `${API_BASE_URL}/athlete/avatar?user_id=${encodeURIComponent(userId)}`,
    { method: 'POST', body: formData }
  );
  const data = await checkResponse(res, 'Помилка завантаження аватарки');
  return { avatar_url: `${API_BASE_URL}${data.avatar_url}` };
};


export const getRecommendations = async athleteId => {
  const res = await fetch(
    `${API_BASE_URL}/recommendations?athlete_id=${encodeURIComponent(athleteId)}`
  );
  return checkResponse(res, 'Помилка отримання рекомендацій');
};