import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'screens/home_screen.dart';
import 'screens/customers_screen.dart';
import 'screens/inventory_screen.dart';
import 'screens/sales_documents_screen.dart';
import 'screens/more_screen.dart';

import 'services/sales_session.dart';
import 'services/quote_service.dart';
import 'services/document_number_service.dart';
import 'services/pricing_service.dart';
import 'services/sales_document_service.dart';
import 'services/customer_note_service.dart';
import 'theme/app_theme.dart';
import 'widgets/app_shell.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => SalesSession()),
        ChangeNotifierProvider(create: (_) => QuoteService()),
        ChangeNotifierProvider(create: (_) => PricingService()),
        ChangeNotifierProvider(create: (_) => DocumentNumberService()),
        ChangeNotifierProvider(create: (_) => SalesDocumentService()),
        ChangeNotifierProvider(create: (_) => CustomerNoteService()),
      ],

      child: const HttSalesApp(),
    ),
  );
}

class HttSalesApp extends StatelessWidget {
  const HttSalesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'HTT Flooring Sales',
      theme: buildTheme(),
      home: const MainNavigation(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
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
      const MoreScreen(),
    ];

    return AppShell(
      currentIndex: _currentIndex,
      onDestinationSelected: _onDestinationSelected,
      child: IndexedStack(index: _currentIndex, children: screens),
    );
  }
}
