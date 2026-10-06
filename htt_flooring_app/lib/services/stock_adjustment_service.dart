import 'package:flutter/foundation.dart';

import '../models/stock_adjustment.dart';

class StockCheckProduct {
  const StockCheckProduct({
    required this.id,
    required this.name,
    required this.sku,
    required this.systemBoxes,
  });

  final String id;
  final String name;
  final String sku;
  final int systemBoxes;
}

class StockAdjustmentService extends ChangeNotifier {
  final List<StockAdjustment> _requests = [];

  // Prototype data. Later replace this with the warehouse inventory repository/API.
  final List<StockCheckProduct> _products = const [
    StockCheckProduct(
      id: 'bonita',
      name: 'Bonita Oak',
      sku: 'BON-OAK-001',
      systemBoxes: 328,
    ),
    StockCheckProduct(
      id: 'guardian',
      name: 'Guardian',
      sku: 'GUA-001',
      systemBoxes: 124,
    ),
    StockCheckProduct(
      id: 'aquaglow',
      name: 'AquaGlow',
      sku: 'AQU-001',
      systemBoxes: 76,
    ),
  ];

  List<StockCheckProduct> get products => List.unmodifiable(_products);
  List<StockAdjustment> get requests => List.unmodifiable(_requests);
  List<StockAdjustment> get pendingRequests => _requests
      .where((request) => request.status == StockAdjustmentStatus.pending)
      .toList(growable: false);

  StockAdjustment submit({
    required String region,
    required List<StockAdjustmentLine> lines,
  }) {
    if (lines.isEmpty) {
      throw ArgumentError('At least one stock difference must be selected.');
    }

    final request = StockAdjustment(
      id: 'SA-${DateTime.now().millisecondsSinceEpoch}',
      region: region,
      createdAt: DateTime.now(),
      lines: List.unmodifiable(lines),
    );

    _requests.insert(0, request);
    notifyListeners();
    return request;
  }
}
