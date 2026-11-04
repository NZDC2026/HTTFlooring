package au.com.htt.backend;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty("htt.staff.database.url")
class ProductWrites {
    private static final UUID EMPTY_ID = new UUID(0, 0);
    private final JdbcClient jdbc;
    private final IdempotentWrite writes;
    private final StaffAudit audit;

    ProductWrites(JdbcClient jdbc, IdempotentWrite writes, StaffAudit audit) {
        this.jdbc = jdbc;
        this.writes = writes;
        this.audit = audit;
    }

    IdempotentWrite.StoredResponse create(StaffScope.CompanyAccess scope, Draft draft, String key, String requestId) {
        String sku = draft.sku() == null ? "" : draft.sku().strip().toUpperCase(Locale.ROOT);
        var units = draft.units();
        UUID base = idOrEmpty(draft.baseUomId());
        UUID tax = idOrEmpty(draft.taxCodeId());
        if (!sku.matches("[A-Z0-9][A-Z0-9_-]{0,39}") || draft.name() == null || draft.name().isBlank()
                || draft.name().length() > 200 || units == null || units.isEmpty() || units.size() > 20
                || units.stream().anyMatch(unit -> unit == null || !positive(unit.conversionToBase())
                        || !positive(unit.step()))
                || units.stream().map(unit -> idOrEmpty(unit.uomId())).distinct().count() != units.size()
                || units.stream().noneMatch(unit -> idOrEmpty(unit.uomId()).equals(base)
                        && unit.conversionToBase().compareTo(BigDecimal.ONE) == 0)) {
            throw new StaffScope.Failure(422, "invalid_product",
                    "Provide SKU, name and unique positive units, including base-unit conversion 1 (max six decimals).");
        }

        String name = draft.name().strip();
        var ordered = units.stream().sorted(Comparator.comparing(unit -> idOrEmpty(unit.uomId()).toString())).toList();
        String canonical = "{\"Sku\":" + CollaborationCreate.legacyString(sku)
                + ",\"Name\":" + CollaborationCreate.legacyString(name) + ",\"BaseUomId\":\"" + base
                + "\",\"TaxCodeId\":\"" + tax + "\",\"WholePacks\":" + draft.wholePacks()
                + ",\"Units\":[" + ordered.stream().map(Unit::canonical).collect(Collectors.joining(",")) + "]}";
        return writes.execute(scope, "POST /products", key, canonical, () -> {
            for (var unit : ordered) {
                jdbc.sql("""
                        SELECT id FROM catalog.uoms WHERE company_id=:company AND id=:uom AND active FOR SHARE
                        """).param("company", scope.companyId()).param("uom", idOrEmpty(unit.uomId()))
                        .query(UUID.class).optional().orElseThrow(() ->
                                new StaffScope.Failure(404, "not_found", "Resource is unavailable in this scope."));
            }
            UUID product = UUID.randomUUID();
            jdbc.sql("""
                    INSERT INTO catalog.products(id,company_id,sku,name,base_uom_id,tax_code_id,whole_packs,created_by)
                    VALUES (:id,:company,:sku,:name,:base,:tax,:whole,:actor)
                    """).param("id", product).param("company", scope.companyId()).param("sku", sku)
                    .param("name", name).param("base", base).param("tax", tax)
                    .param("whole", draft.wholePacks()).param("actor", scope.actorId()).update();
            for (var unit : ordered) {
                jdbc.sql("""
                        INSERT INTO catalog.product_units(company_id,product_id,uom_id,conversion_to_base,quantity_step,created_by)
                        VALUES (:company,:id,:uom,:conversion,:step,:actor)
                        """).param("company", scope.companyId()).param("id", product)
                        .param("uom", idOrEmpty(unit.uomId())).param("conversion", unit.conversionToBase())
                        .param("step", unit.step()).param("actor", scope.actorId()).update();
            }
            audit.record(scope, "foundation.product_created", "product", product, requestId, Map.of());
            return new IdempotentWrite.StoredResponse(201, "{\"id\":\"" + product + "\",\"version\":1}");
        });
    }

    private static UUID idOrEmpty(UUID value) {
        return value == null ? EMPTY_ID : value;
    }

    private static boolean positive(BigDecimal value) {
        return value != null && value.signum() > 0 && value.stripTrailingZeros().scale() <= 6;
    }

    record Draft(String sku, String name, UUID baseUomId, UUID taxCodeId, boolean wholePacks, List<Unit> units) {}

    record Unit(UUID uomId, BigDecimal conversionToBase, BigDecimal quantityStep) {
        BigDecimal step() {
            return quantityStep == null ? BigDecimal.ONE : quantityStep;
        }

        String canonical() {
            return "{\"UomId\":\"" + idOrEmpty(uomId) + "\",\"ConversionToBase\":" + conversionToBase.toPlainString()
                    + ",\"QuantityStep\":" + step().toPlainString() + "}";
        }
    }
}
