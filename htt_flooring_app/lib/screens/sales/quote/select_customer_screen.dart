import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../models/sales_user.dart';
import '../../../services/sales_session.dart';
import '../../../services/customer_service.dart';
import '../../../theme/app_theme.dart';

class SelectCustomerScreen extends StatefulWidget {
  const SelectCustomerScreen({super.key});

  @override
  State<SelectCustomerScreen> createState() => _SelectCustomerScreenState();
}

class _SelectCustomerScreenState extends State<SelectCustomerScreen> {
  String search = '';

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();

    final customerService = context.watch<CustomerService>();

    final visibleCustomers = customerService.customers.where((customer) {
      if (customer.archived) {
        return false;
      }

      if (!session.canAccessRegion(customer.region)) {
        return false;
      }

      if (search.isEmpty) {
        return true;
      }

      final query = search.toLowerCase();

      return customerService.customerMatchesSearch(customer, query);
    }).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Select Customer')),

      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            color: AppColors.copperLight,
            child: Row(
              children: [
                const Icon(
                  Icons.lock_outline,
                  size: 17,
                  color: AppColors.copper,
                ),
                const SizedBox(width: 8),
                Text(
                  '${session.regionName} customers only',
                  style: const TextStyle(
                    color: AppColors.copper,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(14),
            child: TextField(
              onChanged: (value) {
                setState(() {
                  search = value;
                });
              },
              decoration: const InputDecoration(
                hintText: 'Search customer...',
                prefixIcon: Icon(Icons.search),
              ),
            ),
          ),

          Expanded(
            child: ListView.separated(
              itemCount: visibleCustomers.length,

              separatorBuilder: (_, _) => const Divider(height: 1),

              itemBuilder: (context, index) {
                final customer = visibleCustomers[index];

                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppColors.copperLight,
                    child: Text(
                      _initials(customer),
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
                  subtitle: Text(
                    '${customer.type} · '
                    '${customer.region.label}',
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    if (customer.archived) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            '${customer.businessName} has been archived '
                            'and cannot be used for new quotations.',
                          ),
                        ),
                      );

                      return;
                    }

                    Navigator.pop(context, customer);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  String _initials(Customer customer) {
    final words = customer.businessName.split(' ');

    if (words.length >= 2) {
      return '${words[0][0]}${words[1][0]}'.toUpperCase();
    }

    return customer.businessName.substring(0, 2).toUpperCase();
  }
}
