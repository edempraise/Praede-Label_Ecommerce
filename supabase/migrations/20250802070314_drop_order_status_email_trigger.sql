-- Drop the trigger
DROP TRIGGER IF EXISTS on_order_status_update ON orders;

-- Drop the function
DROP FUNCTION IF EXISTS handle_order_status_change();
