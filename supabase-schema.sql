-- ============================================
-- FAILBASE — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES table
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  display_name text not null,
  title text,
  avatar_seed text default 'default',
  connections integer default 0,
  created_at timestamptz default now()
);

-- POSTS table
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 20 and 1200),
  category text default 'other',
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- REACTIONS table
create table if not exists public.reactions (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  reaction_key text not null check (reaction_key in ('yikes', 'same', 'skull', 'understandable')),
  session_id text not null, -- anonymous session identifier
  created_at timestamptz default now(),
  unique(post_id, session_id, reaction_key)
);

-- COMMENTS table
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  author_name text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists reactions_post_id_idx on public.reactions(post_id);
create index if not exists comments_post_id_idx on public.comments(post_id);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;

-- Public read access to everything
create policy "Public can read profiles" on public.profiles for select using (true);
create policy "Public can read posts" on public.posts for select using (true);
create policy "Public can read reactions" on public.reactions for select using (true);
create policy "Public can read comments" on public.comments for select using (true);

-- Anyone can insert posts, reactions, comments (no auth required for now)
create policy "Anyone can post" on public.posts for insert with check (true);
create policy "Anyone can react" on public.reactions for insert with check (true);
create policy "Anyone can comment" on public.comments for insert with check (true);
create policy "Anyone can create profile" on public.profiles for insert with check (true);

-- ============================================
-- SEED DATA — Paste below to populate the feed
-- ============================================

insert into public.profiles (id, username, display_name, title, avatar_seed, connections) values
  ('11111111-1111-1111-1111-111111111111', 'chad_pivotmaster', 'Chad Pivotmaster', 'Ex-Founder | 4x Failed Startup Veteran | Currently Pivoting', 'Chad', 847),
  ('22222222-2222-2222-2222-222222222222', 'brenda_synergizes', 'Brenda Hoffstetter', 'Disruptive Failure Enthusiast | Ex-VP of Mistakes | Open to Opportunities', 'Brenda', 2341),
  ('33333333-3333-3333-3333-333333333333', 'kevin_blockchain', 'Kevin "Web5" Larsson', 'Blockchain Visionary | NFT Collector (Underwater) | Thought Leader', 'Kevin', 12800),
  ('44444444-4444-4444-4444-444444444444', 'patricia_disrupts', 'Patricia Dunmore-Wells', 'Serial Entrepreneur (emphasis on serial) | 3x Exit (all doors)', 'Patricia', 503),
  ('55555555-5555-5555-5555-555555555555', 'derek_hustles', 'Derek Holt', 'Chief Hustle Officer | Sleeping 3hrs/Night | Burnout Advocate', 'Derek', 9200),
  ('66666666-6666-6666-6666-666666666666', 'miranda_growth', 'Miranda "10x" Chow', 'Growth Hacker | Negative Revenue Specialist | Stanford Dropout (rejected)', 'Miranda', 445),
  ('77777777-7777-7777-7777-777777777777', 'todd_leverages', 'Todd Leveridge', 'Leveraging Leverage to Leverage Outcomes | B2B SaaS Failure Expert', 'Todd', 3100)
on conflict (id) do nothing;
