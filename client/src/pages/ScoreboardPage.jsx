// src/pages/ScoreboardPage.jsx
import React, { useReducer, useEffect, useState, useMemo } from 'react';
import { initialGameState, gameReducer, getPlayerById } from '../utils/gameLogic';
import GameStateBar from '../components/scoreboard/GameStateBar';
import BattingInfo from '../components/scoreboard/BattingInfo';
import ActionButtons from '../components/scoreboard/ActionButtons';
import BaseballDiamond from '../components/scoreboard/BaseballDiamond';
import PlayResolutionPage from '../components/scoreboard/PlayResolutionPage';
import ConfirmEndGameModal from '../components/scoreboard/ConfirmEndGameModal';

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

  useEffect(() => {
    if (gameState.isGameOver && typeof onGameOver === 'function') {
      onGameOver(gameState);
    }
  }, [gameState.isGameOver, onGameOver, gameState]);

  const handlePlayAction = (playType) => {
    if (playType.includes('To')) {
        dispatch({ type: 'START_PLAY', payload: { playType } });
    } else {
        dispatch({ type: 'RESOLVE_PLAY', payload: { type: playType } });
    }
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

  // FIX: This memoized calculation now gathers all the runners on base
  // to be passed to the PlayResolutionPage.
  const runnersOnBaseStart = useMemo(() => {
    return [
      { base: 1, playerId: gameState.bases.first },
      { base: 2, playerId: gameState.bases.second },
      { base: 3, playerId: gameState.bases.third },
    ]
    .filter(runner => !!runner.playerId) // Filter out empty bases
    .map(runner => {
        // Get the full player object using the helper function
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
  
  // When a play is started, render the PlayResolutionPage with all necessary data.
  if (gameState.currentPlay.stage === 'awaitingLocation') {
    return (
      <PlayResolutionPage
        // FIX: Pass all the required props
        currentBatter={batter}
        runnersOnBaseStart={runnersOnBaseStart}
        onPlayFinalized={handlePlayResolved}
        onGoBack={() => dispatch({ type: 'CANCEL_PLAY' })}
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
        />
      </div>
      <ActionButtons
        onPlayAction={handlePlayAction}
        onUndo={handleUndo}
        onEndGameClick={() => setIsEndGameModalOpen(true)}
        onSkipBatter={handleSkipBatter}
        disableOutcomeButtons={gameState.currentPlay.stage === 'awaitingLocation'}
        currentPlayType={gameState.currentPlay.type}
        currentPlayStage={gameState.currentPlay.stage}
      />
      <ConfirmEndGameModal
        isOpen={isEndGameModalOpen}
        onConfirm={handleEndGameConfirm}
        onCancel={() => setIsEndGameModalOpen(false)}
      />
    </div>
  );
}

export default ScoreboardPage;
