part of 'sales_more_screen.dart';

List<Map<String, dynamic>> salesSampleReferenceRecords() => [
  {
    'id': 'SMP-301',
    'board': false,
    'customer': 'City Timber Floors',
    'customerId': '',
    'series': '',
    'colours': ['Heritage Natural Oak', 'Heritage White Oak'],
    'delivery': 'I will deliver',
    'date': '16 Nov',
    'note': 'For a client kitchen',
    'done': false,
    'status': 'Sent · need 18 Nov',
  },
  {
    'id': 'DBR-0415',
    'board': true,
    'customer': 'ABC Flooring',
    'customerId': 'abc',
    'series': 'Guardian',
    'category': 'Hybrid',
    'colours': ['D3018 × 2', 'D3020 × 1', 'D3022 × 1'],
    'delivery': 'Chatswood Store',
    'date': '18 Nov',
    'note': 'Customer wants the new colours in the front window',
    'done': false,
    'status': 'Requested',
  },
  {
    'id': 'DBR-0412',
    'board': true,
    'customer': 'ABC Flooring',
    'customerId': 'abc',
    'series': 'Heritage',
    'category': 'Engineered Timber',
    'colours': ['Smoked Oak × 1'],
    'delivery': 'George St Showroom',
    'date': '17 Nov',
    'note': 'Missing from the herringbone wall',
    'done': false,
    'status': 'Delivery 20 Nov',
  },
  {
    'id': 'DBR-0398',
    'board': true,
    'customer': 'City Timber Floors',
    'customerId': '',
    'series': 'Studio',
    'category': 'Engineered Timber',
    'colours': ['Walnut × 1'],
    'delivery': 'Parramatta Showroom',
    'date': '21 Oct',
    'note': '',
    'reason': 'Damaged',
    'done': true,
    'completedAt': '2026-11-02T12:00:00',
    'status': 'Completed 2 Nov',
    'boardType': 'Panels',
    'requestType': 'Add more',
  },
];

Future<List<Map<String, dynamic>>> readSalesSampleRecords(
  String userId, {
  required bool demo,
}) => LocalSalesRecordStore.read(
  'sales-sample-requests-$userId',
  initial: demo ? salesSampleReferenceRecords() : const [],
);

Future<void> saveSalesSampleRecord(
  String userId,
  Map<String, dynamic> record, {
  required bool demo,
}) => LocalSalesRecordStore.upsert(
  'sales-sample-requests-$userId',
  record,
  initial: demo ? salesSampleReferenceRecords() : const [],
);

Future<Customer?> chooseSalesCustomer(
  BuildContext context, {
  bool prices = false,
  Customer? current,
  VoidCallback? onClear,
}) => _chooseSampleCustomer(
  context,
  prices: prices,
  current: current,
  onClear: onClear,
);

class SalesSamplesScreen extends StatelessWidget {
  const SalesSamplesScreen({
    super.key,
    this.createOnOpen = false,
    this.initialCustomer,
    this.initialBoard,
  });
  final bool createOnOpen;
  final Customer? initialCustomer;
  final bool? initialBoard;
  @override
  Widget build(BuildContext context) => _SalesRequestsScreen(
    samples: true,
    createOnOpen: createOnOpen,
    initialCustomer: initialCustomer,
    initialBoard: initialBoard,
  );
}

class _SalesRequestsScreen extends StatefulWidget {
  const _SalesRequestsScreen({
    this.samples = false,
    this.createOnOpen = false,
    this.initialCustomer,
    this.initialBoard,
  });
  final bool samples, createOnOpen;
  final Customer? initialCustomer;
  final bool? initialBoard;
  @override
  State<_SalesRequestsScreen> createState() => _SalesRequestsState();
}

