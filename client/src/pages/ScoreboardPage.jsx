// src/pages/ScoreboardPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import GameStateBar from '../components/scoreboard/GameStateBar';
import BattingInfo from '../components/scoreboard/BattingInfo';
import ActionButtons from '../components/scoreboard/ActionButtons';
import BaseballDiamond from '../components/scoreboard/BaseballDiamond';
import PlayResolutionPage from '../components/scoreboard/PlayResolutionPage';
import { INITIAL_GAME_STATE_TEMPLATE } from '../utils/constants'; // Ensure this path is correct
import {
  getBattingOrderInfo,
  extractRunners, // For PlayResolutionPage
  getPlayerById   // Used by extractRunners and for runnersDataForDiamond
} from '../utils/gameLogic.js'; // Ensure this path is correct
import ConfirmEndGameModal from '../components/scoreboard/ConfirmEndGameModal';

function ScoreboardPage({
  initialHomeTeamLineup,
  initialAwayTeamLineup,
  initialGameDetails,
  homeTeamNameFromSetup,
  awayTeamNameFromSetup,
  onGameOver
}) {

  const [gameState, setGameState] = useState(() => {
    const startingState = JSON.parse(JSON.stringify(INITIAL_GAME_STATE_TEMPLATE));
    startingState.homeTeamName = homeTeamNameFromSetup || "Home";
    startingState.awayTeamName = awayTeamNameFromSetup || "Away";
    startingState.homeTeamLineup = initialHomeTeamLineup || [];
    startingState.awayTeamLineup = initialAwayTeamLineup || [];
    startingState.gameDetails = initialGameDetails || {};
    startingState.battingTeamName = startingState.awayTeamName; // Away team bats first
    startingState.isTopInning = true;
    startingState.score = startingState.score || { home: 0, away: 0 };
    startingState.bases = startingState.bases || { first: null, second: null, third: null };
    startingState.currentPlay = startingState.currentPlay || { type: null, stage: null, details: {} };
    startingState.currentBatterIndex = startingState.currentBatterIndex || { home: 0, away: 0 };
    startingState.currentBatterStats = startingState.currentBatterStats || { balls: 0, strikes: 0 };
    console.log("ScoreboardPage: Initialized gameState:", startingState);
    return startingState;
  });
  
  // We initialize the history with the starting state of the game.
  const [gameStateHistory, setGameStateHistory] = useState([gameState]);

  const [isEndGameModalOpen, setIsEndGameModalOpen] = useState(false);
  const [userRequestedEndGame, setUserRequestedEndGame] = useState(false);

    useEffect(() => {
    // End the game if the user has confirmed it OR if the game's internal state says it's over.
    if (gameState.isGameOver || userRequestedEndGame) {
      if (onGameOver) {
        // Ensure the final state passed up has the isGameOver flag set correctly.
        onGameOver({ ...gameState, isGameOver: true });
      }
    }
  }, [gameState.isGameOver, userRequestedEndGame, onGameOver, gameState]);
  
  useEffect(() => {
    // This existing effect is perfect. It will trigger when the game is truly over.
    if (gameState.isGameOver && onGameOver) {
      onGameOver(gameState);
    }
  }, [gameState.isGameOver, onGameOver, gameState]);

  const handleEndGameConfirm = () => {
    setUserRequestedEndGame(true);
    setIsEndGameModalOpen(false); // Close the modal
  };

  // ADD THIS useEffect HOOK:
  useEffect(() => {
    // This effect runs after every gameState change.
    // We get the most recent state from the history.
    const lastStateInHistory = gameStateHistory[gameStateHistory.length - 1];

    // To avoid saving duplicates, only add to history if the state has actually changed.
    if (gameState !== lastStateInHistory) {
      console.log("Play completed. Saving new state to history.");
      setGameStateHistory(prevHistory => [...prevHistory, gameState]);
    }
  }, [gameState, gameStateHistory]); // This effect depends on gameState

  useEffect(() => {
    console.log("ScoreboardPage: gameState.currentPlay CHANGED to:", JSON.stringify(gameState.currentPlay));
  }, [gameState.currentPlay]);

  // Derived values from gameState
  const currentLineup = gameState.isTopInning ? gameState.awayTeamLineup : gameState.homeTeamLineup;
  const currentBatterTeamKey = gameState.isTopInning ? 'away' : 'home';
  const currentBatterIdx = gameState.currentBatterIndex[currentBatterTeamKey];
  const { currentBatter, upNext } = getBattingOrderInfo(currentLineup, currentBatterIdx);

  // For BaseballDiamond visual (player objects or null on bases)
  const runnersDataForDiamond = useMemo(() => {
    const getPlayerDetails = (playerId) => {
      if (!playerId) return null;
      // getPlayerById should search both lineups or be context-aware
      const player = getPlayerById(playerId, gameState.homeTeamLineup, gameState.awayTeamLineup);
      if (player) {
        // Refined firstName extraction
        let extractedFirstName = player.number || 'P'; // Default to number if name processing fails
        if (player.name && typeof player.name === 'string') {
          const nameParts = player.name.trim().split(' ');
          if (nameParts[0] && nameParts[0] !== "") {
            extractedFirstName = nameParts[0];
          }
        }
        return {
          id: player.id,
          name: player.name,
          number: player.number,
          firstName: extractedFirstName
        };
      }
      return null;
    };
    return {
      first: getPlayerDetails(gameState.bases.first),
      second: getPlayerDetails(gameState.bases.second),
      third: getPlayerDetails(gameState.bases.third),
    };
  }, [gameState.bases, gameState.homeTeamLineup, gameState.awayTeamLineup]);

  const isHitPlayAwaitingFieldLocation =
    !!gameState.currentPlay.type &&
    ['flyHitTo', 'lineDriveTo', 'grounderTo'].includes(gameState.currentPlay.type) &&
    gameState.currentPlay.stage === 'awaitingLocation';

  // --- Game Logic Functions ---

    const processEndOfHalfInningOrGame = useCallback((currentState) => {
    const safeCurrentState = {
      ...INITIAL_GAME_STATE_TEMPLATE,
      ...currentState,
      score: { ...INITIAL_GAME_STATE_TEMPLATE.score, ...(currentState.score || {}) },
      bases: { ...INITIAL_GAME_STATE_TEMPLATE.bases, ...(currentState.bases || {}) },
      currentPlay: { ...INITIAL_GAME_STATE_TEMPLATE.currentPlay, ...(currentState.currentPlay || {}) },
      currentBatterIndex: { ...INITIAL_GAME_STATE_TEMPLATE.currentBatterIndex, ...(currentState.currentBatterIndex || {}) },
      currentBatterStats: { ...INITIAL_GAME_STATE_TEMPLATE.currentBatterStats, ...(currentState.currentBatterStats || {}) },
    };

    if (safeCurrentState.outs >= 3) {
      // ... (logic for 3 outs, inning change, game over check) ...
      // (This is the detailed logic from my previous response)
      console.log("ScoreboardPage: 3 outs, processing end of half-inning.");
      const wasPreviouslyTopInning = safeCurrentState.isTopInning;
      const nextIsTopInning = !wasPreviouslyTopInning;
      let nextInningNumber = safeCurrentState.currentInning;

      if (!wasPreviouslyTopInning) {
        nextInningNumber = safeCurrentState.currentInning + 1;
      }

      const isEndOfDefinedInnings = nextInningNumber > 1;
      const isGameFinishingBlowoutOrRegulation = (safeCurrentState.currentInning >= 8 && !wasPreviouslyTopInning);

      if (isEndOfDefinedInnings || isGameFinishingBlowoutOrRegulation || userRequestedEndGame) {
        console.log("GAME OVER after inning:", safeCurrentState.currentInning);
        if (onGameOver) {
          onGameOver({
            ...safeCurrentState,
            isGameOver: true,
            currentPlay: { type: null, stage: null, details: {} }
          });
        }
        return {
          ...safeCurrentState,
          isGameOver: true,
          currentPlay: { type: null, stage: null, details: {} }
        };
      }

      console.log(`ScoreboardPage: Changing to ${nextIsTopInning ? 'Top' : 'Bottom'} of ${nextInningNumber}`);
      return {
        ...safeCurrentState,
        outs: 0,
        bases: { first: null, second: null, third: null },
        currentInning: nextInningNumber,
        isTopInning: nextIsTopInning,
        battingTeamName: nextIsTopInning ? safeCurrentState.awayTeamName : safeCurrentState.homeTeamName,
        currentPlay: { type: null, stage: null, details: {} },
        currentBatterStats: { balls: 0, strikes: 0 },
      };
    }
    return {
      ...safeCurrentState,
      currentPlay: { type: null, stage: null, details: {} },
      currentBatterStats: { balls: 0, strikes: 0 },
    };
  }, [onGameOver]); // Pass `onGameOver` from props

  const recordOut = useCallback(() => {
    console.log("ScoreboardPage: recordOut CALLED.");
    setGameState(prev => {
      let newOuts = prev.outs + 1;
      let newBatterIndexState = { ...prev.currentBatterIndex };
      const localBatterTeamKey = prev.isTopInning ? 'away' : 'home';
      const lineupForBatter = prev.isTopInning ? prev.awayTeamLineup : prev.homeTeamLineup;

      if (newOuts < 3 && lineupForBatter && lineupForBatter.length > 0) {
        newBatterIndexState[localBatterTeamKey] = (prev.currentBatterIndex[localBatterTeamKey] + 1) % lineupForBatter.length;
      }

      const intermediateState = {
          ...prev,
          outs: newOuts,
          currentBatterIndex: newBatterIndexState,
      };
      return processEndOfHalfInningOrGame(intermediateState);
    });
  }, [processEndOfHalfInningOrGame, setGameState]); // Added setGameState

  const handleStrikeOut = useCallback(() => {
    console.log("Strike Out recorded for", currentBatter?.name);
    recordOut();
  }, [currentBatter, recordOut]);

  const handleCaughtOut = useCallback(() => {
    console.log("Caught Out recorded for", currentBatter?.name);
    recordOut();
  }, [currentBatter, recordOut]);
  
  const handlePlayAction = useCallback((actionType) => {
    console.log("ScoreboardPage: handlePlayAction:", actionType, "Current play:", JSON.stringify(gameState.currentPlay));
    const hitTypes = ['flyHitTo', 'lineDriveTo', 'grounderTo'];

    // Prevent new major actions if a play is already in a field-selection or resolution phase
    if (gameState.currentPlay.stage === 'awaitingLocation' && !hitTypes.includes(actionType)) {
        alert("Please complete (click on field) or deselect the current hit play first.");
        return;
    }
    if (gameState.currentPlay.stage === 'confirmation' || gameState.currentPlay.stage === 'resolvingPlay') {
        // Allow deselecting a hit type if it's awaiting location by clicking it again
        if (hitTypes.includes(actionType) && gameState.currentPlay.type === actionType && gameState.currentPlay.stage === 'awaitingLocation') {
            // This part is handled by the setGameState logic below for hitTypes
        } else {
            alert("A play is already in progress or awaiting resolution. Please complete or cancel it.");
            return;
        }
    }

    if (hitTypes.includes(actionType)) {
      setGameState(prev => {
        if (prev.currentPlay.type === actionType && prev.currentPlay.stage === 'awaitingLocation') {
          console.log("ScoreboardPage: Deselecting hit type:", actionType);
          return { ...prev, currentPlay: { type: null, stage: null, details: {} } };
        } else {
          console.log("ScoreboardPage: Selecting hit type:", actionType);
          return { ...prev, currentPlay: { type: actionType, stage: 'awaitingLocation', details: {} } };
        }
      });
    } else if (actionType === 'strikeOut' || actionType === 'caughtOut') {
      console.log(`ScoreboardPage: Initiating confirmation for ${actionType}`);
      setGameState(prev => ({
        ...prev,
        // Set currentPlay to show a confirmation for strikeOut or caughtOut
        currentPlay: { type: actionType, stage: 'confirmation', details: {} }
      }));
    } else if (actionType === 'more') {
      alert("More actions not yet implemented.");
    }
  }, [gameState.currentPlay.type, gameState.currentPlay.stage, setGameState]);

  const handleUndoLastPlay = useCallback(() => {
    // Ensure there's more than just the initial state to undo
    if (gameStateHistory.length <= 1) {
      alert("Cannot undo the first state of the game.");
      return;
    }

    console.log("Undoing last play...");

    // Create a new history array with the most recent state removed.
    const newHistory = gameStateHistory.slice(0, -1);

    // Get the state we are reverting TO (which is now the last one in the new history).
    const previousState = newHistory[newHistory.length - 1];

    // Update the history and set the current game state back to the previous one.
    setGameStateHistory(newHistory);
    setGameState(previousState);
  }, [gameStateHistory]); // Depends on gameStateHistory

  const handleConfirmDirectOut = useCallback(() => {
    const playType = gameState.currentPlay.type; // Read from gameState directly
    console.log(`ScoreboardPage: Confirmed ${playType}`);
    if (playType === 'strikeOut') {
      handleStrikeOut(); // This calls recordOut, which should reset currentPlay
    } else if (playType === 'caughtOut') {
      handleCaughtOut(); // This also calls recordOut, resetting currentPlay
    }
  }, [gameState.currentPlay.type, handleStrikeOut, handleCaughtOut]); // Add dependencies

  const handleCancelDirectOutConfirmation = useCallback(() => {
    console.log("ScoreboardPage: Cancelling direct out confirmation.");
    setGameState(prev => ({
      ...prev,
      currentPlay: { type: null, stage: null, details: {} } // Reset to default state
    }));
  }, [setGameState]);

  const handleFieldLocationSelected = useCallback((locationCoords) => {
    if (gameState.currentPlay.type && gameState.currentPlay.stage === 'awaitingLocation') {
      setGameState(prev => ({
        ...prev,
        currentPlay: { ...prev.currentPlay, stage: 'confirmation', details: { ...prev.currentPlay.details, hitLocation: locationCoords }}
      }));
    }
  }, [gameState.currentPlay.type, gameState.currentPlay.stage, setGameState]);

  const handleConfirmBattingOutcome = useCallback(() => {
    // This transitions from 'confirmation' (after field click) to 'resolvingPlay'
    console.log("ScoreboardPage: Hit location confirmed. Transitioning to resolve play details. Play:", JSON.stringify(gameState.currentPlay));
    setGameState(prev => {
      if (prev.currentPlay.stage === 'confirmation' && prev.currentPlay.details.hitLocation) {
        return { ...prev, currentPlay: { ...prev.currentPlay, stage: 'resolvingPlay' }};
      }
      return prev;
    });
  }, [setGameState]); // Dependency on setGameState

  // NEW CALLBACK to go back from PlayResolutionPage
  const handleGoBackFromPlayResolution = useCallback(() => {
    console.log("ScoreboardPage: Going back from play resolution to confirmation stage.");
    setGameState(prev => {
      // We assume currentPlay.type and currentPlay.details.hitLocation are still valid
      // from when we entered 'resolvingPlay'.
      if (prev.currentPlay.stage === 'resolvingPlay') {
        return {
          ...prev,
          currentPlay: {
            ...prev.currentPlay,
            stage: 'confirmation' // Go back to showing the hit path and "Resolve Play Details" button
          }
        };
      }
      return prev; // Should ideally only be called from 'resolvingPlay' stage
    });
  }, [setGameState]); // Dependency on setGameState

    const handleGoBackFromConfirmation = useCallback(() => {
    console.log("ScoreboardPage: Going back from hit location confirmation to awaiting location.");
    setGameState(prev => {
      // Ensure we are actually in the confirmation stage before attempting to go back
      if (prev.currentPlay.stage === 'confirmation') {
        return {
          ...prev,
          currentPlay: {
            ...prev.currentPlay, // Keep the current play type (e.g., 'flyHitTo')
            stage: 'awaitingLocation', // Change stage back
            details: { ...prev.currentPlay.details, hitLocation: null } // Clear the hitLocation
          }
        };
      }
      return prev; // If not in confirmation stage, do nothing (shouldn't happen if button only shows then)
    });
  }, [setGameState]); // setGameState is stable

  const handlePlayResolutionFinalized = useCallback((resolvedPlayerOutcomes) => {
    console.log("ScoreboardPage: Play resolution finalized:", resolvedPlayerOutcomes);
    setGameState(prev => {
      let currentPlayOuts = 0;
      let currentPlayRunsHome = 0;
      let currentPlayRunsAway = 0;
      const newBases = { first: null, second: null, third: null };
      let newBatterIndexState = { ...prev.currentBatterIndex };
      const batterProcessingTeamKey = prev.isTopInning ? 'away' : 'home';
      const battingLineup = prev.isTopInning ? prev.awayTeamLineup : prev.homeTeamLineup;

      resolvedPlayerOutcomes.forEach(outcome => {
        if (outcome.status === 'out') {
          currentPlayOuts++;
        } else if (outcome.status === 'safe') {
          if (outcome.finalBase === 'H') {
            if (prev.isTopInning) currentPlayRunsAway++; else currentPlayRunsHome++;
          } else if (outcome.finalBase === 1) newBases.first = outcome.id;
          else if (outcome.finalBase === 2) newBases.second = outcome.id;
          else if (outcome.finalBase === 3) newBases.third = outcome.id;
        }
      });

      if (battingLineup && battingLineup.length > 0) {
        newBatterIndexState[batterProcessingTeamKey] = (prev.currentBatterIndex[batterProcessingTeamKey] + 1) % battingLineup.length;
      }

      const intermediateState = {
          ...prev,
          outs: prev.outs + currentPlayOuts,
          score: {
              home: prev.score.home + currentPlayRunsHome,
              away: prev.score.away + currentPlayRunsAway,
          },
          bases: newBases,
          currentBatterIndex: newBatterIndexState,
      };
      return processEndOfHalfInningOrGame(intermediateState);
    });
  }, [processEndOfHalfInningOrGame, setGameState]); // Added setGameState

  // Prop check
  if (!initialHomeTeamLineup || !initialAwayTeamLineup || !initialGameDetails || !homeTeamNameFromSetup || !awayTeamNameFromSetup) {
    console.error("ScoreboardPage: Missing essential initial props!");
    return (
      <div className="iphone-container scoreboard-page" style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
        <h1>Error!</h1>
        <p>Essential game data was not provided to start the scoreboard page.</p>
      </div>
    );
  }

  // Prepare runners with full details for PlayResolutionPage
  const runnersOnBaseForResolution = extractRunners(gameState.bases, gameState.homeTeamLineup, gameState.awayTeamLineup);
  console.log("ScoreboardPage: Passing runnersDataForDiamond to BaseballDiamond:", JSON.stringify(runnersDataForDiamond, null, 2));


  return (
    <div className="scoreboard-page-wrapper">
      <GameStateBar
        inning={gameState.currentInning}
        isTopInning={gameState.isTopInning}
        score={gameState.score}
        outs={gameState.outs}
        homeTeamName={gameState.homeTeamName}
        awayTeamName={gameState.awayTeamName}
      />
      <div className="scoreboard-main-content-area">
        {(() => { // Using an IIFE for cleaner conditional rendering
          const playStage = gameState.currentPlay.stage;
          const playType = gameState.currentPlay.type;

          // 1. Play Resolution Page (when resolving a hit after field location is confirmed and "Resolve Play Details" is clicked)
          if (playStage === 'resolvingPlay' && currentBatter) {
            return (
              <PlayResolutionPage
                currentBatter={currentBatter}
                runnersOnBaseStart={runnersOnBaseForResolution} // Ensure this is defined
                initialGameOuts={gameState.outs}
                homeTeamName={gameState.homeTeamName}
                awayTeamName={gameState.awayTeamName}
                isTopInning={gameState.isTopInning}
                onPlayFinalized={handlePlayResolutionFinalized}
                onGoBack={handleGoBackFromPlayResolution} // From previous step
                homeTeamLineup={gameState.homeTeamLineup}
                awayTeamLineup={gameState.awayTeamLineup}
              />
            );
          }

          // 2. Confirmation Stage (can be for a hit OR a direct out)
          if (playStage === 'confirmation') {
            if (playType === 'strikeOut' || playType === 'caughtOut') {
              // NEW: Confirmation UI for Strike Out or Caught Out
              const actionText = playType === 'strikeOut' ? "Strike Out" : "Caught Out";
              return (
                <>
                  <BattingInfo currentBatter={currentBatter} upNext={upNext} battingTeamName={gameState.battingTeamName} />
                  <BaseballDiamond
                    batterName={currentBatter ? currentBatter.name.split(' ')[0] : ''}
                    batterNumber={currentBatter ? currentBatter.number : ''}
                    runners={runnersDataForDiamond} // Ensure this is defined
                    hitLocationVisual={null} // No hit path for these direct outs
                    onFieldClick={null}      // Diamond is not interactive
                  />
                  <div className="confirmation-area direct-out-confirmation">
                    <p>Confirm {actionText} for {currentBatter?.name || 'batter'}?</p>
                    <div className="confirmation-buttons-row">
                      <button onClick={handleCancelDirectOutConfirmation} className="button-ccsa secondary-action-button">
                        Cancel
                      </button>
                      <button onClick={handleConfirmDirectOut} className="button-ccsa">
                        Confirm {actionText}
                      </button>
                    </div>
                  </div>
                </>
              );
            } else if (gameState.currentPlay.details.hitLocation) {
              // Existing Confirmation UI for hit location (after field click)
              return (
                <>
                  <BattingInfo currentBatter={currentBatter} upNext={upNext} battingTeamName={gameState.battingTeamName} />
                  <BaseballDiamond
                    batterName={currentBatter ? currentBatter.name.split(' ')[0] : ''}
                    batterNumber={currentBatter ? currentBatter.number : ''}
                    runners={runnersDataForDiamond} // Ensure this is defined
                    hitLocationVisual={gameState.currentPlay.details.hitLocation}
                    onFieldClick={null}
                  />
                  <div className="confirmation-area">
                    <p style={{ fontSize: '0.9em', marginBottom: '10px', textAlign: 'center' }}>
                      {playType} to approx.
                      X: {gameState.currentPlay.details.hitLocation.x?.toFixed(0)},
                      Y: {gameState.currentPlay.details.hitLocation.y?.toFixed(0)}
                      <br />by {currentBatter?.name}
                    </p>
                    <div className="confirmation-buttons-row">
                      <button onClick={handleGoBackFromConfirmation} className="button-ccsa secondary-action-button">
                        Re-select Location
                      </button>
                      <button onClick={handleConfirmBattingOutcome} className="button-ccsa">
                        Resolve Play Details
                      </button>
                    </div>
                  </div>
                </>
              );
            }
          }

          // 3. Default View (includes 'awaitingLocation' for hits or when no play is active)
          // This block renders if playStage is NOT 'resolvingPlay' AND NOT 'confirmation'.
          return (
            <>
              <BattingInfo currentBatter={currentBatter} upNext={upNext} battingTeamName={gameState.battingTeamName} />
              <ActionButtons
                onPlayAction={handlePlayAction}
                disableOutcomeButtons={isHitPlayAwaitingFieldLocation} // Ensure this is defined
                currentPlayType={playType}
                currentPlayStage={playStage}
                onUndo={handleUndoLastPlay}
                onEndGameClick={() => setIsEndGameModalOpen(true)}
              />
              <ConfirmEndGameModal
                isOpen={isEndGameModalOpen}
                onConfirm={handleEndGameConfirm}
                onCancel={() => setIsEndGameModalOpen(false)}
              />
              <BaseballDiamond
                batterName={currentBatter ? currentBatter.name.split(' ')[0] : ''}
                batterNumber={currentBatter ? currentBatter.number : ''}
                runners={runnersDataForDiamond} // Ensure this is defined
                hitLocationVisual={null}
                onFieldClick={playStage === 'awaitingLocation' ? handleFieldLocationSelected : null}
              />
            </>
          );
        })()}
      </div>
    </div>
  );
}
export default ScoreboardPage;