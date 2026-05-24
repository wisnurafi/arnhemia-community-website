-- =============================================================================
-- ARNHEMIA · Phase 2 schema (forums, threads, posts, tickets, conversations,
-- alerts, bookmarks, reactions). Run AFTER schema.sql.
-- =============================================================================

-- 1. Forum groups & categories ------------------------------------------------
create table if not exists public.forum_groups (
  id text primary key,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_categories (
  id text primary key,
  group_id text not null references public.forum_groups(id) on delete cascade,
  title text not null,
  description text,
  icon text,
  position integer not null default 0,
  staff_only boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists forum_categories_group_idx on public.forum_categories(group_id);

-- 2. Threads -------------------------------------------------------------------
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.forum_categories(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 200),
  body text not null check (char_length(body) between 1 and 20000),
  pinned boolean not null default false,
  locked boolean not null default false,
  views integer not null default 0,
  reply_count integer not null default 0,
  last_reply_at timestamptz not null default now(),
  last_reply_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists threads_category_idx on public.threads(category_id);
create index if not exists threads_author_idx on public.threads(author_id);
create index if not exists threads_last_reply_idx on public.threads(last_reply_at desc);

-- 3. Posts (thread replies) ---------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  edited_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists posts_thread_idx on public.posts(thread_id, created_at);
create index if not exists posts_author_idx on public.posts(author_id);

-- Trigger: keep threads.reply_count and last_reply_at synced
create or replace function public.threads_after_post_insert()
returns trigger
language plpgsql
as $$
begin
  update public.threads
  set
    reply_count = reply_count + 1,
    last_reply_at = NEW.created_at,
    last_reply_user_id = NEW.author_id
  where id = NEW.thread_id;
  return NEW;
end;
$$;

drop trigger if exists posts_after_insert on public.posts;
create trigger posts_after_insert
after insert on public.posts
for each row execute function public.threads_after_post_insert();

create or replace function public.threads_after_post_delete()
returns trigger
language plpgsql
as $$
begin
  update public.threads
  set reply_count = greatest(reply_count - 1, 0)
  where id = OLD.thread_id;
  return OLD;
end;
$$;

drop trigger if exists posts_after_delete on public.posts;
create trigger posts_after_delete
after delete on public.posts
for each row execute function public.threads_after_post_delete();

-- 4. Reactions (likes on posts and threads) -----------------------------------
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('thread', 'post')),
  target_id uuid not null,
  emoji text not null default 'like',
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id, emoji)
);

create index if not exists reactions_target_idx on public.reactions(target_type, target_id);

-- 5. Bookmarks -----------------------------------------------------------------
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  thread_id uuid not null references public.threads(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, thread_id)
);

create index if not exists bookmarks_user_idx on public.bookmarks(user_id, created_at desc);

-- 6. Tickets -------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'ticket_status') then
    create type ticket_status as enum ('open', 'answered', 'pending', 'closed');
  end if;
  if not exists (select 1 from pg_type where typname = 'ticket_priority') then
    create type ticket_priority as enum ('low', 'medium', 'high', 'critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'ticket_category') then
    create type ticket_category as enum (
      'Valorant Support',
      'Loader Issues',
      'Purchase Help',
      'Technical Support',
      'Account Support'
    );
  end if;
end $$;

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null default ('TCK-' || to_char(now(), 'YY') || '-' || lpad((floor(random()*99999)::int)::text, 5, '0')),
  author_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null check (char_length(subject) between 6 and 200),
  body text not null check (char_length(body) between 10 and 20000),
  category ticket_category not null,
  priority ticket_priority not null default 'medium',
  status ticket_status not null default 'open',
  reply_count integer not null default 0,
  last_reply_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_author_idx on public.tickets(author_id, created_at desc);
create index if not exists tickets_status_idx on public.tickets(status);

create table if not exists public.ticket_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 10000),
  staff_note boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists ticket_replies_ticket_idx on public.ticket_replies(ticket_id, created_at);

