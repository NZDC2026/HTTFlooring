import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'navigation/role_router.dart';

import 'services/app_session.dart';
import 'services/customer_location_service.dart';
import 'services/customer_note_service.dart';
import 'services/customer_service.dart';
import 'services/document_number_service.dart';
import 'services/pricing_service.dart';
import 'services/quote_service.dart';
import 'services/sales_document_service.dart';
import 'services/sales_session.dart';

import 'theme/app_theme.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppSession()),

        ChangeNotifierProvider(create: (_) => CustomerService()),

        ChangeNotifierProvider(create: (_) => CustomerLocationService()),

        ChangeNotifierProvider(create: (_) => CustomerNoteService()),

        ChangeNotifierProvider(create: (_) => DocumentNumberService()),

        ChangeNotifierProvider(create: (_) => PricingService()),

        ChangeNotifierProvider(create: (_) => QuoteService()),

        ChangeNotifierProvider(create: (_) => SalesDocumentService()),

        // Temporary compatibility provider.
        // Existing Sales screens still depend on SalesSession.
        ChangeNotifierProvider(create: (_) => SalesSession()),
      ],
      child: const HttFlooringApp(),
    ),
  );
}

class HttFlooringApp extends StatelessWidget {
  const HttFlooringApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'HTT Flooring',
      theme: buildTheme(),
      home: const RoleRouter(),
    );
  }
}
