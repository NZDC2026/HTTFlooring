import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../theme/htt_tokens.dart';

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
            : DecoratedBox(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: Color(0xFFE5E9E6))),
                ),
                child: SafeArea(
                  top: false,
                  child: SizedBox(
                    height: 64,
                    child: Row(
                      children: [
                        for (var i = 0; i < labels.length; i++)
                          Expanded(
                            child: Semantics(
                              selected: currentIndex == i,
                              button: true,
                              label: labels[i],
                              child: InkWell(
                                onTap: () => onDestinationSelected(i),
                                child: Padding(
                                  padding: const EdgeInsets.only(
                                    top: 6,
                                    bottom: 5,
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        width: 44,
                                        height: 28,
                                        decoration: BoxDecoration(
                                          color: currentIndex == i
                                              ? const Color(0xFFE3F0E9)
                                              : Colors.transparent,
                                          borderRadius: BorderRadius.circular(
                                            16,
                                          ),
                                        ),
                                        alignment: Alignment.center,
                                        child: Icon(
                                          icons[i],
                                          size: 19,
                                          color: currentIndex == i
                                              ? const Color(0xFF103F33)
                                              : const Color(0xFF78877F),
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        labels[i],
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontFamily: 'HttReference',
                                          fontSize: 11,
                                          height: 1.1,
                                          letterSpacing: 0,
                                          fontWeight: currentIndex == i
                                              ? FontWeight.w600
                                              : FontWeight.w400,
                                          color: currentIndex == i
                                              ? const Color(0xFF103F33)
                                              : const Color(0xFF78877F),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
      );
    },
  );
}
