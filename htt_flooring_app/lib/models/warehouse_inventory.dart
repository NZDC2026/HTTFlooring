import 'sales_user.dart';

class WarehouseInventory {
  const WarehouseInventory({
    required this.productId,
    required this.region,
    required this.stockBoxes,
    required this.stockSqm,
  });

  final String productId;
  final SalesRegion region;
  final int stockBoxes;
  final double stockSqm;

  bool get inStock => stockBoxes > 0;

  String get statusLabel {
    if (stockBoxes <= 0) {
      return 'Out of Stock';
    }

    if (stockBoxes <= 20) {
      return 'Low Stock';
    }

    return 'In Stock';
  }
}
