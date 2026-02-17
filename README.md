---

# 🧠 Challenges Faced & Solutions

Building this application involved solving several real-world engineering problems across authentication, database security, animation systems, and production deployment.

---

## 1️⃣ Row Level Security Blocking Queries

**Problem:**  
After enabling Row Level Security (RLS), all fetch requests returned empty arrays even though data existed in the database.

**Root Cause:**  
Supabase blocks all queries by default when RLS is enabled unless policies are explicitly defined.

**Solution:**  
Implemented granular RLS policies using `auth.uid()` to ensure users can only access their own bookmarks.

```sql
CREATE POLICY "select_own" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own" ON bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

**Result:**  
Database-level multi-user isolation with zero risk of cross-user data access.

---

## 2️⃣ Google OAuth Redirect Loop on Production

**Problem:**  
Google authentication worked locally but failed after deployment on Vercel.

**Root Cause:**  
Supabase requires exact redirect URLs to be whitelisted.

**Solution:**  
Added both development and production URLs inside Supabase → Authentication → URL Configuration:

- `http://localhost:3000`
- `https://smart-bookmark-app-with-google-auth.vercel.app`

**Result:**  
OAuth worked seamlessly in both development and production environments.

---

## 3️⃣ Framer Motion TypeScript Build Error (Vercel)

**Problem:**  
Production build failed with:

Type '{ type: string; stiffness: number; damping: number; }'  
is not assignable to type 'Transition<any>'

**Root Cause:**  
Framer Motion expects specific literal types for transitions in TypeScript.

**Solution:**  
Explicitly typed the spring configuration:

```ts
import { Transition } from "framer-motion";

const spring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};
```

**Result:**  
Successful production build with strict TypeScript safety.

---

## 4️⃣ Layout Animation Jank on Delete

**Problem:**  
Deleting bookmarks caused abrupt layout shifts instead of smooth animation.

**Root Cause:**  
React re-rendered the list without shared layout awareness.

**Solution:**  
Wrapped bookmark list with `LayoutGroup` and added `layout` prop:

```tsx
<LayoutGroup>
  {bookmarks.map((bookmark) => (
    <motion.div layout key={bookmark.id}>
```

**Result:**  
Smooth spring-based layout reflow animations when adding or removing bookmarks.

---

## 5️⃣ Preventing Accidental Bookmark Deletion

**Problem:**  
Single-click delete created a risk of accidental data loss.

**Solution:**  
Implemented a two-step delete confirmation state instead of using `window.confirm()`.

- First click → Shows confirmation UI  
- Second click → Executes delete  

**Result:**  
Safer user experience while maintaining animation consistency.

---

## 6️⃣ Favicon Fetch Failures

**Problem:**  
Some domains did not provide accessible favicon paths, resulting in broken images.

**Solution:**  
Used Google’s favicon service:

https://www.google.com/s2/favicons?domain=example.com

Added fallback handling for image load errors.

**Result:**  
Reliable favicon rendering across most domains.

---

## 7️⃣ Environment Variables Not Loading in Production

**Problem:**  
Supabase client returned undefined environment variables after deployment.

**Root Cause:**  
Next.js only exposes variables prefixed with `NEXT_PUBLIC_`.

**Solution:**  

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Configured the same variables in Vercel Environment Settings.

**Result:**  
Secure and consistent environment configuration across dev and production.

---

# 🎯 Key Engineering Outcomes

- Implemented strict database-level security using RLS  
- Solved OAuth production configuration issues  
- Fixed TypeScript + CI build pipeline errors  
- Engineered physics-based layout animations  
- Designed safe UX patterns to prevent accidental data loss  
- Successfully deployed a secure full-stack application to production  

---




# 🔖 Smart Bookmark App

A secure, full-stack bookmark manager built with **Next.js**, **Supabase**, and **Framer Motion** — featuring a premium dark-first UI with spring-physics animations, Google OAuth, and Row Level Security.

---

## 🚀 Live Demo

🔗 https://smart-bookmark-app-with-google-auth.vercel.app/

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

