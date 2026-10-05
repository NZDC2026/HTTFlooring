import 'package:flutter/foundation.dart';

import '../models/app_user.dart';
import '../models/sales_user.dart';

class AppSession extends ChangeNotifier {
  static const AppUser jamesWilson = AppUser(
    id: 'sales-001',
    name: 'James Wilson',
    email: 'james@httflooring.com.au',
    role: UserRole.sales,
    region: SalesRegion.sydney,
  );

  static const AppUser liWei = AppUser(
    id: 'warehouse-001',
    name: 'Li Wei',
    email: 'li.wei@httflooring.com.au',
    role: UserRole.warehouse,
    region: SalesRegion.sydney,
  );

  AppUser _currentUser = jamesWilson;

  AppUser get currentUser => _currentUser;

  UserRole get role => _currentUser.role;
  SalesRegion get region => _currentUser.region;

  String get userName => _currentUser.name;
  String get email => _currentUser.email;
  String get roleLabel => _currentUser.roleLabel;
  String get regionName => _currentUser.region.label;
  String get regionCode => _currentUser.region.code;

  bool get isSales => _currentUser.isSales;
  bool get isWarehouse => _currentUser.isWarehouse;
  bool get isManager => _currentUser.isManager;
  bool get isAdmin => _currentUser.isAdmin;

  void switchDevelopmentUser(AppUser user) {
    if (_currentUser.id == user.id) {
      return;
    }

    _currentUser = user;
    notifyListeners();
  }

  void switchToSales() {
    switchDevelopmentUser(jamesWilson);
  }

  void switchToWarehouse() {
    switchDevelopmentUser(liWei);
  }
}
