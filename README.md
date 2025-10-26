# Telegram Story Game Bot

စကားပုံပြောပွဲ ဂိမ်းကစားနိုင်တဲ့ Telegram Bot တခုဖြစ်ပါတယ်။

## Features

- 🎮 Group/Channel မှာ game lobby ဖွင့်နိုင်ပါတယ်
- 👥 4-8 ယောက်အထိ ကစားနိုင်ပါတယ်
- ⏰ 30 စက္ကန့် countdown ပြီးရင် game အလိုအလျောက် စပါမယ်
- 🎲 Character မေးခွန်းတွေမှာ dice roll လုပ်လို့ရပါတယ်
- 😄 ပွဲအဆုံးမှာ ရယ်စရာကောင်းတဲ့ စကားပုံ ထွက်လာပါမယ်
- 📊 **Debug logs** - Real-time logging အပြည့်အစုံ ပါဝင်ပါတယ်
- ⚡ **Rate limiting** - Telegram API limits မထိအောင် automatic delay management
- ♻️ **Smart option selection** - Use ပြီးသား characters/options တွေကို ထပ်မရွေးပေးတော့ဘူး (duplicate ရှောင်ပါတယ်)
- 📱 **Button text optimization** - ရှည်တဲ့ text တွေကို button မှာ auto-truncate လုပ်ပြီး readable ဖြစ်အောင် ပြပါတယ်
- 🔔 **Player mention system** - Player ရဲ့ turn ရောက်ရင် username mention လုပ်ပြီး notification ပို့ပေးပါတယ်
- 🔀 **Random turn order** - Game စတဲ့အခါ player order ကို shuffle လုပ်ပြီး lobby join order နဲ့ မတူအောင် လုပ်ပါတယ်

## Installation

1. Node.js install လုပ်ပါ (version 16 နဲ့ အထက်)

2. Dependencies တွေ install လုပ်ပါ:
```bash
npm install
```

3. `.env` file တခု create လုပ်ပြီး bot token ထည့်ပါ:
```
BOT_TOKEN=your_bot_token_here
```

## Getting Bot Token

