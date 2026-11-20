import 'package:htt_flooring_app/screens/sales/inventory/inventory_catalog_data.dart';
import 'package:htt_flooring_app/models/sales_user.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:htt_flooring_app/services/pricing_service.dart';
import 'package:htt_flooring_app/data/mock_data.dart' as fixtures;

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));
  test('scheduled customer price is active only within its inclusive dates and survives reload', () async {
    final service = PricingService();
    await service.ready;
    final product = fixtures.products.first;
    final before = service.getCustomerPrice(
      customerId: 'abc',
      product: product,
    );
    await service.savePricePeriods(
      customerId: 'abc',
      prices: {product: 70},
      from: DateTime(2030, 1, 10),
      until: DateTime(2030, 1, 12),
    );
    expect(
      service.getCustomerPrice(
        customerId: 'abc',
        product: product,
        at: DateTime(2030, 1, 9),
      ),
      before,
    );
    expect(
      service.getCustomerPrice(
        customerId: 'abc',
        product: product,
        at: DateTime(2030, 1, 10, 23, 59),
      ),
      70,
    );
    expect(
      service.getCustomerPrice(
        customerId: 'abc',
        product: product,
        at: DateTime(2030, 1, 12, 23, 59),
      ),
      70,
    );
    expect(
      service.getCustomerPrice(
        customerId: 'abc',
        product: product,
        at: DateTime(2030, 1, 13),
      ),
      before,
    );
    final restored = PricingService();
    await restored.ready;
    expect(
      restored.getCustomerPrice(
        customerId: 'abc',
        product: product,
        at: DateTime(2030, 1, 11),
      ),
      70,
    );
    expect(
      restored.getCustomerPrice(
        customerId: 'another',
        product: product,
        at: DateTime(2030, 1, 11),
      ),
      product.standardPrice,
    );
    service.dispose();
    restored.dispose();
  });
  test('temporary colour price restores its prior customer price after expiry and reload', () async {
    final service = PricingService();
    await service.ready;
    final product = inventoryCatalog(
      demo: true,
      region: SalesRegion.sydney,
    ).first.colours[1].product;
    service.seedReferencePrices('abc', {product: 71.5});
    await service.savePricePeriods(
      customerId: 'abc',
      prices: {product: 70},
      from: DateTime(2030, 1, 10),
      until: DateTime(2030, 1, 12),
    );
    final restored = PricingService();
    await restored.ready;
    expect(
      restored.getCustomerPrice(
        customerId: 'abc',
        product: product,
        at: DateTime(2030, 1, 9),
      ),
      71.5,
    );
    expect(
      restored.getCustomerPrice(
        customerId: 'abc',
        product: product,
        at: DateTime(2030, 1, 11),
      ),
      70,
    );
    expect(
      restored.getCustomerPrice(
        customerId: 'abc',
        product: product,
        at: DateTime(2030, 1, 13),
      ),
      71.5,
    );
    service.dispose();
    restored.dispose();
  });
  test('price periods reject invalid numbers, below-floor values and reversed dates', () async {
    final service = PricingService();
    await service.ready;
    final product = fixtures.products.first;
    for (final price in [
      double.nan,
      double.infinity,
      -1.0,
      0.0,
      product.salesFloorPrice - 1,
    ]) {
      await expectLater(
        service.savePricePeriods(
          customerId: 'abc',
          prices: {product: price},
          from: DateTime(2030),
        ),
        throwsArgumentError,
      );
    }
    await expectLater(
      service.savePricePeriods(
        customerId: 'abc',
        prices: {product: 70},
        from: DateTime(2030, 2),
        until: DateTime(2030, 1),
      ),
      throwsArgumentError,
    );
    expect(service.getCustomerPrice(customerId: 'abc', product: product), 69);
    service.dispose();
  });
}
