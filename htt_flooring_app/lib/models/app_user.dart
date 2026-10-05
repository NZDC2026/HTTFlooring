import 'sales_user.dart';

enum UserRole { sales, warehouse, manager, admin }

class AppUser {
  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.region,
  });

  final String id;
  final String name;
  final String email;
  final UserRole role;
  final SalesRegion region;

  bool get isSales => role == UserRole.sales;
  bool get isWarehouse => role == UserRole.warehouse;
  bool get isManager => role == UserRole.manager;
  bool get isAdmin => role == UserRole.admin;

  String get roleLabel {
    switch (role) {
      case UserRole.sales:
        return 'Sales Representative';
      case UserRole.warehouse:
        return 'Warehouse Staff';
      case UserRole.manager:
        return 'Manager';
      case UserRole.admin:
        return 'Administrator';
    }
  }
}
