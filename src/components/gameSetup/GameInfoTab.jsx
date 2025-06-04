// src/components/gameSetup/GameInfoTab.jsx
import React from 'react';

function GameInfoTab({ team1Name, team2Name, gameDetails, team1PlayerCount, team2PlayerCount, onStartGame }) {
  if (!gameDetails) {
    return <p>Loading game information...</p>;
  }

  return (
    <div className="game-info-tab-content">
      <h2>{team1Name} at {team2Name}</h2>
      <div className="game-meta">
        <p>{gameDetails.gameCode}</p>
        <p>{gameDetails.date}</p>
        <p>{gameDetails.time}</p>
      </div>
      <p className="game-location">{gameDetails.location}</p>

      <div className="player-counts">
        <p>{team1Name}: {team1PlayerCount} players</p>
        <p>{team2Name}: {team2PlayerCount} players</p>
      </div>

      <button className="button-ccsa start-game-button" onClick={onStartGame}>
        Confirm lineup and start game
      </button>
    </div>
  );
}
export default GameInfoTab;