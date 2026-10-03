import 'customer.dart';
import 'product.dart';

class QuoteItem {
  final Product product;

  final int boxes;
  final double sqm;

  final double unitPrice;

  const QuoteItem({
    required this.product,
    required this.boxes,
    required this.sqm,
    required this.unitPrice,
  });

  double get subtotal {
    return sqm * unitPrice;
  }
}

class Quote {
  final String number;
  final Customer customer;
  final DateTime createdAt;
  final List<QuoteItem> items;

  const Quote({
    required this.number,
    required this.customer,
    required this.createdAt,
    required this.items,
  });

  double get subtotal {
    return items.fold(0, (total, item) => total + item.subtotal);
  }

  double get gst => subtotal * 0.10;

  double get total => subtotal + gst;
}
