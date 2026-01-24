-- Run this in Supabase SQL Editor to set up your database

-- 1. PROFILES (Extends Auth Users)
-- Stores user coins, pro status, and plan details
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

-- 2. ORDERS (Payment History)
-- Tracks Razorpay payments for subscriptions
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

-- 3. GENERATIONS (AI Usage Log)
-- Keeps a record of all AI tools used (Image, Video, Doc) for history and limits
CREATE TABLE public.generations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tool_type text NOT NULL, -- 'image', 'video', 'doc', 'chat'
  prompt text,
  result_url text, -- Can be image URL or text result
  cost integer DEFAULT 1,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SOCIAL POSTS (Wonder Feed)
-- Stores community shared content
CREATE TABLE public.social_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  caption text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SECURITY (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Policies
-- Profiles: Public read (for feed), Owner write
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Orders: Owner read only
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Generations: Owner read/write
CREATE POLICY "Users can view own generations" ON public.generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generations" ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Social Posts: Public read, Owner write
CREATE POLICY "Posts are viewable by everyone" ON public.social_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.social_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.social_posts FOR DELETE USING (auth.uid() = user_id);

-- 6. TRIGGER (Auto-create Profile)
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