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


// API Endpoint to get details for ONE specific game, including team rosters
app.get('/api/games/:gameCode', async (req, res) => {
    const { gameCode } = req.params;
    console.log(`Fetching data for game code: ${gameCode}`);

    try {
        // Step 1: Get the basic game details and the IDs for the registered teams
        const [gameRows] = await pool.query('SELECT * FROM games WHERE game_code = ?', [gameCode]);
        if (gameRows.length === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }
        const game = gameRows[0];

        // This is a more complex query to get all the data in fewer steps.
        // It joins multiple tables to build the response.
        const query = `
            SELECT
                r.id as roster_entry_id,
                r.jersey_number,
                u.id as user_id,
                u.full_name as player_name,
                tsr.team_id
            FROM roster_entries r
            JOIN users u ON r.player_user_id = u.id
            JOIN team_season_registrations tsr ON r.team_season_registration_id = tsr.id
            WHERE tsr.id IN (?, ?);
        `;

        const [players] = await pool.query(query, [game.home_team_registration_id, game.away_team_registration_id]);

        // Step 2: Get the team names
        const [teams] = await pool.query('SELECT id, name FROM teams WHERE id IN (SELECT team_id FROM team_season_registrations WHERE id IN (?, ?))', [game.home_team_registration_id, game.away_team_registration_id]);
        
        const getTeamName = (registrationId) => {
            const registration = game.home_team_registration_id === registrationId ? 
                { team_id: game.home_team_id } : { team_id: game.away_team_id };
            const team = teams.find(t => t.id === registration.team_id);
            return team ? team.name : "Unknown Team";
        };

        const homeTeamName = getTeamName(game.home_team_registration_id);
        const awayTeamName = getTeamName(game.away_team_registration_id);


        // Step 3: Filter players into home and away lineups
        const homePlayers = players
            .filter(p => {
                const reg = game.home_team_registration_id === p.team_id ? {team_id: game.home_team_id} : {team_id: game.away_team_id};
                return reg.team_id === game.home_team_id;
            })
            .map(p => ({ id: p.user_id, name: p.player_name, number: p.jersey_number }));

        const awayPlayers = players
            .filter(p => {
                 const reg = game.home_team_registration_id === p.team_id ? {team_id: game.home_team_id} : {team_id: game.away_team_id};
                return reg.team_id === game.away_team_id;
            })
            .map(p => ({ id: p.user_id, name: p.player_name, number: p.jersey_number }));

        
        // Step 4: Assemble the final response object
        const responseData = {
            gameDetails: {
                gameCode: game.game_code,
                location: game.location,
                time: game.game_time,
            },
            homeTeam: {
                name: homeTeamName,
                lineup: homePlayers
            },
            awayTeam: {
                name: awayTeamName,
                lineup: awayPlayers
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error("Failed to fetch game details:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// TODO: Add a POST endpoint to submit final game scores.
// app.post('/api/games/:gameId/results', async (req, res) => { ... });


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
