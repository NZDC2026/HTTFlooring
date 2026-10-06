import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../models/customer.dart';
import '../../../models/customer_contact.dart';
import '../../../models/customer_location.dart';
import '../../../models/customer_note.dart';
import '../../../models/sales_user.dart';
import '../../../services/customer_location_service.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/customer_service.dart';
import '../../../services/sales_document_service.dart';
import '../../../theme/app_theme.dart';
import '../pricing/customer_pricing_screen.dart';
import 'customer_invoices_screen.dart';
import 'customer_map_screen.dart';
import 'customer_notes_screen.dart';
import 'customer_orders_screen.dart';

class CustomerDetailScreen extends StatefulWidget {
  final Customer customer;

  const CustomerDetailScreen({super.key, required this.customer});

  @override
  State<CustomerDetailScreen> createState() => _CustomerDetailScreenState();
}

class _CustomerDetailScreenState extends State<CustomerDetailScreen> {
  Future<void> _callPhone(String phone) async {
    final cleanedPhone = phone.replaceAll(RegExp(r'[^\d+]'), '');
    await _launchUri(Uri(scheme: 'tel', path: cleanedPhone));
  }

  Future<void> _sendEmail(String email) async {
    await _launchUri(Uri(scheme: 'mailto', path: email.trim()));
  }

