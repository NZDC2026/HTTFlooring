import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../models/sales_user.dart';
import '../../../services/app_session.dart';
import '../../../services/customer_service.dart';
import '../../../services/customer_location_service.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/sales_document_service.dart';
import '../../../services/sales_session.dart';

enum CustomerListFilter { all, attention, dueVisit, overdue }

class DirectoryCustomer {
  const DirectoryCustomer({
    required this.customer,
    required this.tier,
    required this.suburb,
    required this.contact,
    this.distance,
    this.visitDays,
    this.invoiceDays,
    this.sales = 0,
    this.growth,
    this.overdue = 0,
    this.onHold = false,
    this.tasks = 0,
    this.visit = '',
    this.dueVisit = false,
  });
  final Customer customer;
  final String tier, suburb, contact, visit;
  final double? distance, growth;
  final int? visitDays, invoiceDays;
  final double sales, overdue;
  final bool onHold, dueVisit;
  final int tasks;
  bool get noRecentVisit =>
      visitDays != null &&
      visitDays! >=
          (tier == 'A'
              ? 14
              : tier == 'B'
              ? 30
              : 60);
  bool get attention => overdue > 0 || onHold || noRecentVisit;
}

class CustomerDirectoryData {
  CustomerDirectoryData(BuildContext context) {
    final service = context.read<CustomerService>();
    final session = context.read<SalesSession>();
    final app = context.read<AppSession>();
    demo =
        AppSession.demoLoginEnabled &&
        (app.employeeAccessToken?.isEmpty ?? true);
    final customers = service.customers
        .where((c) => !c.archived && session.canAccessRegion(c.region))
        .toList();
    final locations = context.read<CustomerLocationService>();
    if (demo && session.region == SalesRegion.sydney) {
      final samples =
          <
            (
              String,
              String,
              String,
              double,
              int,
              String,
              double,
              double?,
              int,
              double,
              bool,
              int,
              String,
              bool,
            )
          >[
            (
              'ABC Flooring',
              'A',
              'Sydney',
              2.4,
              3,
              'John',
              19621,
              49,
              18,
              0,
              false,
              3,
              'Visit Wed 18 Nov',
              false,
            ),
            (
              'Harbour Floors',
              'A',
              'Rozelle',
              4.1,
              8,
              'Peter',
              3630,
              -50,
              25,
              7938,
              false,
              1,
              '',
              false,
            ),
            (
              'Metro Surfaces',
              'B',
              'Alexandria',
              4.8,
              6,
              'Tony',
              5472,
              null,
              12,
              0,
              true,
              0,
              '',
              false,
            ),
            (
              'Premier Floorcraft',
              'B',
              'Newtown',
              5.3,
              14,
              'Sam',
              0,
              null,
              64,
              4008,
              false,
              0,
              '',
              false,
            ),
            (
              'Timber World',
              'B',
              'Sydney',
              6.8,
              14,
              'Emma',
              0,
              null,
              47,
              0,
              false,
              4,
              'Visit Fri 20 Nov',
              false,
            ),
            (
              'Bondi Floor Studio',
              'A',
              'Bondi',
              7.9,
              20,
              'Chloe',
              5544,
              null,
              4,
              0,
              false,
              0,
              '',
              true,
            ),
            (
              'North Shore Hardwood',
              'B',
              'Chatswood',
              9.6,
              47,
              'Ben',
              0,
              null,
              59,
              0,
              false,
              0,
              '',
              true,
            ),
            (
              'Floor Direct',
              'B',
              'Sydney',
              12.6,
              32,
              'David',
              0,
              null,
              113,
              2497,
              true,
              3,
              '',
              true,
            ),
            (
              'Coastal Carpets & Floors',
              'B',
              'Manly',
              15.2,
              40,
              'Nina',
              0,
              null,
              44,
              0,
              false,
              0,
              '',
              true,
            ),
            (
              'City Timber Floors',
              'B',
              'Parramatta',
              18.2,
              21,
              'Grace',
              7758,
              58,
              7,
              0,
              false,
              3,
              'Visit Wed 18 Nov',
              false,
            ),
            (
              'Sutherland Supplies',
              'C',
              'Sutherland',
              24,
              82,
              'Gary',
              0,
              null,
              126,
              0,
              false,
              0,
              '',
              true,
            ),
            (
              'Northern Floors',
              'C',
              'Hornsby',
              24.5,
              43,
              'Mark',
              0,
              null,
              49,
              1082,
              false,
              3,
              '',
              false,
            ),
            (
              'Westside Laminates',
              'C',
              'Blacktown',
              31.5,
              29,
              'Raj',
              0,
              null,
              41,
              2904,
              false,
              0,
              '',
              false,
            ),
          ];
      rows = samples.map((s) {
        final existing = customers
            .where((c) => c.businessName == s.$1)
            .firstOrNull;
        final c =
            existing ??
            Customer(
              id: 'demo-directory-${s.$1.toLowerCase().replaceAll(' ', '-')}',
              businessName: s.$1,
              type: 'Trade Customer',
              region: SalesRegion.sydney,
              address: '${s.$3}, NSW',
              abn: '',
              lastOrderDate: DateTime.now().subtract(Duration(days: s.$9)),
              thisMonthOrders: 0,
              lastMonthOrders: 0,
              thisMonthOrderCount: 0,
              outstanding: 0,
              overdue: 0,
              oldestOverdueDays: 0,
              favourite: false,
            );
        return DirectoryCustomer(
          customer: c,
          tier: s.$2,
          suburb: s.$3,
          distance: s.$4,
          visitDays: existing == null
              ? s.$5
              : locations.demoDaysSinceVisit(c.id) ?? s.$5,
          contact: s.$6,
          sales: s.$7,
          growth: s.$8,
          invoiceDays: s.$9,
          overdue: s.$10,
          onHold: s.$11,
          tasks: s.$12,
          visit: s.$13,
          dueVisit: s.$14,
        );
      }).toList();
      // Include customers added during the demo without replacing the reference examples.
      for (final c in customers.where(
        (c) => !rows.any((r) => r.customer.id == c.id),
      )) {
        rows.add(
          DirectoryCustomer(
            customer: c,
            tier: 'B',
            suburb: session.regionName,
            contact: service.getPrimaryContact(c.id)?.name ?? 'Contact',
          ),
        );
      }
    } else {
      final notes = context.read<CustomerNoteService>().pendingFollowUps;
      final invoices = context.read<SalesDocumentService>().invoices;
      rows = customers.map((c) {
        final scoped = invoices.where((i) => i.customer.id == c.id).toList();
        final now = DateTime.now();
        final sales = scoped
            .where((i) {
              final date = i.invoiceDate ?? i.createdAt;
              return date.year == now.year && date.month == now.month;
            })
            .fold(0.0, (s, i) => s + i.subtotal);
        final loc = locations.getForCustomer(c.id).firstOrNull;
        final tier = c.potential == CustomerPotential.high
            ? 'A'
            : c.potential == CustomerPotential.low
            ? 'C'
            : 'B';
        return DirectoryCustomer(
          customer: c,
          tier: tier,
          suburb: session.regionName,
          contact: service.getPrimaryContact(c.id)?.name ?? 'Contact',
          distance: loc?.distanceKm,
          sales: sales,
          overdue: c.overdue,
          tasks: notes.where((n) => n.customerId == c.id).length,
          invoiceDays: c.lastOrderDate == null
              ? null
              : now.difference(c.lastOrderDate!).inDays,
        );
      }).toList();
    }
  }
  late bool demo;
  late List<DirectoryCustomer> rows;
  List<DirectoryCustomer> filtered(CustomerListFilter filter) =>
      switch (filter) {
        CustomerListFilter.all => rows,
        CustomerListFilter.attention => rows.where((r) => r.attention).toList(),
        CustomerListFilter.dueVisit =>
          rows.where((r) => r.dueVisit || (!demo && r.noRecentVisit)).toList(),
        CustomerListFilter.overdue => rows.where((r) => r.overdue > 0).toList(),
      };
  double get overdueTotal => rows.fold(0, (sum, r) => sum + r.overdue);
}
