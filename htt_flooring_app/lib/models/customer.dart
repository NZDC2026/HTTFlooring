import 'sales_user.dart';

class Customer {
  const Customer({
    required this.id,
    required this.businessName,
    required this.type,
    required this.region,
    required this.address,
    required this.abn,
    required this.lastOrderDate,
    required this.thisMonthOrders,
    required this.lastMonthOrders,
    required this.thisMonthOrderCount,
    required this.outstanding,
    required this.overdue,
    required this.oldestOverdueDays,
    required this.favourite,
  });

  final String id;

  // Company
  final String businessName;
  final String type;
  final SalesRegion region;
  final String address;
  final String abn;

  // Sales
  final DateTime? lastOrderDate;
  final double thisMonthOrders;
  final double lastMonthOrders;
  final int thisMonthOrderCount;

  // Financial
  final double outstanding;
  final double overdue;
  final int oldestOverdueDays;

  final bool favourite;
}
