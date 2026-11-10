import '../models/customer_rebate.dart';

class CustomerRebateService {
  const CustomerRebateService();
  // Same historical examples as customer portal; never presented as live settlements.
  List<CustomerRebate> sampleFor(String customerId) {
    if (customerId != 'abc') return [];
    return [
      for (final row in const [
        (
          'REB-2026-1038',
          true,
          350.0,
          486.72,
          1.0,
          'Monthly',
          '2026-10-01',
          '2026-10-31',
          '2026-11-05',
        ),
        (
          'REB-2026-0931',
          false,
          500.0,
          782.46,
          1.2,
          'Quarterly',
          '2026-07-01',
          '2026-09-30',
          '2026-10-12',
        ),
        (
          'REB-2026-0924',
          true,
          350.0,
          394.21,
          1.0,
          'Monthly',
          '2026-09-01',
          '2026-09-30',
          '2026-10-06',
        ),
        (
          'REB-2026-0817',
          true,
          350.0,
          562.08,
          0.9,
          'Monthly',
          '2026-08-01',
          '2026-08-31',
          '2026-09-07',
        ),
        (
          'REB-2026-0612',
          false,
          500.0,
          648.35,
          1.2,
          'Quarterly',
          '2026-04-01',
          '2026-06-30',
          '2026-07-10',
        ),
        (
          'REB-2026-0609',
          true,
          300.0,
          428.87,
          0.9,
          'Monthly',
          '2026-06-01',
          '2026-06-30',
          '2026-07-06',
        ),
      ])
        CustomerRebate(
          customerId: customerId,
          number: row.$1,
          productName: row.$2 ? 'Bonita Natural Oak' : 'Heritage Rustic Oak',
          sku: row.$2 ? 'BON-001' : 'HER-008',
          minimumQuantity: row.$3,
          settledQuantity: row.$4,
          rate: row.$5,
          cycle: row.$6,
          starts: row.$7,
          ends: row.$8,
          settledOn: row.$9,
        ),
    ];
  }
}
