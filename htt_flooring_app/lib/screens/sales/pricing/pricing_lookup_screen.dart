import 'package:flutter/material.dart';
import 'package:htt_flooring_app/models/sales_user.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';
import 'customer_pricing_screen.dart';

class PricingLookupScreen extends StatefulWidget {
  const PricingLookupScreen({super.key});

  @override
  State<PricingLookupScreen> createState() => _PricingLookupScreenState();
}

class _PricingLookupScreenState extends State<PricingLookupScreen> {
  final TextEditingController _searchController = TextEditingController();

  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();
    final customerService = context.watch<CustomerService>();

    final customers =
        customerService.customers.where((customer) {
          if (!session.canAccessRegion(customer.region)) {
            return false;
          }

          if (_searchQuery.isEmpty) {
            return true;
          }

          return customerService.customerMatchesSearch(customer, _searchQuery);
        }).toList()..sort(
          (a, b) => a.businessName.toLowerCase().compareTo(
            b.businessName.toLowerCase(),
          ),
        );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Customer Pricing')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 30),
        children: [
          const Text(
            'Select Customer',
            style: TextStyle(
              color: AppColors.text,
              fontFamily: 'serif',
              fontSize: 26,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            'View customer-specific pricing for '
            '${session.regionName} customers.',
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 13,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: _searchController,
            onChanged: (value) {
              setState(() {
                _searchQuery = value.trim();
              });
            },
            decoration: InputDecoration(
              hintText: 'Search customer or contact...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchQuery.isEmpty
                  ? null
                  : IconButton(
                      onPressed: () {
                        _searchController.clear();

                        setState(() {
                          _searchQuery = '';
                        });
                      },
                      icon: const Icon(Icons.close),
                    ),
              filled: true,
              fillColor: AppColors.card,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.green),
              ),
            ),
          ),
          const SizedBox(height: 25),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Customers',
                  style: TextStyle(
                    color: AppColors.text,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                '${customers.length}',
                style: const TextStyle(
                  color: AppColors.muted,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (customers.isEmpty)
            const _EmptyCustomerState()
          else
            ...customers.map((customer) => _CustomerCard(customer: customer)),
        ],
      ),
    );
  }
}

class _CustomerCard extends StatelessWidget {
  const _CustomerCard({required this.customer});

  final Customer customer;

  @override
  Widget build(BuildContext context) {
    final customerService = context.read<CustomerService>();
    final primaryContact = customerService.getPrimaryContact(customer.id);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => CustomerPricingScreen(customer: customer),
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppColors.copperLight,
                  child: Text(
                    _initials(customer.businessName),
                    style: const TextStyle(
                      color: AppColors.copper,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        customer.businessName,
                        style: const TextStyle(
                          color: AppColors.text,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      if (primaryContact != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          primaryContact.name,
                          style: const TextStyle(
                            color: AppColors.muted,
                            fontSize: 12,
                          ),
                        ),
                      ],
                      const SizedBox(height: 5),
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on_outlined,
                            size: 13,
                            color: AppColors.copper,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            customer.region.label,
                            style: const TextStyle(
                              color: AppColors.muted,
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            customer.type,
                            style: const TextStyle(
                              color: AppColors.muted,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: AppColors.muted),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _initials(String value) {
    final words = value
        .trim()
        .split(RegExp(r'\s+'))
        .where((word) => word.isNotEmpty)
        .toList();

    if (words.isEmpty) {
      return '?';
    }

    if (words.length == 1) {
      final word = words.first;

      return word.substring(0, word.length >= 2 ? 2 : 1).toUpperCase();
    }

    return '${words[0][0]}${words[1][0]}'.toUpperCase();
  }
}

class _EmptyCustomerState extends StatelessWidget {
  const _EmptyCustomerState();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 38),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: const Column(
        children: [
          Icon(Icons.person_search_outlined, size: 40, color: AppColors.muted),
          SizedBox(height: 12),
          Text(
            'No customers found',
            style: TextStyle(
              color: AppColors.text,
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: 5),
          Text(
            'Try another customer name or contact.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
