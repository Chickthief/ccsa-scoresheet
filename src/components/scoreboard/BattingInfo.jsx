// src/components/scoreboard/BattingInfo.jsx
import React from 'react';

function BattingInfo({ currentBatter, upNext, battingTeamName }) {
  return (
    <div className="batting-info">
      <div className="at-bat">
        AT BAT: {currentBatter ? `${currentBatter.number} ${currentBatter.name}  |  ${battingTeamName}` : 'N/A'}
      </div>
      <div className="up-next">
        Up next:
        {upNext && upNext.length > 0 ? (
          <ol>
            {upNext.map((player, index) => player && (
              <li key={player.id || index}>{`${player.number} ${player.name}`}</li>
            ))}
          </ol>
        ) : (
          <p>N/A</p>
        )}
      </div>
    </div>
  );
}
export default BattingInfo;