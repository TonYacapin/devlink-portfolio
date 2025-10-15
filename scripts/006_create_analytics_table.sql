-- Create analytics table for tracking profile views
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  event_data jsonb default '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.analytics enable row level security;

-- RLS Policies for analytics (only owner can view their analytics)
create policy "analytics_select_own"
  on public.analytics for select
  using (auth.uid() = user_id);

create policy "analytics_insert_public"
  on public.analytics for insert
  with check (true);

-- Create indexes
create index analytics_user_id_idx on public.analytics(user_id);
create index analytics_event_type_idx on public.analytics(event_type);
create index analytics_created_at_idx on public.analytics(created_at desc);
