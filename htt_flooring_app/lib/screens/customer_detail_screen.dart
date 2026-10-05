import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/customer.dart';
import '../models/customer_contact.dart';
import '../services/customer_service.dart';
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

    final customerService = context.watch<CustomerService>();

    final contacts = customerService.getContactsForCustomer(customer.id);

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
                      if (customer.address.trim().isNotEmpty ||
                          customer.abn.trim().isNotEmpty) ...[
                        const Text(
                          'Company Details',
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
                              if (customer.address.trim().isNotEmpty)
                                _buildContactAction(
                                  icon: Icons.location_on_outlined,
                                  label: 'Address',
                                  value: customer.address,
                                  onTap: () => _openAddress(customer.address),
                                ),

                              if (customer.address.trim().isNotEmpty &&
                                  customer.abn.trim().isNotEmpty)
                                const Divider(
                                  height: 1,
                                  color: AppColors.border,
                                ),

                              if (customer.abn.trim().isNotEmpty)
                                _buildCompanyInfo(
                                  icon: Icons.business_outlined,
                                  label: 'ABN',
                                  value: customer.abn,
                                ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 25),
                      ],

                      Row(
                        children: [
                          const Expanded(
                            child: Text(
                              'Contacts',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: AppColors.text,
                              ),
                            ),
                          ),
                          TextButton.icon(
                            onPressed: () => _showAddContactDialog(customer.id),
                            icon: const Icon(Icons.add, size: 18),
                            label: const Text('Add Contact'),
                          ),
                        ],
                      ),

                      const SizedBox(height: 8),

                      if (contacts.isEmpty)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.card,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Text(
                            'No contacts added yet.',
                            style: TextStyle(color: AppColors.muted),
                          ),
                        )
                      else
                        ...contacts.map(
                          (contact) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: _buildContactCard(contact),
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

  Widget _buildContactCard(CustomerContact contact) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.copperLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _contactInitials(contact.name),
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.copper,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      contact.name.isEmpty ? 'Unnamed Contact' : contact.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.text,
                      ),
                    ),
                    if (contact.jobTitle.trim().isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        contact.jobTitle,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.muted,
                        ),
                      ),
                    ],
                    if (contact.isPrimary || contact.isAccountsContact) ...[
                      const SizedBox(height: 7),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          if (contact.isPrimary)
                            _buildContactBadge(
                              'Primary',
                              Icons.star_outline_rounded,
                            ),
                          if (contact.isAccountsContact)
                            _buildContactBadge(
                              'Accounts',
                              Icons.receipt_long_outlined,
                            ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),

          if (contact.phone.trim().isNotEmpty ||
              contact.email.trim().isNotEmpty) ...[
            const SizedBox(height: 12),
            const Divider(height: 1, color: AppColors.border),
            const SizedBox(height: 4),

            if (contact.phone.trim().isNotEmpty)
              _buildContactAction(
                icon: Icons.phone_outlined,
                label: 'Phone',
                value: contact.phone,
                onTap: () => _callPhone(contact.phone),
              ),

            if (contact.phone.trim().isNotEmpty &&
                contact.email.trim().isNotEmpty)
              const Divider(height: 1, color: AppColors.border),

            if (contact.email.trim().isNotEmpty)
              _buildContactAction(
                icon: Icons.email_outlined,
                label: 'Email',
                value: contact.email,
                onTap: () => _sendEmail(contact.email),
              ),
          ],
        ],
      ),
    );
  }

  Widget _buildContactBadge(String label, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.copperLight,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppColors.copper),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.copper,
            ),
          ),
        ],
      ),
    );
  }

  String _contactInitials(String name) {
    final parts = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .toList();

    if (parts.isEmpty) {
      return '?';
    }

    if (parts.length == 1) {
      return parts.first.substring(0, 1).toUpperCase();
    }

    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  Widget _buildCompanyInfo({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.copperLight,
              borderRadius: BorderRadius.circular(9),
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
                  style: const TextStyle(fontSize: 12, color: AppColors.muted),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.text,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showAddContactDialog(String customerId) async {
    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return _AddContactDialog(customerId: customerId);
      },
    );
  }
}

class _AddContactDialog extends StatefulWidget {
  const _AddContactDialog({required this.customerId});

  final String customerId;

  @override
  State<_AddContactDialog> createState() => _AddContactDialogState();
}

class _AddContactDialogState extends State<_AddContactDialog> {
  late final TextEditingController _nameController;
  late final TextEditingController _jobTitleController;
  late final TextEditingController _phoneController;
  late final TextEditingController _emailController;

  bool _isPrimary = false;
  bool _isAccountsContact = false;

  @override
  void initState() {
    super.initState();

    _nameController = TextEditingController();
    _jobTitleController = TextEditingController();
    _phoneController = TextEditingController();
    _emailController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _jobTitleController.dispose();
    _phoneController.dispose();
    _emailController.dispose();

    super.dispose();
  }

  void _save() {
    final name = _nameController.text.trim();
    final jobTitle = _jobTitleController.text.trim();
    final phone = _phoneController.text.trim();
    final email = _emailController.text.trim();

    if (name.isEmpty && phone.isEmpty && email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a name, phone or email.')),
      );

      return;
    }

    final customerService = context.read<CustomerService>();

    final duplicate = customerService.findContactDuplicate(
      customerId: widget.customerId,
      phone: phone,
      email: email,
    );

    if (duplicate != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            duplicate.name.trim().isEmpty
                ? 'This contact already exists.'
                : '${duplicate.name} already exists.',
          ),
        ),
      );

      return;
    }

    customerService.addContact(
      customerId: widget.customerId,
      name: name,
      jobTitle: jobTitle,
      phone: phone,
      email: email,
      isPrimary: _isPrimary,
      isAccountsContact: _isAccountsContact,
    );

    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Contact'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _nameController,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(labelText: 'Name'),
            ),

            const SizedBox(height: 12),

            TextField(
              controller: _jobTitleController,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(labelText: 'Job Title'),
            ),

            const SizedBox(height: 12),

            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone'),
            ),

            const SizedBox(height: 12),

            TextField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              autocorrect: false,
              textCapitalization: TextCapitalization.none,
              decoration: const InputDecoration(labelText: 'Email'),
            ),

            const SizedBox(height: 8),

            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Primary Contact'),
              value: _isPrimary,
              onChanged: (value) {
                setState(() {
                  _isPrimary = value;
                });
              },
            ),

            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Accounts Contact'),
              subtitle: const Text('Use for invoices and statements'),
              value: _isAccountsContact,
              onChanged: (value) {
                setState(() {
                  _isAccountsContact = value;
                });
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
          child: const Text('Cancel'),
        ),
        FilledButton(onPressed: _save, child: const Text('Add')),
      ],
    );
  }
}
