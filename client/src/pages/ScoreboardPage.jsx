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
import ViewLine from '../components/scoreboard/ViewLine';
import TeamLineupManager from '../components/gameSetup/TeamLineupManager';

function ScoreboardPage({ gameData, initialLineups, onGameOver }) {
  const [gameState, dispatch] = useReducer(
    gameReducer,
    {
      gameDetails: gameData.gameDetails,
      homeTeam: { ...gameData.homeTeam, lineup: initialLineups[gameData.homeTeam.name] || [] },
      awayTeam: { ...gameData.awayTeam, lineup: initialLineups[gameData.awayTeam.name] || [] },
    },
    initialGameState
  );

  const [isEndGameModalOpen, setIsEndGameModalOpen] = useState(false);
  const [isSelectingFielder, setIsSelectingFielder] = useState(false);
  const [currentHitType, setCurrentHitType] = useState(null);
  const [playToConfirm, setPlayToConfirm] = useState(null);
  const fielderSelectOverlayRef = useRef(null);
  const [isLinescoreOpen, setIsLinescoreOpen] = useState(false);
  const [isLineupModalOpen, setIsLineupModalOpen] = useState(false);
  const [activeLineupTab, setActiveLineupTab] = useState(gameData.awayTeam.name);
  const [tempLineups, setTempLineups] = useState(null);
  const [noMercyThisInning, setNoMercyThisInning] = useState(false);

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

  useEffect(() => {
    setNoMercyThisInning(false);
  }, [gameState.inning, gameState.isTopInning]);

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
  const handlePlayResolved = (playDetails) => {
    if (playDetails.type === 'MERCY_RULE_END_INNING') {
      dispatch({ type: playDetails.type, payload: playDetails.payload });
    } else {
      dispatch({ type: 'RESOLVE_PLAY', payload: playDetails });
    }
  };
  const handleUndo = () => dispatch({ type: 'UNDO' });
  const handleSkipBatter = () => dispatch({ type: 'SKIP_BATTER' });
  const handleEndGameConfirm = () => dispatch({ type: 'END_GAME' });
  const handleEndInning = () => setPlayToConfirm('endInning');
  const handleToggleLinescore = () => setIsLinescoreOpen(prev => !prev);
  
  const handleOpenLineupModal = () => {
    setTempLineups({
      [gameState.homeTeam.name]: gameState.homeTeam.lineup,
      [gameState.awayTeam.name]: gameState.awayTeam.lineup,
    });
    setActiveLineupTab(gameState.battingInfo.battingTeamName);
    setIsLineupModalOpen(true);
  };

  const handleTempLineupChange = (teamName, newLineup) => {
    setTempLineups(prev => ({ ...prev, [teamName]: newLineup }));
  };

  const handleCloseLineupModal = () => {
    if (!tempLineups) {
        setIsLineupModalOpen(false);
        return;
    }
    const hasChanges =
      JSON.stringify(tempLineups[gameState.homeTeam.name]) !== JSON.stringify(gameState.homeTeam.lineup) ||
      JSON.stringify(tempLineups[gameState.awayTeam.name]) !== JSON.stringify(gameState.awayTeam.lineup);

    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setIsLineupModalOpen(false);
        setTempLineups(null);
      }
    } else {
      setIsLineupModalOpen(false);
      setTempLineups(null);
    }
  };
  
  const handleSaveLineupChanges = () => {
    dispatch({ type: 'UPDATE_LINEUP', payload: { teamName: gameState.homeTeam.name, newLineup: tempLineups[gameState.homeTeam.name] } });
    dispatch({ type: 'UPDATE_LINEUP', payload: { teamName: gameState.awayTeam.name, newLineup: tempLineups[gameState.awayTeam.name] } });
    setIsLineupModalOpen(false);
    setTempLineups(null);
  };

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
        const player = getPlayerById(runner.playerId, gameState.homeTeam.lineup, gameState.awayTeam.lineup);
        if (!player) {
            console.error(`Could not find player with ID ${runner.playerId} in any lineup.`);
            return null;
        }
        return { ...player, startingBase: runner.base };
    }).filter(Boolean);
  }, [gameState.bases, gameState.homeTeam.lineup, gameState.awayTeam.lineup]);

  const runnersDataForDiamond = useMemo(() => {
    if (!gameState.bases) return { first: null, second: null, third: null };
    const getPlayerDetails = (playerId) => {
      if (!playerId) return null;
      const player = getPlayerById(playerId, gameState.homeTeam.lineup, gameState.awayTeam.lineup);
      return player ? { ...player, firstName: player.name.split(' ')[0] || player.number } : null;
    };
    return {
      first: getPlayerDetails(gameState.bases.first),
      second: getPlayerDetails(gameState.bases.second),
      third: getPlayerDetails(gameState.bases.third),
    };
  }, [gameState.bases, gameState.homeTeam.lineup, gameState.awayTeam.lineup]);

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
          inning={gameState.inning}
          isTopInning={gameState.isTopInning}
          inningScores={gameState.inningScores}
          noMercyThisInning={noMercyThisInning}
          onSetNoMercy={setNoMercyThisInning}
        />
      </div>
    );
  }

  return (
    <div className="scoreboard-page-wrapper">
      <GameStateBar {...gameState} />
      <div className="scoreboard-main-content-area">
        <BattingInfo currentBatter={batter} upNext={[onDeck, inTheHole]} battingTeamName={battingTeamName} />
        <ViewLine
            onViewLinescore={handleToggleLinescore}
            onViewLineup={handleOpenLineupModal}
        />
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
              awayTeamName={gameState.awayTeam.name}
              homeTeamName={gameState.homeTeam.name}
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
      {isLineupModalOpen && tempLineups && (
        <div className="modal-overlay" onClick={handleCloseLineupModal}>
          <div className="modal-content large-modal" onClick={stopPropagation}>
            <div className="tabs-container">
              <button
                onClick={() => setActiveLineupTab(gameState.awayTeam.name)}
                className={`tab-button ${activeLineupTab === gameState.awayTeam.name ? "active" : ""}`}
              >
                {`${gameState.awayTeam.name} Lineup`}
              </button>
              <button
                onClick={() => setActiveLineupTab(gameState.homeTeam.name)}
                className={`tab-button ${activeLineupTab === gameState.homeTeam.name ? "active" : ""}`}
              >
                {`${gameState.homeTeam.name} Lineup`}
              </button>
            </div>
            
            <TeamLineupManager
              key={activeLineupTab}
              teamName={activeLineupTab}
              initialLineupData={tempLineups[activeLineupTab]}
              onLineupChange={(newLineup) => handleTempLineupChange(activeLineupTab, newLineup)}
              currentBatterId={battingTeamName === activeLineupTab && batter ? batter.id : null}
            />
            
            <div className="modal-actions">
              <button className="button-ccsa" onClick={handleSaveLineupChanges}>Save Changes</button>
              <button className="button-ccsa" onClick={handleCloseLineupModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoreboardPage;
