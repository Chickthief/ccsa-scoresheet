// src/components/scoreboard/GameStateBar.jsx
import React from 'react';
import BasesDisplay from './BasesDisplay'; // Assuming this is still used if bases come back
import { getInningSuffix } from '../../utils/gameLogic'; // <-- IMPORT (adjust path if needed)

function GameStateBar({
  inning,
  isTopInning,
  score,
  outs,
  // bases, // Bases display was removed from this component in the last mockup
  homeTeamName,
  awayTeamName
}) {
  const displayScoreAway = score && typeof score.away === 'number' ? score.away : 0;
  const displayScoreHome = score && typeof score.home === 'number' ? score.home : 0;
  const displayOuts = typeof outs === 'number' ? outs : 0;
  const displayInning = typeof inning === 'number' ? inning : 1;
  const inningSuffix = getInningSuffix(displayInning); // Now uses imported function

  let outsVisual = '⚪⚪';
  if (displayOuts === 1) {
    outsVisual = '🔴⚪';
  } else if (displayOuts >= 2) {
    outsVisual = '🔴🔴';
  }

  return (
    <div className="game-state-bar-v2">
      <div className="team-info away-team-info">
        <span className="team-name-gsb main-team-name">{awayTeamName || 'Away'}</span>
        <span className="score-points main-score">{displayScoreAway}</span>
      </div>

      <div className="inning-outs-block">
        <div className="inning-display-v2">
          <span className="inning-arrow">{isTopInning ? '▲' : '▼'}</span>
          <span className="inning-number">{displayInning}</span>
          <span className="inning-suffix">{inningSuffix}</span>
        </div>
        <div className="outs-display-v2">
          <span className="outs-text">Outs</span>
          <span className="outs-circles">{outsVisual}</span>
        </div>
      </div>

      <div className="team-info home-team-info">
        <span className="score-points main-score">{displayScoreHome}</span>
        <span className="team-name-gsb main-team-name">{homeTeamName || 'Home'}</span>
      </div>
    </div>
  );
}
export default GameStateBar;