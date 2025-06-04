// src/components/gameSetup/PasteToAddPlayers.jsx
import React, { useState } from 'react';

function PasteToAddPlayers({ onAddPlayers }) {
  const [pastedText, setPastedText] = useState('');

  const handlePasteChange = (event) => {
    setPastedText(event.target.value);
  };

  const processPaste = () => {
    if (!pastedText.trim()) return;
    const players = [];
    const lines = pastedText.trim().split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const number = parts[0];
        const name = parts.slice(1).join(' ');
        players.push({ number, name }); // id will be added by parent
      }
    });
    if (players.length > 0) {
      onAddPlayers(players);
      setPastedText('');
    } else {
      alert("Could not parse players. Format: Number Name per line.");
    }
  };

  return (
    <div className="paste-players-section">
      <label htmlFor="paste-area" className="paste-label">
        Paste in more players:
      </label>
      <textarea
        id="paste-area"
        className="paste-textarea"
        value={pastedText}
        onChange={handlePasteChange}
        rows="4" // Adjusted rows
        placeholder={"Example:\n50 Marcus\n23 Jeffrey"}
      />
      <button onClick={processPaste} className="button-ccsa add-from-paste-button">
        Add from Paste
      </button>
    </div>
  );
}
export default PasteToAddPlayers;