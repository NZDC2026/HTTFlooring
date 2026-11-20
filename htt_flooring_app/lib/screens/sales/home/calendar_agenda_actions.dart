part of 'reminder_calendar_screen.dart';

Future<void> showSalesVisitScheduler(
  BuildContext context, {
  Customer? customer,
  DateTime? date,
}) async {
  await Navigator.push(
    context,
    MaterialPageRoute(
      builder: (_) => _CalendarVisitForm(
        initialDate: date ?? DateUtils.dateOnly(DateTime.now()),
        initialCustomer: customer,
      ),
    ),
  );
}

extension _CalendarActions on _ReminderCalendarScreenState {
  DateTime _allowedDate(DateTime day) => day.isBefore(_today) ? _today : day;
  void _pickDate() => _update(() {
    _pickerYear = _selected.year;
    _choosingMonth = !_choosingMonth;
  });

  String _dayLabel(DateTime day) => DateUtils.isSameDay(day, _today)
      ? 'Today, ${DateFormat('d MMM').format(day)}'
      : DateUtils.isSameDay(day, _today.add(const Duration(days: 1)))
      ? 'Tomorrow, ${DateFormat('d MMM').format(day)}'
      : DateFormat('EEE, d MMM').format(day);
  void _addMenu() => showGeneralDialog<void>(
    context: context,
    barrierDismissible: true,
    barrierLabel: 'Close add menu',
    barrierColor: const Color(0x66000000),
    transitionDuration: const Duration(milliseconds: 160),
    pageBuilder: (dialog, _, _) => Stack(
      children: [
        Positioned.fill(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 3, sigmaY: 3),
            child: GestureDetector(
              onTap: () => Navigator.pop(dialog),
              child: Container(color: Colors.transparent),
            ),
          ),
        ),
        Align(
          alignment: Alignment.bottomCenter,
          child: Material(
            color: Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(23)),
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 11, 20, 20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 38,
                        height: 4,
                        decoration: BoxDecoration(
                          color: const Color(0xFFD8E0DA),
                          borderRadius: BorderRadius.circular(5),
                        ),
                      ),
                    ),
                    const SizedBox(height: 15),
                    Text(
                      'Add to ${_dayLabel(_selected)}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 9),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(
                        Icons.location_on_outlined,
                        size: 19,
                        color: Color(0xFF0E8250),
                      ),
                      title: const Text(
                        'Schedule visit',
                        style: TextStyle(fontSize: 13),
                      ),
                      subtitle: const Text(
                        'Pick customer and time',
                        style: TextStyle(fontSize: 11, color: _agendaMuted),
                      ),
                      onTap: () {
                        Navigator.pop(dialog);
                        _schedule();
                      },
                    ),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(
                        Icons.add,
                        size: 20,
                        color: Color(0xFF0E8250),
                      ),
                      title: const Text(
                        'Note & Task',
                        style: TextStyle(fontSize: 13),
                      ),
                      subtitle: const Text(
                        'Pick a customer, then add a note or task',
                        style: TextStyle(fontSize: 11, color: _agendaMuted),
                      ),
                      onTap: () {
                        Navigator.pop(dialog);
                        _noteAndTask();
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    ),
  );
  Future<void> _schedule() async {
    final result = await Navigator.push<(String, int)>(
      context,
      MaterialPageRoute(
        builder: (_) =>
            _CalendarVisitForm(initialDate: _allowedDate(_selected)),
      ),
    );
    if (!mounted || result == null) return;
    _update(() => _durations[result.$1] = result.$2);
    await _save();
  }

  Future<Customer?> _pickCustomer() async {
    final rows = CustomerDirectoryData(context).rows;
    String query = '';
    return showModalBottomSheet<Customer>(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (sheet) => StatefulBuilder(
        builder: (context, update) => SafeArea(
          child: SizedBox(
            height: MediaQuery.sizeOf(context).height * .68,
            child: Padding(
              padding: EdgeInsets.fromLTRB(
                16,
                0,
                16,
                MediaQuery.viewInsetsOf(context).bottom,
              ),
              child: Column(
                children: [
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Select customer',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    onChanged: (v) => update(() => query = v),
                    decoration: const InputDecoration(
                      hintText: 'Search name or suburb',
                      prefixIcon: Icon(Icons.search, size: 18),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Expanded(
                    child: ListView(
                      children: [
                        for (final r in rows.where(
                          (r) => '${r.customer.businessName} ${r.suburb}'
                              .toLowerCase()
                              .contains(query.toLowerCase()),
                        ))
                          ListTile(
                            dense: true,
                            title: Text(
                              r.customer.businessName,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            subtitle: Text(
                              r.suburb,
                              style: const TextStyle(
                                fontSize: 11,
                                color: _agendaMuted,
                              ),
                            ),
                            onTap: () => Navigator.pop(sheet, r.customer),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _noteAndTask() async {
    final warehouse = context.read<AppSession>().currentUser.isWarehouse;
    final customer = warehouse ? null : await _pickCustomer();
    if (!mounted || (!warehouse && customer == null)) return;
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      showDragHandle: true,
      builder: (sheet) => SafeArea(
        child: Wrap(
          children: [
            if (customer != null)
              ListTile(
                title: Text(
                  customer.businessName,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ListTile(
              leading: const Icon(Icons.edit_note),
              title: const Text('Add Note'),
              onTap: () {
                Navigator.pop(sheet);
                dashboardOpen(context, AddNoteScreen(customer: customer));
              },
            ),
            ListTile(
              leading: const Icon(Icons.event_note_outlined),
              title: const Text('Add Follow-up'),
              onTap: () {
                Navigator.pop(sheet);
                _newFollowUp(customer: customer);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _newFollowUp({Customer? customer}) => dashboardOpen(
    context,
    AddFollowUpScreen(
      customer: customer,
      initialDueDate: _allowedDate(_selected),
    ),
  );
  Future<void> _launch(Uri uri) async {
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication) &&
        mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Unable to open this action on this device.'),
        ),
      );
    }
  }

  void _contactSheet(Widget Function(BuildContext) content) =>
      showGeneralDialog<void>(
        context: context,
        barrierDismissible: true,
        barrierLabel: 'Close contacts',
        barrierColor: const Color(0x66000000),
        pageBuilder: (dialog, _, _) => Stack(
          children: [
            Positioned.fill(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 3, sigmaY: 3),
                child: GestureDetector(
                  onTap: () => Navigator.pop(dialog),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),
            Align(
              alignment: Alignment.bottomCenter,
              child: Material(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(23),
                ),
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.sizeOf(dialog).height * .8,
                  ),
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const SizedBox(height: 12),
                        Container(
                          width: 38,
                          height: 4,
                          decoration: BoxDecoration(
                            color: const Color(0xFFD8E0DA),
                            borderRadius: BorderRadius.circular(5),
                          ),
                        ),
                        const SizedBox(height: 8),
                        content(dialog),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      );

  void _call(AgendaEvent e) {
    final contacts = e.customer == null
        ? []
        : context.read<CustomerService>().getContactsForCustomer(
            e.customer!.id,
          );
    _contactSheet(
      (sheet) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                title: Text(
                  'Call ${e.customerName}',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              if (contacts.isEmpty &&
                  (e.customer?.companyPhone.isEmpty ?? true))
                ListTile(
                  title: Text(e.contact.isEmpty ? 'Contact' : e.contact),
                  subtitle: const Text(
                    'No phone number recorded',
                    style: TextStyle(fontSize: 12, color: _agendaMuted),
                  ),
                ),
              for (final c in contacts)
                Container(
                  margin: const EdgeInsets.fromLTRB(8, 0, 8, 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: _agendaBorder),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x0B000000),
                        blurRadius: 3,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: ListTile(
                      leading: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: _agendaPale,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.phone_outlined,
                          size: 19,
                          color: dashboardGreen,
                        ),
                      ),
                      trailing: const Icon(
                        Icons.chevron_right,
                        size: 17,
                        color: _agendaMuted,
                      ),
                      title: Text(c.name, style: const TextStyle(fontSize: 13)),
                      subtitle: Text(
                        '${c.isPrimary
                            ? 'Primary contact'
                            : c.isAccountsContact
                            ? 'Accounts payable'
                            : c.jobTitle.isEmpty
                            ? 'Contact'
                            : c.jobTitle} · ${c.phone.isEmpty ? 'No phone number recorded' : c.phone}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: _agendaMuted,
                        ),
                      ),
                      onTap: c.phone.isEmpty
                          ? null
                          : () {
                              Navigator.pop(sheet);
                              _launch(Uri(scheme: 'tel', path: c.phone));
                            },
                    ),
                  ),
                ),
              if (e.customer?.companyPhone.isNotEmpty ?? false)
                Container(
                  margin: const EdgeInsets.fromLTRB(8, 0, 8, 10),
                  decoration: BoxDecoration(
                    border: Border.all(color: _agendaBorder),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: ListTile(
                      leading: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: _agendaPale,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.phone_outlined,
                          size: 19,
                          color: dashboardGreen,
                        ),
                      ),
                      title: const Text(
                        'Company line',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      subtitle: Text(
                        'Office · ${e.customer!.companyPhone}',
                        style: const TextStyle(
                          fontSize: 11,
                          color: _agendaMuted,
                        ),
                      ),
                      trailing: const Icon(Icons.chevron_right, size: 17),
                      onTap: () {
                        Navigator.pop(sheet);
                        _launch(
                          Uri(scheme: 'tel', path: e.customer!.companyPhone),
                        );
                      },
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _planRoute(List<AgendaEvent> visits) {
    final stops = visits.where((e) => e.address.isNotEmpty).toList();
    if (stops.isEmpty) {
      dashboardOpen(context, const CustomerMapScreen());
      return;
    }
    _launch(
      Uri.https('www.google.com', '/maps/dir/', {
        'api': '1',
        'travelmode': 'driving',
        'destination': stops.last.address,
        if (stops.length > 1)
          'waypoints': stops
              .take(stops.length - 1)
              .map((e) => e.address)
              .join('|'),
      }),
    );
  }

  void _checkIn(AgendaEvent e) {
    final location = e.customer == null
        ? null
        : context
              .read<CustomerLocationService>()
              .getForCustomer(e.customer!.id)
              .firstOrNull;
    if (e.demo && location != null) {
      dashboardOpen(context, VisitCheckInScreen.demo(location));
      return;
    }
    if (e.demo && e.customerName == 'City Timber Floors') {
      final region = context.read<SalesSession>().region;
      dashboardOpen(
        context,
        VisitCheckInScreen.demo(
          CustomerLocation(
            id: 'calendar-city-showroom',
            customerId: e.customer?.id ?? 'calendar-city',
            name: e.customerName,
            address: e.address,
            latitude: -33.815,
            longitude: 151.003,
            region: region,
            type: CustomerLocationType.showroom,
            isPrimary: true,
            distanceKm: 18.2,
          ),
        ),
      );
      return;
    }
    dashboardOpen(context, SalesVisitScreen(initialSearch: e.customerName));
  }

  Future<void> _openEvent(AgendaEvent e) async {
    if (e.note != null) {
      dashboardOpen(
        context,
        e.kind == AgendaKind.note
            ? AddNoteScreen(customer: e.customer, existing: e.note)
            : FollowUpDetail(customer: e.customer, taskId: e.note!.id),
      );
      return;
    }
    await Navigator.push(
      context,
      MaterialPageRoute<void>(builder: (_) => _CalendarSampleDetail(event: e)),
    );
    if (mounted) await _load();
  }

  Future<void> _complete(AgendaEvent e) async {
    SalesTaskCompletion? choice;
    if (!e.completed) {
      choice = await chooseTaskCompletion(
        context,
        customerName: e.customerName,
        description: e.description,
        type: e.type,
      );
      if (choice == null || !mounted) return;
    }
    final was = e.completed;
    try {
      if (e.demo) {
        _update(() => _completion[e.id] = !was);
        await _save();
      } else if (e.note != null) {
        context.read<CustomerNoteService>().setFollowUpStatus(
          e.id,
          was ? FollowUpStatus.pending : FollowUpStatus.completed,
          actor: context.read<AppSession>().currentUser,
          result: choice?.outcome,
        );
      }
      if (!mounted) return;
      await saveNextSalesFollowUpStates(context);
      if (!mounted) return;
      if (choice != null) {
        await createNextSalesFollowUp(
          context,
          choice,
          customerId: e.customer?.id ?? '',
          content: e.description,
          type: e.note?.followUpType ?? e.type,
        );
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(was ? 'Follow-up reopened' : 'Follow-up completed'),
          action: choice?.nextDate != null
              ? null
              : SnackBarAction(
                  label: 'Undo',
                  onPressed: () {
                    if (e.demo) {
                      _update(() => _completion[e.id] = was);
                      _save();
                    } else {
                      context.read<CustomerNoteService>().setFollowUpStatus(
                        e.id,
                        e.note?.followUpStatus ?? FollowUpStatus.pending,
                        actor: context.read<AppSession>().currentUser,
                        result: 'Calendar action undone',
                      );
                    }
                  },
                ),
        ),
      );
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.toString())));
      }
    }
  }

  Future<void> _reschedule(AgendaEvent e) async {
    final initial = _allowedDate(DateUtils.dateOnly(e.at));
    final date = await pickSalesDate(
      context: context,
      initialDate: initial,
      firstDate: _today,
      lastDate: DateTime(_today.year + 3),
      helpText: 'Reschedule follow-up',
    );
    if (!mounted || date == null) return;
    final next = DateTime(
      date.year,
      date.month,
      date.day,
      e.at.hour,
      e.at.minute,
    );
    if (e.demo) {
      _update(() => _dates[e.id] = next);
      await _save();
    } else if (e.note != null) {
      final n = e.note!;
      context.read<CustomerNoteService>().addFollowUp(
        customerId: n.customerId,
        existingId: n.id,
        actor: context.read<AppSession>().currentUser,
        content: n.content,
        attachments: n.attachments,
        followUpDate: next,
        followUpType: n.followUpType,
        assignees: n.assignees,
        priority: n.priority,
        reminder: n.reminder,
        reminderDate: n.reminderDate,
      );
      await saveNextSalesFollowUpStates(context);
    }
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Rescheduled to ${DateFormat('d MMM yyyy').format(next)}',
          ),
        ),
      );
    }
  }
}

class _CalendarSampleDetail extends StatelessWidget {
  const _CalendarSampleDetail({required this.event});
  final AgendaEvent event;
  @override
  Widget build(BuildContext context) => event.kind == AgendaKind.followUp
      ? ReferenceExampleFollowUp(
          customer: event.customer,
          task: CustomerNote(
            id: event.id,
            customerId: event.customer?.id ?? '',
            type: CustomerNoteType.followUp,
            content: event.description,
            createdAt: event.at.subtract(const Duration(days: 6)),
            followUpDate: event.at,
            followUpType: event.type,
            followUpStatus: event.completed
                ? FollowUpStatus.completed
                : event.inProgress
                ? FollowUpStatus.inProgress
                : FollowUpStatus.pending,
          ),
        )
      : Scaffold(
          backgroundColor: Colors.white,
          appBar: dashboardBar('Visit details'),
          body: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              const Align(
                alignment: Alignment.centerLeft,
                child: Chip(
                  label: Text(
                    'Demo event · preview only',
                    style: TextStyle(fontSize: 11),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                event.customerName,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                event.description,
                style: const TextStyle(fontSize: 15, height: 1.5),
              ),
              const SizedBox(height: 16),
              Text(
                DateFormat('EEE, d MMM yyyy · h:mm a').format(event.at),
                style: const TextStyle(fontSize: 13, color: _agendaMuted),
              ),
              if (event.address.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    event.address,
                    style: const TextStyle(fontSize: 13, color: _agendaMuted),
                  ),
                ),
              const SizedBox(height: 24),
              OutlinedButton(
                onPressed: () => dashboardOpen(
                  context,
                  AddFollowUpScreen(
                    customer: event.customer,
                    initialDueDate:
                        DateUtils.dateOnly(event.at)
                            .isBefore(DateUtils.dateOnly(DateTime.now()))
                        ? DateUtils.dateOnly(DateTime.now())
                        : event.at,
                    initialDescription: event.description,
                  ),
                ),
                child: const Text('Create follow-up from this example'),
              ),
              if (event.customer != null)
                TextButton(
                  onPressed: () => dashboardOpen(
                    context,
                    CustomerDetailScreen(customer: event.customer!),
                  ),
                  child: const Text('Customer details'),
                ),
            ],
          ),
        );
}

class _CalendarVisitForm extends StatefulWidget {
  const _CalendarVisitForm({required this.initialDate, this.initialCustomer});
  final Customer? initialCustomer;
  final DateTime initialDate;
  @override
  State<_CalendarVisitForm> createState() => _CalendarVisitFormState();
}

class _CalendarVisitFormState extends State<_CalendarVisitForm> {
  final _description = TextEditingController();
  late Customer? _customer = widget.initialCustomer;
  late DateTime _date = widget.initialDate;
  TimeOfDay _time = const TimeOfDay(hour: 16, minute: 0);
  final int _duration = 45;
  String _reminder = '30 min';
  bool _followUp = false, _saving = false;
  String? _error, _createdVisit, _createdTask;
  @override
  void dispose() {
    _description.dispose();
    super.dispose();
  }

  List<AgendaEvent> get _visits =>
      CalendarAgendaData(context, today: DateUtils.dateOnly(DateTime.now()))
          .events
          .where(
            (e) =>
                e.kind == AgendaKind.visit &&
                !e.completed &&
                DateUtils.isSameDay(e.at, _date),
          )
          .toList()
        ..sort((a, b) => a.at.compareTo(b.at));
  Future<void> _pickDay() async {
    final today = DateUtils.dateOnly(DateTime.now());
    final date = await pickSalesDate(
      context: context,
      initialDate: _date,
      firstDate: today,
      lastDate: DateTime(today.year + 3),
    );
    if (date != null && mounted) setState(() => _date = date);
  }

  Future<void> _pickTime() async {
    final time = await pickSalesVisitTime(
      context: context,
      date: _date,
      initial: _time,
      booked: [
        for (final e in _visits)
          (
            start: e.at,
            end: e.end,
            label: e.customerName == 'ABC Flooring'
                ? 'ABC'
                : e.customerName == 'City Timber Floors'
                ? 'CT'
                : e.customerName,
          ),
      ],
    );
    if (time != null && mounted) setState(() => _time = time);
  }

  Future<void> _pickCustomer() async {
    final customer = await chooseSalesCustomer(context);
    if (customer != null && mounted) setState(() => _customer = customer);
  }

  Future<void> _submit() async {
    if (_saving) return;
    if (_customer == null) {
      setState(() => _error = 'Select a customer.');
      return;
    }
    final service = context.read<CustomerNoteService>();
    final actor = context.read<AppSession>().currentUser;
    final at = DateTime(
      _date.year,
      _date.month,
      _date.day,
      _time.hour,
      _time.minute,
    );
    final description = _description.text.trim().isEmpty
        ? 'Customer visit'
        : _description.text.trim();
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final previousVisit = _createdVisit;
      final previousTask = _createdTask;
      try {
        await service.commit(() {
          service.addFollowUp(
            customerId: _customer!.id,
            existingId: _createdVisit,
            actor: actor,
            content: description,
            followUpDate: at,
            followUpType: 'Customer Visit',
            assignees: [actor],
            priority: 'Normal',
            reminder: _reminder,
            reminderDate: _reminder == 'None'
                ? null
                : at.subtract(
                    Duration(
                      minutes: _reminder == '30 min'
                          ? 30
                          : _reminder == '1 hr'
                          ? 60
                          : 1440,
                    ),
                  ),
          );
          _createdVisit ??= service.notes.last.id;
          if (_followUp) {
            service.addFollowUp(
              customerId: _customer!.id,
              existingId: _createdTask,
              actor: actor,
              content: 'Follow up after visit: $description',
              followUpDate: DateTime(_date.year, _date.month, _date.day + 1, 9),
              followUpType: 'Other',
              assignees: [actor],
              priority: 'Normal',
              reminder: 'On due date',
            );
            _createdTask ??= service.notes.last.id;
          }
        });
      } catch (_) {
        _createdVisit = previousVisit;
        _createdTask = previousTask;
        rethrow;
      }
      if (!mounted) return;
      final key = 'calendar-agenda-${actor.id}';
      final prefs = await SharedPreferences.getInstance();
      final values = Map<String, dynamic>.from(
        jsonDecode(prefs.getString(key) ?? '{}') as Map,
      );
      values['durations'] = {
        ...Map<String, dynamic>.from(values['durations'] as Map? ?? {}),
        _createdVisit!: _duration,
      };
      await prefs.setString(key, jsonEncode(values));
      if (mounted) Navigator.pop(context, (_createdVisit!, _duration));
    } catch (_) {
      if (mounted)
        setState(
          () => _error =
              'Could not save the visit. Your entries are kept. Try again.',
        );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Widget _dateField(
    String title,
    String icon,
    String value,
    String hint,
    VoidCallback onTap,
  ) => Expanded(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        detailLabel(title, required: true),
        detailCard(
          ListTile(
            dense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 10),
            minLeadingWidth: 17,
            horizontalTitleGap: 7,
            leading: DetailGlyph(icon, size: 17),
            title: Text(value, style: const TextStyle(fontSize: 13)),
            subtitle: Text(
              hint,
              style: const TextStyle(fontSize: 10, color: detailMuted),
            ),
            trailing: const DetailGlyph('down', size: 12),
            onTap: onTap,
          ),
        ),
      ],
    ),
  );
  @override
  Widget build(BuildContext context) {
    final at = DateTime(
      _date.year,
      _date.month,
      _date.day,
      _time.hour,
      _time.minute,
    );
    final today = DateUtils.dateOnly(DateTime.now());
    final dayLabel = DateUtils.isSameDay(_date, today)
        ? 'Today'
        : DateUtils.isSameDay(_date, today.add(const Duration(days: 1)))
        ? 'Tomorrow'
        : DateFormat('EEE d MMM').format(_date);
    final visits = _visits;
    return PopScope(
      canPop: !_saving,
      child: Scaffold(
        backgroundColor: const Color(0xfff3f5f4),
        appBar: dashboardBar('Schedule visit'),
        bottomNavigationBar: SafeArea(
          top: false,
          child: Container(
            color: Colors.white,
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: detailAction(
                    'Cancel',
                    '',
                    _saving ? null : () => Navigator.pop(context),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: detailAction(
                    _saving ? 'Saving…' : 'Schedule',
                    'check',
                    _saving ? null : _submit,
                    filled: true,
                  ),
                ),
              ],
            ),
          ),
        ),
        body: AbsorbPointer(
          absorbing: _saving,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 24),
            children: [
              detailLabel('Customer', required: true),
              detailCard(
                ListTile(
                  dense: true,
                  leading: const DetailGlyph('person', size: 18),
                  title: Text(
                    _customer?.businessName ?? 'Select customer',
                    style: const TextStyle(fontSize: 14),
                  ),
                  trailing: const DetailGlyph('down', size: 13),
                  onTap: _pickCustomer,
                ),
              ),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _dateField(
                    'Date',
                    'calendar',
                    DateFormat('EEE d MMM').format(_date),
                    dayLabel,
                    _pickDay,
                  ),
                  const SizedBox(width: 10),
                  _dateField(
                    'Time',
                    'clock',
                    DateFormat('h:mm a').format(at),
                    'until ${DateFormat('h:mm a').format(at.add(Duration(minutes: _duration)))}',
                    _pickTime,
                  ),
                ],
              ),
              detailLabel('Purpose'),
              Wrap(
                spacing: 6,
                runSpacing: 5,
                children: [
                  for (final purpose in [
                    'Quote walkthrough',
                    'Deliver swatches',
                    'Display board check',
                    'Relationship visit',
                    'Payment collection',
                    'Complaint follow-up',
                  ])
                    ActionChip(
                      label: Text(
                        purpose,
                        style: const TextStyle(
                          fontSize: 11,
                          color: detailGreen,
                        ),
                      ),
                      backgroundColor: Colors.white,
                      onPressed: () =>
                          setState(() => _description.text = purpose),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _description,
                maxLines: 1,
                style: const TextStyle(fontSize: 13),
                decoration: detailInput(hint: 'Add detail (optional)'),
              ),
              detailLabel('Remind me'),
              Wrap(
                spacing: 6,
                runSpacing: 5,
                children: [
                  for (final option in ['None', '30 min', '1 hr', 'Day before'])
                    ChoiceChip(
                      showCheckmark: false,
                      label: Text(
                        option,
                        style: TextStyle(
                          fontSize: 12,
                          color: _reminder == option
                              ? Colors.white
                              : detailMuted,
                        ),
                      ),
                      selected: _reminder == option,
                      selectedColor: detailGreen,
                      backgroundColor: Colors.white,
                      onSelected: (_) => setState(() => _reminder = option),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              detailCard(
                CheckboxListTile(
                  dense: true,
                  controlAffinity: ListTileControlAffinity.leading,
                  value: _followUp,
                  onChanged: (v) => setState(() => _followUp = v ?? false),
                  title: const Text(
                    'Also create a follow-up task',
                    style: TextStyle(fontSize: 13),
                  ),
                  subtitle: const Text(
                    'Due the day after the visit',
                    style: TextStyle(fontSize: 11, color: detailMuted),
                  ),
                ),
              ),
              detailHeading(
                'Your day · $dayLabel',
                action: '${visits.length} visits',
              ),
              detailCard(
                Column(
                  children: [
                    for (final visit in visits)
                      ListTile(
                        dense: true,
                        leading: Text(
                          DateFormat('h:mm a').format(visit.at),
                          style: const TextStyle(
                            fontSize: 11,
                            color: detailMuted,
                          ),
                        ),
                        title: Text(
                          visit.customerName,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: Text(
                          visit.description,
                          style: const TextStyle(
                            fontSize: 11,
                            color: detailMuted,
                          ),
                        ),
                      ),
                    if (visits.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(15),
                        child: Text(
                          'No visits planned.',
                          style: TextStyle(fontSize: 12, color: detailMuted),
                        ),
                      ),
                  ],
                ),
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    _error!,
                    style: const TextStyle(fontSize: 12, color: Colors.red),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
