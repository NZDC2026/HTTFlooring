import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/handover_proof.dart';

import '../models/customer_return.dart';
import '../models/customer_return_item.dart';

class CustomerReturnService extends ChangeNotifier {
  CustomerReturnService._();

  static final CustomerReturnService instance = CustomerReturnService._();

  late SharedPreferences _storage;
  Future<void> load() async {
    _storage = await SharedPreferences.getInstance();
    final raw = _storage.getString('customer_returns_v1');
    if (raw != null) {
      final restored = (jsonDecode(raw) as List)
          .map(
            (v) => CustomerReturn.fromJson(Map<String, dynamic>.from(v as Map)),
          )
          .toList();
      _returns
        ..clear()
        ..addAll(restored);
    }
  }

  Future<void> _save() async {
    final saved = await _storage.setString(
      'customer_returns_v1',
      jsonEncode(_returns.map((v) => v.toJson()).toList()),
    );
    if (!saved) throw StateError('Could not save warehouse records.');
  }

  final List<CustomerReturn> _returns = [];

  List<CustomerReturn> get returns => List.unmodifiable(_returns);

  List<CustomerReturn> get pending => _returns
      .where((item) => item.status == CustomerReturnStatus.pending)
      .toList(growable: false);

  List<CustomerReturn> get processed => _returns
      .where((item) => item.status == CustomerReturnStatus.processed)
      .toList(growable: false);

  Future<CustomerReturn> submit({
    required HandoverProof handoverProof,
    required String customerId,
    required String customerName,
    required List<CustomerReturnItem> items,
  }) async {
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
      handoverProof: handoverProof,
      id: 'return-${now.microsecondsSinceEpoch}',
      customerId: customerId,
      customerName: customerName,
      referenceNumber: 'RET-$sequence',
      createdAt: now,
      status: CustomerReturnStatus.pending,
      items: List.unmodifiable(items),
    );
    _returns.insert(0, result);
    try {
      await _save();
    } catch (_) {
      _returns.remove(result);
      rethrow;
    }
    notifyListeners();
    return result;
  }
}
