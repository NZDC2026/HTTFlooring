import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../services/customer_location_service.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';

import '../customers/customer_map_screen.dart';
import '../pricing/pricing_lookup_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key, required this.onNavigateToTab});

  final ValueChanged<int> onNavigateToTab;

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();

    final customerService = context.watch<CustomerService>();

    final locationService = context.watch<CustomerLocationService>();

    final regionCustomers = customerService.getCustomersForRegion(
      session.region,
    );

    final nearbyLocations = locationService.getForRegion(
      session.region,
      maxDistanceKm: 20,
    );

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(18, 22, 18, 32),
        children: [
          const Text(
            'Good morning,',
            style: TextStyle(
              color: AppColors.text,
              fontFamily: 'serif',
              fontSize: 28,
            ),
          ),

          const SizedBox(height: 2),

          Text(
            session.salespersonName,
            style: const TextStyle(
              color: AppColors.text,
              fontFamily: 'serif',
              fontSize: 34,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: 8),

          Row(
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 16,
                color: AppColors.copper,
              ),
              const SizedBox(width: 5),
              Text(
                '${session.regionName} Store',
                style: const TextStyle(
                  color: AppColors.copper,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 5),
              const Icon(Icons.lock_outline, size: 13, color: AppColors.muted),
            ],
          ),

          const SizedBox(height: 30),

          _summaryCard(
            context,
            icon: Icons.location_searching,
            title: 'YOUR CUSTOMERS TODAY',
            value: '${nearbyLocations.length} nearby',
            subtitle: 'within 20 km',
            onTap: () {
              _openMap(context, initialDistanceKm: 20);
            },
          ),

          const SizedBox(height: 12),

          _summaryCard(
            context,
            icon: Icons.history,
            title: 'RECENT CUSTOMERS',
            value: '${regionCustomers.length} viewed',
            subtitle: 'last 7 days',
            onTap: () {
              onNavigateToTab(1);
            },
          ),

          const SizedBox(height: 32),

          const Text(
            'Quick Access',
            style: TextStyle(
              color: AppColors.text,
              fontFamily: 'serif',
              fontSize: 24,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: 14),

          Row(
            children: [
              Expanded(
                child: _quickAction(
                  icon: Icons.people_outline,
                  title: 'Find\nCustomers',
                  onTap: () {
                    onNavigateToTab(1);
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _quickAction(
                  icon: Icons.inventory_2_outlined,
                  title: 'Inventory\nLookup',
                  onTap: () {
                    onNavigateToTab(2);
                  },
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: _quickAction(
                  icon: Icons.sell_outlined,
                  title: 'Customer\nPricing',
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const PricingLookupScreen(),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _quickAction(
                  icon: Icons.note_alt_outlined,
                  title: 'Customer\nNotes',
                  onTap: () {
                    onNavigateToTab(1);
                  },
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () {
              _openMap(context);
            },
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.green,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.white12,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.map_outlined,
                      color: Colors.white,
                      size: 25,
                    ),
                  ),
                  SizedBox(width: 15),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Map View',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'View customers around you',
                          style: TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  Icon(Icons.arrow_forward, color: Colors.white),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _openMap(BuildContext context, {double initialDistanceKm = 20}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CustomerMapScreen(initialDistanceKm: initialDistanceKm),
      ),
    );
  }

  Widget _summaryCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String value,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.copperLight,
                borderRadius: BorderRadius.circular(13),
              ),
              child: Icon(icon, color: AppColors.copper),
            ),
            const SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    value,
                    style: const TextStyle(
                      color: AppColors.text,
                      fontSize: 19,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.muted),
          ],
        ),
      ),
    );
  }

  Widget _quickAction({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        height: 116,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppColors.green, size: 25),
            const Spacer(),
            Text(
              title,
              style: const TextStyle(
                color: AppColors.text,
                fontSize: 14,
                height: 1.2,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
