// src/pages/GameSetupPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback just in case, though not strictly needed for this version
import TeamLineupManager from '../components/gameSetup/TeamLineupManager';
import GameInfoTab from '../components/gameSetup/GameInfoTab';
import { PREDEFINED_TEAM_LINEUPS } from '../utils/constants'; // Ensure this path is correct

function GameSetupPage({ teams, gameDetails, onGameStart }) {
  const teamNamesFromProps = teams ? [teams.team1Name, teams.team2Name].filter(Boolean) : [];
  const TABS = ["Info", ...teamNamesFromProps];

  const [activeTab, setActiveTab] = useState("Info"); // Default to Info tab

  // State to hold lineups for all teams involved in this game setup session
  const [gameLineups, setGameLineups] = useState({});

  // Initialize/reset lineups when the `teams` prop changes (e.g., new game loaded)
  useEffect(() => {
    console.log("GameSetupPage: useEffect triggered by 'teams' prop change:", teams);
    const initialGameLineups = {};
    if (teams && teams.team1Name) {
      // Deep copy predefined lineup or start with empty array
      initialGameLineups[teams.team1Name] = PREDEFINED_TEAM_LINEUPS[teams.team1Name]
        ? JSON.parse(JSON.stringify(PREDEFINED_TEAM_LINEUPS[teams.team1Name]))
        : [];
    }
    fetch('http://localhost:3001/api/teams') // URL of your backend server
        .then(response => response.json())
        .then(data => {
            console.log("Fetched teams from backend:", data);
            setTeams(data);
        })
        .catch(error => console.error("Error fetching teams:", error));
    if (teams && teams.team2Name) {
      initialGameLineups[teams.team2Name] = PREDEFINED_TEAM_LINEUPS[teams.team2Name]
        ? JSON.parse(JSON.stringify(PREDEFINED_TEAM_LINEUPS[teams.team2Name]))
        : [];
    }
    setGameLineups(initialGameLineups);
    setActiveTab("Info"); // Reset to info tab when teams change
  }, [teams]); // Dependency on the 'teams' prop

  // Callback for TeamLineupManager to update lineups in this component's state
  const handleLineupChange = useCallback((teamName, newLineup) => {
    setGameLineups(prevLineups => ({
      ...prevLineups,
      [teamName]: newLineup
    }));
  }, []); // setGameLineups is stable

  // Called by the button in GameInfoTab
  const handleStartGame = useCallback(() => {
    console.log("GameSetupPage: 'Confirm lineup and start game' CLICKED.");
    console.log("GameSetupPage: Current gameLineups state to pass to App:", gameLineups);

    if (typeof onGameStart === 'function') {
      console.log("GameSetupPage: onGameStart prop IS a function. Calling it now.");
      onGameStart(gameLineups); // This calls handleStartGameFromSetup in App.jsx
    } else {
      console.error("GameSetupPage: onGameStart prop is NOT a function or is undefined! Check App.jsx.");
      alert("Developer Alert: onGameStart prop is missing or not a function in GameSetupPage! Check App.jsx.");
    }
  }, [gameLineups, onGameStart]);

  // Prop check
  if (!teams || !gameDetails || teamNamesFromProps.length < 2) {
    let errorReason = "";
    if (!teams) errorReason = "Team info missing.";
    else if (teamNamesFromProps.length < 2) errorReason = "Not enough teams defined.";
    else if (!gameDetails) errorReason = "Game details missing.";

    console.error("GameSetupPage: Missing essential props!", { teams, gameDetails, teamNamesFromProps });
    return (
      <div className="iphone-container"> {/* Assuming iphone-container is styled in App.jsx's wrapper */}
        <div className="game-setup-content" style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
            <h1>Setup Error!</h1>
            <p>Cannot initialize game setup. {errorReason}</p>
            <p>Please ensure App.jsx provides correct 'teams' and 'gameDetails' props.</p>
        </div>
      </div>
    );
  }

  const team1PlayerCount = gameLineups[teams.team1Name]?.length || 0;
  const team2PlayerCount = gameLineups[teams.team2Name]?.length || 0;

  return (
    // Removed iphone-container from here; it should be in App.jsx wrapping the pageContent
    <div className="game-setup-content"> {/* This should be the root of GameSetupPage's own content */}
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

      {activeTab === "Info" && ( // gameDetails is already checked by the prop check above
        <GameInfoTab
          team1Name={teams.team1Name}
          team2Name={teams.team2Name}
          gameDetails={gameDetails}
          team1PlayerCount={team1PlayerCount}
          team2PlayerCount={team2PlayerCount}
          onStartGame={handleStartGame}
        />
      )}

      {teamNamesFromProps.includes(activeTab) && gameLineups[activeTab] && (
        <TeamLineupManager
          key={activeTab}
          teamName={activeTab}
          initialLineupData={gameLineups[activeTab]} // Pass the current state for this team
          onLineupChange={(newLineup) => handleLineupChange(activeTab, newLineup)}
        />
      )}
    </div>
  );
}
export default GameSetupPage;