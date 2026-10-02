import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/customer.dart';
import '../services/sales_document_service.dart';
import '../theme/app_theme.dart';
import 'customer_pricing_screen.dart';
import 'customer_orders_screen.dart';
import 'customer_invoices_screen.dart';
import 'customer_notes_screen.dart';

class CustomerDetailScreen extends StatefulWidget {
  final Customer customer;

  const CustomerDetailScreen({super.key, required this.customer});

  @override
  State<CustomerDetailScreen> createState() => _CustomerDetailScreenState();
}

class _CustomerDetailScreenState extends State<CustomerDetailScreen> {
  Customer get customer => widget.customer;

  @override
  Widget build(BuildContext context) {
    final documentService = context.watch<SalesDocumentService>();

    final outstanding = documentService.getCustomerOutstanding(customer.id);

    final overdue = documentService.getCustomerOverdue(customer.id);

    final oldestOverdueDays = documentService.getCustomerOldestOverdueDays(
      customer.id,
    );

    return Scaffold(
      appBar: AppBar(),

      body: ListView(
        children: [
          Container(
            color: AppColors.card,
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                const CircleAvatar(
                  radius: 34,
                  backgroundColor: AppColors.copper,
                  child: Text(
                    'AF',
                    style: TextStyle(color: Colors.white, fontSize: 20),
                  ),
                ),

                const SizedBox(height: 10),

                Text(
                  customer.businessName,
                  style: const TextStyle(fontFamily: 'serif', fontSize: 28),
                ),

                Text(
                  customer.type,
                  style: const TextStyle(color: AppColors.muted),
                ),

                const SizedBox(height: 7),

                const Chip(
                  avatar: Icon(Icons.lock, size: 13),
                  label: Text('Sydney'),
                ),
              ],
            ),
          ),

          DefaultTabController(
            length: 5,
            child: Column(
              children: [
                TabBar(
                  isScrollable: true,
                  labelColor: AppColors.copper,
                  indicatorColor: AppColors.copper,
                  tabs: const [
                    Tab(text: 'Overview'),
                    Tab(text: 'Pricing'),
                    Tab(text: 'Orders'),
                    Tab(text: 'Invoices'),
                    Tab(text: 'Notes'),
                  ],
                  onTap: (index) {
                    if (index == 1) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              CustomerPricingScreen(customer: customer),
                        ),
                      );

                      return;
                    }

                    if (index == 2) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              CustomerOrdersScreen(customer: customer),
                        ),
                      );

                      return;
                    }

                    if (index == 3) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              CustomerInvoicesScreen(customer: customer),
                        ),
                      );

                      return;
                    }

                    if (index == 4) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              CustomerNotesScreen(customer: customer),
                        ),
                      );
                    }
                  },
                ),

                Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          action(Icons.phone, 'Call'),
                          action(Icons.email, 'Email'),
                          action(Icons.location_on, 'Map'),
                          action(Icons.more_horiz, 'More'),
                        ],
                      ),

                      const SizedBox(height: 25),

                      const Text(
                        'Contact Person',
                        style: TextStyle(color: AppColors.muted),
                      ),

                      Text(
                        customer.contactName,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),

                      Text(customer.phone),
                      Text(customer.email),

                      const SizedBox(height: 25),

                      const Text(
                        'Account Summary',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),

                      const SizedBox(height: 12),

                      Row(
                        children: [
                          Expanded(
                            child: summary(
                              'Outstanding',
                              '\$${outstanding.toStringAsFixed(0)}',
                              danger: outstanding > 0,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: summary(
                              'Overdue',
                              '\$${overdue.toStringAsFixed(0)}',
                              danger: overdue > 0,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: summary(
                              'Oldest Overdue',
                              oldestOverdueDays > 0
                                  ? '$oldestOverdueDays days'
                                  : '—',
                              danger: oldestOverdueDays > 0,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),

                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    CustomerInvoicesScreen(customer: customer),
                              ),
                            );
                          },
                          icon: const Icon(Icons.receipt_long_outlined),
                          label: const Text('View Invoices'),
                        ),
                      ),

                      const SizedBox(height: 25),

                      const Text(
                        'Customer Activity',
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),

                      const SizedBox(height: 12),

                      Row(
                        children: [
                          Expanded(
                            child: summary(
                              'Last Order',
                              DateFormat('dd MMM yyyy')
                                  .format(customer.lastOrderDate!),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: summary(
                              'This Month',
                              '\$${customer.thisMonthOrders.toStringAsFixed(0)}',
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: summary(
                              'Last Month',
                              '\$${customer.lastMonthOrders.toStringAsFixed(0)}',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget action(IconData icon, String label) {
    return Column(
      children: [
        Icon(icon),
        const SizedBox(height: 5),
        Text(label, style: const TextStyle(fontSize: 11)),
      ],
    );
  }

  Widget summary(String title, String value, {bool danger = false}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: danger ? AppColors.dangerLight : AppColors.card,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 10, color: AppColors.muted),
          ),
          const SizedBox(height: 5),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: danger ? AppColors.danger : AppColors.text,
            ),
          ),
        ],
      ),
    );
  }
}
