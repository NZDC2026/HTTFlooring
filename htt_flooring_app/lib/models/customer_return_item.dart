enum ReturnItemCondition { good, damaged }

class CustomerReturnItem {
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
