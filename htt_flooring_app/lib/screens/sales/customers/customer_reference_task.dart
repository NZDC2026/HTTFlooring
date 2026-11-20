part of 'customer_notes_screen.dart';

extension _ReferenceTask on _FollowUpDetailState {
  List<CustomerContact> _taskContacts(Customer customer) {
    final actual =
        context.read<CustomerService?>()?.getContactsForCustomer(customer.id) ??
        <CustomerContact>[];
    final app = context.read<AppSession>();
    if (actual.isNotEmpty ||
        !AppSession.demoLoginEnabled ||
        (app.employeeAccessToken?.isNotEmpty ?? false) ||
        customer.businessName != 'Northern Floors')
      return actual;
    return [
      CustomerContact(
        id: 'reference-mark',
        customerId: customer.id,
        name: 'Mark Taylor',
        jobTitle: 'Director',
        phone: '0418 909 112',
        email: 'mark@northernfloors.com.au',
        isPrimary: true,
      ),
    ];
  }

  Widget _referenceTask(
    BuildContext context,
    CustomerNote task,
    CustomerNoteService service,
  ) {
    final user = context.read<AppSession>().currentUser,
        customer = widget.customer;
    final canReply = task.canReply(user);
    final primary = customer == null
        ? null
        : _taskContacts(customer).where((c) => c.isPrimary).firstOrNull ??
              _taskContacts(customer).firstOrNull;
    final payment = (task.followUpType ?? '').toLowerCase().contains('payment');
    final quotation = (task.followUpType ?? '').toLowerCase().contains('quot');
    final documentNumber = RegExp(r'(?:QT|INV|SO)-[0-9]+')
        .firstMatch(task.content)
        ?.group(0);
    final linked =
        customer == null ||
            documentNumber == null ||
            context.read<SalesDocumentService?>() == null
        ? null
        : referenceCustomerDocuments(
            context,
            customer,
          ).where((d) => d.number == documentNumber).firstOrNull;
    final otherTasks = customer == null
        ? <CustomerNote>[]
        : service
              .getCustomerNotes(customer.id)
              .where((n) => n.isFollowUp && !n.isCompleted && n.id != task.id)
              .toList();

    if (customer != null && task.id.startsWith('calendar-demo-')) {
      final agenda = CalendarAgendaData(
        context,
        today: DateUtils.dateOnly(DateTime.now()),
      );
      final ids = {task.id, ...otherTasks.map((n) => n.id)};
      for (final event in agenda.events) {
        if (event.customer?.id != customer.id ||
            event.completed ||
            !event.assignedToMe ||
            event.kind != AgendaKind.followUp ||
            !ids.add(event.id))
          continue;
        otherTasks.add(
          event.note ??
              CustomerNote(
                id: event.id,
                customerId: customer.id,
                type: CustomerNoteType.followUp,
                content: event.description,
                createdAt: event.at.subtract(const Duration(days: 6)),
                followUpDate: event.at,
                followUpType: event.type,
              ),
        );
      }
    }
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar(
        'Follow-up',
        actions: [
          IconButton(
            tooltip: 'Edit Follow-up',
            icon: const DetailGlyph('more'),
            onPressed: () => _taskMenu(task, service),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(14),
        children: [
          Text(
            (task.followUpType ?? 'Follow-up').toUpperCase(),
            style: const TextStyle(
              fontSize: 10,
              letterSpacing: .8,
              color: detailMuted,
            ),
          ),
          const SizedBox(height: 7),
          Text(
            task.content,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w600,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 15),
          detailCard(
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: detailPale,
                    child: primary == null
                        ? const DetailGlyph('person')
                        : Text(
                            primary.name
                                .split(' ')
                                .where((s) => s.isNotEmpty)
                                .take(2)
                                .map((s) => s[0])
                                .join(),
                            style: const TextStyle(
                              fontSize: 13,
                              color: detailGreen,
                            ),
                          ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          customer?.businessName ?? 'No customer',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          primary == null
                              ? 'Customer contact'
                              : '${primary.name}${primary.jobTitle.isEmpty ? '' : ' · ${primary.jobTitle}'}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: detailMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  detailAction(
                    primary?.name.split(' ').first ?? 'Call',
                    'phone',
                    customer == null ? null : () => _taskCall(customer),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (payment)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: detailCard(
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        RegExp(r'INV-[0-9]+')
                                .firstMatch(task.content)
                                ?.group(0) ??
                            'Payment follow-up',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 9),
                      Row(
                        children: [
                          Expanded(
                            child: detailAction(
                              'Send statement',
                              'mail',
                              () => _statementRequest(task),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: detailAction(
                              'Promise to pay',
                              'calendar',
                              task.isCompleted
                                  ? null
                                  : () => _taskReschedule(
                                      task,
                                      service,
                                      promise: true,
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          if (quotation && linked != null) ...[
            detailCard(
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${linked.number} · ${NumberFormat.currency(symbol: '\$', decimalDigits: 0).format(linked.subtotal)} excl. GST',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      'Sent · valid until ${DateFormat('d MMM').format(linked.createdAt.add(const Duration(days: 30)))}',
                      style: const TextStyle(fontSize: 11, color: detailMuted),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: detailAction(
                            'View quote',
                            'doc',
                            () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    SalesDocumentDetailScreen(document: linked),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: detailAction(
                            'Ask office to revise',
                            'mail',
                            () => _reviseTaskQuote(task, linked, service),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          if (otherTasks.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: InkWell(
                onTap: () => showDetailSheet<void>(
                  context,
                  (sheet) => Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Other tasks for ${customer?.businessName ?? 'customer'}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      for (final other in otherTasks)
                        ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(
                            other.content,
                            style: const TextStyle(fontSize: 13),
                          ),
                          trailing: const DetailGlyph('chevron', size: 15),
                          onTap: () {
                            Navigator.pop(sheet);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    service.notes.any((n) => n.id == other.id)
                                    ? FollowUpDetail(
                                        customer: customer,
                                        taskId: other.id,
                                      )
                                    : ReferenceExampleFollowUp(
                                        customer: customer,
                                        task: other,
                                      ),
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
                child: detailCard(
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        const DetailGlyph('calendar', size: 17),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${otherTasks.length} other tasks for ${customer?.businessName ?? 'customer'}',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                        const DetailGlyph('chevron', size: 14),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          detailCard(
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  for (final item in [
                    (
                      'Due',
                      task.followUpDate == null
                          ? 'No date'
                          : DateUtils.isSameDay(
                              task.followUpDate,
                              DateTime.now(),
                            )
                          ? 'Today'
                          : DateUtils.isSameDay(
                              task.followUpDate,
                              DateTime.now().add(const Duration(days: 1)),
                            )
                          ? 'Tomorrow'
                          : DateFormat('d MMM').format(task.followUpDate!),
                    ),
                    (
                      'Owner',
                      task.assignees.isEmpty
                          ? 'Unassigned'
                          : task.assignees
                                .map((u) => u.name.split(' ').first)
                                .join(', '),
                    ),
                    ('Priority', task.priority ?? 'Normal'),
                  ])
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.$1,
                            style: const TextStyle(
                              fontSize: 10,
                              color: detailMuted,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            item.$2,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
          ActivityAttachments(attachments: task.attachments),
          detailHeading('Activity', action: '${task.events.length}'),
          if (canReply) ...[
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                for (final quick
                    in payment
                        ? [
                            'Left voicemail',
                            'Promised to pay',
                            'Sent statement',
                            'Disputing invoice',
                          ]
                        : quotation
                        ? [
                            'Left voicemail',
                            'Customer reviewing',
                            'Asked for revised price',
                            'Waiting on builder',
                          ]
                        : [
                            'Called customer',
                            'Left voicemail',
                            'Visit confirmed',
                            'Waiting on customer',
                          ])
                  ActionChip(
                    label: Text(quick, style: const TextStyle(fontSize: 11)),
                    onPressed: () {
                      _comment.text = quick;
                    },
                  ),
              ],
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _comment,
              minLines: 1,
              maxLines: 4,
              textInputAction: TextInputAction.send,
              onSubmitted: (value) {
                if (value.trim().isEmpty && _commentAttachments.isEmpty) return;
                service.replyToFollowUp(
                  task.id,
                  user,
                  value,
                  attachments: _commentAttachments,
                );
                _comment.clear();
                _referenceUpdate(() => _commentAttachments = const []);
              },
              decoration: detailInput(hint: 'Add an update...').copyWith(
                suffixIcon: IconButton(
                  tooltip: 'Add attachment',
                  icon: const Icon(
                    Icons.attach_file,
                    size: 18,
                    color: detailMuted,
                  ),
                  onPressed: _taskAttachments,
                ),
              ),
            ),
            if (_commentAttachments.isNotEmpty)
              ActivityAttachments(attachments: _commentAttachments),
            ValueListenableBuilder(
              valueListenable: _comment,
              builder: (context, value, _) =>
                  value.text.trim().isEmpty && _commentAttachments.isEmpty
                  ? const SizedBox.shrink()
                  : Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed:
                            value.text.trim().isEmpty &&
                                _commentAttachments.isEmpty
                            ? null
                            : () {
                                service.replyToFollowUp(
                                  task.id,
                                  user,
                                  value.text,
                                  attachments: _commentAttachments,
                                );
                                _comment.clear();
                                _commentAttachments = const [];
                              },
                        child: const Text('Add update'),
                      ),
                    ),
            ),
          ],
          for (final event in task.events.reversed)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 11),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const DetailGlyph('clock', size: 15, color: detailMuted),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          event.action == 'Reply'
                              ? event.author
                              : 'Task ${event.action}',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          event.action == 'Reply'
                              ? event.message ?? 'Update'
                              : '${event.author}${event.message != null ? ' · ${event.message}' : ''}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: detailMuted,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          DateFormat('d MMM · h:mm a').format(event.at),
                          style: const TextStyle(
                            fontSize: 10,
                            color: detailMuted,
                          ),
                        ),
                        ActivityAttachments(attachments: event.attachments),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          if (task.events.isEmpty)
            const Text(
              'No activity yet',
              style: TextStyle(fontSize: 12, color: detailMuted),
            ),
          const SizedBox(height: 20),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Expanded(
                child: detailAction(
                  primary?.name.split(' ').first ?? 'Call',
                  'phone',
                  customer == null ? null : () => _taskCall(customer),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: detailAction(
                  'Reschedule',
                  'clock',
                  task.isCompleted
                      ? null
                      : () => _taskReschedule(task, service),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: detailAction(
                  task.isCompleted ? 'Completed' : 'Done',
                  'check',
                  task.isCompleted ? null : () => _taskDone(task, service),
                  filled: true,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _taskAttachments() => showDetailSheet<void>(
    context,
    (sheet) => StatefulBuilder(
      builder: (sheet, update) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Attachments',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          ActivityAttachments(
            attachments: _commentAttachments,
            onChanged: (files) {
              _referenceUpdate(() => _commentAttachments = files);
              update(() {});
            },
          ),
        ],
      ),
    ),
  );

  Future<void> _reviseTaskQuote(
    CustomerNote task,
    SalesDocument document,
    CustomerNoteService service,
  ) async {
    final user = context.read<AppSession>().currentUser;
    try {
      await LocalSalesRequestStore.append(user.id, {
        'kind': 'Quote',
        'customerId': task.customerId,
        'customer': widget.customer?.businessName ?? '',
        'document': document.number,
        'note': 'Asked office to revise the quote',
        'type': 'Revision',
      });
      if (!mounted) return;
      service.replyToFollowUp(
        task.id,
        user,
        'Asked office to revise the quote',
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Quote revision request saved.')),
      );
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not save the request. Try again.'),
          ),
        );
    }
  }

  Future<void> _taskCall(Customer customer) async {
    final contacts = _taskContacts(customer);
    final options = <(String, String, String)>[
      for (final c in contacts)
        if (c.phone.trim().isNotEmpty)
          (c.name, c.isPrimary ? 'Primary contact' : c.jobTitle, c.phone),
      if (customer.companyPhone.trim().isNotEmpty)
        ('Company line', 'Office', customer.companyPhone),
    ];
    if (options.isEmpty) return;
    Future<bool> call(String number) => launchUrl(
      Uri(scheme: 'tel', path: number.replaceAll(RegExp(r'[^0-9+]'), '')),
    );
    if (options.length == 1) {
      await call(options.single.$3);
      return;
    }
    await showDetailSheet<void>(
      context,
      (sheet) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Call ${customer.businessName}',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          for (final option in options)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: detailCard(
                ListTile(
                  leading: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: detailPale,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const DetailGlyph('phone', size: 20),
                  ),
                  title: Text(
                    option.$1,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    '${option.$2} · ${option.$3}',
                    style: const TextStyle(fontSize: 11, color: detailMuted),
                  ),
                  trailing: const DetailGlyph('chevron', size: 14),
                  onTap: () {
                    Navigator.pop(sheet);
                    call(option.$3);
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }

  Future<void> _taskMenu(CustomerNote task, CustomerNoteService service) async {
    await showDetailSheet<void>(
      context,
      (sheet) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Follow-up options',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          ListTile(
            leading: const DetailGlyph('doc'),
            title: const Text('Edit follow-up'),
            onTap: () {
              Navigator.pop(sheet);
              _openActivity<bool>(
                context,
                service,
                AddFollowUpScreen(customer: widget.customer, existing: task),
              );
            },
          ),
          if (!task.isCompleted)
            ListTile(
              leading: const DetailGlyph('clock'),
              title: const Text('Mark in progress'),
              onTap: () {
                service.setFollowUpStatus(
                  task.id,
                  FollowUpStatus.inProgress,
                  actor: context.read<AppSession>().currentUser,
                );
                Navigator.pop(sheet);
              },
            ),
          detailAction('Close', 'check', () => Navigator.pop(sheet)),
        ],
      ),
    );
  }

  Future<void> _taskReschedule(
    CustomerNote task,
    CustomerNoteService service, {
    bool promise = false,
  }) async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    DateTime chosen =
        task.followUpDate != null && task.followUpDate!.isAfter(today)
        ? task.followUpDate!
        : today;
    final next = await pickSalesDate(
      context: context,
      initialDate: chosen,
      firstDate: today,
      lastDate: today.add(const Duration(days: 730)),
      helpText: promise ? 'Customer will pay on' : 'Move to',
    );
    if (next == null || !mounted) return;
    service.addFollowUp(
      customerId: task.customerId,
      existingId: task.id,
      actor: context.read<AppSession>().currentUser,
      content: task.content,
      attachments: task.attachments,
      followUpDate: next,
      followUpType: task.followUpType,
      assignees: task.assignees,
      priority: task.priority,
      reminder: task.reminder,
      reminderDate: task.reminderDate,
    );
    await saveNextSalesFollowUpStates(context, service: service);
    if (!mounted) return;
    final actor = context.read<AppSession>().currentUser;
    if (promise && task.canReply(actor)) {
      service.replyToFollowUp(
        task.id,
        actor,
        'Promised to pay on ${DateFormat('d MMM yyyy').format(next)}',
      );
    }
  }

  Future<void> _statementRequest(CustomerNote task) async {
    final user = context.read<AppSession>().currentUser;
    final customer = widget.customer;
    final yes = await showDetailSheet<bool>(
      context,
      (sheet) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Request statement',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),
          Text(
            'Ask the office for a statement for ${customer?.businessName ?? 'this customer'}.',
            style: const TextStyle(fontSize: 13, color: detailMuted),
          ),
          const SizedBox(height: 16),
          detailAction(
            'Save request',
            'mail',
            () => Navigator.pop(sheet, true),
            filled: true,
          ),
        ],
      ),
    );
    if (yes != true || !mounted) return;
    await LocalSalesRequestStore.append(user.id, {
      'kind': 'Statement',
      'customer': customer?.businessName ?? '',
      'customerId': task.customerId,
      'note': task.content,
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Statement request saved locally. Office connection is required to send it.',
          ),
        ),
      );
    }
  }

  Future<void> _taskDone(CustomerNote task, CustomerNoteService service) async {
    final result = await chooseTaskCompletion(
      context,
      customerName: widget.customer?.businessName ?? 'General task',
      description: task.content,
      type: task.followUpType ?? 'Follow-up',
    );
    if (result == null || !mounted) return;
    service.setFollowUpStatus(
      task.id,
      FollowUpStatus.completed,
      actor: context.read<AppSession>().currentUser,
      result: result.outcome,
    );
    await saveNextSalesFollowUpStates(context, service: service);
    if (!mounted) return;
    await createNextSalesFollowUp(
      context,
      result,
      customerId: task.customerId,
      content: task.content,
      type: task.followUpType ?? 'Follow-up',
    );
  }
}

class ReferenceExampleFollowUp extends StatelessWidget {
  const ReferenceExampleFollowUp({
    super.key,
    required this.task,
    this.customer,
  });
  final CustomerNote task;
  final Customer? customer;
  static final Map<String, CustomerNoteService> _examples = {};
  @override
  Widget build(BuildContext context) {
    final user = context.read<AppSession>().currentUser;
    final service = _examples.putIfAbsent(
      '${user.id}-${task.id}-${task.customerId}-${task.content}',
      () {
        final owned = CustomerNote(
          id: task.id,
          customerId: task.customerId,
          type: CustomerNoteType.followUp,
          content: task.content,
          createdAt: task.createdAt,
          followUpDate: task.followUpDate,
          followUpStatus: task.followUpStatus ?? FollowUpStatus.pending,
          followUpType: task.followUpType == 'Quote'
              ? 'Quotation / Order Follow-up'
              : task.followUpType == 'Payment'
              ? 'Payment Follow-up'
              : task.followUpType == 'Swatches'
              ? 'Swatch Delivery'
              : task.followUpType,
          creatorId: user.id,
          authorName: user.name,
          assignees: [user],
          priority:
              task.priority ??
              (task.content.contains('QT-1003') ? 'High' : 'Normal'),
          reminder: task.reminder,
          events: task.events.isNotEmpty || !task.content.contains('QT-1003')
              ? task.events
              : [
                  (
                    author: user.name,
                    action: 'Created',
                    message: 'Created this follow-up.',
                    at: DateTime(
                      task.createdAt.year,
                      task.createdAt.month,
                      task.createdAt.day,
                      9,
                      44,
                    ),
                    attachments: const <ActivityAttachment>[],
                  ),
                  (
                    author: user.name,
                    action: 'Assigned',
                    message: 'Assigned to ${user.name}.',
                    at: DateTime(
                      task.createdAt.year,
                      task.createdAt.month,
                      task.createdAt.day,
                      9,
                      45,
                    ),
                    attachments: const <ActivityAttachment>[],
                  ),
                  (
                    author: user.name,
                    action: 'Reply',
                    message: 'Left voicemail',
                    at: DateTime(
                      task.createdAt.year,
                      task.createdAt.month,
                      task.createdAt.day + 2,
                      10,
                      12,
                    ),
                    attachments: const <ActivityAttachment>[],
                  ),
                ],
        );
        final state = CustomerNoteService(initialNotes: [owned]);
        if (task.id.startsWith('calendar-demo-')) {
          state.addListener(() async {
            final note = state.notes.first;
            final prefs = await SharedPreferences.getInstance();
            final key = 'calendar-agenda-${user.id}';
            final data = Map<String, dynamic>.from(
              jsonDecode(prefs.getString(key) ?? '{}') as Map,
            );
            final completed = Map<String, dynamic>.from(
              data['completed'] ?? {},
            );
            completed[task.id] = note.isCompleted;
            data['completed'] = completed;
            final dates = Map<String, dynamic>.from(data['dates'] ?? {});
            if (note.followUpDate != null) {
              dates[task.id] = note.followUpDate!.toIso8601String();
            }
            data['dates'] = dates;
            await prefs.setString(key, jsonEncode(data));
          });
        }
        return state;
      },
    );
    return ChangeNotifierProvider.value(
      value: service,
      child: FollowUpDetail(customer: customer, taskId: task.id),
    );
  }
}
