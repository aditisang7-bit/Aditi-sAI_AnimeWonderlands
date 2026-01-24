-- Copy and paste this into your Supabase SQL Editor to set up the backend.

-- 1. Profiles Table (Stores user data, coins, and pro status)
-- This extends the default auth.users table.
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  is_pro boolean DEFAULT false,
  coins integer DEFAULT 500,
  plan_type text DEFAULT 'free',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- 2. Orders Table (Stores payment history)
CREATE TABLE public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  payment_id text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'INR',
  plan_id text,
  status text DEFAULT 'completed',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Generations History (Tracks AI usage to enforce limits or show history)
CREATE TABLE public.generations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tool_type text NOT NULL, -- e.g., 'image', 'video', 'doc'
  prompt text,
  result_url text, -- Store image URL or text summary
  cost integer DEFAULT 1,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Social Posts (For the Wonder Feed)
CREATE TABLE public.social_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  caption text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS) - CRITICAL FOR SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Profiles: 
-- Everyone can read basic profile info (needed for social feed avatars/names)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Users can insert their own profile (used during signup)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile (e.g. change name)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Orders: 
-- Users can only see their own orders
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Generations:
-- Users can only see/create their own generation history
CREATE POLICY "Users can view own generations" 
ON public.generations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" 
ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Social Posts:
-- Everyone can view posts
CREATE POLICY "Posts are viewable by everyone" 
ON public.social_posts FOR SELECT USING (true);

-- Authenticated users can create posts
CREATE POLICY "Users can create posts" 
ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update/delete ONLY their own posts
CREATE POLICY "Users can update own posts" 
ON public.social_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
ON public.social_posts FOR DELETE USING (auth.uid() = user_id);

-- 7. Automatic Profile Creation Trigger (Backup)
-- This ensures a profile is created even if the frontend signup logic misses it (e.g. via OAuth)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, coins)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 500)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();