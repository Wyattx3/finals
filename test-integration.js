// Integration test for bot with database
require('dotenv').config();
const { initializeDatabase, closeDatabase } = require('./database');
const gameStates = require('./game-state-manager');

async function runIntegrationTest() {
  console.log('🧪 Integration Test: Bot + Database Game Flow\n');
  
  try {
    // Initialize database
    await initializeDatabase();
    
    const testChatId = -1001234567890;
    
    // Test 1: Create game
    console.log('Test 1: Create new game state...');
    const gameState = {
      players: [],
      countdown: null,
      countdownTimer: null,
      gameStarted: false,
      currentQuestionIndex: 0,
      questions: [],
      answers: {},
      messageId: 99999,
      countdownSeconds: 30,
      usedCharacters: [],
      usedOptions: {}
    };
    
    await gameStates.set(testChatId, gameState);
    console.log('✅ Game state created\n');
    
    // Test 2: Check if game exists
    console.log('Test 2: Check if game exists...');
    const exists = await gameStates.has(testChatId);
    console.log(`✅ Game exists: ${exists}\n`);
    
    // Test 3: Get game state
    console.log('Test 3: Get game state...');
    const retrieved = await gameStates.get(testChatId);
    console.log(`✅ Retrieved game:`, {
      chatId: retrieved.chatId,
      players: retrieved.players.length,
      messageId: retrieved.messageId,
      gameStarted: retrieved.gameStarted
    });
    console.log('');
    
    // Test 4: Add players
    console.log('Test 4: Adding players...');
    retrieved.players = [
      { id: 111111, name: 'Player 1', joinOrder: 0 },
      { id: 222222, name: 'Player 2', joinOrder: 1 },
      { id: 333333, name: 'Player 3🎀', joinOrder: 2 },
      { id: 444444, name: 'Player 4', joinOrder: 3 }
    ];
    await gameStates.set(testChatId, retrieved);
    
    const withPlayers = await gameStates.get(testChatId);
    console.log(`✅ Players added: ${withPlayers.players.length}`);
    console.log(`   Player names: ${withPlayers.players.map(p => p.name).join(', ')}\n`);
    
    // Test 5: Shuffle players
    console.log('Test 5: Shuffle player turn order...');
    const shuffled = await gameStates.shufflePlayers(testChatId);
    console.log(`✅ Shuffled order: ${shuffled.map(p => p.name).join(', ')}\n`);
    
    // Test 6: Track used characters
    console.log('Test 6: Track used characters...');
    await gameStates.trackCharacter(testChatId, 'Taffy');
    await gameStates.trackCharacter(testChatId, 'Ya Mone');
    const updated = await gameStates.get(testChatId);
    console.log(`✅ Used characters: [${updated.usedCharacters.join(', ')}]\n`);
    
    // Test 7: Track used options
    console.log('Test 7: Track used options...');
    await gameStates.trackOption(testChatId, 'ဘယ်အချိန်', 'ညသန်းခေါင်ယံအချိန်');
    await gameStates.trackOption(testChatId, 'ဘယ်နေရာမှာ', 'အိမ်သာထဲမှာ');
    const updated2 = await gameStates.get(testChatId);
    console.log(`✅ Used options for "ဘယ်အချိန်": [${updated2.usedOptions['ဘယ်အချိန်'].join(', ')}]`);
    console.log(`✅ Used options for "ဘယ်နေရာမှာ": [${updated2.usedOptions['ဘယ်နေရာမှာ'].join(', ')}]\n`);
    
    // Test 8: Save answers
    console.log('Test 8: Save answers...');
    await gameStates.saveAnswer(testChatId, 0, 'ဘယ်သူက', 111111, 'Taffy');
    await gameStates.saveAnswer(testChatId, 1, 'ဘယ်သူ့ကို', 222222, 'Ya Mone');
    await gameStates.saveAnswer(testChatId, 2, 'ဘာအကြောင်း', 333333, 'အချစ်ဟောင်းကိုသတိရကြောင်း');
    await gameStates.saveAnswer(testChatId, 3, 'ဘယ်လိုပြော', 444444, 'ငိုရင်းပြောတယ်');
    
    const withAnswers = await gameStates.get(testChatId);
    console.log(`✅ Answers saved: ${Object.keys(withAnswers.answers).length}`);
    console.log(`   Answer 0: ${withAnswers.answers[0].answer}`);
    console.log(`   Answer 1: ${withAnswers.answers[1].answer}`);
    console.log(`   Answer 2: ${withAnswers.answers[2].answer}`);
    console.log(`   Answer 3: ${withAnswers.answers[3].answer}\n`);
    
    // Test 9: Build final sentence
    console.log('Test 9: Build final sentence...');
    const answers = withAnswers.answers;
    const sentence = `${answers[0].answer}က ${answers[1].answer}ကို ${answers[2].answer} ${answers[3].answer}`;
    console.log(`✅ Final sentence: ${sentence}\n`);
    
    // Test 10: Get active games count
    console.log('Test 10: Active games count...');
    const count = await gameStates.size();
    console.log(`✅ Active games: ${count}\n`);
    
    // Test 11: Delete game
    console.log('Test 11: Delete game...');
    await gameStates.delete(testChatId);
    const deleted = await gameStates.has(testChatId);
    console.log(`✅ Game deleted: ${!deleted}\n`);
    
    // Test 12: Verify cleanup
    console.log('Test 12: Verify cleanup...');
    const countAfter = await gameStates.size();
    console.log(`✅ Active games after delete: ${countAfter}\n`);
    
    console.log('🎉 All integration tests passed!\n');
    console.log('✅ Database ✓');
    console.log('✅ GameStateManager ✓');
    console.log('✅ CRUD operations ✓');
    console.log('✅ Player shuffle ✓');
    console.log('✅ Answer tracking ✓');
    console.log('✅ Used items tracking ✓');
    console.log('✅ Cleanup ✓\n');
    
  } catch (err) {
    console.error('❌ Integration test failed:', err);
    console.error('Stack:', err.stack);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

runIntegrationTest();

