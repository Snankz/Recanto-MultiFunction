CREATE TABLE public.products (
    "barcode" TEXT,
    "brand" TEXT,
    "bulletin" TEXT,
    "category" TEXT,
    "cest" TEXT,
    "color" TEXT,
    "composition" TEXT,
    "consistency" TEXT,
    "coverage" TEXT,
    "cure_time" TEXT,
    "drying_time" TEXT,
    "fisqp" TEXT,
    "id" TEXT PRIMARY KEY,
    "image" TEXT,
    "measure_unit" TEXT,
    "model" TEXT,
    "name" TEXT,
    "ncm" TEXT,
    "note" TEXT,
    "odor" TEXT,
    "resistance" TEXT,
    "roller" TEXT,
    "special_resistance" TEXT,
    "tonality" TEXT,
    "type" TEXT,
    "unit" TEXT,
    "usage" TEXT,
    "value" NUMERIC,
    "weight" NUMERIC
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.products FOR SELECT USING (true);
