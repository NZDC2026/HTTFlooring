import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';

import '../models/customer_product_price.dart';
import '../models/product.dart';

class PricingService extends ChangeNotifier {
  PricingService() {
    _pricesReady = _loadPeriods();
    ready = Future.wait([_loadLevels(), _pricesReady]);
  }
  late final Future<void> ready;
  late final Future<void> _pricesReady;
  final List<Map<String, dynamic>> _periods = [];
  final Map<String, String> _levels = {};
  String customerLevel(String id) => _levels[id] ?? 'Normal';
  Future<void> _loadPeriods() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _periods.addAll(
        (jsonDecode(prefs.getString('sales-price-periods') ?? '[]') as List)
            .map((r) => Map<String, dynamic>.from(r as Map)),
      );
      if (!_disposed) notifyListeners();
    } catch (_) {}
  }

  Future<void> savePricePeriods({
    required String customerId,
    required Map<Product, double> prices,
    required DateTime from,
    DateTime? until,
  }) async {
    await ready;
    if (until != null && _priceDay(until).isBefore(_priceDay(from))) {
      throw ArgumentError('End date cannot be before start date.');
    }
    if (prices.entries.any(
      (e) =>
          !e.value.isFinite ||
          e.value <= 0 ||
          !canSalesSetPrice(product: e.key, price: e.value),
    )) {
      throw ArgumentError('Price is below the sales floor price.');
    }
    final added = [
      for (final e in prices.entries)
        <String, dynamic>{
          'customerId': customerId,
          'productId': e.key.id,
          'price': e.value,
          'previous': getCustomerPrice(
            customerId: customerId,
            product: e.key,
            at: DateTime(1900),
          ),
          'from': _priceDay(from).toIso8601String(),
          'until': until == null ? null : _priceDay(until).toIso8601String(),
        },
    ];
    final next = [..._periods, ...added];
    await (await SharedPreferences.getInstance()).setString(
      'sales-price-periods',
      jsonEncode(next),
    );
    _periods.addAll(added);
    if (!_disposed) notifyListeners();
  }

  void seedReferencePrices(String customerId, Map<Product, double> values) {
    var changed = false;
    for (final e in values.entries) {
      if (_prices.any(
        (r) => r.customerId == customerId && r.productId == e.key.id,
      )) {
        continue;
      }
      if (e.value < e.key.salesFloorPrice) continue;
      _prices.add(
        CustomerProductPrice(
          customerId: customerId,
          productId: e.key.id,
          price: e.value,
        ),
      );
      changed = true;
    }
    if (changed && !_disposed) notifyListeners();
  }

  bool _disposed = false;
  Future<void> _loadLevels() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _levels.addAll(
        Map<String, String>.from(
          jsonDecode(prefs.getString('sales-customer-price-levels') ?? '{}')
              as Map,
        ),
      );
      if (!_disposed) notifyListeners();
    } catch (_) {}
  }

  Future<void> setCustomerLevel(String customerId, String level) async {
    if (!['Normal', 'VIP', 'VVIP', 'Container'].contains(level)) {
      throw ArgumentError('Unknown price level');
    }
    _levels[customerId] = level;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('sales-customer-price-levels', jsonEncode(_levels));
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }

  final List<CustomerProductPrice> _prices = [
    const CustomerProductPrice(
      customerId: 'abc',
      productId: 'bonita',
      price: 69.00,
    ),
    const CustomerProductPrice(
      customerId: 'abc',
      productId: 'guardian',
      price: 47.50,
    ),
    const CustomerProductPrice(
      customerId: 'abc',
      productId: 'aquaglow',
      price: 44.00,
    ),
    const CustomerProductPrice(
      customerId: 'timber',
      productId: 'bonita',
      price: 72.00,
    ),
    const CustomerProductPrice(
      customerId: 'timber',
      productId: 'guardian',
      price: 49.00,
    ),
  ];

  double getCustomerPrice({
    required String customerId,
    required Product product,
    DateTime? at,
  }) {
    final override = getCustomerPriceOverride(
      customerId: customerId,
      product: product,
      at: at,
    );
    if (override != null) return override;
    final factor = switch (_levels[customerId]) {
      'VIP' => .9,
      'VVIP' => .85,
      'Container' => .8,
      _ => 1.0,
    };
    final price = product.standardPrice * factor;
    return price < product.salesFloorPrice ? product.salesFloorPrice : price;
  }

  double? getCustomerPriceOverride({
    required String customerId,
    required Product product,
    DateTime? at,
  }) {
    final day = _priceDay(at ?? DateTime.now());
    for (final row in _periods.reversed) {
      if (row['customerId'] != customerId || row['productId'] != product.id) {
        continue;
      }
      final from = DateTime.tryParse('${row['from']}');
      final until = DateTime.tryParse('${row['until']}');
      if (from == null ||
          day.isBefore(from) ||
          (until != null && day.isAfter(until))) {
        continue;
      }
      final price = row['price'];
      if (price is num && price.isFinite && price >= product.salesFloorPrice) {
        return price.toDouble();
      }
    }
    for (final item in _prices) {
      if (item.customerId == customerId && item.productId == product.id) {
        return item.price;
      }
    }

    for (final row in _periods.reversed) {
      if (row['customerId'] != customerId || row['productId'] != product.id) {
        continue;
      }
      final previous = row['previous'];
      if (previous is num &&
          previous.isFinite &&
          previous >= product.salesFloorPrice) {
        return previous.toDouble();
      }
    }
    return null;
  }

  bool canSalesSetPrice({required Product product, required double price}) {
    return price.isFinite && price > 0 && price >= product.salesFloorPrice;
  }

  void setCustomerPrice({
    required String customerId,
    required Product product,
    required double price,
  }) {
    if (!canSalesSetPrice(product: product, price: price)) {
      throw ArgumentError('Price is below the sales floor price.');
    }

    final index = _prices.indexWhere(
      (item) => item.customerId == customerId && item.productId == product.id,
    );

    final newPrice = CustomerProductPrice(
      customerId: customerId,
      productId: product.id,
      price: price,
    );

    if (index == -1) {
      _prices.add(newPrice);
    } else {
      _prices[index] = newPrice;
    }

    notifyListeners();
  }
}

DateTime _priceDay(DateTime value) =>
    DateTime(value.year, value.month, value.day);
