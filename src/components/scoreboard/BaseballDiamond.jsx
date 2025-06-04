// src/components/scoreboard/BaseballDiamond.jsx
import React from 'react';
// Make sure this path is correct for your project structure:
import diamondImg from '../../assets/baseball_diamond_full.png';

// --- CONFIGURATION CONSTANTS ---
// Adjust DIAMOND_DISPLAY_WIDTH to set the rendered width of the diamond.
// The height will be calculated based on the aspect ratio.
const DIAMOND_DISPLAY_WIDTH = 300; // Example: Render the diamond at 300px width

// Calculate this from your actual image file (original width / original height)
// Example: if your image is 750px wide and 812px tall:
const DIAMOND_ASPECT_RATIO = 750 / 812; // Replace with your image's actual aspect ratio
const DIAMOND_DISPLAY_HEIGHT = DIAMOND_DISPLAY_WIDTH * DIAMOND_ASPECT_RATIO;

// ** CRITICAL: Adjust these coordinates to accurately pinpoint home plate **
// ** on YOUR image at the DIAMOND_DISPLAY_WIDTH/HEIGHT size. **
// (0,0) is the top-left of the diamond image.
const HOME_PLATE_COORDS = {
  x: DIAMOND_DISPLAY_WIDTH / 2,       // Assumes home plate is horizontally centered
  y: DIAMOND_DISPLAY_HEIGHT * 0.86, // Example: 86% down from the top. ADJUST THIS!
};
// --- END CONFIGURATION CONSTANTS ---

function BaseballDiamond({
  batterName,      // String: e.g., "Steven"
  batterNumber,    // String: e.g., "07"
  runners,         // Object: e.g., { first: true, second: false, third: true }
  hitLocationVisual, // Object: e.g., { x: 150, y: 100 } or null
  onFieldClick     // Function: called with {x, y} when field is clicked in 'awaitingLocation' mode
}) {

  // Provide a default for runners if it's undefined or null
  const safeRunners = runners || { first: false, second: false, third: false };

  const handleDiamondClick = (event) => {
    if (!onFieldClick) return; // Only process click if the handler is provided

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left; // x coordinate within the .field-area div
    const y = event.clientY - rect.top;  // y coordinate within the .field-area div

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
          cursor: onFieldClick ? 'crosshair' : 'default', // Change cursor when clickable
        }}
        onClick={onFieldClick ? handleDiamondClick : undefined}
      >
        {/* Runner Markers - CSS will position these based on class names */}
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
        {/* Visual for ball hit path and location */}
        {hitLocationVisual && hitLocationVisual.x !== undefined && hitLocationVisual.y !== undefined && (
          <>
            <svg
              className="ball-path-svg"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%', // SVG covers the whole .field-area
                height: '100%',
                pointerEvents: 'none', // So SVG doesn't block clicks on .field-area
              }}
            >
              {/* DEBUG MARKER FOR HOME PLATE - Adjust HOME_PLATE_COORDS then REMOVE this circle */}
              <circle cx={HOME_PLATE_COORDS.x} cy={HOME_PLATE_COORDS.y} r="4" fill="red" stroke="#660000" strokeWidth="1" />

              <line
                x1={HOME_PLATE_COORDS.x}
                y1={HOME_PLATE_COORDS.y}
                x2={hitLocationVisual.x}
                y2={hitLocationVisual.y}
                stroke="yellow"
                strokeWidth="3" // Or adjust as needed
                strokeDasharray="4,4" // Dotted/dashed line
              />
            </svg>

            {/* Dot for the ball's final location */}
            <div
              className="ball-dot-marker"
              style={{
                position: 'absolute',
                left: `${hitLocationVisual.x}px`,
                top: `${hitLocationVisual.y}px`,
                transform: 'translate(-50%, -50%)', // Centers the dot on the coordinates
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