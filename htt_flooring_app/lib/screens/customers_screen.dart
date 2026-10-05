import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/customer_service.dart';
import '../services/sales_session.dart';
import '../theme/app_theme.dart';
import 'customer_detail_screen.dart';

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  final TextEditingController _searchController = TextEditingController();

  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();
    final customerService = context.watch<CustomerService>();

    final customers = customerService.customers
        .where((customer) => session.canAccessRegion(customer.region))
        .where((customer) {
          if (_query.isEmpty) {
            return true;
          }

          final query = _query.toLowerCase();

          return customer.businessName.toLowerCase().contains(query) ||
              customer.address.toLowerCase().contains(query) ||
              customer.abn.toLowerCase().contains(query);
        })
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Customers'),
        actions: [IconButton(onPressed: () {}, icon: const Icon(Icons.menu))],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
            child: TextField(
              controller: _searchController,
              onChanged: (value) {
                setState(() {
                  _query = value.trim();
                });
              },
              decoration: InputDecoration(
                hintText: 'Search company, address or ABN...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _query.isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          _searchController.clear();

                          setState(() {
                            _query = '';
                          });
                        },
                        icon: const Icon(Icons.close),
                      ),
                filled: true,
                fillColor: AppColors.card,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          Expanded(
            child: customers.isEmpty
                ? _buildEmptyState()
                : ListView.separated(
                    padding: const EdgeInsets.only(bottom: 20),
                    itemCount: customers.length,
                    separatorBuilder: (_, _) =>
                        const Divider(height: 1, color: AppColors.border),
                    itemBuilder: (context, index) {
                      final customer = customers[index];

                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 18,
                          vertical: 12,
                        ),
                        leading: CircleAvatar(
                          backgroundColor: AppColors.copperLight,
                          child: Text(
                            _companyInitials(customer.businessName),
                            style: const TextStyle(
                              color: AppColors.copper,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        title: Text(
                          customer.businessName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.text,
                          ),
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 7),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (customer.address.trim().isNotEmpty)
                                _buildCompanyInfo(
                                  icon: Icons.location_on_outlined,
                                  text: customer.address,
                                ),

                              if (customer.address.trim().isNotEmpty &&
                                  customer.abn.trim().isNotEmpty)
                                const SizedBox(height: 5),

                              if (customer.abn.trim().isNotEmpty)
                                _buildCompanyInfo(
                                  icon: Icons.business_outlined,
                                  text: 'ABN ${customer.abn}',
                                ),

                              if (customer.address.trim().isEmpty &&
                                  customer.abn.trim().isEmpty)
                                const Text(
                                  'No company details',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppColors.muted,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        trailing: const Icon(
                          Icons.chevron_right_rounded,
                          color: AppColors.muted,
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

  Widget _buildCompanyInfo({required IconData icon, required String text}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 15, color: AppColors.muted),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 13,
              height: 1.3,
              color: AppColors.muted,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.business_outlined,
              size: 42,
              color: AppColors.muted,
            ),
            const SizedBox(height: 12),
            Text(
              _query.isEmpty ? 'No companies found' : 'No matching companies',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.text,
              ),
            ),
            if (_query.isNotEmpty) ...[
              const SizedBox(height: 5),
              const Text(
                'Try another company name, address or ABN.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.muted),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _companyInitials(String businessName) {
    final words = businessName
        .trim()
        .split(RegExp(r'\s+'))
        .where((word) => word.isNotEmpty)
        .toList();

    if (words.isEmpty) {
      return '?';
    }

    if (words.length == 1) {
      final word = words.first;

      if (word.length == 1) {
        return word.toUpperCase();
      }

      return word.substring(0, 2).toUpperCase();
    }

    return '${words.first[0]}${words[1][0]}'.toUpperCase();
  }
}
