-- ============================================================
-- ADD WEIGHT COLUMN TO ORDERS
-- ============================================================

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 0.5;

-- Optional: Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'weight';
