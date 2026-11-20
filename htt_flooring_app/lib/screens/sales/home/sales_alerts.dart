part of 'sales_dashboard_support.dart';

const _alertBlue = Color(0xFF2463CC);
const _alertAmber = Color(0xFFD58A12);
const _alertMuted = Color(0xFF65716C);

class SalesAlertsScreen extends StatefulWidget {
  const SalesAlertsScreen({super.key});
  @override
  State<SalesAlertsScreen> createState() => _SalesAlertsScreenState();
}

class _CustomerAlert {
  const _CustomerAlert(
    this.key,
    this.name,
    this.days,
    this.detail, {
    this.customer,
  });
  final String key, name, detail;
  final int days;
  final Customer? customer;
}

class _SalesAlertsScreenState extends State<SalesAlertsScreen> {
  final Set<String> _expanded = {};
  final Set<String> _done = {};
  final Map<String, DateTime> _snoozed = {};
  bool _acknowledged = false;
  bool _loaded = false;
  String get _storageKey {
    final app = context.read<AppSession>();
    final region = context.read<SalesSession>().regionName;
    return 'sales-alert-actions-v1-${app.currentUser.id}-$region';
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loaded) {
      _loaded = true;
      _loadActions();
    }
  }

  Future<void> _loadActions() async {
    final prefs = await SharedPreferences.getInstance();
    final done = prefs.getStringList('$_storageKey-done') ?? [];
    final snoozes = prefs.getStringList('$_storageKey-snoozed') ?? [];
    if (!mounted) return;
    setState(() {
      _done.addAll(done);
      for (final value in snoozes) {
        final parts = value.split('|');
        final date = parts.length == 2 ? DateTime.tryParse(parts[1]) : null;
        if (date != null) _snoozed[parts[0]] = date;
      }
    });
  }

  Future<void> _saveActions() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList('$_storageKey-done', _done.toList());
    await prefs.setStringList(
      '$_storageKey-snoozed',
      _snoozed.entries
          .map((e) => '${e.key}|${e.value.toIso8601String()}')
          .toList(),
    );
  }

  bool _visible(_CustomerAlert a) =>
      !_done.contains(a.key) &&
      !(_snoozed[a.key]?.isAfter(DateTime.now()) ?? false);

  void _doneAlert(_CustomerAlert a) {
    setState(() => _done.add(a.key));
    _saveActions();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${a.name} reminder marked done'),
        action: SnackBarAction(
          label: 'Undo',
          onPressed: () {
            setState(() => _done.remove(a.key));
            _saveActions();
          },
        ),
      ),
    );
  }

  Future<void> _snooze(_CustomerAlert a) async {
    final now = DateUtils.dateOnly(DateTime.now());
    final date = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 7)),
      firstDate: now.add(const Duration(days: 1)),
      lastDate: now.add(const Duration(days: 365)),
      helpText: 'Remind me again',
    );
    if (date == null || !mounted) return;
    setState(() => _snoozed[a.key] = date);
    await _saveActions();
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Snoozed until ${DateFormat('d MMM').format(date)}'),
        action: SnackBarAction(
          label: 'Undo',
          onPressed: () {
            setState(() => _snoozed.remove(a.key));
            _saveActions();
          },
        ),
      ),
    );
  }

  void _noteTask(_CustomerAlert a) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                a.name,
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 12),
              ListTile(
                leading: const Icon(Icons.edit_note),
                title: const Text('Add Note'),
                onTap: () {
                  Navigator.pop(sheetContext);
                  dashboardOpen(context, AddNoteScreen(customer: a.customer));
                },
              ),
              ListTile(
                leading: const Icon(Icons.event_note_outlined),
                title: const Text('Add Follow-up'),
                onTap: () {
                  Navigator.pop(sheetContext);
                  dashboardOpen(
                    context,
                    AddFollowUpScreen(
                      customer: a.customer,
                      initialDescription:
                          '${a.name}: ${a.days > 0 ? '${a.days} days since last order. ' : ''}${a.detail}',
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Customer? _findCustomer(SalesDashboardData d, String name) => d.customers
      .where((c) => c.businessName.toLowerCase() == name.toLowerCase())
      .firstOrNull;

  List<_CustomerAlert> _customerAlerts(
    SalesDashboardData d,
    bool drop,
    bool demo,
  ) {
    if (demo) {
      final rows = drop
          ? <(String, int, String)>[
              ('Harbour Floors', 0, 'No Bonita in 30 days (was 88 m²)'),
              ('Northern Floors', 49, 'No MTF in 30 days (was 58 m²)'),
              ('Westside Laminates', 41, 'No AquaGlow in 30 days (was 55 m²)'),
              ('Timber World', 47, 'No Guardian in 30 days (was 53 m²)'),
              ('ABC Flooring', 0, 'AquaGlow ↓36% · 31 m² (was 48 m²)'),
              (
                'North Shore Hardwood',
                59,
                'No Guardian in 30 days (was 44 m²)',
              ),
              (
                'Coastal Carpets & Floors',
                44,
                'No Studio in 30 days (was 29 m²)',
              ),
            ]
          : <(String, int, String)>[
              ('Sutherland Supplies', 126, ''),
              ('Floor Direct', 113, ''),
              ('Premier Floorcraft', 64, ''),
              (
                'North Shore Hardwood',
                59,
                'No Guardian in 30 days (was 44 m²)',
              ),
              ('Northern Floors', 49, 'No MTF in 30 days (was 58 m²)'),
              ('Timber World', 47, 'No Guardian in 30 days (was 53 m²)'),
              (
                'Coastal Carpets & Floors',
                44,
                'No Studio in 30 days (was 29 m²)',
              ),
              ('Westside Laminates', 41, 'No AquaGlow in 30 days (was 55 m²)'),
            ];
      return rows
          .map(
            (r) => _CustomerAlert(
              'sample-${drop ? 'drop' : 'purchase'}-${r.$1}',
              r.$1,
              r.$2,
              r.$3,
              customer: _findCustomer(d, r.$1),
            ),
          )
          .where(_visible)
          .toList();
    }
    return (drop ? d.drop : d.noPurchase)
        .map((c) {
          final days = c.lastOrderDate == null
              ? 0
              : DateUtils.dateOnly(DateTime.now())
                    .difference(DateUtils.dateOnly(c.lastOrderDate!))
                    .inDays;
          final cycle = c.lastOrderDate?.toIso8601String() ?? 'none';
          return _CustomerAlert(
            '${drop ? 'drop' : 'purchase'}-${c.id}-$cycle',
            c.businessName,
            days,
            drop ? 'Sales down 30%+ · last 30 days vs previous 30' : '',
            customer: c,
          );
        })
        .where(_visible)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<CustomerNoteService>();
    context.watch<CustomerService>();
    context.watch<SalesDocumentService>();
    context.watch<SalesSession>();
    final app = context.watch<AppSession>();
    final d = SalesDashboardData(context);
    final demo =
        d.sample && d.tasks.every((t) => t.id.startsWith('sample-dashboard-'));
    final fresh = d.tasks
        .where((t) => t.creatorId != app.currentUser.id)
        .toList();
    final purchase = _customerAlerts(d, false, demo),
        drop = _customerAlerts(d, true, demo);
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    final next = d.tasks
        .where((t) => DateUtils.isSameDay(t.followUpDate, tomorrow))
        .length;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: dashboardBar(
        'Alerts',
        actions: [
          IconButton(
            tooltip: 'Mark new alerts as read',
            onPressed: () => setState(() => _acknowledged = true),
            icon: Icon(
              _acknowledged ? Icons.check_circle : Icons.check_circle_outline,
              size: 19,
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 24),
        children: [
          _section('TASKS', Icons.event_note_outlined),
          _group(
            'new',
            'New for you',
            'From Front desk',
            _acknowledged ? 0 : fresh.length,
            _alertBlue,
            Icons.notifications_none,
            _taskRows(d, fresh, true, demo),
          ),
          _group(
            'due',
            'Due soon',
            '${d.due.length} today · $next tomorrow',
            d.due.length,
            dashboardGreen,
            Icons.schedule,
            _taskRows(d, d.due, false, demo),
          ),
          _section('CUSTOMERS', Icons.warning_amber_outlined),
          _attention(d),
          _group(
            'purchase',
            'No purchase 30+ days',
            'Customers who stopped ordering',
            purchase.length,
            _alertAmber,
            Icons.shopping_cart_outlined,
            _customerRows(purchase, false),
          ),
          _group(
            'drop',
            'Sales drop 30%+',
            'Last 30 days vs previous 30',
            drop.length,
            _alertAmber,
            Icons.trending_down,
            _customerRows(drop, true),
          ),
          if (demo)
            const Padding(
              padding: EdgeInsets.only(top: 7),
              child: Text(
                'Demo reminders · sample customer and task data',
                style: TextStyle(fontSize: 10, color: _alertMuted),
              ),
            ),
        ],
      ),
    );
  }

  Widget _section(String title, IconData icon) => Padding(
    padding: const EdgeInsets.fromLTRB(2, 17, 0, 10),
    child: Row(
      children: [
        Icon(icon, size: 13, color: _alertMuted),
        const SizedBox(width: 6),
        Text(
          title,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: .8,
            color: _alertMuted,
          ),
        ),
      ],
    ),
  );

  Widget _attention(SalesDashboardData d) => Container(
    margin: const EdgeInsets.only(bottom: 10),
    decoration: BoxDecoration(
      color: Colors.white,
      border: Border.all(color: const Color(0xFFFFD4D1)),
      borderRadius: BorderRadius.circular(14),
      boxShadow: const [
        BoxShadow(
          color: Color(0x0D000000),
          blurRadius: 3,
          offset: Offset(0, 2),
        ),
      ],
    ),
    child: Material(
      type: MaterialType.transparency,
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () => dashboardOpen(
          context,
          DashboardCustomerList(
            title: 'Customer Attention',
            customers: d.attention,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(11),
          child: Row(
            children: [
              _iconBadge(
                Icons.warning_amber_outlined,
                const Color(0xFFEA1845),
                const Color(0xFFFFEDF0),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${d.attention.length} need attention · ${NumberFormat.currency(symbol: '\$', decimalDigits: 0).format(d.overdueAmount)} overdue',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 3),
                    const Text(
                      'Overdue, on hold, no recent visit → Attention',
                      style: TextStyle(fontSize: 11, color: _alertMuted),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, size: 17),
            ],
          ),
        ),
      ),
    ),
  );

  Widget _group(
    String id,
    String title,
    String subtitle,
    int count,
    Color color,
    IconData icon,
    Widget rows,
  ) {
    final open = _expanded.contains(id);
    final bg = id == 'new'
        ? const Color(0xFFF3F7FF)
        : id == 'due'
        ? const Color(0xFFF1F7F4)
        : const Color(0xFFFFFAF0);
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0E000000),
            blurRadius: 3,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: Container(
          decoration: BoxDecoration(color: color),
          padding: const EdgeInsets.only(left: 3),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: const Color(0xFFE7EBE8)),
              borderRadius: const BorderRadius.horizontal(
                right: Radius.circular(14),
              ),
            ),
            child: Material(
              type: MaterialType.transparency,
              child: Column(
                children: [
                  InkWell(
                    onTap: () => setState(
                      () => open ? _expanded.remove(id) : _expanded.add(id),
                    ),
                    child: Container(
                      color: bg,
                      padding: const EdgeInsets.fromLTRB(11, 11, 12, 11),
                      child: Row(
                        children: [
                          _iconBadge(icon, Colors.white, color),
                          const SizedBox(width: 9),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  title,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    height: 1.25,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  subtitle,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: _alertMuted,
                                    height: 1.25,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: .09),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '$count',
                              style: TextStyle(
                                fontSize: 12,
                                color: color,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                          const SizedBox(width: 9),
                          Transform.rotate(
                            angle: open ? -1.570796 : 1.570796,
                            child: const Icon(
                              Icons.chevron_right,
                              size: 16,
                              color: _alertMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (open) rows,
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _iconBadge(IconData icon, Color fg, Color bg) => Container(
    width: 32,
    height: 32,
    decoration: BoxDecoration(
      color: bg,
      borderRadius: BorderRadius.circular(10),
    ),
    child: icon == Icons.attach_money
        ? Center(
            child: Text(
              r'$',
              style: TextStyle(
                fontSize: 17,
                color: fg,
                fontWeight: FontWeight.w500,
              ),
            ),
          )
        : DashboardIcon(icon, size: 16, color: fg),
  );

  Widget _taskRows(
    SalesDashboardData d,
    List<CustomerNote> tasks,
    bool fresh,
    bool demo,
  ) {
    final samples = fresh
        ? <(String, String, int)>[
            (
              'Northern Floors',
              'Northern Floors asked for a copy of INV-10153 — please drop it in on your next visit',
              0,
            ),
            (
              'Timber World',
              'Emma at Timber World called about the Guardian quote — call her back today',
              1,
            ),
          ]
        : <(String, String, int)>[
            ('ABC Flooring', 'INV-10548 due today (\$8,682.96 incl. GST)', 0),
            (
              'City Timber Floors',
              'Deliver Heritage swatches (Natural Oak, White Oak)',
              2,
            ),
            ('Northern Floors', 'Follow up QT-1003 — Hornsby townhouses', 1),
            ('Floor Direct', 'INV-10145 overdue 83 days — account on hold', 0),
            (
              'ABC Flooring',
              'Deliver Heritage Smoked Oak colour panel (DBR-0412)',
              2,
            ),
            ('Timber World', 'Confirm Thursday showroom visit with Emma', 3),
          ];
    final count = demo ? samples.length : tasks.length.clamp(0, 6);
    final children = <Widget>[];
    for (var i = 0; i < count; i++) {
      final t = tasks.isEmpty ? null : tasks[i % tasks.length];
      final name = demo
          ? samples[i].$1
          : d.customer(t!.customerId)?.businessName ?? 'General task';
      final content = demo ? samples[i].$2 : t!.content;
      final kind = demo
          ? samples[i].$3
          : (t!.followUpType?.contains('Payment') ?? false)
          ? 0
          : (t.followUpType?.contains('Sample') ?? false)
          ? 2
          : 1;
      final due = demo
          ? (fresh && i == 0
                ? DateFormat('d MMM')
                      .format(DateTime.now().add(const Duration(days: 1)))
                : 'Today')
          : DateUtils.isSameDay(t!.followUpDate, DateTime.now())
          ? 'Today'
          : t.followUpDate == null
          ? 'No date'
          : DateFormat('d MMM').format(t.followUpDate!);
      final colors = [
        const Color(0xFFAD6B00),
        const Color(0xFF2167CD),
        const Color(0xFF7744CB),
        dashboardGreen,
      ];
      final backgrounds = [
        const Color(0xFFFFF3D8),
        const Color(0xFFE6EFFF),
        const Color(0xFFF0E8FC),
        const Color(0xFFE3F1E9),
      ];
      final glyphs = [
        Icons.attach_money,
        CupertinoIcons.doc,
        CupertinoIcons.cube_box,
        Icons.location_on_outlined,
      ];
      children.add(
        Container(
          decoration: BoxDecoration(
            color: fresh ? const Color(0xFFF3F7FF) : Colors.white,
            border: const Border(top: BorderSide(color: Color(0xFFF0F2F0))),
          ),
          child: Material(
            type: MaterialType.transparency,
            child: InkWell(
              onTap: () {
                if (demo && t != null) {
                  dashboardOpen(
                    context,
                    DashboardTaskDetail(
                      task: CustomerNote(
                        id: t.id,
                        customerId: _findCustomer(d, name)?.id ?? '',
                        type: CustomerNoteType.followUp,
                        content: content,
                        createdAt: t.createdAt,
                        followUpDate: t.followUpDate,
                        followUpType: t.followUpType,
                        creatorId: t.creatorId,
                        assignees: t.assignees,
                        followUpStatus: t.followUpStatus,
                      ),
                    ),
                  );
                } else if (t != null) {
                  dashboardOpen(context, DashboardTaskDetail(task: t));
                }
              },
              child: Padding(
                padding: const EdgeInsets.fromLTRB(11, 10, 11, 10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        _iconBadge(
                          glyphs[kind],
                          colors[kind],
                          backgrounds[kind],
                        ),
                        if (fresh && !_acknowledged)
                          Positioned(
                            left: -7,
                            top: 7,
                            child: Container(
                              width: 5,
                              height: 5,
                              decoration: const BoxDecoration(
                                color: _alertBlue,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 9),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              height: 1.25,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            content,
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: _alertMuted,
                              height: 1.45,
                            ),
                          ),
                          if (fresh)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                demo
                                    ? 'From Front desk · Today · ${i == 0 ? '9:12 AM' : '10:40 AM'}'
                                    : 'From ${t?.authorName ?? 'Team'} · ${DateFormat('d MMM · h:mm a').format(t!.createdAt.toLocal())}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: _alertBlue,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: fresh && i == 0
                            ? const Color(0xFFEDF0F2)
                            : const Color(0xFFFFF3D8),
                        borderRadius: BorderRadius.circular(7),
                      ),
                      child: Text(
                        due,
                        style: TextStyle(
                          fontSize: 10,
                          color: fresh && i == 0
                              ? const Color(0xFF52606A)
                              : const Color(0xFFA36500),
                          fontWeight: FontWeight.w600,
                        ),
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
    if (count == 0) {
      children.add(
        const Padding(
          padding: EdgeInsets.all(18),
          child: Text(
            'No tasks in this group',
            style: TextStyle(fontSize: 12, color: _alertMuted),
          ),
        ),
      );
    }
    if (!fresh && tasks.isNotEmpty) {
      children.add(
        Material(
          color: const Color(0xFFF8FBF9),
          child: InkWell(
            onTap: () => dashboardOpen(
              context,
              DashboardTaskList(title: 'Due soon', tasks: tasks),
            ),
            child: Container(
              height: 40,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: Color(0xFFEDF0ED))),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'All ${tasks.length} tasks',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF087D46),
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.chevron_right,
                    size: 16,
                    color: Color(0xFF087D46),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }
    return Column(children: children);
  }

  Widget _customerRows(List<_CustomerAlert> rows, bool drop) => Column(
    children: [
      if (rows.isEmpty)
        const Padding(
          padding: EdgeInsets.all(18),
          child: Text(
            'No customers in this group',
            style: TextStyle(fontSize: 12, color: _alertMuted),
          ),
        ),
      for (final a in rows)
        Container(
          width: double.infinity,
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: Color(0xFFF0F2F0))),
          ),
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              InkWell(
                onTap: a.customer == null
                    ? null
                    : () => dashboardOpen(
                        context,
                        CustomerDetailScreen(customer: a.customer!),
                      ),
                child: Text(
                  a.name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(height: 4),
              if (drop && a.detail.isNotEmpty) _dropLine(a.detail),
              if (a.days > 0)
                Padding(
                  padding: EdgeInsets.only(top: drop ? 4 : 0),
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(text: drop ? '+ ' : ''),
                        TextSpan(
                          text: '${a.days} days',
                          style: TextStyle(
                            fontWeight: drop
                                ? FontWeight.w400
                                : FontWeight.w700,
                            color: drop ? _alertMuted : const Color(0xFF1D2925),
                          ),
                        ),
                        const TextSpan(text: ' since last order'),
                      ],
                    ),
                    style: const TextStyle(fontSize: 11.5, color: _alertMuted),
                  ),
                ),
              if (!drop && a.detail.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    '+ ${a.detail}',
                    style: const TextStyle(fontSize: 11.5, color: _alertMuted),
                  ),
                ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  _action(
                    'Note & Task',
                    Icons.add,
                    dashboardGreen,
                    Colors.white,
                    () => _noteTask(a),
                  ),
                  _action(
                    'Snooze',
                    Icons.schedule,
                    const Color(0xFFFFF8E9),
                    const Color(0xFFA36300),
                    () => _snooze(a),
                    border: const Color(0xFFFFDE9F),
                  ),
                  _action(
                    'Done',
                    Icons.check,
                    const Color(0xFFF0F5F2),
                    dashboardGreen,
                    () => _doneAlert(a),
                  ),
                ],
              ),
            ],
          ),
        ),
    ],
  );

  Widget _dropLine(String text) {
    final end = text.startsWith('No ')
        ? text.indexOf(' in ')
        : text.indexOf(' · ');
    return Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: end < 0 ? text : text.substring(0, end),
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              color: Color(0xFF26322C),
            ),
          ),
          if (end >= 0) TextSpan(text: text.substring(end)),
        ],
      ),
      style: const TextStyle(fontSize: 11.5, color: _alertMuted, height: 1.3),
    );
  }

  Widget _action(
    String label,
    IconData icon,
    Color bg,
    Color fg,
    VoidCallback tap, {
    Color? border,
  }) => Material(
    color: bg,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(7),
      side: BorderSide(color: border ?? bg),
    ),
    child: InkWell(
      borderRadius: BorderRadius.circular(7),
      onTap: tap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: fg),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w600,
                color: fg,
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
