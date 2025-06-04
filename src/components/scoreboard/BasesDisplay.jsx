// src/components/scoreboard/BasesDisplay.jsx
import React from 'react';

function BasesDisplay({ bases }) {
  // Ensure bases object exists and provide defaults
  const safeBases = bases || {};
  const firstOccupied = !!safeBases.first;
  const secondOccupied = !!safeBases.second;
  const thirdOccupied = !!safeBases.third;

  return (
    <div className="bases-display-container"> {/* Renamed for clarity */}
      {/* Each base is an empty div, styled and positioned by CSS */}
      <div className={`base-marker second-base-marker ${secondOccupied ? 'occupied' : ''}`}></div>
      <div className={`base-marker third-base-marker ${thirdOccupied ? 'occupied' : ''}`}></div>
      <div className={`base-marker first-base-marker ${firstOccupied ? 'occupied' : ''}`}></div>
    </div>
  );
}
export default BasesDisplay;