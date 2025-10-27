require('dotenv').config();
const { Bot, InlineKeyboard, session } = require('grammy');
const { initializeDatabase, closeDatabase } = require('./database');
const gameStates = require('./game-state-manager');

console.log('🚀 Starting Telegram Story Game Bot...');
console.log('📝 Bot Token:', process.env.BOT_TOKEN ? '✅ Found' : '❌ Not found');
console.log('📝 Database URL:', process.env.DATABASE_URL ? '✅ Found' : '❌ Not found');

const bot = new Bot(process.env.BOT_TOKEN);

// Rate limit configuration (to avoid Telegram API limits)
// Increased delays to prevent 429 "Too Many Requests" errors
const RATE_LIMITS = {
  COUNTDOWN_INTERVAL: 2000,        // 2 seconds (instead of 1s to reduce edit frequency)
  QUESTION_DELAY: 4000,            // 4 seconds between questions (increased from 2.5s)
  GAME_START_DELAY: 4000,          // 4 seconds before starting game (increased from 3s)
  ANSWER_TO_NEXT_QUESTION: 3000,   // 3 seconds after answer before next question (increased from 2s)
  CALLBACK_RESPONSE_DELAY: 100,    // Small delay for callback responses
  MESSAGE_EDIT_DELAY: 500          // Delay between message edits
};

console.log('⚙️  Rate limit settings:');
console.log(`   Countdown interval: ${RATE_LIMITS.COUNTDOWN_INTERVAL}ms`);
console.log(`   Question delay: ${RATE_LIMITS.QUESTION_DELAY}ms`);
console.log(`   Game start delay: ${RATE_LIMITS.GAME_START_DELAY}ms`);

// Character names
const CHARACTERS = [
  'Aye Thinn Kyu',
  'Aye Myat Swe',
  'Aye Sin Sin Lin',
  'Alvina Mine',
  'Aung Khant Kyaw',
  'Aye Chan Ko Ko',
  'Chifuu',
  'Chuu',
  'Dora Honey',
  'Emilymore',
  'Gon Freecss',
  'Htet Lae Mon Soe',
  'Htet Wai Yan',
  'AhHnin',
  'Jel Jel',
  'Kyaw Thiha Phyo',
  'Kyaw Htut Lynn',
  'Kyaw Su Thawy',
  'Kay Kabyar',
  'Kaythari',
  'Lone',
  'Luneth',
  'Nang Shwe Yamin Oo',
  'Nay Ma Nyo',
  'May Myat Noe Khin',
  'Myo Zarni Kyaw',
  'Myat Min Thar',
  'Maung Kaung',
  'Myat Thura Kyaw',
  'Puddin',
  'Phyoei',
  'PhoneMyat Hein',
  'Sai Sai',
  'Thura Kaung Maw',
  'Taffy',
  'Wint',
  'Wyatt',
  'Yu Ya Hlaing',
  'Ya Mone',
  'Zue May Thaw'
];

console.log(`📝 Loaded ${CHARACTERS.length} character names`);

// Helper function to truncate long text for buttons (max 20 chars for better display)
function truncateForButton(text, maxLength = 20) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 2) + '..';
}

// Helper function to escape HTML special characters
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper function to sanitize usernames (handles special characters, emojis, etc.)
function sanitizeUsername(firstName, lastName) {
  // Handle null/undefined/empty firstName
  if (!firstName || firstName.trim() === '') {
    firstName = 'Anonymous';
  }
  
  // Build full name
  const fullName = firstName.trim() + (lastName ? ' ' + lastName.trim() : '');
  
  // Truncate if too long (keep it reasonable for display)
  if (fullName.length > 50) {
    return fullName.substring(0, 47) + '...';
  }
  
  return fullName;
}

