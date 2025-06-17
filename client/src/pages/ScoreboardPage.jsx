import React, { useReducer, useEffect, useState, useMemo, useRef } from 'react';
import Linescore from '../components/scoreboard/Linescore';
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
  const [isLinescoreOpen, setIsLinescoreOpen] = useState(false);

  useEffect(() => {
    if (gameState.isGameOver && typeof onGameOver === 'function') {
      onGameOver(gameState);
    }
  }, [gameState.isGameOver, onGameOver]);

  useEffect(() => {
    if (!isSelectingFielder) return;
    function handleClickOutside(event) {
      if (fielderSelectOverlayRef.current && !fielderSelectOverlayRef.current.contains(event.target)) {
        setIsSelectingFielder(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSelectingFielder]);

  const handlePlayAction = (playType) => {
    if (playType.includes('To')) {
      setIsSelectingFielder(true);
      setCurrentHitType(playType);
    } else {
      setPlayToConfirm(playType);
    }
  };

  const handleConfirmPlay = () => {
    if (playToConfirm) {
      if (playToConfirm === 'endInning') {
        dispatch({ type: 'END_INNING' });
      } else {
        dispatch({ type: 'RESOLVE_PLAY', payload: { type: playToConfirm } });
      }
      setPlayToConfirm(null);
    }
  };

  const handleCancelPlay = () => setPlayToConfirm(null);
  const handleFielderSelected = (fielder) => {
    setIsSelectingFielder(false);
    dispatch({ type: 'START_PLAY', payload: { playType: currentHitType, fielder } });
  };
  const handlePlayResolved = (playDetails) => dispatch({ type: 'RESOLVE_PLAY', payload: playDetails });
  const handleUndo = () => dispatch({ type: 'UNDO' });
  const handleSkipBatter = () => dispatch({ type: 'SKIP_BATTER' });
  const handleEndGameConfirm = () => dispatch({ type: 'END_GAME' });
  const handleEndInning = () => setPlayToConfirm('endInning');
  const handleToggleLinescore = () => setIsLinescoreOpen(prev => !prev);
  
  // --- FIX: Define the missing stopPropagation function here ---
  const stopPropagation = (e) => e.stopPropagation();

  const { batter, onDeck, inTheHole, battingTeamName } = gameState.battingInfo || {};
  const runnersOnBaseStart = useMemo(() => {
    if (!gameState.bases) return [];
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
    if (!gameState.bases) return { first: null, second: null, third: null };
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

  if (gameState.currentPlay && gameState.currentPlay.stage === 'awaitingLocation') {
    return (
      <div className="scoreboard-page-wrapper">
        <GameStateBar {...gameState} />
        <PlayResolutionPage
          currentBatter={batter}
          runnersOnBaseStart={runnersOnBaseStart}
          onPlayFinalized={handlePlayResolved}
          onGoBack={() => dispatch({ type: 'CANCEL_PLAY' })}
          currentPlay={gameState.currentPlay}
        />
      </div>
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
            isSelectingFielder={isSelectingFielder}
            onFielderSelected={handleFielderSelected}
            overlayRef={fielderSelectOverlayRef}
        />
      </div>
      <ActionButtons
        onPlayAction={handlePlayAction}
        onUndo={handleUndo}
        onEndGameClick={() => setIsEndGameModalOpen(true)}
        onSkipBatter={handleSkipBatter}
        onEndInning={handleEndInning}
        onViewLinescore={handleToggleLinescore}
        disableOutcomeButtons={isSelectingFielder || (gameState.currentPlay && gameState.currentPlay.stage === 'awaitingLocation')}
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
      {isLinescoreOpen && gameState.inningScores && (
        <div className="modal-overlay" onClick={handleToggleLinescore}>
          <div className="modal-content large-modal" onClick={stopPropagation}>
            <h2>Linescore</h2>
            <Linescore
              scores={gameState.inningScores}
              awayTeamName={gameState.awayTeamName}
              homeTeamName={gameState.homeTeamName}
              totalScore={gameState.score}
            />
            <div className="modal-actions">
              <button className="button-ccsa" onClick={handleToggleLinescore}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoreboardPage;