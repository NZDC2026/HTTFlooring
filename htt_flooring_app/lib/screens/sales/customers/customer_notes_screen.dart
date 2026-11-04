import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../models/app_user.dart';
import '../../../models/customer.dart';
import '../../../models/customer_note.dart';
import '../../../models/sales_user.dart';
import '../../../services/customer_note_service.dart';
import '../../../services/app_session.dart';
import '../../../theme/app_theme.dart';

enum _ActivityFilter { all, notes, followUps, completed }

class CustomerNotesScreen extends StatefulWidget {
  final Customer customer;

  const CustomerNotesScreen({super.key, required this.customer});

  @override
  State<CustomerNotesScreen> createState() => _CustomerNotesScreenState();
}

class _CustomerNotesScreenState extends State<CustomerNotesScreen> {
  _ActivityFilter _filter = _ActivityFilter.all;
  bool _showSearch = false;
  bool _showDemo = false;
  late final _demoService = CustomerNoteService(
    initialNotes: [
      _demoActivity(
        'samples',
        'Deliver Heritage sample board',
        days: 2,
        status: FollowUpStatus.pending,
      ),
      _demoActivity(
        'colours',
        'Customer interested in the new MTF colours',
        days: 0,
      ),
      _demoActivity(
        'quote',
        'Discussed the showroom quote and delivery options',
        days: -1,
      ),
      _demoActivity(
        'call',
        'Follow up on outstanding invoice INV-10548 (AUD 8,750).',
        days: -3,
        status: FollowUpStatus.completed,
      ),
    ],
  );

  CustomerNote _demoActivity(
    String id,
    String content, {
    required int days,
    FollowUpStatus? status,
  }) {
    final now = DateTime.now();
    final date = now.add(Duration(days: days));
    final completed = status == FollowUpStatus.completed;
    final created = completed ? date.subtract(const Duration(days: 1)) : now;
    final history = <TaskEvent>[
      if (status != null) ...[
        (
          author: 'James Wilson',
          action: 'Created',
          message: 'Created this follow-up.',
          at: created,
        ),
        (
          author: 'James Wilson',
          action: 'Assigned',
          message: completed
              ? 'Assigned to Li Wei.'
              : 'Assigned to James Wilson.',
          at: created.add(const Duration(minutes: 15)),
        ),
      ],
      if (completed) ...[
        (
          author: 'Li Wei',
          action: 'Reply',
          message: 'The customer confirmed payment for tomorrow.',
          at: created.add(const Duration(hours: 1)),
        ),
        (
          author: 'James Wilson',
          action: 'Reply',
          message: 'Thanks. Please confirm once payment is received.',
          at: created.add(const Duration(hours: 2)),
        ),
        (
          author: 'Li Wei',
          action: 'Completed',
          message: 'Payment received and verified. INV-10548 settled.',
          at: date,
        ),
      ],
    ];
    return CustomerNote(
      id: 'demo-$id',
      customerId: widget.customer.id,
      type: status == null ? CustomerNoteType.note : CustomerNoteType.followUp,
      content: content,
      createdAt: status == null ? date : created,
      followUpDate: status == null ? null : date,
      followUpStatus: status,
      followUpType: status == null
          ? null
          : (completed ? 'Payment Follow-up' : 'Sample Delivery'),
      events: history,
      creatorId: status == null ? null : AppSession.jamesWilson.id,
      assignees: status == null
          ? const []
          : [completed ? AppSession.liWei : AppSession.jamesWilson],
    );
  }

  String _query = '';

  void _selectSummary(_ActivityFilter filter) {
    setState(() {
      _filter = filter;
      _query = '';
      _showSearch = false;
    });
  }

  @override
  void dispose() {
    _demoService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final customer = widget.customer;
    final savedService = context.watch<CustomerNoteService>();
    final service = _showDemo ? _demoService : savedService;
    return ListenableBuilder(
      listenable: service,
      builder: (context, _) => _buildActivities(context, customer, service),
    );
  }

  Widget _buildActivities(
    BuildContext context,
    Customer customer,
    CustomerNoteService service,
  ) {
    final activities = service.getCustomerNotes(customer.id);
    final notes = activities.where((note) => !note.isFollowUp).toList();
    final open = activities
        .where((note) => note.isFollowUp && !note.isCompleted)
        .toList();
    final completed = activities
        .where((note) => note.isFollowUp && note.isCompleted)
        .toList();
    final dueDates =
        open.map((note) => note.followUpDate).whereType<DateTime>().toList()
          ..sort();
    final nextDue = dueDates.firstOrNull;
    final visible = switch (_filter) {
      _ActivityFilter.all => activities,
      _ActivityFilter.notes => notes,
      _ActivityFilter.followUps => open,
      _ActivityFilter.completed => completed,
    };
    final results = visible
        .where((note) => note.content.toLowerCase().contains(_query))
        .toList();
    final counts = {
      _ActivityFilter.all: ('All', activities.length),
      _ActivityFilter.notes: ('Notes', notes.length),
      _ActivityFilter.followUps: ('Follow-ups', open.length),
      _ActivityFilter.completed: ('Completed', completed.length),
    };
    final showingCompleted = _filter == _ActivityFilter.completed;

    return Scaffold(
      appBar: AppBar(title: const Text('Customer Activities')),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 12),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => _openActivity<void>(
                    context,
                    service,
                    _AddNoteScreen(customer: customer),
                  ),
                  child: const Text('Add Note'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: FilledButton(
                  onPressed: () => _openActivity<bool>(
                    context,
                    service,
                    _AddFollowUpScreen(customer: customer),
                  ),
                  child: const Text('Add Follow-up'),
                ),
              ),
            ],
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          _ActivityCustomerHeader(customer: customer),
          const SizedBox(height: 16),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Demo activities'),
            subtitle: const Text('Changes here only affect demo records'),
            value: _showDemo,
            onChanged: (value) => setState(() => _showDemo = value),
          ),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.event_outlined, color: AppColors.copper),
            title: const Text('Next Follow-up'),
            onTap: () => _selectSummary(_ActivityFilter.followUps),
            subtitle: Text(
              nextDue == null
                  ? 'None scheduled'
                  : DateFormat('dd MMM yyyy').format(nextDue),
            ),
            trailing: Text('${open.length} Open'),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _SummaryCard(
                  label: 'Notes',
                  value: '${notes.length}',
                  onTap: () => _selectSummary(_ActivityFilter.notes),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _SummaryCard(
                  label: 'Open Follow-ups',
                  onTap: () => _selectSummary(_ActivityFilter.followUps),
                  value: '${open.length}',
                  warning: open.isNotEmpty,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _SummaryCard(
                  label: 'Completed',
                  onTap: () => _selectSummary(_ActivityFilter.completed),
                  value: '${completed.length}',
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Text(
                  showingCompleted
                      ? 'Completed Follow-ups'
                      : 'Activity Timeline',
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              IconButton(
                tooltip: _showSearch ? 'Close search' : 'Search activities',
                icon: Icon(_showSearch ? Icons.close : Icons.search),
                onPressed: () => setState(() {
                  _showSearch = !_showSearch;
                  _query = '';
                }),
              ),
            ],
          ),
          if (_showSearch)
            TextField(
              autofocus: true,
              decoration: const InputDecoration(
                hintText: 'Search activities...',
              ),
              onChanged: (value) =>
                  setState(() => _query = value.trim().toLowerCase()),
            ),
          for (final filters in const [
            [_ActivityFilter.all, _ActivityFilter.notes],
            [_ActivityFilter.followUps, _ActivityFilter.completed],
          ])
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Row(
                children: [
                  for (final filter in filters) ...[
                    if (filter != filters.first) const SizedBox(width: 8),
                    Expanded(
                      child: ChoiceChip(
                        label: Center(
                          child: Text(
                            '${counts[filter]!.$1} (${counts[filter]!.$2})',
                            textAlign: TextAlign.center,
                          ),
                        ),
                        showCheckmark: false,
                        selectedColor: AppColors.green,
                        backgroundColor: AppColors.card,
                        labelStyle: TextStyle(
                          color: _filter == filter
                              ? Colors.white
                              : AppColors.text,
                        ),
                        selected: _filter == filter,
                        onSelected: (_) => setState(() => _filter = filter),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          const SizedBox(height: 12),
          if (results.isEmpty)
            _EmptyState(
              message: _query.isNotEmpty
                  ? 'No matching activities'
                  : showingCompleted
                  ? 'No completed follow-ups'
                  : 'No activities yet',
            ),
          for (final note in results)
            if (showingCompleted)
              _NoteCard(
                key: ValueKey(note.id),
                customer: customer,
                note: note,
                service: service,
              )
            else
              Row(
                key: ValueKey(note.id),
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 54,
                    child: Padding(
                      padding: const EdgeInsets.only(top: 12, right: 6),
                      child: Text(
                        DateFormat('d MMM\nyyyy')
                            .format(note.followUpDate ?? note.createdAt),
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 11,
                        ),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 14, right: 8),
                    child: Icon(
                      Icons.circle,
                      size: 8,
                      color: note.isFollowUp
                          ? AppColors.copper
                          : AppColors.green,
                    ),
                  ),
                  Expanded(
                    child: _NoteCard(
                      customer: customer,
                      note: note,
                      service: service,
                    ),
                  ),
                ],
              ),
        ],
      ),
    );
  }
}

Future<T?> _openActivity<T>(
  BuildContext context,
  CustomerNoteService service,
  Widget screen,
) {
  return Navigator.of(context).push<T>(
    MaterialPageRoute(
      builder: (_) =>
          ChangeNotifierProvider.value(value: service, child: screen),
    ),
  );
}

class _AddNoteScreen extends StatefulWidget {
  const _AddNoteScreen({required this.customer, this.existing});

  final CustomerNote? existing;

  final Customer customer;

  @override
  State<_AddNoteScreen> createState() => _AddNoteScreenState();
}

class _AddNoteScreenState extends State<_AddNoteScreen> {
  static const _noteTypes = [
    'Customer Visit',
    'Sales Discussion',
    'Product Feedback',
    'Customer Feedback',
    'Inspection',
    'General Note',
  ];

  final _formKey = GlobalKey<FormState>();
  late final _controller = TextEditingController(
    text: widget.existing?.content,
  );
  late String _noteType = _noteTypes.contains(widget.existing?.noteType)
      ? widget.existing!.noteType!
      : 'General Note';

  Future<void> _convert() async {
    if (!_formKey.currentState!.validate()) return;
    final saved = await _openActivity<bool>(
      context,
      context.read<CustomerNoteService>(),
      _AddFollowUpScreen(
        customer: widget.customer,
        existing: widget.existing!.copyWith(content: _controller.text),
      ),
    );
    if (saved == true && mounted) Navigator.pop(context);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _save() {
    if (!_formKey.currentState!.validate()) return;
    context.read<CustomerNoteService>().addNote(
      existingId: widget.existing?.id,
      customerId: widget.customer.id,
      content: _controller.text,
      noteType: _noteType,
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.card,
      appBar: AppBar(
        title: Text(widget.existing == null ? 'Add Note' : 'Note Detail'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            _ActivityCustomerHeader(customer: widget.customer),
            const SizedBox(height: 12),
            const Divider(color: AppColors.border),
            const SizedBox(height: 12),
            const Text('Note Type *'),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              initialValue: _noteType,
              isExpanded: true,
              decoration: const InputDecoration(),
              items: [
                for (final type in _noteTypes)
                  DropdownMenuItem(value: type, child: Text(type)),
              ],
              onChanged: (value) => setState(() => _noteType = value!),
            ),
            const SizedBox(height: 16),
            const Text('Note *'),
            const SizedBox(height: 6),
            TextFormField(
              controller: _controller,
              minLines: 4,
              maxLines: 8,
              textCapitalization: TextCapitalization.sentences,
              decoration: const InputDecoration(
                hintText: 'Enter customer conversation or activity...',
              ),
              validator: (value) =>
                  value == null || value.trim().isEmpty ? 'Enter a note' : null,
            ),
            if (widget.existing != null) ...[
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: _convert,
                icon: const Icon(Icons.task_alt),
                label: const Text('Convert to Follow-up Task'),
              ),
            ],
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 12),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: FilledButton.icon(
                  onPressed: _save,
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text('Save Note'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActivityCustomerHeader extends StatelessWidget {
  const _ActivityCustomerHeader({required this.customer});

  final Customer customer;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          backgroundColor: AppColors.copper,
          foregroundColor: Colors.white,
          child: Text(
            customer.businessName
                .trim()
                .split(RegExp(r'\s+'))
                .where((word) => word.isNotEmpty)
                .take(2)
                .map((word) => word.characters.first.toUpperCase())
                .join(),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                customer.businessName,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              Text(
                '${customer.type} · ${customer.region.label}',
                style: const TextStyle(color: AppColors.muted),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AddFollowUpScreen extends StatefulWidget {
  const _AddFollowUpScreen({required this.customer, this.existing});

  final CustomerNote? existing;

  final Customer customer;

  @override
  State<_AddFollowUpScreen> createState() => _AddFollowUpScreenState();
}

class _AddFollowUpScreenState extends State<_AddFollowUpScreen> {
  final _formKey = GlobalKey<FormState>();
  late final _description = TextEditingController(
    text: widget.existing?.content,
  );
  late String? _type = widget.existing?.followUpType;
  late String _priority = widget.existing?.priority ?? 'Normal';
  static const _customReminder = 'Custom date';
  late String _reminder = widget.existing?.reminder ?? '1 day before';
  late DateTime? _reminderDate = widget.existing?.reminderDate;
  late DateTime _dueDate =
      widget.existing?.followUpDate ??
      DateUtils.dateOnly(DateTime.now().add(const Duration(days: 1)));

  @override
  void dispose() {
    _description.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final today = DateUtils.dateOnly(DateTime.now());
    final date = await showDatePicker(
      context: context,
      initialDate: _dueDate.isBefore(today) ? today : _dueDate,
      firstDate: today,
      lastDate: DateTime(today.year + 2, today.month, today.day),
    );
    if (date != null && mounted) {
      setState(() {
        _dueDate = date;
        if (_reminderDate?.isAfter(date) ?? false) {
          _reminderDate = date;
        }
      });
    }
  }

  Future<void> _selectReminderDate() async {
    final today = DateUtils.dateOnly(DateTime.now());
    final lastDate = _dueDate.isBefore(today) ? today : _dueDate;
    final selected = _reminderDate ?? lastDate;
    final date = await showDatePicker(
      context: context,
      initialDate: selected.isBefore(today) ? today : selected,
      firstDate: today,
      lastDate: lastDate,
    );
    if (date != null && mounted) {
      setState(() {
        _reminderDate = date;
        if (_dueDate.isBefore(date)) _dueDate = date;
      });
    }
  }

  Future<List<AppUser>?> _pickAssignees(List<AppUser> current) {
    final employees = [AppSession.jamesWilson, AppSession.liWei];
    final selectedIds = current.map((user) => user.id).toSet();
    return showDialog<List<AppUser>>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Assign To'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final employee in employees)
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(employee.name),
                  subtitle: Text(employee.roleLabel),
                  value: selectedIds.contains(employee.id),
                  onChanged: (checked) => setDialogState(() {
                    if (checked == true) {
                      selectedIds.add(employee.id);
                    } else {
                      selectedIds.remove(employee.id);
                    }
                  }),
                ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.pop(dialogContext, [
                for (final employee in employees)
                  if (selectedIds.contains(employee.id)) employee,
              ]),
              child: const Text('Done'),
            ),
          ],
        ),
      ),
    );
  }

  final _assigneesKey = GlobalKey<FormFieldState<List<AppUser>>>();

  void _save() {
    if (!_formKey.currentState!.validate()) return;
    context.read<CustomerNoteService>().addFollowUp(
      existingId: widget.existing?.id,
      actor: context.read<AppSession>().currentUser,
      customerId: widget.customer.id,
      content: _description.text,
      followUpDate: _dueDate,
      followUpType: _type,
      assignees: _assigneesKey.currentState!.value!,
      priority: _priority,
      reminder: _reminder,
      reminderDate: _reminder == _customReminder
          ? _reminderDate ?? _dueDate
          : null,
    );
    Navigator.pop(context, true);
  }

  Future<void> _recordMessage(
    CustomerNote task,
    AppUser author, {
    bool completing = false,
  }) async {
    var message = '';
    final replyForm = GlobalKey<FormState>();
    final reply = await showDialog<String>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text(completing ? 'Completion Note' : 'Reply to Follow-up'),
        content: Form(
          key: replyForm,
          child: TextFormField(
            autofocus: true,
            minLines: 2,
            maxLines: 5,
            onChanged: (value) => message = value,
            validator: (value) => (value ?? '').trim().isEmpty
                ? (completing ? 'Enter the outcome' : 'Enter a reply')
                : null,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              if (replyForm.currentState!.validate()) {
                Navigator.pop(dialogContext, message);
              }
            },
            child: Text(completing ? 'Mark Completed' : 'Send Reply'),
          ),
        ],
      ),
    );
    if (!mounted || reply == null) return;
    final service = context.read<CustomerNoteService>();
    if (completing) {
      service.setFollowUpStatus(
        task.id,
        FollowUpStatus.completed,
        actor: author,
        result: reply,
      );
    } else {
      service.replyToFollowUp(task.id, author, reply);
    }
  }

