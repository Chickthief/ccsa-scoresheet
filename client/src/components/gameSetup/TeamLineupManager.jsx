// src/components/gameSetup/TeamLineupManager.jsx
import React, { useState, useEffect } from 'react';
import DraggablePlayerList from './DraggablePlayerList';
import PasteToAddPlayers from './PasteToAddPlayers';
// import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

function TeamLineupManager({ teamName, initialLineupData, onLineupChange }) {
  const [lineup, setLineup] = useState(initialLineupData);

  // Update internal lineup when initialLineupData prop changes (e.g., when switching teams)
  useEffect(() => {
    setLineup(initialLineupData);
  }, [initialLineupData]);

  const handlePlayerListChange = (newLineup) => {
    setLineup(newLineup);
    if (onLineupChange) {
        onLineupChange(newLineup);
    }
  };

  const handleRemovePlayer = (playerIdToRemove) => {
    const newLineup = lineup.filter(player => player.id !== playerIdToRemove);
    handlePlayerListChange(newLineup);
  };

  const handleAddPlayersFromPaste = (parsedPlayers) => {
    const newPlayersWithIds = parsedPlayers.map((p, index) => ({
      ...p,
      // id: uuidv4() // Using uuid for robust unique IDs
      id: `${teamName}-pasted-${Date.now()}-${index}` // Simpler unique ID for now
    }));
    const newLineup = [...lineup, ...newPlayersWithIds];
    handlePlayerListChange(newLineup);
  };

  return (
    <div className="team-lineup-manager">
      <h2 className="lineup-title">Create lineup for {teamName}</h2>
      <DraggablePlayerList
        players={lineup}
        setPlayers={handlePlayerListChange} // For reordering within DPL
        onRemovePlayer={handleRemovePlayer}
      />
      <PasteToAddPlayers onAddPlayers={handleAddPlayersFromPaste} />
    </div>
  );
}
export default TeamLineupManager;