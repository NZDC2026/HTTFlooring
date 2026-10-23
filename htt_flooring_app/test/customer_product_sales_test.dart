import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:htt_flooring_app/models/customer_snapshot.dart';
import 'package:htt_flooring_app/models/product_snapshot.dart';
import 'package:htt_flooring_app/models/sales_document.dart';
import 'package:htt_flooring_app/models/sales_document_item.dart';
import 'package:htt_flooring_app/models/sales_user.dart';
import 'package:htt_flooring_app/services/customer_product_sales.dart';
import 'package:htt_flooring_app/services/sales_document_service.dart';
import 'package:htt_flooring_app/widgets/customer_product_sales_card.dart';

final now = DateTime(2026, 10, 23, 12);
SalesDocument invoice(
  DateTime date,
  int boxes, {
  String customer = 'a',
  String product = 'oak',
  SalesDocumentStatus status = SalesDocumentStatus.invoice,
}) => SalesDocument(
  number: '$date-$product',
  customer: CustomerSnapshot(
    id: customer,
    businessName: customer,
    type: 'Trade',
    region: SalesRegion.sydney,
    address: '',
    abn: '',
  ),
  items: [
    SalesDocumentItem(
      product: ProductSnapshot(
        id: product,
        sku: product,
        name: product,
        category: '',
        colour: '',
        sqmPerBox: 2,
      ),
      boxes: boxes,
      sqm: boxes * 2,
      unitPrice: 10,
    ),
  ],
  createdAt: DateTime(2020),
  invoiceDate: date,
  status: status,
);
CustomerProductSales report(
  List<SalesDocument> docs, {
  DateTime? at,
  int days = 30,
}) => CustomerProductSales(
  documents: docs,
  customerId: 'a',
  now: at ?? now,
  days: days,
);

class FixtureService extends SalesDocumentService {
  List<SalesDocument> fixtures = [];
  @override
  List<SalesDocument> get documents => fixtures;
  void update(List<SalesDocument> values) {
    fixtures = values;
    notifyListeners();
  }
}

void main() {
  test(
    'sums customer invoices by product and counts each current status once',
    () {
      final result = report([
        invoice(DateTime(2026, 10, 2), 3),
        invoice(DateTime(2026, 10, 3), 2),
        invoice(DateTime(2026, 9, 1), 2),
        invoice(DateTime(2026, 10, 2), 999, customer: 'b'),
        for (final status in [
          SalesDocumentStatus.quotation,
          SalesDocumentStatus.order,
          SalesDocumentStatus.cancelled,
        ])
          invoice(DateTime(2026, 10, 2), 999, status: status),
      ]).products.single;
      expect(result.currentBoxes, 5);
      expect(result.previousBoxes, 2);
      expect(result.currentSqm, 10);
      expect(result.changePercent, 150);
      expect(result.direction, 1);
    },
  );
  test('includes prior-only products, new sales and no change without division by zero', () {
    final products = report([
      invoice(DateTime(2026, 9, 1), 5, product: 'down'),
      invoice(DateTime(2026, 10, 2), 5, product: 'new'),
      invoice(DateTime(2026, 9, 1), 3, product: 'same'),
      invoice(DateTime(2026, 10, 2), 3, product: 'same'),
    ]).products;
    expect(products.first.productId, 'new');
    expect(products.first.changePercent, isNull);
    expect(products.last.direction, -1);
    expect(products.last.changePercent, -100);
    expect(products[1].direction, 0);
    expect(products[1].changePercent, 0);
  });
  test('uses invoice date with exact non-overlapping calendar boundaries', () {
    final r = report([
      invoice(DateTime(2026, 8, 24), 999),
      invoice(DateTime(2026, 8, 25), 2),
      invoice(DateTime(2026, 9, 23, 23, 59), 3),
      invoice(DateTime(2026, 9, 24), 5),
      invoice(now, 7),
      invoice(DateTime(2026, 10, 23, 13), 999),
      invoice(DateTime(2026, 10, 24), 999),
    ]);
    expect(r.products.single.previousBoxes, 5);
    expect(r.products.single.currentBoxes, 12);
    expect(r.start, DateTime(2026, 9, 24));
    expect(r.previousStart, DateTime(2026, 8, 25));
  });
  test('90 day selection and year boundary use equal calendar windows', () {
    final r = report(
      [invoice(DateTime(2025, 12, 20), 4), invoice(DateTime(2025, 11, 10), 2)],
      at: DateTime(2026, 1, 5, 12),
      days: 30,
    );
    expect(r.products.single.currentBoxes, 4);
    expect(r.products.single.previousBoxes, 2);
    expect(
      report([
        invoice(DateTime(2026, 8, 1), 4),
      ], days: 90).products.single.currentBoxes,
      4,
    );
    expect(report([]).products, isEmpty);
  });
  testWidgets(
    'shows trends, zero baseline, responsive layout and live updates',
    (tester) async {
      tester.view.physicalSize = const Size(320, 900);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      final service = FixtureService();
      await tester.pumpWidget(
        ChangeNotifierProvider<SalesDocumentService>.value(
          value: service,
          child: MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: CustomerProductSalesCard(customerId: 'a', now: now),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();
      expect(find.text('No product sales in these periods.'), findsOneWidget);
      service.update([
        invoice(DateTime(2026, 10, 1), 3),
        invoice(DateTime(2026, 9, 1), 6),
        invoice(DateTime(2026, 10, 1), 2, product: 'new'),
      ]);
      await tester.pump();
      expect(find.text('Down 50.0%'), findsOneWidget);
      expect(find.text('New'), findsOneWidget);
      await tester.tap(find.text('Last 90 days'));
      await tester.pumpAndSettle();
      expect(find.text('12.00 m² · 6 boxes'), findsNothing);
      expect(tester.takeException(), isNull);
    },
  );
}
