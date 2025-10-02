-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'mess_owner', 'admin');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS issues)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user function to also create role entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  );
  
  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.app_role, 'student')
  );
  
  RETURN NEW;
END;
$$;

-- Update messes RLS policies to use has_role function
DROP POLICY IF EXISTS "Mess owners can create messes" ON public.messes;
CREATE POLICY "Mess owners can create messes"
ON public.messes
FOR INSERT
WITH CHECK (
  owner_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) AND public.has_role(auth.uid(), 'mess_owner')
);

-- Update reviews RLS policies to use has_role function
DROP POLICY IF EXISTS "Students can create reviews" ON public.reviews;
CREATE POLICY "Students can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (
  reviewer_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) AND public.has_role(auth.uid(), 'student')
);