// Options for each question type (updated with more variety)
const OPTIONS = {
  'ဘယ်အချိန်': [
    'ခွေးဖင်ပူးတာကြည့်နေချိန်',
    'မိုးရွာနေချိန်',
    'နှင်းကျနေချိန်',
    'ဘောလုံးပွဲလာနေတဲ့အချိန်',
    'မီးပျက်နေတဲ့အချိန်',
    'သတင်းလာနေတဲ့အချိန်',
    'ဖုန်းအားသွင်းနေတဲ့အချိန်',
    'ရာသီလာနေတဲ့အချိန်',
    'အိမ်ကဆူနေတဲ့အချိန်',
    'နေ့လည်စာစားနေချိန်',
    'မီးလောင်နေတဲ့အချိန်',
    'အိပ်နေတဲ့အချိန်',
    'ကစ်စုပ်နေတဲ့အချိန်',
    'ဖုန်းသုံးနေတဲ့အချိန်',
    'ချီးကားမောင်းနေတဲ့အချိန်',
    'အမေနဲ့ရွာကိုလွမ်းနေတဲ့အချိန်',
    'မန်ယူနိုင်နေအချိန်',
    'ကြက်တွန်နေတဲ့အချိန်',
    'ဂိမ်းဆော့နေချိန်',
    'စိတ်ဆိုးနေတဲ့အချိန်'
  ],
  'ဘယ်နေရာမှာ': [
    'ရေဆိုးမြောင်းထဲမှာ',
    'ခြုံပုတ်ထဲမှာ',
    'ဘုရားပေါ်မှာ',
    'လှိုင်ဂူထဲမှာ',
    'Private Cinemaမှာ',
    'ရုပ်ရှင်ရုံထဲမှာ',
    'စျေးဝယ်စင်တာမှာ',
    'အမျိုးသမီးအိမ်သာထဲမှာ',
    'အမျိုးသားအိမ်သာထဲမှာ',
    'အဝတ်လဲခန်းထဲမှာ',
    'အရက်ဆိုင်ထဲမှာ',
    'အလှပြင်ဆိုင်ထဲမှာ',
    'KTVထဲမှာ',
    'ကားထဲမှာ',
    'မြင်းလှည်းပေါ်မှာ',
    'တည်းခိုခန်းမှာ',
    'လယ်ကွင်းပြင်ထဲမှာ',
    'ဝါးဖောင်ပေါ်မှာ',
    'ကောက်ရိုးပုံအောက်မှာ',
    'သရဲအိမ်ထဲမှာ'
  ],
  'ဘာအကြောင်း': [
    'ဖင်ထဲမြွေဝင်တဲ့အကြောင်း',
    'AIDSဘယ်လိုရခဲ့ကြောင်း',
    'မျိုးမအောင်တော့ကြောင်း',
    'နှပ်ချီးစားဖူးကြောင်း',
    'ဖင်မွှေးနှုတ်ဖူးကြောင်း',
    'မုဒိန်းကျင့်ခံဖူးကြောင်း',
    'ထမီကျွတ်ကျကြောင်း',
    'ချစ်မိနေတဲ့အကြောင်း',
    'ပေါင်မှာဝဲပေါက်နေကြောင်း',
    'ဖင်မှာသွေးစုနာရှိကြောင်း',
    'လိင်တူချစ်မိနေကြောင်း',
    'ဖင်ထဲမျော့ဝင်နေကြောင်း',
    'အတွင်းခံခိုးရှူဖူးကြောင်း',
    'ထမီခိုးဖူးကြောင်း',
    'ဟင်းခိုးစားဖူးကြောင်း',
    'ရှူးပေါက်ချဖူးကြောင်း',
    'အီးအကျယ်ကြီးပေါက်လိုက်ကြောင်း',
    'ဘစ်ခိုးဖူးကြောင်း',
    'ဖင်လိုက်နှိုက်ဖူးကြောင်း',
    'သရဲအခြောက်ခံရကြောင်း'
  ],
  'ဘာလုပ်ပြီး': [
    'ကတုံးတုံးရင်း',
    'နိုင်ငံတော်သီချင်းဆိုရင်း',
    'ခြေအိတ်အနံ့ရှုရင်း',
    'ချိုင်းမွှေးနှုတ်ရင်း',
    'စုပ်လုံးစုပ်ရင်း',
    'လက်သည်းကိုက်ရင်း',
    'ပဲပြုတ်ရောင်းရင်း',
    'ဆက်ဆီဒန့်စ်ကရင်း',
    'လက်ခုပ်တီးရင်း',
    'သေးပေါက်နေရင်း',
    'ကျွမ်းထိုးရင်း',
    'ဖုတ်ဝင်နေရင်း',
    'ဂုတ်တက်ခွစီးရင်း',
    'နတ်ပူးရင်း',
    'ဖင်ကုတ်ရင်း',
    'နားဖာချေးကလော်ရင်း',
    'နွားချီးကျုံးရင်း',
    'မြင်းလုပ်စီးရင်း',
    'ချိန်းတွေ့ကြရင်း',
    'ကျားထိုးရင်း'
  ],
  'ဘယ်လိုပြော': [
    'ဖင်ထောင်ပြီးပြော',
    'နှုတ်ခမ်းထော်ပြီးပြော',
    'လက်အုပ်ချီပြီးပြော',
    'မျက်စိမှိတ်ပြီးပြော',
    'အော်ပြီးပြော',
    'ရယ်ရယ်မောမောပြော',
    'ဝမ်းနည်းစွာပြော',
    'ခုန်ပေါက်ပြီးပြော',
    'မနားတမ်းပြော',
    'အီးပေါက်သံနဲ့ပြော',
    'မယားငယ်သံနဲ့ပြော',
    'ခြင်ထောင်ထဲကအသံနဲ့ပြော',
    'ခွေးလိုအူပြီးပြော',
    'မူးနေတဲ့အသံနဲ့ပြော',
    'ချီးနင်နေတဲ့အသံနဲ့ပြော',
    'လည်ချောင်းနာတဲ့အသံနဲ့ပြော',
    'ဆေးကွဲနေတဲ့လေသံနဲ့ပြော',
    'ဝင်းဦးအသံနဲ့ပြော',
    'ကလေးညှစ်နေတဲ့အသံနဲ့ပြော',
    'ခင်မို့မို့အေးပုံစံနဲ့ပြော'
  ]
};

