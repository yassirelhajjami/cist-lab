-- Students may create notifications only for the profile owned by their
-- authenticated account. Reading and updating remain governed separately.
CREATE POLICY "Users can create their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT id
    FROM public.profiles
    WHERE user_id = (SELECT auth.uid())
  )
);
