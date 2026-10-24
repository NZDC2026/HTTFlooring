CREATE SCHEMA portal;
REVOKE ALL ON SCHEMA portal FROM PUBLIC;
-- Directory marker is global, like identity.users. No application login gets table access.
CREATE TABLE identity.portal_principals(user_id uuid PRIMARY KEY REFERENCES identity.users(id),created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE identity.customer_user_grants ADD COLUMN portal_enabled boolean NOT NULL DEFAULT false;
CREATE TABLE identity.customer_user_warehouse_scopes(
 company_id uuid NOT NULL,grant_id uuid NOT NULL,customer_branch_id uuid NOT NULL,warehouse_id uuid NOT NULL,
 PRIMARY KEY(company_id,grant_id,customer_branch_id,warehouse_id),
 FOREIGN KEY(company_id,grant_id,customer_branch_id) REFERENCES identity.customer_user_branch_scopes(company_id,grant_id,customer_branch_id),
 FOREIGN KEY(company_id,warehouse_id) REFERENCES catalog.warehouses(company_id,id)
);
CREATE TABLE portal.product_publications(
 company_id uuid NOT NULL,product_id uuid NOT NULL,published boolean NOT NULL DEFAULT false,all_customers boolean NOT NULL DEFAULT false,
 description text NOT NULL DEFAULT '' CHECK(length(description)<=2000),low_stock_quantity numeric(20,6) NOT NULL DEFAULT 0 CHECK(low_stock_quantity>=0),
 created_at timestamptz NOT NULL DEFAULT now(),created_by uuid NOT NULL REFERENCES identity.users(id),updated_at timestamptz NOT NULL DEFAULT now(),version bigint NOT NULL DEFAULT 1,
 PRIMARY KEY(company_id,product_id),FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id)
);
CREATE TABLE portal.product_audiences(
 company_id uuid NOT NULL,product_id uuid NOT NULL,customer_id uuid NOT NULL,PRIMARY KEY(company_id,product_id,customer_id),
 FOREIGN KEY(company_id,product_id) REFERENCES portal.product_publications(company_id,product_id),FOREIGN KEY(company_id,customer_id) REFERENCES crm.customers(company_id,id)
);
CREATE TABLE catalog.product_barcodes(
 company_id uuid NOT NULL,product_id uuid NOT NULL,barcode text NOT NULL CHECK(barcode~'^[A-Z0-9][A-Z0-9._-]{0,79}$'),
 PRIMARY KEY(company_id,barcode),FOREIGN KEY(company_id,product_id) REFERENCES catalog.products(company_id,id)
);
CREATE INDEX ON catalog.product_barcodes(company_id,product_id);
CREATE INDEX ON identity.customer_user_warehouse_scopes(company_id,warehouse_id);
CREATE INDEX ON identity.customer_user_grants(user_id,company_id) WHERE portal_enabled;
CREATE INDEX ON portal.product_audiences(company_id,customer_id,product_id);
CREATE INDEX ON portal.product_publications(company_id,product_id) WHERE published;
CREATE INDEX ON catalog.products(company_id,lower(sku),id) WHERE status='ACTIVE' AND sell_enabled AND item_type='STOCK';
DO $$ DECLARE sc text;tb text;BEGIN FOR sc,tb IN SELECT * FROM (VALUES('identity','customer_user_warehouse_scopes'),('portal','product_publications'),('portal','product_audiences'),('catalog','product_barcodes'))t(s,n) LOOP
 EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',sc,tb);EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY',sc,tb);
 EXECUTE format('CREATE POLICY company_scope ON %I.%I USING(company_id=core.current_company()) WITH CHECK(company_id=core.current_company())',sc,tb);
 END LOOP;END $$;
CREATE TRIGGER publication_version BEFORE UPDATE ON portal.product_publications FOR EACH ROW EXECUTE FUNCTION core.touch_version();
CREATE FUNCTION identity.guard_portal_membership() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$ BEGIN
 PERFORM 1 FROM identity.users WHERE id=NEW.user_id FOR UPDATE;
 IF EXISTS(SELECT 1 FROM identity.portal_principals WHERE user_id=NEW.user_id) THEN RAISE EXCEPTION 'Customer portal principals cannot acquire staff membership' USING ERRCODE='23514';END IF;RETURN NEW;
