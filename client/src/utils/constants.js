export const CORRECT_PASSWORD = "1234";
export const API_BASE_URL = "http://localhost:3001/api/";

export const PREDEFINED_TEAM_LINEUPS = {
  "Sycamore": [
    { id: 'sor1', number: '15', name: 'Abby Foo' },
    { id: 'sor2', number: '12', name: 'Andreas Li' },
    { id: 'sor3', number: '46', name: 'Anita Hung' },
    { id: 'sor4', number: '21', name: 'Ashley Lau' },
    { id: 'sor5', number: '3', name: 'Ashley Wang' },
    { id: 'sor6', number: '', name: 'Cecilia Ki' }, // No jersey
    { id: 'sor7', number: '44', name: 'Clement Chan' },
    { id: 'sor8', number: '8', name: 'Daniel Chen' },
    { id: 'sor9', number: '99', name: 'Erik Lee' },
    { id: 'sor10', number: '4', name: 'Erika Schoenebeck' },
    { id: 'sor11', number: '6', name: 'Ethan Chan' },
    { id: 'sor12', number: '18', name: 'Evan White' },
    { id: 'sor13', number: '68', name: 'Gabriel Huynh' },
    { id: 'sor14', number: '17', name: 'Gabrielle Tadeja' },
    { id: 'sor15', number: '77', name: 'Grace Hung' },
    { id: 'sor16', number: '29', name: 'Hazel Yim' },
    { id: 'sor17', number: '42', name: 'Jacob Loong' },
    { id: 'sor18', number: '23', name: 'Jeffrey Lou' },
    { id: 'sor19', number: '7', name: 'Jennifer Li' },
    { id: 'sor20', number: '11', name: 'Jessica Leung' },
    { id: 'sor21', number: '81', name: 'Joseph Cabungcal' },
    { id: 'sor22', number: '66', name: 'Joshua Ma' },
    { id: 'sor23', number: '9', name: 'Joshua Wong' },
    { id: 'sor24', number: '10', name: 'Karina Lee' },
    { id: 'sor25', number: '', name: 'Laura Prakesch' }, // Borrow a jersey
    { id: 'sor26', number: '33', name: 'Lucas Wong' },
    { id: 'sor27', number: '86', name: 'Matthias Ko' },
    { id: 'sor28', number: '20', name: 'Meghan Lee' },
    { id: 'sor29', number: '88', name: 'Melanie Pang' },
    { id: 'sor30', number: '49', name: 'Nathan Tong' },
    { id: 'sor31', number: '13', name: 'Patricia Li' },
    { id: 'sor32', number: '2', name: 'Roxanne Cheung' },
    { id: 'sor33', number: '24', name: 'Ryan Lee' },
    { id: 'sor34', number: '22', name: 'Samuel Chan' },
    { id: 'sor35', number: '0', name: 'Sarah Cloughley' },
    { id: 'sor36', number: '64', name: 'Titus Tsui' },
    { id: 'sor37', number: '95', name: 'Tommy Lam' },
    { id: 'sor38', number: '19', name: 'Varden Seah' },
    { id: 'sor39', number: '01', name: 'Winnie Huang' },
  ],
  "Cup": [
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
  team2Name: "Cup"
};

export const DEFAULT_GAME_DETAILS = {
  gameCode: "TB0908",
  date: "Thursday June 12", // For display purposes
  time: "6:30",
  location: "Risebrough Park"
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