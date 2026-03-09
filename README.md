# 📉 Failbase

> The only professional network celebrating your worst moments.

---

## 🚀 Setup Guide (No Tech Experience Required)

### Step 1: Install Node.js
1. Go to https://nodejs.org
2. Download the **LTS** version
3. Install it (click Next through everything)
4. Open **Terminal** (Mac) or **Command Prompt** (Windows)
5. Type `node --version` and press Enter — you should see a version number

---

### Step 2: Create a Supabase Project
1. Go to https://supabase.com and sign up with GitHub
2. Click **"New Project"**
3. Name it `failbase`, pick a region close to you, set a password (save it)
4. Wait ~2 minutes for it to spin up
5. Go to **Settings → API** in the left sidebar
6. Copy your **Project URL** and **anon public** key — you'll need these

---

### Step 3: Set Up Your Database
1. In Supabase, click **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` from this project
4. Paste ALL the contents into the SQL editor
5. Click **"Run"** (green button)
6. You should see "Success. No rows returned"

---

### Step 4: Configure the App
1. In this project folder, copy `.env.local.example` to `.env.local`
   ```
   cp .env.local.example .env.local
   ```
2. Open `.env.local` in a text editor
3. Replace the placeholder values with your Supabase URL and anon key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

---

### Step 5: Run It Locally
In your terminal, navigate to this folder and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see Failbase! 🎉

---

### Step 6: Deploy to Vercel (Make It Live)
1. Push this project to a GitHub repository
2. Go to https://vercel.com and sign up with GitHub
3. Click **"Add New Project"** → Import your GitHub repo
4. Before deploying, click **"Environment Variables"** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Deploy**
6. In ~2 minutes, you'll get a live URL like `failbase.vercel.app`

---

## 📁 Project Structure

```
failbase/
├── app/
│   ├── page.jsx              ← Home feed
│   ├── submit/page.jsx       ← Post a failure
│   ├── leaderboard/page.jsx  ← Shame board
│   └── profile/[username]/   ← User profiles
├── components/
│   ├── cards/                ← Post, profile, leaderboard cards
│   ├── buttons/              ← Share button etc
│   └── layout/               ← Nav, footer
└── lib/
    ├── seed-data.js          ← Fake data for demo
    └── supabase.js           ← Database client
```

---

## 🔮 Adding Real Auth Later

When you're ready to add login:
1. Enable **Email** provider in Supabase → Authentication → Providers
2. Use `@supabase/ssr` for server-side auth (already installed)
3. Add `/app/auth/` routes for sign-in/sign-up

---

Built as part of a weekly Claude build challenge. Not affiliated with LinkedIn (obviously).
