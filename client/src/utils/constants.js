export const CORRECT_PASSWORD = "1234";

export const PREDEFINED_TEAM_LINEUPS = {
  "Sack of Rice": [
    { id: 'sor1', number: '42', name: 'Marcus Chan' },
    { id: 'sor2', number: '33', name: 'Lucas Wong' },
    { id: 'sor3', number: '10', name: 'Winnie Huang' },
    { id: 'sor4', number: '07', name: 'Steven Lui' }, // Made number consistent (07 vs 7)
    { id: 'sor5', number: '59', name: 'Joel Cheung' },
    { id: 'sor6', number: '18', name: 'Valerie Tang' }, // Added one more
    { id: 'sor7', number: '06', name: 'Ethan Chen' }   // Added one more
  ],
  "Sycamore": [
    { id: 'unc1', number: '77', name: 'Justin Chiu' },
    { id: 'unc2', number: '24', name: 'Elise Chiu' },
    { id: 'unc3', number: '23', name: 'Jeffrey Lou' },
    { id: 'unc4', number: '08', name: 'Matthew Oinonen' },
    { id: 'unc5', number: '15', name: 'Ryan Lee' },
    { id: 'unc6', number: '19', name: 'Dorcas Ng' },    // Added one more
    { id: 'unc7', number: '88', name: 'Darren Ko' }     // Added one more
  ],
  // You can add more teams here as needed:
  // "Another Team": [
  //   { id: 'at1', number: '01', name: 'Player Alpha' },
  //   { id: 'at2', number: '02', name: 'Player Beta' },
  // ]
};

export const AVAILABLE_TEAM_NAMES = Object.keys(PREDEFINED_TEAM_LINEUPS);

// --- NEW CONSTANTS FOR DEFAULT GAME ---
export const DEFAULT_GAME_TEAMS_INFO = {
  team1Name: "Sycamore", // Make sure these names match keys in PREDEFINED_TEAM_LINEUPS
  team2Name: "Sack of Rice"
};

export const DEFAULT_GAME_DETAILS = {
  gameCode: "TB0908",
  date: "Sun Aug 7", // For display purposes
  time: "4pm",
  location: "Wigmore Park"
};

export const INITIAL_GAME_STATE_TEMPLATE = {
  // These will be overridden by props in ScoreboardPage
  homeTeamName: "Home Team",
  awayTeamName: "Away Team",
  homeTeamLineup: [],
  awayTeamLineup: [],
  gameDetails: {},

  // Core game situation
  currentInning: 1,
  isTopInning: true, // true for top of inning (away team bats), false for bottom (home team bats)
  outs: 0,
  score: {
    home: 0,
    away: 0,
  },
  bases: {
    first: null,
    second: null,
    third: null,
  },
  battingTeamName: "Away Team", // Will be updated based on awayTeamName prop
  currentBatterStats: {
    balls: 0,
    strikes: 0,
  },
  currentBatterIndex: { // Index for current batter in each team's lineup
    home: 0,
    away: 0,
  },
  currentPlay: { // To manage multi-step plays like fly ball location
    type: null,       // e.g., 'flyHitTo', 'grounderTo'
    stage: null,      // e.g., 'awaitingLocation', 'confirmation'
    details: {},      // e.g., { hitLocation: 'centerField' }
  },
  isGameOver: false,
  // playLog: [], // Optional: for logging plays
};