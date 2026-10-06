class WarehouseOrderItem {
  WarehouseOrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.sku,
    required this.requiredBoxes,
    this.preparedBoxes = 0,
    List<String>? preparationPhotos,
  }) : preparationPhotos = preparationPhotos ?? [];

  final String id;
  final String productId;
  final String productName;
  final String sku;
  final int requiredBoxes;
  int preparedBoxes;
  final List<String> preparationPhotos;

  bool get isPrepared => preparedBoxes > 0 && preparationPhotos.length >= 2;
}
