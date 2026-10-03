import 'package:flutter/foundation.dart';

import '../models/sales_user.dart';

class SalesSession extends ChangeNotifier {
  SalesUser _currentUser = const SalesUser(
    id: 'sales-001',
    name: 'James Wilson',
    email: 'james@httflooring.com.au',
    region: SalesRegion.sydney,
    role: SalesRole.sales,
  );

  SalesUser get currentUser => _currentUser;

  String get salespersonName => _currentUser.name;

  SalesRegion get region => _currentUser.region;

  String get regionName => _currentUser.region.label;

  String get regionCode => _currentUser.region.code;

  SalesRole get role => _currentUser.role;

  bool get isAdmin => _currentUser.role == SalesRole.admin;

  bool get isManager => _currentUser.role == SalesRole.manager;

  bool get isSales => _currentUser.role == SalesRole.sales;

  bool canAccessRegion(SalesRegion targetRegion) {
    if (isAdmin) {
      return true;
    }

    return targetRegion == region;
  }

  // Temporary development helper.
  // Remove this when real login is connected.
  void switchDevelopmentRegion(SalesRegion newRegion) {
    _currentUser = SalesUser(
      id: _currentUser.id,
      name: _currentUser.name,
      email: _currentUser.email,
      region: newRegion,
      role: _currentUser.role,
    );

    notifyListeners();
  }
}
