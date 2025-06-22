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
  const [finalGameData, setFinalGameData] = useState(null);

  const handleGameCodeSubmit = async (gameCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}games/${gameCode}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Game not found.');
      }
      const data = await response.json();
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
    setConfirmedLineups(lineups);
    setCurrentPage('scoreboard');
  };

  const handleGameOver = async (endedGameState) => {
    console.log("App.jsx: Game is Over. Received final state:", endedGameState);

    try {
        // Use gameData from App's state for reliable static data.
        // endedGameState provides the final dynamic data (logs, scores, lineups).
        const { playLog, homeTeam, awayTeam } = endedGameState;
        
        // Defensive check for lineups, which are inside the team objects.
        const homeTeamLineup = homeTeam?.lineup || [];
        const awayTeamLineup = awayTeam?.lineup || [];
        
        const plateAppearances = playLog.map(play => ({
            player_user_id: play.player_user_id,
            team_id: play.team_id,
            inning: play.inning,
            outcome: play.outcome,
            runners_batted_in: play.runners_batted_in,
        }));

        const playerSummaries = {};
        const allPlayers = [...homeTeamLineup, ...awayTeamLineup];

        allPlayers.forEach(player => {
            if (player && player.id) {
                playerSummaries[player.id] = {
                    plate_appearances: 0, runs: 0, singles: 0, doubles: 0, triples: 0, homeruns: 0,
                    walks: 0, strikeouts: 0, runs_batted_in: 0,
                };
            }
        });

        playLog.forEach(play => {
            const stats = playerSummaries[play.player_user_id];
            if (stats) {
                stats.plate_appearances++;
                stats.runs_batted_in += play.runners_batted_in;
                switch(play.outcome) {
                    case 'SINGLE': stats.singles++; break;
                    case 'DOUBLE': stats.doubles++; break;
                    case 'TRIPLE': stats.triples++; break;
                    case 'HOMERUN': stats.homeruns++; stats.runs++; break;
                    case 'WALK': case 'INTENTIONAL_WALK': stats.walks++; break;
                    case 'STRIKEOUT': stats.strikeouts++; break;
                }
            }
        });
        
        // Get gameId from the reliable gameData state variable, not the one from the reducer state.
        const gameId = gameData?.gameDetails?.id;
        if (gameId) {
            const response = await fetch(`${API_BASE_URL}games/${gameId}/summary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plateAppearances, playerSummaries })
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to submit game stats.');
            }
            const result = await response.json();
            console.log('Successfully submitted stats:', result.message);
        } else {
            console.error("Cannot submit stats: Missing Game ID from App's main gameData state.");
        }

    } catch (err) {
        console.error("Error submitting game stats:", err);
    }
    
    const summaryData = {
      awayTeam: {
        name: endedGameState.awayTeam.name,
        finalScore: endedGameState.score.away,
      },
      homeTeam: {
        name: endedGameState.homeTeam.name,
        finalScore: endedGameState.score.home,
      },
      gameCode: gameData?.gameDetails?.gameCode || "N/A", // Use reliable gameData
      umpire: { name: "Roland Chan", id: "00039" }, 
      gameHistory: endedGameState.gameHistory || []
    };
    setFinalGameData(summaryData);
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
            onGameOver={handleGameOver}
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
