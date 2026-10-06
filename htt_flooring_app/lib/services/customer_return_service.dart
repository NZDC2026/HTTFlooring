import 'package:flutter/foundation.dart';

import '../models/customer_return.dart';
import '../models/customer_return_item.dart';

class CustomerReturnService extends ChangeNotifier {
  CustomerReturnService._();

  static final CustomerReturnService instance = CustomerReturnService._();

  final List<CustomerReturn> _returns = [];

  List<CustomerReturn> get returns => List.unmodifiable(_returns);

  List<CustomerReturn> get pending => _returns
      .where((item) => item.status == CustomerReturnStatus.pending)
      .toList(growable: false);

  List<CustomerReturn> get processed => _returns
      .where((item) => item.status == CustomerReturnStatus.processed)
      .toList(growable: false);

  CustomerReturn submit({
    required String customerId,
    required String customerName,
    required List<CustomerReturnItem> items,
  }) {
    if (items.isEmpty) {
      throw ArgumentError('At least one return item is required.');
    }
    for (final item in items) {
      if (item.quantity <= 0) {
        throw ArgumentError('Return quantity must be greater than zero.');
      }
      if (item.photoPaths.length < 2) {
        throw ArgumentError('Each return item requires at least 2 photos.');
      }
    }

    final now = DateTime.now();
    final sequence = (_returns.length + 1).toString().padLeft(4, '0');
    final result = CustomerReturn(
      id: 'return-${now.microsecondsSinceEpoch}',
      customerId: customerId,
      customerName: customerName,
      referenceNumber: 'RET-$sequence',
      createdAt: now,
      status: CustomerReturnStatus.pending,
      items: List.unmodifiable(items),
    );
    _returns.insert(0, result);
    notifyListeners();
    return result;
  }
}
