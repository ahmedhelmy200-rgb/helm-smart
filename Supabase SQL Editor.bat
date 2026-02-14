-- 1) Deadlines / Reminders
create table if not exists public.deadlines (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  client_id uuid null,
  case_id uuid null,
  title text not null,
  description text null,
  due_at timestamptz not null,
  remind_at timestamptz null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Device tokens (for push later)
create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  device_name text null,
  push_token text null,
  created_at timestamptz not null default now()
);

-- 3) Notification queue (server creates; UI reads)
create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  message text not null,
  related_type text null, -- 'deadline'/'invoice'/...
  related_id uuid null,
  scheduled_for timestamptz not null,
  sent_at timestamptz null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- updated_at trigger (لو عندك public.touch_updated_at استخدمه)
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_deadlines_updated_at on public.deadlines;
create trigger trg_deadlines_updated_at
before update on public.deadlines
for each row execute function public.touch_updated_at();

-- RLS (مبدئي: كل مستخدم يرى بياناته فقط)
alter table public.deadlines enable row level security;
alter table public.user_devices enable row level security;
alter table public.notification_queue enable row level security;

drop policy if exists "deadlines_owner" on public.deadlines;
create policy "deadlines_owner"
on public.deadlines
for all
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "devices_owner" on public.user_devices;
create policy "devices_owner"
on public.user_devices
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "queue_owner" on public.notification_queue;
create policy "queue_owner"
on public.notification_queue
for select
using (auth.uid() = user_id);
