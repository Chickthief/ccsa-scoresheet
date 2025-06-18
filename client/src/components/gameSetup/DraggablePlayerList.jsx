import React, { useEffect, useRef } from 'react';
import PlayerRow from './PlayerRow';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function DraggablePlayerList({ players, setPlayers, onRemovePlayer, currentBatterId }) {
  const listContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to the current batter if one is specified
    if (listContainerRef.current && currentBatterId) {
      const itemSelector = `[data-rbd-draggable-id="${currentBatterId}"]`;
      const el = listContainerRef.current.querySelector(itemSelector);
      if (el) {
        el.scrollIntoView({
          behavior: 'auto',
          block: 'center',
        });
      }
    }
  }, [currentBatterId, players]);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return;
    }

    const items = Array.from(players);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPlayers(items);
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
            ref={(el) => {
              providedDroppable.innerRef(el);
              listContainerRef.current = el;
            }}
          >
            {players.map((player, index) => (
              <Draggable key={player.id.toString()} draggableId={player.id.toString()} index={index}>
                {(providedDraggable, snapshot) => (
                  <div style={{ backgroundColor: player.id === currentBatterId ? '#e0f7fa' : undefined, borderRadius: '4px', marginBottom: '4px' }}>
                    <PlayerRow
                      player={player}
                      onRemove={onRemovePlayer}
                      draggableProvided={providedDraggable}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {providedDroppable.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
export default DraggablePlayerList;