  Future<void> _launchUri(Uri uri) async {
    try {
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched && mounted) _showLaunchError();
    } catch (_) {
      if (mounted) _showLaunchError();
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
    final noteService = context.watch<CustomerNoteService>();
    final contacts = customerService.getContactsForCustomer(customer.id);
    final notes = noteService.getCustomerNotes(customer.id);
    final outstanding = documentService.getCustomerOutstanding(customer.id);
    final overdue = documentService.getCustomerOverdue(customer.id);

    final primaryContact = _primaryContact(contacts);
    final emailContact = _emailContact(contacts);
    final recentNote = notes.isEmpty ? null : notes.first;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Customer Detail')),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 32),
        children: [
          _buildHeader(customer),
          _buildPrimaryActions(
            customer: customer,
            primaryContact: primaryContact,
            emailContact: emailContact,
          ),
          _buildTabs(customer),
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 22, 18, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _sectionHeader(
                  'CONTACT PERSON',
                  actionLabel: 'Add',
                  onAction: () => _showAddContactDialog(customer.id),
                ),
                const SizedBox(height: 10),
                if (primaryContact == null)
                  _emptyCard('No contacts added yet.')
                else
                  _buildPrimaryContactCard(primaryContact),
                if (contacts.length > 1) ...[
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton(
                      onPressed: () => _showAllContacts(contacts),
                      child: Text('View all ${contacts.length} contacts'),
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                _sectionHeader(
                  'COMPANY',
                  actionLabel: 'Edit',
                  onAction: () => _showEditCompanyDialog(customer),
                ),
                const SizedBox(height: 10),
                _buildCompanyCard(customer),
                const SizedBox(height: 24),
                _sectionHeader('ACCOUNT'),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _accountCard(
                        'Outstanding',
                        '\$${outstanding.toStringAsFixed(0)}',
                        danger: outstanding > 0,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _accountCard(
                        'Overdue',
                        '\$${overdue.toStringAsFixed(0)}',
                        danger: overdue > 0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _sectionHeader(
                  'RECENT NOTE',
                  actionLabel: 'View All',
                  onAction: () => _openNotes(customer),
                ),
                const SizedBox(height: 10),
                _buildRecentNote(recentNote),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: () => _openNotes(customer),
                    icon: const Icon(Icons.add_comment_outlined),
                    label: const Text('Add Note'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(Customer customer) {
    return Container(
      width: double.infinity,
      color: AppColors.card,
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: AppColors.copper,
            child: Text(
              _companyInitials(customer.businessName),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  customer.businessName,
                  style: const TextStyle(
                    fontFamily: 'serif',
                    fontSize: 25,
                    fontWeight: FontWeight.w600,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  '${customer.type} · ${customer.region.label}',
                  style: const TextStyle(color: AppColors.muted, fontSize: 13),
                ),
                if (customer.archived) ...[
                  const SizedBox(height: 7),
                  const Text(
                    'ARCHIVED',
                    style: TextStyle(
                      color: AppColors.danger,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrimaryActions({
    required Customer customer,
    required CustomerContact? primaryContact,
    required CustomerContact? emailContact,
  }) {
    return Container(
      color: AppColors.card,
      padding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
      child: Row(
        children: [
          Expanded(
            child: _topAction(
              Icons.phone_outlined,
              'Call',
              primaryContact?.phone.trim().isNotEmpty == true
                  ? () => _callPhone(primaryContact!.phone)
                  : null,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _topAction(
              Icons.email_outlined,
              'Email',
              emailContact?.email.trim().isNotEmpty == true
                  ? () => _sendEmail(emailContact!.email)
                  : null,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _topAction(
              Icons.map_outlined,
              'Map',
              () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => CustomerMapScreen(customerId: customer.id),
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _topAction(
              Icons.more_horiz,
              'More',
              () => _showMoreActions(customer),
            ),
          ),
        ],
      ),
    );
  }

  Widget _topAction(IconData icon, String label, VoidCallback? onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Opacity(
        opacity: onTap == null ? 0.4 : 1,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.ivory,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Icon(icon, color: AppColors.green, size: 21),
              const SizedBox(height: 5),
              Text(
                label,
                style: const TextStyle(
                  color: AppColors.text,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabs(Customer customer) {
    return Container(
      color: AppColors.card,
      child: Row(
        children: [
          Expanded(child: _detailTab('Overview', selected: true, onTap: () {})),
          Expanded(
            child: _detailTab(
              'Pricing',
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => CustomerPricingScreen(customer: customer),
                ),
              ),
            ),
          ),
          Expanded(
            child: _detailTab('Notes', onTap: () => _openNotes(customer)),
          ),
          Expanded(
            child: _detailTab(
              'Locations',
              onTap: () => _showCustomerLocations(customer),
            ),
          ),
        ],
      ),
    );
  }

  Widget _detailTab(
    String label, {
    bool selected = false,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: selected ? AppColors.copper : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            color: selected ? AppColors.copper : AppColors.muted,
            fontSize: 12,
            fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _sectionHeader(
    String title, {
    String? actionLabel,
    VoidCallback? onAction,
  }) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1,
            ),
          ),
        ),
        if (actionLabel != null)
          TextButton(onPressed: onAction, child: Text(actionLabel)),
      ],
    );
  }

  Widget _buildPrimaryContactCard(CustomerContact contact) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: _cardDecoration(),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 23,
                backgroundColor: AppColors.copperLight,
                child: Text(
                  _contactInitials(contact.name),
                  style: const TextStyle(
                    color: AppColors.copper,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      contact.name.trim().isEmpty
                          ? 'Unnamed Contact'
                          : contact.name,
                      style: const TextStyle(
                        color: AppColors.text,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (contact.jobTitle.trim().isNotEmpty) ...[
                      const SizedBox(height: 3),
                      Text(
                        contact.jobTitle,
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 12,
                        ),
                      ),
                    ],
                    const SizedBox(height: 7),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        if (contact.isPrimary)
                          _buildContactBadge('Primary', Icons.star_outline),
                        if (contact.isAccountsContact)
                          _buildContactBadge(
                            'Accounts',
                            Icons.receipt_long_outlined,
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                onSelected: (value) {
                  if (value == 'edit') _showEditContactDialog(contact);
                  if (value == 'delete') _confirmDeleteContact(contact);
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 'edit', child: Text('Edit Contact')),
                  PopupMenuItem(value: 'delete', child: Text('Delete Contact')),
                ],
              ),
            ],
          ),
          if (contact.phone.trim().isNotEmpty) ...[
            const SizedBox(height: 12),
            const Divider(height: 1, color: AppColors.border),
            _contactLine(
              Icons.phone_outlined,
              contact.phone,
              () => _callPhone(contact.phone),
            ),
          ],
          if (contact.email.trim().isNotEmpty) ...[
            if (contact.phone.trim().isEmpty) ...[
              const SizedBox(height: 12),
              const Divider(height: 1, color: AppColors.border),
            ],
            _contactLine(
              Icons.email_outlined,
              contact.email,
              () => _sendEmail(contact.email),
            ),
          ],
        ],
      ),
    );
  }

  Widget _contactLine(IconData icon, String value, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Icon(icon, size: 18, color: AppColors.copper),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                value,
                style: const TextStyle(color: AppColors.text, fontSize: 13),
              ),
            ),
            const Icon(Icons.chevron_right, size: 18, color: AppColors.muted),
          ],
        ),
      ),
    );
  }

  Widget _buildCompanyCard(Customer customer) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: _cardDecoration(),
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
          if (customer.address.trim().isNotEmpty) ...[
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.location_on_outlined,
                  size: 18,
                  color: AppColors.muted,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    customer.address,
                    style: const TextStyle(
                      color: AppColors.text,
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ],
          if (customer.abn.trim().isNotEmpty) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(
                  Icons.badge_outlined,
                  size: 18,
                  color: AppColors.muted,
                ),
                const SizedBox(width: 8),
                Text(
                  'ABN ${customer.abn}',
                  style: const TextStyle(color: AppColors.text, fontSize: 12),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _accountCard(String label, String value, {required bool danger}) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: danger ? AppColors.dangerLight : AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: danger ? AppColors.danger : AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.muted, fontSize: 11),
          ),
          const SizedBox(height: 7),
          Text(
            value,
            style: TextStyle(
              color: danger ? AppColors.danger : AppColors.text,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentNote(CustomerNote? note) {
    if (note == null) return _emptyCard('No notes added yet.');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                note.isFollowUp
                    ? Icons.event_note_outlined
                    : Icons.notes_outlined,
                size: 18,
                color: AppColors.copper,
              ),
              const SizedBox(width: 8),
              Text(
                note.isFollowUp ? 'Follow-up' : 'Note',
                style: const TextStyle(
                  color: AppColors.copper,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              Text(
                _relativeDate(note.createdAt),
                style: const TextStyle(color: AppColors.muted, fontSize: 10),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            note.content,
            style: const TextStyle(
              color: AppColors.text,
              fontSize: 13,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyCard(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Text(message, style: const TextStyle(color: AppColors.muted)),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: AppColors.card,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.border),
    );
  }

  CustomerContact? _primaryContact(List<CustomerContact> contacts) {
    if (contacts.isEmpty) return null;
    for (final contact in contacts) {
      if (contact.isPrimary) return contact;
    }
    return contacts.first;
  }

  CustomerContact? _emailContact(List<CustomerContact> contacts) {
    for (final contact in contacts) {
      if (contact.isAccountsContact && contact.email.trim().isNotEmpty) {
        return contact;
      }
    }
    for (final contact in contacts) {
      if (contact.isPrimary && contact.email.trim().isNotEmpty) return contact;
    }
    for (final contact in contacts) {
      if (contact.email.trim().isNotEmpty) return contact;
    }
    return null;
  }

  String _companyInitials(String name) {
    final parts = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return '${parts.first[0]}${parts[1][0]}'.toUpperCase();
  }

  String _contactInitials(String name) {
    final parts = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
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
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: AppColors.copper,
            ),
          ),
        ],
      ),
    );
  }

  void _openNotes(Customer customer) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CustomerNotesScreen(customer: customer),
      ),
    );
  }

  void _showAllContacts(List<CustomerContact> contacts) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.background,
      builder: (sheetContext) => SafeArea(
        child: FractionallySizedBox(
          heightFactor: 0.75,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(18, 16, 10, 10),
                child: Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Contacts',
                        style: TextStyle(
                          color: AppColors.text,
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(sheetContext),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.border),
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(18),
                  itemCount: contacts.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (_, index) =>
                      _buildPrimaryContactCard(contacts[index]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showMoreActions(Customer customer) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.background,
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(10, 10, 10, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.shopping_bag_outlined),
                title: const Text('Orders'),
                onTap: () {
                  Navigator.pop(sheetContext);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => CustomerOrdersScreen(customer: customer),
                    ),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.receipt_long_outlined),
                title: const Text('Invoices'),
                onTap: () {
                  Navigator.pop(sheetContext);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) =>
                          CustomerInvoicesScreen(customer: customer),
                    ),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.edit_outlined),
                title: const Text('Edit Company'),
                onTap: () {
                  Navigator.pop(sheetContext);
                  _showEditCompanyDialog(customer);
                },
              ),
              ListTile(
                leading: Icon(
                  customer.archived
                      ? Icons.unarchive_outlined
                      : Icons.archive_outlined,
                ),
                title: Text(
                  customer.archived ? 'Restore Customer' : 'Archive Customer',
                ),
                onTap: () {
                  Navigator.pop(sheetContext);
                  if (customer.archived) {
                    _restoreCustomer(customer);
                  } else {
                    _confirmArchiveCustomer(customer);
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _relativeDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    if (difference.inMinutes < 1) return 'Just now';
    if (difference.inHours < 1) return '${difference.inMinutes}m ago';
    if (difference.inDays < 1) return '${difference.inHours}h ago';
    if (difference.inDays < 7) return '${difference.inDays}d ago';
    return DateFormat('dd MMM yyyy').format(date);
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

  void _showCustomerLocations(Customer customer) {
    final locations = context.read<CustomerLocationService>().getForCustomer(
      customer.id,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) =>
            _CustomerLocationsScreen(customer: customer, locations: locations),
      ),
    );
  }
}

