import '../models/sales_document.dart';

class ProductSalesTrend {
  ProductSalesTrend({
    required this.productId,
    required this.name,
    required this.sku,
  });
  final String productId;
  final String name;
  final String sku;
  double currentSqm = 0;
  double previousSqm = 0;
  int currentBoxes = 0;
  int previousBoxes = 0;
  double? get changePercent =>
      previousSqm == 0 ? null : (currentSqm - previousSqm) / previousSqm * 100;
  int get direction => (currentSqm - previousSqm).abs() < 0.000001
      ? 0
      : currentSqm > previousSqm
      ? 1
      : -1;
}

/// Equal calendar-day windows, including today and excluding future invoices.
/// Counts invoice quantities once; quotations, orders and pending returns are excluded.
class CustomerProductSales {
  CustomerProductSales({
    required Iterable<SalesDocument> documents,
    required String customerId,
    required DateTime now,
    this.days = 30,
  }) {
    if (days <= 0) throw ArgumentError.value(days, 'days');
    final today = DateTime(now.year, now.month, now.day);
    end = DateTime(today.year, today.month, today.day + 1);
    start = DateTime(end.year, end.month, end.day - days);
    previousStart = DateTime(start.year, start.month, start.day - days);
    final grouped = <String, ProductSalesTrend>{};
    // Newest snapshot provides the current product display name.
    final invoices =
        documents
            .where(
              (d) =>
                  d.customer.id == customerId &&
                  d.status == SalesDocumentStatus.invoice,
            )
            .toList()
          ..sort((a, b) => _date(b).compareTo(_date(a)));
    for (final invoice in invoices) {
      final date = _date(invoice).toLocal();
      if (date.isBefore(previousStart) ||
          !date.isBefore(end) ||
          date.isAfter(now)) {
        continue;
      }
      final current = !date.isBefore(start);
      for (final item in invoice.items) {
        final trend = grouped.putIfAbsent(
          item.product.id,
          () => ProductSalesTrend(
            productId: item.product.id,
            name: item.product.name,
            sku: item.product.sku,
          ),
        );
        if (current) {
          trend.currentSqm += item.sqm;
          trend.currentBoxes += item.boxes;
        } else {
          trend.previousSqm += item.sqm;
          trend.previousBoxes += item.boxes;
        }
      }
    }
    products = grouped.values.toList()
      ..sort((a, b) {
        final byCurrent = b.currentSqm.compareTo(a.currentSqm);
        if (byCurrent != 0) return byCurrent;
        final byPrevious = b.previousSqm.compareTo(a.previousSqm);
        return byPrevious != 0 ? byPrevious : a.name.compareTo(b.name);
      });
  }
  static DateTime _date(SalesDocument d) =>
      d.invoiceDate ?? d.convertedToInvoiceAt ?? d.createdAt;
  final int days;
  late final DateTime start;
  late final DateTime end;
  late final DateTime previousStart;
  late final List<ProductSalesTrend> products;
}
