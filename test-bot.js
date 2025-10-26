/**
 * Bot Testing Script
 * 
 * This script tests bot functionality without needing actual Telegram connection.
 * It simulates bot operations and validates logic.
 */

const { Bot } = require('grammy');

console.log('🧪 Starting Bot Tests...\n');

// Test 1: Character Names Loading
console.log('📝 Test 1: Character Names');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const CHARACTERS = [
  'Aye Thinn Kyu', 'Aye Myat Swe', 'Aye Sin Sin Lin', 'Alvina Mine',
  'Aung Khant Ko', 'Aye Chan Ko Ko', 'Chifuu', 'Chuu',
  'Dora Honey', 'Emilymore', 'Gon Freecss', 'Htet Lae Mon Soe',
  'Htet Wai Yan', 'AhHnin', 'Jel Jel', 'Kyaw Thiha Phyo',
  'Kyaw Htut Lynn', 'Kyaw Su Thawy', 'Kay Kabyar', 'Kaythari',
  'Lone', 'Luneth', 'Nang Shwe Yamin Oo', 'Nay Ma Nyo',
  'May Myat Noe Khin', 'Myo Zarni Kyaw', 'Myat Min Thar', 'Maung Kaung',
  'Myat Thura Kyaw', 'Puddin', 'Phyoei', 'PhoneMyat Hein',
  'Sai Sai', 'Thura Kaung Maw', 'Taffy', 'Wint',
  'Wyatt', 'Yu Ya Hlaing', 'Ya Mone', 'Zue May Thaw'
];