class _CustomerLocationsScreen extends StatelessWidget {
  const _CustomerLocationsScreen({
    required this.customer,
    required this.locations,
  });

  final Customer customer;
  final List<CustomerLocation> locations;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Locations'),
        actions: [
          IconButton(
            tooltip: 'Map',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => CustomerMapScreen(customerId: customer.id),
                ),
              );
            },
            icon: const Icon(Icons.map_outlined),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text(
            customer.businessName,
            style: const TextStyle(
              color: AppColors.text,
              fontFamily: 'serif',
              fontSize: 25,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: 5),

          Text(
            '${locations.length} location${locations.length == 1 ? '' : 's'}',
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),

          const SizedBox(height: 20),

          if (locations.isEmpty)
            _emptyLocations()
          else
            ...locations.map((location) => _locationCard(context, location)),
        ],
      ),
    );
  }

  Widget _locationCard(BuildContext context, CustomerLocation location) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: AppColors.copperLight,
                  borderRadius: BorderRadius.circular(11),
                ),
                child: Icon(
                  _locationIcon(location.type),
                  color: AppColors.copper,
                ),
              ),

              const SizedBox(width: 12),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            location.name,
                            style: const TextStyle(
                              color: AppColors.text,
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),

                        if (location.isPrimary) ...[
                          const SizedBox(width: 7),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 7,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.successLight,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              'Primary',
                              style: TextStyle(
                                color: AppColors.success,
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),

                    const SizedBox(height: 4),

                    Text(
                      location.typeLabel,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),

              Text(
                '${location.distanceKm.toStringAsFixed(1)} km',
                style: const TextStyle(
                  color: AppColors.green,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 17,
                color: AppColors.muted,
              ),
              const SizedBox(width: 7),
              Expanded(
                child: Text(
                  location.address,
                  style: const TextStyle(
                    color: AppColors.text,
                    fontSize: 12,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 15),

          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CustomerMapScreen(customerId: customer.id),
                  ),
                );
              },
              icon: const Icon(Icons.map_outlined, size: 18),
              label: const Text('View on Map'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyLocations() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 42),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: const Column(
        children: [
          Icon(Icons.location_off_outlined, size: 42, color: AppColors.muted),
          SizedBox(height: 12),
          Text(
            'No locations added',
            style: TextStyle(
              color: AppColors.text,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 5),
          Text(
            'Customer locations will appear here.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ],
      ),
    );
  }

  IconData _locationIcon(CustomerLocationType type) {
    switch (type) {
      case CustomerLocationType.store:
        return Icons.store_outlined;

      case CustomerLocationType.showroom:
        return Icons.storefront_outlined;

      case CustomerLocationType.warehouse:
        return Icons.warehouse_outlined;

      case CustomerLocationType.site:
        return Icons.location_city_outlined;
    }
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