// Note: Game states now stored in PostgreSQL database (see database.js)
// No more in-memory Map - all state is persistent!

// Get questions based on player count
function getQuestions(playerCount) {
  // Build questions array based on exact player count
  // 4 players: ဘယ်သူက, ဘယ်သူ့ကို, ဘာအကြောင်း, ဘယ်လိုပြော
  // 5 players: ဘယ်သူက, ဘယ်သူ့ကို, ဘယ်နေရာမှာ, ဘာအကြောင်း, ဘယ်လိုပြော
  // 6 players: ဘယ်သူက, ဘယ်သူ့ကို, ဘယ်အချိန်, ဘယ်နေရာမှာ, ဘာအကြောင်း, ဘယ်လိုပြော
  // 7 players: ဘယ်သူက, ဘယ်သူ့ကို, ဘယ်အချိန်, ဘယ်နေရာမှာ, ဘယ်သူ့ရဲ့, ဘာအကြောင်း, ဘယ်လိုပြော
  // 8 players: ဘယ်သူက, ဘယ်သူ့ကို, ဘယ်အချိန်, ဘယ်နေရာမှာ, ဘယ်သူ့ရဲ့, ဘာအကြောင်း, ဘာလုပ်ပြီး, ဘယ်လိုပြော
  
  const questions = ['ဘယ်သူက', 'ဘယ်သူ့ကို'];
  
  // Add questions in order based on player count
  if (playerCount >= 6) questions.push('ဘယ်အချိန်');
  if (playerCount >= 5) questions.push('ဘယ်နေရာမှာ');
  if (playerCount >= 7) questions.push('ဘယ်သူ့ရဲ့');
  questions.push('ဘာအကြောင်း'); // Always included for 4+ players
  if (playerCount >= 8) questions.push('ဘာလုပ်ပြီး');
  questions.push('ဘယ်လိုပြော'); // Always last
  
  return questions;
}

// Check if question is character-based
function isCharacterQuestion(question) {
  return ['ဘယ်သူက', 'ဘယ်သူ့ကို', 'ဘယ်သူ့ရဲ့'].includes(question);
}

// Get 4 random options (avoiding already used ones)
function getRandomOptions(question, usedCharacters = [], usedOptions = {}) {
  if (isCharacterQuestion(question)) {
    // Filter out already used characters
    const availableCharacters = CHARACTERS.filter(char => !usedCharacters.includes(char));
    
    // If less than 3 available, log warning but continue
    if (availableCharacters.length < 3) {
      console.log(`   ⚠️  Only ${availableCharacters.length} characters left, reusing some`);
    }
    
    // Shuffle and take 3 (or less if not enough available)
    const shuffled = [...availableCharacters].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(3, availableCharacters.length));
    
    // If we need more, add from used ones
    if (selected.length < 3) {
      const remaining = CHARACTERS.filter(char => !selected.includes(char))
        .sort(() => 0.5 - Math.random());
      selected.push(...remaining.slice(0, 3 - selected.length));
    }
    
    return selected.concat(['🎲 ကံစမ်း']);
  } else {
    // For non-character questions, avoid used options for this question type
    const allOptions = OPTIONS[question];
    const usedForThisQuestion = usedOptions[question] || [];
    const availableOptions = allOptions.filter(opt => !usedForThisQuestion.includes(opt));
    
    // If less than 4 available, use all available + some used ones
    if (availableOptions.length < 4) {
      const shuffled = [...availableOptions].sort(() => 0.5 - Math.random());
      const remaining = allOptions.filter(opt => !shuffled.includes(opt))
        .sort(() => 0.5 - Math.random());
      return shuffled.concat(remaining).slice(0, 4);
    }
    
    const shuffled = [...availableOptions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }
}

// Handle /start command in private chat
bot.command('start', async (ctx) => {
  console.log(`\n📥 /start command received`);
  console.log(`   Chat Type: ${ctx.chat.type}`);
  console.log(`   Chat ID: ${ctx.chat.id}`);
  console.log(`   User: ${ctx.from.first_name} (${ctx.from.id})`);
  
  if (ctx.chat.type === 'private') {
    console.log('   ➡️  Private chat - showing welcome message');
    const keyboard = new InlineKeyboard()
      .text('➕ Add to Group', 'add_to_group')
      .row()
      .text('❓ Help', 'help');
    
    await ctx.reply(
      '👋 ကြိုဆိုပါတယ်! ဒီ bot က စကားပုံပြောပွဲ game ကစားဖို့အတွက်ပါ။\n\n' +
      'Group/Channel မှာ /start လုပ်ပြီး game စကစားနိုင်ပါတယ်။',
      { reply_markup: keyboard }
    );
  } else {
    console.log('   ➡️  Group/Channel - starting game lobby');
    // Group/Channel - start game lobby
    startGameLobby(ctx);
  }
});

