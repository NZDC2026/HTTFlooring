import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:htt_flooring_app/services/inventory_service.dart';
import 'package:htt_flooring_app/models/sales_user.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await InventoryService.loadReceipts();
  });
  test('stock edits and damage persist independently by warehouse', () async {
    const service = InventoryService();
    await service.saveStockMetrics('bonita', SalesRegion.sydney, {'onHand': 300, 'damage': 4, 'reserved': 20, 'available': 276, 'area': 607.2});
    await InventoryService.loadReceipts();
    expect(service.stockMetrics('bonita', SalesRegion.sydney)['damage'], 4);
    expect(service.stockMetrics('bonita', SalesRegion.melbourne), isEmpty);
    expect(service.getForProductAndRegion('bonita', SalesRegion.sydney)!.stockBoxes, 300);
    expect(service.getForProductAndRegion('bonita', SalesRegion.sydney)!.stockSqm, 607.2);
  });
  test('invalid quantities do not overwrite saved stock', () async {
    const service = InventoryService();
    await service.saveStockMetrics('bonita', SalesRegion.sydney, {'damage': 3});
    await expectLater(service.saveStockMetrics('bonita', SalesRegion.sydney, {'damage': -1}), throwsArgumentError);
    expect(service.stockMetrics('bonita', SalesRegion.sydney)['damage'], 3);
  });
}
