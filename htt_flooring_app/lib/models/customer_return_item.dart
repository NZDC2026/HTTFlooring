enum ReturnItemCondition { good, damaged }

class CustomerReturnItem {
  Map<String, dynamic> toJson() => {
    'productId': productId,
    'productName': productName,
    'sku': sku,
    'quantity': quantity,
    'reason': reason,
    'condition': condition.name,
    'photoPaths': photoPaths,
  };
  factory CustomerReturnItem.fromJson(Map<String, dynamic> j) =>
      CustomerReturnItem(
        productId: j['productId'] as String,
        productName: j['productName'] as String,
        sku: j['sku'] as String,
        quantity: j['quantity'] as int,
        reason: j['reason'] as String,
        condition: ReturnItemCondition.values.byName(j['condition'] as String),
        photoPaths: List<String>.from(j['photoPaths'] as List),
      );

  const CustomerReturnItem({
    required this.productId,
    required this.productName,
    required this.sku,
    required this.quantity,
    required this.reason,
    required this.condition,
    required this.photoPaths,
  });

  final String productId;
  final String productName;
  final String sku;
  final int quantity;
  final String reason;
  final ReturnItemCondition condition;
  final List<String> photoPaths;

  String get conditionLabel =>
      condition == ReturnItemCondition.good ? 'Good' : 'Damaged';
}
