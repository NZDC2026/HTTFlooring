import 'package:flutter_test/flutter_test.dart';
import 'package:htt_flooring_app/models/customer_sales_summary.dart';
import 'package:htt_flooring_app/models/sales_document.dart';
import 'package:htt_flooring_app/models/sales_document_item.dart';
import 'package:htt_flooring_app/models/product_snapshot.dart';
import 'package:htt_flooring_app/models/customer_snapshot.dart';
import 'package:htt_flooring_app/data/mock_data.dart' as fixtures;

void main() {
  test('reference period totals equal product and series totals', () {
    for (final days in [30, 90, 365]) {
      final data = CustomerSalesSummary.reference(days);
      expect(
        data.categories.fold<double>(0, (n, c) => n + c.value),
        closeTo(data.value, .001),
      );
      expect(
        data.categories.fold<double>(0, (n, c) => n + c.area),
        closeTo(data.area, .001),
      );
      expect(data.categories.fold<int>(0, (n, c) => n + c.boxes), data.boxes);
    }
    expect(CustomerSalesSummary.reference(90).value, 34673.4);
    expect(CustomerSalesSummary.reference(365).area, 1438.82);
  });
  test('selected metric changes category and series ranking without changing values', () {
    final data = CustomerSalesSummary.reference(30);
    final laminate = data.categories.firstWhere((c) => c.name == 'Laminate');
    expect(laminate.sortedSeries('Value').first.name, 'AquaGlow');
    expect(laminate.sortedSeries('m²').first.name, 'MTF');
    expect(laminate.sortedSeries('Boxes').first.name, 'MTF');
    expect(laminate.value, closeTo(2678.29, .001));
    final ninety = CustomerSalesSummary.reference(90);
    expect(ninety.sorted('Value').map((c) => c.name), [
      'Engineered',
      'Laminate',
      'Hybrid',
      'Accessories',
    ]);
  });
  test(
    'invoice analytics respect date boundaries, status and previous period',
    () {
      final customer = CustomerSnapshot.fromCustomer(fixtures.customers.first);
      SalesDocument invoice(
        String id,
        DateTime date, {
        SalesDocumentStatus status = SalesDocumentStatus.invoice,
        String colour = 'Natural Oak',
        String sku = 'BON-001',
        int boxes = 1,
      }) => SalesDocument(
        number: id,
        customer: customer,
        createdAt: date,
        invoiceDate: date,
        status: status,
        items: [
          SalesDocumentItem(
            product: ProductSnapshot(
              id: sku,
              sku: sku,
              name: 'Bonita $colour',
              category: 'Engineered Timber',
              colour: colour,
              sqmPerBox: 2.2,
            ),
            boxes: boxes,
            sqm: boxes * 2.2,
            unitPrice: 50,
          ),
        ],
      );
      final today = DateTime(2026, 11, 20);
      final summary = CustomerSalesSummary.fromInvoices(
        [
          invoice('start', DateTime(2026, 10, 22)),
          invoice(
            'today',
            DateTime(2026, 11, 20, 23, 59),
            colour: 'Coastal Oak',
            sku: 'BON-002',
          ),
          invoice('previous', DateTime(2026, 10, 21), boxes: 2),
          invoice('old', DateTime(2026, 9, 21)),
          invoice('future', DateTime(2026, 11, 21)),
          invoice('quote', today, status: SalesDocumentStatus.quotation),
          invoice('cancelled', today, status: SalesDocumentStatus.cancelled),
        ],
        today: today,
        days: 30,
      );
      expect(summary.value, closeTo(220, .0001));
      expect(summary.previousValue, closeTo(220, .0001));
      expect(summary.boxes, 2);
      expect(summary.categories.single.name, 'Engineered');
      final series = summary.categories.single.series.single;
      expect(series.name, 'Bonita');
      expect(series.colours.length, 2);
      expect(series.previousArea, 4.4);
    },
  );
  test('comparison labels handle zero and negative changes', () {
    expect(CustomerSalesSummary.change(0, 0), '—');
    expect(CustomerSalesSummary.change(1, 0), 'New');
    expect(CustomerSalesSummary.change(75, 100), 'Down 25.0%');
    expect(CustomerSalesSummary.change(150, 100), 'Up 50.0%');
  });
}
