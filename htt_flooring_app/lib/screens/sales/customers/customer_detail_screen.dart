import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../models/customer.dart';
import '../../../models/customer_contact.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_document_service.dart';
import '../../../theme/app_theme.dart';
import '../pricing/customer_pricing_screen.dart';
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
    final customerService = context.watch<CustomerService>();

    final customer =
        customerService.findById(widget.customer.id) ?? widget.customer;

    final documentService = context.watch<SalesDocumentService>();

    final outstanding = documentService.getCustomerOutstanding(customer.id);

    final overdue = documentService.getCustomerOverdue(customer.id);

    final oldestOverdueDays = documentService.getCustomerOldestOverdueDays(
      customer.id,
    );

    final contacts = customerService.getContactsForCustomer(customer.id);

    return Scaffold(
      appBar: AppBar(
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'archive') {
                _confirmArchiveCustomer(customer);
              }

              if (value == 'restore') {
                _restoreCustomer(customer);
              }
            },
            itemBuilder: (_) => [
              if (!customer.archived)
                const PopupMenuItem(
                  value: 'archive',
                  child: Row(
                    children: [
                      Icon(Icons.archive_outlined),
                      SizedBox(width: 10),
                      Text('Archive Customer'),
                    ],
                  ),
                ),
              if (customer.archived)
                const PopupMenuItem(
                  value: 'restore',
                  child: Row(
                    children: [
                      Icon(Icons.unarchive_outlined),
                      SizedBox(width: 10),
                      Text('Restore Customer'),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),

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

                if (customer.archived) ...[
                  const SizedBox(height: 6),
                  const Chip(
                    avatar: Icon(Icons.archive_outlined, size: 15),
                    label: Text('Archived'),
                  ),
                ],

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
                      ...[
                        Row(
                          children: [
                            const Expanded(
                              child: Text(
                                'Company Details',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.text,
                                ),
                              ),
                            ),
                            TextButton.icon(
                              onPressed: () => _showEditCompanyDialog(customer),
                              icon: const Icon(Icons.edit_outlined, size: 17),
                              label: const Text('Edit'),
                            ),
                          ],
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
                              _buildCompanyInfo(
                                icon: Icons.business_outlined,
                                label: 'Company Name',
                                value: customer.businessName,
                              ),

                              if (customer.address.trim().isNotEmpty)
                                const Divider(
                                  height: 1,
                                  color: AppColors.border,
                                ),

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
                                  icon: Icons.badge_outlined,
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
              PopupMenuButton<String>(
                tooltip: 'Contact actions',
                onSelected: (value) {
                  if (value == 'edit') {
                    _showEditContactDialog(contact);
                  }

                  if (value == 'delete') {
                    _confirmDeleteContact(contact);
                  }
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: [
                        Icon(Icons.edit_outlined),
                        SizedBox(width: 10),
                        Text('Edit Contact'),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'delete',
                    child: Row(
                      children: [
                        Icon(Icons.delete_outline),
                        SizedBox(width: 10),
                        Text('Delete Contact'),
                      ],
                    ),
                  ),
                ],
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

  Future<void> _confirmArchiveCustomer(Customer customer) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Archive Customer?'),
          content: Text(
            '${customer.businessName} will be hidden '
            'from active customers and cannot be '
            'selected for new sales documents.\n\n'
            'Existing orders and invoices will '
            'remain unchanged.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: const Text('Archive'),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) {
      return;
    }

    context.read<CustomerService>().archiveCustomer(customer.id);

    if (!mounted) {
      return;
    }

    Navigator.of(context).pop();
  }

  void _restoreCustomer(Customer customer) {
    context.read<CustomerService>().restoreCustomer(customer.id);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${customer.businessName} restored.')),
    );
  }

  Future<void> _showEditCompanyDialog(Customer customer) async {
    await showDialog<void>(
      context: context,
      builder: (_) {
        return _EditCompanyDialog(customer: customer);
      },
    );
  }

  Future<void> _confirmDeleteContact(CustomerContact contact) async {
    final displayName = contact.name.trim().isEmpty
        ? 'this contact'
        : contact.name.trim();

    final isPrimary = contact.isPrimary;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Delete Contact?'),
          content: Text(
            isPrimary
                ? '$displayName is the Primary Contact.\n\n'
                      'If deleted, another contact will '
                      'automatically become Primary.'
                : 'Delete $displayName from this company?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: const Text('Delete'),
            ),
          ],
        );
      },
    );

    if (confirmed != true || !mounted) {
      return;
    }

    context.read<CustomerService>().deleteContact(contact.id);

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text('$displayName deleted.')));
  }

  Future<void> _showEditContactDialog(CustomerContact contact) async {
    await showDialog<void>(
      context: context,
      builder: (_) {
        return _EditContactDialog(contact: contact);
      },
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

class _EditCompanyDialog extends StatefulWidget {
  const _EditCompanyDialog({required this.customer});

  final Customer customer;

  @override
  State<_EditCompanyDialog> createState() => _EditCompanyDialogState();
}

class _EditCompanyDialogState extends State<_EditCompanyDialog> {
  late final TextEditingController _businessNameController;
  late final TextEditingController _abnController;
  late final TextEditingController _addressController;

  @override
  void initState() {
    super.initState();

    _businessNameController = TextEditingController(
      text: widget.customer.businessName,
    );

    _abnController = TextEditingController(text: widget.customer.abn);

    _addressController = TextEditingController(text: widget.customer.address);
  }

  @override
  void dispose() {
    _businessNameController.dispose();
    _abnController.dispose();
    _addressController.dispose();

    super.dispose();
  }

  void _save() {
    final businessName = _businessNameController.text.trim();

    if (businessName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Company name is required.')),
      );

      return;
    }

    context.read<CustomerService>().updateCustomer(
      customerId: widget.customer.id,
      businessName: businessName,
      abn: _abnController.text.trim(),
      address: _addressController.text.trim(),
    );

    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Edit Company'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _businessNameController,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(labelText: 'Company Name'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _abnController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'ABN'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _addressController,
              textCapitalization: TextCapitalization.words,
              maxLines: 2,
              decoration: const InputDecoration(labelText: 'Address'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton(onPressed: _save, child: const Text('Save')),
      ],
    );
  }
}

