import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/business_card_scan_result.dart';
import '../models/customer.dart';
import '../models/customer_contact.dart';
import '../services/customer_service.dart';
import '../services/sales_session.dart';
import '../theme/app_theme.dart';
import 'customer_detail_screen.dart';

class BusinessCardReviewScreen extends StatefulWidget {
  final BusinessCardScanResult result;

  const BusinessCardReviewScreen({super.key, required this.result});

  @override
  State<BusinessCardReviewScreen> createState() =>
      _BusinessCardReviewScreenState();
}

class _BusinessCardReviewScreenState extends State<BusinessCardReviewScreen> {
  late final TextEditingController _businessController;
  late final TextEditingController _contactController;
  late final TextEditingController _jobTitleController;
  late final TextEditingController _phoneController;
  late final TextEditingController _emailController;
  late final TextEditingController _addressController;
  late final TextEditingController _abnController;

  Customer? _matchedCustomer;
  CustomerContact? _matchedContact;

  bool _matchedByAbn = false;
  bool _matchChecked = false;

  @override
  void initState() {
    super.initState();

    _businessController = TextEditingController(
      text: widget.result.businessName,
    );

    _contactController = TextEditingController(text: widget.result.contactName);

    _jobTitleController = TextEditingController(text: widget.result.jobTitle);

    _phoneController = TextEditingController(text: widget.result.phone);

    _emailController = TextEditingController(text: widget.result.email);

    _addressController = TextEditingController(text: widget.result.address);

    _abnController = TextEditingController(text: widget.result.abn);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _checkMatch();
      }
    });
  }

  @override
  void dispose() {
    _businessController.dispose();
    _contactController.dispose();
    _jobTitleController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    _abnController.dispose();

    super.dispose();
  }

  void _onFieldChanged(String _) {
    _checkMatch();
  }

  void _checkMatch() {
    if (!mounted) {
      return;
    }

    final businessName = _businessController.text.trim();
    final abn = _abnController.text.trim();
    final phone = _phoneController.text.trim();
    final email = _emailController.text.trim();

    final session = context.read<SalesSession>();
    final customerService = context.read<CustomerService>();

    Customer? matchedCustomer;
    CustomerContact? matchedContact;
    var matchedByAbn = false;

    if (businessName.isNotEmpty || abn.isNotEmpty) {
      matchedCustomer = customerService.findMatchingCustomer(
        businessName: businessName,
        abn: abn,
        region: session.currentUser.region,
      );

      if (matchedCustomer != null) {
        final scannedAbn = _normalizeAbn(abn);
        final existingAbn = _normalizeAbn(matchedCustomer.abn);

        matchedByAbn =
            scannedAbn.isNotEmpty &&
            existingAbn.isNotEmpty &&
            scannedAbn == existingAbn;

        matchedContact = customerService.findContactDuplicate(
          customerId: matchedCustomer.id,
          phone: phone,
          email: email,
        );
      }
    }

    setState(() {
      _matchedCustomer = matchedCustomer;
      _matchedContact = matchedContact;
      _matchedByAbn = matchedByAbn;
      _matchChecked = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SalesSession>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Review Contact')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            const Text(
              'Review scanned details',
              style: TextStyle(
                fontFamily: 'serif',
                fontSize: 26,
                fontWeight: FontWeight.w700,
              ),
            ),

            const SizedBox(height: 5),

            const Text(
              'Check the company and employee details before saving.',
              style: TextStyle(color: AppColors.muted, height: 1.4),
            ),

            const SizedBox(height: 24),

            const Text(
              'COMPANY',
              style: TextStyle(
                color: AppColors.muted,
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.8,
              ),
            ),

            const SizedBox(height: 10),

            _Field(
              label: 'Business Name',
              controller: _businessController,
              icon: Icons.business_outlined,
              onChanged: _onFieldChanged,
            ),

            _Field(
              label: 'ABN',
              controller: _abnController,
              icon: Icons.badge_outlined,
              keyboardType: TextInputType.number,
              onChanged: _onFieldChanged,
            ),

            _Field(
              label: 'Address',
              controller: _addressController,
              icon: Icons.location_on_outlined,
              maxLines: 2,
              onChanged: _onFieldChanged,
            ),

            const SizedBox(height: 8),

            const Text(
              'EMPLOYEE',
              style: TextStyle(
                color: AppColors.muted,
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.8,
              ),
            ),

            const SizedBox(height: 10),

            _Field(
              label: 'Contact Name',
              controller: _contactController,
              icon: Icons.person_outline,
              onChanged: _onFieldChanged,
            ),

            _Field(
              label: 'Job Title',
              controller: _jobTitleController,
              icon: Icons.work_outline,
              onChanged: _onFieldChanged,
            ),

            _Field(
              label: 'Phone',
              controller: _phoneController,
              icon: Icons.phone_outlined,
              keyboardType: TextInputType.phone,
              onChanged: _onFieldChanged,
            ),

            _Field(
              label: 'Email',
              controller: _emailController,
              icon: Icons.email_outlined,
              keyboardType: TextInputType.emailAddress,
              onChanged: _onFieldChanged,
            ),

            const SizedBox(height: 4),

            _buildRegionCard(session),

            const SizedBox(height: 16),

            if (_matchChecked) _buildMatchResult(),

            const SizedBox(height: 18),

            SizedBox(height: 52, child: _buildPrimaryAction()),

            const SizedBox(height: 12),

            ExpansionTile(
              tilePadding: EdgeInsets.zero,
              title: const Text(
                'View OCR Text',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              ),
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: SelectableText(
                    widget.result.rawText.trim().isEmpty
                        ? 'No text recognised.'
                        : widget.result.rawText,
                    style: const TextStyle(fontSize: 12, height: 1.5),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRegionCard(SalesSession session) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'REGION',
          style: TextStyle(
            color: AppColors.muted,
            fontSize: 10,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              const Icon(Icons.location_on_outlined, color: AppColors.copper),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      session.regionName,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Company matching is limited to your sales region.',
                      style: TextStyle(color: AppColors.muted, fontSize: 11),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.lock_outline, size: 17, color: AppColors.muted),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMatchResult() {
    final customer = _matchedCustomer;
    final contact = _matchedContact;

    if (_businessController.text.trim().isEmpty) {
      return _buildStatusCard(
        icon: Icons.info_outline,
        title: 'Business name required',
        message: 'Enter the company name before saving this contact.',
        backgroundColor: AppColors.warningLight,
        iconColor: AppColors.warning,
      );
    }

    if (customer == null) {
      return _buildStatusCard(
        icon: Icons.add_business_outlined,
        title: 'New Company',
        message: 'No matching company was found in this region. A new company will be created.',
        backgroundColor: AppColors.copperLight,
        iconColor: AppColors.copper,
      );
    }

    if (contact != null) {
      return _buildExistingContactCard(customer, contact);
    }

    return _buildMatchedCompanyCard(customer);
  }

  Widget _buildMatchedCompanyCard(Customer customer) {
    final scannedBusinessName = _businessController.text.trim();

    final contactName = _contactController.text.trim();

    final jobTitle = _jobTitleController.text.trim();

    final companyNameDifferent =
        scannedBusinessName.isNotEmpty &&
        scannedBusinessName.toLowerCase() !=
            customer.businessName.toLowerCase();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.successLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.success),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.business_outlined, color: AppColors.success),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _matchedByAbn
                      ? 'Company Matched by ABN'
                      : 'Existing Company Found',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.text,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          if (_matchedByAbn && companyNameDifferent) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: AppColors.warningLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Company name differs',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppColors.text,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Scanned: $scannedBusinessName',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.muted,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'Existing: ${customer.businessName}',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.text,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],

          Text(
            customer.businessName,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.text,
            ),
          ),

          if (customer.address.trim().isNotEmpty) ...[
            const SizedBox(height: 5),
            Text(
              customer.address,
              style: const TextStyle(color: AppColors.muted),
            ),
          ],

          if (customer.abn.trim().isNotEmpty) ...[
            const SizedBox(height: 3),
            Text(
              'ABN ${customer.abn}',
              style: const TextStyle(color: AppColors.muted),
            ),
          ],

          const SizedBox(height: 12),

          if (contactName.isNotEmpty) ...[
            Text(
              contactName,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.text,
              ),
            ),

            if (jobTitle.isNotEmpty) ...[
              const SizedBox(height: 2),
              Text(
                jobTitle,
                style: const TextStyle(fontSize: 13, color: AppColors.muted),
              ),
            ],

            const SizedBox(height: 8),
          ],

          Text(
            contactName.isEmpty
                ? 'This employee can be added to the existing company.'
                : '$contactName can be added as a contact for ${customer.businessName}.',
            style: const TextStyle(
              fontSize: 13,
              height: 1.4,
              color: AppColors.text,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExistingContactCard(Customer customer, CustomerContact contact) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.warningLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.warning),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.person_search_outlined, color: AppColors.warning),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Existing Contact',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.text,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Text(
            customer.businessName,
            style: const TextStyle(fontSize: 13, color: AppColors.muted),
          ),

          const SizedBox(height: 5),

          Text(
            contact.name.isEmpty ? 'Existing Contact' : contact.name,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.text,
            ),
          ),

          if (contact.jobTitle.trim().isNotEmpty) ...[
            const SizedBox(height: 3),
            Text(
              contact.jobTitle,
              style: const TextStyle(color: AppColors.muted),
            ),
          ],

          if (contact.phone.trim().isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(
                  Icons.phone_outlined,
                  size: 16,
                  color: AppColors.muted,
                ),
                const SizedBox(width: 7),
                Expanded(
                  child: Text(
                    contact.phone,
                    style: const TextStyle(color: AppColors.text),
                  ),
                ),
              ],
            ),
          ],

          if (contact.email.trim().isNotEmpty) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(
                  Icons.email_outlined,
                  size: 16,
                  color: AppColors.muted,
                ),
                const SizedBox(width: 7),
                Expanded(
                  child: Text(
                    contact.email,
                    style: const TextStyle(color: AppColors.text),
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 12),

          const Text(
            'This contact already exists. A duplicate will not be created.',
            style: TextStyle(fontSize: 13, height: 1.4, color: AppColors.text),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard({
    required IconData icon,
    required String title,
    required String message,
    required Color backgroundColor,
    required Color iconColor,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: iconColor),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.text,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  message,
                  style: const TextStyle(
                    fontSize: 13,
                    height: 1.4,
                    color: AppColors.muted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrimaryAction() {
    if (_businessController.text.trim().isEmpty) {
      return FilledButton.icon(
        onPressed: null,
        icon: const Icon(Icons.business_outlined),
        label: const Text('Business Name Required'),
      );
    }

    if (_matchedCustomer == null) {
      return FilledButton.icon(
        onPressed: _createCompanyAndContact,
        icon: const Icon(Icons.add_business_outlined),
        label: const Text('Create Company & Add Contact'),
      );
    }

    if (_matchedContact != null) {
      return FilledButton.icon(
        onPressed: _openExistingCompany,
        icon: const Icon(Icons.open_in_new),
        label: const Text('View Existing Contact'),
      );
    }

    return FilledButton.icon(
      onPressed: _addToExistingCompany,
      icon: const Icon(Icons.person_add_alt_1_outlined),
      label: const Text('Add as Contact'),
    );
  }

  void _createCompanyAndContact() {
    final businessName = _businessController.text.trim();
    final abn = _abnController.text.trim();
    final address = _addressController.text.trim();

    final contactName = _contactController.text.trim();
    final jobTitle = _jobTitleController.text.trim();
    final phone = _phoneController.text.trim();
    final email = _emailController.text.trim();

    if (businessName.isEmpty) {
      _showMessage('Business name is required.');
      return;
    }

    final session = context.read<SalesSession>();
    final customerService = context.read<CustomerService>();

    // Re-check immediately before writing.
    final existingCustomer = customerService.findMatchingCustomer(
      businessName: businessName,
      abn: abn,
      region: session.currentUser.region,
    );

    if (existingCustomer != null) {
      _checkMatch();

      _showMessage(
        '${existingCustomer.businessName} already exists. Add the employee to the existing company instead.',
      );

      return;
    }

    final customer = customerService.createCustomer(
      businessName: businessName,
      address: address,
      abn: abn,
      region: session.currentUser.region,
    );

    if (_hasContactDetails(contactName, phone, email)) {
      customerService.addContact(
        customerId: customer.id,
        name: contactName,
        jobTitle: jobTitle,
        phone: phone,
        email: email,
        isPrimary: true,
      );
    }

    _finish(customer, '${customer.businessName} created successfully.');
  }

  void _addToExistingCompany() {
    final customer = _matchedCustomer;

    if (customer == null) {
      _checkMatch();
      return;
    }

    final contactName = _contactController.text.trim();
    final jobTitle = _jobTitleController.text.trim();
    final phone = _phoneController.text.trim();
    final email = _emailController.text.trim();

    if (!_hasContactDetails(contactName, phone, email)) {
      _showMessage('Enter at least a contact name, phone or email.');
      return;
    }

    final customerService = context.read<CustomerService>();

    // Re-check duplicate immediately before writing.
    final duplicate = customerService.findContactDuplicate(
      customerId: customer.id,
      phone: phone,
      email: email,
    );

    if (duplicate != null) {
      setState(() {
        _matchedContact = duplicate;
      });

      _showMessage('This contact already exists.');

      return;
    }

    customerService.addContact(
      customerId: customer.id,
      name: contactName,
      jobTitle: jobTitle,
      phone: phone,
      email: email,
    );

    _finish(
      customer,
      contactName.isEmpty
          ? 'Contact added to ${customer.businessName}.'
          : '$contactName added to ${customer.businessName}.',
    );
  }

  void _openExistingCompany() {
    final customer = _matchedCustomer;

    if (customer == null) {
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => CustomerDetailScreen(customer: customer),
      ),
    );
  }

  String _normalizeAbn(String value) {
    final digits = value.replaceAll(RegExp(r'\D'), '');

    if (digits.length != 11) {
      return '';
    }

    return digits;
  }

  bool _hasContactDetails(String name, String phone, String email) {
    return name.isNotEmpty || phone.isNotEmpty || email.isNotEmpty;
  }

  void _finish(Customer customer, String message) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (_) => CustomerDetailScreen(customer: customer),
      ),
      (route) => route.isFirst,
    );
  }

  void _showMessage(String message) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }
}

class _Field extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final IconData icon;
  final TextInputType? keyboardType;
  final int maxLines;
  final ValueChanged<String>? onChanged;

  const _Field({
    required this.label,
    required this.controller,
    required this.icon,
    this.keyboardType,
    this.maxLines = 1,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        maxLines: maxLines,
        onChanged: onChanged,
        textCapitalization: TextCapitalization.words,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon),
          filled: true,
          fillColor: AppColors.card,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
    );
  }
}
