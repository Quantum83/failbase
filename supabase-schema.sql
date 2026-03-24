-- ============================================
-- FAILBASE — Supabase Schema
-- Last updated: Phase 2 Step 2 (Post Detail Pages)
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id uuid UNIQUE REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  title text,
  email text,
  avatar_url text,
  avatar_seed text DEFAULT 'default',
  about text DEFAULT '',
  location text DEFAULT '',
  connections integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- POSTS table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name text,
  author_title text,
  content text NOT NULL CHECK (char_length(content) BETWEEN 20 AND 1200),
  category text DEFAULT 'other',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- REACTIONS table
-- One reaction per user per post (enforced by unique constraint)
-- session_id kept as nullable legacy column, no longer used
CREATE TABLE IF NOT EXISTS public.reactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_key text NOT NULL CHECK (reaction_key IN ('yikes', 'same', 'skull', 'understandable')),
  session_id text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- COMMENTS table
-- Flat (not threaded). author_id links to profiles for algorithm use later.
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS reactions_post_id_idx ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS reactions_user_id_idx ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON public.comments(author_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Public read on everything
CREATE POLICY "Public can read profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Public can read posts"
  ON public.posts FOR SELECT USING (true);

CREATE POLICY "Public can read reactions"
  ON public.reactions FOR SELECT USING (true);

CREATE POLICY "Public can read comments"
  ON public.comments FOR SELECT USING (true);

-- Profiles: insert (used by DB trigger + OAuth callback fallback)
CREATE POLICY "Anyone can create profile"
  ON public.profiles FOR INSERT WITH CHECK (true);

-- Profiles: users can update their own
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth_id = auth.uid());

-- Posts: authenticated insert only
CREATE POLICY "Authenticated users can post"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Reactions: authenticated insert only
CREATE POLICY "Authenticated users can react"
  ON public.reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Reactions: users can update their own (required for upsert)
CREATE POLICY "Users can update own reactions"
  ON public.reactions FOR UPDATE
  USING (
    user_id = (
      SELECT id FROM public.profiles WHERE auth_id = auth.uid()
    )
  );

-- Reactions: users can delete their own
CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE
  USING (
    user_id = (
      SELECT id FROM public.profiles WHERE auth_id = auth.uid()
    )
  );

-- Comments: authenticated insert only
CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- STORAGE
-- ============================================

-- Avatars bucket (create manually in Supabase dashboard if not exists)
-- Bucket name: avatars
-- Public: true

-- Storage policies (run after creating the bucket):
-- CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Auth upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
-- CREATE POLICY "Auth update avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
-- CREATE POLICY "Auth delete avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');

-- ============================================
-- DB TRIGGER
-- Auto-creates a profile row when a new auth.users row is inserted.
-- Handles both email signup and OAuth (Google, GitHub).
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (auth_id, username, display_name, email)
  VALUES (
    NEW.id,
    lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '_', 'g'))
      || '_' || floor(random() * 9000 + 1000)::text,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA
-- Paste below to populate with fake profiles for visual richness.
-- These are also mirrored in lib/seed-data.js.
-- Do NOT use seed post IDs in real queries or algorithms.
-- ============================================

INSERT INTO public.profiles (id, username, display_name, title, avatar_seed, connections) VALUES
  ('11111111-1111-1111-1111-111111111111', 'chad_pivotmaster', 'Chad Pivotmaster', 'Ex-Founder | 4x Failed Startup Veteran | Currently Pivoting', 'Chad', 847),
  ('22222222-2222-2222-2222-222222222222', 'brenda_synergizes', 'Brenda Hoffstetter', 'Disruptive Failure Enthusiast | Ex-VP of Mistakes | Open to Opportunities', 'Brenda', 2341),
  ('33333333-3333-3333-3333-333333333333', 'kevin_blockchain', 'Kevin "Web5" Larsson', 'Blockchain Visionary | NFT Collector (Underwater) | Thought Leader', 'Kevin', 12800),
  ('44444444-4444-4444-4444-444444444444', 'patricia_disrupts', 'Patricia Dunmore-Wells', 'Serial Entrepreneur (emphasis on serial) | 3x Exit (all doors)', 'Patricia', 503),
  ('55555555-5555-5555-5555-555555555555', 'derek_hustles', 'Derek Holt', 'Chief Hustle Officer | Sleeping 3hrs/Night | Burnout Advocate', 'Derek', 9200),
  ('66666666-6666-6666-6666-666666666666', 'miranda_growth', 'Miranda "10x" Chow', 'Growth Hacker | Negative Revenue Specialist | Stanford Dropout (rejected)', 'Miranda', 445),
  ('77777777-7777-7777-7777-777777777777', 'todd_leverages', 'Todd Leveridge', 'Leveraging Leverage to Leverage Outcomes | B2B SaaS Failure Expert', 'Todd', 3100)
ON CONFLICT (id) DO NOTHING;