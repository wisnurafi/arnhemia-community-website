# 🛡️ ARNHEMIA — Supabase Setup Guide

A click-by-click guide to setting up Supabase. Total time: ~10 minutes.

What you need:
- A working email (to register on Supabase and become the first owner account)
- A browser

---

## 📦 STEP 1 — Sign up for Supabase (1 minute)

1. Open https://supabase.com
2. Click **Start your project** (top right)
3. Pick **Continue with GitHub** or **Continue with Email**
4. Verify your email if asked

---
asd
## 🚀 STEP 2 — Create a new project (2 minutes)

1. After login, click **New project** (the green button)
2. Pick an organization (if you just signed up, there's a default org with your name)
3. Fill in the form:
   - **Name**: `arnhemia` (anything, this is just a label)
   - **Database password**: click **Generate a password** -> **save this password** in a password manager (you'll need it later, even if not right now)
   - **Region**: pick the closest one. For Indonesia: **Southeast Asia (Singapore)**
   - **Pricing plan**: **Free** (more than enough for an early community)
4. Click **Create new project**
5. Wait ~2 minutes. Supabase is provisioning Postgres + auth + storage for you.

---

## 🔑 STEP 3 — Copy API keys (1 minute)

Once the project is ready (the background turns green, no longer gray):

1. In the left sidebar, click the **⚙️ Project Settings** icon (at the bottom)
2. Click **API** in the submenu
3. You'll see 3 important values:

   **Project URL** (at the top)
   ```
   https://abcdefghijk.supabase.co
   ```
   Copy this -> it goes into `NEXT_PUBLIC_SUPABASE_URL`

   **Project API Keys -> anon public**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
   ```
   Click **Copy** -> it goes into `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **Project API Keys -> service_role**
   - Click **Reveal** first (it's hidden by default)
   - Click **Copy**
   - This goes into `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **Never commit this to git, never paste it into Discord/public chats**. It's basically the root password for your DB.

4. Open `.env.local` in your project and paste those 3 values (see STEP 7).

---

## 📜 STEP 4 — Run the schema SQL (3 minutes)

You need to run **TWO SQL files** in order:

### 4a. Base schema (auth + invites)

1. In Supabase's left sidebar, click the **🗃️ SQL Editor** icon
2. Click **+ New query**
3. Open `supabase/schema.sql` from your project (in the root of the `arnhemia-forum` folder)
4. Copy the ENTIRE contents
5. Paste into Supabase's SQL editor
6. Click the **Run** button (bottom right, or press `Ctrl+Enter`)
7. Wait for **Success. No rows returned**

### 4b. Content schema (forums, threads, tickets, conversations, alerts)

1. Click **+ New query** again
2. Open `supabase/002_data_schema.sql`
3. Copy the ENTIRE contents, paste into the SQL editor, click **Run**
4. Wait for **Success. No rows returned**

This creates the tables: `forum_groups`, `forum_categories`, `threads`, `posts`,
`reactions`, `bookmarks`, `tickets`, `ticket_replies`, `conversations`,
`conversation_participants`, `messages`, `alerts`, `alert_preferences`,
`shouts`. Plus seed data for 7 default forum categories.

If you get an error, the SQL probably got pasted partially. Clear everything, paste again, and re-run.

---

## 🔐 STEP 5 — Disable email confirmation (for the first owner) (30 seconds)

This is temporary, so you can log in immediately without waiting for an email.

1. Left sidebar -> **🔐 Authentication**
2. Click **Providers** in the submenu
3. Click the **Email** row
4. Toggle **Confirm email** -> **OFF**
5. Click **Save**

Later, once you're the owner, switch it back **ON** so new members must confirm their email.

---

## 👤 STEP 6 — Create the first owner account (2 minutes)

### 6a. Sign up via the Supabase Dashboard

1. Left sidebar -> **🔐 Authentication**
2. Click **Users** in the submenu
3. Click **Add user** (top right) -> **Create new user**
4. Fill in:
   - **Email**: your real email (not a dummy)
   - **Password**: at least 10 characters, save it in a password manager
   - **Auto Confirm User**: ✅ **check this** (this skips email confirmation)
5. Click **Create user**

### 6b. Create the profile + make it owner

1. Left sidebar -> **🗃️ SQL Editor** -> **+ New query**
2. Paste this SQL (**replace the email first**):

   ```sql
   -- Step 1: create the profile for the account you just made
   insert into public.profiles (id, username, role)
   select id, 'YOUR_USERNAME_HERE', 'owner'
   from auth.users
   where email = 'REPLACE_WITH_YOUR_EMAIL@gmail.com';
   ```

   Example:
   ```sql
   insert into public.profiles (id, username, role)
   select id, 'phantomwolf', 'owner'
   from auth.users
   where email = 'wisnu@gmail.com';
   ```

3. Click **Run** -> you should see **Success. 1 row affected**

If you get the error `null value in column ... violates not-null constraint`, your email is wrong and the query didn't find the user.

---

## ⚙️ STEP 7 — Fill in .env.local (30 seconds)

1. Open `.env.local` in the root of `arnhemia-forum` (an empty file is already there)
2. Paste the 3 values from STEP 3:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
   ```

3. **Save** (Ctrl+S)

⚠️ **Don't commit `.env.local` to git.** It's already ignored in `.gitignore`.

---

## 🎮 STEP 8 — Try logging in (1 minute)

```bash
npm run dev
```

1. Open http://localhost:3000
2. Top right -> click **Sign in**
3. Log in with the email + password you created in STEP 6a
4. If it works, the navbar will show your avatar + the **Owner** role badge ✨
5. Click your avatar -> there should be an **Invite codes** menu (only visible to owner/co-owner/devs)

---

## 🎟️ STEP 9 — Generate your first invite code (30 seconds)

1. Open http://localhost:3000/admin/invites
2. Form on the left: write a note (optional) + pick an expiry
3. Click **Generate code**
4. The code appears in the format `ARN-XXXX-XXXX`
5. Click **Copy code** -> hand it to a prospective member

That member then signs up at http://localhost:3000/register with that code. They join as a **member**, not an owner.

---

## 🔒 STEP 10 — Re-enable email confirmation (30 seconds)

Now that you're the owner, turn protection back on.

1. Supabase sidebar -> **🔐 Authentication** -> **Providers** -> **Email**
2. Toggle **Confirm email** -> **ON**
3. Click **Save**

Every new member now has to confirm their email before they can log in.

---

## ✅ Done

What you can do now:
- Log in/out normally
- Generate invite codes (`/admin/invites`)
- Members sign up with an invite code (`/register`)
- Role enforcement is automatic (RLS in the DB + middleware in Next.js)

---

## 🆘 Troubleshooting

**"Invalid login credentials"** on first login
-> You forgot to check **Auto Confirm User** in STEP 6a. Fix: delete the user and recreate with **Auto Confirm User** ✅

**"Invite code not found"** when registering
-> Make sure you pasted the code exactly (with the dashes and capitalization). Format: `ARN-XXXX-XXXX`

**"That username is already taken"**
-> Usernames are case-sensitive. Try all lowercase.

**The "Invite codes" button doesn't show in the user panel**
-> Your profile isn't set to role `owner` yet. Re-run the query in STEP 6b.

**Build error / page won't load**
-> Check that `.env.local` has all 3 values filled in. Restart the dev server (`Ctrl+C` then `npm run dev` again).

**Want to rotate the Supabase URL / key**
-> Settings -> API -> **Generate new** button next to the anon key. Update `.env.local` and restart.

---

## 🚢 Deploy to Vercel

1. Push the project to GitHub
2. Open https://vercel.com -> **Add New** -> **Project** -> import the repo
3. In the **Environment Variables** tab, paste the same 3 values from `.env.local`
4. Click **Deploy**
5. Once deploy succeeds, head back to Supabase:
   - **🔐 Authentication** -> **URL Configuration**
   - **Site URL**: `https://arnhemia.vercel.app` (or your domain)
   - **Redirect URLs**: add `https://arnhemia.vercel.app/**`
6. Click **Save**

Done. ARNHEMIA is now live, invite-only, role-based, production-ready.

---

## 🤖 (Optional) Discord linking setup

Discord on Arnhemia is **only for linking accounts that already registered**, not for logging in. Members still have to sign up with an invite code first, then they can link their Discord at `/discord`. This prevents people from bypassing the invite system.

If you want to enable the "Link Discord account" button at /discord:

1. Open https://discord.com/developers/applications -> **New Application**
2. Tab **OAuth2 -> General**:
   - Copy the **Client ID** and **Client Secret**
   - Under **Redirects**, add: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. Back in the Supabase Dashboard -> **🔐 Authentication -> Providers**
4. Find **Discord** -> toggle **ON**
5. Paste the Client ID and Client Secret
6. Click **Save**

Restart the dev server. The "Link Discord account" button at /discord will work right away.

⚠️ **There's intentionally no "Continue with Discord" button at /login.** If there were, people could sign up without an invite code. Discord here is only a secondary path for existing users to verify identity.

---

## 🔐 (Optional) Two-Factor Authentication

ARNHEMIA supports TOTP-based 2FA (Google Authenticator, Authy, 1Password, Bitwarden, etc.). It can be enabled per-account from `/settings/2fa`.

Supabase needs MFA enabled in your project:

1. Open the Supabase Dashboard -> **🔐 Authentication** -> **Providers** (or **Multi-Factor**)
2. Make sure **TOTP** is ON (it's ON by default in new projects)

How a user enrolls:

1. Log in to ARNHEMIA
2. Click your avatar -> **Preferences** (or open `/settings` directly)
3. "Two-factor authentication" section -> click **Set up 2FA**
4. Scan the QR code with your authenticator app
5. Enter the 6-digit code shown in the app
6. Done

Once enabled:
- Every login takes the user through `/login/mfa` after submitting their password
- Middleware automatically forces the user to the MFA challenge until they pass
- If a user **loses access to their authenticator**, you (as the owner) can unenroll their factor manually via Supabase Dashboard -> Authentication -> Users -> click the user -> **MFA** tab -> Remove

⚠️ **2FA is strong — never share the secret/QR with anyone else.** If you enable it on the owner account, save the recovery secret in a password manager.

---

## ✅ Production checklist

Before you open invites to the public, check each item:

- [ ] STEP 4a + 4b ran successfully, all tables created (`select count(*) from forum_groups;` should return 3)
- [ ] STEP 6 first owner is created
- [ ] STEP 10 email confirmation is back ON
- [ ] `.env.local` is not committed to git (`git status` should not show `.env.local`)
- [ ] Logo + favicon match your brand
- [ ] Legal/TOS pages reviewed (`/legal/tos`, `/legal/privacy`)
- [ ] Vercel domain + Supabase URL Configuration are in sync
- [ ] Discord OAuth set up if needed
- [ ] Service role key stored in a password manager, not in chat/notes
- [ ] Tested the register flow from scratch with an invite code in production