class _SalesRequestsState extends State<_SalesRequestsScreen> {
  int _tab = 0;
  String _status = '';
  bool _loaded = false;
  final List<Map<String, dynamic>> _records = [];
  List<Map<String, dynamic>> _office = [];
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loaded) {
      _loaded = true;
      _status = widget.samples ? 'In progress' : 'Waiting';
      _load();
    }
  }

  Future<void> _load() async {
    final demo = SalesDashboardData(context).sample;
    final userId = context.read<AppSession>().currentUser.id;
    _office = await LocalSalesRequestStore.read(userId);
    final rows = await readSalesSampleRecords(userId, demo: demo);
    if (mounted) {
      setState(() => _records.addAll(rows));
      if (widget.createOnOpen) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) _newRequest();
        });
      }
    }
  }

  Future<void> _saveRecord(Map<String, dynamic> record) =>
      saveSalesSampleRecord(
        context.read<AppSession>().currentUser.id,
        record,
        demo: SalesDashboardData(context).sample,
      );

  Widget _tabs(List<String> labels) => Container(
    padding: const EdgeInsets.all(3),
    decoration: BoxDecoration(
      color: const Color(0xFFECEFEC),
      borderRadius: BorderRadius.circular(10),
    ),
    child: Row(
      children: [
        for (var i = 0; i < labels.length; i++)
          Expanded(
            child: InkWell(
              onTap: () => setState(() => _tab = i),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: _tab == i ? Colors.white : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                alignment: Alignment.center,
                child: Text(
                  labels[i],
                  style: TextStyle(
                    fontSize: 12,
                    color: const Color(0xFF46514B),
                    fontWeight: _tab == i ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),
              ),
            ),
          ),
      ],
    ),
  );
  Widget _filters(List<String> labels) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 10),
    child: Wrap(
      spacing: 8,
      children: [
        for (final s in labels)
          ChoiceChip(
            showCheckmark: false,
            label: Text(
              s,
              style: TextStyle(
                fontSize: 12,
                color: s == _status ? Colors.white : _muted,
              ),
            ),
            selected: s == _status,
            onSelected: (_) => setState(() => _status = s),
            selectedColor: _green,
            backgroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: const BorderSide(color: _line),
            ),
          ),
      ],
    ),
  );
  @override
  Widget build(BuildContext context) {
    final sample = SalesDashboardData(context).sample;
    final rows = _records
        .where(
          (r) =>
              (r['board'] == (_tab == 1)) &&
              (_status == 'All' ||
                  (_status == 'Completed') == (r['done'] == true)),
        )
        .toList();
    return Scaffold(
      backgroundColor: const Color(0xfff3f5f4),
      appBar: dashboardBar(
        widget.samples ? 'Samples' : 'Requests',
        actions: widget.samples
            ? [
                IconButton(
                  tooltip: 'New request',
                  onPressed: _newRequest,
                  icon: const _MoreIcon(CupertinoIcons.plus, size: 19),
                ),
              ]
            : null,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 28),
        children: [
          if (widget.samples) ...[
            _tabs([
              'Swatches  ${_records.where((r) => r['board'] == false && r['done'] != true).length} open',
              'Display board  ${_records.where((r) => r['board'] == true && r['done'] != true).length} open',
            ]),
            _filters(['In progress', 'Completed', 'All']),
            for (final r in rows)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _sampleCard(r),
              ),
            if (rows.isEmpty)
              const Padding(
                padding: EdgeInsets.all(30),
                child: Center(
                  child: Text(
                    'No sample requests in this view.',
                    style: TextStyle(fontSize: 13, color: _muted),
                  ),
                ),
              ),
          ] else ...[
            _tabs([
              'All  ${(sample ? 4 : 0) + _office.length}',
              'Price  ${(sample ? 1 : 0) + _office.where((r) => r['kind'] == 'Price').length}',
              'Quote  ${(sample ? 1 : 0) + _office.where((r) => r['kind'] == 'Quote').length}',
              'Contact  ${(sample ? 1 : 0) + _office.where((r) => r['kind'] == 'Contact').length}',
              'Archive  ${(sample ? 1 : 0) + _office.where((r) => r['kind'] == 'Archive').length}',
            ]),
            _filters(['Waiting', 'Done', 'All']),
            if (_status != 'Done')
              for (final r in _office.where(
                (r) =>
                    _tab == 0 ||
                    r['kind'] ==
                        ['All', 'Price', 'Quote', 'Contact', 'Archive'][_tab],
              ))
                _requestCard(
                  r['kind']?.toString() ?? 'Request',
                  r['customer']?.toString() ?? '',
                  [
                    if (r['kind'] == 'Quote' && r['items'] is List)
                      ..._quoteRequestLines(r),
                    if ('${r['note'] ?? ''}'.isNotEmpty)
                      _note('Note:', '${r['note']}'),
                    if (r['product'] != null)
                      Text('${r['product']} · ${r['sku'] ?? ''}'),
                    if (r['price'] != null)
                      Text('Requested: ${_money(r['price'] as num)}'),
                    if (r['kind'] == 'Contact' && r['after'] is Map)
                      for (final key in ['name', 'jobTitle', 'phone', 'email'])
                        if ((r['before'] as Map?)?[key] !=
                            (r['after'] as Map)[key])
                          Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(
                              '$key   ${(r['before'] as Map?)?[key] ?? '—'}  →  ${(r['after'] as Map)[key]}',
                              style: const TextStyle(fontSize: 11),
                            ),
                          ),
                    const SizedBox(height: 6),
                    const Text(
                      'Saved on this device · awaiting office connection',
                      style: TextStyle(fontSize: 10, color: _muted),
                    ),
                  ],
                ),
            if (sample && _status != 'Done') ...[
              if (_tab == 0 || _tab == 1)
                _requestCard('Price', 'Northern Floors', [
                  Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: const Color(0xFF867565),
                          borderRadius: BorderRadius.circular(7),
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Guardian D3017',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            'GUA-017',
                            style: TextStyle(fontSize: 11, color: _muted),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      for (final e in [
                        ('Current', '\$52.50'),
                        ('Requested', '\$42.00'),
                        ('Floor', '\$44.00'),
                      ])
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 10),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  e.$1,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: _muted,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  e.$2,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                    color: e.$1 == 'Requested'
                                        ? const Color(0xFFBA3044)
                                        : null,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                  _note(
                    'Reason:',
                    'Builder project 420 m², competitor at \$46 incl. underlay',
                  ),
                  const SizedBox(height: 8),
                  _stamp('Requested 17 Nov'),
                ]),
              if (_tab == 0 || _tab == 2)
                _requestCard('Quote', 'Premier Floorcraft', [
                  const Text(
                    '1 product',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Guardian D3016 132 m²',
                    style: TextStyle(fontSize: 12),
                  ),
                  _note('Note:', 'Townhouse job, needs delivery to site'),
                  const SizedBox(height: 8),
                  _stamp(
                    'Sent 17 Nov 2026 · 3:10 PM · needed by 25 Nov · stock held 7 days',
                  ),
                ]),
              if (_tab == 0 || _tab == 4)
                _requestCard('Archive', 'Westside Laminates', [
                  const Text(
                    'Archive this customer',
                    style: TextStyle(fontSize: 12),
                  ),
                  const SizedBox(height: 10),
                  _stamp('Requested 12 Nov'),
                ]),
              if (_tab == 0 || _tab == 3)
                _requestCard('Contact', 'ABC Flooring', [
                  const Text(
                    'Change Lisa Tran',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 9),
                  const Text(
                    'phone   0411 555 202  →  0412 555 202',
                    style: TextStyle(fontSize: 12),
                  ),
                  const SizedBox(height: 9),
                  _stamp('Sent 17 Nov'),
                ]),
            ] else if (_status == 'Done' ||
                _office
                    .where(
                      (r) =>
                          _tab == 0 ||
                          r['kind'] ==
                              [
                                'All',
                                'Price',
                                'Quote',
                                'Contact',
                                'Archive',
                              ][_tab],
                    )
                    .isEmpty)
              const Padding(
                padding: EdgeInsets.all(30),
                child: Center(
                  child: Text(
                    'No requests in this view.',
                    style: TextStyle(fontSize: 13, color: _muted),
                  ),
                ),
              ),
            const Text(
              'The office handles these in the main system. You get an alert when one is done.',
              style: TextStyle(fontSize: 11, color: _muted, height: 1.5),
            ),
          ],
          if (sample)
            const Padding(
              padding: EdgeInsets.only(top: 14),
              child: Text(
                'Demo records',
                style: TextStyle(fontSize: 10, color: _muted),
              ),
            ),
        ],
      ),
    );
  }

  List<Widget> _quoteRequestLines(Map<String, dynamic> request) {
    final items = (request['items'] as List).whereType<Map>().toList();
    final created = DateTime.tryParse('${request['createdAt']}');
    final needed = DateTime.tryParse('${request['neededBy']}');
    String quantity(Map item) {
      final area = (item['sqm'] as num?) ?? 0;
      if (area > 0) {
        final value = item['quantityUnit'] == 'm²'
            ? (item['quantity'] as num? ?? area)
            : area;
        return '${NumberFormat('#,##0.##').format(value)} m²';
      }
      final n = (item['units'] as num?) ?? (item['quantity'] as num?) ?? 0;
      return '${NumberFormat('#,##0.##').format(n)} ${item['quantityUnit'] ?? 'units'}';
    }

    return [
      Text(
        '${items.length} ${items.length == 1 ? 'product' : 'products'}',
        style: const TextStyle(fontSize: 11, color: detailMuted),
      ),
      const SizedBox(height: 7),
      for (final item in items)
        Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  '${item['name'] ?? item['product'] ?? ''}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(quantity(item), style: const TextStyle(fontSize: 12)),
            ],
          ),
        ),
      if (created != null || needed != null)
        _stamp(
          '${created == null ? 'Saved' : 'Saved ${DateFormat('d MMM · h:mm a').format(created.toLocal())}'}${needed == null ? '' : ' · needed by ${DateFormat('d MMM').format(needed)}'}${request['holdDays'] == null ? '' : ' · hold requested ${request['holdDays']} days'}',
        ),
    ];
  }

  Widget _stamp(String s) => Row(
    children: [
      const _MoreIcon(CupertinoIcons.info_circle, size: 12, color: _muted),
      const SizedBox(width: 5),
      Expanded(
        child: Text(
          s,
          style: const TextStyle(fontSize: 11, color: _muted, height: 1.4),
        ),
      ),
    ],
  );
  Widget _note(String label, String s) => Container(
    width: double.infinity,
    margin: const EdgeInsets.only(top: 9),
    padding: const EdgeInsets.all(9),
    decoration: BoxDecoration(
      color: const Color(0xFFF7F8F7),
      borderRadius: BorderRadius.circular(6),
    ),
    child: Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: '$label ',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
          TextSpan(text: s),
        ],
      ),
      style: const TextStyle(fontSize: 12, height: 1.5),
    ),
  );
  Widget _requestCard(String type, String customer, List<Widget> content) =>
      Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: _box(
          Padding(
            padding: const EdgeInsets.all(13),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 7,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF0F2),
                        borderRadius: BorderRadius.circular(5),
                      ),
                      child: Text(type, style: const TextStyle(fontSize: 11)),
                    ),
                    const SizedBox(width: 7),
                    Expanded(
                      child: Text(
                        customer,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    _badge('◷ Waiting for office', amber: true),
                  ],
                ),
                const SizedBox(height: 10),
                ...content,
              ],
            ),
          ),
        ),
      );
  Widget _sampleCard(Map<String, dynamic> r) => _box(
    Padding(
      padding: const EdgeInsets.all(13),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                flex: 2,
                child: Wrap(
                  spacing: 7,
                  runSpacing: 5,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Text(
                      '${r['id']}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(width: 7),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF0F2),
                        borderRadius: BorderRadius.circular(5),
                      ),
                      child: Text(
                        r['board'] == true
                            ? '${r['requestType'] ?? 'New board'}'
                            : 'Loose swatch',
                        style: const TextStyle(fontSize: 10),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 5),
              Flexible(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEAF0FD),
                    borderRadius: BorderRadius.circular(5),
                  ),
                  child: Text(
                    r['done'] == true
                        ? (r['board'] == true
                              ? '✓ Completed ${r['completedAt'] == null ? '' : DateFormat('d MMM').format(DateTime.tryParse('${r['completedAt']}') ?? DateTime.now())}'
                              : '✓ Delivered')
                        : '${r['status']}',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 10,
                      color: Color(0xFF275FB2),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          InkWell(
            onTap: () {
              final c = CustomerDirectoryData(context).rows
                  .where((c) => c.customer.businessName == r['customer'])
                  .firstOrNull;
              if (c != null) {
                dashboardOpen(
                  context,
                  CustomerDetailScreen(customer: c.customer),
                );
              }
            },
            child: Text(
              '${r['customer']} ›',
              style: const TextStyle(
                fontSize: 12,
                color: _green,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          if ('${r['series']}'.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text.rich(
              TextSpan(
                children: [
                  TextSpan(
                    text: '${r['series']} ',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  TextSpan(
                    text: '${r['category'] ?? ''}',
                    style: const TextStyle(fontSize: 11, color: _muted),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 9),
          Text(
            r['boardType'] == 'Stand'
                ? '${r['sets']} stands'
                : r['boardType'] == 'Swatches'
                ? '${r['sets']} swatch sets'
                : '${r['board'] == true ? salesBoardPanelQuantities(r).values.fold<int>(0, (n, v) => n + v) : (r['colours'] as List).length} ${r['board'] == true ? 'colour panels' : 'colours'}',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              for (final c in r['colours'] as List)
                Container(
                  padding: const EdgeInsets.all(5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F7F5),
                    borderRadius: BorderRadius.circular(7),
                    border: Border.all(color: _line),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        decoration: BoxDecoration(
                          color: '$c'.contains('White')
                              ? const Color(0xFFE0CFB1)
                              : const Color(0xFFB99469),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text('$c', style: const TextStyle(fontSize: 12)),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          _stamp('${r['delivery']} · requested ${r['date']}'),
          if ('${r['note']}'.isNotEmpty) _note('Note:', '${r['note']}'),
          if (r['done'] != true) ...[
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(0, 42),
                  foregroundColor: _green,
                  side: const BorderSide(color: _line),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(11),
                  ),
                ),
                onPressed: () => _deliverSample(r),
                icon: const _MoreIcon(
                  CupertinoIcons.check_mark_circled,
                  size: 14,
                ),
                label: const Text(
                  'Mark delivered',
                  style: TextStyle(fontSize: 13),
                ),
              ),
            ),
          ],
        ],
      ),
    ),
  );
  Future<void> _deliverSample(Map<String, dynamic> record) async {
    if (record['board'] == true) {
      final yes = await showReferenceModal<bool>(
        context,
        (dialog) => Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Mark as delivered?',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 9),
            Text(
              '${record['id']} will be completed and the boards at ${record['delivery']} updated.',
              style: const TextStyle(
                fontSize: 12,
                color: detailMuted,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: detailAction(
                    'Cancel',
                    '',
                    () => Navigator.pop(dialog, false),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: detailAction(
                    'Complete',
                    '',
                    () => Navigator.pop(dialog, true),
                    filled: true,
                  ),
                ),
              ],
            ),
          ],
        ),
      );
      if (yes != true || !mounted) return;
    }
    if (record['done'] == true) return;
    setState(() {
      record['done'] = true;
      record['completedAt'] = DateTime.now().toIso8601String();
    });
    try {
      await _saveRecord(record);
    } catch (_) {
      if (mounted) setState(() => record['done'] = false);
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not save delivery. Try again.')),
        );
    }
  }

  Future<void> _newRequest() async {
    final customer =
        widget.initialCustomer ?? await _chooseSampleCustomer(context);
    if (customer == null || !mounted) return;
    final board =
        widget.initialBoard ??
        await showModalBottomSheet<bool>(
          context: context,
          backgroundColor: Colors.white,
          showDragHandle: true,
          builder: (sheet) => SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Request sample',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    customer.businessName,
                    style: const TextStyle(fontSize: 11, color: _muted),
                  ),
                  const SizedBox(height: 14),
                  _menu(
                    CupertinoIcons.cube,
                    'Swatches',
                    'Loose swatches or offcuts for the customer',
                    () => Navigator.pop(sheet, false),
                  ),
                  _menu(
                    CupertinoIcons.cube,
                    'Display board',
                    'Colour panels, swatch sets or stands for the showroom',
                    () => Navigator.pop(sheet, true),
                  ),
                ],
              ),
            ),
          ),
        );
    if (board == null || !mounted) return;
    final record = board
        ? await _requestBoard(context, customer)
        : await Navigator.push<Map<String, dynamic>>(
            context,
            MaterialPageRoute(
              builder: (_) =>
                  _SampleRequestForm(customer: customer, board: false),
            ),
          );
    if (record == null || !mounted) return;
    setState(() {
      _records.insert(0, record);
      _tab = board ? 1 : 0;
      _status = 'In progress';
    });
  }
}

