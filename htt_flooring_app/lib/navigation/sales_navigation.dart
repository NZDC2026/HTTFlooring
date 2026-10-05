import 'package:flutter/material.dart';

import '../screens/sales/customers/customers_screen.dart';
import '../screens/sales/home/home_screen.dart';
import '../screens/sales/inventory/inventory_screen.dart';
import '../screens/sales/more/sales_more_screen.dart';
import '../screens/sales/orders/sales_documents_screen.dart';
import '../widgets/app_shell.dart';

class SalesNavigation extends StatefulWidget {
  const SalesNavigation({super.key});

  @override
  State<SalesNavigation> createState() => _SalesNavigationState();
}

class _SalesNavigationState extends State<SalesNavigation> {
  int _currentIndex = 0;

  void _onDestinationSelected(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(onNavigateToTab: _onDestinationSelected),
      const CustomersScreen(),
      const InventoryScreen(),
      const SalesDocumentsScreen(),
      const SalesMoreScreen(),
    ];

    return AppShell(
      currentIndex: _currentIndex,
      onDestinationSelected: _onDestinationSelected,
      child: IndexedStack(index: _currentIndex, children: screens),
    );
  }
}