create or replace function public.tickets_after_reply_insert()
returns trigger
language plpgsql
as $$
declare
  v_role arnhemia_role;
begin
  select role into v_role from public.profiles where id = NEW.author_id;

  update public.tickets
  set
    reply_count = reply_count + 1,
    last_reply_at = NEW.created_at,
    updated_at = NEW.created_at,
    -- If staff replied to an open ticket, auto-mark answered.
    status = case
      when v_role <> 'member' and tickets.status = 'open' then 'answered'::ticket_status
      else tickets.status
    end
  where id = NEW.ticket_id;
  return NEW;
end;
$$;

drop trigger if exists ticket_replies_after_insert on public.ticket_replies;
create trigger ticket_replies_after_insert
after insert on public.ticket_replies
for each row execute function public.tickets_after_reply_insert();

-- 7. Conversations & messages -------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create index if not exists conv_participants_user_idx on public.conversation_participants(user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists messages_conv_idx on public.messages(conversation_id, created_at);

create or replace function public.conversations_after_message()
returns trigger
language plpgsql
as $$
begin
  update public.conversations
  set last_message_at = NEW.created_at
  where id = NEW.conversation_id;
  return NEW;
end;
$$;

drop trigger if exists messages_after_insert on public.messages;
create trigger messages_after_insert
after insert on public.messages
for each row execute function public.conversations_after_message();

-- 8. Alerts --------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'alert_kind') then
    create type alert_kind as enum ('reply', 'reaction', 'mention', 'message', 'system');
  end if;
end $$;

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind alert_kind not null,
  text text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists alerts_recipient_idx on public.alerts(recipient_id, created_at desc);
create index if not exists alerts_unread_idx on public.alerts(recipient_id) where read_at is null;

create table if not exists public.alert_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email_replies boolean not null default true,
  email_mentions boolean not null default true,
  email_messages boolean not null default true,
  push_replies boolean not null default true,
  push_reactions boolean not null default true,
  push_mentions boolean not null default true,
  push_messages boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 9. Profile shoutbox (lightweight, bounded) ----------------------------------
create table if not exists public.shouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 240),
  created_at timestamptz not null default now()
);

create index if not exists shouts_recent_idx on public.shouts(created_at desc);

-- =============================================================================
-- RLS
-- =============================================================================
alter table public.forum_groups       enable row level security;
alter table public.forum_categories   enable row level security;
alter table public.threads            enable row level security;
alter table public.posts              enable row level security;
alter table public.reactions          enable row level security;
alter table public.bookmarks          enable row level security;
alter table public.tickets            enable row level security;
alter table public.ticket_replies     enable row level security;
alter table public.conversations      enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages           enable row level security;
alter table public.alerts             enable row level security;
alter table public.alert_preferences  enable row level security;
alter table public.shouts             enable row level security;

-- Forums: everyone reads, only staff writes via SQL editor for now.
drop policy if exists "forum_groups_read" on public.forum_groups;
create policy "forum_groups_read" on public.forum_groups for select using (true);

drop policy if exists "forum_categories_read" on public.forum_categories;
create policy "forum_categories_read" on public.forum_categories for select using (true);

-- Threads: anyone authenticated can read, owner-only edits, author or staff delete.
drop policy if exists "threads_read" on public.threads;
create policy "threads_read" on public.threads for select using (true);

drop policy if exists "threads_insert_self" on public.threads;
create policy "threads_insert_self" on public.threads for insert
  with check (auth.uid() = author_id);

drop policy if exists "threads_update_self_or_staff" on public.threads;
create policy "threads_update_self_or_staff" on public.threads for update
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and role <> 'member')
  );

drop policy if exists "threads_delete_self_or_staff" on public.threads;
create policy "threads_delete_self_or_staff" on public.threads for delete
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and role <> 'member')
  );

