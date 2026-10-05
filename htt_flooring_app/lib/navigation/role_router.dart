import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/app_user.dart';
import '../services/app_session.dart';
import 'sales_navigation.dart';
import 'warehouse_navigation.dart';

class RoleRouter extends StatelessWidget {
  const RoleRouter({super.key});

  @override
  Widget build(BuildContext context) {
    final role = context.select<AppSession, UserRole>(
      (session) => session.role,
    );

    switch (role) {
      case UserRole.warehouse:
        return const WarehouseNavigation();

      case UserRole.sales:
      case UserRole.manager:
      case UserRole.admin:
        return const SalesNavigation();
    }
  }
}
