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
  String? _employeeAccessToken;

  String? get employeeAccessToken => _employeeAccessToken;

  void setEmployeeAccessToken(String? token) {
    _employeeAccessToken = token;
    if (token?.isNotEmpty == true) _signedIn = true;
    notifyListeners();
  }

  static const demoLoginEnabled =
      kDebugMode || bool.fromEnvironment('DEMO_WORKSPACE');

  bool _signedIn = !demoLoginEnabled;
  bool get isSignedIn => _signedIn;

  void signInDemo({required bool warehouse}) {
    if (!demoLoginEnabled || _signedIn || _employeeAccessToken != null) return;
    _currentUser = warehouse ? liWei : jamesWilson;
    _signedIn = true;
    notifyListeners();
  }

  void signOut() {
    _employeeAccessToken = null;
    _signedIn = false;
    notifyListeners();
  }

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
}
