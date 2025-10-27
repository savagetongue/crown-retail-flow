-- Function to auto-initialize stock when product is created
CREATE OR REPLACE FUNCTION initialize_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  default_location_id uuid;
BEGIN
  -- Get the default CROWN location
  SELECT id INTO default_location_id
  FROM stock_locations
  WHERE name = 'CROWN - The Premium Mens Wear'
  LIMIT 1;
  
  -- If default location doesn't exist, get any location or create one
  IF default_location_id IS NULL THEN
    SELECT id INTO default_location_id
    FROM stock_locations
    LIMIT 1;
  END IF;
  
  -- If we have a location, create initial stock record
  IF default_location_id IS NOT NULL THEN
    INSERT INTO product_stock (product_id, location_id, quantity, reserved, last_movement_at)
    VALUES (NEW.id, default_location_id, 0, 0, now())
    ON CONFLICT (product_id, location_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-initialize stock for new products
DROP TRIGGER IF EXISTS auto_initialize_stock ON products;
CREATE TRIGGER auto_initialize_stock
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION initialize_product_stock();