// Handle add to group button
bot.callbackQuery('add_to_group', async (ctx) => {
  console.log(`\n🔘 Callback: add_to_group`);
  console.log(`   User: ${ctx.from.first_name} (${ctx.from.id})`);
  
  await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.CALLBACK_RESPONSE_DELAY));
  await ctx.answerCallbackQuery();
  
  await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.MESSAGE_EDIT_DELAY));
  await ctx.reply(
    '📌 Bot ကို group/channel မှာထည့်ဖို့:\n\n' +
    '1. Group/Channel ရဲ့ settings ကိုဝင်ပါ\n' +
    '2. Add members ကို နှိပ်ပါ\n' +
    '3. ဒီ bot ကို ရှာပြီး ထည့်ပါ\n' +
    '4. Bot ကို admin အဖြစ် promote လုပ်ပေးပါ\n' +
    '5. Group/Channel မှာ /start လုပ်ပြီး game ကစားလို့ရပါပြီ!'
  );
});

// Handle help button
bot.callbackQuery('help', async (ctx) => {
  console.log(`\n🔘 Callback: help`);
  console.log(`   User: ${ctx.from.first_name} (${ctx.from.id})`);
  
  await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.CALLBACK_RESPONSE_DELAY));
  await ctx.answerCallbackQuery();
  
  await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.MESSAGE_EDIT_DELAY));
  await ctx.reply(
    '❓ ဘယ်လို ကစားရမလဲ?\n\n' +
    '1️⃣ Bot ကို group/channel မှာ ထည့်ပါ\n' +
    '2️⃣ /start command နှိပ်ပြီး game lobby စပါ\n' +
    '3️⃣ "Join Game" နှိပ်ပြီး ပွဲဝင်ပါ (4-8 ယောက်)\n' +
    '4️⃣ Countdown ပြီးရင် game စပါမယ်\n' +
    '5️⃣ မေးခွန်းတိုင်းအတွက် ရွေးချယ်မှုလုပ်ပါ\n' +
    '6️⃣ အားလုံးရွေးပြီးရင် ရယ်စရာကောင်းတဲ့ စကားပုံတခု ပေါ်လာမှာပါ! 😄'
  );
});

