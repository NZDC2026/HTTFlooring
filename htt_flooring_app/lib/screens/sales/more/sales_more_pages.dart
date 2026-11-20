part of 'sales_more_screen.dart';

class SalesPerformanceScreen extends StatelessWidget {
  const SalesPerformanceScreen({super.key});
  Widget _stat(String label, String value, String detail) => _box(
    Padding(
      padding: const EdgeInsets.all(13),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: _muted)),
          const SizedBox(height: 5),
          Text(
            value,
            style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w700),
          ),
          if (detail.isNotEmpty) ...[
            const SizedBox(height: 3),
            Text(detail, style: const TextStyle(fontSize: 11, color: _muted)),
          ],
        ],
      ),
    ),
  );
  @override
  Widget build(BuildContext context) {
    final data = SalesDashboardData(context), now = DateTime.now();
    final sample = data.sample;
    final total = sample ? 42025.0 : data.sales;
    final needed = (65000 - total).clamp(0.0, 65000.0);
    final left = DateUtils.getDaysInMonth(now.year, now.month) - now.day;
    final ids = data.customers.map((c) => c.id).toSet();
    final docs = context.watch<SalesDocumentService>();
    final invoices = docs.invoices
        .where(
          (d) =>
              ids.contains(d.customer.id) &&
              (d.invoiceDate ?? d.createdAt).year == now.year &&
              (d.invoiceDate ?? d.createdAt).month == now.month,
        )
        .toList();
    final quotes = docs.quotations
        .where(
          (d) =>
              ids.contains(d.customer.id) &&
              d.createdAt.year == now.year &&
              d.createdAt.month == now.month,
        )
        .toList();
    final customers = sample
        ? <String, double>{
            'ABC Flooring': 19621,
            'City Timber Floors': 7758,
            'Bondi Floor Studio': 5544,
            'Metro Surfaces': 5472,
            'Harbour Floors': 3630,
            'Timber World': 0,
            'Floor Direct': 0,
            'Northern Floors': 0,
            'Premier Floorcraft': 0,
            'Westside Laminates': 0,
            'North Shore Hardwood': 0,
            'Sutherland Supplies': 0,
            'Coastal Carpets & Floors': 0,
          }
        : {
            for (final c in data.customers)
              c.businessName: invoices
                  .where((d) => d.customer.id == c.id)
                  .fold<double>(0, (s, d) => s + d.subtotal),
          };
    final weeks = sample
        ? <double>[19303, 22723, 0, 0]
        : List.generate(
            4,
            (i) => invoices
                .where(
                  (d) =>
                      (((d.invoiceDate ?? d.createdAt).day - 1) ~/ 7).clamp(
                        0,
                        3,
                      ) ==
                      i,
                )
                .fold<double>(0, (s, d) => s + d.subtotal),
          );
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar('My performance'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 30),
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _stat(
                  'Invoiced MTD · ex GST',
                  _money(total),
                  '${(total / 65000 * 100).round()}% of \$65,000',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _stat(
                  'Still needed',
                  _money(needed),
                  '$left days left · ${_money(needed / (left > 0 ? left : 1))}/day',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: _stat(
                  'Commission (est.)',
                  sample ? '\$841' : '—',
                  sample
                      ? '2% to target, 4% above'
                      : 'Commission plan not configured',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _stat(
                  'Visit coverage',
                  sample ? '8/13' : '—',
                  '${sample ? 6 : data.visits.length} visits this month',
                ),
              ),
            ],
          ),
          const SizedBox(height: 7),
          Text(
            sample
                ? 'ⓘ Sales and commission = invoiced amount ex GST, less returns (\$2,100 returned this month). Demo figures.'
                : 'ⓘ Sales = recorded invoices ex GST. Returns and commission configuration are not available.',
            style: const TextStyle(fontSize: 11, color: _muted, height: 1.6),
          ),
          _heading('Weekly sales vs weekly target'),
          _box(
            Padding(
              padding: const EdgeInsets.all(13),
              child: Column(
                children: [
                  for (var i = 0; i < 4; i++)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 80,
                            child: Text(
                              '${['1–7', '8–14', '15–21', '22–${DateUtils.getDaysInMonth(now.year, now.month)}'][i]} ${DateFormat('MMM').format(now)}',
                              style: const TextStyle(fontSize: 11),
                            ),
                          ),
                          Expanded(
                            child: SizedBox(
                              height: 21,
                              child: CustomPaint(
                                painter: _WeeklyBar(weeks[i] / 22723),
                              ),
                            ),
                          ),
                          SizedBox(
                            width: 78,
                            child: Text(
                              _money(weeks[i]),
                              textAlign: TextAlign.right,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 5),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Dashed line = weekly target \$15,116',
                      style: TextStyle(fontSize: 11, color: _muted),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 22),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'By category',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 9),
                    _box(
                      Padding(
                        padding: const EdgeInsets.all(13),
                        child: Column(
                          children: [
                            for (final entry in <String, double>{
                              'Engineered': sample ? 31252 : 0,
                              'Laminate': sample ? 2678 : 0,
                              'Hybrid': sample ? 7810 : 0,
                              'Accessories': sample ? 285 : 0,
                            }.entries)
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 5,
                                ),
                                child: Column(
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            entry.key,
                                            style: const TextStyle(
                                              fontSize: 12,
                                            ),
                                          ),
                                        ),
                                        Text(
                                          sample ? _money(entry.value) : '—',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 5),
                                    LinearProgressIndicator(
                                      value: entry.value / 31252,
                                      minHeight: 5,
                                      color: const Color(0xFF197D50),
                                      backgroundColor: _line,
                                    ),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'By customer',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 9),
                    _group([
                      for (final e in customers.entries)
                        Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  e.key,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    height: 1.5,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    _money(e.value),
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  Text(
                                    '${total > 0 ? (e.value / total * 100).round() : 0}%',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: _muted,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                    ]),
                  ],
                ),
              ),
            ],
          ),
          _heading('Quotes this month'),
          Row(
            children: [
              Expanded(
                child: _stat('Created', '${sample ? 2 : quotes.length}', ''),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _stat(
                  'Value',
                  _money(
                    sample
                        ? 35727
                        : quotes.fold<double>(0, (s, d) => s + d.subtotal),
                  ),
                  '',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _stat('Converted', sample ? '0' : '—', '')),
              const SizedBox(width: 10),
              const Expanded(child: SizedBox()),
            ],
          ),
        ],
      ),
    );
  }
}

