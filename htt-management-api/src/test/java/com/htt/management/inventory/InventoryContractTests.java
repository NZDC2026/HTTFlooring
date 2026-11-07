package com.htt.management.inventory;

import com.htt.management.inventory.contract.InventoryAvailability;
import com.htt.management.inventory.contract.InventorySource;
import com.htt.management.inventory.infrastructure.UnavailableInventorySource;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import static com.htt.management.inventory.contract.InventoryAvailability.Knowledge.*;
import static org.assertj.core.api.Assertions.*;

class InventoryContractTests {
    private static final Instant NOW = Instant.parse("2026-11-06T00:00:00Z");
    private static final UUID COMPANY = UUID.randomUUID();
    private static final UUID PRODUCT = UUID.randomUUID();
    private static final UUID WAREHOUSE = UUID.randomUUID();

    @Test
    void unavailableSourceReturnsOnlyTheRequestedWarehousesAndNeverZeroOrSampleData() {
        var ids = new HashSet<>(List.of(WAREHOUSE, UUID.randomUUID()));
        var query = new InventorySource.Query(COMPANY, PRODUCT, ids);
        ids.clear();
        var source = new UnavailableInventorySource(Clock.fixed(NOW, ZoneOffset.UTC));
        var result = source.read(query);
        assertThat(result.companyId()).isEqualTo(COMPANY);
        assertThat(result.productId()).isEqualTo(PRODUCT);
        assertThat(result.observedAt()).isEqualTo(NOW);
        assertThat(result.warehouses()).extracting(InventoryAvailability.WarehouseStock::warehouseId)
                .containsExactlyInAnyOrderElementsOf(query.warehouseIds());
        assertThat(result.warehouses()).allSatisfy(stock -> {
            assertThat(stock.knowledge()).isEqualTo(SOURCE_UNAVAILABLE);
            assertThat(stock.available()).isNull();
            assertThat(stock.unitCode()).isNull();
            assertThat(stock.sourceAsOf()).isNull();
        });
    }

    @Test
    void unknownAndRealZeroAreDistinctAndDoNotInventConversionOrStatusThresholds() {
        var unknown = new InventoryAvailability.WarehouseStock(WAREHOUSE, UNKNOWN, null, null, null);
        var zero = new InventoryAvailability.WarehouseStock(WAREHOUSE, KNOWN, BigDecimal.ZERO, "BOX", NOW);
        assertThat(unknown.available()).isNull();
        assertThat(zero.available()).isEqualByComparingTo("0");
        assertThatThrownBy(() -> new InventoryAvailability.WarehouseStock(
                WAREHOUSE, UNKNOWN, BigDecimal.ZERO, "BOX", NOW)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void knownAndStaleRequireQuantityUnitAndSourceTimeAndPreservePrecision() {
        var time = NOW.minusSeconds(600);
        var stock = new InventoryAvailability.WarehouseStock(
                WAREHOUSE, STALE, new BigDecimal("123456789.123456789"), "SQM", time);
        assertThat(stock.available().toPlainString()).isEqualTo("123456789.123456789");
        assertThat(stock.sourceAsOf()).isEqualTo(time);
        assertThatThrownBy(() -> new InventoryAvailability.WarehouseStock(WAREHOUSE, KNOWN, null, "BOX", time))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new InventoryAvailability.WarehouseStock(WAREHOUSE, STALE, BigDecimal.ONE, "", time))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new InventoryAvailability.WarehouseStock(WAREHOUSE, KNOWN, BigDecimal.ONE, "BOX", null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void snapshotsAreImmutableAndDuplicateWarehousesOrEmptyScopesCannotMasqueradeAsCompleteStock() {
        var stock = new InventoryAvailability.WarehouseStock(WAREHOUSE, UNKNOWN, null, null, null);
        var rows = new ArrayList<>(List.of(stock));
        var result = new InventoryAvailability(COMPANY, PRODUCT, rows, NOW);
        rows.clear();
        assertThat(result.warehouses()).hasSize(1);
        assertThatThrownBy(() -> result.warehouses().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> new InventoryAvailability(COMPANY, PRODUCT, List.of(stock, stock), NOW))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new InventorySource.Query(COMPANY, PRODUCT, java.util.Set.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
