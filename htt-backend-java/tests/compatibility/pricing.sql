BEGIN;
SELECT set_config('htt.company_id','00000000-0000-0000-0000-000000000001',true);
INSERT INTO pricing.price_lists(id,company_id,code) VALUES ('00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000001','STANDARD');
INSERT INTO pricing.price_list_items(id,company_id,price_list_id,product_unit_id,amount,effective_from)
SELECT '00000000-0000-0000-0000-000000000025',u.company_id,'00000000-0000-0000-0000-000000000024',u.id,50,'2026-01-01'
FROM catalog.product_units u WHERE u.product_id='00000000-0000-0000-0000-000000000017';
INSERT INTO pricing.customer_price_rules(id,company_id,customer_id,product_unit_id,method,discount_percent,effective_from)
SELECT '00000000-0000-0000-0000-000000000026',u.company_id,'00000000-0000-0000-0000-000000000011',u.id,'DISCOUNT_PERCENT',10,'2026-01-01'
FROM catalog.product_units u WHERE u.product_id='00000000-0000-0000-0000-000000000017';
COMMIT;
