import '../models/sales_user.dart';
import '../models/warehouse_inventory.dart';

class InventoryService {
  const InventoryService();

  static const List<WarehouseInventory> _inventory = [
    // Bonita Natural Oak
    WarehouseInventory(
      productId: 'bonita',
      region: SalesRegion.sydney,
      stockBoxes: 328,
      stockSqm: 721.60,
    ),
    WarehouseInventory(
      productId: 'bonita',
      region: SalesRegion.melbourne,
      stockBoxes: 186,
      stockSqm: 409.20,
    ),

    // Guardian D3016
    WarehouseInventory(
      productId: 'guardian',
      region: SalesRegion.sydney,
      stockBoxes: 124,
      stockSqm: 272.80,
    ),
    WarehouseInventory(
      productId: 'guardian',
      region: SalesRegion.melbourne,
      stockBoxes: 86,
      stockSqm: 189.20,
    ),

    // AquaGlow Silver
    WarehouseInventory(
      productId: 'aquaglow',
      region: SalesRegion.sydney,
      stockBoxes: 76,
      stockSqm: 167.20,
    ),
    WarehouseInventory(
      productId: 'aquaglow',
      region: SalesRegion.melbourne,
      stockBoxes: 42,
      stockSqm: 92.40,
    ),
  ];

  List<WarehouseInventory> get inventory => List.unmodifiable(_inventory);

  List<WarehouseInventory> getForProduct(String productId) {
    return _inventory.where((item) => item.productId == productId).toList();
  }

  WarehouseInventory? getForProductAndRegion(
    String productId,
    SalesRegion region,
  ) {
    for (final item in _inventory) {
      if (item.productId == productId && item.region == region) {
        return item;
      }
    }

    return null;
  }

  int totalBoxes(String productId) {
    return getForProduct(productId)
        .fold(0, (total, item) => total + item.stockBoxes);
  }

  double totalSqm(String productId) {
    return getForProduct(productId)
        .fold(0, (total, item) => total + item.stockSqm);
  }

  bool isInStock(String productId) {
    return totalBoxes(productId) > 0;
  }
}
