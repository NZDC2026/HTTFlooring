import 'product_snapshot.dart';
import 'quote.dart';

class SalesDocumentItem {
  const SalesDocumentItem({
    required this.product,
    required this.boxes,
    required this.sqm,
    required this.unitPrice,
  });

  final ProductSnapshot product;

  final int boxes;
  final double sqm;

  // Frozen selling price at the time
  // the quotation is created.
  final double unitPrice;

  double get subtotal {
    return sqm * unitPrice;
  }

  factory SalesDocumentItem.fromQuoteItem(QuoteItem item) {
    return SalesDocumentItem(
      product: ProductSnapshot.fromProduct(item.product),
      boxes: item.boxes,
      sqm: item.sqm,
      unitPrice: item.unitPrice,
    );
  }
}
