// server/server.js

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Using the promise-based version for async/await

const app = express();
const PORT = 3001; // Port for our backend server

// === Middleware ===
app.use(cors()); // Enable Cross-Origin Resource Sharing for your React app to connect
app.use(express.json()); // Allow the server to accept and parse JSON in request bodies

// === Database Connection Pool ===
// A connection pool is more efficient than creating a new connection for every query.
const pool = mysql.createPool({
    host: 'localhost',      // Or '127.0.0.1' for your local machine
    user: 'root',           // Your MySQL username (default for XAMPP/MAMP is often 'root')
    password: '',           // Your MySQL password (default for XAMPP/MAMP is often empty)
    database: 'ccsa_scoresheet',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// === API Endpoints ===

// A simple test route to make sure the server is alive
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the CCSA Scoresheet backend API!" });
});

// Endpoint to serve a list of teams
app.get('/api/teams', async (req, res) => {
  try {
      const [teams] = await pool.query('SELECT id, name FROM teams');
      res.json(teams);
  } catch (error) {
      console.error("Failed to fetch teams:", error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


// === UPDATED ENDPOINT TO FETCH GAME DATA ===
// API Endpoint to get details for ONE specific game, including team rosters and park name
app.get('/api/games/:gameCode', async (req, res) => {
    const { gameCode } = req.params;
    console.log(`Fetching all data for game code: ${gameCode}`);

    try {
        // Step 1: Get the game details, including park and team names, using JOINs
        const gameQuery = `
            SELECT
                g.id,
                g.game_code,
                g.game_date,
                g.game_time,
                p.name AS park_name,
                g.home_team_id,
                g.away_team_id,
                ht.name AS home_team_name,
                at.name AS away_team_name
            FROM games g
            JOIN parks p ON g.park_id = p.id
            JOIN teams ht ON g.home_team_id = ht.id
            JOIN teams at ON g.away_team_id = at.id
            WHERE g.game_code = ?;
        `;
        const [gameRows] = await pool.query(gameQuery, [gameCode]);

        if (gameRows.length === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }
        const game = gameRows[0];

        // Step 2: Get all players and their jersey numbers for this specific game
        const playersQuery = `
            SELECT
                u.id AS player_id,
                u.full_name,
                pgs.team_id,
                pgs.jersey_number
            FROM player_game_stats pgs
            JOIN users u ON pgs.player_user_id = u.id
            WHERE pgs.game_id = ?;
        `;
        const [players] = await pool.query(playersQuery, [game.id]);

        // Step 3: Filter players into home and away lineups
        const homePlayers = players
            .filter(p => p.team_id === game.home_team_id)
            .map(p => ({ id: p.player_id, name: p.full_name, number: p.jersey_number }));

        const awayPlayers = players
            .filter(p => p.team_id === game.away_team_id)
            .map(p => ({ id: p.player_id, name: p.full_name, number: p.jersey_number }));

        // Step 4: Assemble the final response object in the format the frontend expects
        const responseData = {
            gameDetails: {
                gameCode: game.game_code,
                location: game.park_name,
                date: new Date(game.game_date).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }),
                time: new Date(`1970-01-01T${game.game_time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }),
            },
            homeTeam: {
                name: game.home_team_name,
                lineup: homePlayers
            },
            awayTeam: {
                name: game.away_team_name,
                lineup: awayPlayers
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error("Failed to fetch game details:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// TODO: Add POST endpoints for stats and game submissions
// app.post('/api/games/:gameId/stats', ...);
// app.post('/api/submissions', ...);


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