class _WeeklyBar extends CustomPainter {
  _WeeklyBar(this.value);
  final double value;
  @override
  void paint(Canvas c, Size s) {
    c.drawRRect(
      RRect.fromRectAndRadius(Offset.zero & s, const Radius.circular(5)),
      Paint()..color = const Color(0xFFF0F2F3),
    );
    c.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(0, 0, s.width * value.clamp(0.0, 1.0), s.height),
        const Radius.circular(5),
      ),
      Paint()..color = const Color(0xFF197D50),
    );
    final p = Paint()
      ..color = const Color(0xFF37453E)
      ..strokeWidth = 1.4;
    for (double y = -2; y < s.height + 2; y += 8) {
      c.drawLine(Offset(s.width * .665, y), Offset(s.width * .665, y + 5), p);
    }
  }

  @override
  bool shouldRepaint(_WeeklyBar old) => old.value != value;
}

class SalesSettingsScreen extends StatefulWidget {
  const SalesSettingsScreen({super.key});
  @override
  State<SalesSettingsScreen> createState() => _SalesSettingsScreenState();
}

class _SalesSettingsScreenState extends State<SalesSettingsScreen> {
  final _values = <String, bool>{
    'Follow-up reminders': true,
    'Visit reminders': true,
    'Overdue payments': true,
    'Promotions & new products': false,
    'Offline data': true,
  };
  bool _loaded = false;
  String get _key =>
      'sales-settings-${context.read<AppSession>().currentUser.id}';
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loaded) {
      _loaded = true;
      _load();
    }
  }

  Future<void> _load() async {
    final p = await SharedPreferences.getInstance();
    if (mounted) {
      setState(() {
        for (final k in _values.keys) {
          _values[k] = p.getBool('$_key-$k') ?? _values[k]!;
        }
      });
    }
  }

  Future<void> _set(String k, bool value) async {
    setState(() => _values[k] = value);
    final p = await SharedPreferences.getInstance();
    await p.setBool('$_key-$k', value);
  }

  Widget _toggle(String title, String subtitle) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 10),
    child: Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 13)),
              const SizedBox(height: 3),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 11, color: _muted),
              ),
            ],
          ),
        ),
        Transform.scale(
          scale: .8,
          child: Switch.adaptive(
            activeTrackColor: const Color(0xFF197D50),
            value: _values[title]!,
            onChanged: (v) => _set(title, v),
          ),
        ),
      ],
    ),
  );
  @override
  Widget build(BuildContext context) {
    final region = context.watch<SalesSession>().regionName;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar('Settings'),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 25),
        children: [
          _heading('Notifications'),
          _group([
            _toggle(
              'Follow-up reminders',
              'Based on each follow-up’s reminder setting',
            ),
            _toggle('Visit reminders', '30 minutes before a planned visit'),
            _toggle(
              'Overdue payments',
              'When a customer invoice becomes overdue',
            ),
            _toggle('Promotions & new products', 'From head office'),
          ]),
          _heading('Data'),
          _group([
            _toggle(
              'Offline data',
              'Keep customers, prices and stock on this device',
            ),
            _menu(
              CupertinoIcons.arrow_2_circlepath,
              'Sync now',
              'Refresh locally available records',
              () => ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                    'Local records are up to date. Server synchronization is not configured.',
                  ),
                ),
              ),
            ),
          ]),
          _heading('Account'),
          _group([
            for (final row in [
              ('Warehouse', '$region Warehouse'),
              ('Sales region', region),
            ])
              ListTile(
                dense: true,
                title: Text(row.$1, style: const TextStyle(fontSize: 13)),
                subtitle: Text(
                  row.$2,
                  style: const TextStyle(fontSize: 11, color: _muted),
                ),
                trailing: const _MoreIcon(CupertinoIcons.lock, size: 15),
              ),
          ]),
          const SizedBox(height: 12),
          const Text(
            'Preferences are saved on this device. Push notifications require a connected notification service.',
            style: TextStyle(fontSize: 10, color: _muted),
          ),
        ],
      ),
    );
  }
}

