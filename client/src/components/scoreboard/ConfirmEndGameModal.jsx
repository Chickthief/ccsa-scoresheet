import React from 'react';

/**
 * A modal dialog to confirm an action.
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {function} props.onConfirm - Function to call when the user confirms.
 * @param {function} props.onCancel - Function to call when the user cancels.
 */
function ConfirmEndGameModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>End Game?</h3>
        <p>Are you sure you want to end the game? This action cannot be undone.</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="button secondary">
            No, Continue Game
          </button>
          <button onClick={onConfirm} className="button danger">
            Yes, End Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmEndGameModal;
