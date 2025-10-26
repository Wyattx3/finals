# Duplicate Prevention System

Bot မှာ options ထပ်မရွေးအောင် smart tracking system ပါဝင်ပါတယ်။

## 🎯 Problem

**Before:**
- Characters က တခါတည်း multiple questions မှာ ပေါ်နိုင်တယ်
- "Taffy က Taffy ကို" လို duplicate names ဖြစ်နိုင်တယ်
- Same options တွေ ထပ်ခါထပ်ခါ ပေါ်လာတတ်တယ်

**Example (Bad):**
```
Q1: ဘယ်သူက
Options: Taffy, Puddin, Chifuu, 🎲
Answer: Taffy

Q2: ဘယ်သူ့ကို
Options: Taffy, Ya Mone, Gon Freecss, 🎲  ← Taffy ထပ်ပေါ်တယ်!
Answer: Taffy

Result: "Taffy က Taffy ကို..." ← Duplicate!
```

## ✅ Solution

### 1. Used Characters Tracking

**Game State:**
```javascript
gameState = {
  usedCharacters: [],    // Characters that have been selected
  usedOptions: {}        // Options used per question type
}
```

**How it works:**
1. Player က character တခု ရွေးတယ်
2. Bot က အဲ့ character ကို `usedCharacters` array မှာ ထည့်တယ်
3. နောက် question မှာ option generate လုပ်တဲ့အခါ used characters တွေကို filter out လုပ်တယ်

### 2. Smart Option Generation

**Character Questions (ဘယ်သူက, ဘယ်သူ့ကို, ဘယ်သူ့ရဲ့):**

```javascript
function getRandomOptions(question, usedCharacters = [], usedOptions = {}) {
  if (isCharacterQuestion(question)) {
    // Filter out already used characters
    const availableCharacters = CHARACTERS.filter(
      char => !usedCharacters.includes(char)
    );
    
    // Shuffle and take 3
    const shuffled = [...availableCharacters].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    return selected.concat(['🎲 ကံကောင်းပါစေ']);
  }
}
```

**Non-Character Questions:**

```javascript
else {
  // Track per question type (e.g., "ဘယ်အချိန်" used different from "ဘယ်နေရာမှာ")
  const usedForThisQuestion = usedOptions[question] || [];
  const availableOptions = allOptions.filter(
    opt => !usedForThisQuestion.includes(opt)
  );
  
  // Shuffle and take 4
  const shuffled = [...availableOptions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
}
```

### 3. Dice Roll Enhancement

**Before:**
```javascript
if (selectedAnswer === '🎲 ကံကောင်းပါစေ') {
  selectedAnswer = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}
```

**After:**
```javascript
if (selectedAnswer === '🎲 ကံကောင်းပါစေ') {
  // Try to get unused character first
  const availableForDice = CHARACTERS.filter(
    char => !gameState.usedCharacters.includes(char)
  );
  
  if (availableForDice.length > 0) {
    selectedAnswer = availableForDice[Math.floor(Math.random() * availableForDice.length)];
  } else {
    // All used, pick any
    selectedAnswer = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  }
}
```

## 📊 Example Flow

### 8-Player Game (Maximum Character Questions):

**Questions:**
1. ဘယ်သူက
2. ဘယ်သူ့ကို
3. ဘယ်အချိန်
4. ဘယ်နေရာမှာ
5. ဘယ်သူ့ရဲ့
6. ဘာအကြောင်း
7. ဘာလုပ်ပြီး
8. ဘယ်လိုပြော

**Character Questions:** 3 out of 8 (Q1, Q2, Q5)

### Detailed Example:

**Q1: ဘယ်သူက**
```
Used characters: []
Available: All 40 characters
Options shown: Aye Thinn Kyu, Puddin, Chifuu, 🎲
Player selects: Aye Thinn Kyu
Used characters: [Aye Thinn Kyu]
```

**Q2: ဘယ်သူ့ကို**
```
Used characters: [Aye Thinn Kyu]
Available: 39 characters (excluding Aye Thinn Kyu)
Options shown: Gon Freecss, Ya Mone, Taffy, 🎲
Player selects: 🎲
Dice rolls from 39 available → Result: Emilymore
Used characters: [Aye Thinn Kyu, Emilymore]
```

**Q3: ဘယ်အချိန်**
```
Used options for "ဘယ်အချိန်": []
Available: All 10 time options
Options shown: 4 random time options
Player selects: မင်္ဂလာမဆောင်ခင်ငါးမိနစ်အလို
Used options["ဘယ်အချိန်"]: [မင်္ဂလာမဆောင်ခင်ငါးမိနစ်အလို]
```

**Q4: ဘယ်နေရာမှာ**
```
Used options for "ဘယ်နေရာမှာ": []
Available: All 10 location options
Options shown: 4 random location options
Player selects: အိမ်သာထဲမှာ
Used options["ဘယ်နေရာမှာ"]: [အိမ်သာထဲမှာ]
```

**Q5: ဘယ်သူ့ရဲ့**
```
Used characters: [Aye Thinn Kyu, Emilymore]
Available: 38 characters
Options shown: Kyaw Thiha Phyo, Lone, Chuu, 🎲
Player selects: Kyaw Thiha Phyo
Used characters: [Aye Thinn Kyu, Emilymore, Kyaw Thiha Phyo]
```

**Q6-Q8:** Similar tracking for non-character questions

