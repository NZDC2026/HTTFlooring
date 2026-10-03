import 'sales_user.dart';

class Customer {
  final String id;
  final String businessName;
  final String contactName;
  final String type;

  final SalesRegion region;

  final String phone;
  final String email;
  final String website;
  final String address;
  final String abn;

  final DateTime? lastOrderDate;

  final double thisMonthOrders;
  final double lastMonthOrders;
  final int thisMonthOrderCount;

  final double outstanding;
  final double overdue;
  final int oldestOverdueDays;

  final bool favourite;

  const Customer({
    required this.id,
    required this.businessName,
    required this.contactName,
    required this.type,
    required this.region,
    required this.phone,
    required this.email,
    required this.website,
    required this.address,
    required this.abn,
    required this.lastOrderDate,
    required this.thisMonthOrders,
    required this.lastMonthOrders,
    required this.thisMonthOrderCount,
    required this.outstanding,
    required this.overdue,
    required this.oldestOverdueDays,
    this.favourite = false,
  });
}
