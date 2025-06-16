// src/App.jsx
import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import GameSetupPage from './pages/GameSetupPage';
import ScoreboardPage from './pages/ScoreboardPage';
import GameSummaryPage from './pages/GameSummaryPage';
import { API_BASE_URL } from './utils/constants';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  // State to hold the data for the loaded game
  const [gameData, setGameData] = useState(null);
  // State for loading and error messages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // State for lineups confirmed in the setup page
  const [confirmedLineups, setConfirmedLineups] = useState(null);

  const handleGameCodeSubmit = async (gameCode) => {
    setIsLoading(true);
    setError(null);
    console.log(`Attempting to fetch game with code: ${gameCode}`);

    try {
      // Fetch the game data from your local server endpoint
      const response = await fetch(`${API_BASE_URL}games/${gameCode}`);
      
      if (!response.ok) {
        // If the server returns an error (e.g., 404 Not Found), handle it
        const errorData = await response.json();
        throw new Error(errorData.error || 'Game not found.');
      }

      const data = await response.json();
      console.log("Successfully fetched game data:", data);
      
      // Set the fetched data into state and move to the setup page
      setGameData(data);
      setCurrentPage('setup');

    } catch (err) {
      console.error("Failed to fetch game data:", err);
      setError(err.message); // Set the error message to display on the login page
      // To display this error, your LoginForm component needs to accept an `error` prop.
      // For now, it will just log to the console.
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameStart = (lineups) => {
    console.log("Starting game with confirmed lineups:", lineups);
    setConfirmedLineups(lineups);
    setCurrentPage('scoreboard');
  };
  /**
   * This is the master function that is passed down to the scoreboard.
   * When the game is over, this function is called. It prepares the
   * summary data and switches the view to the 'summary' page.
   */
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
      gameHistory: endedGameState.gameHistory || [] // Pass the history for the event log
    };
    setFinalGameData(summaryData);
    setView('summary');
  };

  /**
   * This function determines which page component to render based
   * on the current `view` state.
   */
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLoginSuccess={handleGameCodeSubmit} />;
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
          />
        );
      case 'summary':
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
