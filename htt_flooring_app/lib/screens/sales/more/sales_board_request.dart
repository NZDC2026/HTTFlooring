part of 'sales_more_screen.dart';

Future<Map<String, dynamic>?> _requestBoard(
  BuildContext context,
  Customer customer, {
  String? seriesId,
  String? store,
  String type = 'Colour Panels',
  bool details = false,
}) => showReferenceModal<Map<String, dynamic>>(
  context,
  (_) => _BoardRequestSheet(
    customer: customer,
    seriesId: seriesId,
    store: store,
    type: type,
    details: details,
  ),
);

Future<Map<String, dynamic>?> requestCustomerDisplayBoard(
  BuildContext context,
  Customer customer, {
  String? seriesId,
  String? store,
  String type = 'Colour Panels',
  bool details = false,
}) async {
  final result = await _requestBoard(
    context,
    customer,
    seriesId: seriesId,
    store: store,
    type: type,
    details: details,
  );
  if (result == null) return null;
  return result;
}

class _BoardRequestSheet extends StatefulWidget {
  const _BoardRequestSheet({
    required this.customer,
    this.seriesId,
    this.store,
    this.type = 'Colour Panels',
    this.details = false,
  });
  final Customer customer;
  final String? seriesId, store;
  final String type;
  final bool details;
  @override
  State<_BoardRequestSheet> createState() => _BoardRequestSheetState();
}

