-- Auto generate SKU for already added products that don't have one
UPDATE products
SET sku = 'TG-' || UPPER(RPAD(SUBSTRING(name FROM 1 FOR 3), 3, 'X')) || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::TEXT, 4, '0')
WHERE sku IS NULL OR sku = '';
