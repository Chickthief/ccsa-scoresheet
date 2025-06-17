// src/App.jsx
import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import GameSetupPage from './pages/GameSetupPage';
import ScoreboardPage from './pages/ScoreboardPage';
import GameSummaryPage from './pages/GameSummaryPage';
import { API_BASE_URL } from './utils/constants';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedLineups, setConfirmedLineups] = useState(null);
  // --- FIX 1: Add state to hold the final game data for the summary page ---
  const [finalGameData, setFinalGameData] = useState(null);

  const handleGameCodeSubmit = async (gameCode) => {
    setIsLoading(true);
    setError(null);
    console.log(`Attempting to fetch game with code: ${gameCode}`);

    try {
      const response = await fetch(`${API_BASE_URL}games/${gameCode}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Game not found.');
      }

      const data = await response.json();
      console.log("Successfully fetched game data:", data);
      
      setGameData(data);
      setCurrentPage('setup');

    } catch (err) {
      console.error("Failed to fetch game data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameStart = (lineups) => {
    console.log("Starting game with confirmed lineups:", lineups);
    setConfirmedLineups(lineups);
    setCurrentPage('scoreboard');
  };

  const handleGameOver = (endedGameState) => {
    console.log("App.jsx: Game is Over. Received final state:", endedGameState);
    const summaryData = {
      awayTeam: {
        name: endedGameState.awayTeamName,
        finalScore: endedGameState.score.away,
      },
      homeTeam: {
        name: endedGameState.homeTeamName,
        finalScore: endedGameState.score.home,
      },
      gameCode: endedGameState.gameDetails?.gameCode || "N/A",
      umpire: { name: "Roland Chan", id: "00039" },
      gameHistory: endedGameState.gameHistory || []
    };
    // Use the correct state setters
    setFinalGameData(summaryData);
    // --- FIX 2: Use the correct function to change the page ---
    setCurrentPage('summary');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLoginSuccess={handleGameCodeSubmit} error={error} isLoading={isLoading} />;
      case 'setup':
        return (
          <GameSetupPage
            teams={{ homeTeam: gameData.homeTeam, awayTeam: gameData.awayTeam }}
            gameDetails={gameData.gameDetails}
            onGameStart={handleGameStart}
          />
        );
      case 'scoreboard':
        return (
          <ScoreboardPage
            gameData={gameData}
            initialLineups={confirmedLineups}
            // --- FIX 3: Pass the handleGameOver function as a prop ---
            onGameOver={handleGameOver}
          />
        );
      case 'summary':
        // Pass the finalGameData to the summary page
        return <GameSummaryPage gameData={finalGameData} />;
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="iphone-container">
      {renderPage()}
    </div>
  );
}
export default App;