// Game State Manager - Wrapper around database for easy migration
// This provides Map-like interface but uses PostgreSQL underneath

const { db } = require('./database');

class GameStateManager {
  constructor() {
    // Cache for quick access (cleared after game ends)
    this.cache = new Map();
  }
  
  // Convert database game to gameState format
  async _dbToState(chatId) {
    const game = await db.getGame(chatId);
    if (!game) return null;
    
    const players = await db.getPlayers(game.id);
    const answers = await db.getAnswers(game.id);
    const usedCharacters = await db.getUsedItems(game.id, 'character');
    
    // Get used options per question type
    const usedOptions = {};
    for (const questionType of ['ဘယ်အချိန်', 'ဘယ်နေရာမှာ', 'ဘာအကြောင်း', 'ဘယ်လိုပြော', 'ဘာလုပ်ပြီး']) {
      usedOptions[questionType] = await db.getUsedItems(game.id, `option_${questionType}`);
    }
    
    // Convert answers array to object keyed by question index
    const answersObj = {};
    for (const answer of answers) {
      answersObj[answer.question_index] = {
        question: answer.question,
        player: players.find(p => p.user_id == answer.user_id) || { id: answer.user_id },
        answer: answer.answer
      };
    }
    
    // Build game state object compatible with existing code
    const state = {
      _dbId: game.id, // Internal: database ID
      chatId: chatId,
      players: players.map(p => ({
        id: p.user_id,
        name: p.username,
        joinOrder: p.join_order,
        turnOrder: p.turn_order
      })),
      messageId: game.message_id,
      countdownSeconds: game.countdown_seconds,
      countdownInterval: null, // Set by countdown logic
      gameStarted: game.game_started,
      questions: [], // Will be set when game starts
      currentQuestionIndex: game.current_question_index,
      answers: answersObj,
      usedCharacters: usedCharacters,
      usedOptions: usedOptions
    };
    
    return state;
  }
  
  // Check if game exists
  async has(chatId) {
    const game = await db.getGame(chatId);
    return game !== null;
  }
  
  // Get game state
  async get(chatId) {
    // Check cache first
    if (this.cache.has(chatId)) {
      return this.cache.get(chatId);
    }
    
    const state = await this._dbToState(chatId);
    if (state) {
      this.cache.set(chatId, state);
    }
    return state;
  }
  
  // Create or update game state
  async set(chatId, gameState) {
    // Store in cache
    this.cache.set(chatId, gameState);
    
    // Create or update in database
    let dbId = gameState._dbId;
    
    if (!dbId) {
      // New game
      dbId = await db.createGame(chatId, gameState.messageId);
      gameState._dbId = dbId;
    }
    
    // Update game fields
    await db.updateGame(chatId, {
      message_id: gameState.messageId,
      countdown_seconds: gameState.countdownSeconds,
      game_started: gameState.gameStarted,
      current_question_index: gameState.currentQuestionIndex,
      player_count: gameState.players.length
    });
    
    // Save players (if any new ones)
    for (let i = 0; i < gameState.players.length; i++) {
      const player = gameState.players[i];
      try {
        await db.addPlayer(dbId, player.id, player.name, i);
      } catch (err) {
        // Player might already exist, that's OK
      }
    }
    
    // Update turn orders if shuffled
    if (gameState.gameStarted && gameState.players.length > 0) {
      for (const player of gameState.players) {
        if (player.turnOrder !== undefined) {
          // Note: This would need a custom update query
          // For now, shuffle is handled separately
        }
      }
    }
    
    return gameState;
  }
  
  // Delete game state
  async delete(chatId) {
    this.cache.delete(chatId);
    await db.deleteGame(chatId);
  }
  
  // Get size (active games count)
  async size() {
    return await db.getActiveGamesCount();
  }
  
  // Track used character
  async trackCharacter(chatId, character) {
    const state = await this.get(chatId);
    if (state) {
      await db.trackUsed(state._dbId, 'character', character);
      state.usedCharacters.push(character);
      this.cache.set(chatId, state);
    }
  }
  
  // Track used option
  async trackOption(chatId, questionType, option) {
    const state = await this.get(chatId);
    if (state) {
      await db.trackUsed(state._dbId, `option_${questionType}`, option);
      if (!state.usedOptions[questionType]) {
        state.usedOptions[questionType] = [];
      }
      state.usedOptions[questionType].push(option);
      this.cache.set(chatId, state);
    }
  }
  
  // Save answer
  async saveAnswer(chatId, questionIndex, question, userId, answer) {
    const state = await this.get(chatId);
    if (state) {
      await db.saveAnswer(state._dbId, questionIndex, question, userId, answer);
      
      // Update cache
      const player = state.players.find(p => p.id == userId);
      state.answers[questionIndex] = {
        question,
        player: player || { id: userId },
        answer
      };
      this.cache.set(chatId, state);
    }
  }
  
  // Add player to game
  async addPlayer(chatId, userId, username) {
    const state = await this.get(chatId);
    if (state) {
      const joinOrder = state.players.length;
      await db.addPlayer(state._dbId, userId, username, joinOrder);
      
      // Update local state
      state.players.push({
        id: userId,
        name: username,
        joinOrder: joinOrder,
        turnOrder: joinOrder
      });
      
      this.cache.set(chatId, state);
      return state.players.length;
    }
    return 0;
  }
  
  // Shuffle players
  async shufflePlayers(chatId) {
    const state = await this.get(chatId);
    if (state) {
      const shuffled = await db.shufflePlayers(state._dbId);
      
      // Update state with new order
      state.players = shuffled.map((p, i) => ({
        id: p.user_id,
        name: p.username,
        joinOrder: p.join_order,
        turnOrder: i
      }));
      
      this.cache.set(chatId, state);
      return state.players;
    }
    return [];
  }
  
  // Clear cache (for memory management)
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
const gameStates = new GameStateManager();

module.exports = gameStates;