class SalesTasksScreen extends StatefulWidget {
  const SalesTasksScreen({super.key});
  @override
  State<SalesTasksScreen> createState() => _SalesTasksScreenState();
}

class _SalesTasksScreenState extends State<SalesTasksScreen> {
  String _status = 'All', _type = 'All', _query = '';
  final Set<String> _open = {};
  final Map<String, bool> _completion = {};
  final Map<String, DateTime> _dates = {};
  final Set<String> _expanded = {};
  bool _loaded = false;
  String get _taskKey =>
      'calendar-agenda-${context.read<AppSession>().currentUser.id}';
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loaded) {
      _loaded = true;
      _loadTaskState();
    }
  }

  Future<void> _loadTaskState() async {
    await restoreNextSalesFollowUps(context);
    if (!mounted) return;
    final key = _taskKey;
    final prefs = await SharedPreferences.getInstance();
    try {
      final data = jsonDecode(prefs.getString(key) ?? '{}') as Map;
      if (mounted) {
        setState(() {
          _completion.addAll(Map<String, bool>.from(data['completed'] ?? {}));
          for (final e in Map<String, dynamic>.from(
            data['dates'] ?? {},
          ).entries) {
            final date = DateTime.tryParse('${e.value}');
            if (date != null) _dates[e.key] = date;
          }
        });
      }
    } catch (_) {
      /* Ignore obsolete preview state. */
    }
  }

  Future<void> _saveTaskState() async {
    final key = _taskKey;
    final prefs = await SharedPreferences.getInstance();
    final data = Map<String, dynamic>.from(
      jsonDecode(prefs.getString(key) ?? '{}') as Map,
    );
    data['completed'] = _completion;
    data['dates'] = _dates.map((k, v) => MapEntry(k, v.toIso8601String()));
    await prefs.setString(key, jsonEncode(data));
  }

  Future<void> _openTask(AgendaEvent e) async {
    await Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (_) => e.note == null
            ? _TaskSampleScreen(event: e)
            : FollowUpDetail(customer: e.customer, taskId: e.id),
      ),
    );
    if (mounted) await _loadTaskState();
  }

  Future<void> _completeTask(AgendaEvent e) async {
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
    if (e.demo) {
      setState(() => _completion[e.id] = !e.completed);
      await _saveTaskState();
    } else if (e.note != null) {
      context.read<CustomerNoteService>().setFollowUpStatus(
        e.id,
        e.completed ? FollowUpStatus.pending : FollowUpStatus.completed,
        actor: context.read<AppSession>().currentUser,
        result: choice?.outcome,
      );
    }
    if (mounted) await saveNextSalesFollowUpStates(context);
    if (choice != null && mounted) {
      await createNextSalesFollowUp(
        context,
        choice,
        customerId: e.customer?.id ?? '',
        content: e.description,
        type: e.note?.followUpType ?? e.type,
      );
    }
  }

  Future<void> _rescheduleTask(AgendaEvent e) async {
    final today = DateUtils.dateOnly(DateTime.now());
    final date = await pickSalesDate(
      context: context,
      initialDate: e.at.isBefore(today) ? today : e.at,
      firstDate: today,
      lastDate: DateTime(today.year + 3),
    );
    if (date == null || !mounted) return;
    final next = DateTime(
      date.year,
      date.month,
      date.day,
      e.at.hour,
      e.at.minute,
    );
    if (e.demo) {
      setState(() => _dates[e.id] = next);
      await _saveTaskState();
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
  }

  void _callTask(AgendaEvent e) {
    final contacts = e.customer == null
        ? []
        : context.read<CustomerService>().getContactsForCustomer(
            e.customer!.id,
          );
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      showDragHandle: true,
      builder: (sheet) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Call ${e.customerName}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 12),
              if (contacts.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'No phone number recorded',
                    style: TextStyle(fontSize: 13, color: _muted),
                  ),
                ),
              for (final c in contacts)
                _menu(
                  CupertinoIcons.person_2,
                  c.name,
                  '${c.jobTitle} · ${c.phone}',
                  () async {
                    if (c.phone.isEmpty) return;
                    Navigator.pop(sheet);
                    await launchUrl(
                      Uri(scheme: 'tel', path: c.phone),
                      mode: LaunchMode.externalApplication,
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _taskGroup(String group, List<AgendaEvent> rows) {
    final open = _open.contains(group), more = _expanded.contains(group);
    final header = Material(
      color: open ? _green : Colors.white,
      child: ListTile(
        onTap: () =>
            setState(() => open ? _open.remove(group) : _open.add(group)),
        leading: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: open ? const Color(0xFF41685B) : _green,
            borderRadius: BorderRadius.circular(12),
          ),
          child: _MoreIcon(
            group == 'Completed'
                ? CupertinoIcons.check_mark_circled
                : CupertinoIcons.calendar,
            size: 18,
            color: Colors.white,
          ),
        ),
        title: Row(
          children: [
            Flexible(
              child: Text(
                group == 'Upcoming' ? 'This week' : group,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: open ? Colors.white : _green,
                ),
              ),
            ),
            const SizedBox(width: 9),
            _badge('${rows.length}'),
          ],
        ),
        trailing: _MoreIcon(
          open ? CupertinoIcons.chevron_down : CupertinoIcons.chevron_right,
          size: 13,
          color: open ? Colors.white : _muted,
        ),
      ),
    );
    final body = Column(
      children: [
        for (final e in more ? rows : rows.take(3))
          CalendarFollowUpCard(
            event: e,
            onOpen: () => _openTask(e),
            onComplete: () => _completeTask(e),
            onCall: () => _callTask(e),
            onReschedule: () => _rescheduleTask(e),
          ),
        if (rows.length > 3)
          TextButton(
            onPressed: () => setState(
              () => more ? _expanded.remove(group) : _expanded.add(group),
            ),
            child: Text(
              more ? 'Show fewer' : 'Show ${rows.length - 3} more',
              style: const TextStyle(fontSize: 12, color: Color(0xFF167343)),
            ),
          ),
      ],
    );
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: _box(
          Column(
            children: [
              header,
              if (open)
                Container(
                  color: const Color(0xFFEAF3EE),
                  padding: const EdgeInsets.all(8),
                  child: body,
                ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    context.watch<CustomerNoteService>();
    final today = DateUtils.dateOnly(DateTime.now());
    final data = CalendarAgendaData(
      context,
      today: today,
      completion: _completion,
      dates: _dates,
    );
    var events = data.events
        .where((e) => e.kind == AgendaKind.followUp)
        .toList();
    if (data.demo) {
      events = events
          .where(
            (e) =>
                !e.demo ||
                (e.assignedToMe &&
                    !e.id.endsWith('completed-2') &&
                    !DateUtils.dateOnly(e.at).isBefore(today)),
          )
          .toList();
    }
    String status(AgendaEvent e) => e.completed
        ? 'Completed'
        : DateUtils.isSameDay(e.at, today)
        ? 'Today'
        : e.at.isBefore(today)
        ? 'Overdue'
        : 'Upcoming';
    String taskGroup(AgendaEvent e) =>
        status(e) == 'Upcoming' &&
            DateUtils.isSameDay(e.at, today.add(const Duration(days: 1)))
        ? 'Tomorrow'
        : status(e);
    final counts = {
      for (final k in ['Today', 'Overdue', 'Upcoming', 'Completed', 'All'])
        k: k == 'All'
            ? events.length
            : events.where((e) => status(e) == k).length,
    };
    final filtered = events
        .where(
          (e) =>
              (_status == 'All' || status(e) == _status) &&
              (_type == 'All' ||
                  e.type == _type ||
                  (_type == 'Visit prep' && e.type == 'Follow-up')) &&
              ('${e.customerName} ${e.description}'.toLowerCase().contains(
                _query.toLowerCase(),
              )),
        )
        .toList();
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar(
        'Tasks',
        actions: [
          IconButton(
            tooltip: 'Assigned to me',
            onPressed: () => showModalBottomSheet<void>(
              context: context,
              showDragHandle: true,
              backgroundColor: Colors.white,
              builder: (_) => const SafeArea(
                child: Padding(
                  padding: EdgeInsets.all(22),
                  child: Text(
                    'Only mine · tasks assigned to or created by your account.',
                    style: TextStyle(fontSize: 13),
                  ),
                ),
              ),
            ),
            icon: _MoreIcon(CupertinoIcons.person_2, size: 20, color: _green),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: _green,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute<void>(
              builder: (_) => AddFollowUpScreen(initialDueDate: today),
            ),
          );
          if (mounted) setState(() {});
        },
        child: const _MoreIcon(CupertinoIcons.plus),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 90),
        children: [
          Container(
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: const Color(0xFFEDF0EE),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                for (final k in counts.keys)
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _status = k),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 7),
                        decoration: BoxDecoration(
                          color: _status == k
                              ? Colors.white
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(9),
                        ),
                        child: Column(
                          children: [
                            Text(
                              '${counts[k]}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              k,
                              style: const TextStyle(
                                fontSize: 10,
                                color: _muted,
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
          const SizedBox(height: 10),
          TextField(
            onChanged: (s) => setState(() => _query = s),
            decoration: InputDecoration(
              hintText: 'Search customer or task',
              hintStyle: const TextStyle(fontSize: 13, color: _muted),
              prefixIcon: const _MoreIcon(CupertinoIcons.search, size: 17),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: _line),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: _line),
              ),
            ),
          ),
          const SizedBox(height: 9),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final k in [
                  'All',
                  'Payment',
                  'Quote',
                  'Swatches',
                  'Visit prep',
                ])
                  Padding(
                    padding: const EdgeInsets.only(right: 7),
                    child: ChoiceChip(
                      label: Text(
                        k,
                        style: TextStyle(
                          fontSize: 11,
                          color: _type == k ? Colors.white : _green,
                        ),
                      ),
                      selected: _type == k,
                      onSelected: (_) => setState(() => _type = k),
                      selectedColor: _green,
                      backgroundColor: Colors.white,
                      showCheckmark: false,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: const BorderSide(color: _line),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          for (final group in [
            'Overdue',
            'Today',
            'Tomorrow',
            'Upcoming',
            'Completed',
          ])
            if (filtered.any((e) => taskGroup(e) == group))
              _taskGroup(
                group,
                filtered.where((e) => taskGroup(e) == group).toList(),
              ),
          if (filtered.isEmpty)
            const Padding(
              padding: EdgeInsets.all(25),
              child: Center(
                child: Text(
                  'No tasks match your filters.',
                  style: TextStyle(color: _muted, fontSize: 13),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _TaskSampleScreen extends StatelessWidget {
  const _TaskSampleScreen({required this.event});
  final AgendaEvent event;
  @override
  Widget build(BuildContext context) => ReferenceExampleFollowUp(
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
  );
}
