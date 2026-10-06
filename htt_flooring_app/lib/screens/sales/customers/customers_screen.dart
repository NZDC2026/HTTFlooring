import 'package:flutter/material.dart';
import 'package:htt_flooring_app/models/sales_user.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../models/customer_location.dart';
import '../../../services/customer_location_service.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';

import 'business_card_scanner_screen.dart';
import 'customer_detail_screen.dart';
import 'customer_map_screen.dart';

enum _CustomerFilter { all, nearby, recent, alphabetical }

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  final TextEditingController _searchController = TextEditingController();

  String _query = '';

  _CustomerFilter _filter = _CustomerFilter.all;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();
    final customerService = context.watch<CustomerService>();
    final locationService = context.watch<CustomerLocationService>();

    final customers = customerService.customers
        .where(
          (customer) =>
              session.canAccessRegion(customer.region) &&
              customerService.customerMatchesSearch(customer, _query),
        )
        .toList();

    final filteredCustomers = _applyFilter(customers, locationService);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Customers'),
        actions: [
          IconButton(
            tooltip: 'Scan Business Card',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const BusinessCardScannerScreen(),
                ),
              );
            },
            icon: const Icon(Icons.document_scanner_outlined),
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'archived') {
                _showArchivedCustomers(context);
              }
            },
            itemBuilder: (_) => const [
              PopupMenuItem(
                value: 'archived',
                child: Row(
                  children: [
                    Icon(Icons.archive_outlined),
                    SizedBox(width: 10),
                    Text('Archived Customers'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearch(),

          _buildViewSwitcher(),

          _buildFilters(),

          Expanded(
            child: filteredCustomers.isEmpty
                ? _buildEmptyState()
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(18, 8, 18, 24),
                    itemCount: filteredCustomers.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final customer = filteredCustomers[index];

                      final locations = locationService.getForCustomer(
                        customer.id,
                      );

                      final primaryLocation = _primaryLocation(locations);

                      return _buildCustomerCard(customer, primaryLocation);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearch() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 14, 18, 10),
      child: TextField(
        controller: _searchController,
        onChanged: (value) {
          setState(() {
            _query = value.trim();
          });
        },
        decoration: InputDecoration(
          hintText: 'Search customers...',
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
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.border),
          ),
        ),
      ),
    );
  }

  Widget _buildViewSwitcher() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 0, 18, 12),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Expanded(
              child: _viewButton(
                icon: Icons.list,
                label: 'List',
                selected: true,
                onTap: () {},
              ),
            ),
            Expanded(
              child: _viewButton(
                icon: Icons.map_outlined,
                label: 'Map',
                selected: false,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const CustomerMapScreen(),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _viewButton({
    required IconData icon,
    required String label,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(9),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.green : Colors.transparent,
          borderRadius: BorderRadius.circular(9),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 18,
              color: selected ? Colors.white : AppColors.muted,
            ),
            const SizedBox(width: 7),
            Text(
              label,
              style: TextStyle(
                color: selected ? Colors.white : AppColors.text,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilters() {
    return SizedBox(
      height: 46,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 18),
        children: [
          _filterChip('All', _CustomerFilter.all),
          _filterChip('Nearby', _CustomerFilter.nearby),
          _filterChip('Recent', _CustomerFilter.recent),
          _filterChip('A-Z', _CustomerFilter.alphabetical),
        ],
      ),
    );
  }

  Widget _filterChip(String label, _CustomerFilter value) {
    final selected = _filter == value;

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        showCheckmark: false,
        selectedColor: AppColors.copperLight,
        backgroundColor: AppColors.card,
        side: BorderSide(color: selected ? AppColors.copper : AppColors.border),
        labelStyle: TextStyle(
          color: selected ? AppColors.copper : AppColors.text,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        onSelected: (_) {
          setState(() {
            _filter = value;
          });
        },
      ),
    );
  }

  List<Customer> _applyFilter(
    List<Customer> source,
    CustomerLocationService locationService,
  ) {
    final customers = List<Customer>.from(source);

    switch (_filter) {
      case _CustomerFilter.all:
        return customers;

      case _CustomerFilter.nearby:
        customers.removeWhere((customer) {
          final locations = locationService.getForCustomer(customer.id);

          if (locations.isEmpty) {
            return true;
          }

          return !locations.any((location) => location.distanceKm <= 20);
        });

        customers.sort((a, b) {
          final aDistance = _nearestDistance(
            locationService.getForCustomer(a.id),
          );

          final bDistance = _nearestDistance(
            locationService.getForCustomer(b.id),
          );

          return aDistance.compareTo(bDistance);
        });

        return customers;

      case _CustomerFilter.recent:
        customers.sort((a, b) {
          final aDate = a.lastOrderDate ?? DateTime(2000);

          final bDate = b.lastOrderDate ?? DateTime(2000);

          return bDate.compareTo(aDate);
        });

        return customers;

      case _CustomerFilter.alphabetical:
        customers.sort(
          (a, b) => a.businessName.toLowerCase().compareTo(
            b.businessName.toLowerCase(),
          ),
        );

        return customers;
    }
  }

  double _nearestDistance(List<CustomerLocation> locations) {
    if (locations.isEmpty) {
      return double.infinity;
    }

    return locations
        .map((location) => location.distanceKm)
        .reduce((a, b) => a < b ? a : b);
  }

  CustomerLocation? _primaryLocation(List<CustomerLocation> locations) {
    if (locations.isEmpty) {
      return null;
    }

    for (final location in locations) {
      if (location.isPrimary) {
        return location;
      }
    }

    return locations.first;
  }

  Widget _buildCustomerCard(Customer customer, CustomerLocation? location) {
    return Material(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => CustomerDetailScreen(customer: customer),
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: AppColors.copperLight,
                child: Text(
                  _companyInitials(customer.businessName),
                  style: const TextStyle(
                    color: AppColors.copper,
                    fontWeight: FontWeight.w700,
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

                    const SizedBox(height: 5),

                    Row(
                      children: [
                        if (location != null) ...[
                          const Icon(
                            Icons.near_me_outlined,
                            size: 13,
                            color: AppColors.copper,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${location.distanceKm.toStringAsFixed(1)} km',
                            style: const TextStyle(
                              color: AppColors.copper,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        Text(
                          customer.region.label,
                          style: const TextStyle(
                            color: AppColors.muted,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 7),

                    Text(
                      location?.address ?? customer.address,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              const Icon(Icons.chevron_right, color: AppColors.muted),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.people_outline, size: 44, color: AppColors.muted),
            SizedBox(height: 12),
            Text(
              'No customers found',
              style: TextStyle(
                color: AppColors.text,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showArchivedCustomers(BuildContext context) {
    final service = context.read<CustomerService>();

    final session = context.read<SalesSession>();

    final archived = service.archivedCustomers
        .where((customer) => session.canAccessRegion(customer.region))
        .toList();

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.background,
      builder: (sheetContext) {
        return SafeArea(
          child: SizedBox(
            height: MediaQuery.sizeOf(sheetContext).height * 0.72,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(18),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Archived Customers',
                          style: TextStyle(
                            color: AppColors.text,
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          Navigator.pop(sheetContext);
                        },
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                ),

                const Divider(height: 1, color: AppColors.border),

                Expanded(
                  child: archived.isEmpty
                      ? const Center(
                          child: Text(
                            'No archived customers',
                            style: TextStyle(color: AppColors.muted),
                          ),
                        )
                      : ListView.separated(
                          itemCount: archived.length,
                          separatorBuilder: (_, _) => const Divider(height: 1),
                          itemBuilder: (context, index) {
                            final customer = archived[index];

                            return ListTile(
                              title: Text(customer.businessName),
                              subtitle: Text(customer.address),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () {
                                Navigator.pop(sheetContext);

                                Navigator.push(
                                  this.context,
                                  MaterialPageRoute(
                                    builder: (_) => CustomerDetailScreen(
                                      customer: customer,
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        );
      },
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

      return word.length == 1
          ? word.toUpperCase()
          : word.substring(0, 2).toUpperCase();
    }

    return '${words[0][0]}${words[1][0]}'.toUpperCase();
  }
}
