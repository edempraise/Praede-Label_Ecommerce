-- Part 1: Order Management Enhancement
-- Add 'ready_for_delivery' to the order_status enum
-- Note: Using a transaction to handle enum alteration safely.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ready_for_delivery' AND enumtypid = 'order_status'::regtype) THEN
        ALTER TYPE order_status ADD VALUE 'ready_for_delivery' AFTER 'preparing';
    END IF;
END$$;

-- Part 2: Product Management Enhancement
-- Add is_visible column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;

-- Part 3: User Management Enhancements
-- Create user_status enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('active', 'inactive');
    END IF;
END$$;

-- Add status column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status user_status NOT NULL DEFAULT 'active';
