-- Add foreign key constraints to orders table
ALTER TABLE public.orders
ADD CONSTRAINT orders_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT orders_mess_id_fkey 
FOREIGN KEY (mess_id) 
REFERENCES public.messes(id) 
ON DELETE CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT orders_menu_id_fkey 
FOREIGN KEY (menu_id) 
REFERENCES public.menus(id) 
ON DELETE CASCADE;