  Widget _field(String label, Widget control, {bool required = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text.rich(
          TextSpan(
            text: label,
            children: [
              if (required)
                const TextSpan(
                  text: ' *',
                  style: TextStyle(color: AppColors.copper),
                ),
            ],
          ),
        ),
        const SizedBox(height: 6),
        control,
      ],
    );
  }

  InputDecoration _decoration(IconData icon) => InputDecoration(
    prefixIcon: Icon(icon, size: 19, color: AppColors.copper),
    prefixIconConstraints: const BoxConstraints(minWidth: 36),
    contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
    isDense: true,
  );

  Widget _select({
    required String label,
    required IconData icon,
    required List<String> options,
    required String? value,
    required ValueChanged<String?>? onChanged,
    bool required = false,
  }) {
    return _field(
      label,
      DropdownButtonFormField<String>(
        initialValue: value,
        decoration: _decoration(icon),
        isExpanded: true,
        hint: const Text('Select type'),
        style: Theme.of(context).textTheme.bodyMedium,
        items: [
          for (final option in options)
            DropdownMenuItem(
              value: option,
              child: Text(option, overflow: TextOverflow.ellipsis),
            ),
        ],
        validator: required
            ? (value) => value == null ? 'Required' : null
            : null,
        onChanged: onChanged,
      ),
      required: required,
    );
  }

  Widget _pair(Widget first, Widget second) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: first),
        const SizedBox(width: 12),
        Expanded(child: second),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = context.watch<AppSession>().currentUser;
    final service = context.watch<CustomerNoteService>();
    final task = service.notes
        .where((note) => note.id == widget.existing?.id && note.isFollowUp)
        .firstOrNull;
    final canReply = task?.canReply(currentUser) ?? false;
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: AppColors.card,
      appBar: AppBar(
        title: Text(task == null ? 'Add Follow-up' : 'Edit Follow-up'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            _ActivityCustomerHeader(customer: widget.customer),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.copperLight.withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.event_available_outlined,
                    size: 36,
                    color: AppColors.copper,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          task == null
                              ? 'Add a Follow-up'
                              : 'Follow-up details',
                          style: theme.textTheme.titleMedium,
                        ),
                        const Text(
                          'Create a task or action item for this customer, with a responsible person and due date.',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _select(
              label: 'Follow-up Type',
              icon: Icons.event_available_outlined,
              options: const [
                'Sample Delivery',
                'Quotation / Order Follow-up',
                'Payment Follow-up',
                'Product Enquiry',
                'Customer Complaint',
                'Other',
              ],
              value: _type,
              onChanged: (value) => setState(() => _type = value),
              required: true,
            ),
            const SizedBox(height: 12),
            _field(
              'Description',
              TextFormField(
                controller: _description,
                minLines: 3,
                maxLines: 5,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(
                  hintText: 'What needs to be followed up?',
                ),
                validator: (value) => value == null || value.trim().isEmpty
                    ? 'Enter a description'
                    : null,
              ),
              required: true,
            ),
            const SizedBox(height: 12),
            _pair(
              _field(
                'Assign To',
                FormField<List<AppUser>>(
                  key: _assigneesKey,
                  initialValue: widget.existing?.isFollowUp == true
                      ? widget.existing!.assignees
                      : [currentUser],
                  validator: (users) => users == null || users.isEmpty
                      ? 'Select at least one person'
                      : null,
                  builder: (field) {
                    final selected = field.value ?? const <AppUser>[];
                    return InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: () async {
                        final result = await _pickAssignees(selected);
                        if (result != null && field.mounted) {
                          field.didChange(result);
                        }
                      },
                      child: InputDecorator(
                        decoration: _decoration(Icons.person_outline).copyWith(
                          errorText: field.errorText,
                          suffixIcon: const Icon(Icons.expand_more, size: 18),
                          suffixIconConstraints: const BoxConstraints(
                            minWidth: 24,
                          ),
                        ),
                        child: Text(
                          selected.isEmpty
                              ? 'Select people'
                              : selected.map((user) => user.name).join(', '),
                        ),
                      ),
                    );
                  },
                ),
                required: true,
              ),
              _field(
                'Due Date',
                InkWell(
                  onTap: _selectDate,
                  borderRadius: BorderRadius.circular(10),
                  child: InputDecorator(
                    decoration: _decoration(Icons.calendar_today_outlined)
                        .copyWith(
                          suffixIcon: const Icon(Icons.expand_more, size: 18),
                          suffixIconConstraints: const BoxConstraints(
                            minWidth: 24,
                          ),
                        ),
                    child: Text(
                      DateFormat('d MMM yyyy').format(_dueDate),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                required: true,
              ),
            ),
            const SizedBox(height: 12),
            _pair(
              _select(
                label: 'Priority',
                icon: Icons.flag_outlined,
                options: const ['Low', 'Normal', 'High'],
                value: _priority,
                onChanged: (value) => setState(() => _priority = value!),
              ),
              _select(
                label: 'Reminder',
                icon: Icons.notifications_none,
                options: const [
                  'None',
                  'On due date',
                  '1 day before',
                  '1 week before',
                  _customReminder,
                ],
                value: _reminder,
                onChanged: (value) => setState(() => _reminder = value!),
              ),
            ),
            if (_reminder == _customReminder) ...[
              const SizedBox(height: 12),
              _field(
                'Reminder Date',
                OutlinedButton.icon(
                  onPressed: _selectReminderDate,
                  icon: const Icon(Icons.calendar_today_outlined, size: 18),
                  label: Text(
                    DateFormat('d MMM yyyy').format(_reminderDate ?? _dueDate),
                  ),
                ),
              ),
            ],
            if (task != null) ...[
              const SizedBox(height: 20),
              Text('Task Activity', style: theme.textTheme.titleMedium),
              for (final event in task.events)
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text('${event.action} (${event.author})'),
                  subtitle: Text(
                    [
                      ?event.message,
                      DateFormat('d MMM yyyy · h:mm a').format(event.at),
                    ].join('\n'),
                  ),
                ),
              if (canReply)
                OutlinedButton.icon(
                  onPressed: () => _recordMessage(task, currentUser),
                  icon: const Icon(Icons.reply),
                  label: const Text('Reply'),
                ),
              if (!task.isCompleted)
                OutlinedButton(
                  onPressed: () => service.setFollowUpStatus(
                    task.id,
                    task.followUpStatus == FollowUpStatus.inProgress
                        ? FollowUpStatus.pending
                        : FollowUpStatus.inProgress,
                    actor: currentUser,
                  ),
                  child: Text(
                    task.followUpStatus == FollowUpStatus.inProgress
                        ? 'Mark Pending'
                        : 'Mark In Progress',
                  ),
                ),
              TextButton(
                onPressed: task.isCompleted
                    ? () => service.setFollowUpStatus(
                        task.id,
                        FollowUpStatus.pending,
                        actor: currentUser,
                      )
                    : () => _recordMessage(task, currentUser, completing: true),
                child: Text(task.isCompleted ? 'Reopen' : 'Mark Completed'),
              ),
            ],
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 12),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: FilledButton.icon(
                  onPressed: _save,
                  icon: const Icon(Icons.check, size: 18),
                  label: Text(
                    task == null ? 'Create Follow-up' : 'Save Follow-up',
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FollowUpDetail extends StatefulWidget {
  const _FollowUpDetail({required this.customer, required this.taskId});

  final Customer customer;
  final String taskId;

  @override
  State<_FollowUpDetail> createState() => _FollowUpDetailState();
}

class _FollowUpDetailState extends State<_FollowUpDetail> {
  final _comment = TextEditingController();

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final service = context.watch<CustomerNoteService>();
    final user = context.watch<AppSession>().currentUser;
    final task = service
        .getCustomerNotes(widget.customer.id)
        .where((note) => note.id == widget.taskId && note.isFollowUp)
        .firstOrNull;
    final theme = Theme.of(context);
    if (task == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Follow-up Detail')),
        body: const Center(child: Text('Follow-up no longer available')),
      );
    }
    final status = switch (task.followUpStatus) {
      FollowUpStatus.completed => 'Completed',
      FollowUpStatus.inProgress => 'In Progress',
      _ => 'Pending',
    };
    final commentCount = task.events
        .where((event) => event.action == 'Reply')
        .length;
    final date = task.followUpDate;
    final due = date == null
        ? 'No date'
        : DateFormat('dd MMM yyyy').format(date);
    final assignees = task.assignees.map((user) => user.name).join(', ');
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.card,
        appBar: AppBar(
          title: const Text('Follow-up Detail'),
          actions: [
            IconButton(
              tooltip: 'Edit Follow-up',
              icon: const Icon(Icons.edit_outlined),
              onPressed: () => _openActivity<bool>(
                context,
                service,
                _AddFollowUpScreen(customer: widget.customer, existing: task),
              ),
            ),
            _DeleteButton(note: task, service: service),
          ],
        ),
        body: Column(
          children: [
            if (MediaQuery.viewInsetsOf(context).bottom == 0)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.event_available_outlined,
                          color: AppColors.copper,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            task.followUpType ?? 'Follow-up',
                            style: theme.textTheme.titleMedium,
                          ),
                        ),
                        Chip(
                          label: Text(status),
                          backgroundColor: task.isCompleted
                              ? AppColors.successLight
                              : AppColors.warningLight,
                        ),
                      ],
                    ),
                    const Divider(),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: _taskInfo('Due Date', due)),
                        Expanded(
                          child: _taskInfo(
                            'Assigned to',
                            assignees.isEmpty ? 'Unassigned' : assignees,
                          ),
                        ),
                        Expanded(
                          child: _taskInfo(
                            'Priority',
                            task.priority ?? 'Normal',
                          ),
                        ),
                      ],
                    ),
                    const Divider(),
                    Text('Description', style: theme.textTheme.titleSmall),
                    Text(
                      task.content,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            TabBar(
              tabs: [
                Tab(text: 'Activity & Comments ($commentCount)'),
                const Tab(text: 'Task Info'),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      if (task.events.isEmpty)
                        const ListTile(title: Text('No activity yet')),
                      for (final event in task.events)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SizedBox(
                                width: 49,
                                child: Padding(
                                  padding: const EdgeInsets.only(top: 12),
                                  child: Text(
                                    DateFormat('dd MMM\nh:mm a')
                                        .format(event.at),
                                    textAlign: TextAlign.center,
                                    style: theme.textTheme.labelSmall,
                                  ),
                                ),
                              ),
                              const Padding(
                                padding: EdgeInsets.fromLTRB(2, 17, 6, 0),
                                child: Icon(
                                  Icons.circle,
                                  size: 6,
                                  color: AppColors.green,
                                ),
                              ),
                              Expanded(
                                child: Card(
                                  color: event.action == 'Completed'
                                      ? AppColors.successLight
                                      : AppColors.copperLight.withValues(
                                          alpha: 0.2,
                                        ),
                                  child: ListTile(
                                    dense: true,
                                    contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                    ),
                                    leading: Icon(
                                      switch (event.action) {
                                        'Reply' => Icons.chat_bubble_outline,
                                        'Completed' =>
                                          Icons.check_circle_outline,
                                        'Assigned' || 'Reassigned' =>
                                          Icons.person_add_outlined,
                                        _ => Icons.event_note_outlined,
                                      },
                                      size: 18,
                                      color: AppColors.green,
                                    ),
                                    title: Text(
                                      '${event.action} (${event.author})',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    subtitle: event.message == null
                                        ? null
                                        : Text(event.message!),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      _taskInfo('Customer', widget.customer.businessName),
                      _taskInfo('Status', status),
                      _taskInfo(
                        'Reminder',
                        task.reminderDate != null
                            ? DateFormat('dd MMM yyyy')
                                  .format(task.reminderDate!)
                            : task.reminder ?? 'None',
                      ),
                      _taskInfo('Description', task.content),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        bottomNavigationBar: task.canReply(user)
            ? SafeArea(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(
                    12,
                    8,
                    12,
                    8 + MediaQuery.viewInsetsOf(context).bottom,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _comment,
                          maxLines: 3,
                          minLines: 1,
                          decoration: const InputDecoration(
                            hintText: 'Add a comment…',
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      ValueListenableBuilder(
                        valueListenable: _comment,
                        builder: (context, value, _) => IconButton.filled(
                          tooltip: 'Send comment',
                          onPressed: value.text.trim().isEmpty
                              ? null
                              : () {
                                  service.replyToFollowUp(
                                    task.id,
                                    user,
                                    value.text,
                                  );
                                  _comment.clear();
                                  FocusScope.of(context).unfocus();
                                },
                          icon: const Icon(Icons.send_outlined),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            : null,
      ),
    );
  }

  Widget _taskInfo(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(right: 6, bottom: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.labelSmall),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _NoteCard extends StatelessWidget {
  final CustomerNote note;

  final CustomerNoteService service;

  final Customer customer;

  const _NoteCard({
    super.key,
    required this.customer,
    required this.note,
    required this.service,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(10),
      onTap: () => _openActivity<bool>(
        context,
        service,
        note.isFollowUp
            ? _FollowUpDetail(customer: customer, taskId: note.id)
            : _AddNoteScreen(customer: customer, existing: note),
      ),
      child: note.isFollowUp ? _buildFollowUp(context) : _buildNote(context),
    );
  }

  Widget _buildNote(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.successLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.notes_outlined, color: AppColors.green),
            ),

            const SizedBox(width: 12),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          note.noteType ?? 'NOTE',
                          style: const TextStyle(
                            color: AppColors.green,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),

                      _DeleteButton(note: note, service: service),
                    ],
                  ),

                  const SizedBox(height: 5),

                  Text(note.content, style: const TextStyle(height: 1.4)),

                  const SizedBox(height: 9),

                  Text(
                    DateFormat('dd MMM yyyy · h:mm a').format(note.createdAt),
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFollowUp(BuildContext context) {
    final (label, colour, background, icon) = switch (note.followUpStatus) {
      FollowUpStatus.completed => (
        'Completed',
        AppColors.success,
        AppColors.successLight,
        Icons.check,
      ),
      _ when _isFollowUpOverdue(note) => (
        'Overdue',
        AppColors.danger,
        AppColors.dangerLight,
        Icons.schedule,
      ),
      FollowUpStatus.inProgress => (
        'In Progress',
        AppColors.warning,
        AppColors.warningLight,
        Icons.schedule,
      ),
      _ => (
        'Pending',
        AppColors.warning,
        AppColors.warningLight,
        Icons.event_outlined,
      ),
    };
    final completion = note.events
        .where((event) => event.action == 'Completed')
        .lastOrNull;
    final summary = note.isCompleted
        ? completion?.message ?? note.content
        : note.content;
    final comments = note.events
        .where((event) => event.action == 'Reply')
        .length;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 14,
            backgroundColor: background,
            foregroundColor: colour,
            child: Icon(icon, size: 16),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        note.followUpType ?? 'Follow-up',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    DecoratedBox(
                      decoration: BoxDecoration(
                        color: background,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 3,
                        ),
                        child: Text(
                          label,
                          style: TextStyle(color: colour, fontSize: 10),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  summary,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 12),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(
                      Icons.chat_bubble_outline,
                      size: 13,
                      color: AppColors.muted,
                    ),
                    const SizedBox(width: 5),
                    Expanded(
                      child: Text(
                        comments == 1 ? '1 comment' : '$comments comments',
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.muted,
                        ),
                      ),
                    ),
                    const Icon(Icons.chevron_right, size: 16),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DeleteButton extends StatelessWidget {
  final CustomerNote note;

  final CustomerNoteService service;

  const _DeleteButton({required this.note, required this.service});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      visualDensity: VisualDensity.compact,
      tooltip: 'Delete',
      icon: const Icon(Icons.delete_outline, size: 19, color: AppColors.muted),
      onPressed: () async {
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (dialogContext) {
            return AlertDialog(
              title: Text(
                note.isFollowUp ? 'Delete follow-up?' : 'Delete note?',
              ),
              content: const Text('This action cannot be undone.'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(dialogContext, false);
                  },
                  child: const Text('Cancel'),
                ),

                FilledButton(
                  onPressed: () {
                    Navigator.pop(dialogContext, true);
                  },
                  child: const Text('Delete'),
                ),
              ],
            );
          },
        );

        if (confirmed != true || !context.mounted) {
          return;
        }

        service.deleteNote(note.id);
      },
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final bool warning;
  final VoidCallback onTap;

  const _SummaryCard({
    required this.label,
    required this.value,
    this.warning = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: warning ? AppColors.warningLight : AppColors.card,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                color: AppColors.muted,
                fontSize: 9,
                fontWeight: FontWeight.w700,
              ),
            ),

            const SizedBox(height: 5),

            Text(
              value,
              style: TextStyle(
                color: warning ? AppColors.warning : AppColors.text,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          const Icon(
            Icons.sticky_note_2_outlined,
            size: 34,
            color: AppColors.muted,
          ),

          const SizedBox(height: 10),
          Text(message, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

bool _isFollowUpOverdue(CustomerNote note) {
  if (!note.isFollowUp || note.isCompleted || note.followUpDate == null) {
    return false;
  }

  final now = DateTime.now();

  final today = DateTime(now.year, now.month, now.day);

  final followUpDate = DateTime(
    note.followUpDate!.year,
    note.followUpDate!.month,
    note.followUpDate!.day,
  );

  return followUpDate.isBefore(today);
}
