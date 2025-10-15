-- Create projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  long_description text,
  image_url text,
  demo_url text,
  github_url text,
  tags text[] default '{}',
  is_featured boolean default false,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.projects enable row level security;

-- RLS Policies for projects
create policy "projects_select_public"
  on public.projects for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = projects.user_id
      and profiles.is_public = true
    )
    or auth.uid() = user_id
  );

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Create indexes
create index projects_user_id_idx on public.projects(user_id);
create index projects_display_order_idx on public.projects(display_order);

-- Create updated_at trigger
create trigger update_projects_updated_at
  before update on public.projects
  for each row
  execute function update_updated_at_column();