class _BoardRequestSheetState extends State<_BoardRequestSheet> {
  String _store = '', _seriesId = '', _type = 'Colour Panels';
  bool _details = false;
  int _sets = 1;
  final Map<String, int> _quantities = {};
  final _note = TextEditingController();
  late List<StockSeries> _catalog;
  bool _saving = false;
  List<Map<String, dynamic>> _delivered = [];
  bool _loadedHoldings = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_loadedHoldings) return;
    _loadedHoldings = true;
    readSalesSampleRecords(
      context.read<AppSession>().currentUser.id,
      demo: _sample,
    ).then((rows) {
      if (mounted)
        setState(
          () => _delivered = rows
              .where(
                (r) =>
                    r['board'] == true &&
                    r['done'] == true &&
                    (r['customerId'] == widget.customer.id ||
                        r['customer'] == widget.customer.businessName),
              )
              .toList(),
        );
    });
  }

  @override
  void initState() {
    super.initState();
    _seriesId = widget.seriesId ?? '';
    _store = widget.store ?? '';
    _type = widget.type;
    _details = widget.details;
  }

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  bool get _sample => SalesDashboardData(context).sample;
  List<String> get _stores => _sample && widget.customer.id == 'abc'
      ? ['George St Showroom', 'Chatswood Store']
      : [
          widget.customer.address.isEmpty
              ? widget.customer.businessName
              : widget.customer.address,
        ];
  StockSeries get _series => _catalog.firstWhere((s) => s.id == _seriesId);
  int _have(int index) {
    final colour = _series.colours[index].product.colour;
    final base =
        _sample &&
            widget.customer.id == 'abc' &&
            ['George St Showroom', 'Chatswood Store'].contains(_store)
        ? customerBoardFixture(
                _seriesId,
                _store == 'Chatswood Store' ? 1 : 0,
              )?.held[colour] ??
              0
        : 0;
    return base +
        _delivered
            .where(
              (r) => r['series'] == _series.name && r['delivery'] == _store,
            )
            .fold<int>(
              0,
              (n, r) => n + (salesBoardPanelQuantities(r)[colour] ?? 0),
            );
  }

  Widget _quantity(int value, ValueChanged<int> update, {String? label}) =>
      DetailQuantity(
        key: ValueKey(label ?? 'sets'),
        value: value,
        onChanged: update,
        label: label ?? 'quantity',
      );
  Widget _select<T>(
    T value,
    List<DropdownMenuItem<T>> items,
    ValueChanged<T> change,
  ) => DropdownButtonFormField<T>(
    key: ValueKey('$value'),
    initialValue: value,
    isExpanded: true,
    decoration: detailInput(),
    style: const TextStyle(
      fontSize: 13,
      color: detailGreen,
      fontFamily: 'HttReference',
    ),
    items: items,
    onChanged: (v) => change(v as T),
  );
  Future<void> _send() async {
    if (_saving) return;
    final colors = _type == 'Colour Panels'
        ? [
            for (final c in _series.colours)
              if ((_quantities[c.product.id] ?? 0) > 0)
                '${c.product.colour} × ${_quantities[c.product.id]}',
          ]
        : ['$_type × $_sets'];
    final record = <String, dynamic>{
      'id': 'DBR-${DateTime.now().microsecondsSinceEpoch}',
      'board': true,
      'customer': widget.customer.businessName,
      'customerId': widget.customer.id,
      'series': _series.name,
      'category': _series.category,
      'boardType': _type,
      'colours': colors,
      'quantities': Map<String, int>.from(_quantities),
      'sets': _sets,
      'delivery': _store,
      'date': DateFormat('d MMM').format(DateTime.now()),
      'note': _note.text.trim(),
      'done': false,
      'status': 'Requested',
    };
    final userId = context.read<AppSession>().currentUser.id;
    setState(() => _saving = true);
    try {
      await saveSalesSampleRecord(userId, record, demo: _sample);
      if (mounted) Navigator.pop(context, record);
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not save the request. Your entries are kept.'),
          ),
        );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    _catalog = inventoryCatalog(
      demo: _sample,
      region: context.read<SalesSession>().region,
    ).where((s) => s.flooring).toList();
    if (_seriesId.isEmpty) _seriesId = _catalog.first.id;
    if (_store.isEmpty) _store = _stores.first;
    final total = _quantities.values.fold<int>(0, (sum, n) => sum + n);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (!_details) ...[
          const Text(
            'Request a new board',
            style: TextStyle(fontSize: 19, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Text(
            widget.customer.businessName,
            style: const TextStyle(fontSize: 12, color: detailMuted),
          ),
          detailLabel('Store'),
          _select(_store, [
            for (final store in _stores)
              DropdownMenuItem(value: store, child: Text(store)),
          ], (v) => setState(() => _store = v)),
          detailLabel('Series'),
          _select(_seriesId, [
            for (final s in _catalog)
              DropdownMenuItem(
                value: s.id,
                child: Text(
                  '${s.name} · ${s.category} · ${s.style}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
          ], (v) => setState(() => _seriesId = v)),
          detailLabel('Board type'),
          Wrap(
            spacing: 6,
            children: [
              for (final type in ['Colour Panels', 'Swatches', 'Stand'])
                ChoiceChip(
                  showCheckmark: false,
                  label: Text(
                    type,
                    style: TextStyle(
                      fontSize: 11,
                      color: _type == type ? Colors.white : detailGreen,
                    ),
                  ),
                  selected: _type == type,
                  selectedColor: detailGreen,
                  onSelected: (_) => setState(() => _type = type),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: detailAction(
                  'Cancel',
                  'check',
                  () => Navigator.pop(context),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: detailAction(
                  'Continue',
                  'chevron',
                  () => setState(() => _details = true),
                  filled: true,
                ),
              ),
            ],
          ),
        ] else ...[
          Align(
            alignment: Alignment.centerLeft,
            child: detailBadge(_type.toUpperCase()),
          ),
          const SizedBox(height: 8),
          Text(
            _type == 'Stand' ? 'Request a stand' : _series.name,
            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 6),
          Text(
            '$_store · ${_type == 'Colour Panels'
                ? 'has ${List.generate(_series.colours.length, (i) => i).where((i) => _have(i) > 0).length} of ${_series.colours.length} colours'
                : _type == 'Stand'
                ? 'HTT chooses the colours on the stand'
                : '${_sample && widget.customer.id == 'abc'
                      ? _store == 'George St Showroom' && _seriesId == 'bonita'
                            ? 2
                            : _store == 'Chatswood Store' && _seriesId == 'guardian'
                            ? 1
                            : 0
                      : 0} sets received so far'}',
            style: const TextStyle(fontSize: 12, color: detailMuted),
          ),
          const SizedBox(height: 13),
          if (_type == 'Colour Panels') ...[
            const Text(
              'How many panels of each colour?',
              style: TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 7),
            Wrap(
              spacing: 5,
              children: [
                TextButton(
                  onPressed: () => setState(() {
                    for (var i = 0; i < _series.colours.length; i++) {
                      _quantities[_series.colours[i].product.id] = _have(i) == 0
                          ? 1
                          : 0;
                    }
                  }),
                  child: const Text(
                    '1 of each new to this store',
                    style: TextStyle(fontSize: 10),
                  ),
                ),
                TextButton(
                  onPressed: () => setState(() {
                    for (final c in _series.colours) {
                      _quantities[c.product.id] = 1;
                    }
                  }),
                  child: const Text(
                    '1 of each',
                    style: TextStyle(fontSize: 10),
                  ),
                ),
                TextButton(
                  onPressed: () => setState(() => _quantities.clear()),
                  child: const Text('Clear', style: TextStyle(fontSize: 10)),
                ),
              ],
            ),
            detailCard(
              Column(
                children: [
                  for (var i = 0; i < _series.colours.length; i++)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        border: i == 0
                            ? null
                            : const Border(top: BorderSide(color: detailLine)),
                      ),
                      child: Row(
                        children: [
                          InventorySwatch(
                            seed: _series.colours[i].product.colour,
                            size: 18,
                            single: true,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _series.colours[i].product.colour,
                              style: const TextStyle(fontSize: 12),
                            ),
                          ),
                          if (_have(i) > 0)
                            Text(
                              'have ${_have(i)}',
                              style: const TextStyle(
                                fontSize: 10,
                                color: detailGreen,
                              ),
                            ),
                          _quantity(
                            _quantities[_series.colours[i].product.id] ?? 0,
                            (n) => setState(
                              () => _quantities[_series.colours[i].product.id] =
                                  n,
                            ),
                            label: _series.colours[i].product.colour,
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Text(
              '$total panels · ${_quantities.values.where((n) => n > 0).length} colours',
              style: const TextStyle(fontSize: 12, color: detailMuted),
            ),
          ] else ...[
            if (_type == 'Stand') ...[
              detailLabel('Series'),
              _select(_seriesId, [
                for (final s in _catalog)
                  DropdownMenuItem(value: s.id, child: Text(s.name)),
              ], (v) => setState(() => _seriesId = v)),
            ] else
              const Text(
                'Each set is one full string of the whole series.',
                style: TextStyle(fontSize: 12, color: detailMuted),
              ),
            detailLabel(
              _type == 'Stand' ? 'Number of stands' : 'Number of sets',
            ),
            Align(
              alignment: Alignment.centerLeft,
              child: _quantity(_sets, (n) => setState(() => _sets = n)),
            ),
          ],
          detailLabel('Note for the warehouse (optional)'),
          TextField(
            controller: _note,
            minLines: 2,
            maxLines: 4,
            decoration: detailInput(),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: detailAction(
                  'Back',
                  'chevron',
                  () => Navigator.pop(context),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: detailAction(
                  _saving ? 'Saving…' : 'Send request',
                  'doc',
                  _saving
                      ? null
                      : _type == 'Colour Panels'
                      ? total == 0
                            ? null
                            : _send
                      : _sets == 0
                      ? null
                      : _send,
                  filled: true,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}
