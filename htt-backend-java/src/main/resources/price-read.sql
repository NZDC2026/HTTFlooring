SELECT li.amount,li.id AS standard_rule,pl.inclusive,cu.fixed_price,cu.discount_percent,cu.id AS customer_rule,
              promo.amount AS promotion_price,promo.id AS promotion_rule,f.amount AS floor_price,tr.rate,
              u.conversion_to_base,u.quantity_step,t.code AS tax_code
            FROM catalog.product_units u JOIN catalog.products p ON p.company_id=u.company_id AND p.id=u.product_id AND p.status='ACTIVE' AND p.sell_enabled
            JOIN catalog.uoms m ON m.company_id=u.company_id AND m.id=u.uom_id AND m.active
            JOIN catalog.uoms bu ON bu.company_id=p.company_id AND bu.id=p.base_uom_id
            JOIN pricing.price_lists pl ON pl.company_id=u.company_id AND pl.code='STANDARD' AND pl.currency='AUD'
            JOIN pricing.price_list_items li ON li.company_id=u.company_id AND li.price_list_id=pl.id AND li.product_unit_id=u.id
              AND li.active AND li.effective_from<=:at AND (li.effective_to IS NULL OR li.effective_to>:at)
            JOIN accounting.tax_codes t ON t.company_id=p.company_id AND t.id=p.tax_code_id
            JOIN accounting.tax_rates tr ON tr.company_id=t.company_id AND tr.tax_code_id=t.id
              AND tr.effective_from<=(:at AT TIME ZONE (SELECT timezone FROM core.companies))::date
              AND (tr.effective_to IS NULL OR tr.effective_to>(:at AT TIME ZONE (SELECT timezone FROM core.companies))::date)
            LEFT JOIN pricing.customer_price_rules cu ON cu.company_id=u.company_id AND cu.customer_id=:customer AND cu.product_unit_id=u.id
              AND cu.active AND cu.effective_from<=:at AND (cu.effective_to IS NULL OR cu.effective_to>:at)
            LEFT JOIN pricing.price_floor_rules f ON f.company_id=u.company_id AND f.product_unit_id=u.id AND f.active
            LEFT JOIN LATERAL (
              SELECT pi.amount,pr.id,pr.version+pi.version AS version FROM pricing.promotion_items pi JOIN pricing.promotions pr ON pr.company_id=pi.company_id AND pr.id=pi.promotion_id
              WHERE pi.company_id=u.company_id AND pi.product_unit_id=u.id AND pi.active AND pr.active AND pr.starts_at<=:at AND pr.ends_at>:at
              ORDER BY pi.amount,pr.id LIMIT 1) promo ON true
            WHERE u.id=:unit AND u.active
