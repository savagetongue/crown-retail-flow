-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create public access policies for all tables (for demo/development)
-- Categories
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert on categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on categories" ON public.categories FOR DELETE USING (true);

-- Products
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on products" ON public.products FOR DELETE USING (true);

-- Stock Locations
CREATE POLICY "Allow public read access on stock_locations" ON public.stock_locations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on stock_locations" ON public.stock_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on stock_locations" ON public.stock_locations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on stock_locations" ON public.stock_locations FOR DELETE USING (true);

-- Product Stock
CREATE POLICY "Allow public read access on product_stock" ON public.product_stock FOR SELECT USING (true);
CREATE POLICY "Allow public insert on product_stock" ON public.product_stock FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on product_stock" ON public.product_stock FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on product_stock" ON public.product_stock FOR DELETE USING (true);

-- Stock Movements
CREATE POLICY "Allow public read access on stock_movements" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow public insert on stock_movements" ON public.stock_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on stock_movements" ON public.stock_movements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on stock_movements" ON public.stock_movements FOR DELETE USING (true);

-- Invoices
CREATE POLICY "Allow public read access on invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow public insert on invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on invoices" ON public.invoices FOR DELETE USING (true);

-- Invoice Items
CREATE POLICY "Allow public read access on invoice_items" ON public.invoice_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert on invoice_items" ON public.invoice_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on invoice_items" ON public.invoice_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on invoice_items" ON public.invoice_items FOR DELETE USING (true);

-- Purchase Orders
CREATE POLICY "Allow public read access on purchase_orders" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert on purchase_orders" ON public.purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on purchase_orders" ON public.purchase_orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on purchase_orders" ON public.purchase_orders FOR DELETE USING (true);

-- Purchase Order Items
CREATE POLICY "Allow public read access on purchase_order_items" ON public.purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert on purchase_order_items" ON public.purchase_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on purchase_order_items" ON public.purchase_order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on purchase_order_items" ON public.purchase_order_items FOR DELETE USING (true);

-- Promotions
CREATE POLICY "Allow public read access on promotions" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on promotions" ON public.promotions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on promotions" ON public.promotions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on promotions" ON public.promotions FOR DELETE USING (true);

-- Audit Log
CREATE POLICY "Allow public read access on audit_log" ON public.audit_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert on audit_log" ON public.audit_log FOR INSERT WITH CHECK (true);

-- Profiles
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on profiles" ON public.profiles FOR DELETE USING (true);