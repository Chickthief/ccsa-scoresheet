import React, { useState } from 'react';

function ViewLine({
    onViewLinescore,
    onViewLineup,
}) {
    const handleViewLinescoreClick = () => {
        onViewLinescore();
  };
    const handleViewLineupClick = () => {
        onViewLineup();
  };

    return (
    <div className="viewline-buttons-area">
        <div className="hit-actions">
            <button onClick={handleViewLinescoreClick} className="button-ccsa small-pr">
                View Linescore
            </button>
            <button onClick={handleViewLineupClick} className="button-ccsa small-pr">
                View Lineup
            </button>
        </div>
    </div>
    );
    
}

export default ViewLine