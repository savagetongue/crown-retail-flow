-- Initialize stock for all existing products that don't have stock records
INSERT INTO product_stock (product_id, location_id, quantity, reserved, last_movement_at)
SELECT 
  p.id,
  sl.id,
  50, -- Default initial quantity
  0,
  now()
FROM products p
CROSS JOIN stock_locations sl
WHERE NOT EXISTS (
  SELECT 1 FROM product_stock ps 
  WHERE ps.product_id = p.id AND ps.location_id = sl.id
);