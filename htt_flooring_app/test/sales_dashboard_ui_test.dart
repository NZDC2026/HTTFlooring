import 'package:flutter/cupertino.dart';
import 'package:htt_flooring_app/screens/sales/customers/customer_series_price_screen.dart';
import 'package:htt_flooring_app/widgets/sales_task_completion.dart';
import 'package:htt_flooring_app/screens/sales/customers/customer_directory_data.dart';
import 'package:htt_flooring_app/models/customer_note.dart';
import 'package:htt_flooring_app/models/business_card_scan_result.dart';

import 'dart:convert';

import 'package:htt_flooring_app/screens/sales/customers/visit_in_progress_screen.dart';

import 'package:htt_flooring_app/widgets/sales_date_picker.dart';
import 'package:htt_flooring_app/screens/sales/inventory/sales_selling_screen.dart';
import 'package:htt_flooring_app/screens/sales/customers/sales_customer_form.dart';
import 'package:htt_flooring_app/screens/sales/customers/visit_check_in_screen.dart';
import 'package:htt_flooring_app/data/mock_data.dart' as fixtures;
import 'package:htt_flooring_app/screens/sales/customers/customer_detail_screen.dart';
import 'package:htt_flooring_app/screens/sales/customers/customer_notes_screen.dart';
import 'package:htt_flooring_app/screens/sales/orders/sales_document_detail_screen.dart';
import 'package:htt_flooring_app/services/local_sales_request_store.dart';
import 'package:intl/intl.dart';
import 'package:htt_flooring_app/theme/app_theme.dart';
import 'package:flutter/services.dart';
import 'package:htt_flooring_app/screens/sales/more/sales_more_screen.dart';
import 'package:flutter/material.dart';
import 'package:htt_flooring_app/screens/sales/home/reminder_calendar_screen.dart';
import 'package:htt_flooring_app/services/pricing_service.dart';
import 'package:htt_flooring_app/screens/sales/inventory/inventory_screen.dart';
import 'package:htt_flooring_app/screens/sales/inventory/inventory_catalog_data.dart';
import 'package:htt_flooring_app/models/sales_user.dart';
// Test-only implementation of the preferences platform used by the location service.
// ignore: depend_on_referenced_packages
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart';
// ignore: depend_on_referenced_packages
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:htt_flooring_app/services/customer_location_service.dart';
import 'package:htt_flooring_app/screens/sales/customers/customers_screen.dart';
import 'package:htt_flooring_app/screens/sales/home/home_screen.dart';
import 'package:htt_flooring_app/screens/sales/home/sales_dashboard_support.dart';
import 'package:htt_flooring_app/services/app_session.dart';
import 'package:htt_flooring_app/services/sales_session.dart';
import 'package:htt_flooring_app/services/customer_service.dart';
import 'package:htt_flooring_app/services/customer_note_service.dart';
import 'package:htt_flooring_app/services/sales_document_service.dart';

