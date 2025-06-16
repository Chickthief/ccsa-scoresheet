// src/pages/GameSetupPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import TeamLineupManager from '../components/gameSetup/TeamLineupManager';
import GameInfoTab from '../components/gameSetup/GameInfoTab';
// PREDEFINED_TEAM_LINEUPS is no longer needed here.
import { API_BASE_URL } from '../utils/constants';

// The 'teams' prop should now contain the full lineup data from the API
function GameSetupPage({ teams, gameDetails, onGameStart }) {
  const teamNamesFromProps = teams ? [teams.awayTeam.name, teams.homeTeam.name].filter(Boolean) : [];
  const TABS = ["Info", ...teamNamesFromProps];

  const [activeTab, setActiveTab] = useState("Info");
  const [gameLineups, setGameLineups] = useState({});

  // This hook now populates the lineups directly from the fetched game data
  useEffect(() => {
    console.log("GameSetupPage: useEffect triggered. Initializing lineups from props:", teams);
    
    // Check if team data exists before trying to access it
    if (teams && teams.awayTeam && teams.homeTeam) {
        setGameLineups({
            [teams.awayTeam.name]: teams.awayTeam.lineup,
            [teams.homeTeam.name]: teams.homeTeam.lineup,
        });
    }

    // You can keep this fetch if you need a list of ALL teams for another feature,
    // but it's no longer needed to create the initial lineups.
    fetch(`${API_BASE_URL}teams`) 
        .then(response => response.json())
        .then(data => {
            console.log("Fetched all teams from backend:", data);
        })
        .catch(error => console.error("Error fetching teams:", error));
    
    setActiveTab("Info"); // Reset to info tab when teams change
  }, [teams]); // Dependency on the 'teams' prop is correct

  const handleLineupChange = useCallback((teamName, newLineup) => {
    setGameLineups(prevLineups => ({
      ...prevLineups,
      [teamName]: newLineup
    }));
  }, []);

  const handleStartGame = useCallback(() => {
    console.log("GameSetupPage: Confirming and starting game with lineups:", gameLineups);
    if (typeof onGameStart === 'function') {
      onGameStart(gameLineups);
    } else {
      console.error("GameSetupPage: onGameStart prop is NOT a function!");
    }
  }, [gameLineups, onGameStart]);

  if (!teams || !teams.homeTeam || !teams.awayTeam || !gameDetails) {
    return (
      <div className="game-setup-content" style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
          <h1>Setup Error!</h1>
          <p>Cannot initialize game setup. Essential team or game details are missing.</p>
      </div>
    );
  }

  // Updated player counts to use the correct team names from the new structure
  const awayPlayerCount = gameLineups[teams.awayTeam.name]?.length || 0;
  const homePlayerCount = gameLineups[teams.homeTeam.name]?.length || 0;

  return (
    <div className="game-setup-content">
      <div className="tabs-container">
        {TABS.map(tabName => (
          <button
            key={tabName}
            onClick={() => setActiveTab(tabName)}
            className={`tab-button ${activeTab === tabName ? "active" : ""}`}
          >
            {tabName === "Info" ? "Info" : `${tabName} lineup`}
          </button>
        ))}
      </div>

      {activeTab === "Info" && (
        <GameInfoTab
          // Pass the correct team names
          team1Name={teams.awayTeam.name}
          team2Name={teams.homeTeam.name}
          gameDetails={gameDetails}
          team1PlayerCount={awayPlayerCount}
          team2PlayerCount={homePlayerCount}
          onStartGame={handleStartGame}
        />
      )}

      {teamNamesFromProps.includes(activeTab) && (
        <TeamLineupManager
          key={activeTab}
          teamName={activeTab}
          // The initial lineup is now correctly sourced from the state
          initialLineupData={gameLineups[activeTab] || []}
          onLineupChange={(newLineup) => handleLineupChange(activeTab, newLineup)}
        />
      )}
    </div>
  );
}
export default GameSetupPage;