**Final Result:**
```
"Aye Thinn Kyu က Emilymore ကို မင်္ဂလာမဆောင်ခင်ငါးမိနစ်အလို အိမ်သာထဲမှာ 
Kyaw Thiha Phyo ရဲ့ [something] [something] [something]"
```

✅ **No duplicate characters!**

## 🔧 Edge Cases

### Case 1: Not Enough Available Characters

**Scenario:** 7 character questions in a game but only 6 questions per game
- **Solution:** Should never happen with proper game design
- **Fallback:** If < 3 available, reuse characters with warning log

```javascript
if (availableCharacters.length < 3) {
  console.log(`⚠️  Only ${availableCharacters.length} characters left, reusing some`);
}
```

### Case 2: All Characters Used (Dice Roll)

**Scenario:** Dice rolled when all characters already used
- **Solution:** Allow reuse from full character list
- **Log:** Special message indicating reuse

```javascript
console.log(`🎲 Dice rolled! Result: ${selectedAnswer} (all characters already used, allowing reuse)`);
```

### Case 3: Not Enough Options for Question Type

**Scenario:** 10 options available but need 4 for multiple rounds
- **Current:** Each question type has 10 options, need max 4
- **Max games:** Can have 2-3 games before repeating
- **Solution:** Reset on new game (each game has fresh usedOptions)

### Case 4: Multiple Games in Same Chat

**Scenario:** Play game 2, 3, 4... in same chat
- **Solution:** Each game creates fresh gameState
- **Used characters:** Reset for each game
- **No carryover:** Previous game's selections don't affect new game

## 📈 Statistics

### Character Usage:

**4-Player Game:**
- Character questions: 2 (ဘယ်သူက, ဘယ်သူ့ကို)
- Characters used: 2
- Available pool: 40 characters
- **Duplicate risk: 0%** (98% still unused)

**7-Player Game:**
- Character questions: 3 (ဘယ်သူက, ဘယ်သူ့ကို, ဘယ်သူ့ရဲ့)
- Characters used: 3
- Available pool: 40 characters
- **Duplicate risk: 0%** (92.5% still unused)

**8-Player Game:**
- Character questions: 3 (same as 7)
- Characters used: 3
- Available pool: 40 characters
- **Duplicate risk: 0%** (92.5% still unused)

### Non-Character Options:

Each question type has **10 options**, displaying **4 at a time**:
- First question: 10 available → show 4
- If same question type repeats: 6 available → show 4
- **Maximum repeat:** 2 times safely (10 options / 4 shown = 2.5)

But in our game:
- **Each question type appears max 1 time per game**
- ဘယ်အချိန်, ဘယ်နေရာမှာ, etc. only appear once
- **Duplicate risk: 0%**

## 🎮 Console Logs

### During Game:

**Question Generation:**
```
❓ Asking question
   Question index: 2/4
   Question: ဘယ်သူ့ကို
   Player turn: Player2 (123456789)
   Used characters so far: [Aye Thinn Kyu]
   Generated options: Gon Freecss, Ya Mone, Taffy, 🎲 ကံကောင်းပါစေ
```

**After Selection:**
```
🔘 Callback: answer selection
   ✅ Answer selected: Gon Freecss
   📌 Added to used characters: Gon Freecss
```

**Dice Roll:**
```
🔘 Callback: answer selection
   Question index: 1, Option index: 3
   🎲 Dice rolled! Result: Emilymore (from 38 unused characters)
   ✅ Answer selected: Emilymore
   📌 Added to used characters: Emilymore
```

**Final Summary:**
```
🎉 Showing final result
   Chat ID: -100123456789
   Total questions: 4
   Total unique characters used: 2
   Characters used: [Aye Thinn Kyu, Gon Freecss]
   Final sentence: Aye Thinn Kyu က Gon Freecss ကို...
```

## ✅ Benefits

1. **No More "Taffy က Taffy" Situations**
   - Characters can't be selected multiple times
   - Each character question gets unique characters

2. **Better Variety**
   - 40 characters, typically use 2-3 per game
   - Different characters every time

3. **Smarter Dice Rolls**
   - Dice avoids already-used characters
   - Only reuses if absolutely necessary

4. **Tracked Per Question Type**
   - ဘယ်အချိန် options independent from ဘယ်နေရာမှာ
   - No cross-contamination

5. **Automatic & Transparent**
   - Works behind the scenes
   - Detailed logs show what's happening
   - No user intervention needed

## 🔍 Testing

### Test Case 1: Basic Game
```
1. Start 4-player game
2. Q1 (ဘယ်သူက): Check options don't include previously selected
3. Q2 (ဘယ်သူ့ကို): Verify no characters from Q1
4. Check logs for "Added to used characters"
5. Verify final result has different characters
```

### Test Case 2: Dice Roll
```
1. Q1: Select character A
2. Q2: Press 🎲 button
3. Check logs: Should say "from X unused characters"
4. Verify dice result ≠ character A
```

### Test Case 3: Multiple Games
```
1. Play game 1, use characters A, B
2. Play game 2 in same chat
3. Verify A and B can appear again (fresh start)
```

### Expected Results:
- ✅ No duplicate characters in same game
- ✅ All character options are unique per question
- ✅ Dice respects used characters
- ✅ Fresh start for each new game

---

**Implementation Status:** ✅ Complete  
**Tested:** Ready for testing  
**Edge Cases:** Handled with fallbacks

