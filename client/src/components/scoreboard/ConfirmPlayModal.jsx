// src/components/scoreboard/ConfirmPlayModal.jsx
import React from 'react';

/**
 * A simple modal to confirm a play action like "Strike Out".
 */
function ConfirmPlayModal({ isOpen, onConfirm, onCancel, playType }) {
  if (!isOpen) {
    return null;
  }

  // Determine the display text based on the play type
  const playText = playType === 'strikeOut' ? 'Strike Out' : 
                   playType === 'caughtOut' ? 'Caught Out' : 'Play';
                   playType === 'endInning' ? 'End Inning' : 'End inning';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Play</h2>
        <p>Are you sure you want to record a "{playText}"?</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="button-ccsa confirm-button">
            Yes, Confirm
          </button>
          <button onClick={onCancel} className="button-ccsa secondary-action-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPlayModal;
