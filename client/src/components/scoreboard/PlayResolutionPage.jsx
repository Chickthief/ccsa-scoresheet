// src/components/scoreboard/PlayResolutionPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import SmallBaseballDiamondDisplay from './SmallBaseballDiamondDisplay'; // You'll need to create this component

// Helper to get player display info (number and first name)
const getPlayerDisplaySimple = (player) => {
  if (!player) return { number: 'N/A', firstName: '' };
  return {
    number: player.number || '??',
    firstName: player.name ? player.name.split(' ')[0] : 'Player',
  };
};

// Defined once, used by PlayerOutcomeSelector
const baseOptionsForAll = [
  { label: '1B', value: 1 },
  { label: '2B', value: 2 },
  { label: '3B', value: 3 },
  { label: 'HOME', value: 'H' }
];

// Internal component for selecting outcome for a single player
function PlayerOutcomeSelector({ player, onOutcomeChange, currentOutcome, occupiedBasesMap }) {
  const { status, finalBase } = currentOutcome || { status: null, finalBase: null };
  const { number: playerNumber, firstName: playerFirstName } = getPlayerDisplaySimple(player);

  const handleStatusChange = (newStatus) => {
    if (status !== newStatus) {
      onOutcomeChange(player.id, { status: newStatus, finalBase: null });
    }
  };

  const handleBaseChange = (clickedBaseValue) => {
    const newFinalBase = (finalBase === clickedBaseValue) ? null : clickedBaseValue;
    onOutcomeChange(player.id, { status, finalBase: newFinalBase });
  };

  const availableBasesForPlayer = useMemo(() => {
    // This filter now applies if status is 'safe' OR 'out'
    if (!status) return []; // If no status, no specific options for advancement/out location

    const playerStartBase = player.isBatter ? 0 : (player.startingBase || 0);
    if (playerStartBase === 0 || playerStartBase === 1) return baseOptionsForAll;
    if (playerStartBase === 2) return baseOptionsForAll.filter(b => b.value === 2 || b.value === 3 || b.value === 'H');
    if (playerStartBase === 3) return baseOptionsForAll.filter(b => b.value === 3 || b.value === 'H');
    return baseOptionsForAll; // Fallback
  }, [status, player.isBatter, player.startingBase]); // Status is a dependency

  // basesToRender will now always use the filtered list if a status is active
  const basesToRender = status ? availableBasesForPlayer : [];

  return (
    <div className="player-outcome-column">
      <h4>{player.isBatter ? 'At Bat' : `${player.startingBase}B`}</h4>
      <div className="player-identification">
        <span className="player-number-pr">{playerNumber}</span>
        <span className="player-name-pr">{playerFirstName}</span>
      </div>
      <div className="outcome-buttons-pr">
        <button
          onClick={() => handleStatusChange('safe')}
          className={`button-ccsa small-pr ${status === 'safe' ? 'active-pr' : ''}`}
        >
          Safe
        </button>
        <button
          onClick={() => handleStatusChange('out')}
          className={`button-ccsa small-pr ${status === 'out' ? 'active-pr' : ''}`}
        >
          OUT
        </button>
      </div>
      <div className="at-text-container">
        {status && <p className="at-text-pr">at</p>}
      </div>
      <div className="base-buttons-pr">
        {baseOptionsForAll.map(b_option => {
          const isActuallyAvailable = status && basesToRender.find(b => b.value === b_option.value);
          const isSelected = finalBase === b_option.value;
          let isDisabled = false;
          if (status === 'safe' && isActuallyAvailable) {
            isDisabled = b_option.value !== 'H' &&
                         occupiedBasesMap[b_option.value] &&
                         occupiedBasesMap[b_option.value] !== player.id;
          }

          if (isActuallyAvailable) {
            return (
              <button
                key={`${player.id}-${b_option.value}`}
                onClick={() => handleBaseChange(b_option.value)}
                className={`button-ccsa small-pr base-option ${isSelected ? 'active-pr' : ''}`}
                disabled={isDisabled}
              >
                {b_option.label}
              </button>
            );
          } else {
            return status ? <div key={`${player.id}-placeholder-${b_option.value}`} className="button-placeholder-pr"></div> : null;
          }
        })}
      </div>
    </div>
  );
}