// Start game lobby
async function startGameLobby(ctx) {
  const chatId = ctx.chat.id;
  
  console.log(`\n🎮 Starting game lobby`);
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   Active games: ${await gameStates.size()}`);
  
  // Check if game already running
  if (await gameStates.has(chatId)) {
    console.log(`   ⚠️  Game already exists in this chat`);
    await ctx.reply('⚠️ ဒီ chat မှာ game တခု ရှိနေပါပြီ!');
    return;
  }
  
  // Initialize game state
  const gameState = {
    players: [],
    countdown: null,
    countdownTimer: null,
    gameStarted: false,
    currentQuestionIndex: 0,
    questions: [],
    answers: {},
    messageId: null,
    usedCharacters: [],      // Track used characters to avoid duplicates
    usedOptions: {}          // Track used options per question type
  };
  
  await gameStates.set(chatId, gameState);
  console.log(`   ✅ Game lobby created`);
  
  const keyboard = new InlineKeyboard()
    .text('🎮 Join Game', 'join_game');
  
  const message = await ctx.reply(
    '🎮 Game Lobby\n\n' +
    '👥 Players: 0/8\n' +
    '⏰ Countdown: 30s\n\n' +
    'Click "Join Game" to participate!\n' +
    'Minimum: 4 players, Maximum: 8 players',
    { reply_markup: keyboard }
  );
  
  gameState.messageId = message.message_id;
  
  // Start countdown with rate limiting
  gameState.countdown = 30;
  gameState.lastUpdateTime = Date.now();
  
  console.log(`   ⏱️  Starting countdown with ${RATE_LIMITS.COUNTDOWN_INTERVAL}ms interval`);
  
  gameState.countdownTimer = setInterval(async () => {
    // Decrease countdown based on interval (2s interval = -2 countdown)
    const decreaseAmount = Math.floor(RATE_LIMITS.COUNTDOWN_INTERVAL / 1000);
    gameState.countdown -= decreaseAmount;
    
    if (gameState.countdown <= 0 || gameState.players.length >= 8) {
      clearInterval(gameState.countdownTimer);
      console.log(`   ⏰ Countdown finished or max players reached`);
      
      if (gameState.players.length >= 4) {
        await startGame(ctx, chatId);
      } else {
        console.log(`   ❌ Not enough players: ${gameState.players.length}/4`);
        
        // Add delay before editing message
        await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.MESSAGE_EDIT_DELAY));
        
        await ctx.api.editMessageText(
          chatId,
          message.message_id,
          '❌ လူအရေအတွက် မလောက်လို့ game မစနိုင်ပါ။ (အနည်းဆုံး 4 ယောက် လိုအပ်ပါတယ်)'
        );
        await gameStates.delete(chatId);
      }
    } else {
      // Update countdown with rate limiting
      const keyboard = new InlineKeyboard()
        .text('🎮 Join Game', 'join_game');
      
      try {
        // Add delay before editing message
        await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.MESSAGE_EDIT_DELAY));
        
        await ctx.api.editMessageText(
          chatId,
          message.message_id,
          `🎮 Game Lobby\n\n` +
          `👥 Players: ${gameState.players.length}/8\n` +
          `${gameState.players.map(p => `  • ${p.name}`).join('\n')}\n\n` +
          `⏰ Countdown: ${gameState.countdown}s\n\n` +
          `Click "Join Game" to participate!\n` +
          `Minimum: 4 players, Maximum: 8 players`,
          { reply_markup: keyboard }
        );
        
        gameState.lastUpdateTime = Date.now();
        console.log(`   🔄 Countdown updated: ${gameState.countdown}s, Players: ${gameState.players.length}`);
      } catch (e) {
        // Ignore error if message not modified
        console.log(`   ⚠️  Update skipped (message not modified or rate limit)`);
      }
    }
  }, RATE_LIMITS.COUNTDOWN_INTERVAL);
}

// Handle join game
bot.callbackQuery('join_game', async (ctx) => {
  const chatId = ctx.chat.id;
  const gameState = await gameStates.get(chatId);
  
  console.log(`\n🔘 Callback: join_game`);
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   User: ${ctx.from.first_name} (${ctx.from.id})`);
  
  if (!gameState) {
    console.log(`   ⚠️  No game lobby found`);
    await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.CALLBACK_RESPONSE_DELAY));
    await ctx.answerCallbackQuery({ text: '⚠️ Game lobby မရှိပါ!', show_alert: true });
    return;
  }
  
  if (gameState.gameStarted) {
    console.log(`   ⚠️  Game already started`);
    await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.CALLBACK_RESPONSE_DELAY));
    await ctx.answerCallbackQuery({ text: '⚠️ Game စပြီးပါပြီ!', show_alert: true });
    return;
  }
  
  const userId = ctx.from.id;
  const userName = sanitizeUsername(ctx.from.first_name, ctx.from.last_name);
  
  console.log(`   User details: ID=${userId}, Name="${userName}"`);
  
  // Check if already joined
  if (gameState.players.find(p => p.id === userId)) {
    console.log(`   ⚠️  Player already joined`);
    await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.CALLBACK_RESPONSE_DELAY));
    await ctx.answerCallbackQuery({ text: '⚠️ သင် join ပြီးပါပြီ!', show_alert: true });
    return;
  }
  
  // Check max players
  if (gameState.players.length >= 8) {
    console.log(`   ⚠️  Game is full`);
    await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.CALLBACK_RESPONSE_DELAY));
    await ctx.answerCallbackQuery({ text: '⚠️ ပွဲပြည့်ပါပြီ!', show_alert: true });
    return;
  }
  
  // Add player (save to database)
  const playerCount = await gameStates.addPlayer(chatId, userId, userName);
  console.log(`   ✅ Player joined! Total players: ${playerCount}/8`);
  
  // Refresh game state from database
  const updatedGameState = await gameStates.get(chatId);
  Object.assign(gameState, updatedGameState);
  
  // Add delay before callback response
  await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.CALLBACK_RESPONSE_DELAY));
  await ctx.answerCallbackQuery({ text: '✅ ပွဲဝင်ပြီးပါပြီ!', show_alert: false });
  
  // Update message with rate limiting
  const keyboard = new InlineKeyboard()
    .text('🎮 Join Game', 'join_game');
  
  try {
    // Check if enough time has passed since last update
    const timeSinceLastUpdate = Date.now() - (gameState.lastUpdateTime || 0);
    if (timeSinceLastUpdate < RATE_LIMITS.MESSAGE_EDIT_DELAY) {
      const waitTime = RATE_LIMITS.MESSAGE_EDIT_DELAY - timeSinceLastUpdate;
      console.log(`   ⏳ Waiting ${waitTime}ms before updating message (rate limiting)`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    await ctx.editMessageText(
      `🎮 Game Lobby\n\n` +
      `👥 Players: ${gameState.players.length}/8\n` +
      `${gameState.players.map(p => `  • ${p.name}`).join('\n')}\n\n` +
      `⏰ Countdown: ${gameState.countdown}s\n\n` +
      `Click "Join Game" to participate!\n` +
      `Minimum: 4 players, Maximum: 8 players`,
      { reply_markup: keyboard }
    );
    
    gameState.lastUpdateTime = Date.now();
  } catch (e) {
    console.log(`   ⚠️  Failed to update message: ${e.message}`);
  }
});

