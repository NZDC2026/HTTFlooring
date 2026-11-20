import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../models/business_card_scan_result.dart';
import '../../../services/app_session.dart';
import '../../../services/customer_service.dart';
import '../../../services/pricing_service.dart';
import '../../../services/sales_session.dart';
import '../../../services/local_sales_request_store.dart';
import '../../../widgets/sales_detail_ui.dart';
import '../home/sales_dashboard_support.dart';
import 'business_card_photo_input.dart';
import 'customer_detail_screen.dart';

class SalesCustomerForm extends StatefulWidget {
  const SalesCustomerForm({
    super.key,
    this.initial = const BusinessCardScanResult(),
  });
  final BusinessCardScanResult initial;
  @override
  State<SalesCustomerForm> createState() => _SalesCustomerFormState();
}

class _ContactDraft {
  _ContactDraft({
    String name = '',
    String mobile = '',
    String email = '',
    String position = '',
  }) : name = TextEditingController(text: name),
       mobile = TextEditingController(text: mobile),
       email = TextEditingController(text: email),
       position = TextEditingController(text: position);
  final TextEditingController name, mobile, email, position;
  String role = 'Primary contact';
  final Set<String> sendTo = {'Invoices', 'Statements'};
  void dispose() {
    name.dispose();
    mobile.dispose();
    email.dispose();
    position.dispose();
  }
}

class _SalesCustomerFormState extends State<SalesCustomerForm> {
  final _form = GlobalKey<FormState>();
  late final _name = TextEditingController(text: widget.initial.businessName),
      _abn = TextEditingController(text: widget.initial.abn),
      _address = TextEditingController(text: widget.initial.address);
  final _trading = TextEditingController(), _phone = TextEditingController();
  late final List<_ContactDraft> _contacts = [
    _ContactDraft(
      name: widget.initial.contactName,
      mobile: widget.initial.phone,
      email: widget.initial.email,
      position: widget.initial.jobTitle,
    ),
  ];
  String _level = 'Normal';
  bool _full = false, _prices = false, _terms = false, _saving = false;
  @override
  void dispose() {
    for (final c in [_name, _abn, _address, _trading, _phone]) {
      c.dispose();
    }
    for (final c in _contacts) {
      c.dispose();
    }
    super.dispose();
  }

