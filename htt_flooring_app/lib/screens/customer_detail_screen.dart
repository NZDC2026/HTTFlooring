import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

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

  Future<void> _callPhone(String phone) async {
    final cleanedPhone = phone.replaceAll(RegExp(r'[^\d+]'), '');

    final uri = Uri(scheme: 'tel', path: cleanedPhone);

    await _launchUri(uri);
  }

  Future<void> _sendEmail(String email) async {
    final uri = Uri(scheme: 'mailto', path: email.trim());

    await _launchUri(uri);
  }

  Future<void> _openWebsite(String website) async {
    var url = website.trim();

    if (url.isEmpty) {
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://$url';
    }

    await _launchUri(Uri.parse(url));
  }

  Future<void> _openAddress(String address) async {
    if (address.trim().isEmpty) {
      return;
    }

    final uri = Uri.https('www.google.com', '/maps/search/', {
      'api': '1',
      'query': address.trim(),
    });

    await _launchUri(uri);
  }

  Future<void> _launchUri(Uri uri) async {
    try {
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );

      if (!launched && mounted) {
        _showLaunchError();
      }
    } catch (_) {
      if (mounted) {
        _showLaunchError();
      }
    }
  }

  void _showLaunchError() {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Unable to open this link.')));
  }

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
                      const Text(
                        'Contact Details',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.text,
                        ),
                      ),

                      const SizedBox(height: 10),

                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.card,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          children: [
                            if (customer.phone.trim().isNotEmpty)
                              _buildContactAction(
                                icon: Icons.phone_outlined,
                                label: 'Phone',
                                value: customer.phone,
                                onTap: () => _callPhone(customer.phone),
                              ),

                            if (customer.phone.trim().isNotEmpty &&
                                customer.email.trim().isNotEmpty)
                              const Divider(height: 1, color: AppColors.border),

                            if (customer.email.trim().isNotEmpty)
                              _buildContactAction(
                                icon: Icons.email_outlined,
                                label: 'Email',
                                value: customer.email,
                                onTap: () => _sendEmail(customer.email),
                              ),

                            if (customer.email.trim().isNotEmpty &&
                                customer.website.trim().isNotEmpty)
                              const Divider(height: 1, color: AppColors.border),

                            if (customer.website.trim().isNotEmpty)
                              _buildContactAction(
                                icon: Icons.language_outlined,
                                label: 'Website',
                                value: customer.website,
                                onTap: () => _openWebsite(customer.website),
                              ),

                            if (customer.website.trim().isNotEmpty &&
                                customer.address.trim().isNotEmpty)
                              const Divider(height: 1, color: AppColors.border),

                            if (customer.address.trim().isNotEmpty)
                              _buildContactAction(
                                icon: Icons.location_on_outlined,
                                label: 'Address',
                                value: customer.address,
                                onTap: () => _openAddress(customer.address),
                              ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 25),

                      const Text(
                        'Contact Person',
                        style: TextStyle(color: AppColors.muted),
                      ),

                      const SizedBox(height: 4),

                      Text(
                        customer.contactName.isEmpty
                            ? 'Not provided'
                            : customer.contactName,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppColors.text,
                        ),
                      ),

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
                              customer.lastOrderDate == null
                                  ? 'No orders yet'
                                  : DateFormat('dd MMM yyyy')
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

  Widget _buildContactAction({
    required IconData icon,
    required String label,
    required String value,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.copperLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 19, color: AppColors.copper),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.muted,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      value,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.text,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: AppColors.muted),
            ],
          ),
        ),
      ),
    );
  }
}
