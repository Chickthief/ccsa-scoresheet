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
    const { awayTeam, homeTeam, gameDetails } = initArgs;
    
    const awayTeamLineup = awayTeam?.lineup || [];
    const awayTeamName = awayTeam?.name || "Away";

    const battingInfo = getBattingOrderInfo(awayTeamLineup, 0);

    return {
        gameHistory: [],
        inning: 1,
        isTopInning: true,
        outs: 0,
        score: { away: 0, home: 0 },
        bases: { first: null, second: null, third: null },
        homeTeam: homeTeam || { name: "Home", lineup: [] },
        awayTeam: awayTeam || { name: "Away", lineup: [] },
        currentBatterIndex: { away: 0, home: 0 },
        battingInfo: { ...battingInfo, battingTeamName: awayTeamName },
        isGameOver: false,
        gameDetails: gameDetails || {},
        currentPlay: { type: null, stage: null, details: {} },
        inningScores: { away: [0], home: [] },
        playLog: [],
    };
};

// --- THE GAME REDUCER ---
export function gameReducer(state, action) {
    const saveState = (newState) => ({ ...newState, gameHistory: [...state.gameHistory, state] });

    switch (action.type) {
        case 'START_PLAY':
            return { ...state, currentPlay: { type: action.payload.playType, stage: 'awaitingLocation', details: action.payload } };
        case 'CANCEL_PLAY':
            return { ...state, currentPlay: { type: null, stage: null, details: {} } };
        case 'RESOLVE_PLAY': {
            const { payload } = action;
            const newState = { ...state, playLog: [...state.playLog] };
            let runsThisPlay = 0;
            let outsThisPlay = 0;
            const batter = state.battingInfo.batter;
            if (Array.isArray(payload)) {
                if (batter) {
                    const teamDetails = state.isTopInning ? state.awayTeam : state.homeTeam;
                    const rbi = payload.filter(runner => runner && runner.id !== batter.id && runner.status === 'safe' && runner.finalBase === 'H').length;
                    
                    newState.playLog.push({
                        player_user_id: batter.id,
                        team_id: teamDetails.id,
                        inning: state.inning,
                        outcome: state.currentPlay.type || 'UNKNOWN',
                        runners_batted_in: rbi,
                    });
                }
                const newBases = { ...state.bases };
                payload.forEach(runner => {
                    if (!runner) return;
                    Object.keys(newBases).forEach(base => { if (newBases[base] === runner.id) newBases[base] = null; });
                });
                payload.forEach(runner => {
                     if(!runner) return;
                     if(runner.status === 'safe') {
                         if(runner.finalBase === 'H') runsThisPlay++;
                         else if (runner.finalBase) newBases[`${['first', 'second', 'third'][runner.finalBase - 1]}`] = runner.id;
                     } else if (runner.status === 'out') outsThisPlay++;
                });
                newState.bases = newBases;
            } else if (payload.type) {
                 if (payload.type.includes('Out') || payload.type === 'STRIKEOUT') outsThisPlay = 1;
                if (batter) {
                    const teamDetails = state.isTopInning ? state.awayTeam : state.homeTeam;
                    newState.playLog.push({
                        player_user_id: batter.id, team_id: teamDetails.id, inning: state.inning,
                        outcome: payload.type, runners_batted_in: 0,
                    });
                }
            }
            const teamKeyForScore = state.isTopInning ? 'away' : 'home';
            newState.score = { ...state.score, [teamKeyForScore]: state.score[teamKeyForScore] + runsThisPlay };
            const inningIndex = state.inning - 1;
            const updatedInningScores = { ...state.inningScores };
            updatedInningScores[teamKeyForScore] = [...(updatedInningScores[teamKeyForScore] || [])];
            updatedInningScores[teamKeyForScore][inningIndex] = (updatedInningScores[teamKeyForScore][inningIndex] || 0) + runsThisPlay;
            newState.inningScores = updatedInningScores;
            newState.outs = state.outs + outsThisPlay;
            const battingTeamKey = state.isTopInning ? 'away' : 'home';
            const battingTeamObjectKey = state.isTopInning ? 'awayTeam' : 'homeTeam';
            const battingLineup = state[battingTeamObjectKey].lineup;
            if (battingLineup?.length) newState.currentBatterIndex = { ...state.currentBatterIndex, [battingTeamKey]: (state.currentBatterIndex[battingTeamKey] + 1) % battingLineup.length };
            if (newState.outs >= 3) {
                const wasTop = newState.isTopInning;
                newState.outs = 0;
                newState.bases = { first: null, second: null, third: null };
                newState.isTopInning = !wasTop;
                if (!wasTop) {
                    newState.inning++;
                    if (newState.inning <= 7 || newState.score.home === newState.score.away) {
                        newState.inningScores.away.push(0);
                        if (newState.inningScores.home.length < newState.inningScores.away.length) newState.inningScores.home.push(0);
                    }
                }
            }
            const nextTeamKey = newState.isTopInning ? 'away' : 'home';
            const nextTeamObjectKey = newState.isTopInning ? 'awayTeam' : 'homeTeam';
            const nextLineup = newState[nextTeamObjectKey].lineup;
            const nextIndex = newState.currentBatterIndex[nextTeamKey];
            newState.battingInfo = { ...getBattingOrderInfo(nextLineup, nextIndex), battingTeamName: newState[nextTeamObjectKey].name };
            newState.currentPlay = { type: null, stage: null, details: {} };
            return saveState(newState);
        }
        case 'SKIP_BATTER': {
            const teamKey = state.isTopInning ? 'away' : 'home';
            const teamObjectKey = state.isTopInning ? 'awayTeam' : 'homeTeam';
            const currentLineup = state[teamObjectKey].lineup;
            if (!currentLineup?.length) return state;
            const newIndex = (state.currentBatterIndex[teamKey] + 1) % currentLineup.length;
            return saveState({
                ...state,
                currentBatterIndex: { ...state.currentBatterIndex, [teamKey]: newIndex },
                battingInfo: { ...getBattingOrderInfo(currentLineup, newIndex), battingTeamName: state[teamObjectKey].name }
            });
        }
        case 'UNDO': {
            if (!state.gameHistory?.length) return state;
            const previousState = state.gameHistory[state.gameHistory.length - 1];
            return { ...previousState, gameHistory: state.gameHistory.slice(0, -1) };
        }
        case 'END_INNING': {
            const wasTop = state.isTopInning;
            const newState = { ...state, outs: 0, bases: { first: null, second: null, third: null }, isTopInning: !wasTop };
            if (!wasTop) {
                newState.inning++;
                if (newState.inning <= 7 || newState.score.home === newState.score.away) {
                    newState.inningScores.away.push(0);
                    if (newState.inningScores.home.length < newState.inningScores.away.length) newState.inningScores.home.push(0);
                }
            }
            const nextTeamKey = newState.isTopInning ? 'away' : 'home';
            const nextTeamObjectKey = newState.isTopInning ? 'awayTeam' : 'homeTeam';
            const nextLineup = newState[nextTeamObjectKey].lineup;
            const nextIndex = newState.currentBatterIndex[nextTeamKey];
            newState.battingInfo = { ...getBattingOrderInfo(nextLineup, nextIndex), battingTeamName: newState[nextTeamObjectKey].name };
            return saveState(newState);
        }
        case 'UPDATE_LINEUP': {
            const { teamName, newLineup } = action.payload;
            const newState = { ...state };
            const teamToUpdateKey = teamName === state.homeTeam.name ? 'homeTeam' : 'awayTeam';
            newState[teamToUpdateKey] = { ...state[teamToUpdateKey], lineup: newLineup };
            const battingTeamObjectKey = state.isTopInning ? 'awayTeam' : 'homeTeam';
            if (teamToUpdateKey === battingTeamObjectKey) {
                const battingTeamKey = state.isTopInning ? 'away' : 'home';
                const currentBatter = state.battingInfo.batter;
                let newIndex = state.currentBatterIndex[battingTeamKey];
                if (currentBatter) {
                    const foundIndex = newLineup.findIndex(p => p.id === currentBatter.id);
                    newIndex = (foundIndex === -1) ? newIndex : foundIndex;
                }
                if (newIndex >= newLineup.length) newIndex = 0;
                newState.currentBatterIndex = { ...state.currentBatterIndex, [battingTeamKey]: newIndex };
                newState.battingInfo = { ...getBattingOrderInfo(newLineup, newIndex), battingTeamName: state[battingTeamObjectKey].name };
            }
            return saveState(newState);
        }
        case 'MERCY_RULE_END_INNING': {
            const runnerOutcomes = action.payload;
            const newState = { ...state, playLog: [...state.playLog] };
            let runsThisPlay = 0;
            const batter = state.battingInfo.batter;
            runnerOutcomes.forEach(runner => {
                if (!runner) return;
                if (runner.status === 'safe' && runner.finalBase === 'H') runsThisPlay++;
            });
            const teamKey = state.isTopInning ? 'away' : 'home';
            const inningIndex = state.inning - 1;
            const runsSoFarInInning = state.inningScores[teamKey][inningIndex] || 0;
            const runsAllowedToScore = Math.max(0, MERCY_RULE_SCORE - runsSoFarInInning);
            const runsToCountForPlay = Math.min(runsThisPlay, runsAllowedToScore);

            if (runsToCountForPlay > 0) {
                newState.score[teamKey] += runsToCountForPlay;
                newState.inningScores[teamKey][inningIndex] += runsToCountForPlay;
            }

            if(batter) {
                const teamDetails = state.isTopInning ? state.awayTeam : state.homeTeam;
                 newState.playLog.push({
                    player_user_id: batter.id, team_id: teamDetails.id, inning: state.inning,
                    outcome: 'MERCY_RULE_ADVANCE', runners_batted_in: runsToCountForPlay,
                });
            }

            const battingTeamKey = state.isTopInning ? 'away' : 'home';
            const battingTeamObjectKey = state.isTopInning ? 'awayTeam' : 'homeTeam';
            const battingLineup = state[battingTeamObjectKey].lineup;
            if (battingLineup?.length) newState.currentBatterIndex = { ...state.currentBatterIndex, [battingTeamKey]: (state.currentBatterIndex[battingTeamKey] + 1) % battingLineup.length };
            
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
            const nextTeamObjectKey = newState.isTopInning ? 'awayTeam' : 'homeTeam';
            const nextLineup = newState[nextTeamObjectKey].lineup;
            const nextIndex = newState.currentBatterIndex[nextTeamKey];
            newState.battingInfo = { ...getBattingOrderInfo(nextLineup, nextIndex), battingTeamName: newState[nextTeamObjectKey].name };
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
