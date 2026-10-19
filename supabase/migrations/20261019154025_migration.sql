CREATE TABLE IF NOT EXISTS public.market_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, seller_name text NOT NULL, title text NOT NULL, description text NOT NULL DEFAULT '', price numeric(10,2) NOT NULL CHECK (price > 0), category text NOT NULL, color text NOT NULL DEFAULT 'bg-meskot-gold-deep', status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','sold')), created_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS market_items_created_idx ON public.market_items (created_at DESC);

CREATE INDEX IF NOT EXISTS market_items_category_idx ON public.market_items (category);

CREATE TABLE IF NOT EXISTS public.market_saves (user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, item_id uuid NOT NULL REFERENCES public.market_items(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, item_id));

ALTER TABLE public.market_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.market_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Listings viewable by authenticated users" ON public.market_items;

CREATE POLICY "Listings viewable by authenticated users" ON public.market_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users create own listings" ON public.market_items;

CREATE POLICY "Users create own listings" ON public.market_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers update own listings" ON public.market_items;

CREATE POLICY "Sellers update own listings" ON public.market_items FOR UPDATE TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers delete own listings" ON public.market_items;

CREATE POLICY "Sellers delete own listings" ON public.market_items FOR DELETE TO authenticated USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Users see own saves" ON public.market_saves;

CREATE POLICY "Users see own saves" ON public.market_saves FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users add own saves" ON public.market_saves;

CREATE POLICY "Users add own saves" ON public.market_saves FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users remove own saves" ON public.market_saves;

CREATE POLICY "Users remove own saves" ON public.market_saves FOR DELETE TO authenticated USING (auth.uid() = user_id);

INSERT INTO public.market_items (seller_name, title, description, price, category, color) SELECT v.seller_name, v.title, v.description, v.price, v.category, v.color FROM (VALUES ('Ben Lee', 'Vintage leather jacket', 'Brown leather, size M, lightly worn.', 85::numeric, 'Fashion', 'bg-meskot-gold-deep'), ('Sofia Rossi', 'Handmade ceramic vase', 'Hand-thrown stoneware, glazed in sage.', 40::numeric, 'Home', 'bg-meskot-rose'), ('Liam Brown', 'Wireless headphones', 'Noise cancelling, 30-hour battery.', 120::numeric, 'Electronics', 'bg-meskot-sage'), ('Marcus Chen', '2015 mountain bike', 'Aluminium frame, recently serviced.', 300::numeric, 'Vehicles', 'bg-meskot-ink')) AS v(seller_name, title, description, price, category, color) WHERE NOT EXISTS (SELECT 1 FROM public.market_items);