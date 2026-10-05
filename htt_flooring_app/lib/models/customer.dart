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
    this.archived = false,
    this.archivedAt,
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
  final bool archived;
  final DateTime? archivedAt;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'businessName': businessName,
      'type': type,
      'region': region.name,
      'address': address,
      'abn': abn,
      'lastOrderDate': lastOrderDate?.toIso8601String(),
      'thisMonthOrders': thisMonthOrders,
      'lastMonthOrders': lastMonthOrders,
      'thisMonthOrderCount': thisMonthOrderCount,
      'outstanding': outstanding,
      'overdue': overdue,
      'oldestOverdueDays': oldestOverdueDays,
      'favourite': favourite,
      'archived': archived,
      'archivedAt': archivedAt?.toIso8601String(),
    };
  }

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id'] as String,
      businessName: json['businessName'] as String,
      type: json['type'] as String,
      region: SalesRegion.values.firstWhere(
        (region) => region.name == json['region'],
      ),
      address: json['address'] as String? ?? '',
      abn: json['abn'] as String? ?? '',
      lastOrderDate: json['lastOrderDate'] == null
          ? null
          : DateTime.parse(json['lastOrderDate'] as String),
      thisMonthOrders: (json['thisMonthOrders'] as num?)?.toDouble() ?? 0,
      lastMonthOrders: (json['lastMonthOrders'] as num?)?.toDouble() ?? 0,
      thisMonthOrderCount: (json['thisMonthOrderCount'] as num?)?.toInt() ?? 0,
      outstanding: (json['outstanding'] as num?)?.toDouble() ?? 0,
      overdue: (json['overdue'] as num?)?.toDouble() ?? 0,
      oldestOverdueDays: (json['oldestOverdueDays'] as num?)?.toInt() ?? 0,
      favourite: json['favourite'] as bool? ?? false,
      archived: json['archived'] as bool? ?? false,
      archivedAt: json['archivedAt'] == null
          ? null
          : DateTime.parse(json['archivedAt'] as String),
    );
  }
}
