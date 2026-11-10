import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../theme/htt_tokens.dart';
import 'design/crm_design.dart';

/// The same destination callbacks drive compact and expanded navigation.
class AppShell extends StatelessWidget {
  final Widget child;
  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;
  const AppShell({
    super.key,
    required this.child,
    required this.currentIndex,
    required this.onDestinationSelected,
  });
  static const labels = ['Home', 'Customers', 'Inventory', 'Calendar', 'More'];
  static const icons = [
    Icons.home_outlined,
    Icons.people_outline,
    Icons.inventory_2_outlined,
    Icons.calendar_today_outlined,
    Icons.menu,
  ];
  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, constraints) {
      final wide = constraints.maxWidth >= HttTokens.compactBreakpoint;
      return Scaffold(
        body: Row(
          children: [
            if (wide)
              NavigationRail(
                backgroundColor: AppColors.green,
                indicatorColor: AppColors.success,
                selectedIconTheme: const IconThemeData(color: Colors.white),
                unselectedIconTheme: const IconThemeData(color: Colors.white70),
                selectedLabelTextStyle: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
                unselectedLabelTextStyle: const TextStyle(
                  color: Colors.white70,
                ),
                labelType: NavigationRailLabelType.all,
                leading: const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Text(
                    'HTT',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                selectedIndex: currentIndex,
                onDestinationSelected: onDestinationSelected,
                destinations: [
                  for (var i = 0; i < labels.length; i++)
                    NavigationRailDestination(
                      icon: Icon(icons[i]),
                      label: Text(labels[i]),
                    ),
                ],
              ),
            Expanded(child: child),
          ],
        ),
        bottomNavigationBar: wide
            ? null
            : CrmBottomNavigation(
                selectedIndex: currentIndex,
                onDestinationSelected: onDestinationSelected,
                destinations: [
                  for (var i = 0; i < labels.length; i++)
                    NavigationDestination(
                      icon: Icon(icons[i]),
                      label: labels[i],
                    ),
                ],
              ),
      );
    },
  );
}