-- Posts: same pattern as threads.
drop policy if exists "posts_read" on public.posts;
create policy "posts_read" on public.posts for select using (true);

drop policy if exists "posts_insert_self" on public.posts;
create policy "posts_insert_self" on public.posts for insert
  with check (auth.uid() = author_id);

drop policy if exists "posts_update_self" on public.posts;
create policy "posts_update_self" on public.posts for update
  using (auth.uid() = author_id);

drop policy if exists "posts_delete_self_or_staff" on public.posts;
create policy "posts_delete_self_or_staff" on public.posts for delete
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and role <> 'member')
  );

-- Reactions
drop policy if exists "reactions_read" on public.reactions;
create policy "reactions_read" on public.reactions for select using (true);

drop policy if exists "reactions_insert_self" on public.reactions;
create policy "reactions_insert_self" on public.reactions for insert
  with check (auth.uid() = user_id);

drop policy if exists "reactions_delete_self" on public.reactions;
create policy "reactions_delete_self" on public.reactions for delete
  using (auth.uid() = user_id);

-- Bookmarks: private to the user.
drop policy if exists "bookmarks_read_self" on public.bookmarks;
create policy "bookmarks_read_self" on public.bookmarks for select
  using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_self" on public.bookmarks;
create policy "bookmarks_insert_self" on public.bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_self" on public.bookmarks;
create policy "bookmarks_delete_self" on public.bookmarks for delete
  using (auth.uid() = user_id);

-- Tickets: author or staff.
drop policy if exists "tickets_read_self_or_staff" on public.tickets;
create policy "tickets_read_self_or_staff" on public.tickets for select
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and role <> 'member')
  );

drop policy if exists "tickets_insert_self" on public.tickets;
create policy "tickets_insert_self" on public.tickets for insert
  with check (auth.uid() = author_id);

drop policy if exists "tickets_update_author_or_staff" on public.tickets;
create policy "tickets_update_author_or_staff" on public.tickets for update
  using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and role <> 'member')
  );

drop policy if exists "ticket_replies_read_participants" on public.ticket_replies;
create policy "ticket_replies_read_participants" on public.ticket_replies for select
  using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_replies.ticket_id
        and (
          t.author_id = auth.uid()
          or exists (select 1 from public.profiles where id = auth.uid() and role <> 'member')
        )
    )
  );

drop policy if exists "ticket_replies_insert_participants" on public.ticket_replies;
create policy "ticket_replies_insert_participants" on public.ticket_replies for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_replies.ticket_id
        and (
          t.author_id = auth.uid()
          or exists (select 1 from public.profiles where id = auth.uid() and role <> 'member')
        )
    )
  );

-- Conversations: only participants.
drop policy if exists "conversations_read_participants" on public.conversations;
create policy "conversations_read_participants" on public.conversations for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = conversations.id and user_id = auth.uid()
    )
  );

drop policy if exists "conv_participants_read_self" on public.conversation_participants;
create policy "conv_participants_read_self" on public.conversation_participants for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.conversation_participants p
      where p.conversation_id = conversation_participants.conversation_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists "messages_read_participants" on public.messages;
create policy "messages_read_participants" on public.messages for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

drop policy if exists "messages_insert_participants" on public.messages;
create policy "messages_insert_participants" on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

-- Alerts: recipient only.
drop policy if exists "alerts_read_self" on public.alerts;
create policy "alerts_read_self" on public.alerts for select using (auth.uid() = recipient_id);

drop policy if exists "alerts_update_self" on public.alerts;
create policy "alerts_update_self" on public.alerts for update using (auth.uid() = recipient_id);

drop policy if exists "alerts_delete_self" on public.alerts;
create policy "alerts_delete_self" on public.alerts for delete using (auth.uid() = recipient_id);

drop policy if exists "alert_prefs_read_self" on public.alert_preferences;
create policy "alert_prefs_read_self" on public.alert_preferences for select using (auth.uid() = user_id);