// Start the actual game
async function startGame(ctx, chatId) {
  const gameState = await gameStates.get(chatId);
  gameState.gameStarted = true;
  
  console.log(`\n🚀 Starting actual game`);
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   Players: ${gameState.players.length}`);
  console.log(`   Player list (join order): ${gameState.players.map(p => p.name).join(', ')}`);
  
  // Shuffle players to randomize question order (not based on join order)
  const shuffledPlayers = await gameStates.shufflePlayers(chatId);
  gameState.players = shuffledPlayers;
  console.log(`   🔀 Shuffled order: ${gameState.players.map(p => p.name).join(', ')}`);
  
  // Get questions based on player count
  gameState.questions = getQuestions(gameState.players.length);
  gameState.currentQuestionIndex = 0;
  gameState.answers = {};
  
  console.log(`   Questions: ${gameState.questions.join(', ')}`);
  
  // Save updated game state with shuffled players and questions to database
  await gameStates.set(chatId, gameState);
  console.log(`   💾 Game state saved to database`);
  
  // Add delay before editing message
  await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.MESSAGE_EDIT_DELAY));
  
  await ctx.api.editMessageText(
    chatId,
    gameState.messageId,
    '🎮 Game စပါပြီ! ခဏစောင့်ပါ...'
  );
  
  console.log(`   ⏳ Waiting ${RATE_LIMITS.GAME_START_DELAY}ms before first question (rate limiting)`);
  
  // Wait before starting first question (rate limiting)
  setTimeout(() => {
    askQuestion(ctx, chatId);
  }, RATE_LIMITS.GAME_START_DELAY);
}

// Ask question to players
async function askQuestion(ctx, chatId) {
  const gameState = await gameStates.get(chatId);
  
  console.log(`\n❓ Asking question`);
  console.log(`   Question index: ${gameState.currentQuestionIndex + 1}/${gameState.questions.length}`);
  
  if (gameState.currentQuestionIndex >= gameState.questions.length) {
    console.log(`   ✅ All questions answered! Showing result...`);
    // All questions answered, show result
    await showResult(ctx, chatId);
    return;
  }
  
  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const currentPlayerIndex = gameState.currentQuestionIndex % gameState.players.length;
  const currentPlayer = gameState.players[currentPlayerIndex];
  
  console.log(`   Question: ${currentQuestion}`);
  console.log(`   Player turn: ${currentPlayer.name} (${currentPlayer.id})`);
  console.log(`   📢 Mentioning player for notification`);
  console.log(`   Used characters so far: [${gameState.usedCharacters.join(', ')}]`);
  
  const options = getRandomOptions(currentQuestion, gameState.usedCharacters, gameState.usedOptions);
  console.log(`   Generated options: ${options.join(', ')}`);
  
  const keyboard = new InlineKeyboard();
  for (let i = 0; i < options.length; i++) {
    // Truncate long text for better button display
    const buttonText = truncateForButton(options[i]);
    keyboard.text(buttonText, `answer_${gameState.currentQuestionIndex}_${i}`);
    if (i % 2 === 1) keyboard.row();
  }
  if (options.length % 2 === 1) keyboard.row();
  
  // Add delay before sending new message (rate limiting)
  console.log(`   ⏳ Waiting ${RATE_LIMITS.QUESTION_DELAY}ms before sending question (rate limiting)`);
  await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.QUESTION_DELAY));
  
  // Create mention link for player notification (escape HTML in name)
  const mentionLink = `<a href="tg://user?id=${currentPlayer.id}">${escapeHtml(currentPlayer.name)}</a>`;
  
  const message = await ctx.api.sendMessage(
    chatId,
    `❓ မေးခွန်း ${gameState.currentQuestionIndex + 1}/${gameState.questions.length}\n\n` +
    `🎯 ${currentQuestion}\n\n` +
    `👤 ${mentionLink} ရွေးချယ်ပါ:`,
    { 
      reply_markup: keyboard,
      parse_mode: 'HTML'
    }
  );
  
  console.log(`   ✅ Question sent successfully`);
  
  // Store options for this question
  gameState.answers[gameState.currentQuestionIndex] = {
    question: currentQuestion,
    options: options,
    player: currentPlayer,
    answer: null,
    messageId: message.message_id
  };
}

// Handle answer selection
bot.callbackQuery(/answer_(\d+)_(\d+)/, async (ctx) => {
  const chatId = ctx.chat.id;
  const gameState = await gameStates.get(chatId);
  
  console.log(`\n🔘 Callback: answer selection`);
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   User: ${ctx.from.first_name} (${ctx.from.id})`);
  
  if (!gameState) {
    console.log(`   ⚠️  No game found`);
    await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.CALLBACK_RESPONSE_DELAY));
    await ctx.answerCallbackQuery({ text: '⚠️ Game မရှိပါ!', show_alert: true });
    return;
  }
  
  const questionIndex = parseInt(ctx.match[1]);
  const optionIndex = parseInt(ctx.match[2]);
  
  console.log(`   Question index: ${questionIndex}, Option index: ${optionIndex}`);
  
  const answerData = gameState.answers[questionIndex];
  
  // Check if it's the correct player's turn
  // Use == instead of === for type-safe comparison (DB returns string, Telegram sends number)
  if (ctx.from.id != answerData.player.id) {
    console.log(`   ⚠️  Wrong player! Expected: ${answerData.player.name} (ID: ${answerData.player.id})`);
    console.log(`   Current user: ${ctx.from.first_name} (ID: ${ctx.from.id}, Type: ${typeof ctx.from.id})`);
    console.log(`   Expected ID type: ${typeof answerData.player.id}`);
    await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.CALLBACK_RESPONSE_DELAY));
    await ctx.answerCallbackQuery({ 
      text: `⚠️ ${answerData.player.name} က ရွေးရမှာပါ!`, 
      show_alert: true 
    });
    return;
  }
  
  // Check if already answered
  if (answerData.answer !== null) {
    console.log(`   ⚠️  Already answered: ${answerData.answer}`);
    await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.CALLBACK_RESPONSE_DELAY));
    await ctx.answerCallbackQuery({ text: '⚠️ ရွေးပြီးပါပြီ!', show_alert: true });
    return;
  }
  
  let selectedAnswer = answerData.options[optionIndex];
  
  // Handle dice roll
  if (selectedAnswer === '🎲 ကံစမ်း') {
    // Roll dice, but avoid already used characters if possible
    const availableForDice = CHARACTERS.filter(char => !gameState.usedCharacters.includes(char));
    
    if (availableForDice.length > 0) {
      selectedAnswer = availableForDice[Math.floor(Math.random() * availableForDice.length)];
      console.log(`   🎲 Dice rolled! Result: ${selectedAnswer} (from ${availableForDice.length} unused characters)`);
    } else {
      // All characters used, pick any random one
      selectedAnswer = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
      console.log(`   🎲 Dice rolled! Result: ${selectedAnswer} (all characters already used, allowing reuse)`);
    }
  }
  
  answerData.answer = selectedAnswer;
  console.log(`   ✅ Answer selected: ${selectedAnswer}`);
  
  // Track used characters and options to avoid duplicates (in database)
  if (isCharacterQuestion(answerData.question)) {
    if (!gameState.usedCharacters.includes(selectedAnswer)) {
      await gameStates.trackCharacter(chatId, selectedAnswer);
      console.log(`   📌 Added to used characters: ${selectedAnswer}`);
    }
  } else {
    const questionOptions = gameState.usedOptions[answerData.question] || [];
    if (!questionOptions.includes(selectedAnswer)) {
      await gameStates.trackOption(chatId, answerData.question, selectedAnswer);
      console.log(`   📌 Added to used options for "${answerData.question}": ${selectedAnswer}`);
    }
  }
  
  // Save answer to database
  await gameStates.saveAnswer(chatId, answerData.questionIndex, answerData.question, currentPlayer.id, selectedAnswer);
  
  // Add delay before callback response
  await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.CALLBACK_RESPONSE_DELAY));
  await ctx.answerCallbackQuery({ text: `✅ ရွေးချယ်ပြီးပါပြီ: ${selectedAnswer}`, show_alert: false });
  
  // Add delay before editing message (rate limiting)
  await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.MESSAGE_EDIT_DELAY));
  
  // Update message with HTML format (to match question message)
  await ctx.editMessageText(
    `✅ မေးခွန်း ${questionIndex + 1}/${gameState.questions.length}\n\n` +
    `🎯 ${answerData.question}\n\n` +
    `👤 ${escapeHtml(answerData.player.name)}: ${escapeHtml(selectedAnswer)}`,
    { parse_mode: 'HTML' }
  );
  
  // Move to next question
  gameState.currentQuestionIndex++;
  
  console.log(`   ⏳ Waiting ${RATE_LIMITS.ANSWER_TO_NEXT_QUESTION}ms before next question (rate limiting)`);
  
  setTimeout(() => {
    askQuestion(ctx, chatId);
  }, RATE_LIMITS.ANSWER_TO_NEXT_QUESTION);
});

