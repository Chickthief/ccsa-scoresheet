import React from 'react';
import { getInningSuffix } from '../../utils/gameLogic';

function GameStateBar({ awayTeam, homeTeam, score, outs, inning, isTopInning }) {
    // Correctly access team names from the nested objects
    const awayTeamName = awayTeam?.name || 'Away';
    const homeTeamName = homeTeam?.name || 'Home';
    
    const inningSuffix = getInningSuffix(inning);
    const inningArrow = isTopInning ? '↑' : '↓';

    return (
        <div className="game-state-bar-v2">
            {/* Away Team Section */}
            <div className="team-info away-team-info">
                <span className="team-name-gsb main-team-name">{awayTeamName}</span>
                <span className="score-points main-score">{score.away}</span>
            </div>

            {/* Center Inning/Outs Block */}
            <div className="inning-outs-block">
                <div className="inning-display-v2">
                    <span className="inning-arrow">{inningArrow}</span>
                    <span className="inning-number">{inning}</span>
                    <span className="inning-suffix">{inningSuffix}</span>
                </div>
                <div className="outs-display-v2">
                    <span className="outs-text">OUTS</span>
                    <span className="outs-circles">
                        {Array(3).fill(null).map((_, i) => (i < outs ? '⚫' : '⚪'))}
                    </span>
                </div>
            </div>

            {/* Home Team Section */}
            <div className="team-info home-team-info">
                <span className="score-points main-score">{score.home}</span>
                <span className="team-name-gsb main-team-name">{homeTeamName}</span>
            </div>
        </div>
    );
}

export default GameStateBar;