drop policy if exists "alert_prefs_upsert_self" on public.alert_preferences;
create policy "alert_prefs_upsert_self" on public.alert_preferences for insert with check (auth.uid() = user_id);
drop policy if exists "alert_prefs_update_self" on public.alert_preferences;
create policy "alert_prefs_update_self" on public.alert_preferences for update using (auth.uid() = user_id);

-- Shouts
drop policy if exists "shouts_read" on public.shouts;
create policy "shouts_read" on public.shouts for select using (true);

drop policy if exists "shouts_insert_self" on public.shouts;
create policy "shouts_insert_self" on public.shouts for insert with check (auth.uid() = user_id);

drop policy if exists "shouts_delete_self_or_staff" on public.shouts;
create policy "shouts_delete_self_or_staff" on public.shouts for delete
  using (
    auth.uid() = user_id
    or exists (select 1 from public.profiles where id = auth.uid() and role <> 'member')
  );

-- =============================================================================
-- Helpful RPCs
-- =============================================================================

-- Increment thread views (idempotent by unique session per request).
create or replace function public.increment_thread_views(p_thread_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.threads set views = views + 1 where id = p_thread_id;
$$;

grant execute on function public.increment_thread_views(uuid) to authenticated;
grant execute on function public.increment_thread_views(uuid) to anon;

-- Open or fetch a 1:1 conversation between auth.uid() and another user.
create or replace function public.open_conversation(p_with uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_with = auth.uid() then
    raise exception 'cannot_open_with_self';
  end if;

  -- Find existing 1:1 conversation
  select c.id into v_id
  from public.conversations c
  join public.conversation_participants p1 on p1.conversation_id = c.id and p1.user_id = auth.uid()
  join public.conversation_participants p2 on p2.conversation_id = c.id and p2.user_id = p_with
  where (
    select count(*) from public.conversation_participants where conversation_id = c.id
  ) = 2
  limit 1;

  if v_id is not null then
    return v_id;
  end if;

  insert into public.conversations default values returning id into v_id;

  insert into public.conversation_participants (conversation_id, user_id)
  values (v_id, auth.uid()), (v_id, p_with);

  return v_id;
end;
$$;

grant execute on function public.open_conversation(uuid) to authenticated;

-- Mark a conversation as read for current user.
create or replace function public.mark_conversation_read(p_conversation uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.conversation_participants
  set last_read_at = now()
  where conversation_id = p_conversation
    and user_id = auth.uid();
$$;

grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- =============================================================================
-- Seed data: forum groups & categories matching the home page mock
-- =============================================================================

insert into public.forum_groups (id, name, position) values
  ('g-community', 'Community', 1),
  ('g-valorant',  'Valorant',  2),
  ('g-support',   'Support',   3)
on conflict (id) do update set name = excluded.name, position = excluded.position;

insert into public.forum_categories (id, group_id, title, description, icon, position) values
  ('c-announcements', 'g-community', 'Announcements', 'Official news and platform updates from the staff team.', 'megaphone', 1),
  ('c-introductions', 'g-community', 'Introductions', 'New here? Drop in and say hello to the community.',         'users', 2),
  ('c-general',       'g-community', 'General Discussion', 'Off-topic chatter, random thoughts, anything goes.',   'message-square', 3),
  ('c-val-discussion','g-valorant',  'Valorant Discussion', 'Patch notes, agent meta, ranked grind, ESL talk.',    'swords', 1),
  ('c-val-loader',    'g-valorant',  'Loader & Releases',   'Latest loader builds, supported regions and versions.', 'download', 2),
  ('c-val-config',    'g-valorant',  'Configs & Setups',    'Share crosshairs, sensitivity, and visual configs.',  'sliders', 3),
  ('c-sup-faq',       'g-support',   'Knowledge Base',      'Self-service guides, troubleshooting, FAQs.',         'book-open', 1)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  position = excluded.position;
