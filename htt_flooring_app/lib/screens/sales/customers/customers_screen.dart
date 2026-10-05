import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../models/customer.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_session.dart';
import '../../../theme/app_theme.dart';
import 'customer_detail_screen.dart';

enum _CustomerView { active, archived }

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  final TextEditingController _searchController = TextEditingController();

  String _query = '';
  _CustomerView _view = _CustomerView.active;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();
    final customerService = context.watch<CustomerService>();

    final activeCustomers = customerService.customers
        .where((customer) => session.canAccessRegion(customer.region))
        .toList();

    final archivedCustomers = customerService.archivedCustomers
        .where((customer) => session.canAccessRegion(customer.region))
        .toList();

    final sourceCustomers = _view == _CustomerView.active
        ? activeCustomers
        : archivedCustomers;

    final customers = sourceCustomers.where((customer) {
      if (_query.isEmpty) {
        return true;
      }

      return customerService.customerMatchesSearch(customer, _query);
    }).toList();

    customers.sort(
      (a, b) =>
          a.businessName.toLowerCase().compareTo(b.businessName.toLowerCase()),
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Customers')),
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

          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
            child: Row(
              children: [
                Expanded(
                  child: _buildViewButton(
                    label: 'Active',
                    count: activeCustomers.length,
                    icon: Icons.business_outlined,
                    selected: _view == _CustomerView.active,
                    onTap: () {
                      setState(() {
                        _view = _CustomerView.active;
                      });
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildViewButton(
                    label: 'Archived',
                    count: archivedCustomers.length,
                    icon: Icons.archive_outlined,
                    selected: _view == _CustomerView.archived,
                    onTap: () {
                      setState(() {
                        _view = _CustomerView.archived;
                      });
                    },
                  ),
                ),
              ],
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

                      if (_view == _CustomerView.archived) {
                        return _buildArchivedCustomerTile(customer);
                      }

                      return _buildActiveCustomerTile(customer);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildViewButton({
    required String label,
    required int count,
    required IconData icon,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return Material(
      color: selected ? AppColors.copperLight : AppColors.card,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: selected ? AppColors.copper : AppColors.border,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: selected ? AppColors.copper : AppColors.muted,
              ),
              const SizedBox(width: 7),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: selected ? AppColors.copper : AppColors.text,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: selected ? AppColors.card : AppColors.background,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '$count',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: selected ? AppColors.copper : AppColors.muted,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActiveCustomerTile(Customer customer) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
      leading: _buildAvatar(customer),
      title: _buildCompanyName(customer),
      subtitle: _buildCompanyDetails(customer),
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.muted),
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => CustomerDetailScreen(customer: customer),
          ),
        );
      },
    );
  }

  Widget _buildArchivedCustomerTile(Customer customer) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildAvatar(customer),

          const SizedBox(width: 14),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildCompanyName(customer),

                const SizedBox(height: 7),

                _buildCompanyDetails(customer),

                if (customer.archivedAt != null) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.archive_outlined,
                        size: 14,
                        color: AppColors.muted,
                      ),
                      const SizedBox(width: 5),
                      Text(
                        'Archived ${DateFormat('d MMM yyyy').format(customer.archivedAt!)}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.muted,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(width: 10),

          OutlinedButton.icon(
            onPressed: () => _confirmRestore(customer),
            icon: const Icon(Icons.unarchive_outlined, size: 17),
            label: const Text('Restore'),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatar(Customer customer) {
    return CircleAvatar(
      backgroundColor: AppColors.copperLight,
      child: Text(
        _companyInitials(customer.businessName),
        style: const TextStyle(
          color: AppColors.copper,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildCompanyName(Customer customer) {
    return Text(
      customer.businessName,
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: AppColors.text,
      ),
    );
  }

  Widget _buildCompanyDetails(Customer customer) {
    return Column(
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
            icon: Icons.badge_outlined,
            text: 'ABN ${customer.abn}',
          ),

        if (customer.address.trim().isEmpty && customer.abn.trim().isEmpty)
          const Text(
            'No company details',
            style: TextStyle(fontSize: 13, color: AppColors.muted),
          ),
      ],
    );
  }

  Future<void> _confirmRestore(Customer customer) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Restore Customer?'),
          content: Text(
            '${customer.businessName} will be restored '
            'to Active Customers and can be used '
            'for new sales documents again.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton.icon(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              icon: const Icon(Icons.unarchive_outlined),
              label: const Text('Restore'),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) {
      return;
    }

    context.read<CustomerService>().restoreCustomer(customer.id);

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${customer.businessName} restored.')),
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
    final archived = _view == _CustomerView.archived;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              archived ? Icons.archive_outlined : Icons.business_outlined,
              size: 42,
              color: AppColors.muted,
            ),
            const SizedBox(height: 12),
            Text(
              _query.isNotEmpty
                  ? 'No matching companies'
                  : archived
                  ? 'No archived customers'
                  : 'No active customers',
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
