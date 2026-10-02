import 'package:flutter/foundation.dart';

import '../models/customer_product_price.dart';
import '../models/product.dart';

class PricingService extends ChangeNotifier {
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
  }) {
    for (final item in _prices) {
      if (item.customerId == customerId && item.productId == product.id) {
        return item.price;
      }
    }

    return product.standardPrice;
  }

  bool canSalesSetPrice({required Product product, required double price}) {
    return price >= product.salesFloorPrice;
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
