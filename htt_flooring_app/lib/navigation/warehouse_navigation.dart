import 'package:flutter/material.dart';

import '../screens/warehouse/home/warehouse_home_screen.dart';
import '../screens/warehouse/inventory/warehouse_inventory_screen.dart';
import '../screens/warehouse/more/warehouse_more_screen.dart';
import '../screens/warehouse/orders/warehouse_orders_screen.dart';
import '../screens/warehouse/returns/customer_returns_screen.dart';
import '../theme/app_theme.dart';

class WarehouseNavigation extends StatefulWidget {
  const WarehouseNavigation({super.key});

  @override
  State<WarehouseNavigation> createState() => _WarehouseNavigationState();
}

class _WarehouseNavigationState extends State<WarehouseNavigation> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    const screens = [
      WarehouseHomeScreen(),
      WarehouseOrdersScreen(),
      WarehouseInventoryScreen(),
      CustomerReturnsScreen(),
      WarehouseMoreScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        backgroundColor: AppColors.card,
        indicatorColor: AppColors.copperLight,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long),
            label: 'Orders',
          ),
          NavigationDestination(
            icon: Icon(Icons.inventory_2_outlined),
            selectedIcon: Icon(Icons.inventory_2),
            label: 'Inventory',
          ),
          NavigationDestination(
            icon: Icon(Icons.assignment_return_outlined),
            selectedIcon: Icon(Icons.assignment_return),
            label: 'Returns',
          ),
          NavigationDestination(icon: Icon(Icons.menu), label: 'More'),
        ],
      ),
    );
  }
}
