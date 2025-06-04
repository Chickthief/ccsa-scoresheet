// src/components/gameSetup/PlayerRow.jsx
import React from 'react';

// draggableProvided: props for the main div to make it draggable
// isDragging: boolean to know if the item is currently being dragged
function PlayerRow({ player, onRemove, draggableProvided, isDragging }) {
  return (
    <div
      className={`player-row ${isDragging ? 'dragging' : ''}`}
      ref={draggableProvided.innerRef} // Important: ref for the D&D library
      {...draggableProvided.draggableProps} // Props to make the whole row draggable (usually applied here)
    >
      <div {...draggableProvided.dragHandleProps} className="drag-handle"> {/* Props for the specific drag handle */}
        ☰
      </div>
      <input
        type="text"
        className="player-input jersey-number-input"
        value={player.number}
        readOnly
        placeholder="No."
      />
      <input
        type="text"
        className="player-input player-name-input"
        value={player.name}
        readOnly
        placeholder="Player Name"
      />
      <button onClick={() => onRemove(player.id)} className="remove-player-button">
        -
      </button>
    </div>
  );
}
export default PlayerRow;