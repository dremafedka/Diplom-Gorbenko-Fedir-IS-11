import React from 'react';
import '../../styles/global.css';

const Modal = ({ message, onClose, modalType = 'success' }) => {
  let modalClass = 'modal-content';
  if (modalType === 'success') {
    modalClass += ' success-modal';
  } else if (modalType === 'info') {
    modalClass += ' info-modal';
  } else if (modalType === 'edit') {
    modalClass += ' edit-modal';
  } else if (modalType === 'confirm') {
    modalClass += ' confirm-modal';
  }
  else if (modalType === 'error') {
    modalClass += ' error-modal';
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        {message}
        {modalType !== 'confirm' && (
          <button onClick={onClose}>Ок</button>
        )}
      </div>
    </div>
  );
};

export default Modal;