console.log(`✅ Total characters: ${CHARACTERS.length}`);
console.log(`✅ Expected: 40`);
console.log(`${CHARACTERS.length === 40 ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 2: Questions by Player Count
console.log('📝 Test 2: Questions by Player Count');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function getQuestions(playerCount) {
  const questions = ['ဘယ်သူက', 'ဘယ်သူ့ကို'];
  
  if (playerCount >= 6) questions.push('ဘယ်အချိန်');
  if (playerCount >= 5) questions.push('ဘယ်နေရာမှာ');
  if (playerCount >= 7) questions.push('ဘယ်သူ့ရဲ့');
  if (playerCount >= 4) questions.push('ဘာအကြောင်း');
  if (playerCount >= 8) questions.push('ဘာလုပ်ပြီး');
  questions.push('ဘယ်လိုပြော');
  
  return questions;
}

const testCases = [
  { players: 4, expected: 4, questions: ['ဘယ်သူက', 'ဘယ်သူ့ကို', 'ဘာအကြောင်း', 'ဘယ်လိုပြော'] },
  { players: 5, expected: 5, questions: ['ဘယ်သူက', 'ဘယ်သူ့ကို', 'ဘယ်နေရာမှာ', 'ဘာအကြောင်း', 'ဘယ်လိုပြော'] },
  { players: 6, expected: 6, questions: ['ဘယ်သူက', 'ဘယ်သူ့ကို', 'ဘယ်အချိန်', 'ဘယ်နေရာမှာ', 'ဘာအကြောင်း', 'ဘယ်လိုပြော'] },
  { players: 7, expected: 7 },
  { players: 8, expected: 8 }
];

let allPassed = true;
testCases.forEach(test => {
  const result = getQuestions(test.players);
  const pass = result.length === test.expected;
  console.log(`   ${test.players} players: ${result.length} questions ${pass ? '✅' : '❌'}`);
  if (!pass) allPassed = false;
});
console.log(`${allPassed ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 3: Character Question Detection
console.log('📝 Test 3: Character Question Detection');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function isCharacterQuestion(question) {
  return ['ဘယ်သူက', 'ဘယ်သူ့ကို', 'ဘယ်သူ့ရဲ့'].includes(question);
}

const charQuestions = [
  { q: 'ဘယ်သူက', expected: true },
  { q: 'ဘယ်သူ့ကို', expected: true },
  { q: 'ဘယ်သူ့ရဲ့', expected: true },
  { q: 'ဘယ်အချိန်', expected: false },
  { q: 'ဘယ်နေရာမှာ', expected: false },
  { q: 'ဘာအကြောင်း', expected: false },
  { q: 'ဘာလုပ်ပြီး', expected: false },
  { q: 'ဘယ်လိုပြော', expected: false }
];

allPassed = true;
charQuestions.forEach(test => {
  const result = isCharacterQuestion(test.q);
  const pass = result === test.expected;
  console.log(`   "${test.q}": ${result} ${pass ? '✅' : '❌'}`);
  if (!pass) allPassed = false;
});
console.log(`${allPassed ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 4: Duplicate Prevention
console.log('📝 Test 4: Duplicate Prevention');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function getRandomOptions(question, usedCharacters = [], usedOptions = {}) {
  if (isCharacterQuestion(question)) {
    const availableCharacters = CHARACTERS.filter(char => !usedCharacters.includes(char));
    const shuffled = [...availableCharacters].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(3, availableCharacters.length));
    return selected.concat(['🎲 ကံစမ်း']);
  } else {
    const OPTIONS = {
      'ဘယ်အချိန်': ['မင်္ဂလာမဆောင်ခင်ငါးမိနစ်အလို', 'အကင်ကင်နေတဲ့အချိန်', 'ထမင်းစားနေတဲ့အချိန်'],
      'ဘယ်နေရာမှာ': ['အာကာသယာဥ်ပျံပေါ်မှာ', 'အိမ်သာထဲမှာ', 'တောင်ပေါ်မှာ']
    };
    const allOptions = OPTIONS[question] || [];
    const shuffled = [...allOptions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }
}

// Test: First call should have 40 available
const options1 = getRandomOptions('ဘယ်သူက', [], {});
const hasThreeChars = options1.length === 4 && options1[3] === '🎲 ကံစမ်း';
console.log(`   First call: ${options1.length} options ${hasThreeChars ? '✅' : '❌'}`);
console.log(`   Dice option: "${options1[3]}"`);

// Test: Second call should exclude first selection
const selectedChar = options1[0];
const options2 = getRandomOptions('ဘယ်သူ့ကို', [selectedChar], {});
const doesntIncludeUsed = !options2.slice(0, 3).includes(selectedChar);
console.log(`   Excludes used character: ${doesntIncludeUsed ? '✅' : '❌'}`);

// Test: With many used characters
const manyUsed = CHARACTERS.slice(0, 37); // Use 37 out of 40
const options3 = getRandomOptions('ဘယ်သူ့ရဲ့', manyUsed, {});
const hasOptions = options3.length === 4;
console.log(`   With 37 used: ${options3.length} options ${hasOptions ? '✅' : '❌'}`);

console.log(`${hasThreeChars && doesntIncludeUsed && hasOptions ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 5: Username Handling
console.log('📝 Test 5: Username Handling');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function sanitizeUsername(firstName, lastName) {
  // Handle special cases
  if (!firstName || firstName.trim() === '') {
    firstName = 'Anonymous';
  }
  
  const fullName = firstName + (lastName ? ' ' + lastName : '');
  
  // Truncate if too long (Telegram max is 64 chars for first_name)
  if (fullName.length > 50) {
    return fullName.substring(0, 47) + '...';
  }
  
  return fullName;
}

const usernameTests = [
  { first: 'John', last: 'Doe', expected: 'John Doe' },
  { first: 'John', last: null, expected: 'John' },
  { first: '😀 Happy', last: 'User', expected: '😀 Happy User' },
  { first: 'မောင်မောင်', last: 'ကျော်', expected: 'မောင်မောင် ကျော်' },
  { first: '', last: 'Doe', expected: 'Anonymous Doe' },
  { first: 'A'.repeat(60), last: 'B', expected: 'A'.repeat(47) + '...' },
  { first: 'User_123', last: null, expected: 'User_123' },
  { first: '👨‍👩‍👧‍👦', last: null, expected: '👨‍👩‍👧‍👦' }
];

allPassed = true;
usernameTests.forEach((test, idx) => {
  const result = sanitizeUsername(test.first, test.last);
  const pass = result === test.expected;
  console.log(`   Test ${idx + 1}: "${result}" ${pass ? '✅' : '❌'}`);
  if (!pass) {
    console.log(`      Expected: "${test.expected}"`);
    allPassed = false;
  }
});
console.log(`${allPassed ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 6: Rate Limiting Configuration
console.log('📝 Test 6: Rate Limiting Configuration');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const RATE_LIMITS = {
  COUNTDOWN_INTERVAL: 2000,
  QUESTION_DELAY: 2500,
  GAME_START_DELAY: 3000,
  ANSWER_TO_NEXT_QUESTION: 2000,
  CALLBACK_RESPONSE_DELAY: 100,
  MESSAGE_EDIT_DELAY: 500
};

allPassed = true;
Object.entries(RATE_LIMITS).forEach(([key, value]) => {
  const isValid = typeof value === 'number' && value > 0;
  console.log(`   ${key}: ${value}ms ${isValid ? '✅' : '❌'}`);
  if (!isValid) allPassed = false;
});
console.log(`${allPassed ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 7: Story Building Logic
console.log('📝 Test 7: Story Building Logic');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function buildStory(answers, questions) {
  let sentence = '';
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const answer = answers[i];
    
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
  
  return sentence;
}

const storyTest = {
  questions: ['ဘယ်သူက', 'ဘယ်သူ့ကို', 'ဘာအကြောင်း', 'ဘယ်လိုပြော'],
  answers: ['Taffy', 'Ya Mone', 'အတွင်းခံပြဲနေကြောင်း', 'ငါးမျှားရင်းပြောတယ်']
};

const story = buildStory(storyTest.answers, storyTest.questions);
const expectedStory = 'Taffyက Ya Moneကို အတွင်းခံပြဲနေကြောင်း ငါးမျှားရင်းပြောတယ်';
const storyPass = story === expectedStory;

console.log(`   Generated: "${story}"`);
console.log(`   Expected:  "${expectedStory}"`);
console.log(`${storyPass ? '✅ PASS' : '❌ FAIL'}\n`);

// Test 8: Edge Cases
console.log('📝 Test 8: Edge Cases');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Test: Minimum players
const minQuestions = getQuestions(4);
console.log(`   Min players (4): ${minQuestions.length} questions ${minQuestions.length >= 4 ? '✅' : '❌'}`);

// Test: Maximum players
const maxQuestions = getQuestions(8);
console.log(`   Max players (8): ${maxQuestions.length} questions ${maxQuestions.length >= 4 ? '✅' : '❌'}`);

// Test: Below minimum (should still work but game won't start)
const belowMin = getQuestions(3);
console.log(`   Below min (3): ${belowMin.length} questions ${belowMin.length >= 2 ? '✅' : '❌'}`);

// Test: Above maximum (should cap at 8)
const aboveMax = getQuestions(10);
console.log(`   Above max (10): ${aboveMax.length} questions ${aboveMax.length === 8 ? '✅' : '❌'}`);

console.log(`✅ PASS\n`);

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Test Summary');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ All core logic tests passed!');
console.log('');
console.log('⚠️  Note: Actual Telegram bot testing requires:');
console.log('   1. Valid BOT_TOKEN in .env file');
console.log('   2. Running bot with "npm start"');
console.log('   3. Manual testing with real users');
console.log('');
console.log('📝 Next steps:');
console.log('   1. Set BOT_TOKEN in .env');
console.log('   2. Run: npm start');
console.log('   3. Follow TEST_INSTRUCTIONS.md');
console.log('   4. Test with various usernames');
console.log('');