function PlayResolutionPage({
  currentBatter,
  runnersOnBaseStart,
  // initialGameOuts, // Not directly displayed, total outs in main GameStateBar
  onPlayFinalized,
  onGoBack,
  // homeTeamLineup, // Not strictly needed if currentBatter/runnersOnBaseStart have full player objects
  // awayTeamLineup,
}) {
  const playersInvolved = useMemo(() => {
    const batterObj = {
      ...(currentBatter || {}),
      id: currentBatter?.id || `batter-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      isBatter: true,
      startingBase: 0,
      name: currentBatter?.name || "Batter",
      number: currentBatter?.number || "BR"
    };
    const runners = (runnersOnBaseStart || []).map((r, idx) => ({
      ...r,
      isBatter: false,
      id: r.id || `runner-${idx}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: r.name || `Runner ${idx+1}`,
      number: r.number || `R${idx+1}`
    }));
    return [batterObj, ...runners].sort((a, b) => (a.startingBase || 0) - (b.startingBase || 0));
  }, [currentBatter, runnersOnBaseStart]);

  const [pendingOutcomes, setPendingOutcomes] = useState({});

  useEffect(() => {
    const outcomes = {};
    playersInvolved.forEach(p => {
      outcomes[p.id] = { status: null, finalBase: null, name: p.name, number: p.number };
    });
    setPendingOutcomes(outcomes);
    console.log("PlayResolutionPage: Initialized/Reset pendingOutcomes based on playersInvolved");
  }, [playersInvolved]);

  const handlePlayerOutcomeChange = (playerId, newOutcome) => {
    setPendingOutcomes(prev => ({
      ...prev,
      [playerId]: { ...(prev[playerId]), ...newOutcome }
    }));
  };

  const occupiedBasesMap = useMemo(() => {
    const map = { 1: null, 2: null, 3: null };
    playersInvolved.forEach(p => {
      const outcome = pendingOutcomes[p.id];
      if (outcome && outcome.status === 'safe' && outcome.finalBase && outcome.finalBase !== 'H') {
        map[outcome.finalBase] = p.id;
      }
    });
    return map;
  }, [pendingOutcomes, playersInvolved]);

  const outsThisPlay = useMemo(() => Object.values(pendingOutcomes).filter(o => o.status === 'out').length, [pendingOutcomes]);
  const runsThisPlay = useMemo(() => Object.values(pendingOutcomes).filter(o => o.status === 'safe' && o.finalBase === 'H').length, [pendingOutcomes]);

  const currentPendingBasesForDiamond = useMemo(() => {
    const bases = { first: null, second: null, third: null };
    playersInvolved.forEach(p => {
      const outcome = pendingOutcomes[p.id];
      if (outcome && outcome.status === 'safe') {
        const playerDetails = playersInvolved.find(pl => pl.id === p.id);
        const displayId = playerDetails ? (getPlayerDisplaySimple(playerDetails).firstName || playerDetails.number) : 'Occ';
        if (outcome.finalBase === 1) bases.first = displayId;
        else if (outcome.finalBase === 2) bases.second = displayId;
        else if (outcome.finalBase === 3) bases.third = displayId;
      }
    });
    return bases;
  }, [pendingOutcomes, playersInvolved]);

  const allPlayersActionResolved = useMemo(() => {
    if (playersInvolved.length === 0) return false;
    return playersInvolved.every(p => {
      const outcome = pendingOutcomes[p.id];
      return outcome && typeof outcome.status === 'string' && (typeof outcome.finalBase === 'number' || outcome.finalBase === 'H');
    });
  }, [playersInvolved, pendingOutcomes]);

  const handleEndAtBat = () => {
    const safePlayerBases = {};
    let multipleSafeOnSameBase = false;
    for (const p of playersInvolved) {
      const outcome = pendingOutcomes[p.id];
      if (outcome && outcome.status === 'safe' && outcome.finalBase && outcome.finalBase !== 'H') {
        if (safePlayerBases[outcome.finalBase]) {
          multipleSafeOnSameBase = true; break;
        }
        safePlayerBases[outcome.finalBase] = p.id;
      }
    }
    if (multipleSafeOnSameBase) {
      alert("Error: Multiple players cannot be safe on the same base. Please correct the selections."); return;
    }
    if (!allPlayersActionResolved) {
      alert("Please select an outcome (Safe/OUT) and a final base for all players involved."); return;
    }
    const finalizedPlayerOutcomes = playersInvolved.map(p => ({
      id: p.id, name: p.name, number: p.number, isBatter: p.isBatter,
      startingBase: p.startingBase, status: pendingOutcomes[p.id].status,
      finalBase: pendingOutcomes[p.id].finalBase,
    }));
    onPlayFinalized(finalizedPlayerOutcomes);
  };

  if (!currentBatter || !runnersOnBaseStart) {
    return <div className="play-resolution-page"><p>Loading play data...</p></div>;
  }

  return (
    <div className="play-resolution-page">
      <div className="prp-summary-row">
        <div className="prp-small-diamond-area">
          {/* Replace this with your actual SmallBaseballDiamondDisplay component */}
          <SmallBaseballDiamondDisplay currentPositions={currentPendingBasesForDiamond} />
        </div>
        <div className="prp-live-stats">
          <p>Outs this play: {outsThisPlay}</p>
          <p>Runs this play: {runsThisPlay}</p>
        </div>
      </div>

      <div className="player-outcomes-grid">
        {playersInvolved.map(player => (
          <PlayerOutcomeSelector
            key={player.id}
            player={player}
            onOutcomeChange={handlePlayerOutcomeChange}
            currentOutcome={pendingOutcomes[player.id]}
            allBasesOptions={baseOptionsForAll} // Using the constant defined above PlayerOutcomeSelector
            occupiedBasesMap={occupiedBasesMap}
          />
        ))}
      </div>

      {/* Advancement Summary Text (New) */}
      <div className="prp-advancement-summary">
        {playersInvolved
          .filter(player => pendingOutcomes[player.id]?.status && pendingOutcomes[player.id]?.finalBase) // Only show resolved players
          .map(player => {
            const outcome = pendingOutcomes[player.id];
            const playerInfo = getPlayerDisplaySimple(player);
            const startBaseLabel = player.isBatter ? "Home" : `${player.startingBase}B`;
            const endBaseLabel = outcome.finalBase === 'H' ? "HOME" : `${outcome.finalBase}B`;
            return (
              <p key={`summary-${player.id}`} className="advancement-text">
                {playerInfo.firstName} ({playerInfo.number}):
                {outcome.status === 'out'
                  ? <span className="out-text"> OUT</span>
                  : <span className="safe-text"> SAFE</span>}
                {' at '} {endBaseLabel}
                {/* <span className="from-text"> (from {startBaseLabel})</span> */}
              </p>
            );
        })}
      </div>

      <div className="prp-action-buttons-footer">
        <button
          onClick={onGoBack}
          className="button-ccsa secondary-action-button"
        >
          Go Back
        </button>
        <button
          onClick={handleEndAtBat}
          disabled={!allPlayersActionResolved}
          className="button-ccsa end-at-bat-button"
        >
          End this at bat
        </button>
      </div>
    </div>
  );
}
export default PlayResolutionPage;