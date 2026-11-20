part of 'customer_notes_screen.dart';

Widget _referenceCustomerField(
  BuildContext context,
  Customer? customer,
  ValueChanged<Customer> change,
) => Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    detailLabel('Customer', required: true),
    detailCard(
      ListTile(
        dense: true,
        leading: const DetailGlyph('person', size: 18),
        title: Text(
          customer?.businessName ?? 'Pick customer',
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
        subtitle: customer == null
            ? null
            : Text(
                '${customer.type} · ${customer.region.label}',
                style: const TextStyle(fontSize: 11, color: detailMuted),
              ),
        trailing: const DetailGlyph('down', size: 14),
        onTap: () async {
          final selected = await chooseSalesCustomer(context);
          if (selected != null) change(selected);
        },
      ),
    ),
  ],
);
Widget _referenceFooter(
  BuildContext context,
  String title,
  VoidCallback? save,
) => SafeArea(
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
            'chevron',
            () => Navigator.pop(context),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(child: detailAction(title, 'check', save, filled: true)),
      ],
    ),
  ),
);
Widget _referenceOwnerField(
  BuildContext context,
  GlobalKey<FormFieldState<List<AppUser>>> key,
  List<AppUser> initial,
) => FormField<List<AppUser>>(
  key: key,
  initialValue: initial,
  validator: (v) => v == null || v.isEmpty ? 'Select at least one owner' : null,
  builder: (field) => InkWell(
    onTap: () async {
      final selected = await _referencePickOwners(context, field.value ?? []);
      if (selected != null && field.mounted) field.didChange(selected);
    },
    child: InputDecorator(
      decoration: detailInput().copyWith(errorText: field.errorText),
      child: Row(
        children: [
          Expanded(
            child: Text(
              (field.value ?? []).map((p) => p.name).join(', '),
              style: const TextStyle(fontSize: 13),
            ),
          ),
          const DetailGlyph('down', size: 14),
        ],
      ),
    ),
  ),
);
Future<List<AppUser>?> _referencePickOwners(
  BuildContext context,
  List<AppUser> current,
) {
  final people = {
    context.read<AppSession>().currentUser.id: context
        .read<AppSession>()
        .currentUser,
    if (SalesDashboardData(context).sample) ...{
      AppSession.jamesWilson.id: AppSession.jamesWilson,
      AppSession.liWei.id: AppSession.liWei,
      AppSession.sarahChen.id: AppSession.sarahChen,
    },
    for (final person in current) person.id: person,
  }.values.toList();
  final selected = current.map((p) => p.id).toSet();
  return showReferenceModal<List<AppUser>>(
    context,
    (dialog) => StatefulBuilder(
      builder: (context, update) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Assign to',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),
          for (final person in people) ...[
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              dense: true,
              title: Text(person.name, style: const TextStyle(fontSize: 14)),
              subtitle: Text(
                person.id == AppSession.sarahChen.id
                    ? 'Sales Manager'
                    : person.roleLabel,
                style: const TextStyle(fontSize: 11, color: detailMuted),
              ),
              value: selected.contains(person.id),
              onChanged: (value) => update(
                () => value == true
                    ? selected.add(person.id)
                    : selected.remove(person.id),
              ),
            ),
            const Divider(height: 1, color: detailLine),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: detailAction('Cancel', '', () => Navigator.pop(dialog)),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: detailAction(
                  'Done',
                  '',
                  selected.isEmpty
                      ? null
                      : () => Navigator.pop(
                          dialog,
                          people.where((p) => selected.contains(p.id)).toList(),
                        ),
                  filled: true,
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}

class _ReferenceAddNoteState extends _AddNoteScreenState {
  late Customer? _selectedCustomer = widget.customer;
  bool _createTask = false, _saving = false;
  String _taskType = 'Other';
  DateTime _taskDate = DateUtils.dateOnly(DateTime.now())
      .add(const Duration(days: 1));
  final _owners = GlobalKey<FormFieldState<List<AppUser>>>();
  Future<void> _referenceSave() async {
    if (_saving) return;
    if (!_formKey.currentState!.validate()) return;
    final user = context.read<AppSession>().currentUser,
        service = context.read<CustomerNoteService>();
    final customerId =
        _selectedCustomer?.id ?? widget.existing?.customerId ?? '';
    if (context.read<AppSession>().isSales && customerId.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Pick a customer first.')));
      return;
    }
    setState(() => _saving = true);
    try {
      await service.commit(() {
        service.addNote(
          existingId: widget.existing?.id,
          customerId: customerId,
          attachments: _attachments,
          content: _controller.text,
          noteType: _noteType,
          author: user,
        );
        if (_createTask) {
          service.addFollowUp(
            customerId: customerId,
            actor: user,
            content: _controller.text,
            attachments: _attachments,
            followUpDate: _taskDate,
            followUpType: _taskType,
            assignees: _owners.currentState?.value ?? [user],
            priority: 'Normal',
            reminder: '1 day before',
          );
        }
      });
      if (mounted) Navigator.pop(context, true);
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Could not save the note. Your entries are kept. Try again.',
            ),
          ),
        );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final sales = context.read<AppSession>().isSales;
    return Scaffold(
      backgroundColor: const Color(0xfff3f5f4),
      appBar: dashboardBar(widget.existing == null ? 'Add note' : 'Note'),
      bottomNavigationBar: _referenceFooter(
        context,
        _saving ? 'Saving…' : 'Save note',
        _saving || _controller.text.trim().isEmpty ? null : _referenceSave,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 24),
          children: [
            if (sales)
              _referenceCustomerField(context, _selectedCustomer, (v) {
                if (mounted) setState(() => _selectedCustomer = v);
              }),
            detailLabel('Type'),
            DropdownButtonFormField<String>(
              initialValue: _noteType,
              decoration: detailInput(),
              style: const TextStyle(
                fontFamily: 'HttReference',
                fontSize: 13,
                color: Color(0xFF29352E),
              ),
              items: [
                for (final s in _AddNoteScreenState._noteTypes)
                  DropdownMenuItem(value: s, child: Text(s)),
              ],
              onChanged: (v) => setState(() => _noteType = v!),
            ),
            detailLabel('Note', required: true),
            TextFormField(
              controller: _controller,
              minLines: 5,
              maxLines: 9,
              onChanged: (_) => setState(() {}),
              decoration: detailInput(
                hint: 'Record what happened or what the customer said',
              ),
              style: const TextStyle(fontSize: 14),
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Enter a note' : null,
            ),
            ActivityAttachments(
              title: 'Photos',
              attachments: _attachments,
              allowFilePicker: widget.existing != null,
              onChanged: (v) => setState(() => _attachments = v),
            ),
            const SizedBox(height: 14),
            CheckboxListTile(
              contentPadding: EdgeInsets.zero,
              controlAffinity: ListTileControlAffinity.leading,
              title: const Text(
                'Create follow-up task',
                style: TextStyle(fontSize: 13),
              ),
              subtitle: const Text(
                'Uses the note above as the task details',
                style: TextStyle(fontSize: 11, color: detailMuted),
              ),
              value: _createTask,
              onChanged: (v) => setState(() => _createTask = v!),
            ),
            if (_createTask) ...[
              detailLabel('Task type', required: true),
              DropdownButtonFormField<String>(
                initialValue: _taskType,
                decoration: detailInput(),
                items: [
                  for (final t in [
                    'Customer Visit',
                    'Sample Delivery',
                    'Quotation / Order Follow-up',
                    'Payment Follow-up',
                    'Product Enquiry',
                    'Other',
                  ])
                    DropdownMenuItem(
                      value: t,
                      child: Text(t, style: const TextStyle(fontSize: 13)),
                    ),
                ],
                onChanged: (v) => setState(() => _taskType = v!),
              ),
              detailLabel('Due date', required: true),
              detailCard(
                ListTile(
                  dense: true,
                  title: Text(
                    DateFormat('EEE, d MMM yyyy').format(_taskDate),
                    style: const TextStyle(fontSize: 13),
                  ),
                  leading: const DetailGlyph('calendar', size: 18),
                  onTap: () async {
                    final d = await pickSalesDate(
                      context: context,
                      initialDate: _taskDate,
                      firstDate: DateUtils.dateOnly(DateTime.now()),
                      lastDate: DateTime(DateTime.now().year + 2),
                    );
                    if (d != null && mounted) setState(() => _taskDate = d);
                  },
                ),
              ),
              detailLabel('Assign to', required: true),
              _referenceOwnerField(context, _owners, [
                context.read<AppSession>().currentUser,
              ]),
            ],
          ],
        ),
      ),
    );
  }
}

