
-- 1. Add status column to profiles (default 'standard')
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'standard';

-- 2. Balance adjustments log
CREATE TABLE IF NOT EXISTS public.balance_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  reason TEXT,
  balance_after NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.balance_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins insert adjustments"
  ON public.balance_adjustments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all adjustments"
  ON public.balance_adjustments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own adjustments"
  ON public.balance_adjustments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_balance_adj_user ON public.balance_adjustments(user_id, created_at DESC);

-- 3. RPC: atomic admin credit
CREATE OR REPLACE FUNCTION public.admin_credit_user(
  _user_id UUID,
  _amount NUMERIC,
  _reason TEXT
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_balance NUMERIC;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _amount IS NULL OR _amount = 0 THEN
    RAISE EXCEPTION 'amount must be non-zero';
  END IF;

  UPDATE public.profiles
  SET balance = balance + _amount,
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING balance INTO _new_balance;

  IF _new_balance IS NULL THEN
    RAISE EXCEPTION 'user not found';
  END IF;

  INSERT INTO public.balance_adjustments (user_id, admin_id, amount, reason, balance_after)
  VALUES (_user_id, auth.uid(), _amount, _reason, _new_balance);

  RETURN _new_balance;
END;
$$;
