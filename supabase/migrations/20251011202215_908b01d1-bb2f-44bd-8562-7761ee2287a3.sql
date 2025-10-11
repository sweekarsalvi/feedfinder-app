-- Allow admins to update messes for approval/verification
CREATE POLICY "Admins can update messes"
ON public.messes
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);