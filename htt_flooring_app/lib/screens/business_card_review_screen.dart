import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/business_card_scan_result.dart';
import '../models/customer.dart';
import '../services/sales_session.dart';
import '../services/customer_service.dart';
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

  late final TextEditingController _phoneController;

  late final TextEditingController _emailController;

  late final TextEditingController _websiteController;

  late final TextEditingController _addressController;

  @override
  void initState() {
    super.initState();

    _businessController = TextEditingController(
      text: widget.result.businessName,
    );

    _contactController = TextEditingController(text: widget.result.contactName);

    _phoneController = TextEditingController(text: widget.result.phone);

    _emailController = TextEditingController(text: widget.result.email);

    _websiteController = TextEditingController(text: widget.result.website);

    _addressController = TextEditingController(text: widget.result.address);
  }

  @override
  void dispose() {
    _businessController.dispose();
    _contactController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _websiteController.dispose();
    _addressController.dispose();

    super.dispose();
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
              'Check the information before creating the customer.',
              style: TextStyle(color: AppColors.muted, height: 1.4),
            ),

            const SizedBox(height: 24),

            _Field(
              label: 'Business Name',
              controller: _businessController,
              icon: Icons.business_outlined,
            ),

            _Field(
              label: 'Contact Name',
              controller: _contactController,
              icon: Icons.person_outline,
            ),

            _Field(
              label: 'Phone',
              controller: _phoneController,
              icon: Icons.phone_outlined,
              keyboardType: TextInputType.phone,
            ),

            _Field(
              label: 'Email',
              controller: _emailController,
              icon: Icons.email_outlined,
              keyboardType: TextInputType.emailAddress,
            ),

            _Field(
              label: 'Website',
              controller: _websiteController,
              icon: Icons.language_outlined,
              keyboardType: TextInputType.url,
            ),

            _Field(
              label: 'Address',
              controller: _addressController,
              icon: Icons.location_on_outlined,
              maxLines: 2,
            ),

            const SizedBox(height: 5),

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
                  const Icon(
                    Icons.location_on_outlined,
                    color: AppColors.copper,
                  ),

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
                          'Customer will be assigned to your sales region.',
                          style: TextStyle(
                            color: AppColors.muted,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const Icon(
                    Icons.lock_outline,
                    size: 17,
                    color: AppColors.muted,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            SizedBox(
              height: 52,
              child: FilledButton.icon(
                onPressed: () {
                  _createCustomer();
                },
                icon: const Icon(Icons.person_add_alt_1_outlined),
                label: const Text('Create Customer'),
              ),
            ),

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

  void _createCustomer() {
    final businessName = _businessController.text.trim();
    final contactName = _contactController.text.trim();
    final phone = _phoneController.text.trim();
    final email = _emailController.text.trim();
    final website = _websiteController.text.trim();
    final address = _addressController.text.trim();

    if (businessName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Business name is required.')),
      );
      return;
    }

    final session = context.read<SalesSession>();
    final customerService = context.read<CustomerService>();

    final duplicate = customerService.findDuplicate(
      businessName: businessName,
      phone: phone,
      email: email,
      region: session.currentUser.region,
    );

    if (duplicate != null) {
      _showDuplicateCustomerDialog(duplicate);
      return;
    }

    final customer = customerService.createCustomer(
      businessName: businessName,
      contactName: contactName,
      phone: phone,
      email: email,
      website: website,
      address: address,
      region: session.currentUser.region,
    );

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${customer.businessName} created successfully.')),
    );

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (_) => CustomerDetailScreen(customer: customer),
      ),
      (route) => route.isFirst,
    );
  }

  Future<void> _showDuplicateCustomerDialog(Customer customer) async {
    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Possible Duplicate'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('A customer with matching details already exists.'),
              const SizedBox(height: 16),
              Text(
                customer.businessName,
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
              if (customer.contactName.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(customer.contactName),
              ],
              if (customer.phone.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(customer.phone),
              ],
              if (customer.email.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(customer.email),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
              },
              child: const Text('Back'),
            ),
          ],
        );
      },
    );
  }
}

class _Field extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final IconData icon;
  final TextInputType? keyboardType;
  final int maxLines;

  const _Field({
    required this.label,
    required this.controller,
    required this.icon,
    this.keyboardType,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        maxLines: maxLines,
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
