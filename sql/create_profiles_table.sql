-- Create profiles table for user information
-- This table stores additional user profile data beyond what's in auth.users

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Users can view all profiles (for checkout transparency)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create a profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
DROP TRIGGER IF EXISTS handle_updated_at ON profiles;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert some sample profile data for testing (optional)
-- These would normally be created when users sign up
INSERT INTO profiles (id, full_name, email, phone) VALUES
  ('12345678-1234-1234-1234-123456789012', 'John Doe', 'john.doe@example.com', '+1-555-123-4567'),
  ('87654321-4321-4321-4321-210987654321', 'Jane Smith', 'jane.smith@example.com', '+1-555-987-6543'),
  ('abcdefab-cdef-abcd-efab-cdefabcdefab', 'Bob Johnson', 'bob.johnson@example.com', '+1-555-555-5555')
ON CONFLICT (id) DO NOTHING;
