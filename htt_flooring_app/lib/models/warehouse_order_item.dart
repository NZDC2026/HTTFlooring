class WarehouseOrderItem {
  Map<String, dynamic> toJson() => {
    'id': id,
    'productId': productId,
    'productName': productName,
    'sku': sku,
    'requiredBoxes': requiredBoxes,
    'preparedBoxes': preparedBoxes,
    'preparationPhotos': preparationPhotos,
    'productChecked': productChecked,
    'quantityChecked': quantityChecked,
    'damageChecked': damageChecked,
  };
  factory WarehouseOrderItem.fromJson(Map<String, dynamic> j) =>
      WarehouseOrderItem(
        productChecked: j['productChecked'] as bool? ?? false,
        quantityChecked: j['quantityChecked'] as bool? ?? false,
        damageChecked: j['damageChecked'] as bool? ?? false,
        id: j['id'] as String,
        productId: j['productId'] as String,
        productName: j['productName'] as String,
        sku: j['sku'] as String,
        requiredBoxes: j['requiredBoxes'] as int,
        preparedBoxes: j['preparedBoxes'] as int,
        preparationPhotos: List<String>.from(j['preparationPhotos'] as List),
      );

  WarehouseOrderItem({
    required this.id,
    required this.productId,
    required this.productName,
    required this.sku,
    required this.requiredBoxes,
    this.preparedBoxes = 0,
    this.productChecked = false,
    this.quantityChecked = false,
    this.damageChecked = false,
    List<String>? preparationPhotos,
  }) : preparationPhotos = preparationPhotos ?? [];

  bool productChecked;
  bool quantityChecked;
  bool damageChecked;
  bool get checksComplete => productChecked && quantityChecked && damageChecked;

  final String id;
  final String productId;
  final String productName;
  final String sku;
  final int requiredBoxes;
  int preparedBoxes;
  final List<String> preparationPhotos;

  bool get isPrepared =>
      preparedBoxes > 0 && (checksComplete || preparationPhotos.length >= 2);
}
