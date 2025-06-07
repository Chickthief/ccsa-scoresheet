// src/pages/GameSummaryPage.jsx
import React from 'react';

function GameSummaryPage({ gameData }) {
  if (!gameData) {
    return <div className="iphone-container"><p>Loading game summary...</p></div>;
  }

  const { awayTeam, homeTeam, gameCode, umpire } = gameData;

  const handleSubmitScore = () => {
    console.log("Submitting final score:", gameData);
    alert("Score submitted (feature to be fully implemented)!");
    // Here you would typically:
    // 1. Send data to a backend.
    // 2. Navigate to a confirmation screen or back to a main app screen.
    // For now, we can just log it.
  };

  return (
    <div className="iphone-container"> {/* Or a specific wrapper class for this page */}
      <div className="game-summary-page">
        <p className="summary-page-title">Umpire sign off - digital</p>

        <div className="summary-matchup-info">
          <h2>{awayTeam.name} at {homeTeam.name}</h2>
          <p>{gameCode}</p>
        </div>

        <div className="summary-score-table">
          <div className="score-table-header">
            <span className="team-label"></span> {/* Empty cell for alignment */}
            <span className="team-name-col">{awayTeam.name}</span>
            <span className="team-name-col">{homeTeam.name}</span>
          </div>
          <div className="score-table-row">
            <span className="row-label">Final</span>
            <span className="score-value">{awayTeam.finalScore}</span>
            <span className="score-value">{homeTeam.finalScore}</span>
          </div>
          <div className="score-table-row">
            <span className="row-label">Uniform deduction</span>
            <span className="score-value">{awayTeam.uniformDeduction}</span>
            <span className="score-value">{homeTeam.uniformDeduction}</span>
          </div>
          <div className="score-table-row">
            <span className="row-label">Runs scored</span> {/* This seems same as final in mockup */}
            <span className="score-value">{awayTeam.finalScore}</span>
            <span className="score-value">{homeTeam.finalScore}</span>
          </div>
          <div className="score-table-row">
            <span className="row-label">Sportsmanship</span>
            <span className="score-value">+{awayTeam.sportsmanship}</span>
            <span className="score-value">+{homeTeam.sportsmanship}</span>
          </div>
          <div className="score-table-row">
            <span className="row-label">Equipment</span>
            <span className="score-value">{awayTeam.equipment}</span>
            <span className="score-value">{homeTeam.equipment}</span>
          </div>
        </div>

        <div className="umpire-signoff-section">
          <h3>Umpire sign-off</h3>
          <div className="signoff-details">
            <span className="checkmark-icon">✓</span> {/* Replace with actual icon/SVG */}
            <div>
              <p>This game has been digitally signed by the home umpire.</p>
              <p className="umpire-name">{umpire.name} ({umpire.id})</p>
            </div>
          </div>
        </div>

        <button onClick={handleSubmitScore} className="button-ccsa submit-score-button">
          Submit score
        </button>
      </div>
    </div>
  );
}

export default GameSummaryPage;