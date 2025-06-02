// src/pages/AuthPage.js
import React, { useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { registerUser, loginUser } from '../../services/api';
import Modal from '../../components/Common/Modal';
import { useHistory } from 'react-router-dom';
import '../../styles/Auth.css';

const AuthPage = () => {
  const [mode, setMode] = useState('register');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: ''
  });
  const [userType, setUserType] = useState('coach');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [role, setRole] = useState('');
  const history = useHistory();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async e => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Пароль має містити не менше 6 символів.');
      return;
    }
    const payload = {
      type: userType,
      data: {
        name: formData.name,
        age: parseInt(formData.age, 10),
        email: formData.email,
        password: formData.password
      }
    };
    try {
      await registerUser(payload);
      setModalMessage(
        `Акаунт типу ${userType === 'coach' ? 'Тренер' : 'Спортсмен'} успішно зареєстровано!`
      );
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await loginUser({
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userId', res.id);
      setModalMessage(
        `Ваш акаунт успішно авторизовано! Ласкаво просимо, ${res.name}!`
      );
      setRole(res.role);
      setShowModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (mode === 'register') {
      setMode('login');
      setError('');
      setFormData({ name: '', age: '', email: '', password: '' });
    } else if (mode === 'login') {
      if (role === 'athlete') {
        history.push('/athlete-dashboard');
      } else if (role === 'coach') {
        history.push('/coach-dashboard');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-panel">
        <div className="auth-info">
          <h1>Ласкаво просимо до Порталу Тренувань!</h1>
          <p>
            Відкрий нові можливості у спорті та розкрий свій потенціал разом з нами.
            Ми створені для того, щоб допомогти тобі досягти спортивних вершин.
          </p>
          <p className="auth-tagline">
            Ваш надійний партнёр у світі спорту.
          </p>
        </div>

        <div className="auth-form">
          <TransitionGroup component={null}>
            <CSSTransition
              key={mode}
              timeout={300}
              classNames="form-switch"
              unmountOnExit
              onEnter={node => { node.style.height = '0px'; }}
              onEntering={node => {
                const height = node.scrollHeight;
                node.style.height = `${height}px`;
              }}
              onEntered={node => { node.style.height = 'auto'; }}
              onExit={node => {
                node.style.height = `${node.scrollHeight}px`;
              }}
              onExiting={node => { node.style.height = '0px'; }}
            >
              {mode === 'register' ? (
                <div className="form-content">
                  <h2>Реєстрація</h2>
                  <div className="user-type">
                    <span>Оберіть тип користувача:</span>
                    <div className="user-type-buttons">
                      <button
                        type="button"
                        onClick={() => setUserType('coach')}
                        className={userType === 'coach' ? 'active' : ''}
                      >
                        Тренер
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('athlete')}
                        className={userType === 'athlete' ? 'active' : ''}
                      >
                        Спортсмен
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleRegister}>
                    <div className="form-group">
                      <input
                        type="text"
                        name="name"
                        placeholder="Ім'я"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <input
                        type="number"
                        name="age"
                        placeholder="Вік"
                        min="18"
                        value={formData.age}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {error && <p className="error">{error}</p>}

                    <div className="form-group">
                      <button type="submit" className="submit-btn">
                        Зареєструватися
                      </button>
                    </div>
                  </form>

                  <div className="toggle">
                    <span>Вже маєте акаунт?</span>
                    <span
                      className="toggle-link"
                      onClick={() => {
                        setMode('login');
                        setError('');
                        setFormData({ name: '', age: '', email: '', password: '' });
                      }}
                    >
                      Увійдіть
                    </span>
                  </div>
                </div>
              ) : (
                <div className="form-content">
                  <h2>Авторизація</h2>
                  <form onSubmit={handleLogin}>
                    <div className="form-group">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {error && <p className="error">{error}</p>}

                    {/* І тут теж */}
                    <div className="form-group">
                      <button type="submit" className="submit-btn">
                        Увійдіть
                      </button>
                    </div>
                  </form>

                  <div className="toggle">
                    <span>Ще не маєте акаунт?</span>
                    <span
                      className="toggle-link"
                      onClick={() => {
                        setMode('register');
                        setError('');
                        setFormData({ name: '', age: '', email: '', password: '' });
                      }}
                    >
                      Зареєструватися
                    </span>
                  </div>
                </div>
              )}
            </CSSTransition>
          </TransitionGroup>

          {showModal && (
            <Modal message={modalMessage} onClose={handleModalClose} />
          )}
        </div>
      </div>

      <footer className="auth-footer">
        <p>
          Технічна підтримка: +380 (68) 766-68-26 | Email: Gorbenko.Fedir@lll.kpi.ua |
          Адреса: вул. Хрещатик, 1, Київ
        </p>
      </footer>
    </div>
  );
};

export default AuthPage;
