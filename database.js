const { Pool } = require('pg');

console.log('🗄️  Initializing database connection...');
console.log('📝 Database URL:', process.env.DATABASE_URL ? '✅ Found' : '❌ Not found');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  },
  max: 10, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('💥 Unexpected database error:', err);
});

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('\n📊 Initializing database schema...');
    
    // Create games table
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        chat_id BIGINT NOT NULL UNIQUE,
        status VARCHAR(20) DEFAULT 'lobby',
        player_count INTEGER DEFAULT 0,
        max_players INTEGER DEFAULT 8,
        min_players INTEGER DEFAULT 4,
        current_question_index INTEGER DEFAULT 0,
        message_id BIGINT,
        countdown_seconds INTEGER DEFAULT 30,
        game_started BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Table: games');
    
    // Create game_players table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_players (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        user_id BIGINT NOT NULL,
        username VARCHAR(255),
        join_order INTEGER,
        turn_order INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, user_id)
      )
    `);
    console.log('   ✅ Table: game_players');
    
    // Create game_answers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_answers (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        question_index INTEGER NOT NULL,
        question VARCHAR(255),
        user_id BIGINT NOT NULL,
        answer TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(game_id, question_index)
      )
    `);
    console.log('   ✅ Table: game_answers');
    
    // Create game_tracking table for used characters/options
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_tracking (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        type VARCHAR(50),
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ Table: game_tracking');
    
    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_games_chat_id ON games(chat_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_game_tracking_game_id ON game_tracking(game_id)
    `);
    
    console.log('✅ Database schema initialized successfully\n');
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Game management functions
const db = {
  // Create new game
  async createGame(chatId, messageId) {
    const result = await pool.query(
      `INSERT INTO games (chat_id, message_id, status) 
       VALUES ($1, $2, 'lobby') 
       ON CONFLICT (chat_id) 
       DO UPDATE SET 
         status = 'lobby',
         message_id = $2,
         game_started = FALSE,
         current_question_index = 0,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [chatId, messageId]
    );
    
    // Clean up old data for this game
    const gameId = result.rows[0].id;
    await pool.query('DELETE FROM game_players WHERE game_id = $1', [gameId]);
    await pool.query('DELETE FROM game_answers WHERE game_id = $1', [gameId]);
    await pool.query('DELETE FROM game_tracking WHERE game_id = $1', [gameId]);
    
    return gameId;
  },
  
  // Get game by chat ID
  async getGame(chatId) {
    const result = await pool.query(
      'SELECT * FROM games WHERE chat_id = $1',
      [chatId]
    );
    return result.rows[0] || null;
  },
  
  // Update game
  async updateGame(chatId, updates) {
    const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = Object.values(updates);
    
    await pool.query(
      `UPDATE games SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE chat_id = $1`,
      [chatId, ...values]
    );
  },
  
  // Add player to game
  async addPlayer(gameId, userId, username, joinOrder) {
    try {
      await pool.query(
        `INSERT INTO game_players (game_id, user_id, username, join_order) 
         VALUES ($1, $2, $3, $4)`,
        [gameId, userId, username, joinOrder]
      );
      
      // Update player count
      await pool.query(
        'UPDATE games SET player_count = player_count + 1 WHERE id = $1',
        [gameId]
      );
      
      return true;
    } catch (err) {
      if (err.code === '23505') { // Unique constraint violation
        return false; // Player already joined
      }
      throw err;
    }
  },
  
  // Get players for game
  async getPlayers(gameId) {
    const result = await pool.query(
      `SELECT user_id, username, join_order, turn_order 
       FROM game_players 
       WHERE game_id = $1 
       ORDER BY COALESCE(turn_order, join_order)`,
      [gameId]
    );
    return result.rows;
  },
  
  // Shuffle player turn order
  async shufflePlayers(gameId) {
    const players = await this.getPlayers(gameId);
    const shuffled = players
      .map((p, i) => ({ ...p, turn_order: i }))
      .sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < shuffled.length; i++) {
      await pool.query(
        'UPDATE game_players SET turn_order = $1 WHERE game_id = $2 AND user_id = $3',
        [i, gameId, shuffled[i].user_id]
      );
    }
    
    return shuffled;
  },
  
  // Save answer
  async saveAnswer(gameId, questionIndex, question, userId, answer) {
    await pool.query(
      `INSERT INTO game_answers (game_id, question_index, question, user_id, answer)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (game_id, question_index)
       DO UPDATE SET answer = $5, user_id = $4`,
      [gameId, questionIndex, question, userId, answer]
    );
  },
  
  // Get all answers for game
  async getAnswers(gameId) {
    const result = await pool.query(
      `SELECT question_index, question, user_id, answer 
       FROM game_answers 
       WHERE game_id = $1 
       ORDER BY question_index`,
      [gameId]
    );
    return result.rows;
  },
  
  // Track used character/option
  async trackUsed(gameId, type, value) {
    await pool.query(
      'INSERT INTO game_tracking (game_id, type, value) VALUES ($1, $2, $3)',
      [gameId, type, value]
    );
  },
  
  // Get used items
  async getUsedItems(gameId, type) {
    const result = await pool.query(
      'SELECT value FROM game_tracking WHERE game_id = $1 AND type = $2',
      [gameId, type]
    );
    return result.rows.map(r => r.value);
  },
  
  // Delete game (cleanup)
  async deleteGame(chatId) {
    await pool.query('DELETE FROM games WHERE chat_id = $1', [chatId]);
  },
  
  // Get active games count
  async getActiveGamesCount() {
    const result = await pool.query('SELECT COUNT(*) FROM games');
    return parseInt(result.rows[0].count);
  },
  
  // Clean up old games (older than 24 hours)
  async cleanupOldGames() {
    const result = await pool.query(
      `DELETE FROM games 
       WHERE updated_at < NOW() - INTERVAL '24 hours'
       RETURNING chat_id`
    );
    return result.rows.length;
  }
};

// Graceful shutdown
async function closeDatabase() {
  console.log('🗄️  Closing database connections...');
  await pool.end();
  console.log('✅ Database connections closed');
}

module.exports = {
  pool,
  db,
  initializeDatabase,
  closeDatabase
};

