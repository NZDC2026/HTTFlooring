import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:sales_app/models/sales_user.dart';

import '../services/sales_session.dart';
import '../data/mock_data.dart';
import '../theme/app_theme.dart';
import 'customer_detail_screen.dart';

class CustomersScreen extends StatelessWidget {
  const CustomersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();

    final regionCustomers = customers
        .where((customer) => session.canAccessRegion(customer.region))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Customers'),
        actions: [IconButton(onPressed: () {}, icon: const Icon(Icons.menu))],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(14),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search customers...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: const Icon(Icons.filter_list),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 14),
            child: Row(
              children: [
                FilterChip(
                  selected: true,
                  label: Text('All'),
                  onSelected: null,
                ),
                SizedBox(width: 8),
                Chip(label: Text('Nearby')),
                SizedBox(width: 8),
                Chip(label: Text('Recent')),
                SizedBox(width: 8),
                Chip(label: Text('A-Z')),
              ],
            ),
          ),

          const SizedBox(height: 8),

          Expanded(
            child: ListView.separated(
              itemCount: regionCustomers.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final customer = regionCustomers[index];

                final lastOrder = customer.lastOrderDate == null
                    ? 'Never'
                    : DateFormat('dd MMM yyyy').format(customer.lastOrderDate!);

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 8,
                  ),

                  leading: CircleAvatar(
                    backgroundColor: AppColors.copperLight,
                    child: Text(
                      customer.businessName.substring(0, 2).toUpperCase(),
                      style: const TextStyle(
                        color: AppColors.copper,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),

                  title: Text(
                    customer.businessName,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),

                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${customer.type} · ${customer.region.label}'),
                      const SizedBox(height: 5),
                      Text(
                        'Last order: $lastOrder',
                        style: const TextStyle(fontSize: 11),
                      ),
                      Text(
                        'This month: \$${customer.thisMonthOrders.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 11),
                      ),
                      if (customer.overdue > 0)
                        Text(
                          'Overdue: \$${customer.overdue.toStringAsFixed(0)}',
                          style: const TextStyle(
                            color: AppColors.danger,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                    ],
                  ),

                  trailing: Icon(
                    customer.favourite ? Icons.star : Icons.star_border,
                    color: customer.favourite
                        ? AppColors.copper
                        : AppColors.muted,
                  ),

                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>
                            CustomerDetailScreen(customer: customer),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
