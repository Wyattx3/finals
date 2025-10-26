# 🚀 Koyeb Deployment Guide

ဒီ guide က Telegram Story Game Bot ကို Koyeb မှာ ဘယ်လို deploy လုပ်မလဲဆိုတာ ပြောပြပေးပါမယ်။

## 📋 Prerequisites

1. **Koyeb Account** - https://koyeb.com မှာ အကောင့်ဖွင့်ပါ (Free tier ရှိပါတယ်)
2. **GitHub Repository** - Bot code ကို GitHub မှာ push လုပ်ထားရပါမယ်
3. **Bot Token** - @BotFather ကနေ Telegram bot token ရထားရပါမယ်

## 🔧 Deployment Steps

### 1. Koyeb မှာ New App ဖန်တီးပါ

1. Koyeb dashboard မှာ **Create App** ကို နှိပ်ပါ
2. **GitHub** deployment method ကို ရွေးပါ
3. Repository ကို connect လုပ်ပါ: `https://github.com/Wyattx3/finals`
4. Branch: `main` ကို ရွေးပါ

### 2. Build Configuration

- **Builder:** Buildpack (default)
- **Build command:** (empty - automatic detection)
- **Run command:** `npm start`

### 3. Environment Variables

**Environment** section မှာ variables တွေ ထည့်ပါ:

```
BOT_TOKEN=your_actual_bot_token_from_botfather
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
```

⚠️ **အရေးကြီးပါတယ်:**
- `BOT_TOKEN` ကို သင့်ရဲ့ တကယ့် bot token နဲ့ အစားထိုးပါ!
- `DATABASE_URL` ကို သင့်ရဲ့ PostgreSQL connection string နဲ့ အစားထိုးပါ (Neon/Supabase/etc)

### 4. Service Configuration

- **Instance type:** Free (or higher)
- **Regions:** ပိုနီးတဲ့ region ရွေးပါ (Singapore/Frankfurt recommended)
- **Port:** `3000` (automatic - health check endpoint အတွက်)
- **Health check path:** `/health`

### 5. Deploy!

**Deploy** button ကို နှိပ်ပြီး စောင့်ပါ။ Build process ကို logs မှာ ကြည့်နိုင်ပါတယ်။

## ✅ Verification

Deploy အောင်မြင်ပြီဆိုရင်:

1. **Logs ကြည့်ပါ:**
```
🚀 Starting Telegram Story Game Bot...
📝 Bot Token: ✅ Found
✅ Bot is running successfully!
🏥 Health check server listening on port 3000
📱 Waiting for messages...
```

2. **Health Check Test:**

Koyeb dashboard မှာ public URL ပေးထားတာကို သုံးပြီး:
```
https://your-app-name.koyeb.app/health
```

Response:
```json
{
  "status": "ok",
  "bot": "running",
  "uptime": 123.45,
  "activeGames": 0,
  "timestamp": "2025-10-26T..."
}
```

3. **Bot Test:**

Telegram မှာ bot ကို test လုပ်ပါ:
- Private chat မှာ `/start` ပို့ပါ → "Add to Group" button မြင်ရမယ်
- Group မှာ `/start` ပို့ပါ → Game lobby စမယ်

## 🔄 Auto-Deploy

GitHub repository မှာ code update လုပ်တိုင်း Koyeb က အလိုအလျောက် redeploy လုပ်ပေးပါမယ်။

```bash
git add .
git commit -m "Update bot"
git push origin main
```

Koyeb က detect လုပ်ပြီး အလိုအလျောက် deploy ပြန်လုပ်ပါမယ်။

## 📊 Monitoring

Koyeb dashboard မှာ:

1. **Logs:** Real-time bot logs ကြည့်နိုင်ပါတယ်
2. **Metrics:** CPU, Memory usage ကြည့်နိုင်ပါတယ်
3. **Health:** Health check status ကြည့်နိုင်ပါတယ်

## 🛠️ Troubleshooting

### Bot မ run ဘူး

1. **BOT_TOKEN check:**
   - Logs မှာ `Empty token!` error ရှိလား?
   - Environment variables မှာ `BOT_TOKEN` ထည့်ထားလား?

2. **Build failed:**
   - Node.js version compatible လား? (v14+ required)
   - package.json မှာ dependencies အကုန်ပါလား?

3. **Health check failed:**
   - Port `3000` က listen လုပ်နေလား?
   - `/health` endpoint က respond လုပ်နေလား?

### Rate Limit Errors (429)

Log မှာ "Too Many Requests" တွေ့ရင်:
- Bot က rate limits တွေ သတ်မှတ်ထားပြီးသားပါ
- အရမ်းမြန်မြန် game များများ မဆော့ပါနဲ့
- Production မှာ normal speed နဲ့ ဆော့ရင် problem မရှိပါဘူး

### Memory/CPU Issues

Free tier က limited ဖြစ်တယ်:
- `gameStates` က game ပြီးတိုင်း cleanup လုပ်ပါတယ်
- Memory leak မရှိပါဘူး
- တခါမှာ game 10+ ခု ပြိုင်တူမဖြစ်အောင် သတိထားပါ

## 🔐 Security

1. **Bot Token:** Never commit to git! Always use environment variables
2. **Private Repo:** Repository ကို private လုပ်ထားပါ (recommended)
3. **Webhook:** Bot က polling သုံးတယ် (webhook မဟုတ်ဘူး)

## 💰 Cost

- **Free tier:** 512MB RAM, shared CPU
  - Small/medium groups အတွက် လုံလောက်ပါတယ်
  - Game တခုမှာ player 8 ယောက် အထိ
  
- **Upgrade:** Large groups/multiple games ဆိုရင် paid tier သုံးပါ

## 📞 Support

Problems ရှိရင်:
1. Koyeb logs ကြည့်ပါ
2. GitHub Issues မှာ post လုပ်ပါ
3. Bot debug logs ကြည့်ပါ (verbose logging ပါပြီးသား)

## 🎉 Success!

Bot က successfully deploy ဖြစ်ပြီဆိုရင် 24/7 run နေမှာပါ။ Telegram groups တွေမှာ `/start` command နဲ့ game စဆော့လို့ရပါပြီ! 🎮

---

**Note:** Koyeb free tier က 2 apps အထိ deploy လုပ်လို့ရပါတယ်။ Bot က lightweight ဖြစ်လို့ free tier နဲ့ အဆင်ပြေပါတယ်။

