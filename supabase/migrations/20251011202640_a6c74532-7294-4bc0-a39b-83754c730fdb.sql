-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  mess_id UUID NOT NULL,
  menu_id UUID NOT NULL,
  meal_type TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  order_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_menu FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Students can create their own orders
CREATE POLICY "Students can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  student_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'student'::app_role)
);

-- Students can view their own orders
CREATE POLICY "Students can view their own orders"
ON public.orders
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Mess owners can view orders for their messes
CREATE POLICY "Mess owners can view their mess orders"
ON public.orders
FOR SELECT
USING (
  mess_id IN (
    SELECT id FROM public.messes WHERE owner_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Mess owners can update order status for their messes
CREATE POLICY "Mess owners can update their mess order status"
ON public.orders
FOR UPDATE
USING (
  mess_id IN (
    SELECT id FROM public.messes WHERE owner_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- Admins can update any order
CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create index for better performance
CREATE INDEX idx_orders_student_id ON public.orders(student_id);
CREATE INDEX idx_orders_mess_id ON public.orders(mess_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);