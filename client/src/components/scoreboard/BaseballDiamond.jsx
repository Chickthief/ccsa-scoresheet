// src/components/scoreboard/BaseballDiamond.jsx
import React from 'react';
import diamondImg from '../../assets/baseball_diamond_full.png';

// --- CONFIGURATION CONSTANTS ---
const DIAMOND_DISPLAY_WIDTH = 300;
const DIAMOND_ASPECT_RATIO = 750 / 812;
const DIAMOND_DISPLAY_HEIGHT = DIAMOND_DISPLAY_WIDTH * DIAMOND_ASPECT_RATIO;
const HOME_PLATE_COORDS = {
  x: DIAMOND_DISPLAY_WIDTH / 2,
  y: DIAMOND_DISPLAY_HEIGHT * 0.86,
};

// --- UPDATED: FIELDER POSITIONS WITH ROVERS ---
const fielderPositions = [
    { name: 'P', x: '50%', y: '57%' },
    { name: 'C', x: '50%', y: '92%' },
    { name: '1B', x: '72%', y: '56%' },
    { name: '2B', x: '62%', y: '40%' },
    { name: '3B', x: '28%', y: '56%' },
    { name: 'SS', x: '38%', y: '40%' },
    { name: 'LF', x: '10%', y: '20%' },
    { name: 'LR', x: '30%', y: '25%' }, // Left Rover
    { name: 'CF', x: '50%', y: '10%' },
    { name: 'RR', x: '70%', y: '25%' }, // Right Rover
    { name: 'RF', x: '90%', y: '20%' },
];

// --- FIELDER SELECTION SUB-COMPONENT (No changes needed here) ---
function FielderButtons({ onFielderSelected, forwardedRef }) {
    return (
        <div className="fielder-selection-overlay" ref={forwardedRef}>
            {fielderPositions.map(fielder => (
                <button
                    key={fielder.name}
                    className="fielder-button"
                    style={{ left: fielder.x, top: fielder.y }}
                    onClick={() => onFielderSelected(fielder.name)}
                >
                    {fielder.name}
                </button>
            ))}
        </div>
    );
}


function BaseballDiamond({
  batterName,
  batterNumber,
  runners,
  hitLocationVisual,
  onFieldClick,
  isSelectingFielder,
  onFielderSelected,
  overlayRef,
}) {

  const safeRunners = runners || { first: false, second: false, third: false };

  const handleDiamondClick = (event) => {
    if (!onFieldClick || isSelectingFielder) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    onFieldClick({ x, y });
  };

return (
    <div className="baseball-diamond-container">
      <div
        className="field-area"
        style={{
          backgroundImage: `url(${diamondImg})`,
          width: `${DIAMOND_DISPLAY_WIDTH}px`,
          height: `${DIAMOND_DISPLAY_HEIGHT}px`,
          cursor: onFieldClick && !isSelectingFielder ? 'crosshair' : 'default',
        }}
        onClick={onFieldClick ? handleDiamondClick : undefined}
      >
        {isSelectingFielder && (
          <FielderButtons 
            onFielderSelected={onFielderSelected} 
            // --- NEW: Pass the ref to the button component ---
            forwardedRef={overlayRef} 
          />
        )}

        {/* Runner Markers and other elements remain the same */}
        {safeRunners.first && (
          <div className="runner-on-base first-base-occupied">
            <span className="runner-label">
              {safeRunners.first.firstName || safeRunners.first.number || 'P'}
            </span>
          </div>
        )}
        {safeRunners.second && (
          <div className="runner-on-base second-base-occupied">
            <span className="runner-label">
              {safeRunners.second.firstName || safeRunners.second.number || 'P'}
            </span>
          </div>
        )}
        {safeRunners.third && (
          <div className="runner-on-base third-base-occupied">
            <span className="runner-label">
              {safeRunners.third.firstName || safeRunners.third.number || 'P'}
            </span>
          </div>
        )}
        {hitLocationVisual && hitLocationVisual.x !== undefined && hitLocationVisual.y !== undefined && (
          <>
            <svg className="ball-path-svg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line
                x1={HOME_PLATE_COORDS.x}
                y1={HOME_PLATE_COORDS.y}
                x2={hitLocationVisual.x}
                y2={hitLocationVisual.y}
                stroke="yellow"
                strokeWidth="3"
                strokeDasharray="4,4"
              />
            </svg>
            <div
              className="ball-dot-marker"
              style={{
                position: 'absolute',
                left: `${hitLocationVisual.x}px`,
                top: `${hitLocationVisual.y}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            ></div>
          </>
        )}
      </div>
      <div className="batter-name-display-bottom">
        {batterNumber || ''} | {batterName || ''}
      </div>
    </div>
  );
}

export default BaseballDiamond;