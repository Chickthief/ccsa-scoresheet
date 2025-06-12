// src/components/scoreboard/ActionButtons.jsx
import React, { useState, useEffect, useRef } from 'react';

function ActionButtons({
  onPlayAction,
  onUndo,
  onEndGameClick, // <-- Add this new prop
  disableOutcomeButtons,
  currentPlayType,
  currentPlayStage,
  onSkipBatter
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  // Helper to determine if a button is active
  const isActivePlay = (buttonActionType) => {
    return currentPlayType === buttonActionType && currentPlayStage === 'awaitingLocation';
  };
  
  // Close the menu if clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);


  const handleMoreClick = () => {
    setShowMoreMenu(prev => !prev);
  };

  const handleUndoClick = () => {
    onUndo();
    setShowMoreMenu(false); // Close menu after action
  };

  const handleEndGame = () => {
    onEndGameClick();
    setShowMoreMenu(false); // Close menu after action
  };

  const handleSkipBatterClick = () => {
    onSkipBatter();
    setShowMoreMenu(false);
  };

  return (
    <div className="action-buttons-area">
      {/* Hit and Outcome actions remain the same */}
      <div className="hit-actions">
        <button
          className={`button-ccsa ${isActivePlay('flyHitTo') ? 'active-play' : ''}`}
          onClick={() => onPlayAction('flyHitTo')}
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
          disabled={disableOutcomeButtons}
        >
          Caught OUT
        </button>
        <button
          className="button-ccsa"
          onClick={() => onPlayAction('strikeOut')}
          disabled={disableOutcomeButtons}
        >
          Strike OUT
        </button>
      </div>

      {/* --- MODIFIED: Utility actions are now in a popup menu --- */}
      <div className="utility-actions" ref={menuRef}>
        <button
          onClick={handleMoreClick}
          className="button-ccsa secondary-action-button"
          disabled={disableOutcomeButtons}
        >
          More...
        </button>

        {showMoreMenu && (
          <div className="more-menu-popup">
            <button onClick={handleUndoClick} className="menu-button">
              Undo Last Play
            </button>
            <button onClick={handleSkipBatterClick} className="menu-button">
              Skip Batter
            </button>
            <button onClick={handleEndGame} className="menu-button end-game-button">
              End Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActionButtons;
