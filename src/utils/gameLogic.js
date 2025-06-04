// src/utils/gameLogic.js

export const getInningSuffix = (inning) => {
  if (typeof inning !== 'number' || isNaN(inning)) return 'th'; // Handle non-numeric or NaN
  const absInning = Math.abs(inning); // Work with positive numbers for modulo
  if (absInning % 10 === 1 && absInning % 100 !== 11) return 'st';
  if (absInning % 10 === 2 && absInning % 100 !== 12) return 'nd';
  if (absInning % 10 === 3 && absInning % 100 !== 13) return 'rd';
  return 'th';
};

/**
 * Finds a player by ID from one or two lineups.
 * Assumes player IDs are unique across the provided lineups if searching both.
 */
export const getPlayerById = (playerId, lineup1 = [], lineup2 = []) => {
  if (!playerId) return null;
  let player = lineup1.find(p => p && p.id === playerId);
  if (!player && lineup2 && lineup2.length > 0) {
    player = lineup2.find(p => p && p.id === playerId);
  }
  return player || null; // Return the player object or null if not found
};

/**
 * Extracts active runners from the bases object and enriches them with player details.
 * Needs access to both team lineups to find player details by ID.
 */
export const extractRunners = (bases, homeLineup = [], awayLineup = []) => {
  const runners = [];
  if (!bases) return runners;

  const processBase = (baseId, startingBaseNum) => {
    if (baseId) {
      const playerDetails = getPlayerById(baseId, homeLineup, awayLineup);
      if (playerDetails) {
        runners.push({ ...playerDetails, id: playerDetails.id, startingBase: startingBaseNum });
      } else {
        // Optional: log if a player ID on base couldn't be found in lineups
        console.warn(`Player ID ${baseId} on base ${startingBaseNum} not found in provided lineups.`);
        // Add a placeholder if needed, or just skip
        // runners.push({ id: baseId, name: "Unknown Runner", number: "??", startingBase: startingBaseNum });
      }
    }
  };

  processBase(bases.first, 1);
  processBase(bases.second, 2);
  processBase(bases.third, 3);

  // Sort R3, R2, R1 for display order in PlayResolutionPage or similar contexts
  return runners.sort((a, b) => b.startingBase - a.startingBase);
};

/**
 * Gets the current batter and the next few batters from a lineup.
 */
export const getBattingOrderInfo = (lineup = [], currentIndex = 0) => {
  if (!lineup || lineup.length === 0) {
    return { currentBatter: null, upNext: [] };
  }

  const lineupSize = lineup.length;
  const normalizedIndex = lineupSize > 0 ? currentIndex % lineupSize : 0;
  const currentBatter = lineup[normalizedIndex] || null;

  const upNext = [];
  if (lineupSize > 0) {
    const addedToUpNext = new Set();
    if (currentBatter) {
        addedToUpNext.add(currentBatter.id); // Don't list current batter as up next
    }

    for (let i = 1; i <= lineupSize; i++) { // Iterate enough to fill upNext or exhaust lineup
      if (upNext.length >= 3) break; // We only need up to 3 players for "up next"

      const nextPlayerIndex = (normalizedIndex + i) % lineupSize;
      const nextPlayer = lineup[nextPlayerIndex];

      if (nextPlayer && !addedToUpNext.has(nextPlayer.id)) {
        upNext.push(nextPlayer);
        addedToUpNext.add(nextPlayer.id);
      }
    }
  }
  return { currentBatter, upNext };
};