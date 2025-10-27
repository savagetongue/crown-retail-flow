-- Fix search_path for initialize_product_stock function
CREATE OR REPLACE FUNCTION initialize_product_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_location_id uuid;
BEGIN
  -- Get the default CROWN location
  SELECT id INTO default_location_id
  FROM public.stock_locations
  WHERE name = 'CROWN - The Premium Mens Wear'
  LIMIT 1;
  
  -- If default location doesn't exist, get any location
  IF default_location_id IS NULL THEN
    SELECT id INTO default_location_id
    FROM public.stock_locations
    LIMIT 1;
  END IF;
  
  -- If we have a location, create initial stock record
  IF default_location_id IS NOT NULL THEN
    INSERT INTO public.product_stock (product_id, location_id, quantity, reserved, last_movement_at)
    VALUES (NEW.id, default_location_id, 0, 0, now())
    ON CONFLICT (product_id, location_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix search_path for create_invoice function
CREATE OR REPLACE FUNCTION create_invoice(
  p_created_by uuid,
  p_location_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_items jsonb,
  p_discount_percent numeric DEFAULT 0,
  p_discount_amount numeric DEFAULT 0,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(invoice_id uuid, invoice_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice_id uuid := gen_random_uuid();
  v_invoice_num text;
  v_subtotal numeric := 0;
  v_tax numeric := 0;
  v_total numeric := 0;
  item record;
  v_stock record;
  v_line_total numeric;
BEGIN
  v_invoice_num := 'CRW-' || to_char(nextval('invoice_seq'),'FM000000');

  FOR item IN SELECT * FROM jsonb_to_recordset(p_items) AS (
    product_id uuid,
    qty int,
    unit_price numeric,
    discount_amount numeric
  )
  LOOP
    IF item.qty IS NULL OR item.qty <= 0 THEN
      RAISE EXCEPTION 'Invalid qty for product %', item.product_id;
    END IF;

    SELECT * INTO v_stock FROM public.product_stock
      WHERE product_id = item.product_id AND location_id = p_location_id
      FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'No stock for product % at location %', item.product_id, p_location_id;
    END IF;

    IF v_stock.quantity - v_stock.reserved < item.qty THEN
      RAISE EXCEPTION 'Insufficient stock for product % (available %)', item.product_id, v_stock.quantity - v_stock.reserved;
    END IF;

    v_line_total := (item.unit_price * item.qty) - COALESCE(item.discount_amount, 0);
    v_subtotal := v_subtotal + v_line_total;

    UPDATE public.product_stock SET quantity = quantity - item.qty, last_movement_at = now()
      WHERE id = v_stock.id;

    INSERT INTO public.stock_movements(product_id, location_id, change, reason, reference_id, created_by)
    VALUES (item.product_id, p_location_id, -item.qty, 'sale', v_invoice_id, p_created_by);

    INSERT INTO public.invoice_items(invoice_id, product_id, qty, unit_price, discount_amount, tax_amount, line_total)
      VALUES (v_invoice_id, item.product_id, item.qty, item.unit_price, COALESCE(item.discount_amount, 0), 0, round(v_line_total::numeric, 2));
  END LOOP;

  v_tax := 0;
  v_total := v_subtotal - p_discount_amount - (v_subtotal * p_discount_percent / 100) + v_tax;
  v_total := round(v_total::numeric, 2);

  INSERT INTO public.invoices(id, invoice_number, customer_name, customer_phone, created_by, location_id,
    subtotal, discount_amount, discount_percent, tax_amount, total, notes, status, created_at)
  VALUES (v_invoice_id, v_invoice_num, p_customer_name, p_customer_phone, p_created_by, p_location_id,
    round(v_subtotal::numeric, 2), round(p_discount_amount::numeric, 2), round(p_discount_percent::numeric, 2),
    round(v_tax::numeric, 2), v_total, p_notes, 'finalized', now());

  RETURN QUERY SELECT v_invoice_id, v_invoice_num;
END;
$$;