// Show final result
async function showResult(ctx, chatId) {
  const gameState = await gameStates.get(chatId);
  
  console.log(`\n🎉 Showing final result`);
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   Total questions: ${gameState.questions.length}`);
  console.log(`   Total unique characters used: ${gameState.usedCharacters.length}`);
  console.log(`   Characters used: [${gameState.usedCharacters.join(', ')}]`);
  
  // Build the story (skip individual choices, show only final result)
  let resultText = '🎉 ဂိမ်းပြီးဆုံးပါပြီ!\n\n';
  resultText += '📖 Results:\n\n';
  
  const parts = [];
  for (let i = 0; i < gameState.questions.length; i++) {
    parts.push(gameState.answers[i].answer);
  }
  
  // Construct the sentence based on questions
  let sentence = '';
  for (let i = 0; i < gameState.questions.length; i++) {
    const question = gameState.questions[i];
    const answer = gameState.answers[i].answer;
    
    if (question === 'ဘယ်သူက') {
      sentence += answer + 'က ';
    } else if (question === 'ဘယ်သူ့ကို') {
      sentence += answer + 'ကို ';
    } else if (question === 'ဘယ်အချိန်') {
      sentence += answer + ' ';
    } else if (question === 'ဘယ်နေရာမှာ') {
      sentence += answer + ' ';
    } else if (question === 'ဘယ်သူ့ရဲ့') {
      sentence += answer + 'ရဲ့ ';
    } else if (question === 'ဘာအကြောင်း') {
      sentence += answer + ' ';
    } else if (question === 'ဘာလုပ်ပြီး') {
      sentence += answer + ' ';
    } else if (question === 'ဘယ်လိုပြော') {
      sentence += answer;
    }
  }
  
  resultText += `💬 ${sentence}\n\n`;
  resultText += '😄 ကစားပေးတဲ့အတွက် ကျေးဇူးတင်ပါတယ်!';
  
  console.log(`   Final sentence: ${sentence}`);
  
  // Add delay before sending final result (rate limiting)
  console.log(`   ⏳ Waiting ${RATE_LIMITS.QUESTION_DELAY}ms before sending result (rate limiting)`);
  await new Promise(resolve => setTimeout(resolve, RATE_LIMITS.QUESTION_DELAY));
  
  await ctx.api.sendMessage(chatId, resultText);
  
  // Clean up game state (delete from database)
  await gameStates.delete(chatId);
  console.log(`   ✅ Game cleaned up. Active games: ${await gameStates.size()}`);
}

// Error handling
bot.catch((err) => {
  console.error('\n❌ ERROR OCCURRED:');
  console.error('   Error name:', err.name);
  console.error('   Error message:', err.message);
  console.error('   Stack trace:', err.stack);
});

// Health check endpoint for Koyeb
const http = require('http');
const PORT = process.env.PORT || 3000;

const healthCheckServer = http.createServer(async (req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      bot: 'running',
      uptime: process.uptime(),
      activeGames: await gameStates.size(),
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

healthCheckServer.listen(PORT, () => {
  console.log(`\n🏥 Health check server listening on port ${PORT}`);
  console.log(`   Health endpoint: http://localhost:${PORT}/health`);
});

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  console.log(`\n⚠️  Received ${signal}, shutting down gracefully...`);
  console.log('🛑 Stopping bot...');
  
  try {
    // Stop accepting new requests
    healthCheckServer.close(() => {
      console.log('🏥 Health check server stopped');
    });
    
    // Stop bot
    await bot.stop(signal);
    console.log('✅ Bot stopped successfully');
    
    // Close database connections
    await closeDatabase();
    
    console.log('👋 Goodbye!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err.message);
    process.exit(1);
  }
  
  // Force exit after 30 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// Handle process termination signals (Koyeb uses these)
process.once('SIGINT', () => gracefulShutdown('SIGINT'));
process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('\n💥 UNCAUGHT EXCEPTION:');
  console.error('   Error:', err.message);
  console.error('   Stack:', err.stack);
  console.error('   Bot will attempt to continue...\n');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n⚠️  UNHANDLED REJECTION:');
  console.error('   Reason:', reason);
  console.error('   Promise:', promise);
  console.error('   Bot will attempt to continue...\n');
});

// Start bot with database
console.log('\n🤖 Initializing bot...');
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('📦 Node version:', process.version);

async function startBot() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Then start bot
    await bot.start();
    console.log('✅ Bot is running successfully!');
    console.log('📱 Waiting for messages...');
    console.log('🔄 Press Ctrl+C to stop gracefully\n');
  } catch (err) {
    console.error('\n❌ Failed to start bot:');
    console.error('   Error:', err.message);
    console.error('\n💡 Please check:');
    console.error('   1. BOT_TOKEN is set correctly in .env file');
    console.error('   2. Token is valid (get from @BotFather)');
    console.error('   3. Database URL is correct');
    console.error('   4. Internet connection is working\n');
    process.exit(1);
  }
}

startBot();

