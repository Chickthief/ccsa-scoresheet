// src/components/scoreboard/ActionButtons.jsx
import React, { useState, useEffect, useRef } from 'react';

function ActionButtons({
  onPlayAction,
  onUndo,
  onEndGameClick,
  disableOutcomeButtons,
  onSkipBatter,
  selectedHitType,
  onEndInning
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);


  const handleMoreClick = () => {
    setShowMoreMenu(prev => !prev);
  };
  const handleUndoClick = () => {
    onUndo();
    setShowMoreMenu(false);
  };
  const handleEndGame = () => {
    onEndGameClick();
    setShowMoreMenu(false);
  };
  const handleSkipBatterClick = () => {
    onSkipBatter();
    setShowMoreMenu(false);
  };
  const handleEndInningClick = () => {
    onEndInning();
    setShowMoreMenu(false); // Close menu after action
  };

  return (
    <div className="action-buttons-area">
      <div className="hit-actions">
        <button
          className={`button-ccsa ${selectedHitType === 'flyHitTo' ? 'active-play' : ''}`}
          onClick={() => onPlayAction('flyHitTo')}
        >
          Fly to
        </button>
        <button
          className={`button-ccsa ${selectedHitType === 'lineDriveTo' ? 'active-play' : ''}`}
          onClick={() => onPlayAction('lineDriveTo')}
        >
          Line to
        </button>
        <button
          className={`button-ccsa ${selectedHitType === 'grounderTo' ? 'active-play' : ''}`}
          onClick={() => onPlayAction('grounderTo')}
        >
          Ground to
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
            <button onClick={handleEndInningClick} className="menu-button end-inning-button">
              End Inning
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