class _EditContactDialog extends StatefulWidget {
  const _EditContactDialog({required this.contact});

  final CustomerContact contact;

  @override
  State<_EditContactDialog> createState() => _EditContactDialogState();
}

class _EditContactDialogState extends State<_EditContactDialog> {
  late final TextEditingController _nameController;
  late final TextEditingController _jobTitleController;
  late final TextEditingController _phoneController;
  late final TextEditingController _emailController;

  late bool _isPrimary;
  late bool _isAccountsContact;

  @override
  void initState() {
    super.initState();

    _nameController = TextEditingController(text: widget.contact.name);

    _jobTitleController = TextEditingController(text: widget.contact.jobTitle);

    _phoneController = TextEditingController(text: widget.contact.phone);

    _emailController = TextEditingController(text: widget.contact.email);

    _isPrimary = widget.contact.isPrimary;
    _isAccountsContact = widget.contact.isAccountsContact;
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
      customerId: widget.contact.customerId,
      phone: phone,
      email: email,
    );

    if (duplicate != null && duplicate.id != widget.contact.id) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            duplicate.name.trim().isEmpty
                ? 'This phone or email is already used by another contact.'
                : '${duplicate.name} already uses this phone or email.',
          ),
        ),
      );

      return;
    }

    customerService.updateContact(
      contactId: widget.contact.id,
      name: name,
      jobTitle: _jobTitleController.text.trim(),
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
      title: const Text('Edit Contact'),
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
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        FilledButton(onPressed: _save, child: const Text('Save')),
      ],
    );
  }
}