END $$;
CREATE TRIGGER portal_membership_boundary BEFORE INSERT OR UPDATE OF user_id ON identity.memberships FOR EACH ROW EXECUTE FUNCTION identity.guard_portal_membership();
CREATE OR REPLACE FUNCTION identity.resolve_access(p_issuer text,p_subject text)
RETURNS TABLE(user_id uuid,company_id uuid,company_name text,membership_id uuid,permissions text[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT u.id,c.id,c.name,m.id,coalesce(array_agg(DISTINCT rp.permission_code) FILTER(WHERE rp.permission_code IS NOT NULL),ARRAY[]::text[])
 FROM identity.users u JOIN identity.memberships m ON m.user_id=u.id AND m.active JOIN core.companies c ON c.id=m.company_id
 LEFT JOIN identity.membership_roles mr ON mr.membership_id=m.id AND mr.company_id=m.company_id
 LEFT JOIN identity.role_permissions rp ON rp.role_id=mr.role_id AND rp.company_id=mr.company_id
 WHERE u.issuer=p_issuer AND u.subject=p_subject AND u.active AND NOT EXISTS(SELECT 1 FROM identity.portal_principals WHERE user_id=u.id)
 GROUP BY u.id,c.id,c.name,m.id
$$;
INSERT INTO identity.permissions(code,description) VALUES('portal.access.read','Read portal authorization for authorized customers'),('portal.access.manage','Provision customer identities and replace explicit branch/warehouse grants'),('portal.catalog.write','Publish explicit customer-facing product catalogue');
CREATE FUNCTION identity.seed_portal_roles(c uuid) RETURNS void LANGUAGE sql SET search_path=pg_catalog AS $$
 INSERT INTO identity.role_permissions(company_id,role_id,permission_code) SELECT c,r.id,p.code FROM identity.roles r CROSS JOIN identity.permissions p WHERE r.company_id=c AND
 ((r.code='ADMIN' AND p.code IN('portal.access.read','portal.access.manage','portal.catalog.write')) OR(r.code='OFFICE' AND p.code IN('portal.access.read','portal.catalog.write'))) ON CONFLICT DO NOTHING
$$;
DO $$ DECLARE c uuid;BEGIN FOR c IN SELECT id FROM core.companies LOOP PERFORM set_config('htt.company_id',c::text,true);PERFORM identity.seed_portal_roles(c);END LOOP;PERFORM set_config('htt.company_id','',true);END $$;

CREATE FUNCTION portal.replace_scopes(g uuid,cust uuid,enabled boolean,scopes jsonb) RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();entry jsonb;w jsonb;b uuid;BEGIN
 IF scopes IS NULL OR jsonb_typeof(scopes)<>'array' OR jsonb_array_length(scopes)>20 OR (enabled AND jsonb_array_length(scopes)=0) OR EXISTS(SELECT 1 FROM jsonb_array_elements(scopes)x GROUP BY x->>'branchId' HAVING count(*)>1) THEN RAISE EXCEPTION 'Provide up to 20 distinct branches; enabled access requires explicit scopes' USING ERRCODE='HC422';END IF;
 PERFORM 1 FROM crm.customers WHERE company_id=c AND id=cust AND (NOT enabled OR status='ACTIVE') FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Active customer required to enable portal access' USING ERRCODE='HC422';END IF;
 FOR entry IN SELECT * FROM jsonb_array_elements(scopes) LOOP
  b:=(entry->>'branchId')::uuid;
  IF b IS NULL OR jsonb_typeof(entry->'warehouseIds') IS DISTINCT FROM 'array' OR jsonb_array_length(entry->'warehouseIds') NOT BETWEEN 1 AND 20 OR EXISTS(SELECT 1 FROM jsonb_array_elements_text(entry->'warehouseIds')x GROUP BY x HAVING count(*)>1) THEN RAISE EXCEPTION 'Each branch needs 1..20 distinct warehouses' USING ERRCODE='HC422';END IF;
  PERFORM 1 FROM crm.customer_branches WHERE company_id=c AND id=b AND customer_id=cust AND active FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Branch unavailable for this customer' USING ERRCODE='HC422';END IF;
  FOR w IN SELECT * FROM jsonb_array_elements(entry->'warehouseIds') LOOP
   PERFORM 1 FROM catalog.warehouses WHERE company_id=c AND id=(w#>>'{}')::uuid AND active AND kind='SELLABLE' FOR SHARE;
   IF NOT FOUND THEN RAISE EXCEPTION 'Only active sellable warehouses in this company may be granted' USING ERRCODE='HC422';END IF;
  END LOOP;
 END LOOP;
 DELETE FROM identity.customer_user_warehouse_scopes WHERE company_id=c AND grant_id=g;
 DELETE FROM identity.customer_user_branch_scopes WHERE company_id=c AND grant_id=g;
 FOR entry IN SELECT * FROM jsonb_array_elements(scopes) LOOP
  b:=(entry->>'branchId')::uuid;
  INSERT INTO identity.customer_user_branch_scopes(company_id,grant_id,customer_branch_id,created_by) VALUES(c,g,b,core.current_actor());
  INSERT INTO identity.customer_user_warehouse_scopes(company_id,grant_id,customer_branch_id,warehouse_id) SELECT c,g,b,x.value::uuid FROM jsonb_array_elements_text(entry->'warehouseIds')x;
 END LOOP;
END $$;
CREATE FUNCTION portal.create_access(cust uuid,iss text,sub text,display text,enabled boolean,scopes jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE u uuid;g uuid:=gen_random_uuid();c uuid:=core.current_company();BEGIN
 PERFORM purchase.require_access('portal.access.manage');PERFORM sales.require_customer_access('customers.read',cust);
 IF iss IS NULL OR length(iss) NOT BETWEEN 1 AND 500 OR iss!~'^https://' OR sub IS NULL OR length(sub) NOT BETWEEN 1 AND 255 OR display IS NULL OR length(display) NOT BETWEEN 1 AND 200 OR enabled IS NULL THEN RAISE EXCEPTION 'Verified HTTPS issuer, opaque subject, display name and enabled flag required' USING ERRCODE='HC422';END IF;
 INSERT INTO identity.users(issuer,subject,display_name) VALUES(iss,sub,display) ON CONFLICT(issuer,subject) DO NOTHING;
 SELECT id INTO u FROM identity.users WHERE issuer=iss AND subject=sub FOR UPDATE;
 IF EXISTS(SELECT 1 FROM identity.memberships WHERE user_id=u) OR NOT EXISTS(SELECT 1 FROM identity.users WHERE id=u AND active) THEN RAISE EXCEPTION 'Staff or disabled identities cannot become portal principals' USING ERRCODE='HC409';END IF;
 IF enabled AND (SELECT count(*) FROM identity.customer_user_grants WHERE user_id=u AND portal_enabled)>=100 THEN RAISE EXCEPTION 'A portal principal may have at most 100 enabled contexts' USING ERRCODE='HC422';END IF;
 INSERT INTO identity.portal_principals(user_id) VALUES(u) ON CONFLICT DO NOTHING;
 INSERT INTO identity.customer_user_grants(id,company_id,user_id,customer_id,portal_enabled,created_by) VALUES(g,c,u,cust,enabled,core.current_actor());
 PERFORM portal.replace_scopes(g,cust,enabled,scopes);RETURN g;
END $$;
CREATE FUNCTION portal.update_access(g uuid,expected bigint,enabled boolean,scopes jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE grant_row identity.customer_user_grants;BEGIN
 PERFORM purchase.require_access('portal.access.manage');
 SELECT * INTO grant_row FROM identity.customer_user_grants WHERE company_id=core.current_company() AND id=g FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Grant unavailable' USING ERRCODE='HT404';END IF;
 PERFORM sales.require_customer_access('customers.read',grant_row.customer_id);
 IF grant_row.version<>expected THEN RAISE EXCEPTION 'Grant version changed' USING ERRCODE='HC409';END IF;
 PERFORM 1 FROM identity.users WHERE id=grant_row.user_id FOR UPDATE;
 IF NOT EXISTS(SELECT 1 FROM identity.portal_principals WHERE user_id=grant_row.user_id) THEN RAISE EXCEPTION 'Legacy grants need explicit identity provisioning' USING ERRCODE='HC409';END IF;
 IF enabled AND NOT grant_row.portal_enabled AND (SELECT count(*) FROM identity.customer_user_grants WHERE user_id=grant_row.user_id AND portal_enabled)>=100 THEN RAISE EXCEPTION 'Too many enabled contexts' USING ERRCODE='HC422';END IF;
 PERFORM portal.replace_scopes(g,grant_row.customer_id,enabled,scopes);
 UPDATE identity.customer_user_grants SET portal_enabled=enabled WHERE company_id=core.current_company() AND id=g;
END $$;
CREATE FUNCTION portal.access_view(g uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE gr identity.customer_user_grants;result jsonb;BEGIN
 PERFORM purchase.require_access('portal.access.read');SELECT * INTO gr FROM identity.customer_user_grants WHERE company_id=core.current_company() AND id=g;
 IF NOT FOUND THEN RAISE EXCEPTION 'Grant unavailable' USING ERRCODE='HT404';END IF;PERFORM sales.require_customer_access('customers.read',gr.customer_id);
 SELECT jsonb_build_object('id',gr.id,'customerId',gr.customer_id,'userId',gr.user_id,'issuer',u.issuer,'subject',u.subject,'displayName',u.display_name,'enabled',gr.portal_enabled,'version',gr.version,
  'branches',coalesce((SELECT jsonb_agg(jsonb_build_object('branchId',b.customer_branch_id,'warehouseIds',(SELECT jsonb_agg(w.warehouse_id ORDER BY w.warehouse_id) FROM identity.customer_user_warehouse_scopes w WHERE w.company_id=gr.company_id AND w.grant_id=gr.id AND w.customer_branch_id=b.customer_branch_id)) ORDER BY b.customer_branch_id) FROM identity.customer_user_branch_scopes b WHERE b.company_id=gr.company_id AND b.grant_id=gr.id),'[]'::jsonb)) INTO result FROM identity.users u WHERE id=gr.user_id;RETURN result;
END $$;
CREATE FUNCTION portal.publish_product(p uuid,expected bigint,published boolean,all_customers boolean,description text,low_quantity numeric,customers uuid[],barcodes text[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c uuid:=core.current_company();current_version bigint;x uuid;BEGIN
 PERFORM purchase.require_access('portal.catalog.write');PERFORM purchase.require_access('catalog.write');PERFORM purchase.require_access('customers.all');
 PERFORM 1 FROM catalog.products WHERE company_id=c AND id=p AND item_type='STOCK' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Stock product unavailable' USING ERRCODE='HT404';END IF;
 IF published IS NULL OR all_customers IS NULL OR description IS NULL OR length(description)>2000 OR low_quantity IS NULL OR low_quantity<0 OR low_quantity<>round(low_quantity,6) OR customers IS NULL OR cardinality(customers)>100 OR barcodes IS NULL OR cardinality(barcodes)>20 OR
  (all_customers AND cardinality(customers)>0) OR EXISTS(SELECT 1 FROM unnest(customers)a GROUP BY a HAVING count(*)>1) OR EXISTS(SELECT 1 FROM unnest(barcodes)b WHERE b IS NULL OR b!~'^[A-Z0-9][A-Z0-9._-]{0,79}$') OR EXISTS(SELECT 1 FROM unnest(barcodes)b GROUP BY b HAVING count(*)>1) THEN RAISE EXCEPTION 'Invalid explicit publication audience, threshold or barcodes' USING ERRCODE='HC422';END IF;
 FOREACH x IN ARRAY customers LOOP PERFORM 1 FROM crm.customers WHERE company_id=c AND id=x AND status='ACTIVE' FOR SHARE;IF NOT FOUND THEN RAISE EXCEPTION 'Customer audience unavailable' USING ERRCODE='HC422';END IF;END LOOP;
 IF expected IS NULL THEN
  INSERT INTO portal.product_publications(company_id,product_id,published,all_customers,description,low_stock_quantity,created_by) VALUES(c,p,published,all_customers,description,low_quantity,core.current_actor());
 ELSE
  SELECT version INTO current_version FROM portal.product_publications WHERE company_id=c AND product_id=p FOR UPDATE;
  IF current_version IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Publication unavailable or changed' USING ERRCODE='HC409';END IF;
  UPDATE portal.product_publications SET published=publish_product.published,all_customers=publish_product.all_customers,description=publish_product.description,low_stock_quantity=low_quantity WHERE company_id=c AND product_id=p;
 END IF;
 DELETE FROM portal.product_audiences WHERE company_id=c AND product_id=p;
 INSERT INTO portal.product_audiences SELECT c,p,a FROM unnest(customers)a;
 DELETE FROM catalog.product_barcodes WHERE company_id=c AND product_id=p;
 INSERT INTO catalog.product_barcodes SELECT c,p,b FROM unnest(barcodes)b;
END $$;
CREATE FUNCTION portal.publication_view(p uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;BEGIN
 PERFORM purchase.require_access('portal.catalog.write');PERFORM purchase.require_access('catalog.write');PERFORM purchase.require_access('customers.all');
 SELECT jsonb_build_object('productId',p,'published',q.published,'allCustomers',q.all_customers,'description',q.description,'lowStockQuantity',q.low_stock_quantity::text,'version',q.version,
 'customerIds',coalesce((SELECT jsonb_agg(customer_id ORDER BY customer_id) FROM portal.product_audiences WHERE company_id=q.company_id AND product_id=p),'[]'::jsonb),
 'barcodes',coalesce((SELECT jsonb_agg(barcode ORDER BY barcode) FROM catalog.product_barcodes WHERE company_id=q.company_id AND product_id=p),'[]'::jsonb)) INTO result FROM portal.product_publications q WHERE q.company_id=core.current_company() AND q.product_id=p;
 IF result IS NULL THEN RAISE EXCEPTION 'Publication unavailable' USING ERRCODE='HT404';END IF;RETURN result;
END $$;

-- Portal helpers are private. Each exposed read checks verified identity arguments again in one statement snapshot.
CREATE FUNCTION portal.principal(iss text,sub text) RETURNS uuid LANGUAGE plpgsql STABLE SET search_path=pg_catalog AS $$ DECLARE u uuid;BEGIN
 SELECT x.id INTO u FROM identity.users x JOIN identity.portal_principals p ON p.user_id=x.id WHERE x.issuer=iss AND x.subject=sub AND x.active AND NOT EXISTS(SELECT 1 FROM identity.memberships m WHERE m.user_id=x.id);
 IF u IS NULL THEN RAISE EXCEPTION 'Portal identity unavailable' USING ERRCODE='42501';END IF;RETURN u;
END $$;
CREATE FUNCTION portal.require_grant(iss text,sub text,c uuid,g uuid) RETURNS uuid LANGUAGE plpgsql STABLE SET search_path=pg_catalog AS $$ DECLARE u uuid;cust uuid;BEGIN
 u:=portal.principal(iss,sub);PERFORM set_config('htt.company_id',c::text,true);
 SELECT x.id INTO cust FROM identity.customer_user_grants a JOIN crm.customers x ON x.company_id=a.company_id AND x.id=a.customer_id AND x.status='ACTIVE' WHERE a.company_id=c AND a.id=g AND a.user_id=u AND a.portal_enabled;
 IF cust IS NULL THEN RAISE EXCEPTION 'Portal context unavailable' USING ERRCODE='42501';END IF;RETURN cust;
END $$;
CREATE FUNCTION portal.require_branch(iss text,sub text,c uuid,g uuid,b uuid) RETURNS uuid LANGUAGE plpgsql STABLE SET search_path=pg_catalog AS $$ DECLARE cust uuid;BEGIN
 cust:=portal.require_grant(iss,sub,c,g);
 IF NOT EXISTS(SELECT 1 FROM identity.customer_user_branch_scopes s JOIN crm.customer_branches x ON x.company_id=s.company_id AND x.id=s.customer_branch_id AND x.active AND x.customer_id=cust WHERE s.company_id=c AND s.grant_id=g AND s.customer_branch_id=b) THEN RAISE EXCEPTION 'Branch unavailable' USING ERRCODE='HT404';END IF;
 IF NOT EXISTS(SELECT 1 FROM identity.customer_user_warehouse_scopes s JOIN catalog.warehouses w ON w.company_id=s.company_id AND w.id=s.warehouse_id AND w.active AND w.kind='SELLABLE' WHERE s.company_id=c AND s.grant_id=g AND s.customer_branch_id=b) THEN RAISE EXCEPTION 'No active warehouse scope for this branch' USING ERRCODE='42501';END IF;RETURN cust;
END $$;
CREATE FUNCTION portal.visible_products(c uuid,cust uuid) RETURNS SETOF catalog.products LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
 SELECT p.* FROM catalog.products p JOIN portal.product_publications q ON q.company_id=p.company_id AND q.product_id=p.id AND q.published
 WHERE p.company_id=c AND p.status='ACTIVE' AND p.sell_enabled AND p.item_type='STOCK' AND (q.all_customers OR EXISTS(SELECT 1 FROM portal.product_audiences a WHERE a.company_id=c AND a.product_id=p.id AND a.customer_id=cust))
$$;
CREATE FUNCTION portal.scoped_stock(c uuid,g uuid,b uuid,p uuid) RETURNS TABLE(id uuid,code text,name text,available numeric) LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
 SELECT w.id,w.code,w.name,coalesce(x.on_hand-x.reserved,0) FROM identity.customer_user_warehouse_scopes s JOIN catalog.warehouses w ON w.company_id=s.company_id AND w.id=s.warehouse_id AND w.active AND w.kind='SELLABLE'
 LEFT JOIN inventory.stock_balances x ON x.company_id=w.company_id AND x.warehouse_id=w.id AND x.product_id=p
 WHERE s.company_id=c AND s.grant_id=g AND s.customer_branch_id=b
$$;
CREATE FUNCTION portal.stock_status(qty numeric,low_qty numeric) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT CASE WHEN qty=0 THEN 'OUT_OF_STOCK' WHEN qty<=low_qty THEN 'LOW_STOCK' ELSE 'IN_STOCK' END $$;
CREATE FUNCTION portal.product_json(c uuid,p uuid) RETURNS jsonb LANGUAGE sql STABLE SET search_path=pg_catalog AS $$
 SELECT jsonb_build_object('id',x.id,'sku',x.sku,'name',x.name,'baseUnit',u.code,'wholePacks',x.whole_packs,'description',q.description,'catalogVersion',q.version,
 'category',CASE WHEN ct.id IS NOT NULL THEN jsonb_build_object('id',ct.id,'code',ct.code,'name',ct.name) END)
 FROM catalog.products x JOIN catalog.uoms u ON u.company_id=x.company_id AND u.id=x.base_uom_id AND u.active JOIN portal.product_publications q ON q.company_id=x.company_id AND q.product_id=x.id
 LEFT JOIN catalog.product_categories ct ON ct.company_id=x.company_id AND ct.id=x.category_id AND ct.active WHERE x.company_id=c AND x.id=p
$$;
CREATE FUNCTION portal.me(iss text,sub text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE u uuid;g record;context jsonb;contexts jsonb:='[]';BEGIN
 u:=portal.principal(iss,sub);
 FOR g IN SELECT * FROM identity.customer_user_grants WHERE user_id=u AND portal_enabled ORDER BY company_id,id LOOP
  PERFORM set_config('htt.company_id',g.company_id::text,true);
  SELECT jsonb_build_object('companyId',c.id,'companyName',c.name,'grantId',g.id,'grantVersion',g.version,'customerId',x.id,'customerCode',x.code,'customerName',p.legal_name) INTO context
   FROM core.companies c JOIN crm.customers x ON x.company_id=c.id AND x.id=g.customer_id AND x.status='ACTIVE' JOIN crm.parties p ON p.company_id=x.company_id AND p.id=x.party_id WHERE c.id=g.company_id;
  IF context IS NOT NULL THEN contexts:=contexts||jsonb_build_array(context);END IF;
 END LOOP;RETURN jsonb_build_object('contexts',contexts,'dataAsOf',statement_timestamp());
END $$;
CREATE FUNCTION portal.branches(iss text,sub text,c uuid,g uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE cust uuid;items jsonb;BEGIN cust:=portal.require_grant(iss,sub,c,g);
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',b.id,'code',b.code,'name',b.name,'addressLine1',b.address_line1,'suburb',b.suburb,'state',b.state,'postcode',b.postcode,'country',b.country) ORDER BY b.code,b.id),'[]'::jsonb) INTO items
 FROM identity.customer_user_branch_scopes s JOIN crm.customer_branches b ON b.company_id=s.company_id AND b.id=s.customer_branch_id AND b.customer_id=cust AND b.active WHERE s.company_id=c AND s.grant_id=g;
 RETURN jsonb_build_object('customerId',cust,'grantId',g,'items',items,'dataAsOf',statement_timestamp());END $$;
CREATE FUNCTION portal.warehouses(iss text,sub text,c uuid,g uuid,b uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE cust uuid;items jsonb;BEGIN cust:=portal.require_branch(iss,sub,c,g,b);
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',w.id,'code',w.code,'name',w.name) ORDER BY w.code,w.id),'[]'::jsonb) INTO items FROM portal.scoped_stock(c,g,b,NULL)w;
 RETURN jsonb_build_object('customerId',cust,'branchId',b,'items',items,'dataAsOf',statement_timestamp());END $$;
CREATE FUNCTION portal.products(iss text,sub text,c uuid,g uuid,b uuid,query text,p_page int,p_size int,sort text,category uuid,p_status text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE cust uuid;pattern text;result jsonb;BEGIN cust:=portal.require_branch(iss,sub,c,g,b);
 IF p_page NOT BETWEEN 1 AND 10000 OR p_size NOT BETWEEN 1 AND 100 OR sort NOT IN('sku','name','availability_desc') OR query IS NULL OR length(query)>100 OR p_status NOT IN('ALL','IN_STOCK','LOW_STOCK','OUT_OF_STOCK') THEN RAISE EXCEPTION 'Invalid search, paging, sort or stock filter' USING ERRCODE='HC422';END IF;
 pattern:='%'||replace(replace(replace(lower(query),'!','!!'),'%','!%'),'_','!_')||'%';
 WITH data AS MATERIALIZED(
  SELECT p.id,p.sku,p.name,q.low_stock_quantity,coalesce((SELECT sum(available) FROM portal.scoped_stock(c,g,b,p.id)),0) AS available
  FROM portal.visible_products(c,cust)p JOIN portal.product_publications q ON q.company_id=p.company_id AND q.product_id=p.id
  JOIN catalog.uoms u ON u.company_id=p.company_id AND u.id=p.base_uom_id AND u.active
  WHERE (category IS NULL OR p.category_id=category) AND (query='' OR lower(p.sku) LIKE pattern ESCAPE '!' OR lower(p.name) LIKE pattern ESCAPE '!' OR EXISTS(SELECT 1 FROM catalog.product_barcodes x WHERE x.company_id=c AND x.product_id=p.id AND lower(x.barcode) LIKE pattern ESCAPE '!'))
 ), filtered AS (SELECT * FROM data d WHERE p_status='ALL' OR portal.stock_status(d.available,d.low_stock_quantity)=p_status),paged AS (
  SELECT * FROM filtered ORDER BY CASE WHEN sort='availability_desc' THEN available END DESC,CASE WHEN sort='name' THEN name ELSE sku END,id LIMIT p_size OFFSET (p_page-1)*p_size
 ) SELECT jsonb_build_object('customerId',cust,'branchId',b,'page',p_page,'pageSize',p_size,'totalItems',(SELECT count(*) FROM filtered),'dataAsOf',statement_timestamp(),
 'items',coalesce((SELECT jsonb_agg(portal.product_json(c,x.id)||jsonb_build_object('available',x.available::text,'stockStatus',portal.stock_status(x.available,x.low_stock_quantity)) ORDER BY CASE WHEN sort='availability_desc' THEN x.available END DESC,CASE WHEN sort='name' THEN x.name ELSE x.sku END,x.id) FROM paged x),'[]'::jsonb)) INTO result;RETURN result;
END $$;
CREATE FUNCTION portal.product(iss text,sub text,c uuid,g uuid,b uuid,p uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE cust uuid;result jsonb;BEGIN cust:=portal.require_branch(iss,sub,c,g,b);
 IF NOT EXISTS(SELECT 1 FROM portal.visible_products(c,cust)x WHERE x.id=p) THEN RAISE EXCEPTION 'Product unavailable' USING ERRCODE='HT404';END IF;
 result:=portal.product_json(c,p);IF result IS NULL THEN RAISE EXCEPTION 'Product unavailable' USING ERRCODE='HT404';END IF;
 RETURN result||jsonb_build_object('dataAsOf',statement_timestamp(),'units',coalesce((SELECT jsonb_agg(jsonb_build_object('id',pu.id,'code',u.code,'name',u.name,'conversionToBase',pu.conversion_to_base::text,'quantityStep',pu.quantity_step::text) ORDER BY u.code,pu.id) FROM catalog.product_units pu JOIN catalog.uoms u ON u.company_id=pu.company_id AND u.id=pu.uom_id AND u.active WHERE pu.company_id=c AND pu.product_id=p AND pu.active),'[]'::jsonb),
 'barcodes',coalesce((SELECT jsonb_agg(barcode ORDER BY barcode) FROM catalog.product_barcodes WHERE company_id=c AND product_id=p),'[]'::jsonb));
END $$;
CREATE FUNCTION portal.availability(iss text,sub text,c uuid,g uuid,b uuid,p uuid,w uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE cust uuid;result jsonb;low_qty numeric;BEGIN cust:=portal.require_branch(iss,sub,c,g,b);
 IF NOT EXISTS(SELECT 1 FROM portal.visible_products(c,cust)x JOIN catalog.uoms u ON u.company_id=x.company_id AND u.id=x.base_uom_id AND u.active WHERE x.id=p) THEN RAISE EXCEPTION 'Product unavailable' USING ERRCODE='HT404';END IF;
 IF w IS NOT NULL AND NOT EXISTS(SELECT 1 FROM portal.scoped_stock(c,g,b,p)x WHERE x.id=w) THEN RAISE EXCEPTION 'Warehouse unavailable' USING ERRCODE='HT404';END IF;
 SELECT low_stock_quantity INTO low_qty FROM portal.product_publications WHERE company_id=c AND product_id=p;
 WITH stock AS MATERIALIZED(SELECT * FROM portal.scoped_stock(c,g,b,p)x WHERE w IS NULL OR x.id=w)
 SELECT jsonb_build_object('productId',p,'customerId',cust,'branchId',b,'dataAsOf',statement_timestamp(),'baseUnit',u.code,'available',coalesce((SELECT sum(available) FROM stock),0)::text,
 'stockStatus',portal.stock_status(coalesce((SELECT sum(available) FROM stock),0),low_qty),
 'warehouses',coalesce((SELECT jsonb_agg(jsonb_build_object('id',x.id,'code',x.code,'name',x.name,'available',x.available::text,'stockStatus',portal.stock_status(x.available,low_qty)) ORDER BY x.code,x.id) FROM stock x),'[]'::jsonb)) INTO result
 FROM catalog.products x JOIN catalog.uoms u ON u.company_id=x.company_id AND u.id=x.base_uom_id WHERE x.company_id=c AND x.id=p;RETURN result;
END $$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA portal FROM PUBLIC;
REVOKE ALL ON FUNCTION identity.seed_portal_roles(uuid),identity.guard_portal_membership() FROM PUBLIC;
GRANT USAGE ON SCHEMA portal TO htt_app,htt_portal;
GRANT EXECUTE ON FUNCTION portal.create_access(uuid,text,text,text,boolean,jsonb),portal.update_access(uuid,bigint,boolean,jsonb),portal.access_view(uuid),portal.publish_product(uuid,bigint,boolean,boolean,text,numeric,uuid[],text[]),portal.publication_view(uuid) TO htt_app;
GRANT EXECUTE ON FUNCTION portal.me(text,text),portal.branches(text,text,uuid,uuid),portal.warehouses(text,text,uuid,uuid,uuid),portal.products(text,text,uuid,uuid,uuid,text,int,int,text,uuid,text),portal.product(text,text,uuid,uuid,uuid,uuid),portal.availability(text,text,uuid,uuid,uuid,uuid,uuid) TO htt_portal;
