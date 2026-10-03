import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sales_app/models/sales_user.dart';

import '../models/customer.dart';
import '../services/sales_session.dart';
import '../services/customer_service.dart';
import '../theme/app_theme.dart';
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

    final regionCustomers = customerService.customers.where((customer) {
      if (!session.canAccessRegion(customer.region)) {
        return false;
      }

      if (_searchQuery.isEmpty) {
        return true;
      }

      final query = _searchQuery.toLowerCase();

      return customer.businessName.toLowerCase().contains(query) ||
          customer.contactName.toLowerCase().contains(query) ||
          customer.email.toLowerCase().contains(query) ||
          customer.phone.toLowerCase().contains(query);
    }).toList();

    regionCustomers.sort(
      (a, b) =>
          a.businessName.toLowerCase().compareTo(b.businessName.toLowerCase()),
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Pricing Lookup')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          const Text(
            'Customer Pricing',
            style: TextStyle(
              fontFamily: 'serif',
              fontSize: 26,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 5),

          Text(
            'Select a ${session.regionName} customer '
            'to view customer-specific pricing.',
            style: const TextStyle(color: AppColors.muted, height: 1.4),
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
              hintText: 'Search customer...',
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
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.border),
              ),
            ),
          ),

          const SizedBox(height: 22),

          Row(
            children: [
              const Expanded(
                child: Text(
                  'Customers',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                ),
              ),

              Text(
                '${regionCustomers.length}',
                style: const TextStyle(
                  color: AppColors.muted,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          if (regionCustomers.isEmpty)
            const _EmptyCustomerState()
          else
            ...regionCustomers.map(
              (customer) => _CustomerPricingCard(customer: customer),
            ),
        ],
      ),
    );
  }
}

class _CustomerPricingCard extends StatelessWidget {
  final Customer customer;

  const _CustomerPricingCard({required this.customer});

  @override
  Widget build(BuildContext context) {
    final initials = _getInitials(customer.businessName);

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => CustomerPricingScreen(customer: customer),
              ),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 46,
                  height: 46,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppColors.copperLight,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    initials,
                    style: const TextStyle(
                      color: AppColors.copper,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        customer.businessName,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                      ),

                      const SizedBox(height: 3),

                      Text(
                        customer.contactName,
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 12,
                        ),
                      ),

                      const SizedBox(height: 4),

                      Row(
                        children: [
                          const Icon(
                            Icons.location_on_outlined,
                            size: 13,
                            color: AppColors.muted,
                          ),

                          const SizedBox(width: 3),

                          Text(
                            customer.region.label,
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

                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.copperLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'PRICING',
                    style: TextStyle(
                      color: AppColors.copper,
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),

                const SizedBox(width: 5),

                const Icon(Icons.chevron_right, color: AppColors.muted),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _getInitials(String name) {
    final words = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((word) => word.isNotEmpty)
        .toList();

    if (words.isEmpty) {
      return '?';
    }

    if (words.length == 1) {
      return words.first.substring(0, 1).toUpperCase();
    }

    return '${words[0][0]}${words[1][0]}'.toUpperCase();
  }
}

class _EmptyCustomerState extends StatelessWidget {
  const _EmptyCustomerState();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: const Column(
        children: [
          Icon(Icons.person_search_outlined, size: 34, color: AppColors.muted),

          SizedBox(height: 10),

          Text(
            'No customers found',
            style: TextStyle(fontWeight: FontWeight.w700),
          ),

          SizedBox(height: 4),

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
