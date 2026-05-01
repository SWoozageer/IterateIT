-- ============================================================
-- Migration: auto-create profile on new user
-- Run this in Supabase → SQL Editor
-- ============================================================

-- Trigger function: fires whenever a row is inserted into auth.users
-- SECURITY DEFINER means it runs as the function owner (bypasses RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, org_id, full_name, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'org_id')::uuid,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  )
  ON CONFLICT (id) DO NOTHING;   -- safe to re-run; skips if profile already exists
  RETURN NEW;
END;
$$;

-- Attach the trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
