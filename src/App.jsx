// src/App.jsx
import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import GameSetupPage from './pages/GameSetupPage';
import ScoreboardPage from './pages/ScoreboardPage';
import GameSummaryPage from './pages/GameSummaryPage'; // <-- NEW: Import GameSummaryPage
import { DEFAULT_GAME_TEAMS_INFO, DEFAULT_GAME_DETAILS, PREDEFINED_TEAM_LINEUPS } from './utils/constants';

function App() {
  const [view, setView] = useState('login'); // 'login', 'setup', 'scoreboard', 'summary'
  const [teamInfo, setTeamInfo] = useState(null); // { team1Name, team2Name } (Away, Home)
  const [gameDetails, setGameDetails] = useState(null); // { gameCode, date, time, location }
  const [finalizedLineups, setFinalizedLineups] = useState(null); // { [teamName]: lineupArray }
  const [finalGameData, setFinalGameData] = useState(null); // For the summary page

  // ... (useEffect for testing direct scoreboard view can be removed or kept) ...

  const handleLoginSuccess = () => {
    const TInfo = DEFAULT_GAME_TEAMS_INFO; // Assuming team1 is Away, team2 is Home
    const GDetails = DEFAULT_GAME_DETAILS;
    setTeamInfo(TInfo);
    setGameDetails(GDetails);
    // Initialize lineups for setup based on constants, App will own this setup data
    const initialSetupLineups = {
        [TInfo.team1Name]: PREDEFINED_TEAM_LINEUPS[TInfo.team1Name] ? JSON.parse(JSON.stringify(PREDEFINED_TEAM_LINEUPS[TInfo.team1Name])) : [],
        [TInfo.team2Name]: PREDEFINED_TEAM_LINEUPS[TInfo.team2Name] ? JSON.parse(JSON.stringify(PREDEFINED_TEAM_LINEUPS[TInfo.team2Name])) : [],
    };
    setFinalizedLineups(initialSetupLineups); // Use this to pass to GameSetupPage for modification
    setView('setup');
  };

  const handleStartGameFromSetup = (currentLineupsFromSetup) => {
    setFinalizedLineups(currentLineupsFromSetup); // These are the lineups to start the game with
    setView('scoreboard');
  };

  // NEW: Callback for when the game ends from ScoreboardPage
  const handleGameOver = (endedGameState) => {
    console.log("App.jsx: Game Over! Final State:", endedGameState);
    // Construct the data needed for the GameSummaryPage
    // For "Uniform deduction", "Sportsmanship", "Equipment" - these need a data source or input mechanism
    // For now, we'll use placeholders.
    const summaryData = {
      awayTeam: {
        name: endedGameState.awayTeamName,
        finalScore: endedGameState.score.away,
        uniformDeduction: 0, // Placeholder
        sportsmanship: 1,    // Placeholder
        equipment: 0,        // Placeholder
      },
      homeTeam: {
        name: endedGameState.homeTeamName,
        finalScore: endedGameState.score.home,
        uniformDeduction: 0, // Placeholder
        sportsmanship: 1,    // Placeholder
        equipment: 0,        // Placeholder
      },
      gameCode: endedGameState.gameDetails?.gameCode || gameDetails?.gameCode || "N/A", // Get from endedGameState or initial gameDetails
      // Umpire details would also need to be sourced, e.g., from a logged-in user or a setup step
      umpire: {
        name: "Roland Chan", // Placeholder
        id: "00039"          // Placeholder
      }
    };
    setFinalGameData(summaryData);
    setView('summary');
  };


  let pageContent;
  if (view === 'login') {
    pageContent = <LoginPage onLoginSuccess={handleLoginSuccess} />;
  } else if (view === 'setup') {
    // GameSetupPage should receive the initial lineups for modification
    pageContent = <GameSetupPage
                    teams={teamInfo}
                    gameDetails={gameDetails}
                    initialLineupsForSetup={finalizedLineups} // Pass initial lineups for setup
                    onGameStart={handleStartGameFromSetup}
                  />;
  } else if (view === 'scoreboard') {
    if (!finalizedLineups || !teamInfo || !gameDetails) {
      pageContent = <div style={{ padding: '20px', color: 'red' }}>Error: Missing data to start scoreboard.</div>;
    } else {
      pageContent = (
        <ScoreboardPage
          initialHomeTeamLineup={finalizedLineups[teamInfo.team2Name]} // Assuming team2 is Home
          initialAwayTeamLineup={finalizedLineups[teamInfo.team1Name]} // Assuming team1 is Away
          initialGameDetails={gameDetails}
          homeTeamNameFromSetup={teamInfo.team2Name}
          awayTeamNameFromSetup={teamInfo.team1Name}
          onGameOver={handleGameOver} // <-- Pass the new callback
        />
      );
    }
  } else if (view === 'summary') { // <-- NEW: Render GameSummaryPage
    if (!finalGameData) {
        pageContent = <div style={{padding: '20px', color: 'red'}}>Error: No summary data available.</div>;
    } else {
        pageContent = <GameSummaryPage gameData={finalGameData} />;
    }
  } else {
    pageContent = <div>Loading or unknown view...</div>;
  }

  return (
    <div className="iphone-container">
      {pageContent}
    </div>
  );
}
export default App;