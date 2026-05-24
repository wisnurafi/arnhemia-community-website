# ARNHEMIA

Premium, invite-only gaming community platform for Valorant. Built with
Next.js 15, React 19, Tailwind CSS, shadcn-style UI, Framer Motion,
Lucide icons, and Supabase (Auth + Postgres + RLS).

Production-ready, fully functional, no mock data behind real features.

## Stack

- Next.js 15.5 (App Router) + React 19
- TypeScript 5.7
- Tailwind CSS 3 with custom dark theme tokens
- Radix UI primitives in shadcn/ui style
- Framer Motion for transitions
- Supabase Auth + Postgres + Row-Level Security
- Lucide icons

## Features

### Auth and accounts
- Email + password sign-in
- Invite-only registration (single-use, atomic, expirable codes)
- Forgot/reset password via email link
- Email confirmation handler (`/auth/callback`)
- Discord OAuth provider for account linking (optional)
- TOTP-based two-factor authentication (`/settings/2fa`, `/login/mfa`)
- Password change in `/settings`
- Account deletion (cascades all user content)
- Role system: `owner`, `co-owner`, `devs`, `member`

### Forum
- Forum groups and categories (seeded with default categories)
- Thread create/read/delete with body up to 20k characters
- Replies (posts) up to 10k characters
- Pin and lock by staff
- View counter, reply counter, last-reply tracker
- Reactions (likes) on threads and posts
- Bookmarks
- Public profiles at `/u/[username]`
- Full-text search at `/search`

### Tickets
- 5 categories: Valorant Support, Loader Issues, Purchase Help,
  Technical Support, Account Support
- Status: open / answered / pending / closed (auto-flips on staff reply)
- Priority: low / medium / high / critical
- Threaded replies with optional staff-only notes
- Filters by category, status, search, sort

### Social
- Direct messages (1:1 conversations) with realtime updates
- Auto-mark-read on view
- Alerts inbox (`reply`, `reaction`, `mention`, `message`, `system`)
- Notification preferences per channel/kind
- Live shoutbox on `/forums` with realtime broadcast

### Admin
- `/admin/invites` staff-only invite generator with expiry
- Role-based UI (Invite menu shows for staff only)
- Profile uniqueness and role enforcement at the DB layer (RLS)

### Static and marketing
- Landing page: hero, features, pricing, FAQ, CTA, marquee
- `/pricing`, `/faq`, `/contact`, `/leaderboard`, `/changelog`, `/status`
- `/legal/tos`, `/legal/privacy`
- `/discord` premium-only Discord sync page
- `/downloads` for the loader and release notes

## Roles and permissions

| Role     | Read | Post | Issue invites | Moderate | Admin   |
|----------|:----:|:----:|:-------------:|:--------:|:-------:|
| owner    | Y    | Y    | Y             | Y        | Full    |
| co-owner | Y    | Y    | Y             | Y        | Full    |
| devs     | Y    | Y    | Y             | Limited  | Limited |
| member   | Y    | Y    | N             | N        | None    |

Enforcement happens at three layers:
- DB row-level security policies (in `supabase/*.sql`)
- `requireRole()` in `src/lib/auth.ts`
- Middleware in `src/middleware.ts`

## Setup

Read `SETUP.md` for the full step-by-step guide (~10 minutes from zero).

Quick version:

1. Create a Supabase project.
2. Run the SQL files under `supabase/` in order in the SQL editor:
   - `schema.sql`
   - `002_data_schema.sql`
   - `003_role_admin.sql`
   - `004_subscriptions_and_stats.sql`
   - `005_conversations_releases.sql`
   - `006_account_deletion.sql`
   - `007_releases_storage.sql`
   - `008_invites_single_use.sql`
   - `009_shouts_realtime.sql`
   - `010_realtime.sql`
   - `011_alerts_insert_policy.sql`
3. Copy the project URL, anon key, and service_role key into `.env.local`
   (see `.env.example`).
4. Disable email confirmation in Supabase, create your owner user, run
   the `bootstrap_owner` SQL in `SETUP.md`, then re-enable email
   confirmation.
5. `npm install && npm run dev`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Never commit `.env.local`. The service role key bypasses RLS.

## File map

```
src/
  app/
    (auth)/            Server actions: login, register, password
    admin/invites/     Staff-only invite generator
    alerts/            Alerts inbox + preferences
    api/
      conversations/   Open / mark-read endpoints
      discord/link/    Discord identity link/unlink
    auth/
      callback/        Email confirm / OAuth handler
      discord/         Discord OAuth initiator
    bookmarks/         Saved threads
    changelog/         Public release log
    contact/           Contact page
    conversations/     DM list and thread
    discord/           Premium Discord sync
    downloads/         Loader + changelog
    faq/               Public FAQ
    forgot/            Request password reset
    forums/            Forum index + category page + actions
    leaderboard/       Top members by reactions
    legal/             TOS + Privacy
    login/             Auth flow (incl. /login/mfa)
    pricing/           Public pricing
    profile/           Redirect to /u/[me]
    register/          Invite-required registration
    reset/             Set new password from reset link
    search/            Full-text search
    settings/          Account preferences (incl. /settings/2fa)
    status/            Service status
    threads/           Thread detail + new thread
    tickets/           Tickets list + create + detail
    u/[username]/      Public profile
  components/
    layout/            Navbar, Sidebar, Footer, Shoutbox, panels
    ui/                shadcn-style primitives
    forum/, tickets/   Domain components
    home/              Landing sections
    brand/             Logo, role badge
    legal/             Legal page shell
  lib/
    supabase/          Client, server, middleware, types
    auth.ts            getSession, requireSession, requireRole
    roles.ts           canInvite, canModerate, isStaff (pure)
    types.ts, utils.ts
supabase/
  schema.sql                       Auth + invites + RLS + consume_invite
  002_data_schema.sql              Forums, threads, tickets, conversations, alerts
  003_role_admin.sql               Role admin helpers
  004_subscriptions_and_stats.sql  Subscriptions + stats
  005_conversations_releases.sql   Conversation + release polish
  006_account_deletion.sql         Account deletion cascade
  007_releases_storage.sql         Releases storage policies
  008_invites_single_use.sql       Atomic single-use invite RPC
  009_shouts_realtime.sql          Shoutbox realtime
  010_realtime.sql                 Realtime channel grants
  011_alerts_insert_policy.sql     Alerts insert policy
```

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build and deploy

```bash
npm run build
npm start
```

For Vercel deploy, see `SETUP.md` -> "Deploy to Vercel".

## Scripts

- `npm run dev` start the Next.js dev server
- `npm run build` production build
- `npm start` run the production build
- `npm run lint` run ESLint

## Production checklist

See `SETUP.md` -> "Production checklist" for the pre-launch list.
