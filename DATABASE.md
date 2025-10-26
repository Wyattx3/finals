# 🗄️ Database Architecture

Bot က PostgreSQL database သုံးပြီး game states တွေကို persistent storage မှာ သိမ်းထားပါတယ်။

## 📊 Database Schema

### 1. `games` Table

Game lobby နဲ့ game state information:

```sql
CREATE TABLE games (
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
```

**Fields:**
- `chat_id`: Telegram chat ID (unique per game)
- `status`: 'lobby' | 'playing' | 'finished'
- `player_count`: လက်ရှိ players အရေအတွက်
- `current_question_index`: လက်ရှိ မေးခွန်း index
- `game_started`: Game စပြီးရဲ့လား

### 2. `game_players` Table

Players list နဲ့ turn order:

```sql
CREATE TABLE game_players (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  username VARCHAR(255),
  join_order INTEGER,
  turn_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_id, user_id)
)
```

**Fields:**
- `game_id`: Games table ကို reference လုပ်တယ်
- `user_id`: Telegram user ID
- `username`: Player name (with emojis support)
- `join_order`: Join လုပ်တဲ့ order (0, 1, 2, ...)
- `turn_order`: Shuffled turn order for questions

### 3. `game_answers` Table

Player choices/answers:

```sql
CREATE TABLE game_answers (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  question VARCHAR(255),
  user_id BIGINT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_id, question_index)
)
```

**Fields:**
- `question_index`: မေးခွန်း index (0, 1, 2, ...)
- `question`: မေးခွန်း text (e.g., "ဘယ်သူက")
- `user_id`: ဘယ် player က ရွေးသလဲ
- `answer`: Player ရဲ့ choice

### 4. `game_tracking` Table

Used characters/options tracking (duplicate prevention):

```sql
CREATE TABLE game_tracking (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  type VARCHAR(50),
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Fields:**
- `type`: 'character' | 'option_ဘယ်အချိန်' | 'option_ဘယ်နေရာမှာ' | ...
- `value`: Character name သို့မဟုတ် option text

**Example rows:**
```
game_id | type                  | value
--------|-----------------------|------------------
1       | character             | Taffy
1       | character             | Ya Mone
1       | option_ဘယ်အချိန်     | ညသန်းခေါင်ယံအချိန်
```

## 🔄 Data Flow

### Game Start:
1. `/start` → Create entry in `games` table
2. Players join → Add to `game_players` table
3. Countdown ends → Update `game_started = TRUE`, shuffle `turn_order`

### During Game:
1. Ask question → Query `game_players` by `turn_order`
2. Player answers → Insert into `game_answers`
3. Track used items → Insert into `game_tracking`
4. Next question → Update `current_question_index`

### Game End:
1. All questions answered → Query all `game_answers`
2. Construct final story
3. Delete game → CASCADE delete သွားမယ် (all related tables)

## 🔍 Key Queries

### Get Active Game:
```javascript
await db.getGame(chatId);
// Returns game object or null
```

### Get Players (ordered by turn):
```javascript
await db.getPlayers(gameId);
// Returns players array sorted by turn_order
```

### Shuffle Players:
```javascript
await db.shufflePlayers(gameId);
// Randomly assigns turn_order to all players
```

### Track Used Character:
```javascript
await db.trackUsed(gameId, 'character', 'Taffy');
// Prevents duplicate character selection
```

### Get Used Characters:
```javascript
await db.getUsedItems(gameId, 'character');
// Returns ['Taffy', 'Ya Mone', ...]
```

## 💾 Benefits

### 1. Persistence
- Bot restart ဖြစ်လည်း games မပျောက်ဘူး
- Koyeb redeploy လုပ်လည်း games ဆက်ကစားလို့ရတယ်

### 2. Scalability
- Multiple bot instances run နိုင်တယ် (same database)
- Game history ကို analyze လုပ်လို့ရတယ်

### 3. Data Integrity
- Foreign key constraints (CASCADE delete)
- Unique constraints (no duplicate players)
- Transaction support

### 4. Recovery
- Old games cleanup (24 hours+ ကို auto delete)
- Connection pooling (efficient resource usage)

## 🔧 Maintenance

### Cleanup Old Games:
```javascript
await db.cleanupOldGames();
// Deletes games older than 24 hours
```

### Get Active Games Count:
```javascript
await db.getActiveGamesCount();
// Returns number of active games
```

### Manual Cleanup (if needed):
```sql
-- Delete specific game
DELETE FROM games WHERE chat_id = -1001234567890;

-- Delete all test games
DELETE FROM games WHERE chat_id < 0;

-- View all active games
SELECT chat_id, player_count, game_started, created_at 
FROM games 
ORDER BY created_at DESC;
```

## 🐛 Debugging

### Check Database Connection:
```bash
node test-database.js
```

### View Logs:
```bash
# Bot will log all database operations
npm start
```

### Common Issues:

**Connection Failed:**
```
❌ Error: connect ECONNREFUSED
```
→ Check `DATABASE_URL` in `.env`

**Schema Not Found:**
```
❌ Error: relation "games" does not exist
```
→ Run `initializeDatabase()` (automatic on bot start)

**Duplicate Key Error:**
```
❌ Error: duplicate key value violates unique constraint
```
→ Expected behavior (player already joined)

## 🔐 Security

- ✅ Parameterized queries (SQL injection prevention)
- ✅ SSL connection (required for Neon)
- ✅ Connection pooling (max 10 connections)
- ✅ Environment variables (no hardcoded credentials)
- ✅ CASCADE delete (no orphaned data)

## 📈 Future Enhancements

Possible additions:
- [ ] Game history/statistics per player
- [ ] Leaderboard (most games played)
- [ ] Custom character lists per chat
- [ ] Admin commands to view/delete games
- [ ] Analytics dashboard

---

**Database Provider:** [Neon](https://neon.tech) - Serverless Postgres  
**Connection String:** Stored in `DATABASE_URL` environment variable  
**Schema Management:** Automatic via `database.js::initializeDatabase()`

