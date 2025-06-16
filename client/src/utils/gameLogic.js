// src/utils/gameLogic.js

export const getInningSuffix = (inning) => {
  if (inning % 100 >= 11 && inning % 100 <= 13) return 'th';
  switch (inning % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export const getPlayerById = (playerId, homeTeamLineup, awayTeamLineup) => {
  if (!playerId) return null;
  const allPlayers = [...(homeTeamLineup || []), ...(awayTeamLineup || [])];
  return allPlayers.find(p => p.id === playerId);
};

const calculateBattingInfo = (state) => {
    const { homeTeamLineup, awayTeamLineup, isTopInning, currentBatterIndex } = state;
    const battingTeamName = isTopInning ? state.awayTeamName : state.homeTeamName;
    const currentLineup = isTopInning ? awayTeamLineup : homeTeamLineup;
    const batterIdx = isTopInning ? currentBatterIndex.away : currentBatterIndex.home;
    
    if (!currentLineup || currentLineup.length === 0) {
        return { batter: null, onDeck: null, inTheHole: null, battingTeamName };
    }

    const batter = currentLineup[batterIdx] || null;
    const onDeck = currentLineup[(batterIdx + 1) % currentLineup.length] || null;
    const inTheHole = currentLineup[(batterIdx + 2) % currentLineup.length] || null;

    return { batter, onDeck, inTheHole, battingTeamName };
};

export const initialGameState = (initData) => {
  const baseState = {
    homeTeamLineup: initData.homeTeamLineup || [],
    awayTeamLineup: initData.awayTeamLineup || [],
    homeTeamName: initData.homeTeamName || 'Home',
    awayTeamName: initData.awayTeamName || 'Away',
    gameDetails: initData.gameDetails || {},
    currentInning: 1,
    isTopInning: true,
    outs: 0,
    score: { home: 0, away: 0 },
    bases: { first: null, second: null, third: null },
    currentBatterIndex: { home: 0, away: 0 },
    currentPlay: { type: null, stage: null, details: {} },
    isGameOver: false,
    history: [],
  };
  const battingInfo = calculateBattingInfo(baseState);
  return { ...baseState, battingInfo };
};

export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'START_PLAY':
      return {
        ...state,
        currentPlay: {
          ...state.currentPlay,
          type: action.payload.playType,
          stage: 'awaitingLocation',
        },
      };

    case 'CANCEL_PLAY':
      return {
        ...state,
        currentPlay: { type: null, stage: null, details: {} },
      };

    // --- FIX: This is the completely new, intelligent RESOLVE_PLAY logic ---
    case 'RESOLVE_PLAY': {
      // Create a mutable copy of the state to work with
      const nextState = JSON.parse(JSON.stringify(state));
      const playOutcomes = action.payload; // This comes from PlayResolutionPage

      let outsThisPlay = 0;
      let runsThisPlay = 0;

      // Reset bases for the new state
      const newBases = { first: null, second: null, third: null };

      // Process each player involved in the play
      playOutcomes.forEach(outcome => {
        if (outcome.status === 'out') {
          outsThisPlay++;
        }
        if (outcome.status === 'safe') {
          if (outcome.finalBase === 'H') {
            runsThisPlay++;
          } else {
            // Place the player on their new base
            if(outcome.finalBase === 1) newBases.first = outcome.id;
            if(outcome.finalBase === 2) newBases.second = outcome.id;
            if(outcome.finalBase === 3) newBases.third = outcome.id;
          }
        }
      });

      // Update the state with the new base runners
      nextState.bases = newBases;

      // Update score
      if (runsThisPlay > 0) {
        if (nextState.isTopInning) {
          nextState.score.away += runsThisPlay;
        } else {
          nextState.score.home += runsThisPlay;
        }
      }

      // Update outs and check for end of inning
      nextState.outs += outsThisPlay;
      if (nextState.outs >= 3) {
        // End of the half-inning
        nextState.outs = 0;
        nextState.bases = { first: null, second: null, third: null };
        
        if (nextState.isTopInning) {
          // Move to bottom of the inning
          nextState.isTopInning = false;
        } else {
          // Move to top of the next inning
          nextState.isTopInning = true;
          nextState.currentInning++;
        }
      }

      // Advance the batter for the next play
      if (nextState.isTopInning) {
        nextState.currentBatterIndex.away = (nextState.currentBatterIndex.away + 1) % nextState.awayTeamLineup.length;
      } else {
        nextState.currentBatterIndex.home = (nextState.currentBatterIndex.home + 1) % nextState.homeTeamLineup.length;
      }

      // Recalculate batting info for the new batter
      nextState.battingInfo = calculateBattingInfo(nextState);

      // Reset the current play and save history
      nextState.currentPlay = { type: null, stage: null, details: {} };
      nextState.history = [...state.history, state];

      return nextState;
    }

    default:
      return state;
  }
};