  Widget _field(
    String label,
    TextEditingController c, {
    String? hint,
    bool required = false,
    TextInputType? keyboard,
  }) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      detailLabel(label, required: required),
      TextFormField(
        key: ValueKey(
          'customer-field-${label.toLowerCase().replaceAll(' ', '-')}',
        ),
        controller: c,
        keyboardType: keyboard,
        style: const TextStyle(fontSize: 13),
        decoration: detailInput(hint: hint),
        validator: (v) {
          final text = v?.trim() ?? '';
          if (required && text.isEmpty) return 'Enter ${label.toLowerCase()}';
          if (label == 'Email' &&
              text.isNotEmpty &&
              !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(text)) {
            return 'Enter a valid email';
          }
          return null;
        },
      ),
    ],
  );
  Future<void> _scan() async {
    await showDetailSheet<void>(
      context,
      (sheet) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Fill from business card',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),
          const Text(
            'Check the recognised details before saving.',
            style: TextStyle(fontSize: 12, color: detailMuted),
          ),
          const SizedBox(height: 16),
          BusinessCardPhotoInput(
            onScanned: (r) {
              if (!mounted) return;
              setState(() {
                for (final e in {
                  _name: r.businessName,
                  _abn: r.abn,
                  _address: r.address,
                  _contacts.first.name: r.contactName,
                  _contacts.first.mobile: r.phone,
                  _contacts.first.email: r.email,
                  _contacts.first.position: r.jobTitle,
                }.entries) {
                  if (e.key.text.trim().isEmpty) e.key.text = e.value;
                }
              });
            },
          ),
          const SizedBox(height: 14),
          detailAction(
            'Done',
            'check',
            () => Navigator.pop(sheet),
            filled: true,
          ),
        ],
      ),
    );
  }

  Future<void> _save() async {
    if (_saving) return;
    final valid = _form.currentState!.validate();
    if (!valid ||
        _name.text.trim().isEmpty ||
        _contacts.any(
          (c) =>
              c.name.text.trim().isEmpty ||
              c.mobile.text.trim().isEmpty ||
              c.email.text.trim().isNotEmpty &&
                  !RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
                      .hasMatch(c.email.text.trim()),
        )) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Complete the required business and contact details.'),
        ),
      );
      return;
    }
    final service = context.read<CustomerService>(),
        session = context.read<SalesSession>(),
        pricing = context.read<PricingService>(),
        user = context.read<AppSession>().currentUser;
    final existing = service.findMatchingCustomer(
      businessName: _name.text.trim(),
      abn: _abn.text.trim(),
      region: session.region,
    );
    if (existing != null) {
      final use = await showDetailSheet<bool>(
        context,
        (sheet) => Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Existing customer found',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 10),
            Text(
              '${existing.businessName} already exists in this region. Add the new contacts to this customer?',
              style: const TextStyle(fontSize: 13, color: detailMuted),
            ),
            const SizedBox(height: 16),
            detailAction(
              'Use existing customer',
              'person',
              () => Navigator.pop(sheet, true),
              filled: true,
            ),
            const SizedBox(height: 8),
            detailAction('Cancel', 'check', () => Navigator.pop(sheet, false)),
          ],
        ),
      );
      if (use != true || !mounted) return;
    }
    setState(() => _saving = true);
    try {
      final customer =
          existing ??
          service.createCustomer(
            businessName: _name.text,
            address: _address.text,
            abn: _abn.text,
            region: session.region,
            type: 'Store Customer',
          );
      if (existing == null && _phone.text.trim().isNotEmpty) {
        service.updateCustomer(
          customerId: customer.id,
          businessName: customer.businessName,
          address: customer.address,
          abn: customer.abn,
          companyPhone: _phone.text,
        );
      }
      final contactPrefs = <String, dynamic>{};
      for (final c in _contacts) {
        final duplicate = service.findContactDuplicate(
          customerId: customer.id,
          phone: c.mobile.text,
          email: c.email.text,
        );
        final contact =
            duplicate ??
            service.addContact(
              customerId: customer.id,
              name: c.name.text,
              jobTitle: c.position.text,
              phone: c.mobile.text,
              email: c.email.text,
              isPrimary: c.role == 'Primary contact' && existing == null,
              isAccountsContact: c.role == 'Accounts payable',
            );
        if (duplicate == null) {
          contactPrefs[contact.id] = {
            'role': c.role,
            'sendTo': c.sendTo.toList(),
          };
        }
      }
      final prefs = await SharedPreferences.getInstance();
      final key = 'customer-detail-${user.id}-${customer.id}';
      final metadata = Map<String, dynamic>.from(
        jsonDecode(prefs.getString(key) ?? '{}') as Map,
      );
      if (existing == null) {
        metadata.addAll({
          'tradingName': _trading.text.trim(),
          'priceLevel': _level,
          'paymentTerms': 'COD',
          'accountTermsRequested': _terms,
        });
      }
      if (_terms) metadata['accountTermsRequested'] = true;
      metadata['contactPreferences'] = {
        ...Map<String, dynamic>.from(
          metadata['contactPreferences'] as Map? ?? {},
        ),
        ...contactPrefs,
      };
      await prefs.setString(key, jsonEncode(metadata));
      if (existing == null) await pricing.setCustomerLevel(customer.id, _level);
      if (_terms) {
        await LocalSalesRequestStore.append(user.id, {
          'kind': 'Account terms',
          'customerId': customer.id,
          'customer': customer.businessName,
          'note': 'Customer requests a credit application. Current terms remain unchanged pending approval.',
        });
      }
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => CustomerDetailScreen(
            customer: service.findById(customer.id) ?? customer,
          ),
        ),
      );
    } catch (_) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not save customer. Please try again.'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: Colors.white,
    appBar: dashboardBar('Add customer'),
    bottomNavigationBar: SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: detailLine)),
        ),
        child: Row(
          children: [
            Expanded(
              child: detailAction(
                'Cancel',
                'check',
                _saving ? null : () => Navigator.pop(context),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: detailAction(
                _saving ? 'Saving…' : 'Save customer',
                'check',
                _saving ? null : _save,
                filled: true,
              ),
            ),
          ],
        ),
      ),
    ),
    body: Form(
      key: _form,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 24),
        children: [
          detailAction('Fill from business card', 'doc', _scan),
          detailHeading('Business', action: 'Store customer'),
          _field(
            'ABN',
            _abn,
            hint: '11 digit ABN',
            keyboard: TextInputType.number,
          ),
          _field(
            'Legal business name',
            _name,
            hint: 'As registered on the ABR',
            required: true,
          ),
          _field('Trading name', _trading, hint: 'Shop name, if different'),
          detailLabel('Price level'),
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: const Color(0xFFEDF0EE),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                for (final l in [
                  ('Normal', 'List'),
                  ('VIP', '−10%'),
                  ('VVIP', '−15%'),
                  ('Container', '−20%'),
                ])
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _level = l.$1),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 9),
                        decoration: BoxDecoration(
                          color: _level == l.$1
                              ? Colors.white
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          children: [
                            Text(
                              l.$1,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              l.$2,
                              style: const TextStyle(
                                fontSize: 10,
                                color: detailMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton(
              onPressed: () => setState(() => _prices = !_prices),
              child: Text(
                '${_prices ? 'Hide' : 'Show'} sample prices ${_prices ? '⌃' : '⌄'}',
                style: const TextStyle(fontSize: 11, color: detailGreen),
              ),
            ),
          ),
          if (_prices) _samplePrices(),
          _field(
            'Address',
            _address,
            hint: 'Street address, suburb, state and postcode',
          ),
          detailHeading('Contacts', action: 'Synced with main system'),
          for (var i = 0; i < _contacts.length; i++) _contact(i),
          const SizedBox(height: 12),
          detailAction(
            'Add another contact',
            'plus',
            () => setState(() {
              final c = _ContactDraft()..role = 'Staff';
              c.sendTo.clear();
              _contacts.add(c);
            }),
          ),
          const SizedBox(height: 18),
          if (!_full)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const DetailGlyph('plus', size: 18),
              title: const Text(
                'Add full details',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              ),
              subtitle: const Text(
                'Position, send-to options, company phone, payment terms',
                style: TextStyle(fontSize: 11, color: detailMuted),
              ),
              onTap: () => setState(() => _full = true),
            )
          else ...[
            detailHeading(
              'Full details',
              action: 'Hide',
              onTap: () => setState(() => _full = false),
            ),
            _field('Company phone', _phone, keyboard: TextInputType.phone),
            detailHeading('Payment terms'),
            detailCard(
              Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'COD',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'All new customers start on COD',
                            style: TextStyle(fontSize: 11, color: detailMuted),
                          ),
                        ],
                      ),
                    ),
                    detailBadge('Default'),
                  ],
                ),
              ),
            ),
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              controlAffinity: ListTileControlAffinity.leading,
              value: _terms,
              onChanged: (v) => setState(() => _terms = v!),
              title: const Text(
                'Customer wants account terms',
                style: TextStyle(fontSize: 13),
              ),
              subtitle: const Text(
                'The office sends a credit application. Terms apply only after it is approved.',
                style: TextStyle(fontSize: 11, color: detailMuted),
              ),
            ),
          ],
          const SizedBox(height: 18),
          const Text(
            'Created as a Store customer. Grade is set by the main system, and the office is notified to check the details.',
            style: TextStyle(fontSize: 11, color: detailMuted, height: 1.5),
          ),
        ],
      ),
    ),
  );
  Widget _contact(int i) {
    final c = _contacts[i];
    return Padding(
      key: ObjectKey(c),
      padding: const EdgeInsets.only(bottom: 12),
      child: detailCard(
        Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Contact ${i + 1}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  if (i > 0)
                    IconButton(
                      tooltip: 'Remove contact ${i + 1}',
                      icon: const DetailGlyph('close', size: 15),
                      onPressed: () {
                        setState(() => _contacts.remove(c));
                        WidgetsBinding.instance.addPostFrameCallback(
                          (_) => c.dispose(),
                        );
                      },
                    ),
                ],
              ),
              DropdownButtonFormField<String>(
                key: ValueKey(c.role),
                initialValue: c.role,
                decoration: detailInput(),
                style: const TextStyle(
                  fontFamily: 'HttReference',
                  fontSize: 12,
                  color: detailGreen,
                ),
                items: [
                  for (final r in [
                    'Primary contact',
                    'Accounts payable',
                    'Staff',
                  ])
                    DropdownMenuItem(value: r, child: Text(r)),
                ],
                onChanged: (v) => setState(() {
                  if (v == 'Primary contact') {
                    for (final other in _contacts) {
                      if (other != c && other.role == 'Primary contact') {
                        other.role = 'Staff';
                      }
                    }
                  }
                  c.role = v!;
                }),
              ),
              _field('Name', c.name, required: true),
              _field(
                'Mobile',
                c.mobile,
                required: true,
                keyboard: TextInputType.phone,
              ),
              _field('Email', c.email, keyboard: TextInputType.emailAddress),
              if (_full) ...[
                _field('Position', c.position),
                detailLabel('Send to this contact'),
                for (final option in [
                  'Invoices',
                  'Statements',
                  'Order confirmations',
                  'Delivery notifications',
                ])
                  CheckboxListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    controlAffinity: ListTileControlAffinity.leading,
                    value: c.sendTo.contains(option),
                    onChanged: (v) => setState(
                      () => v == true
                          ? c.sendTo.add(option)
                          : c.sendTo.remove(option),
                    ),
                    title: Text(option, style: const TextStyle(fontSize: 12)),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _samplePrices() => detailCard(
    Padding(
      padding: const EdgeInsets.all(9),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                flex: 2,
                child: Text(
                  'Sample prices · ex GST',
                  style: TextStyle(fontSize: 9, color: detailMuted),
                ),
              ),
              for (final h in ['Normal', 'VIP', 'VVIP', 'Cont.'])
                Expanded(
                  child: Text(
                    h,
                    style: TextStyle(fontSize: 9, color: detailMuted),
                    textAlign: TextAlign.right,
                  ),
                ),
            ],
          ),
          for (final row in [
            ('Bonita Natural Oak', 82.0),
            ('Guardian D3016', 55.0),
            ('MTF White', 36.0),
            ('Heritage Natural Oak', 95.0),
          ])
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: Text(
                      '${row.$1}\n/m²',
                      style: const TextStyle(fontSize: 10),
                    ),
                  ),
                  for (final f in [1.0, .9, .85, .8])
                    Expanded(
                      child: Text(
                        '\$${(row.$1 == 'MTF White' && f == .8 ? 29.0 : row.$2 * f).toStringAsFixed(2)}',
                        textAlign: TextAlign.right,
                        style: const TextStyle(fontSize: 9),
                      ),
                    ),
                ],
              ),
            ),
          const Text(
            'Prices never go below the floor price. The full Normal price list is in the main system.',
            style: TextStyle(fontSize: 10, color: detailMuted, height: 1.5),
          ),
        ],
      ),
    ),
  );
}
