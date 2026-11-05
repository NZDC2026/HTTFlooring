import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../services/customer_product_sales.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_document_service.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';
import '../customers/customer_detail_screen.dart';
import '../customers/customer_displays_screen.dart';

class CustomerAlertsScreen extends StatefulWidget {
  const CustomerAlertsScreen({super.key});

  @override
  State<CustomerAlertsScreen> createState() => _CustomerAlertsScreenState();
}

class _CustomerAlertsScreenState extends State<CustomerAlertsScreen> {
  bool _showDemo = false;

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();
    final documents = context.watch<SalesDocumentService>();
    final customers = context
        .watch<CustomerService>()
        .customers
        .where((customer) => session.canAccessRegion(customer.region))
        .toList();
    final now = DateTime.now();
    final today = DateTime.utc(now.year, now.month, now.day);
    final alerts = <Widget>[];

    for (final customer in customers) {
      final invoices = documents.getCustomerInvoices(customer.id);
      DateTime? latest;
      final purchaseDates = [
        ?customer.lastOrderDate,
        for (final order in documents.getCustomerOrders(customer.id))
          order.convertedToOrderAt ?? order.createdAt,
        for (final invoice in invoices)
          invoice.convertedToOrderAt ??
              invoice.invoiceDate ??
              invoice.convertedToInvoiceAt ??
              invoice.createdAt,
      ];
      for (final date in purchaseDates) {
        if (!date.isAfter(now) && (latest == null || date.isAfter(latest))) {
          latest = date;
        }
      }
      if (latest != null) {
        final local = latest.toLocal();
        final days = today
            .difference(DateTime.utc(local.year, local.month, local.day))
            .inDays;
        if (days >= 30) {
          alerts.add(
            _alert(
              customer,
              icon: Icons.shopping_bag_outlined,
              title: '$days days without a purchase',
              detail:
                  'Last purchase · ${DateFormat('d MMM yyyy').format(local)}',
            ),
          );
        }
      }

      final report = CustomerProductSales(
        documents: invoices,
        customerId: customer.id,
        now: now,
      );
      for (final category in report.groups) {
        for (final series in category.series.values) {
          final trend = series.trend;
          final change = trend.previousSqm > 0
              ? trend.changePercent
              : trend.previousBoxes > 0
              ? (trend.currentBoxes - trend.previousBoxes) /
                    trend.previousBoxes *
                    100
              : null;
          if (change != null && change <= -30) {
            final volume = trend.previousSqm > 0
                ? '${trend.previousSqm.toStringAsFixed(1)} → ${trend.currentSqm.toStringAsFixed(1)} m²'
                : '${trend.previousBoxes} → ${trend.currentBoxes} boxes';
            alerts.add(
              _alert(
                customer,
                icon: Icons.trending_down,
                title:
                    '${trend.name} sales down ${change.abs().toStringAsFixed(0)}%',
                detail: '${category.trend.name} · $volume',
              ),
            );
          }
        }
      }
    }

    final demoCustomer = customers.firstOrNull;
    final coverage = CustomerDisplaysScreen.demoCoverage;
    return Scaffold(
      appBar: AppBar(title: const Text('Customer Alerts')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Purchase alerts start at 30 days. Series alerts compare the last 30 days with the previous 30 days and flag declines of 30% or more.',
            style: TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 12),
          if (alerts.isEmpty)
            const ListTile(title: Text('No purchase or sales alerts')),
          ...alerts,
          const Divider(),
          const ListTile(
            leading: Icon(Icons.inventory_2_outlined),
            title: Text('Display board alerts'),
            subtitle: Text(
              'Missing dates are unavailable for live display boards.',
            ),
          ),
          SwitchListTile(
            title: const Text('Show demo alert'),
            value: _showDemo,
            onChanged: (value) => setState(() => _showDemo = value),
          ),
          if (_showDemo && demoCustomer != null)
            _alert(
              demoCustomer,
              icon: Icons.inventory_2_outlined,
              title:
                  '${coverage.total - coverage.displayed} display boards missing',
              detail: 'Demo · Missing for 30 days',
              displays: true,
            ),
        ],
      ),
    );
  }

  Widget _alert(
    Customer customer, {
    required IconData icon,
    required String title,
    required String detail,
    bool displays = false,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.copper),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text('${customer.businessName}\n$detail'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute(
            builder: (_) => displays
                ? CustomerDisplaysScreen(customer: customer)
                : CustomerDetailScreen(customer: customer),
          ),
        ),
      ),
    );
  }
}
