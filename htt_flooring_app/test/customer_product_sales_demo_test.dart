import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:htt_flooring_app/data/customer_product_sales_demo.dart';
import 'package:htt_flooring_app/services/customer_product_sales.dart';
import 'package:htt_flooring_app/services/sales_document_service.dart';
import 'package:htt_flooring_app/widgets/customer_product_sales_card.dart';

void main() {
  final now = DateTime(2026, 10, 23, 12);
  test('demo contains all four trend states for 30 and 90 days', () {
    for (final days in [30, 90]) {
      final report = CustomerProductSales(
        documents: customerProductSalesDemo('abc', now),
        customerId: 'abc',
        now: now,
        days: days,
      );
      expect(report.products.length, 4);
      expect(report.products.where((p) => p.direction < 0).length, 1);
      expect(report.products.where((p) => p.direction == 0).length, 1);
      expect(report.products.where((p) => p.changePercent == null).length, 1);
      expect(
        report.products
            .where((p) => p.previousSqm > 0 && p.direction > 0)
            .length,
        1,
      );
    }
  });
  testWidgets(
    'empty customer shows labelled demo, switch restores actual empty data',
    (tester) async {
      final service = SalesDocumentService();
      await tester.pumpWidget(
        ChangeNotifierProvider.value(
          value: service,
          child: MaterialApp(
            home: Scaffold(
              body: SingleChildScrollView(
                child: CustomerProductSalesCard(customerId: 'abc', now: now),
              ),
            ),
          ),
        ),
      );
      expect(find.text('Sample sales for preview only'), findsOneWidget);
      expect(find.text('Up 50.0%'), findsOneWidget);
      expect(find.text('Down 50.0%'), findsOneWidget);
      expect(find.text('New'), findsOneWidget);
      expect(find.text('No change'), findsOneWidget);
      expect(service.documents, isEmpty);
      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();
      expect(find.text('Showing actual invoices'), findsOneWidget);
      expect(find.text('No product sales in these periods.'), findsOneWidget);
      expect(service.documents, isEmpty);
    },
  );
}
