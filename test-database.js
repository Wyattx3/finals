require('dotenv').config();
const { db, initializeDatabase, closeDatabase } = require('./database');

async function testDatabase() {
  console.log('🧪 Testing database connection and operations...\n');
  
  try {
    // Initialize schema
    await initializeDatabase();
    
    // Test 1: Create game
    console.log('Test 1: Creating game...');
    const gameId = await db.createGame(-1001234567890, 12345);
    console.log(`✅ Game created with ID: ${gameId}\n`);
    
    // Test 2: Get game
    console.log('Test 2: Getting game...');
    const game = await db.getGame(-1001234567890);
    console.log(`✅ Game retrieved:`, game, '\n');
    
    // Test 3: Add players
    console.log('Test 3: Adding players...');
    await db.addPlayer(gameId, 111111, 'Player 1', 0);
    await db.addPlayer(gameId, 222222, 'Player 2', 1);
    await db.addPlayer(gameId, 333333, 'Player 3🎀', 2);
    console.log(`✅ 3 players added\n`);
    
    // Test 4: Get players
    console.log('Test 4: Getting players...');
    const players = await db.getPlayers(gameId);
    console.log(`✅ Players:`, players, '\n');
    
    // Test 5: Shuffle players
    console.log('Test 5: Shuffling players...');
    const shuffled = await db.shufflePlayers(gameId);
    console.log(`✅ Shuffled order:`, shuffled.map(p => p.username), '\n');
    
    // Test 6: Save answers
    console.log('Test 6: Saving answers...');
    await db.saveAnswer(gameId, 0, 'ဘယ်သူက', 111111, 'Taffy');
    await db.saveAnswer(gameId, 1, 'ဘယ်သူ့ကို', 222222, 'Ya Mone');
    console.log(`✅ Answers saved\n`);
    
    // Test 7: Get answers
    console.log('Test 7: Getting answers...');
    const answers = await db.getAnswers(gameId);
    console.log(`✅ Answers:`, answers, '\n');
    
    // Test 8: Track used items
    console.log('Test 8: Tracking used items...');
    await db.trackUsed(gameId, 'character', 'Taffy');
    await db.trackUsed(gameId, 'character', 'Ya Mone');
    await db.trackUsed(gameId, 'option_ဘယ်အချိန်', 'ညသန်းခေါင်ယံအချိန်');
    console.log(`✅ Used items tracked\n`);
    
    // Test 9: Get used items
    console.log('Test 9: Getting used items...');
    const usedChars = await db.getUsedItems(gameId, 'character');
    console.log(`✅ Used characters:`, usedChars, '\n');
    
    // Test 10: Update game
    console.log('Test 10: Updating game...');
    await db.updateGame(-1001234567890, {
      status: 'playing',
      game_started: true,
      current_question_index: 2
    });
    const updatedGame = await db.getGame(-1001234567890);
    console.log(`✅ Game updated:`, updatedGame, '\n');
    
    // Test 11: Get active games count
    console.log('Test 11: Getting active games count...');
    const count = await db.getActiveGamesCount();
    console.log(`✅ Active games: ${count}\n`);
    
    // Test 12: Delete game
    console.log('Test 12: Deleting game...');
    await db.deleteGame(-1001234567890);
    const deletedGame = await db.getGame(-1001234567890);
    console.log(`✅ Game deleted:`, deletedGame === null ? 'Yes' : 'No', '\n');
    
    console.log('🎉 All tests passed!\n');
    
  } catch (err) {
    console.error('❌ Test failed:', err);
    console.error('Stack:', err.stack);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

testDatabase();

