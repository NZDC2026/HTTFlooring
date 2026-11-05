import 'sales_user.dart';

class WarehouseInventory {
  const WarehouseInventory({
    required this.productId,
    required this.region,
    required this.stockBoxes,
    required this.stockSqm,
    this.stockPieces,
  });

  final String productId;
  final SalesRegion region;
  final int stockBoxes;
  final double stockSqm;
  final int? stockPieces;

  bool get inStock => (stockPieces ?? stockBoxes) > 0;

  String get statusLabel {
    final quantity = stockPieces ?? stockBoxes;
    if (quantity <= 0) {
      return 'Out of Stock';
    }

    if (quantity <= 20) {
      return 'Low Stock';
    }

    return 'In Stock';
  }
}
