import 'customer_return_item.dart';

enum CustomerReturnStatus { pending, processed }

class CustomerReturn {
  const CustomerReturn({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.referenceNumber,
    required this.createdAt,
    required this.status,
    required this.items,
  });

  final String id;
  final String customerId;
  final String customerName;
  final String referenceNumber;
  final DateTime createdAt;
  final CustomerReturnStatus status;
  final List<CustomerReturnItem> items;

  int get totalQuantity => items.fold(0, (sum, item) => sum + item.quantity);
  String get statusLabel =>
      status == CustomerReturnStatus.pending ? 'Pending' : 'Processed';
}
