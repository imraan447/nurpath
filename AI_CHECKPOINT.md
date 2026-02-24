# AI Checkpoint: NurPath App Updates

## Current State (Session: New Updates - Feb 24, 2026)
**Branch:** `feat/new-updates-session` (based off `dev`)

---

### ✅ Completed Features (This Session)

#### 1. API Key Security (Serverless Proxy)
- Created `/api/reflections.ts` — Vercel serverless function proxying Gemini API calls
- `src/services/geminiService.ts` now uses `fetch('/api/reflections')` instead of direct SDK calls
- Gemini key moved from `VITE_GEMINI_API_KEY` (public) to `GEMINI_API_KEY` (server-only)
- `.env.example` updated with new variable structure

#### 2. Colorful Category Dropdowns
- Each of the 6 quest categories now has a distinct FlatUI gradient:
  - Five Pillars: dark navy (`#2c3e50` → `#34495e`)
  - Nafl Salaah: teal (`#16a085` → `#1abc9c`)
  - Daily Remembrance: blue (`#2980b9` → `#3498db`)
  - Sunnah & Character: purple (`#8e44ad` → `#9b59b6`)
  - Community & Charity: orange (`#d35400` → `#e67e22`)
  - Correction Quests: red (`#c0392b` → `#e74c3c`)
- All have white text

#### 3. Dark Mode — 3-Way Preference
- Settings now offers Light / Dark / System selector
- `darkModePreference: 'light' | 'dark' | 'system'` stored in `UserSettings`
- System mode uses `window.matchMedia('(prefers-color-scheme: dark)')` with live listener

#### 4. Settings Overhaul
- **Removed:** Haptic Feedback, Daily Goal, Backup/Download Source
- **Added:** Leaderboard visibility toggle (opt-in, default off)
- **Added:** Warning subtext when leaderboard is disabled
- Prayer Calculation Standards section preserved

#### 5. Leaderboard Gating
- Leaderboard is **disabled by default** (`leaderboardEnabled: false`)
- When disabled: leaderboard shows a gated message "Leaderboard Disabled" with instruction to enable in Settings
- When disabled: user scores are NOT shown to others
- Tab order changed: Friends → National → Global
- `Leaderboard.tsx` accepts `leaderboardEnabled` prop

#### 6. Data Caching (localStorage)
- Duas data cached to `nurpath_cached_duas` — prevents blank screen on revisit
- Leaderboard entries cached per tab to `nurpath_leaderboard_[tab]`
- All caches are updated on successful fetch

#### 7. Fasting (Ramadan) Save Fix
- **Root cause:** `saveUser()` in `App.tsx` was NOT persisting the `settings` JSON column to Supabase — only `calc_method` and `madhab` were saved individually
- **Fix:** Added `settings: u.settings` to the `supabase.from('profiles').update()` call
- This also fixes persistence of `darkModePreference`, `leaderboardEnabled`, etc.

#### 8. Prayer Notifications (Web + Android)
- Created `src/services/notificationService.ts`
- **Web:** Uses browser Notifications API with `setTimeout` scheduling
- **Android:** Uses `@capacitor/local-notifications` for native notification scheduling
- Schedules reminders 10 minutes before each prayer time
- Auto-schedules when prayer times load AND notifications setting is enabled

#### 9. "My Focus" Rename + Refresh Icon
- "Today's Focus" → "My Focus"
- Added ↻ refresh icon (RefreshCcw) next to the stats that reloads user data from Supabase

#### 10. Pull-to-Refresh
- Touch gesture handler on the main scroll area
- Shows a spinning indicator when pulled down past 80px threshold
- Calls `fetchProfile()` to reload all data from Supabase

---

### 🔲 Still To Do
- **Salaah Manual Corrections:** UI for marking missed prayers that can add to quest count
- **Nur-Connect Full Modern Redesign:** Visual overhaul with animations

---

### Previous Session Summary
- Prayer Nested Checklists (Pre & Post Salah)
- Ramadan Tracker component
- Hero Card "Today's Focus" UI rewrite
- Quest Completion Freeze fix (forced session refresh)
- Salah Checklist ordering fix
- Greeting simplification
