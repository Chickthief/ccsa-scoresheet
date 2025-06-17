// src/pages/ScoreboardPage.jsx
import React, { useReducer, useEffect, useState, useMemo, useRef } from 'react'; // Add useRef
import { initialGameState, gameReducer, getPlayerById } from '../utils/gameLogic';
import GameStateBar from '../components/scoreboard/GameStateBar';
import BattingInfo from '../components/scoreboard/BattingInfo';
import ActionButtons from '../components/scoreboard/ActionButtons';
import BaseballDiamond from '../components/scoreboard/BaseballDiamond';
import PlayResolutionPage from '../components/scoreboard/PlayResolutionPage';
import ConfirmEndGameModal from '../components/scoreboard/ConfirmEndGameModal';
import ConfirmPlayModal from '../components/scoreboard/ConfirmPlayModal';

function ScoreboardPage({ gameData, initialLineups, onGameOver }) {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    {
      homeTeamLineup: initialLineups[gameData.homeTeam.name],
      awayTeamLineup: initialLineups[gameData.awayTeam.name],
      homeTeamName: gameData.homeTeam.name,
      awayTeamName: gameData.awayTeam.name,
      gameDetails: gameData.gameDetails,
    },
    initialGameState
  );

  const [isEndGameModalOpen, setIsEndGameModalOpen] = useState(false);
  const [isSelectingFielder, setIsSelectingFielder] = useState(false);
  const [currentHitType, setCurrentHitType] = useState(null);
  const [playToConfirm, setPlayToConfirm] = useState(null);
  const fielderSelectOverlayRef = useRef(null);

  useEffect(() => {
    if (gameState.isGameOver && typeof onGameOver === 'function') {
      onGameOver(gameState);
    }
  }, [gameState.isGameOver, onGameOver, gameState]);

  // --- NEW: Effect to handle clicking outside the overlay ---
  useEffect(() => {
    if (!isSelectingFielder) {
      return; // Do nothing if the overlay is not open
    }

    function handleClickOutside(event) {
      if (fielderSelectOverlayRef.current && !fielderSelectOverlayRef.current.contains(event.target)) {
        setIsSelectingFielder(false); // Close the overlay
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup the event listener when the component unmounts or the overlay closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSelectingFielder]);


  const handlePlayAction = (playType) => {
    if (playType.includes('To')) {
        setIsSelectingFielder(true);
        setCurrentHitType(playType);
    } else {
        // For 'caughtOut' or 'strikeOut', set the state to open the modal
        setPlayToConfirm(playType);
    }
  };

  const handleConfirmPlay = () => {
    if (playToConfirm) {
      dispatch({ type: 'RESOLVE_PLAY', payload: { type: playToConfirm } });
      setPlayToConfirm(null); // Close the modal
    }
  };

  const handleCancelPlay = () => {
    setPlayToConfirm(null); // Just close the modal
  };

  const handleFielderSelected = (fielder) => {
    setIsSelectingFielder(false);
    dispatch({
      type: 'START_PLAY',
      payload: { playType: currentHitType, fielder: fielder },
    });
  };


  const handlePlayResolved = (playDetails) => {
    dispatch({ type: 'RESOLVE_PLAY', payload: playDetails });
  };

  const handleUndo = () => dispatch({ type: 'UNDO' });
  const handleSkipBatter = () => dispatch({ type: 'SKIP_BATTER' });
  const handleEndGameConfirm = () => {
    dispatch({ type: 'END_GAME' });
    setIsEndGameModalOpen(false);
  };

  const { batter, onDeck, inTheHole, battingTeamName } = gameState.battingInfo;

  const runnersOnBaseStart = useMemo(() => {
    return [
      { base: 1, playerId: gameState.bases.first },
      { base: 2, playerId: gameState.bases.second },
      { base: 3, playerId: gameState.bases.third },
    ]
    .filter(runner => !!runner.playerId)
    .map(runner => {
        const player = getPlayerById(runner.playerId, gameState.homeTeamLineup, gameState.awayTeamLineup);
        return { ...player, startingBase: runner.base };
    });
  }, [gameState.bases, gameState.homeTeamLineup, gameState.awayTeamLineup]);


  const runnersDataForDiamond = useMemo(() => {
      const getPlayerDetails = (playerId) => {
        if (!playerId) return null;
        const player = getPlayerById(playerId, gameState.homeTeamLineup, gameState.awayTeamLineup);
        return player ? { ...player, firstName: player.name.split(' ')[0] || player.number } : null;
      };
      return {
        first: getPlayerDetails(gameState.bases.first),
        second: getPlayerDetails(gameState.bases.second),
        third: getPlayerDetails(gameState.bases.third),
      };
  }, [gameState.bases, gameState.homeTeamLineup, gameState.awayTeamLineup]);

  if (gameState.currentPlay.stage === 'awaitingLocation') {
    return (
      <PlayResolutionPage
        currentBatter={batter}
        runnersOnBaseStart={runnersOnBaseStart}
        onPlayFinalized={handlePlayResolved}
        onGoBack={() => dispatch({ type: 'CANCEL_PLAY' })}
        currentPlay={gameState.currentPlay}
      />
    );
  }

  return (
    <div className="scoreboard-page-wrapper">
      <GameStateBar {...gameState} />
      <div className="scoreboard-main-content-area">
        <BattingInfo currentBatter={batter} upNext={[onDeck, inTheHole]} battingTeamName={battingTeamName} />
        <BaseballDiamond
            batterName={batter ? batter.name.split(' ')[0] : ''}
            batterNumber={batter ? batter.number : ''}
            runners={runnersDataForDiamond}
            onFieldClick={() => {}}
            isSelectingFielder={isSelectingFielder}
            onFielderSelected={handleFielderSelected}
            // --- NEW: Pass the ref to the diamond ---
            overlayRef={fielderSelectOverlayRef}
        />
      </div>
      <ActionButtons
        onPlayAction={handlePlayAction}
        onUndo={handleUndo}
        onEndGameClick={() => setIsEndGameModalOpen(true)}
        onSkipBatter={handleSkipBatter}
        disableOutcomeButtons={isSelectingFielder || gameState.currentPlay.stage === 'awaitingLocation'}
        currentPlayType={gameState.currentPlay.type}
        currentPlayStage={gameState.currentPlay.stage}
        selectedHitType={isSelectingFielder ? currentHitType : null}
      />
      <ConfirmEndGameModal
        isOpen={isEndGameModalOpen}
        onConfirm={handleEndGameConfirm}
        onCancel={() => setIsEndGameModalOpen(false)}
      />
      <ConfirmPlayModal
        isOpen={!!playToConfirm}
        onConfirm={handleConfirmPlay}
        onCancel={handleCancelPlay}
        playType={playToConfirm}
      />

    </div>
  );
}

export default ScoreboardPage;