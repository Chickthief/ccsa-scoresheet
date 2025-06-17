import React from 'react';

function Linescore({ scores, awayTeamName, homeTeamName, totalScore }) {
  // Determine the number of innings to display
  const inningCount = Math.max(scores.away.length, 7);
  const innings = Array.from({ length: inningCount }, (_, i) => i + 1);

  return (
    <div className="linescore-container">
      <table className="linescore-table">
        <thead>
          <tr>
            <th className="team-name-col"></th>
            {innings.map(i => <th key={i}>{i}</th>)}
            <th className="final-score-col">R</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="team-name-col">{awayTeamName}</td>
            {innings.map((_, i) => (
              <td key={`away-${i}`}>{scores.away[i] ?? ''}</td>
            ))}
            <td className="final-score-col">{totalScore.away}</td>
          </tr>
          <tr>
            <td className="team-name-col">{homeTeamName}</td>
            {innings.map((_, i) => (
              <td key={`home-${i}`}>{scores.home[i] ?? ''}</td>
            ))}
            <td className="final-score-col">{totalScore.home}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Linescore;