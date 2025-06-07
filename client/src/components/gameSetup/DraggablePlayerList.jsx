// src/components/gameSetup/DraggablePlayerList.jsx
import React from 'react';
import PlayerRow from './PlayerRow';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // <-- Import D&D components

function DraggablePlayerList({ players, setPlayers, onRemovePlayer }) {
  // This function is called when a drag operation ends
  const handleOnDragEnd = (result) => {
    // If the item is dropped outside of a droppable area
    if (!result.destination) return;

    // If the item is dropped in the same position it started
    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return;
    }

    const items = Array.from(players); // Create a new array copy
    const [reorderedItem] = items.splice(result.source.index, 1); // Remove the dragged item
    items.splice(result.destination.index, 0, reorderedItem); // Insert it at the new position

    setPlayers(items); // Update the state in TeamLineupManager with the new order
  };

  if (!players || players.length === 0) {
    return <p style={{ textAlign: 'center', margin: '20px 0' }}>No players in this lineup yet.</p>;
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="player-list">
        {(providedDroppable) => (
          <div
            className="player-list-container"
            {...providedDroppable.droppableProps}
            ref={providedDroppable.innerRef}
          >
            {players.map((player, index) => (
              <Draggable key={player.id.toString()} draggableId={player.id.toString()} index={index}>
                {(providedDraggable, snapshot) => (
                  // Pass necessary props to PlayerRow
                  <PlayerRow
                    player={player}
                    onRemove={onRemovePlayer}
                    // D&D provided props for the draggable item and its handle
                    draggableProvided={providedDraggable}
                    // dragHandleProps are part of draggableProvided
                    isDragging={snapshot.isDragging}
                  />
                )}
              </Draggable>
            ))}
            {providedDroppable.placeholder} {/* Important for D&D space reservation */}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
export default DraggablePlayerList;