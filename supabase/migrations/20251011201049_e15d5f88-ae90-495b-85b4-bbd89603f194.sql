-- Allow admins to view all messes (including unverified ones for approval)
CREATE POLICY "Admins can view all messes"
ON public.messes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);