class _ReferenceAddFollowUpState extends _AddFollowUpScreenState {
  @override
  Future<void> _selectDate() async {
    if (context.read<AppSession>().isWarehouse) {
      await super._selectDate();
      return;
    }
    final today = DateUtils.dateOnly(DateTime.now());
    final next = await pickSalesDate(
      context: context,
      initialDate: _dueDate,
      firstDate: today,
      lastDate: DateTime(today.year + 2, today.month, today.day),
    );
    if (next != null && mounted) {
      setState(() {
        _dueDate = next;
        if (_reminderDate?.isAfter(next) ?? false) _reminderDate = next;
      });
    }
  }

  @override
  Future<void> _selectReminderDate() async {
    if (context.read<AppSession>().isWarehouse) {
      await super._selectReminderDate();
      return;
    }
    final today = DateUtils.dateOnly(DateTime.now());
    final last = _dueDate.isBefore(today) ? today : _dueDate;
    final next = await pickSalesDate(
      context: context,
      initialDate: _reminderDate ?? last,
      firstDate: today,
      lastDate: last,
    );
    if (next != null && mounted) setState(() => _reminderDate = next);
  }

  late Customer? _selectedCustomer = widget.customer;
  bool _saving = false;
  Future<void> _referenceSave() async {
    if (_saving) return;
    if (!_formKey.currentState!.validate()) return;
    final service = context.read<CustomerNoteService>();
    setState(() => _saving = true);
    try {
      await service.commit(() {
        service.addFollowUp(
          existingId: widget.existing?.id,
          actor: context.read<AppSession>().currentUser,
          customerId:
              _selectedCustomer?.id ?? widget.existing?.customerId ?? '',
          attachments: _attachments,
          content: _description.text,
          followUpDate: _dueDate,
          followUpType: _type,
          assignees: _assigneesKey.currentState!.value!,
          priority: _priority,
          reminder: _reminder,
          reminderDate: _reminder == 'Custom date'
              ? _reminderDate ?? _dueDate
              : null,
        );
      });
      if (mounted) Navigator.pop(context, true);
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Could not save the follow-up. Your entries are kept. Try again.',
            ),
          ),
        );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.read<AppSession>().currentUser,
        today = DateUtils.dateOnly(DateTime.now());
    final monday = today.add(
      Duration(
        days: (8 - today.weekday) % 7 == 0 ? 7 : (8 - today.weekday) % 7,
      ),
    );
    final quick = [
      ('Today', today),
      ('Tomorrow', today.add(const Duration(days: 1))),
      ('Next Mon', monday),
      ('+1 week', today.add(const Duration(days: 7))),
    ];
    final types = [
      'Customer Visit',
      if (_type == 'Sample Delivery') 'Sample Delivery',
      'Swatch Delivery',
      'Quotation / Order Follow-up',
      'Payment Follow-up',
      'Product Enquiry',
      'Customer Complaint',
      'Special Price',
      'Other',
    ];
    return Scaffold(
      backgroundColor: const Color(0xfff3f5f4),
      appBar: dashboardBar(
        widget.existing == null ? 'Add follow-up' : 'Edit follow-up',
      ),
      bottomNavigationBar: _referenceFooter(
        context,
        _saving
            ? 'Saving…'
            : widget.existing == null
            ? 'Create follow-up'
            : 'Save follow-up',
        _saving || _description.text.trim().isEmpty || _type == null
            ? null
            : _referenceSave,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 24),
          children: [
            if (user.isSales)
              _referenceCustomerField(context, _selectedCustomer, (v) {
                if (mounted) setState(() => _selectedCustomer = v);
              }),
            detailLabel('Type', required: true),
            DropdownButtonFormField<String>(
              initialValue: _type,
              decoration: detailInput(hint: 'Select type'),
              isExpanded: true,
              style: const TextStyle(
                fontFamily: 'HttReference',
                fontSize: 13,
                color: Color(0xFF29352E),
              ),
              hint: const Text('Select type'),
              items: [
                for (final t in types)
                  DropdownMenuItem(value: t, child: Text(t)),
              ],
              validator: (v) => v == null ? 'Select a type' : null,
              onChanged: (v) => setState(() => _type = v),
            ),
            detailLabel('What needs to be done?', required: true),
            TextFormField(
              controller: _description,
              minLines: 4,
              maxLines: 7,
              onChanged: (_) => setState(() {}),
              style: const TextStyle(fontSize: 14),
              decoration: detailInput(),
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Enter task details' : null,
            ),
            detailLabel('Due date', required: true),
            Row(
              children: [
                for (final d in quick)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(right: 5),
                      child: InkWell(
                        onTap: () => setState(() => _dueDate = d.$2),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            vertical: 9,
                            horizontal: 3,
                          ),
                          decoration: BoxDecoration(
                            color: DateUtils.isSameDay(_dueDate, d.$2)
                                ? detailPale
                                : Colors.white,
                            border: Border.all(
                              color: DateUtils.isSameDay(_dueDate, d.$2)
                                  ? detailGreen
                                  : detailLine,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            children: [
                              Text(
                                d.$1,
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                DateFormat('EEE d MMM').format(d.$2),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 9,
                                  color: detailMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            detailCard(
              ListTile(
                dense: true,
                leading: const DetailGlyph('calendar', size: 18),
                title: Text(
                  DateFormat('EEE, d MMM yyyy').format(_dueDate),
                  style: const TextStyle(fontSize: 13),
                ),
                trailing: const DetailGlyph('down', size: 14),
                onTap: _selectDate,
              ),
            ),
            detailLabel('Assign to', required: true),
            _referenceOwnerField(
              context,
              _assigneesKey,
              widget.existing?.isFollowUp == true
                  ? widget.existing!.assignees
                  : [user],
            ),
            detailLabel('Priority'),
            DropdownButtonFormField<String>(
              initialValue: _priority,
              decoration: detailInput(),
              items: [
                for (final p in ['Low', 'Normal', 'High'])
                  DropdownMenuItem(
                    value: p,
                    child: Text(p, style: const TextStyle(fontSize: 13)),
                  ),
              ],
              onChanged: (v) => setState(() => _priority = v!),
            ),
            detailLabel('Reminder'),
            DropdownButtonFormField<String>(
              initialValue: _reminder,
              decoration: detailInput(),
              items: [
                for (final r in [
                  'None',
                  'On due date',
                  '1 day before',
                  '1 week before',
                  if (_reminder == 'Custom date') 'Custom date',
                ])
                  DropdownMenuItem(
                    value: r,
                    child: Text(r, style: const TextStyle(fontSize: 13)),
                  ),
              ],
              onChanged: (v) => setState(() => _reminder = v!),
            ),
            if (_reminder == 'Custom date')
              TextButton(
                onPressed: _selectReminderDate,
                child: Text(
                  _reminderDate == null
                      ? 'Pick reminder date'
                      : DateFormat('d MMM yyyy').format(_reminderDate!),
                ),
              ),
            if (widget.existing?.attachments.isNotEmpty ?? false)
              ActivityAttachments(
                attachments: _attachments,
                onChanged: (v) => setState(() => _attachments = v),
              ),
          ],
        ),
      ),
    );
  }
}