Future<Customer?> _chooseSampleCustomer(
  BuildContext context, {
  bool prices = false,
  Customer? current,
  VoidCallback? onClear,
}) {
  final rows = [...CustomerDirectoryData(context).rows]
    ..sort((a, b) {
      if (a.dueVisit != b.dueVisit) return a.dueVisit ? -1 : 1;
      return (a.distance ?? 9999).compareTo(b.distance ?? 9999);
    });
  String query = '';
  return showDetailSheet<Customer>(
    context,
    (sheet) => StatefulBuilder(
      builder: (context, update) => SizedBox(
        height: MediaQuery.sizeOf(context).height * .7,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    prices ? 'Show prices for' : 'Customer',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                if (current != null && onClear != null)
                  TextButton(
                    onPressed: () {
                      onClear();
                      Navigator.pop(sheet);
                    },
                    child: const Text('Clear'),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              onChanged: (v) => update(() => query = v.toLowerCase()),
              decoration: detailInput(hint: 'Search name or suburb').copyWith(
                prefixIcon: const Padding(
                  padding: EdgeInsets.all(12),
                  child: DetailGlyph('search', size: 16, color: detailMuted),
                ),
              ),
            ),
            const SizedBox(height: 7),
            Expanded(
              child: ListView(
                children: [
                  for (final r in rows.where(
                    (r) => '${r.customer.businessName} ${r.suburb} ${r.contact}'
                        .toLowerCase()
                        .contains(query),
                  ))
                    Container(
                      decoration: const BoxDecoration(
                        border: Border(bottom: BorderSide(color: detailLine)),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 4,
                        ),
                        dense: true,
                        leading: Container(
                          width: 29,
                          height: 29,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: r.tier == 'A'
                                ? detailPale
                                : r.tier == 'B'
                                ? const Color(0xFFE7EFFF)
                                : const Color(0xFFEFF0F2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            r.tier,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: r.tier == 'A'
                                  ? detailGreen
                                  : r.tier == 'B'
                                  ? const Color(0xFF2167CD)
                                  : detailMuted,
                            ),
                          ),
                        ),
                        title: Text(
                          r.customer.businessName,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: Text.rich(
                          TextSpan(
                            children: [
                              TextSpan(
                                text:
                                    '${r.suburb} · ${r.distance?.toStringAsFixed(1) ?? '—'} km · ',
                                style: const TextStyle(color: detailMuted),
                              ),
                              TextSpan(
                                text: r.visitDays == null
                                    ? 'not visited'
                                    : 'visited ${r.visitDays} days ago',
                                style: TextStyle(
                                  color: r.visitDays == null
                                      ? detailMuted
                                      : r.visitDays! <= 7
                                      ? const Color(0xFF1C9B55)
                                      : r.visitDays! < 15
                                      ? const Color(0xFFAA7800)
                                      : const Color(0xFFD7651C),
                                ),
                              ),
                            ],
                          ),
                          style: const TextStyle(fontSize: 10),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (r.dueVisit) _badge('Due', amber: true),
                            if (current?.id == r.customer.id) ...[
                              const SizedBox(width: 8),
                              const Icon(
                                Icons.check,
                                size: 17,
                                color: detailGreen,
                              ),
                            ],
                          ],
                        ),
                        onTap: () => Navigator.pop(sheet, r.customer),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class _SampleRequestForm extends StatefulWidget {
  const _SampleRequestForm({
    this.customer,
    required this.board,
    this.initialProducts = const [],
    this.offcut = false,
  });
  final Customer? customer;
  final List<Product> initialProducts;
  final bool offcut;
  final bool board;
  @override
  State<_SampleRequestForm> createState() => _SampleRequestFormState();
}

class _SampleRequestFormState extends State<_SampleRequestForm> {
  final _note = TextEditingController();
  List<Product> get _catalogue => inventoryCatalog(
    demo: SalesDashboardData(context).sample,
    region: context.read<SalesSession>().region,
  ).expand((s) => s.colours.map((c) => c.product)).toList();
  late final Set<String> _products = widget.initialProducts
      .map((p) => p.id)
      .toSet();
  late Customer? _customer = widget.customer;
  String? _error;
  bool _saving = false;
  DateTime _date = DateUtils.dateOnly(DateTime.now())
      .add(const Duration(days: 3));
  String _delivery = 'I will deliver';
  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  Future<void> _pickProducts() async {
    final selected = await _pickSampleColours(
      context,
      _products,
      board: widget.board,
    );
    if (selected != null && mounted) {
      setState(() {
        _products.clear();
        _products.addAll(selected);
      });
    }
  }

  Future<void> _submit() async {
    if (_saving || _products.isEmpty) return;
    if (_customer == null) {
      setState(() => _error = 'Select a customer.');
      return;
    }
    final userId = context.read<AppSession>().currentUser.id;
    final demo = SalesDashboardData(context).sample;
    final record = <String, dynamic>{
      'id':
          '${widget.board ? 'DBR' : 'SMP'}-${DateTime.now().microsecondsSinceEpoch}',
      'board': widget.board,
      'customer': _customer!.businessName,
      'customerId': _customer!.id,
      'series': '',
      'category': '',
      'colours': [
        for (final p in _catalogue.where((p) => _products.contains(p.id)))
          p.name,
      ],
      'delivery': _delivery,
      'date': DateFormat('d MMM').format(DateTime.now()),
      'neededBy': _date.toIso8601String(),
      'note': _note.text.trim(),
      'done': false,
      'status': 'Requested · need ${DateFormat('d MMM').format(_date)}',
    };
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await saveSalesSampleRecord(userId, record, demo: demo);
      if (mounted) Navigator.pop(context, record);
    } catch (_) {
      if (mounted)
        setState(
          () => _error =
              'Could not save the request. Your entries are kept. Try again.',
        );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: const Color(0xfff3f5f4),
    appBar: dashboardBar(
      widget.board
          ? 'Request display board'
          : widget.offcut
          ? 'Request offcut'
          : 'Request swatches',
    ),
    bottomNavigationBar: SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel', style: TextStyle(fontSize: 13)),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: FilledButton(
                onPressed: _saving || _products.isEmpty ? null : _submit,
                child: Text(
                  _saving ? 'Saving…' : 'Request ${_products.length}',
                  style: const TextStyle(fontSize: 13),
                ),
              ),
            ),
          ],
        ),
      ),
    ),
    body: ListView(
      padding: const EdgeInsets.all(12),
      children: [
        const Text('Customer *', style: TextStyle(fontSize: 12)),
        const SizedBox(height: 7),
        _box(
          ListTile(
            title: Text(
              _customer?.businessName ?? 'Select customer',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            subtitle: _customer == null
                ? null
                : Text(
                    '${_customer!.region.label} · ${_customer!.type}',
                    style: const TextStyle(fontSize: 11),
                  ),
            trailing: const _MoreIcon(CupertinoIcons.chevron_down, size: 14),
            onTap: () async {
              final c = await _chooseSampleCustomer(context);
              if (c != null && mounted) setState(() => _customer = c);
            },
          ),
        ),
        const SizedBox(height: 18),
        const Text('Products *', style: TextStyle(fontSize: 12)),
        const SizedBox(height: 7),
        for (final p in _catalogue.where((p) => _products.contains(p.id)))
          _box(
            ListTile(
              leading: InventorySwatch(seed: p.colour, size: 30, single: true),
              title: Text(p.name, style: const TextStyle(fontSize: 14)),
              subtitle: Text(
                p.sku,
                style: const TextStyle(fontSize: 11, color: _muted),
              ),
              trailing: IconButton(
                tooltip: 'Remove',
                icon: const Icon(Icons.close, size: 17),
                onPressed: () => setState(() => _products.remove(p.id)),
              ),
            ),
          ),
        detailAddAction(
          _products.isEmpty ? 'Pick products' : 'Add more',
          _pickProducts,
        ),
        const SizedBox(height: 18),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Needed by', style: TextStyle(fontSize: 12)),
                  const SizedBox(height: 7),
                  OutlinedButton(
                    onPressed: () async {
                      final d = await pickSalesDate(
                        context: context,
                        initialDate: _date,
                        firstDate: DateUtils.dateOnly(DateTime.now()),
                        lastDate: DateTime.now().add(const Duration(days: 730)),
                      );
                      if (d != null && mounted) setState(() => _date = d);
                    },
                    child: Text(
                      DateFormat('dd/MM/yyyy').format(_date),
                      style: const TextStyle(fontSize: 13),
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
                  const Text('Delivery', style: TextStyle(fontSize: 12)),
                  const SizedBox(height: 7),
                  DropdownButtonFormField<String>(
                    initialValue: _delivery,
                    isExpanded: true,
                    style: const TextStyle(
                      fontFamily: 'HttReference',
                      fontSize: 13,
                      color: _green,
                    ),
                    items: [
                      for (final s in [
                        'I will deliver',
                        'Courier from warehouse',
                        'Customer collects',
                      ])
                        DropdownMenuItem(value: s, child: Text(s)),
                    ],
                    onChanged: (v) => setState(() => _delivery = v!),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 18),
        const Text('Note', style: TextStyle(fontSize: 12)),
        const SizedBox(height: 7),
        TextField(
          controller: _note,
          maxLines: 1,
          decoration: const InputDecoration(
            fillColor: Colors.white,
            hintText: 'e.g. For a client kitchen',
            hintStyle: TextStyle(fontSize: 13),
          ),
        ),
        if (_error != null)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Text(
              _error!,
              style: const TextStyle(color: Colors.red, fontSize: 12),
            ),
          ),
        const SizedBox(height: 14),
        const Text(
          'Saved on this device for follow-up.',
          style: TextStyle(fontSize: 10, color: _muted),
        ),
      ],
    ),
  );
}

Future<void> requestSalesOffcut(
  BuildContext context, {
  Customer? customer,
  Product? product,
}) async {
  final record = await Navigator.push<Map<String, dynamic>>(
    context,
    MaterialPageRoute(
      builder: (_) => _SampleRequestForm(
        customer: customer,
        board: false,
        initialProducts: product == null ? const [] : [product],
        offcut: product != null,
      ),
    ),
  );
  if (record == null) return;
  if (context.mounted)
    ScaffoldMessenger.of(context)
        .showSnackBar(const SnackBar(content: Text('Sample request saved.')));
}