1. Telegram မှာ [@BotFather](https://t.me/botfather) ကို ရှာပါ
2. `/newbot` command ပို့ပါ
3. Bot အမည် နဲ့ username ပေးပါ
4. Bot token ကို ကူးယူပြီး `.env` file မှာ ထည့်ပါ

## Running the Bot

### Local Development

```bash
npm start
```

သို့မဟုတ်

```bash
node bot.js
```

### Production Deployment (Koyeb)

Bot က production-ready ဖြစ်ပြီး Koyeb မှာ deploy လုပ်နိုင်ပါပြီ:

- ✅ Graceful shutdown handling (SIGTERM/SIGINT)
- ✅ Health check endpoint (`/health`)
- ✅ Error recovery (uncaught exceptions, unhandled rejections)
- ✅ Auto-restart on failures
- ✅ Process monitoring and logging

**Koyeb မှာ deploy လုပ်ဖို့:**

အသေးစိတ် instructions အတွက် [DEPLOYMENT.md](DEPLOYMENT.md) ကို ဖတ်ပါ။

Quick steps:
1. Koyeb account ဖွင့်ပါ
2. GitHub repository connect လုပ်ပါ
3. Environment variable `BOT_TOKEN` ထည့်ပါ
4. Deploy button နှိပ်ပါ!

Bot က 24/7 run နေမှာပါ! 🚀

## How to Use

### Private Chat မှာ

1. Bot ကို message ပို့ပါ
2. `/start` command လုပ်ပါ
3. "Add to Group" သို့မဟုတ် "Help" ကို နှိပ်ပါ

### Group/Channel မှာ

1. Bot ကို group/channel မှာ admin အဖြစ် ထည့်ပါ
2. `/start` command လုပ်ပြီး game lobby စပါ
3. "Join Game" နှိပ်ပြီး ပွဲဝင်ပါ (4-8 ယောက်)
4. Countdown ပြီးရင် သို့မဟုတ် 8 ယောက်ပြည့်ရင် game စပါမယ်
5. မေးခွန်းတိုင်းအတွက် ရွေးချယ်မှုလုပ်ပါ
6. အားလုံးရွေးပြီးရင် စકားပုံတခု ပေါ်လာမှာပါ!

## Game Rules

Player အရေအတွက်အလိုက် မေးခွန်းတွေ ကွဲပြားပါတယ်:

- **4 ယောက်**: ဘယ်သူက, ဘယ်သူ့ကို, ဘာအကြောင်း, ဘယ်လိုပြော
- **5 ယောက်**: + ဘယ်နေရာမှာ
- **6 ယောက်**: + ဘယ်အချိန်
- **7 ယောက်**: + ဘယ်သူ့ရဲ့
- **8 ယောက်**: + ဘာလုပ်ပြီး

## Character Names

Bot မှာ အသုံးပြုထားတဲ့ character names (40 characters):

- Aye Thinn Kyu, Aye Myat Swe, Aye Sin Sin Lin, Alvina Mine
- Aung Khant Ko, Aye Chan Ko Ko, Chifuu, Chuu
- Dora Honey, Emilymore, Gon Freecss, Htet Lae Mon Soe
- Htet Wai Yan, AhHnin, Jel Jel, Kyaw Thiha Phyo
- Kyaw Htut Lynn, Kyaw Su Thawy, Kay Kabyar, Kaythari
- Lone, Luneth, Nang Shwe Yamin Oo, Nay Ma Nyo
- May Myat Noe Khin, Myo Zarni Kyaw, Myat Min Thar, Maung Kaung
- Myat Thura Kyaw, Puddin, Phyoei, PhoneMyat Hein
- Sai Sai, Thura Kaung Maw, Taffy, Wint
- Wyatt, Yu Ya Hlaing, Ya Mone, Zue May Thaw

## Example Result

```
Taffyက Ya Moneကို အကင်ကင်နေတဲ့အချိန် သစ်ပင်ပေါ်မှာ Chifuuရဲ့ အတွင်းခံပြဲနေကြောင်း ဟင်းချက်ရင်း ငါးမျှားရင်းပြောတယ်

သို့မဟုတ်

Aye Thinn Kyuက Puddinကို ညသန်းခေါင်ယံအချိန် အိမ်သာထဲမှာ Gon Freecssရဲ့ ကိုယ်ဝန်ရတဲ့အကြောင်း ဖတ်နမ်းပြီး ရေကူးရင်းပြောတယ်
```

## Testing

Bot မှာ comprehensive testing system ပါဝင်ပါတယ်:

### Automated Tests:

```bash
# Run all automated tests
npm test

# Or directly
node test-bot.js
```

**Tests Include:**
- ✅ Character names loading (40 characters)
- ✅ Questions by player count (4-8 players)
- ✅ Character question detection
- ✅ Duplicate prevention logic
- ✅ Username handling (emojis, unicode, special chars)
- ✅ Rate limiting configuration
- ✅ Story building logic
- ✅ Edge cases

### Manual Testing:

Real Telegram bot testing အတွက်:

```bash
# 1. Set your bot token
echo "BOT_TOKEN=your_token_here" > .env

# 2. Run bot
npm start

# 3. Follow testing guides
# - TEST_INSTRUCTIONS.md (comprehensive guide)
# - USERNAME_TESTING.md (username-specific tests)
```

### Test Results:

```
🧪 Starting Bot Tests...

📝 Test 1: Character Names ✅ PASS
📝 Test 2: Questions by Player Count ✅ PASS
📝 Test 3: Character Question Detection ✅ PASS
📝 Test 4: Duplicate Prevention ✅ PASS
📝 Test 5: Username Handling ✅ PASS
📝 Test 6: Rate Limiting Configuration ✅ PASS
📝 Test 7: Story Building Logic ✅ PASS
📝 Test 8: Edge Cases ✅ PASS

✅ All core logic tests passed!
```

### Username Support:

Bot က username အမျိုးမျိုးကို support လုပ်ပါတယ်:

- ✅ Standard names (John Doe)
- ✅ Myanmar unicode (မောင်မောင် ကျော်)
- ✅ Emojis (😀 Happy User)
- ✅ Special characters (User_123)
- ✅ Long names (auto-truncate)
- ✅ Empty names (fallback to "Anonymous")
- ✅ All international scripts (Thai, Japanese, Arabic, etc.)

အသေးစိတ်: `USERNAME_TESTING.md`

## Dependencies

- `grammy`: Telegram Bot Framework
- `dotenv`: Environment variable management

## License

ISC

## Rate Limiting

Bot မှာ Telegram API rate limits မထိအောင် automatic delay management system ပါဝင်ပါတယ်:

### Default Settings:

```javascript
COUNTDOWN_INTERVAL: 2000ms        // Countdown updates every 2 seconds
QUESTION_DELAY: 2500ms            // 2.5s wait before sending each question
GAME_START_DELAY: 3000ms          // 3s wait before game starts
ANSWER_TO_NEXT_QUESTION: 2000ms   // 2s wait after answer before next question
CALLBACK_RESPONSE_DELAY: 100ms    // Small delay for callbacks
MESSAGE_EDIT_DELAY: 500ms         // Delay between message edits
```

### အလုပ်လုပ်ပုံ:

1. **Countdown Updates** - 1 စက္ကန့်မှ 2 စက္ကန့်ကို ပြောင်းထားတာကြောင့် edit requests လျော့သွားမယ်
2. **Question Sending** - မေးခွန်းတိုင်းကြား 2.5 စက္ကန့် စောင့်မယ်
3. **Message Edits** - Edit တိုင်းမှာ 500ms minimum delay ရှိမယ်
4. **Callback Responses** - Callback တိုင်းမှာ small delay ထည့်ထားမယ်
5. **Intelligent Throttling** - လူတွေ အများကြီး join လုပ်ရင် automatic throttling လုပ်မယ်

### Benefits:

- ✅ API rate limit errors မရှိတော့ဘူး
- ✅ Bot stable ဖြစ်မယ်
- ✅ Multiple games တခါတည်း run လို့ရမယ်
- ✅ User experience ပိုကောင်းမယ် (spam မခံရဘူး)

### Customization:

Rate limit values တွေကို `bot.js` ရဲ့ `RATE_LIMITS` object မှာ ပြောင်းလို့ရပါတယ်။

## Smart Duplicate Prevention

Bot မှာ use ပြီးသား characters/options တွေကို tracking လုပ်ပြီး duplicate ရှောင်ပါတယ်:

### How It Works:

**Character Questions (ဘယ်သူက, ဘယ်သူ့ကို, ဘယ်သူ့ရဲ့):**
- Player တယောက် character တခု ရွေးပြီးရင် အဲ့ character ကို track လုပ်မယ်
- နောက် character question မှာ used characters တွေ မပေါ်တော့ဘူး
- **"Taffy က Taffy ကို"** လို duplicate names မဖြစ်တော့ဘူး! ✅

**Example:**
```
Q1: ဘယ်သူက → Player selects: Aye Thinn Kyu
Q2: ဘယ်သူ့ကို → Options will NOT include Aye Thinn Kyu
Result: Unique characters only! 
```

**Dice Roll (🎲 ကံကောင်းပါစေ):**
- Dice roll လုပ်ရင် unused characters ထဲကနေပဲ ရွေးမယ်
- Already used characters ကို တတ်နိုင်သလောက် ရှောင်မယ်

**Non-Character Options:**
- မေးခွန်းတိုင်းအတွက် options တွေ random ဖြစ်တယ်
- Same question type ထပ်မေးရင် used options မပါတော့ဘူး

### Benefits:
- ✅ No duplicate characters (Taffy က Taffy situation မဖြစ်တော့)
- ✅ More variety (40 characters, use 2-3 per game)
- ✅ Smarter dice rolls
- ✅ Better story results

အသေးစိတ်ကို `DUPLICATE_PREVENTION.md` မှာ ကြည့်ပါ။

## Debug Logs

Bot က comprehensive logging system တခု ပါဝင်ပါတယ်:

### Log Types:
- 🚀 **Startup logs** - Bot initialization နဲ့ token validation
- 📥 **Command logs** - /start command နဲ့ user info
- 🔘 **Callback logs** - Button interactions အားလုံး
- 🎮 **Game logs** - Game state changes, player joins
- ❓ **Question logs** - မေးခွန်းတိုင်း၊ options၊ player turns
- ✅ **Answer logs** - Player answers, dice rolls
- 🎉 **Result logs** - Final story generation
- ❌ **Error logs** - အသေးစိတ် error information

### Example Output:
```
🚀 Starting Telegram Story Game Bot...
📝 Bot Token: ✅ Found
🤖 Initializing bot...
✅ Bot is running successfully!
📱 Waiting for messages...

📥 /start command received
   Chat Type: group
   Chat ID: -100123456789
   User: John (123456789)
   ➡️  Group/Channel - starting game lobby

🎮 Starting game lobby
   Chat ID: -100123456789
   Active games: 0
   ✅ Game lobby created
```

### Testing

အသေးစိတ် testing instructions အတွက် `TEST_INSTRUCTIONS.md` file ကို ကြည့်ပါ။

```bash
# Run bot with logs
npm start

# Logs တွေ terminal မှာ real-time ပြမှာပါ
```

## Support

အကူအညီလိုရင် bot ရဲ့ Help section ကို ကြည့်ပါ သို့မဟုတ် developer ကို ဆက်သွယ်ပါ။

---

Made with ❤️ for fun!

