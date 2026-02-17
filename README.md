# 🔖 Smart Bookmark App

A secure, full-stack bookmark manager built with **Next.js**, **Supabase**, and **Framer Motion** — featuring a premium dark-first UI with spring-physics animations, Google OAuth, and Row Level Security.

---

## 🚀 Live Demo

🔗 [https://your-vercel-link.vercel.app](https://your-vercel-link.vercel.app)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript |
| **Styling** | Tailwind CSS + Custom CSS Variables |
| **Animations** | Framer Motion |
| **Backend** | Supabase (PostgreSQL) |
| **Auth** | Google OAuth via Supabase Auth |
| **Deployment** | Vercel |

---

## ✨ Features

### Core
- 🔐 Google OAuth authentication
- ➕ Add bookmarks with title & URL
- ✏️ Edit existing bookmarks
- 🗑️ Delete bookmarks (two-tap confirm — prevents accidental deletion)
- 🔍 Live search with animated clear button
- 🌙 Dark mode by default, toggleable to light

### UI & UX
- 🎞️ **Framer Motion** throughout — spring physics, staggered page reveals, blur-in transitions
- 🧲 **Magnetic buttons** — interactive elements subtly follow the cursor using `useMotionValue` + `useSpring`
- 🌊 **Animated background** — floating ambient blobs with independent motion paths
- 🌫️ **Noise texture overlay** — adds tactile depth to the dark background
- 🪄 **Layout animations** — bookmark list reflows with spring physics when items are added or removed
- 🔀 **AnimatePresence** — smooth cross-fade transitions between login and app views
- ✨ **Shimmer line** — sweeps across the bottom of each hovered bookmark row
- 🔮 **Glassmorphism card** — subtle inner highlight gradient on the main container
- 🌐 **Favicon thumbnails** — auto-fetched per bookmark domain
- 💎 **Premium typography** — `Instrument Serif` (display) + `DM Sans` (body)
- 🔔 Styled toast notifications

### Security
- 🔒 Row Level Security (RLS) enforced at the database level

---

## 🔒 Security — Row Level Security

RLS is enabled on the `bookmarks` table. Policies ensure users can only access their own data.

```sql
-- Users can only SELECT their own bookmarks
CREATE POLICY "select_own" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only INSERT their own bookmarks
CREATE POLICY "insert_own" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own bookmarks
CREATE POLICY "update_own" ON bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only DELETE their own bookmarks
CREATE POLICY "delete_own" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 🗄️ Database Schema

```sql
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default now()
);

alter table bookmarks enable row level security;
```

---

## ⚙️ Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/smart-bookmark.git
cd smart-bookmark
```

### 2. Install dependencies

```bash
npm install
# Framer Motion is required
npm install framer-motion
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up Supabase

- Create a new project at [supabase.com](https://supabase.com)
- Run the SQL in the **Database Schema** section above
- Enable **Google OAuth** under Authentication → Providers
- Add your redirect URL: `http://localhost:3000` (dev) and your Vercel URL (prod)

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Dependencies

```json
{
  "next": "^14",
  "react": "^18",
  "typescript": "^5",
  "@supabase/supabase-js": "^2",
  "framer-motion": "^11",
  "react-hot-toast": "^2"
}
```

---

## 🚢 Deployment

Deploy to Vercel in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Vercel environment variables.

---

