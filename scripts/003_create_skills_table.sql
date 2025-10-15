-- Create skills table
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  proficiency_level int check (proficiency_level >= 1 and proficiency_level <= 5),
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.skills enable row level security;

-- RLS Policies for skills
create policy "skills_select_public"
  on public.skills for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = skills.user_id
      and profiles.is_public = true
    )
    or auth.uid() = user_id
  );

create policy "skills_insert_own"
  on public.skills for insert
  with check (auth.uid() = user_id);

create policy "skills_update_own"
  on public.skills for update
  using (auth.uid() = user_id);

create policy "skills_delete_own"
  on public.skills for delete
  using (auth.uid() = user_id);

-- Create indexes
create index skills_user_id_idx on public.skills(user_id);
create index skills_category_idx on public.skills(category);

-- Create updated_at trigger
create trigger update_skills_updated_at
  before update on public.skills
  for each row
  execute function update_updated_at_column();
