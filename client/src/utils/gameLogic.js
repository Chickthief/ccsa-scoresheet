import { MERCY_RULE_SCORE } from "./constants";

// --- HELPER FUNCTIONS ---
export const getPlayerById = (playerId, lineup1 = [], lineup2 = []) => {
    if (!playerId) return null;
    return [...lineup1, ...lineup2].find(p => p && p.id === playerId) || null;
};

export const getBattingOrderInfo = (lineup = [], currentIndex = 0) => {
    if (!lineup || lineup.length === 0) {
        return { batter: null, onDeck: null, inTheHole: null };
    }
    const size = lineup.length;
    return {
        batter: lineup[currentIndex % size] || null,
        onDeck: lineup[(currentIndex + 1) % size] || null,
        inTheHole: lineup[(currentIndex + 2) % size] || null,
    };
};

export const getInningSuffix = (inning) => {
  if (typeof inning !== 'number' || isNaN(inning)) return 'th';
  const absInning = Math.abs(inning);
  if (absInning % 10 === 1 && absInning % 100 !== 11) return 'st';
  if (absInning % 10 === 2 && absInning % 100 !== 12) return 'nd';
  if (absInning % 10 === 3 && absInning % 100 !== 13) return 'rd';
  return 'th';
};

// --- INITIALIZER FOR THE REDUCER ---
export const initialGameState = (initArgs) => {
    const awayTeamName = initArgs.awayTeamName || "Away";
    const homeTeamName = initArgs.homeTeamName || "Home";
    const awayTeamLineup = initArgs.awayTeamLineup || [];
    const battingInfo = getBattingOrderInfo(awayTeamLineup, 0);

    return {
        gameHistory: [],
        inning: 1,
        isTopInning: true,
        outs: 0,
        score: { away: 0, home: 0 },
        bases: { first: null, second: null, third: null },
        homeTeamName,
        awayTeamName,
        homeTeamLineup: initArgs.homeTeamLineup || [],
        awayTeamLineup: awayTeamLineup,
        currentBatterIndex: { away: 0, home: 0 },
        battingInfo: { ...battingInfo, battingTeamName: awayTeamName },
        isGameOver: false,
        gameDetails: initArgs.gameDetails || {},
        currentPlay: { type: null, stage: null, details: {} },
        inningScores: {
          away: [0],
          home: []
        },
    };
};

