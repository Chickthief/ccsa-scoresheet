// src/components/scoreboard/ActionButtons.jsx
import React from 'react';

function ActionButtons({
  onPlayAction,
  onUndo,
  disableOutcomeButtons, // New prop
  currentPlayType,
  currentPlayStage
}) {
  // Helper to determine if a button corresponds to the currently active play type
  const isActivePlay = (buttonActionType) => {
    return currentPlayType === buttonActionType && currentPlayStage === 'awaitingLocation';
  };

  return (
    <div className="action-buttons-area">
      <div className="hit-actions">
        <button
          className={`button-ccsa ${isActivePlay('flyHitTo') ? 'active-play' : ''}`}
          onClick={() => onPlayAction('flyHitTo')}
          // This button is never disabled by disableOutcomeButtons,
          // its click handler in ScoreboardPage manages its state (select/deselect)
        >
          Fly hit to
        </button>
        <button
          className={`button-ccsa ${isActivePlay('lineDriveTo') ? 'active-play' : ''}`}
          onClick={() => onPlayAction('lineDriveTo')}
        >
          Line drive to
        </button>
        <button
          className={`button-ccsa ${isActivePlay('grounderTo') ? 'active-play' : ''}`}
          onClick={() => onPlayAction('grounderTo')}
        >
          Grounder to
        </button>
      </div>
      <div className="outcome-actions">
        <button
          className="button-ccsa"
          onClick={() => onPlayAction('caughtOut')}
          disabled={disableOutcomeButtons} // Disabled if a hit play is awaiting field input
        >
          Caught OUT
        </button>
        <button
          className="button-ccsa"
          onClick={() => onPlayAction('strikeOut')}
          disabled={disableOutcomeButtons} // Disabled if a hit play is awaiting field input
        >
          Strike OUT
        </button>
        <button
          className="button-ccsa"
          onClick={() => onPlayAction('more')}
          disabled={disableOutcomeButtons} // Disabled if a hit play is awaiting field input
        >
          More...
        </button>
      </div>
      <div className="utility-actions" style={{marginTop: '15px', textAlign: 'center'}}>
         <button
            onClick={onUndo}
            className="button-ccsa secondary-action-button"
            // Disable if a hit play is in progress
            disabled={disableOutcomeButtons}
          >
            Undo Last Play
          </button>
      </div>
    </div>
  );
}
export default ActionButtons;