Widget app(Widget screen) => MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => AppSession()),
    ChangeNotifierProvider(create: (_) => SalesSession()),
    ChangeNotifierProvider(create: (_) => CustomerService()),
    ChangeNotifierProvider(create: (_) => CustomerLocationService()),
    ChangeNotifierProvider(create: (_) => CustomerNoteService()),
    ChangeNotifierProvider(create: (_) => SalesDocumentService()),
    ChangeNotifierProvider(create: (_) => PricingService()),
  ],
  child: MaterialApp(theme: buildTheme(salesReference: true), home: screen),
);
void main() {
  setUpAll(() async {
    final font = FontLoader('HttReference')
      ..addFont(rootBundle.load('assets/fonts/Arimo.ttf'));
    await font.load();
  });
  setUp(() {
    SharedPreferences.setMockInitialValues({});
    SharedPreferencesAsyncPlatform.instance =
        InMemorySharedPreferencesAsync.empty();
  });
  testWidgets(
    'visit time wheel reminders and optional next-day task work at narrow phone width',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(320, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      late BuildContext host;
      await tester.pumpWidget(
        app(
          Builder(
            builder: (context) {
              host = context;
              return Scaffold(
                body: TextButton(
                  onPressed: () => showSalesVisitScheduler(context),
                  child: const Text('Plan visit'),
                ),
              );
            },
          ),
        ),
      );
      await tester.tap(find.text('Plan visit'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      await tester.tap(find.text('4:00 PM'));
      await tester.pumpAndSettle();
      expect(find.byType(CupertinoPicker), findsNWidgets(3));
      expect(find.textContaining('is free'), findsOneWidget);
      expect(tester.takeException(), isNull);
      await tester.tap(find.text('Confirm'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Select customer'));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField).last, 'Harbour');
      await tester.pumpAndSettle();
      await tester.tap(find.text('Harbour Floors'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Relationship visit'));
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('1 hr'));
      await tester.tap(find.text('1 hr'));
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Also create a follow-up task'));
      await tester.tap(find.text('Also create a follow-up task'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Schedule'));
      await tester.pumpAndSettle();
      final notes = host.read<CustomerNoteService>().notes;
      expect(notes, hasLength(2));
      expect(notes.map((n) => n.id).toSet(), hasLength(2));
      final visit = notes.firstWhere((n) => n.followUpType == 'Customer Visit');
      expect(visit.content, 'Relationship visit');
      expect(visit.reminder, '1 hr');
      expect(
        visit.reminderDate,
        visit.followUpDate!.subtract(const Duration(hours: 1)),
      );
      expect(
        notes.last.followUpDate!.day,
        visit.followUpDate!.add(const Duration(days: 1)).day,
      );
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'board delivery confirms once and updates panels at the customer store',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(app(const SalesSamplesScreen()));
      await tester.pumpAndSettle();
      await tester.tap(find.textContaining('Display board  2 open'));
      await tester.pumpAndSettle();
      expect(find.text('4 colour panels'), findsOneWidget);
      await tester.ensureVisible(find.text('Mark delivered').first);
      await tester.tap(find.text('Mark delivered').first);
      await tester.pumpAndSettle();
      expect(find.text('Mark as delivered?'), findsOneWidget);
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Display board  2 open'), findsOneWidget);
      await tester.tap(find.text('Mark delivered').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Complete'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Display board  1 open'), findsOneWidget);
      await tester.tap(find.text('Completed'));
      await tester.pumpAndSettle();
      expect(find.text('DBR-0415'), findsOneWidget);
      expect(find.text('DBR-0398'), findsOneWidget);
      await tester.tap(find.text('ABC Flooring ›'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Display board').first);
      await tester.pumpAndSettle();
      expect(find.text('25'), findsOneWidget);
      expect(find.textContaining('Chatswood Store  7'), findsOneWidget);
      expect(find.text('Boards  10'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'inventory series grid and calculator remain valid at narrow phone widths',
    (tester) async {
      addTearDown(() => tester.binding.setSurfaceSize(null));
      final series = inventoryCatalog(
        demo: true,
        region: SalesRegion.sydney,
      ).first;
      for (final width in [320.0, 375.0, 430.0]) {
        await tester.binding.setSurfaceSize(Size(width, 812));
        await tester.pumpWidget(
          app(
            InventorySeriesDetails(
              key: ValueKey('series-$width'),
              series: series,
            ),
          ),
        );
        await tester.pumpAndSettle();
        await tester.ensureVisible(find.byTooltip('Grid view'));
        await tester.tap(find.byTooltip('Grid view'));
        await tester.pumpAndSettle();
        final grid = tester.widget<GridView>(find.byType(GridView));
        expect(
          (grid.gridDelegate as SliverGridDelegateWithFixedCrossAxisCount)
              .crossAxisCount,
          3,
        );
        expect(tester.takeException(), isNull, reason: 'series width $width');
        await tester.pumpWidget(
          app(
            InventoryColourDetails(
              key: ValueKey('colour-$width'),
              series: series,
              colour: series.colours.first,
            ),
          ),
        );
        await tester.pumpAndSettle();
        await tester.ensureVisible(find.byType(TextField).first);
        await tester.enterText(find.byType(TextField).first, 'Infinity');
        await tester.pumpAndSettle();
        expect(
          find.textContaining('Enter a valid positive quantity'),
          findsOneWidget,
        );
        await tester.enterText(find.byType(TextField).first, '500');
        await tester.pumpAndSettle();
        expect(find.textContaining('228 boxes'), findsWidgets);
        expect(
          find.textContaining('No single batch has 228 boxes'),
          findsOneWidget,
        );
        expect(
          tester.takeException(),
          isNull,
          reason: 'calculator width $width',
        );
      }
    },
  );
  testWidgets(
    'inventory offcut carries the selected colour and validates customer before saving',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      final series = inventoryCatalog(
        demo: true,
        region: SalesRegion.sydney,
      ).first;
      await tester.pumpWidget(
        app(
          InventoryColourDetails(series: series, colour: series.colours.first),
        ),
      );
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
        find.text('Request offcut'),
        200,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('Request offcut'));
      await tester.pumpAndSettle();
      expect(find.text('Bonita Natural Oak'), findsOneWidget);
      expect(find.text('Select customer'), findsOneWidget);
      await tester.tap(find.text('Request 1'));
      await tester.pumpAndSettle();
      expect(find.text('Select a customer.'), findsOneWidget);
      await tester.tap(find.text('Select customer'));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField).last, 'ABC');
      await tester.pumpAndSettle();
      await tester.tap(find.text('ABC Flooring').last);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Request 1'));
      await tester.pumpAndSettle();
      final ctx = tester.element(find.byType(InventoryColourDetails));
      final rows = await readSalesSampleRecords(
        ctx.read<AppSession>().currentUser.id,
        demo: true,
      );
      expect(rows, hasLength(5));
      expect(rows.first['customerId'], 'abc');
      expect(rows.first['colours'], ['Bonita Natural Oak']);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'customer sales expands purchased colours, sorts units and updates periods and invoice links',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(CustomerDetailScreen(customer: fixtures.customers.first)),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Sales'));
      await tester.pumpAndSettle();
      Future<void> reveal(Finder target) async {
        await tester.scrollUntilVisible(
          target,
          160,
          scrollable: find.byType(Scrollable).first,
        );
        await tester.pumpAndSettle();
      }

      final engineered = find.byKey(
        const ValueKey('sales-category-Engineered'),
      );
      await reveal(engineered);
      await tester.tap(engineered);
      await tester.pumpAndSettle();
      expect(find.text('Natural Oak · BON-001'), findsOneWidget);
      expect(find.textContaining('previous 114.4 m²'), findsOneWidget);
      expect(find.textContaining('From \$'), findsNothing);
      final laminate = find.byKey(const ValueKey('sales-category-Laminate'));
      await reveal(laminate);
      await tester.tap(laminate);
      await tester.pumpAndSettle();
      expect(
        tester
            .getTopLeft(find.byKey(const ValueKey('sales-series-AquaGlow')))
            .dy,
        lessThan(
          tester.getTopLeft(find.byKey(const ValueKey('sales-series-MTF'))).dy,
        ),
      );
      await tester.drag(find.byType(ListView).first, const Offset(0, 1200));
      await tester.pumpAndSettle();
      await reveal(find.text('m²'));
      await tester.tap(find.text('m²'));
      await tester.pumpAndSettle();
      expect(
        tester.getTopLeft(find.byKey(const ValueKey('sales-series-MTF'))).dy,
        lessThan(
          tester
              .getTopLeft(find.byKey(const ValueKey('sales-series-AquaGlow')))
              .dy,
        ),
      );
      await tester.drag(find.byType(ListView).first, const Offset(0, 1500));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Last 90 days'));
      await tester.pumpAndSettle();
      expect(find.text('\$34,673.40'), findsOneWidget);
      await tester.tap(find.text('Last 12 months'));
      await tester.pumpAndSettle();
      expect(find.text('\$81,478.73'), findsOneWidget);
      await reveal(find.byKey(const ValueKey('sales-documents-Invoices')));
      await tester.tap(find.byKey(const ValueKey('sales-documents-Invoices')));
      await tester.pumpAndSettle();
      expect(find.textContaining('\$31,630.16 outstanding'), findsOneWidget);
      await reveal(find.text('INV-10163'));
      await tester.tap(find.text('INV-10163'));
      await tester.pumpAndSettle();
      expect(find.byType(SalesDocumentDetailScreen), findsOneWidget);
      expect(find.text('Heritage Natural Oak'), findsOneWidget);
      expect(find.textContaining('66.00 m² · 30 boxes'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'reference invoice lines retain floor area and piece pricing and delivery confirmation can cancel',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      late BuildContext host;
      await tester.pumpWidget(
        app(
          Builder(
            builder: (context) {
              host = context;
              return const Scaffold(body: Text('Invoice fixtures'));
            },
          ),
        ),
      );
      final docs = referenceCustomerDocuments(host, fixtures.customers.first);
      final invoice = docs.firstWhere((d) => d.number == 'INV-10159');
      expect(invoice.items.length, 2);
      expect(invoice.items.last.sqm, 0);
      expect(invoice.items.last.subtotal, 285);
      expect(invoice.total, closeTo(4911.5, .0001));
      for (final entry in {
        'INV-10163': 7575.48,
        'INV-10161': 3005.64,
        'INV-10160': 7454.58,
        'INV-10159': 4911.5,
        'INV-10548': 8682.96,
      }.entries) {
        expect(
          docs.firstWhere((d) => d.number == entry.key).total,
          closeTo(entry.value, .005),
        );
      }
      await tester.pumpWidget(
        app(SalesDocumentDetailScreen(document: invoice)),
      );
      await tester.pumpAndSettle();
      expect(find.text('30 pcs @ \$9.50'), findsOneWidget);
      expect(tester.takeException(), isNull);
      final order = docs.firstWhere((d) => d.number == 'SO-2051');
      await tester.pumpWidget(app(SalesDocumentDetailScreen(document: order)));
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Mark as delivered'));
      await tester.tap(find.text('Mark as delivered'));
      await tester.pumpAndSettle();
      expect(find.text('Mark as delivered?'), findsOneWidget);
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
      expect(find.text('Mark as delivered'), findsOneWidget);
      await tester.tap(find.text('Mark as delivered'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Delivered'));
      await tester.pumpAndSettle();
      expect(find.text('Mark as delivered'), findsNothing);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'brand pricing bulk edit saves all colours and a Special Price follow-up',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      late BuildContext host;
      final series = inventoryCatalog(
        demo: true,
        region: SalesRegion.sydney,
      ).first;
      await tester.pumpWidget(
        app(
          Builder(
            builder: (context) {
              host = context;
              return Scaffold(
                body: TextButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => CustomerSeriesPriceScreen(
                        customer: fixtures.customers.first,
                        series: series,
                      ),
                    ),
                  ),
                  child: const Text('Edit prices'),
                ),
              );
            },
          ),
        ),
      );
      await tester.tap(find.text('Edit prices'));
      await tester.pumpAndSettle();
      expect(
        tester
            .widget<FilledButton>(
              find.widgetWithText(FilledButton, 'No changes'),
            )
            .onPressed,
        isNull,
      );
      await tester.tap(find.text('All'));
      await tester.enterText(find.byKey(const ValueKey('bulk-price')), '70');
      await tester.pumpAndSettle();
      await tester.tap(find.text('Apply'));
      await tester.pumpAndSettle();
      expect(find.text('12 changed'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('Create follow-up task'),
        250,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('Create follow-up task'));
      await tester.pumpAndSettle();
      await tester.tap(find.widgetWithText(FilledButton, 'Save 12'));
      await tester.pumpAndSettle();
      expect(find.text('Edit prices'), findsOneWidget);
      final pricing = host.read<PricingService>();
      for (final c in series.colours) {
        expect(
          pricing.getCustomerPrice(customerId: 'abc', product: c.product),
          70,
        );
      }
      expect(
        host.read<CustomerNoteService>().pendingFollowUps.single.followUpType,
        'Special Price',
      );
      expect(
        await LocalSalesRequestStore.read(
          host.read<AppSession>().currentUser.id,
        ),
        isEmpty,
      );
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'below-floor brand price requests approval without changing the current price',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      late BuildContext host;
      final series = inventoryCatalog(
        demo: true,
        region: SalesRegion.sydney,
      ).first;
      await tester.pumpWidget(
        app(
          Builder(
            builder: (context) {
              host = context;
              return Scaffold(
                body: TextButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => CustomerSeriesPriceScreen(
                        customer: fixtures.customers.first,
                        series: series,
                      ),
                    ),
                  ),
                  child: const Text('Edit prices'),
                ),
              );
            },
          ),
        ),
      );
      await tester.tap(find.text('Edit prices'));
      await tester.pumpAndSettle();
      await tester.enterText(
        find.byKey(const ValueKey('new-price-BON-001')),
        '60',
      );
      await tester.pumpAndSettle();
      expect(
        tester
            .widget<FilledButton>(
              find.widgetWithText(FilledButton, 'Save 1 · 1 approval'),
            )
            .onPressed,
        isNull,
      );
      await tester.scrollUntilVisible(
        find.byKey(const ValueKey('price-approval-reason')),
        300,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.enterText(
        find.byKey(const ValueKey('price-approval-reason')),
        'Large project volume',
      );
      await tester.pumpAndSettle();
      await tester.tap(
        find.widgetWithText(FilledButton, 'Save 1 · 1 approval'),
      );
      await tester.pumpAndSettle();
      expect(
        host.read<PricingService>().getCustomerPrice(
          customerId: 'abc',
          product: series.colours.first.product,
        ),
        69,
      );
      final requests = await LocalSalesRequestStore.read(
        host.read<AppSession>().currentUser.id,
      );
      expect(requests.single['kind'], 'Price');
      expect(requests.single['note'], 'Large project volume');
      expect((requests.single['items'] as List).single['after'], 60);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'display board return records reason without removing held stock',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(CustomerDetailScreen(customer: fixtures.customers.first)),
      );
      await tester.pumpAndSettle();
      final ctx = tester.element(find.byType(CustomerDetailScreen));
      await tester.ensureVisible(find.text('Display board').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Display board').first);
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('1/12'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('1/12'));
      await tester.pumpAndSettle();
      expect(find.text('Natural Oak × 3'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('Return this board'),
        170,
        scrollable: find.byType(Scrollable).last,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Return this board'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Damaged'));
      await tester.enterText(
        find.byKey(const ValueKey('board-return-note')),
        'Scratched edge',
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Send return request'));
      await tester.pumpAndSettle();
      final records = await LocalSalesRequestStore.read(
        ctx.read<AppSession>().currentUser.id,
      );
      expect(records.single['kind'], 'Board return');
      expect(records.single['boardId'], 'DB-1044');
      expect(records.single['reason'], 'Damaged');
      expect(records.single['note'], 'Scratched edge');
      expect(find.textContaining('Return · Damaged'), findsOneWidget);
      expect(find.text('21'), findsWidgets);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'customer board request keeps selected series store and type in shared Samples records',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      late BuildContext host;
      await tester.pumpWidget(
        app(
          Builder(
            builder: (context) {
              host = context;
              return Scaffold(
                body: TextButton(
                  onPressed: () => requestCustomerDisplayBoard(
                    context,
                    fixtures.customers.first,
                    seriesId: 'bonita',
                    store: 'Chatswood Store',
                    type: 'Stand',
                    details: true,
                  ),
                  child: const Text('Request stand'),
                ),
              );
            },
          ),
        ),
      );
      await tester.tap(find.text('Request stand'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Chatswood Store'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('Send request'),
        160,
        scrollable: find.byType(Scrollable).last,
      );
      await tester.tap(find.text('Send request'));
      await tester.pumpAndSettle();
      final rows = await readSalesSampleRecords(
        host.read<AppSession>().currentUser.id,
        demo: true,
      );
      expect(rows, hasLength(5));
      expect(rows.first['boardType'], 'Stand');
      expect(rows.first['series'], 'Bonita');
      expect(rows.first['delivery'], 'Chatswood Store');
      expect(rows.first['sets'], 1);
      expect(rows.any((r) => r['id'] == 'SMP-301'), isTrue);
      expect(rows.any((r) => r['id'] == 'DBR-0415'), isTrue);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'quote product picker keeps category series hierarchy and validates empty quantities',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(SalesQuoteRequestScreen(customer: fixtures.customers.first)),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Add product'));
      await tester.pumpAndSettle();
      expect(find.text('Engineered Timber'), findsOneWidget);
      expect(find.text('Natural Oak'), findsNothing);
      await tester.tap(find.text('Engineered Timber'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Bonita'));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
        find.text('Natural Oak'),
        100,
        scrollable: find.byType(Scrollable).last,
      );
      await tester.tap(find.text('Natural Oak'));
      await tester.pumpAndSettle();
      expect(find.text('Bonita Natural Oak'), findsOneWidget);
      expect(
        tester
            .widget<TextField>(
              find.byKey(const ValueKey('quote-quantity-BON-001')),
            )
            .controller!
            .text,
        isEmpty,
      );
      await tester.tap(find.text('Send to office'));
      await tester.pumpAndSettle();
      expect(
        find.textContaining('Enter a valid quantity for every product'),
        findsWidgets,
      );
      final ctx = tester.element(find.byType(SalesQuoteRequestScreen));
      expect(
        await LocalSalesRequestStore.read(
          ctx.read<AppSession>().currentUser.id,
        ),
        isEmpty,
      );
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'quote below-floor confirmation preserves quantities and queues approval without changing stock',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      final product = inventoryCatalog(
        demo: true,
        region: SalesRegion.sydney,
      ).first.colours.first.product;
      await tester.pumpWidget(
        app(
          SalesQuoteRequestScreen(
            customer: fixtures.customers.first,
            initialProduct: product,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final ctx = tester.element(find.byType(SalesQuoteRequestScreen));
      await tester.tap(find.widgetWithText(ChoiceChip, 'Boxes'));
      await tester.pumpAndSettle();
      await tester.enterText(
        find.byKey(const ValueKey('quote-quantity-BON-001')),
        '300',
      );
      await tester.enterText(
        find.byKey(const ValueKey('quote-price-BON-001')),
        '60',
      );
      await tester.pumpAndSettle();
      expect(find.textContaining('short 12'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('Office to advise'),
        180,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('Office to advise'));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
        find.text('3 days'),
        180,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('3 days'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Send to office'));
      await tester.pumpAndSettle();
      expect(find.text('Below floor price'), findsOneWidget);
      await tester.tap(find.text('Change price'));
      await tester.pumpAndSettle();
      expect(
        tester
            .widget<TextField>(
              find.byKey(const ValueKey('quote-price-BON-001')),
            )
            .controller!
            .text,
        '60',
      );
      expect(
        await LocalSalesRequestStore.read(
          ctx.read<AppSession>().currentUser.id,
        ),
        isEmpty,
      );
      await tester.tap(find.text('Send to office'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Send for approval'));
      await tester.pumpAndSettle();
      final records = await LocalSalesRequestStore.read(
        ctx.read<AppSession>().currentUser.id,
      );
      final record = records.single;
      final item = (record['items'] as List).single;
      expect(record['requiresManagerApproval'], isTrue);
      expect(record['batchPreference'], 'Office to advise');
      expect(record['holdDays'], 3);
      expect(record['holdStatus'], 'Requested');
      expect(item['boxes'], 300);
      expect(item['sqm'], closeTo(660, .00001));
      expect(item['short'], 12);
      expect(item['price'], 60);
      expect(
        ctx.read<PricingService>().getCustomerPrice(
          customerId: 'abc',
          product: product,
        ),
        69,
      );
      expect(
        inventoryCatalog(
          demo: true,
          region: SalesRegion.sydney,
        ).first.colours.first.quantity,
        288,
      );
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('accessory quotes use sale units without a floor-area division', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(375, 812));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    final series = inventoryCatalog(
      demo: true,
      region: SalesRegion.sydney,
    ).firstWhere((s) => s.name == 'Stair Nose');
    await tester.pumpWidget(
      app(
        SalesQuoteRequestScreen(
          customer: fixtures.customers.first,
          initialProduct: series.colours.first.product,
        ),
      ),
    );
    await tester.pumpAndSettle();
    final ctx = tester.element(find.byType(SalesQuoteRequestScreen));
    expect(find.widgetWithText(ChoiceChip, 'Boxes'), findsNothing);
    expect(find.widgetWithText(ChoiceChip, 'm²'), findsNothing);
    await tester.tap(find.text('Send to office'));
    await tester.pumpAndSettle();
    final row = (await LocalSalesRequestStore.read(
      ctx.read<AppSession>().currentUser.id,
    )).single;
    final item = (row['items'] as List).single;
    expect(item['units'], 1);
    expect(item['sqm'], 0);
    expect(item['priceUnit'], 'length');
    expect(tester.takeException(), isNull);
  });
  testWidgets(
    'payment promise completes original and creates a dated follow-up',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(app(const SalesTasksScreen()));
      await tester.pumpAndSettle();
      final ctx = tester.element(find.byType(SalesTasksScreen));
      await tester.tap(find.text('Today').last);
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('Complete follow-up').first);
      await tester.pumpAndSettle();
      expect(find.text('Payment received'), findsOneWidget);
      await tester.tap(find.text('Promised to pay'));
      await tester.pumpAndSettle();
      expect(find.text('Next follow-up for ABC Flooring'), findsOneWidget);
      await tester.tap(find.text('Tomorrow'));
      await tester.pumpAndSettle();
      final created = ctx.read<CustomerNoteService>().pendingFollowUps.single;
      expect(
        DateUtils.isSameDay(
          created.followUpDate,
          DateTime.now().add(const Duration(days: 1)),
        ),
        isTrue,
      );
      expect(created.content, contains('INV-10548'));
      expect(find.text('Tomorrow'), findsOneWidget);
      final prefs = await SharedPreferences.getInstance();
      final id = ctx.read<AppSession>().currentUser.id;
      expect(
        jsonDecode(prefs.getString('sales-next-follow-ups-$id')!) as List,
        hasLength(1),
      );
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'next follow-up restore keeps completed state without duplicates',
    (tester) async {
      await tester.pumpWidget(app(const SalesTasksScreen()));
      await tester.pumpAndSettle();
      final ctx = tester.element(find.byType(SalesTasksScreen));
      await createNextSalesFollowUp(
        ctx,
        SalesTaskCompletion('Done', nextDate: DateTime.now()),
        customerId: 'abc',
        content: 'Follow up after call',
        type: 'Other',
      );
      final service = ctx.read<CustomerNoteService>();
      final note = service.notes.single;
      service.setFollowUpStatus(
        note.id,
        FollowUpStatus.completed,
        actor: ctx.read<AppSession>().currentUser,
        result: 'Done',
      );
      await saveNextSalesFollowUpStates(ctx);
      await tester.pumpWidget(const SizedBox());
      await tester.pumpAndSettle();
      await tester.pumpWidget(app(const SalesTasksScreen()));
      await tester.pumpAndSettle();
      final fresh = tester.element(find.byType(SalesTasksScreen));
      await restoreNextSalesFollowUps(fresh);
      await tester.pumpAndSettle();
      expect(fresh.read<CustomerNoteService>().notes, hasLength(1));
      expect(
        fresh.read<CustomerNoteService>().notes.single.isCompleted,
        isTrue,
      );
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'linked quotation shows line totals and opens full quote preview',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(
          Builder(
            builder: (context) {
              final customer = CustomerDirectoryData(context).rows
                  .firstWhere(
                    (r) => r.customer.businessName == 'Northern Floors',
                  )
                  .customer;
              return ReferenceExampleFollowUp(
                customer: customer,
                task: CustomerNote(
                  id: 'test-linked-qt-1003',
                  customerId: customer.id,
                  type: CustomerNoteType.followUp,
                  content: 'Follow up QT-1003 — Hornsby townhouses',
                  createdAt: DateTime.now(),
                  followUpType: 'Quotation / Order Follow-up',
                ),
              );
            },
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
        find.text('View quote'),
        150,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('View quote'));
      await tester.pumpAndSettle();
      expect(find.text('Guardian D3017'), findsOneWidget);
      expect(find.textContaining('Only 374'), findsOneWidget);
      expect(find.text('\$33,215.03'), findsWidgets);
      await tester.scrollUntilVisible(
        find.text('Preview'),
        180,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('Preview'));
      await tester.pumpAndSettle();
      expect(find.text('Quote preview'), findsOneWidget);
      expect(find.text('Prepared for'), findsOneWidget);
      expect(find.text('Mark Taylor, Director'), findsOneWidget);
      expect(find.text('21 Pacific Highway, Hornsby NSW 2077'), findsOneWidget);
      expect(
        find.text('Hornsby townhouses, 12 units. Delivery in 3 drops.'),
        findsOneWidget,
      );
      await tester.pageBack();
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
        find.text('Accepted'),
        160,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('Accepted'));
      await tester.pumpAndSettle();
      expect(find.widgetWithText(OutlinedButton, 'Accepted'), findsNothing);
      expect(find.textContaining('Customer accepted'), findsOneWidget);
      final screenContext = tester.element(
        find.byType(SalesDocumentDetailScreen),
      );
      final requests = await LocalSalesRequestStore.read(
        screenContext.read<AppSession>().currentUser.id,
      );
      expect(requests.where((r) => r['document'] == 'QT-1003'), hasLength(1));
      expect(requests.single['note'], 'Customer response: Accepted');
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('compact dashboard renders and search finds SKU', (tester) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(HomeScreen(onNavigateToTab: (_) {})));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    await tester.tap(find.byTooltip('Search'));
    await tester.pumpAndSettle();
    expect(find.text('Search across everything'), findsOneWidget);
    await tester.enterText(find.byType(TextField), 'BON-001');
    await tester.pumpAndSettle();
    expect(find.text('Bonita Natural Oak'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets('alerts groups expand and task preview opens', (tester) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const SalesAlertsScreen()));
    await tester.pumpAndSettle();
    expect(find.text('New for you'), findsOneWidget);
    await tester.tap(find.text('New for you'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Northern Floors').first);
    await tester.pumpAndSettle();
    expect(find.text('Follow-up'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('customer alerts have actions and Done can be undone', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const SalesAlertsScreen()));
    await tester.pumpAndSettle();
    await tester.tap(find.text('No purchase 30+ days'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Sutherland Supplies'));
    await tester.pumpAndSettle();
    expect(find.text('Note & Task'), findsWidgets);
    await tester.tap(find.text('Done').first);
    await tester.pumpAndSettle();
    expect(find.text('Sutherland Supplies'), findsNothing);
    await tester.tap(find.text('Undo'));
    await tester.pumpAndSettle();
    expect(find.text('Sutherland Supplies'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Home metrics switch content without leaving Home', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(HomeScreen(onNavigateToTab: (_) {})));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Tasks'));
    await tester.pumpAndSettle();
    expect(find.textContaining('showing 4'), findsOneWidget);
    await tester.tap(find.text('Attention'));
    await tester.pumpAndSettle();
    expect(find.text('Overdue payment'), findsOneWidget);
    expect(find.text('On hold'), findsOneWidget);
    await tester.tap(find.text('Visits today'));
    await tester.pumpAndSettle();
    expect(find.text('Plan route'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets('Customers filters show correct records and attention groups', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const CustomersScreen()));
    await tester.pumpAndSettle();
    expect(find.text('All 13'), findsOneWidget);
    await tester.tap(find.text('Due visit 5'));
    await tester.pumpAndSettle();
    expect(find.text('5 customers'), findsOneWidget);
    expect(find.text('Bondi Floor Studio'), findsOneWidget);
    expect(find.text('ABC Flooring'), findsNothing);
    await tester.tap(find.text('Overdue 5'));
    await tester.pumpAndSettle();
    expect(find.text('Harbour Floors'), findsOneWidget);
    expect(find.text('Bondi Floor Studio'), findsNothing);
    await tester.tap(find.textContaining('Attention 10'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Overdue payment'));
    await tester.pumpAndSettle();
    expect(find.text('Harbour Floors'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Customers map shares filters, radius and five-row pages', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const CustomersScreen()));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Map'));
    await tester.pumpAndSettle();
    expect(find.text('13 on map'), findsOneWidget);
    await tester.ensureVisible(find.byTooltip('Next page'));
    await tester.pumpAndSettle();
    expect(find.text('1–5 of 13'), findsOneWidget);
    await tester.tap(find.byTooltip('Next page'));
    await tester.pumpAndSettle();
    expect(find.text('6–10 of 13'), findsOneWidget);
    expect(find.text('Bondi Floor Studio'), findsOneWidget);
    await tester.ensureVisible(find.text('5 km'));
    await tester.tap(find.text('5 km'));
    await tester.pumpAndSettle();
    expect(find.text('3 on map'), findsOneWidget);
    expect(find.text('1–5 of 13'), findsNothing);
    await tester.ensureVisible(find.text('50 km'));
    await tester.tap(find.text('50 km'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Overdue 5'));
    await tester.tap(find.text('Overdue 5'));
    await tester.pumpAndSettle();
    expect(find.text('5 on map'), findsOneWidget);
    expect(find.text('Harbour Floors'), findsOneWidget);
    expect(find.text('ABC Flooring'), findsNothing);
    expect(tester.takeException(), isNull);
  });
  testWidgets('Customer options open archived customers', (tester) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const CustomersScreen()));
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Customer options'));
    await tester.pumpAndSettle();
    expect(find.text('Scan business card'), findsOneWidget);
    await tester.tap(find.text('Archived customers'));
    await tester.pumpAndSettle();
    expect(find.text('Gladesville Floors (closed)'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  test('Inventory demo totals and low-stock series match the reference', () {
    final series = inventoryCatalog(demo: true, region: SalesRegion.sydney);
    expect(series.length, 17);
    expect(series.where((s) => s.lowCount > 0).length, 13);
    expect(series.where((s) => s.category == 'Accessories').length, 11);
    expect(
      series
          .where((s) => s.category == 'Engineered Timber')
          .fold(0.0, (sum, s) => sum + s.area),
      closeTo(4783, .01),
    );
    expect(series.where((s) => s.signals.contains('Incoming')).length, 11);
  });
  testWidgets('Inventory expands styles and filters low-stock colours', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const InventoryScreen()));
    await tester.pumpAndSettle();
    expect(find.text('17 series'), findsOneWidget);
    await tester.tap(find.text('Engineered Timber'));
    await tester.pumpAndSettle();
    expect(find.text('Bonita'), findsOneWidget);
    await tester.tap(find.byType(Switch));
    await tester.pumpAndSettle();
    expect(find.text('13 series'), findsOneWidget);
    expect(find.text('Cotton Oak'), findsOneWidget);
    expect(find.text('Natural Oak'), findsNothing);
    expect(tester.takeException(), isNull);
  });
  testWidgets('Inventory customer sheet searches, selects and clears prices', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const InventoryScreen()));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Customer'));
    await tester.pumpAndSettle();
    expect(find.text('Show prices for'), findsOneWidget);
    await tester.enterText(find.byType(TextField).last, 'Bondi');
    await tester.pumpAndSettle();
    await tester.tap(find.text('Bondi Floor Studio'));
    await tester.pumpAndSettle();
    expect(find.text('BF'), findsOneWidget);
    await tester.tap(find.text('BF'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Clear'));
    await tester.pumpAndSettle();
    expect(find.text('Customer'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'Inventory category tabs show direct style groups and five-colour preview',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(app(const InventoryScreen()));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Engineered'));
      await tester.pumpAndSettle();
      expect(find.text('3 series'), findsOneWidget);
      expect(find.text('Natural Oak'), findsOneWidget);
      expect(find.text('Coastal Oak'), findsOneWidget);
      expect(find.text('Latte Oak'), findsOneWidget);
      expect(find.text('Cotton Oak'), findsNothing);
      await tester.ensureVisible(find.text('View all 12 colours  ›'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('View all 12 colours  ›'));
      await tester.pumpAndSettle();
      expect(find.byType(InventorySeriesDetails), findsOneWidget);
      expect(find.text('Cotton Oak'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'Inventory shows revised accessories and centred stock information',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(app(const InventoryScreen()));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Accessories').first);
      await tester.pumpAndSettle();
      expect(find.text('Scotia'), findsOneWidget);
      expect(find.text('Skirting'), findsOneWidget);
      expect(find.text('Moisture Barrier'), findsOneWidget);
      expect(find.text('Adhesive'), findsWidgets);
      await tester.tap(find.byTooltip('About stock'));
      await tester.pumpAndSettle();
      expect(find.text('Sydney Warehouse stock'), findsOneWidget);
      await tester.tap(find.text('Got it'));
      await tester.pumpAndSettle();
      expect(find.text('Sydney Warehouse stock'), findsNothing);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'Calendar week, month, list and visit filters share the same events',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(app(const ReminderCalendarScreen()));
      await tester.pumpAndSettle();
      expect(find.text('ABC Flooring'), findsOneWidget);
      await tester.tap(find.text('Follow-ups').first);
      await tester.pumpAndSettle();
      expect(find.text('ABC Flooring'), findsNothing);
      expect(find.text('Follow-ups due'), findsOneWidget);
      await tester.tap(find.text('Month'));
      await tester.pumpAndSettle();
      expect(find.byType(GridView), findsOneWidget);
      await tester.tap(find.text('List'));
      await tester.pumpAndSettle();
      expect(find.byType(GridView), findsNothing);
      await tester.tap(find.text('Week'));
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('Next week'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Nothing planned'), findsOneWidget);
      expect(find.text('Schedule visit'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('Calendar follow-up completion moves a task to Completed', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const ReminderCalendarScreen()));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Follow-ups').first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Follow-ups due'));
    await tester.pumpAndSettle();
    expect(find.text('To do  16'), findsOneWidget);
    await tester.ensureVisible(find.byTooltip('Complete follow-up').first);
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Complete follow-up').first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Paid'));
    await tester.pumpAndSettle();
    expect(find.text('To do  15'), findsOneWidget);
    expect(find.text('Completed  4'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets(
    'Calendar add menu opens visit form and saves a scheduled visit',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(app(const ReminderCalendarScreen()));
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('Add to calendar'));
      await tester.pumpAndSettle();
      expect(find.text('Note & Task'), findsOneWidget);
      await tester.tap(find.text('Schedule visit'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Select customer'));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField).last, 'ABC');
      await tester.pumpAndSettle();
      await tester.tap(find.text('ABC Flooring').last);
      await tester.pumpAndSettle();
      await tester.enterText(
        find.byType(TextField),
        'Discuss the showroom flooring proposal',
      );
      await tester.tap(find.text('Schedule').last);
      await tester.pumpAndSettle();
      final screen = tester.element(find.byType(ReminderCalendarScreen));
      final notes = screen.read<CustomerNoteService>().notes;
      expect(notes.where((n) => n.followUpType == 'Customer Visit').length, 1);
      expect(notes.last.content, 'Discuss the showroom flooring proposal');
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('More opens performance and task filters', (tester) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const SalesMoreScreen()));
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('tap for my performance'));
    await tester.pumpAndSettle();
    expect(find.text('My performance'), findsOneWidget);
    expect(find.text('Weekly sales vs weekly target'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.pageBack();
    await tester.pumpAndSettle();
    await tester.tap(find.text('Tasks'));
    await tester.pumpAndSettle();
    expect(find.text('This week'), findsOneWidget);
    await tester.tap(find.text('Today').last);
    await tester.pumpAndSettle();
    expect(find.text('ABC Flooring'), findsWidgets);
    await tester.enterText(find.byType(TextField), 'unmatched-task-query');
    await tester.pumpAndSettle();
    expect(find.text('No tasks match your filters.'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets('Settings preferences persist after reopening', (tester) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const SalesSettingsScreen()));
    await tester.pumpAndSettle();
    expect(tester.widget<Switch>(find.byType(Switch).first).value, isTrue);
    await tester.tap(find.byType(Switch).first);
    await tester.pumpAndSettle();
    await tester.pumpWidget(const SizedBox());
    await tester.pumpAndSettle();
    await tester.pumpWidget(app(const SalesSettingsScreen()));
    await tester.pumpAndSettle();
    expect(tester.widget<Switch>(find.byType(Switch).first).value, isFalse);
    expect(tester.takeException(), isNull);
  });
  testWidgets(
    'Calendar Only mine changes ownership scope and month picker stays inline',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(app(const ReminderCalendarScreen()));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Follow-ups').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Follow-ups due'));
      await tester.pumpAndSettle();
      expect(find.text('To do  16'), findsOneWidget);
      await tester.tap(find.byTooltip('Only mine'));
      await tester.pumpAndSettle();
      expect(find.text('To do  14'), findsOneWidget);
      final month = DateFormat('MMMM yyyy').format(DateTime.now());
      await tester.tap(find.text(month));
      await tester.pumpAndSettle();
      expect(find.byTooltip('Next year'), findsOneWidget);
      expect(find.text('Jan'), findsOneWidget);
      await tester.tap(find.text('Jan'));
      await tester.pumpAndSettle();
      expect(find.text('January ${DateTime.now().year}'), findsOneWidget);
      expect(find.byType(DatePickerDialog), findsNothing);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('Samples track delivery and retain completed records', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const SalesMoreScreen()));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Samples'));
    await tester.pumpAndSettle();
    expect(find.text('SMP-301'), findsOneWidget);
    await tester.tap(find.text('Mark delivered').first);
    await tester.pumpAndSettle();
    expect(find.text('SMP-301'), findsNothing);
    await tester.tap(find.text('Completed'));
    await tester.pumpAndSettle();
    expect(find.text('SMP-301'), findsOneWidget);
    expect(find.text('✓ Delivered'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    await tester.tap(find.text('Samples'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Completed'));
    await tester.pumpAndSettle();
    expect(find.text('SMP-301'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets('Requests category and status filters match visible records', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const SalesMoreScreen()));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Requests'));
    await tester.pumpAndSettle();
    expect(find.text('Guardian D3017'), findsOneWidget);
    await tester.tap(find.text('Quote  1'));
    await tester.pumpAndSettle();
    expect(find.text('Guardian D3017'), findsNothing);
    expect(find.text('Premier Floorcraft'), findsOneWidget);
    await tester.tap(find.text('Done'));
    await tester.pumpAndSettle();
    expect(find.text('No requests in this view.'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets(
    'Sample request requires products and saves the selected request',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(const SalesSamplesScreen(createOnOpen: true)),
      );
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('ABC Flooring').last);
      await tester.pumpAndSettle();
      await tester.tap(find.text('ABC Flooring').last);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Swatches'));
      await tester.pumpAndSettle();
      expect(
        tester
            .widget<FilledButton>(
              find.widgetWithText(FilledButton, 'Request 0'),
            )
            .onPressed,
        isNull,
      );
      await tester.tap(find.text('Pick products'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Engineered Timber').last);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Bonita').last);
      await tester.pumpAndSettle();
      await tester.tap(find.byType(CheckboxListTile).first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Done'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Request 1'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Swatches  2 open'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('All primary sales pages fit the reference phone width', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(375, 812));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    for (final screen in <Widget>[
      HomeScreen(onNavigateToTab: (_) {}),
      const CustomersScreen(),
      const InventoryScreen(),
      const ReminderCalendarScreen(),
      const SalesMoreScreen(),
    ]) {
      await tester.pumpWidget(app(screen));
      await tester.pumpAndSettle();
      expect(
        tester.takeException(),
        isNull,
        reason: screen.runtimeType.toString(),
      );
      await tester.pumpWidget(const SizedBox());
      await tester.pumpAndSettle();
    }
  });
  testWidgets('Tasks and Calendar share completion changes', (tester) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const SalesTasksScreen()));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Today').last);
    await tester.pumpAndSettle();
    expect(find.text('Show 11 more'), findsOneWidget);
    await tester.tap(find.byTooltip('Complete follow-up').first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Paid'));
    await tester.pumpAndSettle();
    await tester.pumpWidget(const SizedBox());
    await tester.pumpAndSettle();
    await tester.pumpWidget(app(const ReminderCalendarScreen()));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Follow-ups').first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Follow-ups due'));
    await tester.pumpAndSettle();
    expect(find.text('To do  15'), findsOneWidget);
    expect(find.text('Completed  4'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets(
    'Customer six tabs and invoice follow-up open without layout errors',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(CustomerDetailScreen(customer: fixtures.customers.first)),
      );
      await tester.pumpAndSettle();
      expect(find.text('Visits'), findsOneWidget);
      await tester.tap(find.text('Sales').first);
      await tester.pumpAndSettle();
      expect(find.text('Sales trend'), findsOneWidget);
      await tester.ensureVisible(find.text('Invoices').last);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Invoices').last);
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('INV-10163'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('INV-10163'));
      await tester.pumpAndSettle();
      expect(find.byType(SalesDocumentDetailScreen), findsOneWidget);
      await tester.ensureVisible(find.text('Add payment\nfollow-up'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Add payment\nfollow-up'));
      await tester.pumpAndSettle();
      expect(find.byType(AddFollowUpScreen), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'Follow-up assignment uses the reference dialog and retains selected owners',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(AddFollowUpScreen(customer: fixtures.customers.first)),
      );
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('James Wilson').first);
      await tester.tap(find.text('James Wilson').first);
      await tester.pumpAndSettle();
      expect(find.text('Sarah Chen'), findsOneWidget);
      expect(find.text('Sales Manager'), findsOneWidget);
      await tester.tap(find.text('Sarah Chen'));
      await tester.tap(find.text('Done'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Sarah Chen'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('Note form creates note and follow-up together', (tester) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(
      app(
        Builder(
          builder: (context) => Scaffold(
            body: TextButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) =>
                      AddNoteScreen(customer: fixtures.customers.first),
                ),
              ),
              child: const Text('Open note'),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('Open note'));
    await tester.pumpAndSettle();
    final ctx = tester.element(find.byType(AddNoteScreen));
    final notes = ctx.read<CustomerNoteService>();
    await tester.enterText(
      find.byType(TextFormField).first,
      'Discussed samples for new showroom',
    );
    await tester.ensureVisible(find.text('Create follow-up task'));
    await tester.tap(find.text('Create follow-up task'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Save note'));
    await tester.pumpAndSettle();
    final matching = notes
        .getCustomerNotes('abc')
        .where((n) => n.content == 'Discussed samples for new showroom');
    expect(matching.length, 2);
    expect(matching.where((n) => n.isFollowUp).length, 1);
    expect(tester.takeException(), isNull);
  });
  testWidgets(
    'Quote request saves locally with selected product and quantity',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      final series = inventoryCatalog(
        demo: true,
        region: SalesRegion.sydney,
      ).first;
      await tester.pumpWidget(
        app(
          SalesQuoteRequestScreen(
            customer: fixtures.customers.first,
            initialProduct: series.colours.first.product,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final id = tester
          .element(find.byType(SalesQuoteRequestScreen))
          .read<AppSession>()
          .currentUser
          .id;
      await tester.tap(find.text('Send to office'));
      await tester.pumpAndSettle();
      final rows = await LocalSalesRequestStore.read(id);
      expect(rows.length, 1);
      expect(rows.first['kind'], 'Quote');
      expect((rows.first['items'] as List).length, 1);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('Colour calculator rounds up boxes and price levels expand', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(375, 812));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    final series = inventoryCatalog(
      demo: true,
      region: SalesRegion.sydney,
    ).first;
    await tester.pumpWidget(
      app(InventoryColourDetails(series: series, colour: series.colours.first)),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Price levels'));
    await tester.pumpAndSettle();
    expect(find.text('VVIP'), findsOneWidget);
    await tester.ensureVisible(find.text('Job calculator'));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.byType(TextField));
    await tester.enterText(find.byType(TextField), '100');
    await tester.pumpAndSettle();
    expect(find.text('100 m² = 46 boxes (101.2 m²)'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
  testWidgets('Customer Activity Pricing Display board and Rebate fit phone', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(375, 812));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    for (final tab in ['Activity', 'Pricing', 'Display board', 'Rebate']) {
      await tester.pumpWidget(const SizedBox());
      await tester.pumpWidget(
        app(CustomerDetailScreen(customer: fixtures.customers.first)),
      );
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text(tab).first);
      await tester.pumpAndSettle();
      await tester.tap(find.text(tab).first);
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull, reason: tab);
    }
  });

  testWidgets('Follow-up updates and completion retain the result', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(
      app(
        Builder(
          builder: (context) => Scaffold(
            body: TextButton(
              onPressed: () {
                final service = context.read<CustomerNoteService>(),
                    user = context.read<AppSession>().currentUser;
                service.addFollowUp(
                  customerId: 'abc',
                  actor: user,
                  content: 'Call about showroom stock',
                  followUpDate: DateTime.now(),
                  followUpType: 'Product Enquiry',
                  assignees: [user],
                  priority: 'Normal',
                  reminder: 'None',
                );
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => FollowUpDetail(
                      customer: fixtures.customers.first,
                      taskId: service.notes.last.id,
                    ),
                  ),
                );
              },
              child: const Text('Open task'),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('Open task'));
    await tester.pumpAndSettle();
    final service = tester
        .element(find.byType(FollowUpDetail))
        .read<CustomerNoteService>();
    await tester.ensureVisible(find.byType(TextField));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'Customer confirmed colour');
    await tester.pumpAndSettle();
    await tester.tap(find.text('Add update'));
    await tester.pumpAndSettle();
    expect(
      service.notes.last.events.any(
        (e) => e.message == 'Customer confirmed colour',
      ),
      isTrue,
    );
    await tester.tap(find.text('Done'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Done').last);
    await tester.pumpAndSettle();
    expect(service.notes.last.isCompleted, isTrue);
    expect(tester.takeException(), isNull);
  });
  testWidgets(
    'New customer form validates contacts and saves Store customer with pricing',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(app(const SalesCustomerForm()));
      await tester.pumpAndSettle();
      final ctx = tester.element(find.byType(SalesCustomerForm)),
          customers = ctx.read<CustomerService>(),
          pricing = ctx.read<PricingService>();
      await tester.tap(find.text('Save customer'));
      await tester.pumpAndSettle();
      expect(find.text('Enter legal business name'), findsOneWidget);
      await tester.enterText(
        find.byKey(const ValueKey('customer-field-legal-business-name')),
        'Reference Demo Floors',
      );
      await tester.tap(find.text('VIP'));
      await tester.ensureVisible(find.text('Contact 1'));
      await tester.pumpAndSettle();
      await tester.enterText(
        find.byKey(const ValueKey('customer-field-name')),
        'Alex Example',
      );
      await tester.enterText(
        find.byKey(const ValueKey('customer-field-mobile')),
        '0400111222',
      );
      await tester.tap(find.text('Save customer'));
      await tester.pumpAndSettle();
      final saved = customers.customers
          .where((c) => c.businessName == 'Reference Demo Floors')
          .single;
      expect(saved.type, 'Store Customer');
      expect(
        customers.getContactsForCustomer(saved.id).single.name,
        'Alex Example',
      );
      final p = inventoryCatalog(
        demo: true,
        region: SalesRegion.sydney,
      ).first.colours.first.product;
      expect(
        pricing.getCustomerPrice(customerId: saved.id, product: p),
        closeTo(73.8, .01),
      );
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('Help feedback persists and About matches reference', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const SalesMoreScreen()));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Help & support'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Help & support'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('When is stock reserved?'));
    await tester.pumpAndSettle();
    expect(
      find.textContaining('Quotes alone do not reserve stock.'),
      findsOneWidget,
    );
    final ctx = tester.element(find.byType(TextField)),
        user = ctx.read<AppSession>().currentUser,
        notes = ctx.read<CustomerNoteService>();
    await tester.enterText(
      find.byType(TextField),
      'Improve visit route preview',
    );
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Save feedback'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Save feedback'));
    await tester.pumpAndSettle();
    expect(
      notes.notes.any((n) => n.content.contains('Improve visit route preview')),
      isTrue,
    );
    final prefs = await SharedPreferences.getInstance();
    expect(
      prefs.getString('sales-feedback-${user.id}'),
      contains('Improve visit route preview'),
    );
    expect(tester.takeException(), isNull);
  });
  testWidgets(
    'Archived customers request restore without restoring the account',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(app(const CustomersScreen()));
      await tester.pumpAndSettle();
      final ctx = tester.element(find.byType(CustomersScreen)),
          user = ctx.read<AppSession>().currentUser,
          service = ctx.read<CustomerService>();
      final count = service.customers.length;
      await tester.tap(find.byTooltip('Customer options'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Archived customers'));
      await tester.pumpAndSettle();
      expect(find.text('Gladesville Floors (closed)'), findsOneWidget);
      await tester.tap(find.text('Request restore'));
      await tester.pumpAndSettle();
      expect(find.text('Requested'), findsOneWidget);
      expect(service.customers.length, count);
      expect(
        (await LocalSalesRequestStore.read(user.id)).first['kind'],
        'Restore',
      );
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'Check in requires camera capture and shows real verification state',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(
          Builder(
            builder: (context) => VisitCheckInScreen.demo(
              context
                  .read<CustomerLocationService>()
                  .getForCustomer('abc')
                  .first,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Verify your location on site'), findsOneWidget);
      expect(find.text('Open camera'), findsOneWidget);
      expect(
        tester
            .widget<OutlinedButton>(
              find.widgetWithText(OutlinedButton, 'Check in'),
            )
            .onPressed,
        isNull,
      );
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'visit checkout validates outcome and saves checked items with follow-up',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      late BuildContext host;
      await tester.pumpWidget(
        app(
          Builder(
            builder: (context) {
              host = context;
              return Scaffold(
                body: TextButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => VisitInProgressScreen(
                        customerId: 'abc',
                        name: 'ABC Flooring',
                        checkedInAt: DateTime.now(),
                        photo: Uint8List(0),
                        demo: true,
                      ),
                    ),
                  ),
                  child: const Text('Begin visit'),
                ),
              );
            },
          ),
        ),
      );
      await tester.tap(find.text('Begin visit'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Check out · 1 min'));
      await tester.pumpAndSettle();
      expect(
        find.text('Choose an outcome before checking out.'),
        findsOneWidget,
      );
      await tester.tap(find.byType(CheckboxListTile).first);
      await tester.ensureVisible(find.text('Relationship visit'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Relationship visit'));
      await tester.scrollUntilVisible(
        find.text('Create follow-up'),
        160,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.tap(find.text('Create follow-up'));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
        find.text('What needs to happen?'),
        160,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.enterText(
        find.byType(TextField).last,
        'Confirm showroom quote',
      );
      await tester.tap(find.text('Check out · 1 min'));
      await tester.pumpAndSettle();
      expect(find.text('Begin visit'), findsOneWidget);
      final notes = host.read<CustomerNoteService>().getCustomerNotes('abc');
      expect(
        notes.where((n) => n.isFollowUp).single.content,
        'Confirm showroom quote',
      );
      expect(
        notes.where((n) => !n.isFollowUp).single.content,
        contains('Showroom quote review'),
      );
      final prefs = await SharedPreferences.getInstance();
      final key =
          'visit-checkout-history-${host.read<AppSession>().currentUser.id}';
      final rows = jsonDecode(prefs.getString(key)!) as List;
      expect(rows.single['outcome'], 'Relationship visit');
      expect(rows.single['completedItems'], ['Showroom quote review']);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets('Selling campaigns expand into matching product details', (
    tester,
  ) async {
    await tester.binding.setSurfaceSize(const Size(375, 812));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    await tester.pumpWidget(app(const SalesSellingScreen(type: 'Incoming')));
    await tester.pumpAndSettle();
    expect(find.text('Arriving in the next 14 days'), findsOneWidget);
    await tester.tap(find.text('Bonita  2 colours', findRichText: true));
    await tester.pumpAndSettle();
    expect(find.text('Espresso'), findsOneWidget);
    await tester.tap(find.text('Espresso'));
    await tester.pumpAndSettle();
    expect(find.byType(InventoryColourDetails), findsOneWidget);
    expect(find.text('BON-012'), findsOneWidget);
    expect(tester.takeException(), isNull);
    for (final type in ['New', 'Promotion', 'Clearance']) {
      await tester.pumpWidget(const SizedBox());
      await tester.pumpWidget(app(SalesSellingScreen(type: type)));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull, reason: type);
    }
  });
  testWidgets(
    'Board panels request stores quantities and excludes existing colours in bulk action',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(
          SalesSamplesScreen(
            createOnOpen: true,
            initialCustomer: fixtures.customers.first,
            initialBoard: true,
          ),
        ),
      );
      await tester.pumpAndSettle();
      final id = tester
          .element(find.byType(SalesSamplesScreen))
          .read<AppSession>()
          .currentUser
          .id;
      await tester.tap(find.text('Continue'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('1 of each new to this store'));
      await tester.pumpAndSettle();
      expect(find.text('11 panels · 11 colours'), findsOneWidget);
      await tester.ensureVisible(find.text('Send request'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Send request'));
      await tester.pumpAndSettle();
      final prefs = await SharedPreferences.getInstance();
      final rows =
          jsonDecode(prefs.getString('sales-sample-requests-$id')!) as List;
      final record = rows.first as Map;
      expect(record['boardType'], 'Colour Panels');
      expect(
        (record['quantities'] as Map).values.fold<int>(
          0,
          (sum, v) => sum + (v as int),
        ),
        11,
      );
      expect(record['done'], false);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'Date picker enforces earliest date and confirms a future month',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      DateTime? result;
      await tester.pumpWidget(
        app(
          Builder(
            builder: (context) => Scaffold(
              body: TextButton(
                onPressed: () async {
                  result = await pickSalesDate(
                    context: context,
                    initialDate: DateTime(2026, 11, 18),
                    firstDate: DateTime(2026, 11, 18),
                    lastDate: DateTime(2026, 12, 31),
                  );
                },
                child: const Text('Pick'),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Pick'));
      await tester.pumpAndSettle();
      expect(
        tester
            .widget<TextButton>(find.widgetWithText(TextButton, '1'))
            .onPressed,
        isNull,
      );
      await tester.tap(find.byTooltip('Next month'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('1'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Confirm'));
      await tester.pumpAndSettle();
      expect(result, DateTime(2026, 12, 1));
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'Contact edit queues review and retains current contact until approval',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(CustomerDetailScreen(customer: fixtures.customers.first)),
      );
      await tester.pumpAndSettle();
      final ctx = tester.element(find.byType(CustomerDetailScreen)),
          service = ctx.read<CustomerService>(),
          user = ctx.read<AppSession>().currentUser;
      final before = service.getContactsForCustomer('abc').first;
      await tester.ensureVisible(find.byTooltip('Contact options').first);
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('Contact options').first);
      await tester.pumpAndSettle();
      await tester.tap(find.text('Edit'));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextFormField).at(2), '0400999888');
      await tester.ensureVisible(find.text('Save'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Save'));
      await tester.pumpAndSettle();
      expect(service.getContactsForCustomer('abc').first.phone, before.phone);
      final request = (await LocalSalesRequestStore.read(user.id)).first;
      expect(request['kind'], 'Contact');
      expect((request['after'] as Map)['phone'], '0400999888');
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'Full customer details retain two contacts and request account terms without granting credit',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(
          const SalesCustomerForm(
            initial: BusinessCardScanResult(
              businessName: 'Reference Full Details',
              contactName: 'Alex Example',
              phone: '0400000000',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      final ctx = tester.element(find.byType(SalesCustomerForm)),
          user = ctx.read<AppSession>().currentUser,
          service = ctx.read<CustomerService>();
      await tester.scrollUntilVisible(
        find.text('Add another contact'),
        300,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Add another contact'));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
        find.text('Contact 2'),
        200,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.pumpAndSettle();
      await tester.enterText(
        find.byKey(const ValueKey('customer-field-name')).last,
        'Riley Example',
      );
      await tester.enterText(
        find.byKey(const ValueKey('customer-field-mobile')).last,
        '0400000001',
      );
      await tester.scrollUntilVisible(
        find.text('Add full details'),
        300,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Add full details'));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
        find.text('Customer wants account terms'),
        400,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Customer wants account terms'));
      await tester.tap(find.text('Save customer'));
      await tester.pumpAndSettle();
      final customer = service.customers
          .where((c) => c.businessName == 'Reference Full Details')
          .single;
      expect(service.getContactsForCustomer(customer.id).length, 2);
      final prefs = await SharedPreferences.getInstance();
      final meta = jsonDecode(
        prefs.getString('customer-detail-${user.id}-${customer.id}')!,
      ) as Map;
      expect(meta['paymentTerms'], 'COD');
      expect(meta['accountTermsRequested'], true);
      expect((meta['contactPreferences'] as Map).length, 2);
      expect(
        (await LocalSalesRequestStore.read(user.id)).first['kind'],
        'Account terms',
      );
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'Accessory colour details use lengths without a floor-area calculator',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(375, 812));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      final series = inventoryCatalog(
        demo: true,
        region: SalesRegion.sydney,
      ).firstWhere((s) => s.id == 'reducer');
      await tester.pumpWidget(
        app(
          InventoryColourDetails(series: series, colour: series.colours.first),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Job calculator'), findsNothing);
      expect(find.textContaining('lengths'), findsWidgets);
      expect(tester.takeException(), isNull);
    },
  );
  testWidgets(
    'Adding contacts to an existing customer preserves pricing and account metadata',
    (tester) async {
      await tester.binding.setSurfaceSize(const Size(393, 852));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        app(
          const SalesCustomerForm(
            initial: BusinessCardScanResult(
              businessName: 'ABC Flooring',
              contactName: 'Morgan Example',
              phone: '0400000002',
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      final ctx = tester.element(find.byType(SalesCustomerForm)),
          user = ctx.read<AppSession>().currentUser,
          service = ctx.read<CustomerService>();
      final count = service.customers.length,
          before = service.getContactsForCustomer('abc').length;
      final prefs = await SharedPreferences.getInstance();
      final key = 'customer-detail-${user.id}-abc';
      await prefs.setString(
        key,
        jsonEncode({
          'priceLevel': 'VIP',
          'paymentTerms': '30 days',
          'tradingName': 'Existing trading name',
          'contactPreferences': {
            'old-contact': {'role': 'Staff'},
          },
        }),
      );
      await tester.tap(find.text('Save customer'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Use existing customer'));
      await tester.pumpAndSettle();
      expect(service.customers.length, count);
      expect(service.getContactsForCustomer('abc').length, before + 1);
      final metadata = jsonDecode(prefs.getString(key)!) as Map;
      expect(metadata['priceLevel'], 'VIP');
      expect(metadata['paymentTerms'], '30 days');
      expect(metadata['tradingName'], 'Existing trading name');
      expect(
        (metadata['contactPreferences'] as Map).containsKey('old-contact'),
        isTrue,
      );
      expect(tester.takeException(), isNull);
    },
  );
}
