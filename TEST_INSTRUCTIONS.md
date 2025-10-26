# Bot Testing Instructions

## 1️⃣ Bot Token ရယူခြင်း

1. Telegram app ကို ဖွင့်ပါ
2. [@BotFather](https://t.me/botfather) ကို search လုပ်ပါ
3. `/newbot` command ပို့ပါ
4. Bot name ပေးပါ (ဥပမာ: "My Story Game")
5. Bot username ပေးပါ (ဥပမာ: "mystorygame_bot") - **bot** နဲ့ဆုံးရမယ်
6. Token ကို copy လုပ်ပါ

## 2️⃣ Token ထည့်ခြင်း

`.env` file ကို edit လုပ်ပြီး:

```
BOT_TOKEN=သင့်ရဲ့_token_ကို_ဒီမှာထည့်ပါ
```

## 3️⃣ Bot Settings လုပ်ခြင်း

@BotFather မှာ:

```
/setjoingroups
```
- Bot ကို ရွေးပြီး **Enable** လုပ်ပါ (Groups မှာ သုံးလို့ရအောင်)

```
/setprivacy
```
- Bot ကို ရွေးပြီး **Disable** လုပ်ပါ (Group messages တွေ ဖတ်နိုင်အောင်)

## 4️⃣ Bot ကို Run ပါ

Terminal မှာ:

```bash
npm start
```

Debug logs တွေ ပေါ်လာမယ်:

```
🚀 Starting Telegram Story Game Bot...
📝 Bot Token: ✅ Found
⚙️  Rate limit settings:
   Countdown interval: 2000ms
   Question delay: 2500ms
   Game start delay: 3000ms
🤖 Initializing bot...
✅ Bot is running successfully!
📱 Waiting for messages...
```

## 5️⃣ Private Chat တွင် Test လုပ်ခြင်း

1. Telegram မှာ သင့် bot ကို search လုပ်ပါ
2. `/start` လုပ်ပါ
3. Welcome message နဲ့ buttons ပေါ်လာရမယ်

**Expected logs:**
```
📥 /start command received
   Chat Type: private
   Chat ID: 123456789
   User: Your Name (123456789)
   ➡️  Private chat - showing welcome message
```

4. "Help" button နှိပ်ကြည့်ပါ

**Expected logs:**
```
🔘 Callback: help
   User: Your Name (123456789)
```

## 6️⃣ Group တွင် Test လုပ်ခြင်း

### Group Create လုပ်ခြင်း:
1. Telegram မှာ new group create လုပ်ပါ
2. Bot ကို group မှာ ထည့်ပါ
3. Bot ကို admin အဖြစ် promote လုပ်ပါ

### Game Test လုပ်ခြင်း:

**Step 1: Game Lobby စခြင်း**
```
/start
```

**Expected logs:**
```
📥 /start command received
   Chat Type: group
   Chat ID: -100123456789
   User: Your Name (123456789)
   ➡️  Group/Channel - starting game lobby

🎮 Starting game lobby
   Chat ID: -100123456789
   Active games: 0
   ✅ Game lobby created
```

**Step 2: Players Join လုပ်ခြင်း**

"Join Game" button ကို နှိပ်ပါ (အနည်းဆုံး 4 ယောက် လိုပါတယ်)

**Expected logs (per player):**
```
🔘 Callback: join_game
   Chat ID: -100123456789
   User: Player Name (123456789)
   ✅ Player joined! Total players: 1/8
```

**Step 3: Countdown & Game Start**

30 စက္ကန့် စောင့်ပါ (သို့မဟုတ် 8 ယောက်ပြည့်ပါစေ)

**Expected logs:**
```
🚀 Starting actual game
   Chat ID: -100123456789
   Players: 4
   Player list: Player1, Player2, Player3, Player4
   Questions: ဘယ်သူက, ဘယ်သူ့ကို, ဘာအကြောင်း, ဘယ်လိုပြော
```

**Step 4: Questions တွေ ဖြေခြင်း**

မေးခွန်းတိုင်းအတွက် option ရွေးပါ

**Expected logs (per answer):**
```
❓ Asking question
   Question index: 1/4
   Question: ဘယ်သူက
   Player turn: Player1 (123456789)
   Options: Aye Thinn Kyu, Puddin, Chifuu, 🎲 ကံကောင်းပါစေ

🔘 Callback: answer selection
   Chat ID: -100123456789
   User: Player1 (123456789)
   Question index: 0, Option index: 0
   ✅ Answer selected: Taffy
```

**Dice Roll Test:**

🎲 button နှိပ်ကြည့်ပါ:

```
🎲 Dice rolled! Result: Kyaw Thiha Phyo
```

**Step 5: Final Result**

အားလုံး ဖြေပြီးရင်:

**Expected logs:**
```
🎉 Showing final result
   Chat ID: -100123456789
   Total questions: 4
   Final sentence: Aye Thinn Kyuက Puddinကို အတွင်းခံပြဲနေကြောင်း ငါးမျှားရင်းပြောတယ်
   ✅ Game cleaned up. Active games: 0
```

## 7️⃣ Different Player Counts Test လုပ်ခြင်း

### 4 Players:
- Questions: 4 (ဘယ်သူက, ဘယ်သူ့ကို, ဘာအကြောင်း, ဘယ်လိုပြော)

### 5 Players:
- Questions: 5 (+ ဘယ်နေရာမှာ)

### 6 Players:
- Questions: 6 (+ ဘယ်အချိန်)

### 7 Players:
- Questions: 7 (+ ဘယ်သူ့ရဲ့)

### 8 Players:
- Questions: 8 (+ ဘာလုပ်ပြီး)

## 8️⃣ Error Cases Test လုပ်ခြင်း

### Wrong Player နှိပ်ခြင်း:
မိမိ turn မဟုတ်ဘဲ နှိပ်ကြည့်ပါ

**Expected logs:**
```
⚠️  Wrong player! Expected: Player2
```

### Already Answered:
တခါထက်ပို နှိပ်ကြည့်ပါ

**Expected logs:**
```
⚠️  Already answered: Taffy
```

### Game Already Running:
Game တခု run နေတုန်း /start ထပ်လုပ်ကြည့်ပါ

**Expected logs:**
```
⚠️  Game already exists in this chat
```

## ✅ Success Indicators

Bot က အောင်မြင်စွာ run နေရင်:

- ✅ Private chat မှာ welcome message ပြတယ်
- ✅ Group မှာ game lobby စလို့ရတယ်
- ✅ Players join လုပ်လို့ရတယ်
- ✅ Countdown အလုပ်လုပ်တယ်
- ✅ Questions တွေ အစီအစဉ်အတိုင်း မေးတယ်
- ✅ Character questions မှာ dice option ရှိတယ်
- ✅ နောက်ဆုံးမှာ ရယ်စရာကောင်းတဲ့ စကားပုံ ပေါ်တယ်
- ✅ Debug logs တွေ အကုန် ပေါ်နေတယ်

## 🐛 Common Issues

### Issue 1: Empty token
```
Error: Empty token!
```
**Fix:** `.env` file မှာ token မှန်မှန် ထည့်ထားရမယ်

### Issue 2: Bot not responding
**Fix:** 
- Bot ကို admin လုပ်ထားရမယ်
- `/setprivacy` ကို Disable လုပ်ထားရမယ်

### Issue 3: Countdown not working
**Fix:** Console logs ကြည့်ပြီး game state စစ်ပါ

## 📊 Log Examples

Complete game flow logs ကို terminal မှာ မြင်ရမှာပါ။ အားလုံး အောင်မြင်ရင် logs က:

```
🚀 Starting Telegram Story Game Bot...
📝 Bot Token: ✅ Found
🤖 Initializing bot...
✅ Bot is running successfully!
📱 Waiting for messages...

📥 /start command received
   [... logs continue ...]
   
🎉 Showing final result
   Final sentence: [funny story here]
   ✅ Game cleaned up. Active games: 0
```

## 📊 Rate Limiting Information

Bot မှာ Telegram API rate limits မထိအောင် delays တွေ ထည့်ထားပါတယ်:

### Delays You'll Notice:

1. **Countdown Updates** - 2 စက္ကန့်ခြင်း update ဖြစ်မယ် (28s → 26s → 24s...)
2. **Game Start** - Countdown ပြီးရင် 3 စက္ကန့် စောင့်ပြီးမှ စမယ်
3. **Questions** - မေးခွန်းတိုင်းကြား 2.5 စက္ကန့် delay ရှိမယ်
4. **Next Question** - Answer ရွေးပြီးရင် 2 စက္ကန့် စောင့်ပြီးမှ မေးခွန်းသစ် ထွက်မယ်

### Rate Limit Logs:

Bot က delay လုပ်နေတိုင်း log ပြမယ်:

```
⏳ Waiting 2500ms before sending question (rate limiting)
⏳ Waiting 500ms before updating message (rate limiting)
🔄 Countdown updated: 28s, Players: 3
```

### Why Rate Limiting?

Telegram API မှာ limits ရှိပါတယ်:
- **Message edits:** 30 per second maximum
- **Same chat:** 1 message per second recommended
- **Callbacks:** Must respond within reasonable time

Bot က ဒီ limits မထိအောင် automatic delay management လုပ်ပေးပါတယ်။

### Performance:

Rate limiting ကြောင့် bot က:
- ✅ Stable ဖြစ်မယ်
- ✅ Error မတက်တော့ဘူး
- ✅ Multiple games တခါတည်း run လို့ရမယ်
- ✅ Smooth user experience

Delays တွေက သိပ်မရှည်ပါဘူး (2-3 စက္ကန့်ပဲ)၊ ဒါပေမယ့် bot stability အတွက် အရေးကြီးပါတယ်!

---

## 🔄 Duplicate Prevention Testing

Bot မှာ duplicate characters/options ရှောင်ဖို့ system ပါပါတယ်:

### Test Case 1: Character Uniqueness

**Steps:**
1. Game တခု start လုပ်ပါ (4+ players)
2. Q1 (ဘယ်သူက): Options ကို သတိထားကြည့်ပါ
3. Player က character တခု ရွေးပါ (ဥပမာ: Aye Thinn Kyu)
4. Q2 (ဘယ်သူ့ကို): Options ထဲမှာ Aye Thinn Kyu ပါရဲ့လား စစ်ပါ

**Expected:**
```
Q1 Options: Aye Thinn Kyu, Puddin, Chifuu, 🎲
Selected: Aye Thinn Kyu

Q2 Options: Gon Freecss, Ya Mone, Taffy, 🎲
(Aye Thinn Kyu မပါဘူး! ✅)
```

**Console Logs:**
```
📌 Added to used characters: Aye Thinn Kyu
Used characters so far: [Aye Thinn Kyu]
Generated options: Gon Freecss, Ya Mone, Taffy, 🎲 ကံကောင်းပါစေ
```

### Test Case 2: Dice Roll Avoids Used Characters

**Steps:**
1. Q1: Character တခု ရွေးပါ (ဥပမာ: Puddin)
2. Q2: 🎲 button ကို နှိပ်ပါ
3. Dice result ကို ကြည့်ပါ

**Expected:**
- Dice result သည် Puddin မဖြစ်သင့်ဘူး
- Console မှာ "from X unused characters" ပြမယ်

**Console Logs:**
```
🎲 Dice rolled! Result: Kyaw Thiha Phyo (from 39 unused characters)
```

### Test Case 3: Final Result Check

**Steps:**
1. Game တခု အဆုံးထိ ကစားပါ
2. Final result message ကို ဖတ်ပါ
3. Character names တွေ ထပ်ရေးနေရဲ့လား စစ်ပါ

**Expected:**
```
✅ Good: "Aye Thinn Kyu က Puddin ကို..."
❌ Bad: "Taffy က Taffy ကို..."
```

**Console Logs:**
```
Total unique characters used: 2
Characters used: [Aye Thinn Kyu, Puddin]
```

### Test Case 4: Multiple Character Questions (7-8 Players)

**Steps:**
1. 7 or 8 players ဖြင့် game start လုပ်ပါ
2. Character questions 3 ခု ရှိမယ်:
   - ဘယ်သူက
   - ဘယ်သူ့ကို
   - ဘယ်သူ့ရဲ့
3. Questions တိုင်းမှာ options ကို စစ်ပါ

**Expected:**
- Q1 selected character က Q2 options မှာ မပါ
- Q1 & Q2 selected characters က Q3 options မှာ မပါ
- Final result မှာ characters 3 ခု unique ဖြစ်မယ်

**Console Logs:**
```
Q1: Used characters so far: []
Q2: Used characters so far: [Character1]
Q3: Used characters so far: [Character1, Character2]
```

### Test Case 5: Non-Character Options

**Steps:**
1. မေးခွန်းတိုင်းအတွက် options 4 ခု ပြမယ်
2. Same question type က game တခုမှာ တခါပဲ ပေါ်တယ်
3. Options တွေ random ဖြစ်နေရဲ့လား စစ်ပါ

**Expected:**
- ဘယ်အချိန်: 10 options ထဲက random 4 ခု
- ဘယ်နေရာမှာ: 10 options ထဲက random 4 ခု
- Options တွေ game တိုင်း ကွဲပြားမယ်

### Verification Checklist:

Game တိုင်းမှာ:
- [ ] Character questions မှာ same character ထပ်မပေါ်
- [ ] Dice roll က used characters ရှောင်တယ်
- [ ] Final result မှာ duplicate names မရှိ
- [ ] Console logs မှာ "Added to used characters" ပြတယ်
- [ ] "Used characters so far" list က update ဖြစ်တယ်
- [ ] Options တွေ random ဖြစ်တယ်

### Common Issues:

**Issue:** "Only X characters left, reusing some"
- **Cause:** 40 characters နဲ့ options 3 ခုပဲ ပြတာမို့ မဖြစ်နိုင်ပါ
- **Normal:** This shouldn't happen in regular gameplay

**Issue:** Dice rolled same character
- **Check:** Console log ကို ကြည့်ပါ
- **If:** "all characters already used, allowing reuse" ပြရင် normal ပါ

အသေးစိတ် technical details: `DUPLICATE_PREVENTION.md`

---

Happy testing! 🎮


