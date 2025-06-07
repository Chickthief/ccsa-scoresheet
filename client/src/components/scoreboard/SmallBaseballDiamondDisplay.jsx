// src/components/scoreboard/SmallBaseballDiamondDisplay.jsx
import React from 'react';
import diamondImg from '../../assets/baseball_diamond_full.png'; // Reuse the same image

// Define fixed display size for this small diamond
const SMALL_DIAMOND_WIDTH = 80; // px
const SMALL_DIAMOND_HEIGHT = 80 * (750 / 812); // Maintain aspect ratio of your image

function SmallBaseballDiamondDisplay({ currentPositions }) {
  // currentPositions = { first: 'PlayerName/ID', second: '...', third: '...' }
  // Null or falsy if base is empty

  return (
    <div
      className="small-diamond-display"
      style={{
        width: `${SMALL_DIAMOND_WIDTH}px`,
        height: `${SMALL_DIAMOND_HEIGHT}px`,
        backgroundImage: `url(${diamondImg})`,
      }}
    >
      {/*
        Absolutely position simple dots or very short text/numbers for runners.
        The positioning values (top, left) need to be scaled for this smaller diamond size.
        Example: if 1B was top: 63%, left: 75% on a 300px diamond,
        it will be the same % on an 80px diamond.
      */}
      {currentPositions?.first && (
        <div className="small-runner-marker sm-first-base">
          {/* Display initial or number for brevity */}
          {typeof currentPositions.first === 'string' ? currentPositions.first.substring(0,1) : 'R'}
        </div>
      )}
      {currentPositions?.second && (
        <div className="small-runner-marker sm-second-base">
          {typeof currentPositions.second === 'string' ? currentPositions.second.substring(0,1) : 'R'}
        </div>
      )}
      {currentPositions?.third && (
        <div className="small-runner-marker sm-third-base">
          {typeof currentPositions.third === 'string' ? currentPositions.third.substring(0,1) : 'R'}
        </div>
      )}
    </div>
  );
}

export default SmallBaseballDiamondDisplay;