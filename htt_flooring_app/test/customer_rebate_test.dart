import 'package:flutter_test/flutter_test.dart';
import 'package:htt_flooring_app/models/customer_rebate.dart';
import 'package:htt_flooring_app/services/customer_rebate_service.dart';

void main() {
  final records = const CustomerRebateService().sampleFor('abc');
  test('matches portal settlement totals with cents rounding', () {
    expect(records.length, 6);
    expect(records.fold<int>(0, (sum, r) => sum + r.amountCents), 348975);
  });
  test('history never leaks to another customer', () {
    expect(CustomerRebate.filter(records, 'other'), isEmpty);
    expect(const CustomerRebateService().sampleFor('other'), isEmpty);
  });
  test('search and cycle combine, newest settlements first', () {
    final result = CustomerRebate.filter(
      records,
      'abc',
      query: ' bon-001 ',
      cycle: 'Monthly',
    );
    expect(result.length, 4);
    expect(result.first.number, 'REB-2026-1038');
    expect(
      CustomerRebate.filter(
        records,
        'abc',
        query: 'REB-2026-0931',
        cycle: 'Quarterly',
      ).single.amountCents,
      93895,
    );
    expect(CustomerRebate.filter(records, 'abc', query: 'missing'), isEmpty);
  });
}
