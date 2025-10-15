-- Create social_links table
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  url text not null,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.social_links enable row level security;

-- RLS Policies for social_links
create policy "social_links_select_public"
  on public.social_links for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = social_links.user_id
      and profiles.is_public = true
    )
    or auth.uid() = user_id
  );

create policy "social_links_insert_own"
  on public.social_links for insert
  with check (auth.uid() = user_id);

create policy "social_links_update_own"
  on public.social_links for update
  using (auth.uid() = user_id);

create policy "social_links_delete_own"
  on public.social_links for delete
  using (auth.uid() = user_id);

-- Create indexes
create index social_links_user_id_idx on public.social_links(user_id);
create index social_links_display_order_idx on public.social_links(display_order);

-- Create updated_at trigger
create trigger update_social_links_updated_at
  before update on public.social_links
  for each row
  execute function update_updated_at_column();
