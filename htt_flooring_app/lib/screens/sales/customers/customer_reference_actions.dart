part of 'customer_detail_screen.dart';

extension _CustomerReferenceActions on _ReferenceCustomerDetailState {
  Widget _sheetTitle(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 14),
    child: Text(
      text,
      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
    ),
  );
  Widget _sheetItem(
    String title,
    String glyph,
    VoidCallback onTap, {
    String? subtitle,
    Color? color,
  }) => ListTile(
    contentPadding: EdgeInsets.zero,
    leading: glyph == 'phone'
        ? Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: detailPale,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: DetailGlyph(glyph, size: 18, color: color ?? detailGreen),
            ),
          )
        : DetailGlyph(glyph, size: 19, color: color ?? detailGreen),
    title: Text(title, style: TextStyle(fontSize: 14, color: color)),
    subtitle: subtitle == null
        ? null
        : Text(
            subtitle,
            style: const TextStyle(fontSize: 12, color: detailMuted),
          ),
    trailing: const DetailGlyph('chevron', size: 14, color: detailMuted),
    onTap: onTap,
  );
  void _referenceCall() => showDetailSheet<void>(
    context,
    (sheet) => Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sheetTitle('Call ${_customer.businessName}'),
        for (final c in _contacts)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: detailCard(
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                child: _sheetItem(
                  c.name,
                  'phone',
                  () {
                    Navigator.pop(sheet);
                    if (c.phone.isNotEmpty) _callPhone(c.phone);
                  },
                  subtitle:
                      '${c.isPrimary ? 'Primary contact' : c.jobTitle} · ${c.phone.isEmpty ? 'No phone number recorded' : c.phone}',
                ),
              ),
            ),
          ),
        if (_customer.companyPhone.isNotEmpty || _abc)
          detailCard(
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: _sheetItem(
                'Company line',
                'phone',
                () {
                  Navigator.pop(sheet);
                  _callPhone(
                    _customer.companyPhone.isNotEmpty
                        ? _customer.companyPhone
                        : '(02) 9261 4400',
                  );
                },
                subtitle:
                    'Office · ${_customer.companyPhone.isNotEmpty ? _customer.companyPhone : '(02) 9261 4400'}',
              ),
            ),
          ),
        if (_contacts.isEmpty && _customer.companyPhone.isEmpty)
          const Text(
            'No phone number recorded.',
            style: TextStyle(fontSize: 13, color: detailMuted),
          ),
      ],
    ),
  );
  void _addActivity() => showDetailSheet<void>(
    context,
    (sheet) => Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sheetTitle('Add for ${_customer.businessName}'),
        _sheetItem('Note', 'doc', () {
          Navigator.pop(sheet);
          _newNote();
        }, subtitle: 'Record what happened or what the customer said'),
        _sheetItem('Task', 'calendar', () {
          Navigator.pop(sheet);
          _newTask();
        }, subtitle: 'Follow-up with a due date and owner'),
      ],
    ),
  );
  Future<void> _newNote() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => AddNoteScreen(customer: _customer)),
    );
    if (mounted) _refresh(() {});
  }

  Future<void> _newTask() async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => AddFollowUpScreen(customer: _customer)),
    );
    if (mounted) _refresh(() {});
  }

  void _referenceMenu() => showDetailSheet<void>(
    context,
    (sheet) => Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _customer.businessName,
          style: const TextStyle(fontSize: 12, color: detailMuted),
        ),
        _sheetTitle('More actions'),
        const Text(
          'REQUEST',
          style: TextStyle(fontSize: 10, color: detailMuted),
        ),
        _sheetItem('Request quote', 'doc', () {
          Navigator.pop(sheet);
          _openQuoteRequest();
        }),
        _sheetItem('Request sample', 'box', () {
          Navigator.pop(sheet);
          dashboardOpen(
            context,
            SalesSamplesScreen(createOnOpen: true, initialCustomer: _customer),
          );
        }),
        const SizedBox(height: 12),
        const Text(
          'ACCOUNT',
          style: TextStyle(fontSize: 10, color: detailMuted),
        ),
        _sheetItem('Add contact', 'person', () {
          Navigator.pop(sheet);
          _referenceContactForm();
        }),
        _sheetItem('Edit company details', 'doc', () {
          Navigator.pop(sheet);
          _referenceCompanyForm();
        }),
        _sheetItem('Request archive', 'box', () {
          Navigator.pop(sheet);
          _archiveRequest();
        }, color: const Color(0xFFBC3441)),
      ],
    ),
  );
  Future<void> _archiveRequest() async {
    final reason = TextEditingController();
    final message = await showDetailSheet<String>(
      context,
      (sheet) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sheetTitle('Request archive'),
          Text(_customer.businessName, style: const TextStyle(fontSize: 13)),
          const SizedBox(height: 10),
          const Text(
            'The office reviews archive requests. This customer remains active until approved.',
            style: TextStyle(fontSize: 12, color: detailMuted, height: 1.5),
          ),
          detailLabel('Reason', required: true),
          TextField(
            controller: reason,
            maxLines: 3,
            decoration: detailInput(
              hint: 'Why should this customer be archived?',
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: detailAction(
                  'Cancel',
                  'chevron',
                  () => Navigator.pop(sheet),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: detailAction('Request archive', 'doc', () {
                  if (reason.text.trim().isNotEmpty) {
                    Navigator.pop(sheet, reason.text.trim());
                  }
                }, filled: true),
              ),
            ],
          ),
        ],
      ),
    );
    reason.dispose();
    if (message == null || !mounted) return;
    _refresh(() {
      _metadata['archiveRequested'] = true;
      _metadata['archiveReason'] = message;
    });
    final userId = context.read<AppSession>().currentUser.id;
    await _saveMeta();
    await LocalSalesRequestStore.append(userId, {
      'kind': 'Archive',
      'customer': _customer.businessName,
      'customerId': _customer.id,
      'note': message,
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Archive request saved on this device. Office submission is not connected.',
          ),
        ),
      );
    }
  }

  void _contactMenu(CustomerContact c) => showDetailSheet<void>(
    context,
    (sheet) => Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _sheetItem('Set as primary', 'check', () {
          Navigator.pop(sheet);
          _saveContact(c, primary: true);
        }),
        _sheetItem('Edit', 'doc', () {
          Navigator.pop(sheet);
          _referenceContactForm(contact: c);
        }),
        _sheetItem('Remove', 'person', () {
          Navigator.pop(sheet);
          _removeReferenceContact(c);
        }, color: const Color(0xFFBC3441)),
      ],
    ),
  );
  void _saveContact(CustomerContact c, {bool? primary}) {
    final service = context.read<CustomerService>();
    final exists = service
        .getContactsForCustomer(_customer.id)
        .any((r) => r.id == c.id);
    if (exists) {
      service.updateContact(
        contactId: c.id,
        name: c.name,
        jobTitle: c.jobTitle,
        phone: c.phone,
        email: c.email,
        isPrimary: primary ?? c.isPrimary,
        isAccountsContact: c.isAccountsContact,
      );
    } else {
      service.addContact(
        customerId: _customer.id,
        name: c.name,
        jobTitle: c.jobTitle,
        phone: c.phone,
        email: c.email,
        isPrimary: primary ?? c.isPrimary,
        isAccountsContact: c.isAccountsContact,
      );
    }
    _refresh(() {});
  }

  Future<void> _removeReferenceContact(CustomerContact c) async {
    final yes = await showDialog<bool>(
      context: context,
      builder: (dialog) => AlertDialog(
        backgroundColor: Colors.white,
        title: const Text('Remove contact?', style: TextStyle(fontSize: 18)),
        content: Text(
          'Remove ${c.name} from ${_customer.businessName}?',
          style: const TextStyle(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialog, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialog, true),
            child: const Text(
              'Remove',
              style: TextStyle(color: Color(0xFFBC3441)),
            ),
          ),
        ],
      ),
    );
    if (yes != true || !mounted) return;
    context.read<CustomerService>().deleteContact(c.id);
    if (c.id == 'reference-lisa') {
      _refresh(() => _metadata['removeLisa'] = true);
      await _saveMeta();
    }
  }

  Future<void> _referenceContactForm({CustomerContact? contact}) async {
    final name = TextEditingController(text: contact?.name),
        role = TextEditingController(text: contact?.jobTitle),
        phone = TextEditingController(text: contact?.phone),
        email = TextEditingController(text: contact?.email);
    bool primary = contact?.isPrimary ?? false,
        accounts = contact?.isAccountsContact ?? false;
    final form = GlobalKey<FormState>();
    final result = await showDetailSheet<CustomerContact>(
      context,
      (sheet) => StatefulBuilder(
        builder: (context, update) => Form(
          key: form,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _sheetTitle(contact == null ? 'Add contact' : 'Edit contact'),
              for (final field in [
                ('Name', name),
                ('Role / title', role),
                ('Phone', phone),
                ('Email', email),
              ]) ...[
                detailLabel(field.$1, required: field.$1 == 'Name'),
                TextFormField(
                  controller: field.$2,
                  style: const TextStyle(fontSize: 14),
                  keyboardType: field.$1 == 'Phone'
                      ? TextInputType.phone
                      : field.$1 == 'Email'
                      ? TextInputType.emailAddress
                      : TextInputType.text,
                  decoration: detailInput(),
                  validator: field.$1 == 'Name'
                      ? (v) => v == null || v.trim().isEmpty
                            ? 'Enter a name'
                            : null
                      : null,
                ),
              ],
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                dense: true,
                title: const Text(
                  'Primary contact',
                  style: TextStyle(fontSize: 13),
                ),
                value: primary,
                onChanged: (v) => update(() => primary = v!),
              ),
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                dense: true,
                title: const Text(
                  'Accounts contact',
                  style: TextStyle(fontSize: 13),
                ),
                value: accounts,
                onChanged: (v) => update(() => accounts = v!),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: detailAction(
                      'Cancel',
                      'chevron',
                      () => Navigator.pop(sheet),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: detailAction('Save', 'check', () {
                      if (form.currentState!.validate()) {
                        Navigator.pop(
                          sheet,
                          CustomerContact(
                            id: contact?.id ?? 'new',
                            customerId: _customer.id,
                            name: name.text.trim(),
                            jobTitle: role.text.trim(),
                            phone: phone.text.trim(),
                            email: email.text.trim(),
                            isPrimary: primary,
                            isAccountsContact: accounts,
                          ),
                        );
                      }
                    }, filled: true),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
    for (final c in [name, role, phone, email]) {
      c.dispose();
    }
    if (result != null && mounted) {
      final customer = _customer,
          userId = context.read<AppSession>().currentUser.id;
      final saved = contact == null
          ? context.read<CustomerService>().addContact(
              customerId: customer.id,
              name: result.name,
              jobTitle: result.jobTitle,
              phone: result.phone,
              email: result.email,
              isPrimary: result.isPrimary,
              isAccountsContact: result.isAccountsContact,
            )
          : result;
      _refresh(() => _metadata['contactPending-${saved.id}'] = true);
      await _saveMeta();
      await LocalSalesRequestStore.append(userId, {
        'kind': 'Contact',
        'customerId': customer.id,
        'customer': customer.businessName,
        'contactId': saved.id,
        'note': '${contact == null ? 'Add' : 'Change'} ${result.name}',
        'before': contact?.toJson(),
        'after': saved.toJson(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Contact change saved locally for office review.'),
          ),
        );
      }
    }
  }

  Future<void> _referenceCompanyForm() async {
    final c = _customer;
    final name = TextEditingController(text: c.businessName),
        abn = TextEditingController(text: c.abn),
        address = TextEditingController(text: c.address),
        phone = TextEditingController(text: c.companyPhone),
        credit = TextEditingController(
          text: '${_metadata['credit'] ?? (_abc ? 50000 : '')}',
        );
    String grade = '${_metadata['grade'] ?? _record?.tier ?? 'B'}';
    final form = GlobalKey<FormState>();
    final save = await showDetailSheet<bool>(
      context,
      (sheet) => StatefulBuilder(
        builder: (context, update) => Form(
          key: form,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _sheetTitle('Edit company'),
              for (final f in [
                ('Company name', name),
                ('ABN', abn),
                ('Address', address),
                ('Company phone', phone),
              ]) ...[
                detailLabel(f.$1),
                TextFormField(
                  controller: f.$2,
                  decoration: detailInput(),
                  style: const TextStyle(fontSize: 14),
                  validator: f.$1 == 'Company name'
                      ? (v) => v == null || v.trim().isEmpty
                            ? 'Enter company name'
                            : null
                      : null,
                ),
              ],
              detailLabel('Grade'),
              DropdownButtonFormField<String>(
                initialValue: grade,
                decoration: detailInput(),
                items: [
                  for (final s in ['A', 'B', 'C'])
                    DropdownMenuItem(value: s, child: Text(s)),
                ],
                onChanged: (s) => grade = s!,
              ),
              detailLabel('Credit limit (\$)'),
              TextFormField(
                controller: credit,
                keyboardType: TextInputType.number,
                decoration: detailInput(),
                validator: (v) =>
                    v != null &&
                        v.isNotEmpty &&
                        (double.tryParse(v) == null || double.parse(v) < 0)
                    ? 'Enter a valid credit limit'
                    : null,
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: detailAction(
                      'Cancel',
                      'chevron',
                      () => Navigator.pop(sheet),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: detailAction('Save', 'check', () {
                      if (form.currentState!.validate()) {
                        Navigator.pop(sheet, true);
                      }
                    }, filled: true),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
    if (save == true && mounted) {
      context.read<CustomerService>().updateCustomer(
        customerId: c.id,
        businessName: name.text.trim(),
        abn: abn.text.trim(),
        address: address.text.trim(),
        companyPhone: phone.text.trim(),
      );
      _refresh(() {
        _metadata['grade'] = grade;
        _metadata['credit'] = double.tryParse(credit.text) ?? 0;
      });
      await _saveMeta();
    }
    for (final v in [name, abn, address, phone, credit]) {
      v.dispose();
    }
  }

  void _openDocumentList(String type) => dashboardOpen(
    context,
    _ReferenceCustomerDocuments(customer: _customer, initialType: type),
  );
  void _openQuoteRequest() =>
      dashboardOpen(context, SalesQuoteRequestScreen(customer: _customer));
}