// --- THE GAME REDUCER ---
export function gameReducer(state, action) {
    const saveState = (newState) => ({ ...newState, gameHistory: [...state.gameHistory, state] });

    switch (action.type) {
        case 'START_PLAY':
            return {
                ...state,
                currentPlay: { type: action.payload.playType, stage: 'awaitingLocation', details: action.payload }
            };

        case 'CANCEL_PLAY':
            return { ...state, currentPlay: { type: null, stage: null, details: {} } };
        
        case 'RESOLVE_PLAY': {
            const { payload } = action;
            const newState = {
                ...state,
                score: { ...state.score },
                bases: { ...state.bases },
                currentBatterIndex: { ...state.currentBatterIndex },
                inningScores: {
                    away: [...state.inningScores.away],
                    home: [...state.inningScores.home],
                }
            };

            let runsThisPlay = 0;
            let outsThisPlay = 0;

            if (Array.isArray(payload)) {
                const runnerOutcomes = payload;
                for (const runner of runnerOutcomes) {
                    const runnerId = runner.id;
                    for (const base in newState.bases) {
                        if (newState.bases[base] === runnerId) {
                            newState.bases[base] = null;
                        }
                    }
                }
                for (const runner of runnerOutcomes) {
                    if (runner.status === 'safe') {
                        if (runner.finalBase === 1) newState.bases.first = runner.id;
                        else if (runner.finalBase === 2) newState.bases.second = runner.id;
                        else if (runner.finalBase === 3) newState.bases.third = runner.id;
                        else if (runner.finalBase === 'H') runsThisPlay++;
                    } else if (runner.status === 'out') {
                        outsThisPlay++;
                    }
                }
            } 
            else if (payload.type && payload.type.includes('Out')) {
                outsThisPlay = 1;
            }

            if (runsThisPlay > 0) {
                const teamKey = newState.isTopInning ? 'away' : 'home';
                const inningIndex = newState.inning - 1;
                newState.inningScores[teamKey][inningIndex] = (newState.inningScores[teamKey][inningIndex] || 0) + runsThisPlay;
            }
            
            newState.score[newState.isTopInning ? 'away' : 'home'] += runsThisPlay;
            newState.outs += outsThisPlay;
            
            const battingTeamKey = newState.isTopInning ? 'away' : 'home';
            const battingLineup = newState[`${battingTeamKey}TeamLineup`];
            if (battingLineup && battingLineup.length > 0) {
                newState.currentBatterIndex[battingTeamKey] = (newState.currentBatterIndex[battingTeamKey] + 1) % battingLineup.length;
            }
            
            if (newState.outs >= 3) {
                const wasTop = newState.isTopInning;
                newState.outs = 0;
                newState.bases = { first: null, second: null, third: null };
                newState.isTopInning = !wasTop;
                
                if (!wasTop) {
                    newState.inning++;
                    if (newState.inning <= 7 || newState.score.home === newState.score.away) {
                        newState.inningScores.away.push(0);
                        newState.inningScores.home.push(0);
                    }
                }
            }

            const nextTeamKey = newState.isTopInning ? 'away' : 'home';
            const nextLineup = newState[`${nextTeamKey}TeamLineup`];
            const nextIndex = newState.currentBatterIndex[nextTeamKey];
            newState.battingInfo = {
                ...getBattingOrderInfo(nextLineup, nextIndex),
                battingTeamName: newState[`${nextTeamKey}TeamName`]
            };
            
            newState.currentPlay = { type: null, stage: null, details: {} };
            return saveState(newState);
        }
        
        case 'SKIP_BATTER': {
            let newState = { ...state };
            const teamKey = newState.isTopInning ? 'away' : 'home';
            const currentLineup = newState[`${teamKey}TeamLineup`];
            if (!currentLineup || currentLineup.length === 0) return state;
            const newIndex = (newState.currentBatterIndex[teamKey] + 1) % currentLineup.length;
            newState.currentBatterIndex[teamKey] = newIndex;
            newState.battingInfo = {
                ...getBattingOrderInfo(currentLineup, newIndex),
                battingTeamName: newState[`${teamKey}TeamName`]
            };
            return saveState(newState);
        }

        case 'UNDO': {
            if (!state.gameHistory || state.gameHistory.length === 0) return state;
            const previousState = state.gameHistory[state.gameHistory.length - 1];
            const newHistory = state.gameHistory.slice(0, -1);
            return {
                ...previousState,
                gameHistory: newHistory,
            };
        }
        case 'END_INNING': {
            const newState = {
                ...state,
                score: { ...state.score },
                bases: { first: null, second: null, third: null },
                currentBatterIndex: { ...state.currentBatterIndex },
                inningScores: {
                    away: [...state.inningScores.away],
                    home: [...state.inningScores.home],
                }
            };

            const wasTop = newState.isTopInning;
            newState.outs = 0;
            newState.isTopInning = !wasTop;

            if (!wasTop) {
                newState.inning++;
                if (newState.inning <= 7 || newState.score.home === newState.score.away) {
                    newState.inningScores.away.push(0);
                    newState.inningScores.home.push(0);
                }
            }
            
            const nextTeamKey = newState.isTopInning ? 'away' : 'home';
            const nextLineup = newState[`${nextTeamKey}TeamLineup`];
            const nextIndex = newState.currentBatterIndex[nextTeamKey];
            newState.battingInfo = {
                ...getBattingOrderInfo(nextLineup, nextIndex),
                battingTeamName: newState[`${nextTeamKey}TeamName`]
            };
            
            return saveState(newState);
        }
        
        case 'MERCY_RULE_END_INNING': {
            const runnerOutcomes = action.payload;
            const newState = {
                ...state,
                score: { ...state.score },
                bases: { ...state.bases },
                currentBatterIndex: { ...state.currentBatterIndex },
                inningScores: {
                    away: [...state.inningScores.away],
                    home: [...state.inningScores.home],
                }
            };
            
            let runsThisPlay = 0;
            let outsThisPlay = 0;
            let currentBases = { ...newState.bases };

            for (const runner of runnerOutcomes) {
                for (const base in currentBases) {
                    if (currentBases[base] === runner.id) {
                        currentBases[base] = null;
                    }
                }
            }
            for (const runner of runnerOutcomes) {
                if (runner.status === 'safe') {
                    const baseName = runner.finalBase === 1 ? 'first' : runner.finalBase === 2 ? 'second' : 'third';
                    if (runner.finalBase >= 1 && runner.finalBase <= 3) {
                        currentBases[baseName] = runner.id;
                    } else if (runner.finalBase === 'H') {
                        runsThisPlay++;
                    }
                } else if (runner.status === 'out') {
                    outsThisPlay++;
                }
            }
            newState.bases = currentBases;
            newState.outs += outsThisPlay;

            const teamKey = newState.isTopInning ? 'away' : 'home';
            const inningIndex = newState.inning - 1;
            const runsSoFarInInning = newState.inningScores[teamKey][inningIndex] || 0;
            
            const runsAllowedToScore = Math.max(0, MERCY_RULE_SCORE - runsSoFarInInning);
            const runsToCountForPlay = Math.min(runsThisPlay, runsAllowedToScore);

            if (runsToCountForPlay > 0) {
                newState.inningScores[teamKey][inningIndex] += runsToCountForPlay;
                newState.score[teamKey] += runsToCountForPlay;
            }

            const battingTeamKey = newState.isTopInning ? 'away' : 'home';
            const battingLineup = newState[`${battingTeamKey}TeamLineup`];
            if (battingLineup && battingLineup.length > 0) {
                newState.currentBatterIndex[battingTeamKey] = (newState.currentBatterIndex[battingTeamKey] + 1) % battingLineup.length;
            }

            const wasTop = newState.isTopInning;
            newState.outs = 0;
            newState.bases = { first: null, second: null, third: null };
            newState.isTopInning = !wasTop;
            
            if (!wasTop) {
                newState.inning++;
                if (newState.inning <= 7 || newState.score.home === newState.score.away) {
                    newState.inningScores.away.push(0);
                    newState.inningScores.home.push(0);
                }
            }
            
            const nextTeamKey = newState.isTopInning ? 'away' : 'home';
            const nextLineup = newState[`${nextTeamKey}TeamLineup`];
            const nextIndex = newState.currentBatterIndex[nextTeamKey];
            newState.battingInfo = {
                ...getBattingOrderInfo(nextLineup, nextIndex),
                battingTeamName: newState[`${nextTeamKey}TeamName`]
            };

            newState.currentPlay = { type: null, stage: null, details: {} };
            return saveState(newState);
        }

        case 'END_GAME': {
            return { ...state, isGameOver: true };
        }

        default:
            return state;
    }
}