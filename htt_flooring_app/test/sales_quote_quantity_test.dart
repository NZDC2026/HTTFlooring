import 'package:flutter_test/flutter_test.dart';
import 'package:htt_flooring_app/models/sales_quote_quantity.dart';

void main() {
  test('area requests round up to complete boxes without floating-point extra boxes', () {
    final q = SalesQuoteQuantity.parse(
      '100',
      flooring: true,
      boxes: false,
      coverage: 2.2,
    )!;
    expect(q.count, 46);
    expect(q.area, closeTo(101.2, .000001));
    expect(q.requested, 100);
    expect(
      SalesQuoteQuantity.parse(
        '462',
        flooring: true,
        boxes: false,
        coverage: 2.2,
      )!.count,
      210,
    );
  });
  test('box quantities and accessory sale units remain whole numbers', () {
    final q = SalesQuoteQuantity.parse(
      '300',
      flooring: true,
      boxes: true,
      coverage: 2.2,
    )!;
    expect(q.count, 300);
    expect(q.billableQuantity, 660);
    final accessory = SalesQuoteQuantity.parse(
      '5',
      flooring: false,
      boxes: true,
    )!;
    expect(accessory.count, 5);
    expect(accessory.area, 0);
    expect(accessory.billableQuantity, 5);
    expect(
      SalesQuoteQuantity.parse(
        '1.5',
        flooring: true,
        boxes: true,
        coverage: 2.2,
      ),
      isNull,
    );
    expect(
      SalesQuoteQuantity.parse('1.5', flooring: false, boxes: true),
      isNull,
    );
  });
  test('invalid and non-finite quantities never reach quote calculations', () {
    for (final text in ['', 'NaN', 'Infinity', '-1', '0', '1e40', '1,000']) {
      expect(
        SalesQuoteQuantity.parse(
          text,
          flooring: true,
          boxes: false,
          coverage: 2.2,
        ),
        isNull,
      );
    }
    expect(
      SalesQuoteQuantity.parse('10', flooring: true, boxes: false, coverage: 0),
      isNull,
    );
  });
}
