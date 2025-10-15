-- Create blog_posts table
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null,
  excerpt text,
  content text not null,
  cover_image_url text,
  tags text[] default '{}',
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint unique_user_slug unique(user_id, slug)
);

-- Enable RLS
alter table public.blog_posts enable row level security;

-- RLS Policies for blog_posts
create policy "blog_posts_select_published"
  on public.blog_posts for select
  using (
    (is_published = true and exists (
      select 1 from public.profiles
      where profiles.id = blog_posts.user_id
      and profiles.is_public = true
    ))
    or auth.uid() = user_id
  );

create policy "blog_posts_insert_own"
  on public.blog_posts for insert
  with check (auth.uid() = user_id);

create policy "blog_posts_update_own"
  on public.blog_posts for update
  using (auth.uid() = user_id);

create policy "blog_posts_delete_own"
  on public.blog_posts for delete
  using (auth.uid() = user_id);

-- Create indexes
create index blog_posts_user_id_idx on public.blog_posts(user_id);
create index blog_posts_slug_idx on public.blog_posts(slug);
create index blog_posts_published_at_idx on public.blog_posts(published_at desc);

-- Create updated_at trigger
create trigger update_blog_posts_updated_at
  before update on public.blog_posts
  for each row
  execute function update_updated_at_column();
